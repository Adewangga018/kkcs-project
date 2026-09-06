public class JenisSimpanan
{
    public int Id { get; set; }

    public string Kode { get; set; } = string.Empty;

    public string Nama { get; set; } = string.Empty;

    public string? Deskripsi { get; set; }

    public bool Aktif { get; set; } = true;

    public ICollection<Simpanan> Simpanan { get; set; } = new List<Simpanan>();
}
