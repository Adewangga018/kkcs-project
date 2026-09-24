using Microsoft.EntityFrameworkCore;

public record ShuBarisHasil(int PenggunaId, string Nama, string NomorIndukKaryawan, decimal SimpananAnggota, decimal TransaksiAnggota, decimal Jma, decimal Jua, decimal TotalShu, decimal Pajak, decimal TotalShuNeto);
public record ShuHitungResult(
    int Tahun, decimal TotalShu, decimal PersenAnggota, decimal PersenJasaModal, decimal PersenJasaUsaha, decimal PersenPengurus, decimal PersenCadangan,
    decimal TarifPph, decimal TotalPajak, decimal TotalShuNeto, decimal AnggotaPool, decimal JasaPengurusPool, decimal CadanganAmount,
    decimal TotalSimpananSemuaAnggota, decimal TotalTransaksiSemuaAnggota, List<ShuBarisHasil> Rincian);

/// <summary>
/// Kalkulator SHU sesuai kebijakan pembagian dari RAT — DUA LAPIS pembagian:
///   Lapis 1, dari Total SHU (idealnya berjumlah 100%):
///     Anggota (% Anggota × Total SHU) → pool gabungan JMA+JUA, dipecah lagi di Lapis 2.
///     Jasa Pengurus (% Pengurus × Total SHU) → satu pool lump-sum, TIDAK dipecah per
///       orang oleh sistem (pembina/pengawas belum tentu punya akun) — dibagikan pengurus sendiri di luar sistem.
///     Cadangan (% Cadangan × Total SHU) → ditahan PERMANEN, tidak pernah dibagikan ke siapa pun.
///   Lapis 2, dari pool Anggota di atas (idealnya berjumlah 100%):
///     JMA (Jasa Modal Anggota, % Jasa Modal × Pool Anggota) → dibagi ke semua anggota aktif berdasar simpanan.
///     JUA (Jasa Usaha Anggota, % Jasa Usaha × Pool Anggota) → dibagi ke anggota aktif berdasar aktivitas/transaksi.
/// Rumus per anggota:
///   Pool Anggota = % Anggota × Total SHU
///   JMA_i = (Simpanan Anggota_i / Total Simpanan) × % Jasa Modal × Pool Anggota
///   JUA_i = (Transaksi Anggota_i / Total Transaksi) × % Jasa Usaha × Pool Anggota
///   SHU Anggota (neto)_i = (JMA_i + JUA_i) − PPh
/// Simpanan Anggota = saldo Simpanan Pokok + Wajib per akhir tahun buku (snapshot dari mutasi).
/// Transaksi Anggota = jasa/bunga pinjaman yang BENAR-BENAR DIBAYARKAN anggota ke koperasi sepanjang
///   tahun buku (bukan pokok pinjaman, dan bukan cuma pinjaman yang baru dicairkan tahun itu) — sesuai
///   praktik umum KSP: makin tertib & besar anggota mengangsur jasa pinjamannya, makin besar JUA-nya.
///   + total pembelian/sewa produk sepanjang tahun buku.
/// Hanya anggota berstatus Aktif yang diikutkan.
/// </summary>
public static class ShuService
{
    public static async Task<ShuHitungResult> HitungAsync(KkcsDbContext db, int tahun, decimal totalShu, decimal persenAnggota, decimal persenJasaModal, decimal persenJasaUsaha, decimal persenPengurus, decimal persenCadangan, decimal tarifPph)
    {
        var awalTahun = new DateTime(tahun, 1, 1);
        var akhirTahun = new DateTime(tahun, 12, 31, 23, 59, 59);

        var anggotaAktif = await db.Pengguna.AsNoTracking()
            .Where(p => p.StatusKeanggotaan == "Aktif")
            .Select(p => new { p.Id, p.NamaLengkap, p.NomorIndukKaryawan })
            .ToListAsync();
        var idAktif = anggotaAktif.Select(p => p.Id).ToHashSet();

        // Simpanan Anggota = saldo Pokok + Wajib per akhir tahun buku (snapshot dari mutasi terakhir <= akhir tahun).
        var simpananPerAnggota = new Dictionary<int, decimal>();
        foreach (var kode in new[] { "POKOK", "WAJIB" })
        {
            var jenis = await db.JenisSimpanan.AsNoTracking().FirstOrDefaultAsync(j => j.Kode == kode);
            if (jenis is null) continue;
            var rekening = await db.Simpanan.AsNoTracking().Include(s => s.Mutasi)
                .Where(s => s.JenisSimpananId == jenis.Id)
                .ToListAsync();
            foreach (var s in rekening)
            {
                var saldo = s.Mutasi.Where(m => m.TanggalTransaksi <= akhirTahun)
                    .OrderBy(m => m.TanggalTransaksi).ThenBy(m => m.Id)
                    .Select(m => (decimal?)m.SaldoSetelah).LastOrDefault() ?? 0m;
                simpananPerAnggota[s.PenggunaId] = simpananPerAnggota.GetValueOrDefault(s.PenggunaId) + saldo;
            }
        }

        // Transaksi Anggota = jasa/bunga pinjaman yang benar-benar dibayarkan anggota sepanjang tahun buku
        // (bukan pokok pinjaman) + total pembelian/sewa produk, sepanjang tahun buku.
        var transaksiPerAnggota = new Dictionary<int, decimal>();
        var jasaDibayarTahunIni = await db.AngsuranPinjaman.AsNoTracking()
            .Where(a => a.Status == "Dibayar" && a.DibayarPada != null && a.DibayarPada >= awalTahun && a.DibayarPada <= akhirTahun)
            .Join(db.Pinjaman.AsNoTracking(), a => a.PinjamanId, p => p.Id, (a, p) => new { p.PenggunaId, a.Jasa })
            .GroupBy(x => x.PenggunaId)
            .Select(g => new { PenggunaId = g.Key, Total = g.Sum(x => x.Jasa) })
            .ToListAsync();
        foreach (var item in jasaDibayarTahunIni)
        {
            transaksiPerAnggota[item.PenggunaId] = transaksiPerAnggota.GetValueOrDefault(item.PenggunaId) + item.Total;
        }

        var pembelianTahunIni = await db.PembelianProduk.AsNoTracking()
            .Where(p => (p.Status == "Disetujui" || p.Status == "Selesai") && p.DiprosesPada != null
                && p.DiprosesPada >= awalTahun && p.DiprosesPada <= akhirTahun)
            .GroupBy(p => p.PembeliId)
            .Select(g => new { PembeliId = g.Key, Total = g.Sum(x => x.Total) })
            .ToListAsync();
        foreach (var item in pembelianTahunIni)
        {
            transaksiPerAnggota[item.PembeliId] = transaksiPerAnggota.GetValueOrDefault(item.PembeliId) + item.Total;
        }

        var totalSimpanan = idAktif.Sum(id => simpananPerAnggota.GetValueOrDefault(id));
        var totalTransaksi = idAktif.Sum(id => transaksiPerAnggota.GetValueOrDefault(id));
        var anggotaPool = Math.Round(totalShu * persenAnggota, 2, MidpointRounding.AwayFromZero);

        var rincian = anggotaAktif.Select(p =>
        {
            var simpanan = simpananPerAnggota.GetValueOrDefault(p.Id);
            var transaksi = transaksiPerAnggota.GetValueOrDefault(p.Id);
            var jma = totalSimpanan > 0 ? Math.Round(simpanan / totalSimpanan * persenJasaModal * anggotaPool, 2, MidpointRounding.AwayFromZero) : 0;
            var jua = totalTransaksi > 0 ? Math.Round(transaksi / totalTransaksi * persenJasaUsaha * anggotaPool, 2, MidpointRounding.AwayFromZero) : 0;
            var bruto = jma + jua;
            var pajak = bruto > 0 ? Math.Round(bruto * tarifPph, 2, MidpointRounding.AwayFromZero) : 0;
            var neto = bruto - pajak;
            return new ShuBarisHasil(p.Id, p.NamaLengkap, p.NomorIndukKaryawan, simpanan, transaksi, jma, jua, bruto, pajak, neto);
        })
        .OrderByDescending(r => r.TotalShu)
        .ToList();

        var totalPajak = rincian.Sum(r => r.Pajak);
        var totalShuNeto = rincian.Sum(r => r.TotalShuNeto);
        var jasaPengurusPool = Math.Round(totalShu * persenPengurus, 2, MidpointRounding.AwayFromZero);
        var cadanganAmount = Math.Round(totalShu * persenCadangan, 2, MidpointRounding.AwayFromZero);

        return new ShuHitungResult(
            tahun, totalShu, persenAnggota, persenJasaModal, persenJasaUsaha, persenPengurus, persenCadangan,
            tarifPph, totalPajak, totalShuNeto, anggotaPool, jasaPengurusPool, cadanganAmount,
            totalSimpanan, totalTransaksi, rincian);
    }
}
