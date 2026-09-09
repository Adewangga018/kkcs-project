public class TagihanKredit
{
    public int Id { get; set; }

    public int PembelianProdukId { get; set; }

    public int PenggunaId { get; set; }

    public decimal Total { get; set; }

    // Belum | DikirimKeSDM | Lunas
    public string Status { get; set; } = "Belum";

    public string? Keterangan { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public DateTime? DikirimPada { get; set; }

    public DateTime? LunasPada { get; set; }

    public PembelianProduk Pembelian { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;
}
