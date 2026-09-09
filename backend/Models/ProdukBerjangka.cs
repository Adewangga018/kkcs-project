public class ProdukBerjangka
{
    public int Id { get; set; }

    public string Nama { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public int TenorBulan { get; set; }

    public bool Aktif { get; set; } = true;

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public ICollection<SimpananBerjangka> SimpananBerjangka { get; set; } = new List<SimpananBerjangka>();
}
