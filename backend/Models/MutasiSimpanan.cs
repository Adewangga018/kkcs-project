public class MutasiSimpanan
{
    public int Id { get; set; }

    public int SimpananId { get; set; }

    public string Jenis { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public decimal SaldoSetelah { get; set; }

    public string? Keterangan { get; set; }

    public DateTime TanggalTransaksi { get; set; } = DateTime.UtcNow;

    public Simpanan Simpanan { get; set; } = null!;
}
