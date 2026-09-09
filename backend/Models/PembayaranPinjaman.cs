public class PembayaranPinjaman
{
    public int Id { get; set; }

    public int PinjamanId { get; set; }

    public int PenggunaId { get; set; }

    // Angsuran | Pelunasan
    public string Jenis { get; set; } = "Angsuran";

    public decimal JumlahDiajukan { get; set; }

    // Snapshot jasa yang akan dibebaskan (khusus Pelunasan).
    public decimal? JasaDibebaskan { get; set; }

    public string? Catatan { get; set; }

    // Diajukan | Disetujui | Ditolak
    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public int? AngsuranKe { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? DiputuskanPada { get; set; }

    public Pinjaman Pinjaman { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;
}
