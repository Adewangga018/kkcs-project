public class AngsuranPinjaman
{
    public int Id { get; set; }

    public int PinjamanId { get; set; }

    public int AngsuranKe { get; set; }

    public DateTime JatuhTempo { get; set; }

    public decimal Pokok { get; set; }

    public decimal Jasa { get; set; }

    public decimal Total { get; set; }

    // Reguler | Pelunasan
    public string Jenis { get; set; } = "Reguler";

    // Belum | Dibayar | Dibatalkan
    public string Status { get; set; } = "Belum";

    public decimal? JumlahDibayar { get; set; }

    public DateTime? DibayarPada { get; set; }

    public Pinjaman Pinjaman { get; set; } = null!;
}
