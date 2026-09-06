public class Produk
{
    public int Id { get; set; }

    public string Kode { get; set; } = string.Empty;

    public string Nama { get; set; } = string.Empty;

    public decimal Harga { get; set; }

    public decimal Stok { get; set; }

    public string Satuan { get; set; } = "pcs";

    public bool Aktif { get; set; } = true;

    public DateTime DiperbaruiPada { get; set; } = DateTime.UtcNow;
}
