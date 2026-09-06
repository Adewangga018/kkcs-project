public class PengajuanPinjaman
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public string NomorPengajuan { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public int TenorBulan { get; set; }

    public decimal BungaBulanan { get; set; }

    public decimal EstimasiCicilanBulanan { get; set; }

    public string Tujuan { get; set; } = string.Empty;

    public string Status { get; set; } = "Diajukan";

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public Pengguna Pengguna { get; set; } = null!;
}
