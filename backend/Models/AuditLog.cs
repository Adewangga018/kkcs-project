/// <summary>
/// Jejak digital (audit trail) untuk setiap perubahan data sensitif atau keputusan persetujuan
/// yang dilakukan Admin/Pengurus lewat Admin Console — dicatat, tidak pernah diedit/dihapus dari aplikasi.
/// </summary>
public class AuditLog
{
    public int Id { get; set; }
    public DateTime WaktuUtc { get; set; } = DateTime.UtcNow;

    // Pelaku — disalin sebagai teks (bukan hanya FK) agar riwayat tetap terbaca meski akun pelaku kemudian diubah/dihapus.
    public int? PelakuId { get; set; }
    public string PelakuNama { get; set; } = "";
    public string PelakuPeran { get; set; } = "";

    /// <summary>Modul/domain: Akun, Pendaftaran, Pinjaman, Simpanan, Katalog, ERAT, Akuntansi, SHU, Konfigurasi.</summary>
    public string Modul { get; set; } = "";
    /// <summary>Kata kerja singkat: Setujui, Tolak, Aktifkan, Nonaktifkan, UbahPeran, ResetAkses, Ubah, Buat, Cairkan, dll.</summary>
    public string Aksi { get; set; } = "";
    /// <summary>Id entitas terkait pada tabel modulnya (mis. id pengajuan pinjaman), bila relevan.</summary>
    public int? EntitasId { get; set; }
    /// <summary>Ringkasan satu-baris siap tampil, mis. "Menyetujui pengajuan pinjaman #PJ-00012 milik Budi (Rp 5.000.000)".</summary>
    public string Ringkasan { get; set; } = "";
    /// <summary>Detail tambahan opsional (JSON ringkas: nilai sebelum/sesudah, catatan, dsb).</summary>
    public string? Detail { get; set; }
    public string? AlamatIp { get; set; }
}
