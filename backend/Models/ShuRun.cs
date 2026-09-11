public class ShuRun
{
    public int Id { get; set; }

    public int Tahun { get; set; }

    public decimal TotalShu { get; set; }

    public decimal PersenJasaModal { get; set; }

    public decimal PersenJasaUsaha { get; set; }

    public decimal TotalSimpananSemuaAnggota { get; set; }

    public decimal TotalTransaksiSemuaAnggota { get; set; }

    public DateTime DifinalisasiPada { get; set; } = DateTime.UtcNow;

    public int? DifinalisasiOlehId { get; set; }

    public Pengguna? DifinalisasiOleh { get; set; }

    public ICollection<ShuAnggota> Rincian { get; set; } = new List<ShuAnggota>();
}

public class ShuAnggota
{
    public int Id { get; set; }

    public int ShuRunId { get; set; }

    public int PenggunaId { get; set; }

    public decimal SimpananAnggota { get; set; }

    public decimal TransaksiAnggota { get; set; }

    public decimal Jma { get; set; }

    public decimal Jua { get; set; }

    public decimal TotalShu { get; set; }

    public ShuRun ShuRun { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;
}
