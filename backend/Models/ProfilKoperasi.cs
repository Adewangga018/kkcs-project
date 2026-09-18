/// <summary>
/// Profil organisasi koperasi (singleton, Id=1) — konten statis yang jarang berubah, dipakai untuk
/// menyusun laporan RAT otomatis (Visi/Misi, sejarah pendirian, alamat). Diedit lewat menu E-RAT.
/// </summary>
public class ProfilKoperasi
{
    public int Id { get; set; }

    public string Visi { get; set; } = string.Empty;

    public string Misi { get; set; } = string.Empty;

    public string? AlamatKantor { get; set; }

    public DateTime? TanggalDidirikan { get; set; }

    public string? NomorAktaPendirian { get; set; }

    public DateTime? TanggalAkta { get; set; }

    public DateTime DiperbaruiPada { get; set; } = DateTime.UtcNow;
}
