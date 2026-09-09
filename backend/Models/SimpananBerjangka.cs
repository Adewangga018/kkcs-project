public class SimpananBerjangka
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public int ProdukBerjangkaId { get; set; }

    public string NomorSertifikat { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public int TenorBulan { get; set; }

    // Diajukan | Aktif | Ditolak | JatuhTempo | Dicairkan
    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? TanggalMulai { get; set; }

    public DateTime? TanggalJatuhTempo { get; set; }

    public DateTime? DicairkanPada { get; set; }

    public Pengguna Pengguna { get; set; } = null!;

    public ProdukBerjangka Produk { get; set; } = null!;
}
