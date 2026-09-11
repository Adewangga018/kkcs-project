using Microsoft.EntityFrameworkCore;

/// <summary>
/// Utilitas rekening simpanan (Pokok / Wajib / Sukarela) berbasis <see cref="Simpanan"/> + <see cref="MutasiSimpanan"/>.
/// Simpanan Berjangka ditangani terpisah lewat <see cref="SimpananBerjangka"/> karena saldonya terkunci.
/// </summary>
public class SimpananService(KkcsDbContext db)
{
    public async Task<Simpanan> DapatkanAtauBuatAsync(int penggunaId, string kodeJenis)
    {
        var jenis = await db.JenisSimpanan.FirstAsync(item => item.Kode == kodeJenis);
        var simpanan = await db.Simpanan.Include(item => item.Mutasi)
            .FirstOrDefaultAsync(item => item.PenggunaId == penggunaId && item.JenisSimpananId == jenis.Id);
        if (simpanan is null)
        {
            simpanan = new Simpanan
            {
                PenggunaId = penggunaId,
                JenisSimpananId = jenis.Id,
                NomorRekening = $"{kodeJenis}-{penggunaId:D5}",
                Saldo = 0
            };
            db.Simpanan.Add(simpanan);
        }
        return simpanan;
    }

    // Jenis mutasi yang mengurangi saldo (debit); selain ini dianggap menambah saldo (kredit).
    private static readonly string[] JenisDebit = ["Tarik", "Pajak"];

    /// <summary>Mencatat mutasi dan memperbarui saldo. <paramref name="jenis"/> = Setor | Tarik | Bunga | Pajak.
    /// <paramref name="tanggal"/> opsional untuk mencatat mutasi mundur (mis. bunga dibukukan tanggal akhir bulan berjalan).</summary>
    public static void Catat(Simpanan simpanan, string jenis, decimal nominal, string keterangan, DateTime? tanggal = null)
    {
        simpanan.Saldo += JenisDebit.Contains(jenis) ? -nominal : nominal;
        simpanan.Mutasi.Add(new MutasiSimpanan
        {
            Jenis = jenis,
            Nominal = nominal,
            SaldoSetelah = simpanan.Saldo,
            Keterangan = keterangan,
            TanggalTransaksi = tanggal ?? DateTime.UtcNow
        });
    }

    public async Task<decimal> SaldoAsync(int penggunaId, string kodeJenis)
    {
        var jenis = await db.JenisSimpanan.AsNoTracking().FirstAsync(item => item.Kode == kodeJenis);
        var simpanan = await db.Simpanan.AsNoTracking()
            .FirstOrDefaultAsync(item => item.PenggunaId == penggunaId && item.JenisSimpananId == jenis.Id);
        return simpanan?.Saldo ?? 0;
    }
}

/// <summary>Bunga Simpanan Berjangka (deposito) — flat: Nominal × BungaTahunan × TenorBulan / 12.</summary>
public static class BungaDeposito
{
    public static decimal Hitung(decimal nominal, decimal bungaTahunan, int tenorBulan) =>
        Math.Round(nominal * bungaTahunan * tenorBulan / 12m, 2, MidpointRounding.AwayFromZero);
}

/// <summary>
/// Bunga Simpanan Sukarela — metode saldo harian:
///   Bunga = Σ (saldo akhir hari × bunga tahunan × 1) / 365, diakumulasi per bulan.
/// Bunga dikreditkan ke saldo sukarela (majemuk) sekali per periode; idempoten via <see cref="PostingBungaSukarela"/>.
/// </summary>
public static class BungaSukarela
{
    public static string PeriodeBulanLalu()
    {
        var awalBulanIni = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        return awalBulanIni.AddMonths(-1).ToString("yyyy-MM");
    }

    public static decimal HitungBulan(IReadOnlyList<MutasiSimpanan> mutasiTerurut, decimal bungaTahunan, DateTime awalBulan)
    {
        var akhirBulan = awalBulan.AddMonths(1).AddDays(-1);
        var saldo = mutasiTerurut
            .Where(m => m.TanggalTransaksi.Date < awalBulan.Date)
            .Select(m => (decimal?)m.SaldoSetelah)
            .LastOrDefault() ?? 0m;

        decimal total = 0m;
        for (var hari = awalBulan.Date; hari <= akhirBulan.Date; hari = hari.AddDays(1))
        {
            var mutasiHari = mutasiTerurut.Where(m => m.TanggalTransaksi.Date == hari).ToList();
            if (mutasiHari.Count > 0) saldo = mutasiHari[^1].SaldoSetelah;
            if (saldo > 0) total += saldo * bungaTahunan / 365m;
        }
        return Math.Round(total, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>
    /// Menghitung & mengkreditkan bunga sukarela seluruh anggota untuk <paramref name="periode"/> ("yyyy-MM").
    /// Dibukukan dengan tanggal transaksi = tanggal terakhir bulan tersebut (bukan tanggal job berjalan),
    /// dan dipotong PPh sebesar <paramref name="tarifPajak"/> dari nilai bunga (bunga dicatat penuh sebagai
    /// pendapatan, lalu dicatat mutasi "Pajak" terpisah sehingga saldo hanya bertambah sebesar bunga neto).
    /// </summary>
    public static async Task<(int akun, decimal totalBruto, decimal totalPajak, decimal totalNeto)> PostingAsync(
        KkcsDbContext db, SimpananService simpananService, JurnalService jurnalService, decimal bungaTahunan, decimal tarifPajak, string periode)
    {
        var tahun = int.Parse(periode[..4]);
        var bulan = int.Parse(periode[5..]);
        var awalBulan = new DateTime(tahun, bulan, 1);
        if (awalBulan >= new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1))
        {
            return (0, 0, 0, 0); // Bulan berjalan/masa depan belum bisa ditutup.
        }
        var tanggalPembukuan = new DateTime(tahun, bulan, DateTime.DaysInMonth(tahun, bulan));

        var jenisSukarela = await db.JenisSimpanan.AsNoTracking().FirstAsync(j => j.Kode == "SUKARELA");
        var rekeningList = await db.Simpanan.Include(s => s.Mutasi)
            .Where(s => s.JenisSimpananId == jenisSukarela.Id)
            .ToListAsync();
        var sudahDiposkan = await db.PostingBungaSukarela
            .Where(p => p.Periode == periode)
            .Select(p => p.PenggunaId)
            .ToListAsync();

        int akun = 0;
        decimal totalBruto = 0m, totalPajak = 0m, totalNeto = 0m;
        foreach (var rekening in rekeningList)
        {
            if (sudahDiposkan.Contains(rekening.PenggunaId)) continue;
            var mutasiTerurut = rekening.Mutasi.OrderBy(m => m.TanggalTransaksi).ThenBy(m => m.Id).ToList();
            var bunga = HitungBulan(mutasiTerurut, bungaTahunan, awalBulan);
            if (bunga <= 0) continue;

            var pajak = Math.Round(bunga * tarifPajak, 2, MidpointRounding.AwayFromZero);
            var neto = bunga - pajak;

            SimpananService.Catat(rekening, "Bunga", bunga, $"Bunga simpanan sukarela {periode} (bruto)", tanggalPembukuan);
            if (pajak > 0)
            {
                SimpananService.Catat(rekening, "Pajak", pajak, $"PPh {tarifPajak:P0} atas bunga simpanan sukarela {periode}", tanggalPembukuan);
            }

            db.PostingBungaSukarela.Add(new PostingBungaSukarela
            {
                PenggunaId = rekening.PenggunaId,
                Periode = periode,
                Nominal = neto,
                BungaBruto = bunga,
                Pajak = pajak,
                BungaNeto = neto
            });
            akun++;
            totalBruto += bunga;
            totalPajak += pajak;
            totalNeto += neto;
        }

        if (akun > 0)
        {
            // Satu jurnal teragregasi untuk seluruh posting bunga bulan ini (bukan per anggota) — cukup di level buku besar.
            await jurnalService.PostingOtomatisAsync(tanggalPembukuan, $"Bunga simpanan sukarela {periode} ({akun} rekening)", "Simpanan", $"bungaSukarela:{periode}",
                BarisJurnal.D(KodeAkun.BebanBungaSukarela, totalBruto),
                BarisJurnal.K(KodeAkun.SimpananSukarela, totalNeto),
                BarisJurnal.K(KodeAkun.UtangPph, totalPajak));
            await db.SaveChangesAsync();
        }
        return (akun, totalBruto, totalPajak, totalNeto);
    }
}

/// <summary>Membuat tagihan Simpanan Wajib per periode. Idempoten per (anggota, periode).</summary>
public static class TagihanWajibGenerator
{
    public static string PeriodeSekarang() => DateTime.Now.ToString("yyyy-MM");

    public static async Task<int> GenerateAsync(KkcsDbContext db, KonfigurasiKoperasi konfigurasi, string periode)
    {
        var tahun = int.Parse(periode[..4]);
        var bulan = int.Parse(periode[5..]);
        var hari = Math.Min(konfigurasi.TanggalTagihWajib, DateTime.DaysInMonth(tahun, bulan));
        var jatuhTempo = new DateTime(tahun, bulan, hari);

        var anggotaAktif = await db.Pengguna
            .Where(item => item.StatusKeanggotaan == "Aktif" && item.Aktif)
            .Select(item => item.Id)
            .ToListAsync();

        var sudahDitagih = await db.TagihanWajib
            .Where(item => item.Periode == periode)
            .Select(item => item.PenggunaId)
            .ToListAsync();

        var target = anggotaAktif.Except(sudahDitagih).ToList();
        foreach (var penggunaId in target)
        {
            db.TagihanWajib.Add(new TagihanWajib
            {
                PenggunaId = penggunaId,
                Periode = periode,
                Nominal = konfigurasi.SimpananWajibNominal,
                JatuhTempo = jatuhTempo,
                Status = "Ditagih"
            });
        }

        if (target.Count > 0) await db.SaveChangesAsync();
        return target.Count;
    }
}
