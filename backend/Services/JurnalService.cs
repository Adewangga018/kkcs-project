using Microsoft.EntityFrameworkCore;

/// <summary>
/// Kode akun baku (bagan akun standar koperasi) yang dipakai untuk posting jurnal otomatis.
/// Akun-akun ini di-seed lewat migrasi; pengurus boleh menambah akun lain tapi kode di bawah ini
/// tidak boleh dihapus karena dipakai kode program.
/// </summary>
public static class KodeAkun
{
    public const string Kas = "1-1000";
    public const string PiutangPinjaman = "1-1200";
    public const string PiutangKreditProduk = "1-1300";
    public const string SimpananSukarela = "2-2200";
    public const string SimpananBerjangka = "2-2300";
    public const string UtangPph = "2-2400";
    public const string UtangShuAnggota = "2-2500";
    public const string UtangJasaPengurus = "2-2600";
    public const string SimpananPokok = "3-3100";
    public const string SimpananWajib = "3-3200";
    public const string ShuDitahan = "3-3900";
    public const string CadanganKoperasi = "3-3910";
    public const string PendapatanJasaPinjaman = "4-4100";
    public const string PendapatanPenjualanProduk = "4-4200";
    public const string BebanBungaSukarela = "5-5100";
    public const string BebanBungaBerjangka = "5-5200";
}

/// <summary>Satu baris jurnal yang akan diposting: kode akun + nominal debit/kredit (salah satu diisi 0).</summary>
public readonly record struct BarisJurnal(string KodeAkun, decimal Debit, decimal Kredit)
{
    public static BarisJurnal D(string kodeAkun, decimal nominal) => new(kodeAkun, nominal, 0);
    public static BarisJurnal K(string kodeAkun, decimal nominal) => new(kodeAkun, 0, nominal);
}

/// <summary>Posting jurnal umum (manual maupun otomatis dari modul lain). Tidak memanggil SaveChangesAsync
/// sendiri — dipanggil bersama perubahan domain lain dalam satu unit of work oleh pemanggil.</summary>
public class JurnalService(KkcsDbContext db)
{
    public async Task PostingOtomatisAsync(DateTime tanggal, string keterangan, string modul, string? referensiId, params BarisJurnal[] baris) =>
        await CatatAsync(tanggal, keterangan, "Otomatis", modul, referensiId, null, baris);

    public async Task<JurnalEntri> CatatAsync(
        DateTime tanggal, string keterangan, string sumber, string? modul, string? referensiId, int? dicatatOlehId,
        IReadOnlyList<BarisJurnal> baris)
    {
        var barisValid = baris.Where(item => item.Debit != 0 || item.Kredit != 0).ToList();
        if (barisValid.Count < 2)
        {
            throw new InvalidOperationException("Jurnal minimal memiliki 2 baris (debit dan kredit).");
        }

        var totalDebit = Math.Round(barisValid.Sum(item => item.Debit), 2, MidpointRounding.AwayFromZero);
        var totalKredit = Math.Round(barisValid.Sum(item => item.Kredit), 2, MidpointRounding.AwayFromZero);
        if (Math.Abs(totalDebit - totalKredit) > 0.01m)
        {
            throw new InvalidOperationException($"Jurnal tidak balance: debit {totalDebit:N2} ≠ kredit {totalKredit:N2}.");
        }

        var entri = new JurnalEntri
        {
            NomorJurnal = $"JU-{tanggal:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}",
            Tanggal = tanggal.Date,
            Keterangan = keterangan,
            Sumber = sumber,
            ReferensiModul = modul,
            ReferensiId = referensiId,
            DicatatOlehId = dicatatOlehId
        };

        foreach (var item in barisValid)
        {
            var akun = await db.AkunAkuntansi.FirstOrDefaultAsync(a => a.Kode == item.KodeAkun)
                ?? throw new InvalidOperationException($"Akun dengan kode {item.KodeAkun} tidak ditemukan.");
            entri.Baris.Add(new JurnalBaris { AkunId = akun.Id, Debit = item.Debit, Kredit = item.Kredit });
        }

        db.JurnalEntri.Add(entri);
        return entri;
    }
}
