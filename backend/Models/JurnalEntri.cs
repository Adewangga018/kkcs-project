public class JurnalEntri
{
    public int Id { get; set; }

    public string NomorJurnal { get; set; } = string.Empty;

    public DateTime Tanggal { get; set; }

    public string Keterangan { get; set; } = string.Empty;

    // Manual | Otomatis
    public string Sumber { get; set; } = "Manual";

    // Modul asal posting otomatis, mis. "Simpanan", "Pinjaman", "Produk", "SHU".
    public string? ReferensiModul { get; set; }

    public string? ReferensiId { get; set; }

    public int? DicatatOlehId { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public Pengguna? DicatatOleh { get; set; }

    public ICollection<JurnalBaris> Baris { get; set; } = new List<JurnalBaris>();
}

public class JurnalBaris
{
    public int Id { get; set; }

    public int JurnalEntriId { get; set; }

    public int AkunId { get; set; }

    public decimal Debit { get; set; }

    public decimal Kredit { get; set; }

    public string? Keterangan { get; set; }

    public JurnalEntri JurnalEntri { get; set; } = null!;

    public AkunAkuntansi Akun { get; set; } = null!;
}
