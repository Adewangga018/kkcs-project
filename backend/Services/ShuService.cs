using Microsoft.EntityFrameworkCore;

public record ShuBarisHasil(int PenggunaId, string Nama, string NomorIndukKaryawan, decimal SimpananAnggota, decimal TransaksiAnggota, decimal Jma, decimal Jua, decimal TotalShu);
public record ShuHitungResult(int Tahun, decimal TotalShu, decimal PersenJasaModal, decimal PersenJasaUsaha, decimal TotalSimpananSemuaAnggota, decimal TotalTransaksiSemuaAnggota, List<ShuBarisHasil> Rincian);

/// <summary>
/// Kalkulator SHU per anggota sesuai rumus koperasi standar:
///   SHU Anggota = JMA + JUA
///   JMA (Jasa Modal Anggota) = (Simpanan Anggota / Total Simpanan) × % Jasa Modal × Total SHU
///   JUA (Jasa Usaha Anggota) = (Transaksi Anggota / Total Transaksi) × % Jasa Usaha × Total SHU
/// Simpanan Anggota = saldo Simpanan Pokok + Wajib per akhir tahun buku (snapshot dari mutasi).
/// Transaksi Anggota = pokok pinjaman yang dicairkan + total pembelian/sewa produk sepanjang tahun buku.
/// Hanya anggota berstatus Aktif yang diikutkan.
/// </summary>
public static class ShuService
{
    public static async Task<ShuHitungResult> HitungAsync(KkcsDbContext db, int tahun, decimal totalShu, decimal persenJasaModal, decimal persenJasaUsaha)
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

        // Transaksi Anggota = pokok pinjaman dicairkan + total pembelian/sewa produk, sepanjang tahun buku.
        var transaksiPerAnggota = new Dictionary<int, decimal>();
        var pinjamanTahunIni = await db.Pinjaman.AsNoTracking()
            .Where(p => p.TanggalMulai >= awalTahun && p.TanggalMulai <= akhirTahun)
            .GroupBy(p => p.PenggunaId)
            .Select(g => new { PenggunaId = g.Key, Total = g.Sum(x => x.Pokok) })
            .ToListAsync();
        foreach (var item in pinjamanTahunIni)
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

        var rincian = anggotaAktif.Select(p =>
        {
            var simpanan = simpananPerAnggota.GetValueOrDefault(p.Id);
            var transaksi = transaksiPerAnggota.GetValueOrDefault(p.Id);
            var jma = totalSimpanan > 0 ? Math.Round(simpanan / totalSimpanan * persenJasaModal * totalShu, 2, MidpointRounding.AwayFromZero) : 0;
            var jua = totalTransaksi > 0 ? Math.Round(transaksi / totalTransaksi * persenJasaUsaha * totalShu, 2, MidpointRounding.AwayFromZero) : 0;
            return new ShuBarisHasil(p.Id, p.NamaLengkap, p.NomorIndukKaryawan, simpanan, transaksi, jma, jua, jma + jua);
        })
        .OrderByDescending(r => r.TotalShu)
        .ToList();

        return new ShuHitungResult(tahun, totalShu, persenJasaModal, persenJasaUsaha, totalSimpanan, totalTransaksi, rincian);
    }
}
