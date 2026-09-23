public class AngsuranTagihanKredit
{
    public int Id { get; set; }

    public int TagihanKreditId { get; set; }

    public int AngsuranKe { get; set; }

    public DateTime JatuhTempo { get; set; }

    public decimal Nominal { get; set; }

    // Belum | Dibayar
    public string Status { get; set; } = "Belum";

    public decimal? JumlahDibayar { get; set; }

    public DateTime? DibayarPada { get; set; }

    public TagihanKredit TagihanKredit { get; set; } = null!;
}
