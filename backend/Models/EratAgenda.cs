public class EratAgenda
{
    public int Id { get; set; }

    public string Judul { get; set; } = string.Empty;

    public string? Deskripsi { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime? MulaiPada { get; set; }

    public DateTime? SelesaiPada { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public ICollection<EratOpsi> Opsi { get; set; } = new List<EratOpsi>();

    public ICollection<EratSuara> Suara { get; set; } = new List<EratSuara>();
}
