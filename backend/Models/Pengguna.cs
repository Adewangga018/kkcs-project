public class Pengguna
{
    public int Id { get; set; }

    public string NamaLengkap { get; set; } = string.Empty;

    public string NomorIndukKaryawan { get; set; } = string.Empty;

    public string Peran { get; set; } = "Anggota";

    public string? Email { get; set; }

    public string? NomorTelepon { get; set; }

    public string? Alamat { get; set; }

    public string? FotoUrl { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public bool Aktif { get; set; } = true;

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;
}