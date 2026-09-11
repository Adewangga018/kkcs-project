using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Pencatat jejak digital (audit trail). Dipanggil dari endpoint-endpoint yang mengubah data sensitif
/// atau memutuskan persetujuan (pinjaman, simpanan, akun pengguna, konfigurasi, dll).
/// Kegagalan mencatat log TIDAK boleh membatalkan transaksi utama — kesalahan ditelan & dicatat lewat logger.
/// </summary>
public class AuditService(KkcsDbContext db, IHttpContextAccessor httpContextAccessor, ILogger<AuditService> logger)
{
    public async Task CatatAsync(ClaimsPrincipal? principal, string modul, string aksi, string ringkasan, int? entitasId = null, object? detail = null)
    {
        try
        {
            var (pelakuId, pelakuNama, pelakuPeran) = await IdentitasPelakuAsync(principal);
            db.AuditLog.Add(new AuditLog
            {
                WaktuUtc = DateTime.UtcNow,
                PelakuId = pelakuId,
                PelakuNama = pelakuNama,
                PelakuPeran = pelakuPeran,
                Modul = modul,
                Aksi = aksi,
                EntitasId = entitasId,
                Ringkasan = ringkasan,
                Detail = detail is null ? null : JsonSerializer.Serialize(detail),
                AlamatIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
            });
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Audit trail bersifat tambahan — jangan sampai kegagalan mencatatnya menggagalkan aksi utama yang sudah terjadi.
            logger.LogError(ex, "Gagal mencatat audit trail: {Modul}/{Aksi} - {Ringkasan}", modul, aksi, ringkasan);
        }
    }

    private async Task<(int? id, string nama, string peran)> IdentitasPelakuAsync(ClaimsPrincipal? principal)
    {
        if (principal is null) return (null, "Sistem", "Sistem");
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(ClaimTypes.Name)
            ?? principal.FindFirstValue("sub");
        if (!int.TryParse(subject, out var penggunaId)) return (null, "Tidak diketahui", "-");
        var pengguna = await db.Pengguna.AsNoTracking().FirstOrDefaultAsync(item => item.Id == penggunaId);
        return pengguna is null ? (penggunaId, "Tidak diketahui", "-") : (pengguna.Id, pengguna.NamaLengkap, pengguna.Peran);
    }
}
