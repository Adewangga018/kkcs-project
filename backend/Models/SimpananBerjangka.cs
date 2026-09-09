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

    // Bunga yang dibayarkan saat pencairan (flat: nominal x rate x tenor/12).
    // 0 jika dicairkan sebelum jatuh tempo.
    public decimal? BungaDibayar { get; set; }

    // Pengajuan pencairan dipercepat oleh anggota (sebelum jatuh tempo).
    public bool PencairanDiajukan { get; set; }

    public DateTime? PencairanDiajukanPada { get; set; }

    public string? AlasanPencairan { get; set; }

    public Pengguna Pengguna { get; set; } = null!;

    public ProdukBerjangka Produk { get; set; } = null!;
}
