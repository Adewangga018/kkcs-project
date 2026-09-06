public class EratSuara
{
    public int Id { get; set; }

    public int EratAgendaId { get; set; }

    public int EratOpsiId { get; set; }

    public int PenggunaId { get; set; }

    public DateTime DipilihPada { get; set; } = DateTime.UtcNow;

    public EratAgenda EratAgenda { get; set; } = null!;

    public EratOpsi EratOpsi { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;
}
