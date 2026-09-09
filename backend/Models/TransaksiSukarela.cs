public class TransaksiSukarela
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    // Setor | Tarik
    public string Jenis { get; set; } = "Setor";

    public decimal Nominal { get; set; }

    public string? Catatan { get; set; }

    // Diajukan | Disetujui | Ditolak
    public string Status { get; set; } = "Diajukan";

    public string? CatatanReview { get; set; }

    public DateTime DiajukanPada { get; set; } = DateTime.UtcNow;

    public DateTime? DiprosesPada { get; set; }

    public Pengguna Pengguna { get; set; } = null!;
}
