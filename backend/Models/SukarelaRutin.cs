public class SukarelaRutin
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public decimal Nominal { get; set; }

    // Tanggal tiap bulan (1-28) saat setoran otomatis dijalankan.
    public int TanggalSetor { get; set; }

    // Diajukan | Aktif | Ditolak | DihentikanDiajukan | Dihentikan
    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? DiputuskanPada { get; set; }

    // Periode ("yyyy-MM") terakhir kali berhasil dijalankan — mencegah setoran dobel di bulan yang sama.
    public string? TerakhirDijalankanPeriode { get; set; }

    public Pengguna Pengguna { get; set; } = null!;
}
