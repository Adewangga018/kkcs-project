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

    /// <summary>Mencatat mutasi dan memperbarui saldo. <paramref name="jenis"/> = "Setor" atau "Tarik".</summary>
    public static void Catat(Simpanan simpanan, string jenis, decimal nominal, string keterangan)
    {
        simpanan.Saldo += jenis == "Tarik" ? -nominal : nominal;
        simpanan.Mutasi.Add(new MutasiSimpanan
        {
            Jenis = jenis,
            Nominal = nominal,
            SaldoSetelah = simpanan.Saldo,
            Keterangan = keterangan
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
