public class Anggota
{
    public int Id { get; set; }

    public string NomorAnggota { get; set; } = string.Empty;

    public string NamaLengkap { get; set; } = string.Empty;

    public string? NomorIdentitas { get; set; }

    public string? Email { get; set; }

    public string? NomorTelepon { get; set; }

    public string? Alamat { get; set; }

    public DateTime TanggalBergabung { get; set; } = DateTime.UtcNow;

    public bool Aktif { get; set; } = true;
}
