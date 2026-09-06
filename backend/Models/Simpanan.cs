public class Simpanan
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public int JenisSimpananId { get; set; }

    public string NomorRekening { get; set; } = string.Empty;

    public decimal Saldo { get; set; }

    public DateTime TanggalBuka { get; set; } = DateTime.UtcNow;

    public bool Aktif { get; set; } = true;

    public Pengguna Pengguna { get; set; } = null!;

    public JenisSimpanan JenisSimpanan { get; set; } = null!;

    public ICollection<MutasiSimpanan> Mutasi { get; set; } = new List<MutasiSimpanan>();
}
