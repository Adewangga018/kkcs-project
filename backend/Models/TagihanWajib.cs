public class TagihanWajib
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    // Format "yyyy-MM", contoh "2026-09".
    public string Periode { get; set; } = string.Empty;

    public decimal Nominal { get; set; }

    public DateTime JatuhTempo { get; set; }

    // Ditagih | Dibayar | Ditolak
    public string Status { get; set; } = "Ditagih";

    public string? CatatanReview { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public DateTime? DiprosesPada { get; set; }

    public Pengguna Pengguna { get; set; } = null!;
}
