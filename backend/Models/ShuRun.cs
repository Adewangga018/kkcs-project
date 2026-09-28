public class ShuRun
{
    public int Id { get; set; }

    public int Tahun { get; set; }

    // Pot SHU yang diinput/disetujui pengurus (kebijakan) — bisa lebih besar dari jumlah yang benar-benar
    // teralokasi ke anggota (lihat TotalShuNeto+TotalPajak) kalau ada anggota tanpa basis simpanan/transaksi.
    public decimal TotalShu { get; set; }

    // Jumlah kolom Pajak di seluruh ShuAnggota (Σ Pajak per anggota).
    public decimal TotalPajak { get; set; }

    // Jumlah kolom TotalShuNeto di seluruh ShuAnggota (Σ neto per anggota) — inilah nominal yang benar-benar
    // dibukukan sebagai Utang SHU ke Anggota di jurnal, BUKAN TotalShu - TotalPajak (keduanya bisa beda,
    // lihat catatan TotalShu di atas).
    public decimal TotalShuNeto { get; set; }

    // Pembagian SHU sesuai kebijakan RAT — DUA LAPIS:
    //   Lapis 1 (dari Total SHU, idealnya berjumlah 100%): PersenAnggota (pool utk anggota, dipecah lagi
    //   di Lapis 2) + PersenPengurus (pool utk pengurus/pengawas/admin, tidak dipecah per orang oleh
    //   sistem) + PersenCadangan (ditahan permanen, TIDAK pernah dibagikan).
    //   Lapis 2 (dari pool Anggota di atas, idealnya berjumlah 100%): PersenJasaModal (JMA, dibagi ke
    //   semua anggota berdasar simpanan) + PersenJasaUsaha (JUA, dibagi berdasar aktivitas/transaksi).
    public decimal PersenAnggota { get; set; }

    public decimal PersenJasaModal { get; set; }

    public decimal PersenJasaUsaha { get; set; }

    public decimal PersenPengurus { get; set; }

    public decimal PersenCadangan { get; set; }

    // Pool untuk pengurus/pengawas/admin (PersenPengurus × TotalShu) — dicatat sebagai satu utang lump-sum,
    // pembagian ke masing-masing orang dilakukan pengurus di luar sistem.
    public decimal JasaPengurusPool { get; set; }

    // Bagian yang ditahan permanen sebagai cadangan koperasi (PersenCadangan × TotalShu) — TIDAK pernah
    // dibagikan, menambah akun Cadangan Koperasi di ekuitas selamanya.
    public decimal CadanganAmount { get; set; }

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

    public decimal JasaPinjamanAnggota { get; set; }

    public decimal BelanjaAnggota { get; set; }

    public decimal Jma { get; set; }

    public decimal Jua { get; set; }

    // Bruto = Jma + Jua, sebelum PPh.
    public decimal TotalShu { get; set; }

    // PPh yang dipotong dari TotalShu (bruto) di atas.
    public decimal Pajak { get; set; }

    // Neto = TotalShu - Pajak — nominal yang benar-benar jadi utang/dibagikan ke anggota.
    public decimal TotalShuNeto { get; set; }

    public ShuRun ShuRun { get; set; } = null!;

    public Pengguna Pengguna { get; set; } = null!;
}
