public class Produk
{
    public int Id { get; set; }

    public string Kode { get; set; } = string.Empty;

    public string Nama { get; set; } = string.Empty;

    public string? Deskripsi { get; set; }

    // Jual | Sewa
    public string Jenis { get; set; } = "Jual";

    public decimal Harga { get; set; }

    public decimal Stok { get; set; }

    public string Satuan { get; set; } = "pcs";

    public string? FotoUrl { get; set; }

    // Koperasi | TitipanAnggota
    public string Sumber { get; set; } = "Koperasi";

    public int? DiajukanOlehId { get; set; }

    // MenungguPersetujuan | Disetujui | Ditolak
    public string Status { get; set; } = "Disetujui";

    public string? CatatanReview { get; set; }

    // Visibilitas di katalog (bisa di-nonaktifkan pengurus tanpa menghapus).
    public bool Aktif { get; set; } = true;

    public DateTime DiperbaruiPada { get; set; } = DateTime.UtcNow;

    public Pengguna? DiajukanOleh { get; set; }
}
