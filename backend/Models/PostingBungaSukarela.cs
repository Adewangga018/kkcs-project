public class PostingBungaSukarela
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    // "yyyy-MM" bulan yang bunganya dihitung.
    public string Periode { get; set; } = string.Empty;

    // Bunga neto yang benar-benar menambah saldo (setelah PPh). Dipertahankan untuk kompatibilitas.
    public decimal Nominal { get; set; }

    public decimal BungaBruto { get; set; }

    public decimal Pajak { get; set; }

    public decimal BungaNeto { get; set; }

    public DateTime DiposkanPada { get; set; } = DateTime.UtcNow;

    public Pengguna Pengguna { get; set; } = null!;
}
