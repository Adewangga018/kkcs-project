public class TagihanKredit
{
    public int Id { get; set; }

    public int PembelianProdukId { get; set; }

    public int PenggunaId { get; set; }

    public decimal Total { get; set; }

    // Belum | Lunas
    public string Status { get; set; } = "Belum";

    public string? Keterangan { get; set; }

    // Jumlah cicilan — null berarti tagihan lunas sekali (potong gaji satu kali, perilaku lama).
    public int? TenorBulan { get; set; }

    public decimal? AngsuranPerBulan { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public DateTime? LunasPada { get; set; }

    public PembelianProduk Pembelian { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;

    public ICollection<AngsuranTagihanKredit> Angsuran { get; set; } = new List<AngsuranTagihanKredit>();
}
