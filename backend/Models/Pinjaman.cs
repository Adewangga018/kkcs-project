public class Pinjaman
{
    public int Id { get; set; }

    public int PenggunaId { get; set; }

    public int PengajuanPinjamanId { get; set; }

    public string NomorPinjaman { get; set; } = string.Empty;

    public decimal Pokok { get; set; }

    public int TenorBulan { get; set; }

    public decimal BungaTahunan { get; set; }

    public decimal PokokPerBulan { get; set; }

    public decimal JasaPerBulan { get; set; }

    public decimal AngsuranPerBulan { get; set; }

    public decimal SisaPokok { get; set; }

    public int AngsuranTerbayar { get; set; }

    public DateTime TanggalMulai { get; set; }

    public string Status { get; set; } = "Aktif";

    public DateTime? LunasPada { get; set; }

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public Pengguna Pengguna { get; set; } = null!;

    public PengajuanPinjaman Pengajuan { get; set; } = null!;

    public ICollection<AngsuranPinjaman> Angsuran { get; set; } = new List<AngsuranPinjaman>();
}
