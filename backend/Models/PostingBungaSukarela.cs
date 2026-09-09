public class PostingBungaSukarela
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    // "yyyy-MM" bulan yang bunganya dihitung.
    public string Periode { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public DateTime DiposkanPada { get; set; } = DateTime.UtcNow;

    public Pengguna Pengguna { get; set; } = null!;
}
