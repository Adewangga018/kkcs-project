/// <summary>
/// Perhitungan pinjaman KKCS (Tabel Pinjaman per 1 Juli 2023).
///
/// Skema bunga flat tahunan berdasarkan tenor:
///   1 tahun (12 bln) = 7,00%   2 tahun (24 bln) = 7,25%   3 tahun (36 bln) = 7,50%
///   4 tahun (48 bln) = 8,00%   5 tahun (60 bln) = 8,50%
///
/// Setiap angsuran terdiri dari 2 komponen:
///   Pokok / bulan = Nominal / TenorBulan            (rata, tetap tiap bulan)
///   Jasa  / bulan = Nominal * BungaTahunan / 12     (tetap tiap bulan)
///
/// Pelunasan dipercepat: anggota hanya membayar sisa pokok, jasa bulan-bulan
/// yang belum jatuh tempo dibebaskan (tidak dibebankan).
/// </summary>
public static class PinjamanKalkulator
{
    public static readonly int[] TenorValid = [12, 24, 36, 48, 60];

    public static decimal BungaTahunan(int tenorBulan) => tenorBulan switch
    {
        12 => 0.0700m,
        24 => 0.0725m,
        36 => 0.0750m,
        48 => 0.0800m,
        60 => 0.0850m,
        _ => throw new ArgumentOutOfRangeException(nameof(tenorBulan), "Tenor pinjaman tidak didukung.")
    };

    public static PinjamanRingkasan Hitung(decimal nominal, int tenorBulan)
    {
        var bunga = BungaTahunan(tenorBulan);
        var pokokPerBulan = Math.Round(nominal / tenorBulan, 2, MidpointRounding.AwayFromZero);
        var jasaPerBulan = Math.Round(nominal * bunga / 12m, 2, MidpointRounding.AwayFromZero);
        var angsuranPerBulan = pokokPerBulan + jasaPerBulan;
        return new PinjamanRingkasan(
            bunga,
            pokokPerBulan,
            jasaPerBulan,
            angsuranPerBulan,
            jasaPerBulan * tenorBulan);
    }

    // Tanggal potong gaji rutin koperasi (dipakai juga oleh Simpanan Wajib) — pinjaman yang disetujui
    // sebelum tanggal ini masih kena potong gaji bulan berjalan, jadi angsuran ke-1 jatuh tempo bulan
    // yang sama; kalau disetujui pada/tandelah tanggal ini, angsuran ke-1 baru jatuh tempo bulan depan.
    private const int TanggalPotongGaji = 25;

    public static List<AngsuranPinjaman> BuatJadwal(Pinjaman pinjaman)
    {
        var ringkasan = Hitung(pinjaman.Pokok, pinjaman.TenorBulan);
        var jadwal = new List<AngsuranPinjaman>(pinjaman.TenorBulan);
        var bulanDasar = pinjaman.TanggalMulai.Day < TanggalPotongGaji
            ? pinjaman.TanggalMulai
            : pinjaman.TanggalMulai.AddMonths(1);
        decimal pokokTerjadwal = 0;
        for (var ke = 1; ke <= pinjaman.TenorBulan; ke++)
        {
            // Angsuran terakhir menyerap sisa pembulatan agar total pokok == nominal.
            var pokok = ke == pinjaman.TenorBulan
                ? pinjaman.Pokok - pokokTerjadwal
                : ringkasan.PokokPerBulan;
            pokokTerjadwal += pokok;
            jadwal.Add(new AngsuranPinjaman
            {
                AngsuranKe = ke,
                JatuhTempo = bulanDasar.AddMonths(ke - 1),
                Pokok = pokok,
                Jasa = ringkasan.JasaPerBulan,
                Total = pokok + ringkasan.JasaPerBulan,
                Jenis = "Reguler",
                Status = "Belum"
            });
        }
        return jadwal;
    }
}

public readonly record struct PinjamanRingkasan(
    decimal BungaTahunan,
    decimal PokokPerBulan,
    decimal JasaPerBulan,
    decimal AngsuranPerBulan,
    decimal TotalJasa);
