public class LaporanTahunan
{
    public int Id { get; set; }

    public int Tahun { get; set; }

    public string Judul { get; set; } = string.Empty;

    public string? Deskripsi { get; set; }

    public string FileUrl { get; set; } = string.Empty;

    public DateTime DiterbitkanPada { get; set; } = DateTime.UtcNow;

    public bool Aktif { get; set; } = true;
}
