public class PembelianProduk
{
    public int Id { get; set; }

    public int ProdukId { get; set; }

    public int PembeliId { get; set; }

    public string NomorTransaksi { get; set; } = string.Empty;

    // Beli | Sewa
    public string Jenis { get; set; } = "Beli";

    public decimal Jumlah { get; set; }

    public decimal HargaSatuan { get; set; }

    public decimal Total { get; set; }

    // Tunai | Kredit
    public string MetodePembayaran { get; set; } = "Tunai";

    // Diajukan | Disetujui | Ditolak | Selesai
    public string Status { get; set; } = "Diajukan";

    public string? Catatan { get; set; }

    public string? CatatanReview { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? DiprosesPada { get; set; }

    public Produk Produk { get; set; } = null!;

    public Pengguna Pembeli { get; set; } = null!;

    public TagihanKredit? TagihanKredit { get; set; }
}
