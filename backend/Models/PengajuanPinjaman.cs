public class PengajuanPinjaman
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public string NomorPengajuan { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public int TenorBulan { get; set; }

    public decimal BungaTahunan { get; set; }

    public decimal EstimasiCicilanBulanan { get; set; }

    public decimal EstimasiTotalJasa { get; set; }

    public string Tujuan { get; set; } = string.Empty;

    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public DateTime? DiputuskanPada { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public Pengguna Pengguna { get; set; } = null!;

    public Pinjaman? Pinjaman { get; set; }
}
