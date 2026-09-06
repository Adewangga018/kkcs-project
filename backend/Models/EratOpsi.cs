public class EratOpsi
{
    public int Id { get; set; }

    public int EratAgendaId { get; set; }

    public string Label { get; set; } = string.Empty;

    public int Urutan { get; set; }

    public EratAgenda EratAgenda { get; set; } = null!;

    public ICollection<EratSuara> Suara { get; set; } = new List<EratSuara>();
}
