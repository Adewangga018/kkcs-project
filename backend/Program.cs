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
builder.Services.AddScoped<SimpananService>();
builder.Services.AddHostedService<SimpananBackgroundService>();
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
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        StatusKeanggotaan = "MenungguPersetujuan"
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
            pengguna.StatusKeanggotaan,
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
        pengguna.StatusKeanggotaan,
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
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();

    var konfigurasi = await db.KonfigurasiKoperasi.AsNoTracking().FirstAsync();
    var rekening = await db.Simpanan.AsNoTracking().Include(item => item.JenisSimpanan).Include(item => item.Mutasi)
        .Where(item => item.PenggunaId == pengguna.Id)
        .ToListAsync();
    Simpanan? RekeningJenis(string kode) => rekening.FirstOrDefault(item => item.JenisSimpanan.Kode == kode);

    var tagihan = await db.TagihanWajib.AsNoTracking()
        .Where(item => item.PenggunaId == pengguna.Id)
        .OrderByDescending(item => item.Periode)
        .Select(item => new TagihanWajibResponse(item.Id, item.Periode, item.Nominal, item.JatuhTempo, item.Status, item.CatatanReview, item.DiprosesPada))
        .ToListAsync();

    var sukarela = await db.TransaksiSukarela.AsNoTracking()
        .Where(item => item.PenggunaId == pengguna.Id)
        .OrderByDescending(item => item.DiajukanPada)
        .Select(item => new TransaksiSukarelaResponse(item.Id, item.Jenis, item.Nominal, item.Catatan, item.Status, item.CatatanReview, item.DiajukanPada, item.DiprosesPada))
        .ToListAsync();

    var produkBerjangka = await db.ProdukBerjangka.AsNoTracking()
        .Where(item => item.Aktif)
        .OrderBy(item => item.Nominal)
        .Select(item => new ProdukBerjangkaResponse(item.Id, item.Nama, item.Nominal, item.TenorBulan, item.Aktif))
        .ToListAsync();

    var berjangkaSaya = await db.SimpananBerjangka.AsNoTracking().Include(item => item.Produk)
        .Where(item => item.PenggunaId == pengguna.Id)
        .OrderByDescending(item => item.DiajukanPada)
        .ToListAsync();

    decimal Saldo(string kode) => RekeningJenis(kode)?.Saldo ?? 0;
    string? NoRek(string kode) => RekeningJenis(kode)?.NomorRekening;

    var mutasi = rekening
        .SelectMany(item => item.Mutasi.Select(m => new MutasiResponse(item.JenisSimpanan.Nama, m.Jenis, m.Nominal, m.SaldoSetelah, m.Keterangan, m.TanggalTransaksi)))
        .OrderByDescending(item => item.Tanggal)
        .Take(20)
        .ToList();

    return Results.Ok(new SimpananSayaResponse(
        pengguna.StatusKeanggotaan,
        new SimpananRekeningResponse(Saldo("POKOK"), NoRek("POKOK")),
        new SimpananWajibResponse(Saldo("WAJIB"), NoRek("WAJIB"), konfigurasi.SimpananWajibNominal, konfigurasi.TanggalTagihWajib, tagihan),
        new SimpananSukarelaResponse(Saldo("SUKARELA"), NoRek("SUKARELA"), sukarela),
        new SimpananBerjangkaBagianResponse(produkBerjangka, berjangkaSaya.Select(ToBerjangkaResponse).ToList()),
        mutasi));
}).RequireAuthorization();

app.MapPost("/api/simpanan/sukarela", async (ClaimsPrincipal principal, TransaksiSukarelaRequest request, KkcsDbContext db, SimpananService simpananService) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();

    var jenis = request.Jenis?.Trim();
    if (jenis != "Setor" && jenis != "Tarik")
    {
        return Results.BadRequest(new { message = "Jenis transaksi harus 'Setor' atau 'Tarik'." });
    }
    if (request.Nominal <= 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["nominal"] = ["Nominal wajib lebih dari 0."] });
    }
    if (await db.TransaksiSukarela.AnyAsync(item => item.PenggunaId == pengguna.Id && item.Status == "Diajukan"))
    {
        return Results.Conflict(new { message = "Masih ada pengajuan simpanan sukarela yang menunggu persetujuan." });
    }
    if (jenis == "Tarik")
    {
        var saldo = await simpananService.SaldoAsync(pengguna.Id, "SUKARELA");
        if (request.Nominal > saldo)
        {
            return Results.BadRequest(new { message = $"Saldo sukarela tidak cukup. Saldo saat ini {saldo:N0}." });
        }
    }

    db.TransaksiSukarela.Add(new TransaksiSukarela
    {
        PenggunaId = pengguna.Id,
        Jenis = jenis,
        Nominal = request.Nominal,
        Catatan = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim()
    });
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Pengajuan simpanan sukarela terkirim. Menunggu persetujuan pengurus." });
}).RequireAuthorization();

app.MapPost("/api/simpanan/berjangka", async (ClaimsPrincipal principal, AjukanBerjangkaRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();

    var produk = await db.ProdukBerjangka.FirstOrDefaultAsync(item => item.Id == request.ProdukBerjangkaId && item.Aktif);
    if (produk is null) return Results.BadRequest(new { message = "Produk simpanan berjangka tidak tersedia." });

    db.SimpananBerjangka.Add(new SimpananBerjangka
    {
        PenggunaId = pengguna.Id,
        ProdukBerjangkaId = produk.Id,
        NomorSertifikat = $"BJK-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
        Nominal = produk.Nominal,
        TenorBulan = produk.TenorBulan,
        Status = "Diajukan"
    });
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Pengajuan simpanan berjangka terkirim. Menunggu persetujuan pengurus." });
}).RequireAuthorization();

app.MapGet("/api/pinjaman/tarif", () => Results.Ok(PinjamanKalkulator.TenorValid
    .Select(tenor =>
    {
        var ringkasan = PinjamanKalkulator.Hitung(1_000_000m, tenor);
        return new TarifPinjamanResponse(tenor, ringkasan.BungaTahunan);
    })))
    .RequireAuthorization();

app.MapPost("/api/pinjaman/simulasi", (PengajuanPinjamanRequest request) =>
{
    if (request.Nominal <= 0 || !PinjamanKalkulator.TenorValid.Contains(request.TenorBulan))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pinjaman"] = ["Nominal wajib lebih dari 0 dan tenor harus 12, 24, 36, 48, atau 60 bulan."]
        });
    }

    var ringkasan = PinjamanKalkulator.Hitung(request.Nominal, request.TenorBulan);
    return Results.Ok(new SimulasiPinjamanResponse(
        request.Nominal,
        request.TenorBulan,
        ringkasan.BungaTahunan,
        ringkasan.PokokPerBulan,
        ringkasan.JasaPerBulan,
        ringkasan.AngsuranPerBulan,
        ringkasan.TotalJasa,
        request.Nominal + ringkasan.TotalJasa));
}).RequireAuthorization();

app.MapPost("/api/pinjaman", async (ClaimsPrincipal principal, PengajuanPinjamanRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();
    if (request.Nominal <= 0 || string.IsNullOrWhiteSpace(request.Tujuan) || !PinjamanKalkulator.TenorValid.Contains(request.TenorBulan))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pinjaman"] = ["Nominal dan tujuan wajib diisi, dan tenor harus 12, 24, 36, 48, atau 60 bulan."]
        });
    }

    var ringkasan = PinjamanKalkulator.Hitung(request.Nominal, request.TenorBulan);
    var pengajuan = new PengajuanPinjaman
    {
        PenggunaId = pengguna.Id,
        NomorPengajuan = $"PLJ-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
        Nominal = request.Nominal,
        TenorBulan = request.TenorBulan,
        BungaTahunan = ringkasan.BungaTahunan,
        EstimasiCicilanBulanan = ringkasan.AngsuranPerBulan,
        EstimasiTotalJasa = ringkasan.TotalJasa,
        Tujuan = request.Tujuan.Trim(),
        Status = "Diajukan"
    };
    db.PengajuanPinjaman.Add(pengajuan);
    await db.SaveChangesAsync();
    return Results.Created($"/api/pinjaman/{pengajuan.Id}", ToPengajuanResponse(pengajuan));
}).RequireAuthorization();

app.MapGet("/api/pinjaman/saya", async (ClaimsPrincipal principal, KkcsDbContext db) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();

    var pengajuan = await db.PengajuanPinjaman.AsNoTracking()
        .Where(item => item.PenggunaId == pengguna.Id)
        .OrderByDescending(item => item.DibuatPada)
        .ToListAsync();

    var pinjaman = await db.Pinjaman.AsNoTracking()
        .Include(item => item.Angsuran)
        .Where(item => item.PenggunaId == pengguna.Id)
        .OrderByDescending(item => item.DibuatPada)
        .ToListAsync();

    var pembayaranTertunda = await db.PembayaranPinjaman.AsNoTracking()
        .Where(item => item.PenggunaId == pengguna.Id && item.Status == "Diajukan")
        .ToListAsync();
    var tertundaLookup = pembayaranTertunda.ToDictionary(item => item.PinjamanId);

    return Results.Ok(new PinjamanSayaResponse(
        pengajuan.Select(ToPengajuanResponse).ToList(),
        pinjaman.Select(item => ToPinjamanResponse(item, tertundaLookup.GetValueOrDefault(item.Id))).ToList()));
}).RequireAuthorization();

app.MapPost("/api/pinjaman/{id:int}/pembayaran", async (int id, AjukanPembayaranRequest request, ClaimsPrincipal principal, KkcsDbContext db) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();

    var pinjaman = await db.Pinjaman.Include(item => item.Angsuran)
        .FirstOrDefaultAsync(item => item.Id == id && item.PenggunaId == pengguna.Id);
    if (pinjaman is null) return Results.NotFound();
    if (pinjaman.Status != "Aktif") return Results.BadRequest(new { message = "Pinjaman ini sudah lunas." });

    var jenis = request.Jenis?.Trim();
    if (jenis != "Angsuran" && jenis != "Pelunasan")
    {
        return Results.BadRequest(new { message = "Jenis pembayaran harus 'Angsuran' atau 'Pelunasan'." });
    }

    if (await db.PembayaranPinjaman.AnyAsync(item => item.PinjamanId == id && item.Status == "Diajukan"))
    {
        return Results.Conflict(new { message = "Masih ada pengajuan pembayaran yang menunggu persetujuan pengurus." });
    }

    var sisaReguler = pinjaman.Angsuran
        .Where(item => item.Status == "Belum" && item.Jenis == "Reguler")
        .OrderBy(item => item.AngsuranKe)
        .ToList();

    PembayaranPinjaman pembayaran;
    if (jenis == "Angsuran")
    {
        var berikutnya = sisaReguler.FirstOrDefault();
        if (berikutnya is null) return Results.BadRequest(new { message = "Semua angsuran sudah terbayar." });
        pembayaran = new PembayaranPinjaman
        {
            PinjamanId = id,
            PenggunaId = pengguna.Id,
            Jenis = "Angsuran",
            JumlahDiajukan = berikutnya.Total,
            AngsuranKe = berikutnya.AngsuranKe,
            Catatan = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim()
        };
    }
    else
    {
        pembayaran = new PembayaranPinjaman
        {
            PinjamanId = id,
            PenggunaId = pengguna.Id,
            Jenis = "Pelunasan",
            JumlahDiajukan = pinjaman.SisaPokok,
            JasaDibebaskan = sisaReguler.Sum(item => item.Jasa),
            Catatan = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim()
        };
    }

    db.PembayaranPinjaman.Add(pembayaran);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Pengajuan pembayaran terkirim. Menunggu persetujuan pengurus." });
}).RequireAuthorization();

app.MapGet("/api/admin/pinjaman/pengajuan", async (KkcsDbContext db) =>
    Results.Ok(await db.PengajuanPinjaman.AsNoTracking().Include(item => item.Pengguna)
        .OrderByDescending(item => item.Status == "Diajukan").ThenByDescending(item => item.DibuatPada)
        .Select(item => new AdminPengajuanResponse(
            item.Id, item.NomorPengajuan, item.Pengguna.NamaLengkap, item.Pengguna.NomorIndukKaryawan,
            item.Nominal, item.TenorBulan, item.BungaTahunan, item.EstimasiCicilanBulanan, item.EstimasiTotalJasa,
            item.Tujuan, item.Status, item.CatatanReview, item.DibuatPada, item.DiputuskanPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/pinjaman/pengajuan/{id:int}/putusan", async (int id, PutusanPengajuanRequest request, KkcsDbContext db) =>
{
    var pengajuan = await db.PengajuanPinjaman.Include(item => item.Pinjaman).FirstOrDefaultAsync(item => item.Id == id);
    if (pengajuan is null) return Results.NotFound();
    if (pengajuan.Status != "Diajukan") return Results.BadRequest(new { message = "Pengajuan ini sudah diputuskan." });

    pengajuan.CatatanReview = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim();
    pengajuan.DiputuskanPada = DateTime.UtcNow;

    if (!request.Setuju)
    {
        pengajuan.Status = "Ditolak";
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Pengajuan ditolak." });
    }

    pengajuan.Status = "Disetujui";
    var ringkasan = PinjamanKalkulator.Hitung(pengajuan.Nominal, pengajuan.TenorBulan);
    var pinjaman = new Pinjaman
    {
        PenggunaId = pengajuan.PenggunaId,
        PengajuanPinjamanId = pengajuan.Id,
        NomorPinjaman = $"PJM-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
        Pokok = pengajuan.Nominal,
        TenorBulan = pengajuan.TenorBulan,
        BungaTahunan = ringkasan.BungaTahunan,
        PokokPerBulan = ringkasan.PokokPerBulan,
        JasaPerBulan = ringkasan.JasaPerBulan,
        AngsuranPerBulan = ringkasan.AngsuranPerBulan,
        SisaPokok = pengajuan.Nominal,
        AngsuranTerbayar = 0,
        TanggalMulai = (request.TanggalMulai ?? DateTime.UtcNow).Date,
        Status = "Aktif"
    };
    pinjaman.Angsuran = PinjamanKalkulator.BuatJadwal(pinjaman);
    db.Pinjaman.Add(pinjaman);
    await db.SaveChangesAsync();
    return Results.Ok(ToPinjamanResponse(pinjaman));
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/admin/pinjaman", async (KkcsDbContext db) =>
{
    var pinjaman = await db.Pinjaman.AsNoTracking().Include(item => item.Pengguna).Include(item => item.Angsuran)
        .OrderByDescending(item => item.Status == "Aktif").ThenByDescending(item => item.DibuatPada)
        .ToListAsync();
    return Results.Ok(pinjaman.Select(item => ToAdminPinjamanResponse(item)).ToList());
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/admin/pinjaman/pembayaran", async (KkcsDbContext db) =>
    Results.Ok(await db.PembayaranPinjaman.AsNoTracking()
        .Include(item => item.Pengguna)
        .Include(item => item.Pinjaman)
        .OrderByDescending(item => item.Status == "Diajukan").ThenByDescending(item => item.DiajukanPada)
        .Select(item => new AdminPembayaranResponse(
            item.Id, item.PinjamanId, item.Pinjaman.NomorPinjaman,
            item.Pengguna.NamaLengkap, item.Pengguna.NomorIndukKaryawan,
            item.Jenis, item.JumlahDiajukan, item.JasaDibebaskan, item.AngsuranKe,
            item.Catatan, item.Status, item.CatatanReview, item.DiajukanPada, item.DiputuskanPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/pinjaman/pembayaran/{id:int}/putusan", async (int id, PutusanPembayaranRequest request, KkcsDbContext db) =>
{
    var pembayaran = await db.PembayaranPinjaman
        .Include(item => item.Pinjaman).ThenInclude(pinjaman => pinjaman.Angsuran)
        .FirstOrDefaultAsync(item => item.Id == id);
    if (pembayaran is null) return Results.NotFound();
    if (pembayaran.Status != "Diajukan") return Results.BadRequest(new { message = "Pengajuan pembayaran ini sudah diputuskan." });

    pembayaran.CatatanReview = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim();
    pembayaran.DiputuskanPada = DateTime.UtcNow;

    if (!request.Setuju)
    {
        pembayaran.Status = "Ditolak";
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Pengajuan pembayaran ditolak." });
    }

    var pinjaman = pembayaran.Pinjaman;
    if (pinjaman.Status != "Aktif") return Results.BadRequest(new { message = "Pinjaman ini sudah lunas." });

    var tanggal = DateTime.UtcNow.Date;
    if (pembayaran.Jenis == "Angsuran")
    {
        var angsuran = pinjaman.Angsuran
            .Where(item => item.Status == "Belum" && item.Jenis == "Reguler")
            .OrderBy(item => item.AngsuranKe)
            .FirstOrDefault();
        if (angsuran is null) return Results.BadRequest(new { message = "Semua angsuran sudah terbayar." });

        angsuran.Status = "Dibayar";
        angsuran.DibayarPada = tanggal;
        angsuran.JumlahDibayar = angsuran.Total;
        pinjaman.SisaPokok = Math.Max(0, pinjaman.SisaPokok - angsuran.Pokok);
        pinjaman.AngsuranTerbayar += 1;
        pembayaran.AngsuranKe = angsuran.AngsuranKe;

        if (pinjaman.Angsuran.All(item => item.Status != "Belum"))
        {
            pinjaman.Status = "Lunas";
            pinjaman.LunasPada = tanggal;
            pinjaman.SisaPokok = 0;
        }
    }
    else
    {
        var sisaPokok = pinjaman.SisaPokok;
        foreach (var angsuran in pinjaman.Angsuran.Where(item => item.Status == "Belum"))
        {
            angsuran.Status = "Dibatalkan";
        }

        var nomorTerakhir = pinjaman.Angsuran.Count == 0 ? 0 : pinjaman.Angsuran.Max(item => item.AngsuranKe);
        pinjaman.Angsuran.Add(new AngsuranPinjaman
        {
            AngsuranKe = nomorTerakhir + 1,
            JatuhTempo = tanggal,
            Pokok = sisaPokok,
            Jasa = 0,
            Total = sisaPokok,
            Jenis = "Pelunasan",
            Status = "Dibayar",
            JumlahDibayar = sisaPokok,
            DibayarPada = tanggal
        });

        pinjaman.SisaPokok = 0;
        pinjaman.Status = "Lunas";
        pinjaman.LunasPada = tanggal;
    }

    pembayaran.Status = "Disetujui";
    await db.SaveChangesAsync();
    return Results.Ok(ToAdminPinjamanResponse(pinjaman));
}).RequireAuthorization("AdminOnly");

// ── Admin: Konfigurasi koperasi ──────────────────────────────────────────────
app.MapGet("/api/admin/konfigurasi", async (KkcsDbContext db) =>
{
    var konfigurasi = await db.KonfigurasiKoperasi.AsNoTracking().FirstAsync();
    return Results.Ok(new KonfigurasiResponse(konfigurasi.SimpananPokokNominal, konfigurasi.SimpananWajibNominal, konfigurasi.TanggalTagihWajib, konfigurasi.DiperbaruiPada));
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/admin/konfigurasi", async (KonfigurasiRequest request, KkcsDbContext db) =>
{
    if (request.SimpananPokokNominal < 0 || request.SimpananWajibNominal < 0)
    {
        return Results.BadRequest(new { message = "Nominal tidak boleh negatif." });
    }
    var konfigurasi = await db.KonfigurasiKoperasi.FirstAsync();
    konfigurasi.SimpananPokokNominal = request.SimpananPokokNominal;
    konfigurasi.SimpananWajibNominal = request.SimpananWajibNominal;
    konfigurasi.DiperbaruiPada = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(new KonfigurasiResponse(konfigurasi.SimpananPokokNominal, konfigurasi.SimpananWajibNominal, konfigurasi.TanggalTagihWajib, konfigurasi.DiperbaruiPada));
}).RequireAuthorization("AdminOnly");

// ── Admin: Persetujuan pendaftaran anggota (Simpanan Pokok) ───────────────────
app.MapGet("/api/admin/anggota/pendaftaran", async (KkcsDbContext db) =>
    Results.Ok(await db.Pengguna.AsNoTracking()
        .Where(item => item.StatusKeanggotaan != "Aktif")
        .OrderByDescending(item => item.StatusKeanggotaan == "MenungguPersetujuan").ThenByDescending(item => item.DibuatPada)
        .Select(item => new PendaftaranResponse(item.Id, item.NamaLengkap, item.NomorIndukKaryawan, item.Email, item.StatusKeanggotaan, item.DibuatPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/anggota/{id:int}/persetujuan", async (int id, PutusanPengajuanRequest request, KkcsDbContext db, SimpananService simpananService) =>
{
    var pengguna = await db.Pengguna.FirstOrDefaultAsync(item => item.Id == id);
    if (pengguna is null) return Results.NotFound();
    if (pengguna.StatusKeanggotaan == "Aktif") return Results.BadRequest(new { message = "Anggota ini sudah aktif." });

    if (!request.Setuju)
    {
        pengguna.StatusKeanggotaan = "Ditolak";
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Pendaftaran ditolak." });
    }

    var konfigurasi = await db.KonfigurasiKoperasi.FirstAsync();
    pengguna.StatusKeanggotaan = "Aktif";
    pengguna.DisetujuiPada = DateTime.UtcNow;

    var pokok = await simpananService.DapatkanAtauBuatAsync(pengguna.Id, "POKOK");
    if (pokok.Saldo < konfigurasi.SimpananPokokNominal)
    {
        SimpananService.Catat(pokok, "Setor", konfigurasi.SimpananPokokNominal - pokok.Saldo, "Setoran pokok keanggotaan");
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { message = $"Pendaftaran disetujui. Simpanan pokok {konfigurasi.SimpananPokokNominal:N0} dikreditkan." });
}).RequireAuthorization("AdminOnly");

// ── Admin: Simpanan Wajib ────────────────────────────────────────────────────
app.MapGet("/api/admin/simpanan/wajib", async (KkcsDbContext db) =>
    Results.Ok(await db.TagihanWajib.AsNoTracking().Include(item => item.Pengguna)
        .OrderByDescending(item => item.Status == "Ditagih").ThenByDescending(item => item.Periode).ThenBy(item => item.Pengguna.NamaLengkap)
        .Select(item => new AdminTagihanWajibResponse(
            item.Id, item.Pengguna.NamaLengkap, item.Pengguna.NomorIndukKaryawan,
            item.Periode, item.Nominal, item.JatuhTempo, item.Status, item.CatatanReview, item.DibuatPada, item.DiprosesPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/wajib/generate", async (KkcsDbContext db) =>
{
    var konfigurasi = await db.KonfigurasiKoperasi.FirstAsync();
    var periode = TagihanWajibGenerator.PeriodeSekarang();
    var dibuat = await TagihanWajibGenerator.GenerateAsync(db, konfigurasi, periode);
    return Results.Ok(new { message = $"{dibuat} tagihan periode {periode} dibuat.", periode, dibuat });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/wajib/{id:int}/putusan", async (int id, PutusanPengajuanRequest request, KkcsDbContext db, SimpananService simpananService) =>
{
    var tagihan = await db.TagihanWajib.FirstOrDefaultAsync(item => item.Id == id);
    if (tagihan is null) return Results.NotFound();
    if (tagihan.Status != "Ditagih") return Results.BadRequest(new { message = "Tagihan ini sudah diproses." });

    tagihan.CatatanReview = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim();
    tagihan.DiprosesPada = DateTime.UtcNow;
    tagihan.Status = request.Setuju ? "Dibayar" : "Ditolak";

    if (request.Setuju)
    {
        var wajib = await simpananService.DapatkanAtauBuatAsync(tagihan.PenggunaId, "WAJIB");
        SimpananService.Catat(wajib, "Setor", tagihan.Nominal, $"Simpanan wajib {tagihan.Periode}");
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { message = request.Setuju ? "Tagihan wajib disetujui." : "Tagihan wajib ditolak." });
}).RequireAuthorization("AdminOnly");

// ── Admin: Simpanan Sukarela ─────────────────────────────────────────────────
app.MapGet("/api/admin/simpanan/sukarela", async (KkcsDbContext db, SimpananService simpananService) =>
{
    var data = await db.TransaksiSukarela.AsNoTracking().Include(item => item.Pengguna)
        .OrderByDescending(item => item.Status == "Diajukan").ThenByDescending(item => item.DiajukanPada)
        .ToListAsync();
    var result = new List<AdminTransaksiSukarelaResponse>();
    foreach (var item in data)
    {
        result.Add(new AdminTransaksiSukarelaResponse(
            item.Id, item.Pengguna.NamaLengkap, item.Pengguna.NomorIndukKaryawan,
            item.Jenis, item.Nominal, item.Catatan, item.Status, item.CatatanReview, item.DiajukanPada, item.DiprosesPada,
            await simpananService.SaldoAsync(item.PenggunaId, "SUKARELA")));
    }
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/sukarela/{id:int}/putusan", async (int id, PutusanPengajuanRequest request, KkcsDbContext db, SimpananService simpananService) =>
{
    var transaksi = await db.TransaksiSukarela.FirstOrDefaultAsync(item => item.Id == id);
    if (transaksi is null) return Results.NotFound();
    if (transaksi.Status != "Diajukan") return Results.BadRequest(new { message = "Pengajuan ini sudah diproses." });

    transaksi.CatatanReview = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim();
    transaksi.DiprosesPada = DateTime.UtcNow;

    if (!request.Setuju)
    {
        transaksi.Status = "Ditolak";
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Pengajuan simpanan sukarela ditolak." });
    }

    var sukarela = await simpananService.DapatkanAtauBuatAsync(transaksi.PenggunaId, "SUKARELA");
    if (transaksi.Jenis == "Tarik" && transaksi.Nominal > sukarela.Saldo)
    {
        return Results.BadRequest(new { message = $"Saldo sukarela anggota tidak cukup (saldo {sukarela.Saldo:N0})." });
    }
    SimpananService.Catat(sukarela, transaksi.Jenis, transaksi.Nominal,
        transaksi.Jenis == "Tarik" ? "Penarikan sukarela" : "Setoran sukarela");
    transaksi.Status = "Disetujui";
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Pengajuan simpanan sukarela disetujui." });
}).RequireAuthorization("AdminOnly");

// ── Admin: Simpanan Berjangka ────────────────────────────────────────────────
app.MapGet("/api/admin/simpanan/berjangka/produk", async (KkcsDbContext db) =>
    Results.Ok(await db.ProdukBerjangka.AsNoTracking().OrderByDescending(item => item.Aktif).ThenBy(item => item.Nominal)
        .Select(item => new ProdukBerjangkaResponse(item.Id, item.Nama, item.Nominal, item.TenorBulan, item.Aktif))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/berjangka/produk", async (ProdukBerjangkaRequest request, KkcsDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Nama) || request.Nominal <= 0 || request.TenorBulan <= 0)
    {
        return Results.BadRequest(new { message = "Nama, nominal, dan tenor wajib diisi dengan benar." });
    }
    var produk = new ProdukBerjangka
    {
        Nama = request.Nama.Trim(),
        Nominal = request.Nominal,
        TenorBulan = request.TenorBulan,
        Aktif = true
    };
    db.ProdukBerjangka.Add(produk);
    await db.SaveChangesAsync();
    return Results.Ok(new ProdukBerjangkaResponse(produk.Id, produk.Nama, produk.Nominal, produk.TenorBulan, produk.Aktif));
}).RequireAuthorization("AdminOnly");

app.MapPatch("/api/admin/simpanan/berjangka/produk/{id:int}", async (int id, ToggleUserStatusRequest request, KkcsDbContext db) =>
{
    var produk = await db.ProdukBerjangka.FirstOrDefaultAsync(item => item.Id == id);
    if (produk is null) return Results.NotFound();
    produk.Aktif = request.Aktif;
    await db.SaveChangesAsync();
    return Results.Ok(new ProdukBerjangkaResponse(produk.Id, produk.Nama, produk.Nominal, produk.TenorBulan, produk.Aktif));
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/admin/simpanan/berjangka", async (KkcsDbContext db) =>
    Results.Ok(await db.SimpananBerjangka.AsNoTracking().Include(item => item.Pengguna).Include(item => item.Produk)
        .OrderByDescending(item => item.Status == "Diajukan").ThenByDescending(item => item.Status == "JatuhTempo").ThenByDescending(item => item.DiajukanPada)
        .Select(item => new AdminBerjangkaResponse(
            item.Id, item.Pengguna.NamaLengkap, item.Pengguna.NomorIndukKaryawan, item.Produk.Nama,
            item.NomorSertifikat, item.Nominal, item.TenorBulan, item.Status, item.CatatanReview,
            item.DiajukanPada, item.TanggalMulai, item.TanggalJatuhTempo, item.DicairkanPada))
        .ToListAsync()))
    .RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/berjangka/{id:int}/putusan", async (int id, PutusanPengajuanRequest request, KkcsDbContext db) =>
{
    var berjangka = await db.SimpananBerjangka.FirstOrDefaultAsync(item => item.Id == id);
    if (berjangka is null) return Results.NotFound();
    if (berjangka.Status != "Diajukan") return Results.BadRequest(new { message = "Pengajuan ini sudah diproses." });

    berjangka.CatatanReview = string.IsNullOrWhiteSpace(request.Catatan) ? null : request.Catatan.Trim();
    if (!request.Setuju)
    {
        berjangka.Status = "Ditolak";
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Pengajuan simpanan berjangka ditolak." });
    }

    var mulai = (request.TanggalMulai ?? DateTime.UtcNow).Date;
    berjangka.Status = "Aktif";
    berjangka.TanggalMulai = mulai;
    berjangka.TanggalJatuhTempo = mulai.AddMonths(berjangka.TenorBulan);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Simpanan berjangka diaktifkan." });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/simpanan/berjangka/{id:int}/pencairan", async (int id, KkcsDbContext db) =>
{
    var berjangka = await db.SimpananBerjangka.FirstOrDefaultAsync(item => item.Id == id);
    if (berjangka is null) return Results.NotFound();
    if (berjangka.Status is not ("Aktif" or "JatuhTempo"))
    {
        return Results.BadRequest(new { message = "Hanya simpanan berjangka aktif / jatuh tempo yang dapat dicairkan." });
    }
    berjangka.Status = "Dicairkan";
    berjangka.DicairkanPada = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Simpanan berjangka dicairkan. (Perhitungan bunga menyusul.)" });
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/erat/agenda", async (KkcsDbContext db) =>
    Results.Ok(await db.EratAgenda.AsNoTracking().Include(agenda => agenda.Opsi)
        .Where(agenda => agenda.Status == "Aktif").OrderByDescending(agenda => agenda.MulaiPada).ToListAsync()))
    .RequireAuthorization();

app.MapPost("/api/erat/agenda/{agendaId:int}/suara", async (int agendaId, ClaimsPrincipal principal, EratVoteRequest request, KkcsDbContext db) =>
{
    var pengguna = await FindActiveMember(principal, db);
    if (pengguna is null) return BelumAktif();
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

// Anggota yang pendaftarannya sudah disetujui pengurus. null bila belum aktif.
static async Task<Pengguna?> FindActiveMember(ClaimsPrincipal principal, KkcsDbContext db)
{
    var pengguna = await FindCurrentUser(principal, db);
    return pengguna is { StatusKeanggotaan: "Aktif" } ? pengguna : null;
}

static IResult BelumAktif() =>
    Results.Json(new { message = "Akun Anda belum aktif. Menunggu persetujuan pengurus koperasi." }, statusCode: StatusCodes.Status403Forbidden);

static UserResponse ToUserResponse(Pengguna pengguna) => new(
    pengguna.Id,
    pengguna.NamaLengkap,
    pengguna.NomorIndukKaryawan,
    pengguna.Peran,
    pengguna.StatusKeanggotaan,
    pengguna.Email,
    pengguna.NomorTelepon,
    pengguna.Alamat,
    pengguna.FotoUrl);

static PengajuanResponse ToPengajuanResponse(PengajuanPinjaman item) => new(
    item.Id, item.NomorPengajuan, item.Nominal, item.TenorBulan, item.BungaTahunan,
    item.EstimasiCicilanBulanan, item.EstimasiTotalJasa, item.Tujuan, item.Status,
    item.CatatanReview, item.DibuatPada, item.DiputuskanPada);

static List<AngsuranResponse> ToAngsuranResponses(Pinjaman pinjaman) => pinjaman.Angsuran
    .OrderBy(item => item.AngsuranKe)
    .Select(item => new AngsuranResponse(
        item.AngsuranKe, item.JatuhTempo, item.Pokok, item.Jasa, item.Total,
        item.Jenis, item.Status, item.JumlahDibayar, item.DibayarPada))
    .ToList();

static PinjamanResponse ToPinjamanResponse(Pinjaman pinjaman, PembayaranPinjaman? tertunda = null)
{
    // Pelunasan dipercepat = sisa pokok saja; jasa bulan yang belum jatuh tempo dibebaskan.
    var jasaDibebaskan = pinjaman.Angsuran
        .Where(item => item.Status == "Belum" && item.Jenis == "Reguler")
        .Sum(item => item.Jasa);
    var sisaAngsuran = pinjaman.Angsuran.Count(item => item.Status == "Belum" && item.Jenis == "Reguler");

    return new PinjamanResponse(
        pinjaman.Id, pinjaman.NomorPinjaman, pinjaman.Pokok, pinjaman.TenorBulan, pinjaman.BungaTahunan,
        pinjaman.PokokPerBulan, pinjaman.JasaPerBulan, pinjaman.AngsuranPerBulan,
        pinjaman.SisaPokok, pinjaman.AngsuranTerbayar, sisaAngsuran,
        pinjaman.TanggalMulai, pinjaman.Status, pinjaman.LunasPada,
        pinjaman.SisaPokok, jasaDibebaskan,
        tertunda is null ? null : new PembayaranTertundaResponse(tertunda.Jenis, tertunda.JumlahDiajukan, tertunda.DiajukanPada),
        ToAngsuranResponses(pinjaman));
}

static AdminPinjamanResponse ToAdminPinjamanResponse(Pinjaman pinjaman)
{
    var jasaDibebaskan = pinjaman.Angsuran
        .Where(item => item.Status == "Belum" && item.Jenis == "Reguler")
        .Sum(item => item.Jasa);
    return new AdminPinjamanResponse(
        pinjaman.Id, pinjaman.NomorPinjaman, pinjaman.Pengguna?.NamaLengkap ?? string.Empty,
        pinjaman.Pengguna?.NomorIndukKaryawan ?? string.Empty,
        pinjaman.Pokok, pinjaman.TenorBulan, pinjaman.BungaTahunan,
        pinjaman.PokokPerBulan, pinjaman.JasaPerBulan, pinjaman.AngsuranPerBulan,
        pinjaman.SisaPokok, pinjaman.AngsuranTerbayar, pinjaman.TanggalMulai,
        pinjaman.Status, pinjaman.LunasPada, pinjaman.SisaPokok, jasaDibebaskan,
        ToAngsuranResponses(pinjaman));
}

static BerjangkaResponse ToBerjangkaResponse(SimpananBerjangka item) => new(
    item.Id, item.NomorSertifikat, item.Produk?.Nama ?? string.Empty, item.Nominal, item.TenorBulan,
    item.Status, item.CatatanReview, item.DiajukanPada, item.TanggalMulai, item.TanggalJatuhTempo, item.DicairkanPada);

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
    string StatusKeanggotaan,
    string? Email,
    string? NomorTelepon,
    string? Alamat,
    string? FotoUrl);

record AuthResponse(string Token, UserResponse User);

record ProfileRequest(string NamaLengkap, string? Email, string? NomorTelepon, string? Alamat);

record PengajuanPinjamanRequest(decimal Nominal, int TenorBulan, string Tujuan);

record EratVoteRequest(int OpsiId);

record TarifPinjamanResponse(int TenorBulan, decimal BungaTahunan);

record SimulasiPinjamanResponse(
    decimal Nominal,
    int TenorBulan,
    decimal BungaTahunan,
    decimal PokokPerBulan,
    decimal JasaPerBulan,
    decimal AngsuranPerBulan,
    decimal TotalJasa,
    decimal TotalPembayaran);

record PengajuanResponse(
    int Id,
    string NomorPengajuan,
    decimal Nominal,
    int TenorBulan,
    decimal BungaTahunan,
    decimal EstimasiCicilanBulanan,
    decimal EstimasiTotalJasa,
    string Tujuan,
    string Status,
    string? CatatanReview,
    DateTime DibuatPada,
    DateTime? DiputuskanPada);

record AngsuranResponse(
    int AngsuranKe,
    DateTime JatuhTempo,
    decimal Pokok,
    decimal Jasa,
    decimal Total,
    string Jenis,
    string Status,
    decimal? JumlahDibayar,
    DateTime? DibayarPada);

record PinjamanResponse(
    int Id,
    string NomorPinjaman,
    decimal Pokok,
    int TenorBulan,
    decimal BungaTahunan,
    decimal PokokPerBulan,
    decimal JasaPerBulan,
    decimal AngsuranPerBulan,
    decimal SisaPokok,
    int AngsuranTerbayar,
    int SisaAngsuran,
    DateTime TanggalMulai,
    string Status,
    DateTime? LunasPada,
    decimal NilaiPelunasanDipercepat,
    decimal JasaDibebaskan,
    PembayaranTertundaResponse? PembayaranTertunda,
    List<AngsuranResponse> Angsuran);

record PembayaranTertundaResponse(string Jenis, decimal JumlahDiajukan, DateTime DiajukanPada);

record PinjamanSayaResponse(
    List<PengajuanResponse> Pengajuan,
    List<PinjamanResponse> Pinjaman);

record AjukanPembayaranRequest(string? Jenis, string? Catatan);

record PutusanPembayaranRequest(bool Setuju, string? Catatan);

record AdminPembayaranResponse(
    int Id,
    int PinjamanId,
    string NomorPinjaman,
    string NamaAnggota,
    string NomorIndukKaryawan,
    string Jenis,
    decimal JumlahDiajukan,
    decimal? JasaDibebaskan,
    int? AngsuranKe,
    string? Catatan,
    string Status,
    string? CatatanReview,
    DateTime DiajukanPada,
    DateTime? DiputuskanPada);

record AdminPengajuanResponse(
    int Id,
    string NomorPengajuan,
    string NamaAnggota,
    string NomorIndukKaryawan,
    decimal Nominal,
    int TenorBulan,
    decimal BungaTahunan,
    decimal EstimasiCicilanBulanan,
    decimal EstimasiTotalJasa,
    string Tujuan,
    string Status,
    string? CatatanReview,
    DateTime DibuatPada,
    DateTime? DiputuskanPada);

record AdminPinjamanResponse(
    int Id,
    string NomorPinjaman,
    string NamaAnggota,
    string NomorIndukKaryawan,
    decimal Pokok,
    int TenorBulan,
    decimal BungaTahunan,
    decimal PokokPerBulan,
    decimal JasaPerBulan,
    decimal AngsuranPerBulan,
    decimal SisaPokok,
    int AngsuranTerbayar,
    DateTime TanggalMulai,
    string Status,
    DateTime? LunasPada,
    decimal NilaiPelunasanDipercepat,
    decimal JasaDibebaskan,
    List<AngsuranResponse> Angsuran);

record PutusanPengajuanRequest(bool Setuju, string? Catatan, DateTime? TanggalMulai);

// ── Simpanan ────────────────────────────────────────────────────────────────
record KonfigurasiResponse(decimal SimpananPokokNominal, decimal SimpananWajibNominal, int TanggalTagihWajib, DateTime DiperbaruiPada);
record KonfigurasiRequest(decimal SimpananPokokNominal, decimal SimpananWajibNominal);

record PendaftaranResponse(int Id, string NamaLengkap, string NomorIndukKaryawan, string? Email, string StatusKeanggotaan, DateTime DibuatPada);

record TransaksiSukarelaRequest(string? Jenis, decimal Nominal, string? Catatan);
record AjukanBerjangkaRequest(int ProdukBerjangkaId);
record ProdukBerjangkaRequest(string Nama, decimal Nominal, int TenorBulan);

record MutasiResponse(string Rekening, string Jenis, decimal Nominal, decimal SaldoSetelah, string? Keterangan, DateTime Tanggal);
record TagihanWajibResponse(int Id, string Periode, decimal Nominal, DateTime JatuhTempo, string Status, string? CatatanReview, DateTime? DiprosesPada);
record TransaksiSukarelaResponse(int Id, string Jenis, decimal Nominal, string? Catatan, string Status, string? CatatanReview, DateTime DiajukanPada, DateTime? DiprosesPada);
record ProdukBerjangkaResponse(int Id, string Nama, decimal Nominal, int TenorBulan, bool Aktif);
record BerjangkaResponse(int Id, string NomorSertifikat, string ProdukNama, decimal Nominal, int TenorBulan, string Status, string? CatatanReview, DateTime DiajukanPada, DateTime? TanggalMulai, DateTime? TanggalJatuhTempo, DateTime? DicairkanPada);

record SimpananRekeningResponse(decimal Saldo, string? NomorRekening);
record SimpananWajibResponse(decimal Saldo, string? NomorRekening, decimal NominalBulanan, int TanggalTagih, List<TagihanWajibResponse> Tagihan);
record SimpananSukarelaResponse(decimal Saldo, string? NomorRekening, List<TransaksiSukarelaResponse> Pengajuan);
record SimpananBerjangkaBagianResponse(List<ProdukBerjangkaResponse> Produk, List<BerjangkaResponse> MilikSaya);
record SimpananSayaResponse(
    string StatusKeanggotaan,
    SimpananRekeningResponse Pokok,
    SimpananWajibResponse Wajib,
    SimpananSukarelaResponse Sukarela,
    SimpananBerjangkaBagianResponse Berjangka,
    List<MutasiResponse> MutasiTerakhir);

record AdminTagihanWajibResponse(int Id, string NamaAnggota, string NomorIndukKaryawan, string Periode, decimal Nominal, DateTime JatuhTempo, string Status, string? CatatanReview, DateTime DibuatPada, DateTime? DiprosesPada);
record AdminTransaksiSukarelaResponse(int Id, string NamaAnggota, string NomorIndukKaryawan, string Jenis, decimal Nominal, string? Catatan, string Status, string? CatatanReview, DateTime DiajukanPada, DateTime? DiprosesPada, decimal SaldoSukarela);
record AdminBerjangkaResponse(int Id, string NamaAnggota, string NomorIndukKaryawan, string ProdukNama, string NomorSertifikat, decimal Nominal, int TenorBulan, string Status, string? CatatanReview, DateTime DiajukanPada, DateTime? TanggalMulai, DateTime? TanggalJatuhTempo, DateTime? DicairkanPada);

record ToggleUserStatusRequest(bool Aktif);

record AdminUserResponse(
    int Id,
    string NamaLengkap,
    string NomorIndukKaryawan,
    string? Email,
    string Peran,
    string StatusKeanggotaan,
    bool Aktif,
    DateTime DibuatPada);
