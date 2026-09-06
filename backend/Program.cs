using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<KkcsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT key belum dikonfigurasi.");
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "Pengurus"));
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("FlutterDevelopment", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("FlutterDevelopment");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/auth/register", async (RegisterRequest request, KkcsDbContext db, JwtTokenService tokenService) =>
{
    if (string.IsNullOrWhiteSpace(request.NamaLengkap) || string.IsNullOrWhiteSpace(request.NomorIndukKaryawan))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pengguna"] = ["Nama lengkap dan NIK wajib diisi."]
        });
    }

    if (request.Password.Length < 8)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["password"] = ["Password minimal 8 karakter."]
        });
    }

    var nik = request.NomorIndukKaryawan.Trim();
    if (nik.Length < 5)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["nomorIndukKaryawan"] = ["NIK minimal 5 karakter."]
        });
    }

    if (await db.Pengguna.AnyAsync(pengguna => pengguna.NomorIndukKaryawan == nik))
    {
        return Results.Conflict(new { message = "NIK sudah terdaftar." });
    }

    var pengguna = new Pengguna
    {
        NamaLengkap = request.NamaLengkap.Trim(),
        NomorIndukKaryawan = nik,
        Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
    };
    db.Pengguna.Add(pengguna);
    await db.SaveChangesAsync();

    return Results.Created($"/api/auth/me", new AuthResponse(
        tokenService.CreateToken(pengguna),
        ToUserResponse(pengguna)));
});

app.MapPost("/api/auth/login", async (LoginRequest request, KkcsDbContext db, JwtTokenService tokenService) =>
{
    var nik = request.NomorIndukKaryawan.Trim();
    var pengguna = await db.Pengguna.FirstOrDefaultAsync(item => item.NomorIndukKaryawan == nik && item.Aktif);
    if (pengguna is null || !BCrypt.Net.BCrypt.Verify(request.Password, pengguna.PasswordHash))
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new AuthResponse(
        tokenService.CreateToken(pengguna),
        ToUserResponse(pengguna)));
});

app.MapGet("/api/auth/me", async (ClaimsPrincipal principal, KkcsDbContext db) =>
{
    var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? principal.FindFirstValue(ClaimTypes.Name)
        ?? principal.FindFirstValue("sub");
    if (!int.TryParse(subject, out var penggunaId))
    {
        return Results.Unauthorized();
    }

    var pengguna = await db.Pengguna.AsNoTracking().FirstOrDefaultAsync(item => item.Id == penggunaId);
    return pengguna is null
        ? Results.NotFound()
        : Results.Ok(ToUserResponse(pengguna));
}).RequireAuthorization();

app.MapGet("/api/admin/pengguna", async (KkcsDbContext db) =>
    Results.Ok(await db.Pengguna.AsNoTracking()
        .OrderBy(pengguna => pengguna.NamaLengkap)
        .Select(pengguna => new AdminUserResponse(
            pengguna.Id,
            pengguna.NamaLengkap,
            pengguna.NomorIndukKaryawan,
            pengguna.Email,
            pengguna.Peran,
            pengguna.Aktif,
            pengguna.DibuatPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPatch("/api/admin/pengguna/{id:int}/status", async (int id, ToggleUserStatusRequest request, KkcsDbContext db) =>
{
    var pengguna = await db.Pengguna.FirstOrDefaultAsync(item => item.Id == id);
    if (pengguna is null) return Results.NotFound();
    pengguna.Aktif = request.Aktif;
    await db.SaveChangesAsync();
    return Results.Ok(new AdminUserResponse(
        pengguna.Id,
        pengguna.NamaLengkap,
        pengguna.NomorIndukKaryawan,
        pengguna.Email,
        pengguna.Peran,
        pengguna.Aktif,
        pengguna.DibuatPada));
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/auth/profile", async (ClaimsPrincipal principal, ProfileRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindCurrentUser(principal, db);
    if (pengguna is null)
    {
        return Results.Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(request.NamaLengkap))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["namaLengkap"] = ["Nama lengkap wajib diisi."]
        });
    }

    pengguna.NamaLengkap = request.NamaLengkap.Trim();
    pengguna.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
    pengguna.NomorTelepon = string.IsNullOrWhiteSpace(request.NomorTelepon) ? null : request.NomorTelepon.Trim();
    pengguna.Alamat = string.IsNullOrWhiteSpace(request.Alamat) ? null : request.Alamat.Trim();
    await db.SaveChangesAsync();
    return Results.Ok(ToUserResponse(pengguna));
}).RequireAuthorization();

app.MapPost("/api/auth/profile/photo", async (ClaimsPrincipal principal, IFormFile file, KkcsDbContext db, IWebHostEnvironment environment) =>
{
    var pengguna = await FindCurrentUser(principal, db);
    if (pengguna is null)
    {
        return Results.Unauthorized();
    }

    if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
    {
        return Results.BadRequest(new { message = "Ukuran foto wajib lebih dari 0 dan maksimal 5 MB." });
    }

    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedExtensions.Contains(extension) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { message = $"Format foto harus JPG, PNG, atau WEBP. File: {extension}, Content-Type: {file.ContentType}" });
    }

    var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    var uploadDirectory = Path.Combine(webRoot, "uploads", "profile");
    Directory.CreateDirectory(uploadDirectory);
    var fileName = $"{Guid.NewGuid():N}{extension}";
    var filePath = Path.Combine(uploadDirectory, fileName);
    await using (var stream = File.Create(filePath))
    {
        await file.CopyToAsync(stream);
    }

    if (!string.IsNullOrWhiteSpace(pengguna.FotoUrl))
    {
        var previousPath = Path.Combine(webRoot, pengguna.FotoUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(previousPath)) File.Delete(previousPath);
    }

    pengguna.FotoUrl = $"/uploads/profile/{fileName}";
    await db.SaveChangesAsync();
    return Results.Ok(ToUserResponse(pengguna));
}).RequireAuthorization().DisableAntiforgery();

app.MapGet("/api/produk", async (KkcsDbContext db) =>
    Results.Ok(await db.Produk.AsNoTracking().Where(produk => produk.Aktif).OrderByDescending(produk => produk.DiperbaruiPada).ThenBy(produk => produk.Nama).ToListAsync()))
    .RequireAuthorization();

app.MapGet("/api/simpanan/jenis", async (KkcsDbContext db) =>
    Results.Ok(await db.JenisSimpanan.AsNoTracking().Where(jenis => jenis.Aktif).OrderBy(jenis => jenis.Id).ToListAsync()))
    .RequireAuthorization();

app.MapGet("/api/simpanan/saya", async (ClaimsPrincipal principal, KkcsDbContext db) =>
{
    var pengguna = await FindCurrentUser(principal, db);
    return pengguna is null
        ? Results.Unauthorized()
        : Results.Ok(await db.Simpanan.AsNoTracking().Include(simpanan => simpanan.JenisSimpanan)
            .Where(simpanan => simpanan.PenggunaId == pengguna.Id && simpanan.Aktif)
            .OrderBy(simpanan => simpanan.JenisSimpananId).ToListAsync());
}).RequireAuthorization();

app.MapPost("/api/pinjaman", async (ClaimsPrincipal principal, PengajuanPinjamanRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindCurrentUser(principal, db);
    if (pengguna is null) return Results.Unauthorized();
    if (request.Nominal <= 0 || request.TenorBulan <= 0 || string.IsNullOrWhiteSpace(request.Tujuan))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pinjaman"] = ["Nominal, tenor, dan tujuan pinjaman wajib diisi dengan benar."]
        });
    }

    const decimal bungaBulanan = 0.01m;
    var pengajuan = new PengajuanPinjaman
    {
        PenggunaId = pengguna.Id,
        NomorPengajuan = $"PLJ-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
        Nominal = request.Nominal,
        TenorBulan = request.TenorBulan,
        BungaBulanan = bungaBulanan,
        EstimasiCicilanBulanan = Math.Round((request.Nominal / request.TenorBulan) + (request.Nominal * bungaBulanan), 2),
        Tujuan = request.Tujuan.Trim(),
        Status = "Diajukan"
    };
    db.PengajuanPinjaman.Add(pengajuan);
    await db.SaveChangesAsync();
    return Results.Created($"/api/pinjaman/{pengajuan.Id}", pengajuan);
}).RequireAuthorization();

app.MapGet("/api/erat/agenda", async (KkcsDbContext db) =>
    Results.Ok(await db.EratAgenda.AsNoTracking().Include(agenda => agenda.Opsi)
        .Where(agenda => agenda.Status == "Aktif").OrderByDescending(agenda => agenda.MulaiPada).ToListAsync()))
    .RequireAuthorization();

app.MapPost("/api/erat/agenda/{agendaId:int}/suara", async (int agendaId, ClaimsPrincipal principal, EratVoteRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindCurrentUser(principal, db);
    if (pengguna is null) return Results.Unauthorized();
    var agenda = await db.EratAgenda.AsNoTracking().FirstOrDefaultAsync(item => item.Id == agendaId && item.Status == "Aktif");
    if (agenda is null) return Results.NotFound(new { message = "Agenda E-RAT tidak aktif atau tidak ditemukan." });
    var opsi = await db.EratOpsi.AsNoTracking().FirstOrDefaultAsync(item => item.Id == request.OpsiId && item.EratAgendaId == agendaId);
    if (opsi is null) return Results.BadRequest(new { message = "Pilihan voting tidak valid." });
    if (await db.EratSuara.AnyAsync(suara => suara.EratAgendaId == agendaId && suara.PenggunaId == pengguna.Id))
    {
        return Results.Conflict(new { message = "Anda sudah memberikan suara pada agenda ini." });
    }

    db.EratSuara.Add(new EratSuara { EratAgendaId = agendaId, EratOpsiId = opsi.Id, PenggunaId = pengguna.Id });
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Suara berhasil dicatat." });
}).RequireAuthorization();

app.MapGet("/api/erat/laporan-tahunan", async (KkcsDbContext db) =>
    Results.Ok(await db.LaporanTahunan.AsNoTracking().Where(laporan => laporan.Aktif)
        .OrderByDescending(laporan => laporan.Tahun).ToListAsync()))
    .RequireAuthorization();

app.MapGet("/api/anggota", async (KkcsDbContext db) =>
    Results.Ok(await db.Anggota.AsNoTracking().OrderBy(anggota => anggota.NamaLengkap).ToListAsync()))
    .RequireAuthorization();

app.MapGet("/api/anggota/{id:int}", async (int id, KkcsDbContext db) =>
{
    var anggota = await db.Anggota.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id);
    return anggota is null ? Results.NotFound() : Results.Ok(anggota);
}).RequireAuthorization();

app.MapPost("/api/anggota", async (AnggotaRequest request, KkcsDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.NomorAnggota) || string.IsNullOrWhiteSpace(request.NamaLengkap))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["anggota"] = ["Nomor anggota dan nama lengkap wajib diisi."]
        });
    }

    var nomorAnggota = request.NomorAnggota.Trim();
    if (await db.Anggota.AnyAsync(anggota => anggota.NomorAnggota == nomorAnggota))
    {
        return Results.Conflict(new { message = "Nomor anggota sudah digunakan." });
    }

    var anggotaBaru = new Anggota
    {
        NomorAnggota = nomorAnggota,
        NamaLengkap = request.NamaLengkap.Trim(),
        NomorIdentitas = request.NomorIdentitas?.Trim(),
        Email = request.Email?.Trim(),
        NomorTelepon = request.NomorTelepon?.Trim(),
        Alamat = request.Alamat?.Trim(),
        TanggalBergabung = request.TanggalBergabung ?? DateTime.UtcNow,
        Aktif = request.Aktif ?? true
    };

    db.Anggota.Add(anggotaBaru);
    await db.SaveChangesAsync();
    return Results.Created($"/api/anggota/{anggotaBaru.Id}", anggotaBaru);
}).RequireAuthorization();

app.MapPut("/api/anggota/{id:int}", async (int id, AnggotaRequest request, KkcsDbContext db) =>
{
    var anggota = await db.Anggota.FirstOrDefaultAsync(item => item.Id == id);
    if (anggota is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.NomorAnggota) || string.IsNullOrWhiteSpace(request.NamaLengkap))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["anggota"] = ["Nomor anggota dan nama lengkap wajib diisi."]
        });
    }

    var nomorAnggota = request.NomorAnggota.Trim();
    if (await db.Anggota.AnyAsync(item => item.Id != id && item.NomorAnggota == nomorAnggota))
    {
        return Results.Conflict(new { message = "Nomor anggota sudah digunakan." });
    }

    anggota.NomorAnggota = nomorAnggota;
    anggota.NamaLengkap = request.NamaLengkap.Trim();
    anggota.NomorIdentitas = request.NomorIdentitas?.Trim();
    anggota.Email = request.Email?.Trim();
    anggota.NomorTelepon = request.NomorTelepon?.Trim();
    anggota.Alamat = request.Alamat?.Trim();
    anggota.TanggalBergabung = request.TanggalBergabung ?? anggota.TanggalBergabung;
    anggota.Aktif = request.Aktif ?? anggota.Aktif;
    await db.SaveChangesAsync();
    return Results.Ok(anggota);
}).RequireAuthorization();

app.MapDelete("/api/anggota/{id:int}", async (int id, KkcsDbContext db) =>
{
    var anggota = await db.Anggota.FindAsync(id);
    if (anggota is null)
    {
        return Results.NotFound();
    }

    db.Anggota.Remove(anggota);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

static async Task<Pengguna?> FindCurrentUser(ClaimsPrincipal principal, KkcsDbContext db)
{
    var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? principal.FindFirstValue(ClaimTypes.Name)
        ?? principal.FindFirstValue("sub");
    return int.TryParse(subject, out var penggunaId)
        ? await db.Pengguna.FirstOrDefaultAsync(item => item.Id == penggunaId && item.Aktif)
        : null;
}

static UserResponse ToUserResponse(Pengguna pengguna) => new(
    pengguna.Id,
    pengguna.NamaLengkap,
    pengguna.NomorIndukKaryawan,
    pengguna.Peran,
    pengguna.Email,
    pengguna.NomorTelepon,
    pengguna.Alamat,
    pengguna.FotoUrl);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record AnggotaRequest(
    string NomorAnggota,
    string NamaLengkap,
    string? NomorIdentitas,
    string? Email,
    string? NomorTelepon,
    string? Alamat,
    DateTime? TanggalBergabung,
    bool? Aktif);

record RegisterRequest(string NamaLengkap, string NomorIndukKaryawan, string? Email, string Password);

record LoginRequest(string NomorIndukKaryawan, string Password);

record UserResponse(
    int Id,
    string NamaLengkap,
    string NomorIndukKaryawan,
    string Peran,
    string? Email,
    string? NomorTelepon,
    string? Alamat,
    string? FotoUrl);

record AuthResponse(string Token, UserResponse User);

record ProfileRequest(string NamaLengkap, string? Email, string? NomorTelepon, string? Alamat);

record PengajuanPinjamanRequest(decimal Nominal, int TenorBulan, string Tujuan);

record EratVoteRequest(int OpsiId);

record ToggleUserStatusRequest(bool Aktif);

record AdminUserResponse(
    int Id,
    string NamaLengkap,
    string NomorIndukKaryawan,
    string? Email,
    string Peran,
    bool Aktif,
    DateTime DibuatPada);
