public class SimpananBerjangka
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public int ProdukBerjangkaId { get; set; }

    public string NomorSertifikat { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public int TenorBulan { get; set; }

    // Bukti transfer anggota ke koperasi saat pengajuan (wajib).
    public string? BuktiTransferUrl { get; set; }

    // Diajukan | Aktif | Ditolak | JatuhTempo | Dicairkan
    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? TanggalMulai { get; set; }

    public DateTime? TanggalJatuhTempo { get; set; }

    public DateTime? DicairkanPada { get; set; }

    // Bunga BRUTO yang dihitung saat pencairan (flat: nominal x rate x tenor/12).
    // 0 jika dicairkan sebelum jatuh tempo (pencairan dipercepat, bunga hangus).
    public decimal? BungaDibayar { get; set; }

    // PPh yang dipotong dari BungaDibayar di atas, dan bunga neto yang benar-benar masuk ke Simpanan
    // Sukarela (BungaDibayar - PajakBunga). Keduanya 0/null kalau BungaDibayar juga 0/null.
    public decimal? PajakBunga { get; set; }
    public decimal? BungaNeto { get; set; }

    // Pengajuan pencairan dipercepat oleh anggota (sebelum jatuh tempo).
    public bool PencairanDiajukan { get; set; }

    public DateTime? PencairanDiajukanPada { get; set; }

    public string? AlasanPencairan { get; set; }

    public Pengguna Pengguna { get; set; } = null!;

    public ProdukBerjangka Produk { get; set; } = null!;
}
