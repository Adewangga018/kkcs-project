using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

/// <summary>Satu baris hasil parsing template Excel "Neraca Awal" (saldo awal per akun, sebelum divalidasi balance).</summary>
public record NeracaAwalBarisParsed(int Baris, string KodeAkun, string? NamaAkun, decimal Debit, decimal Kredit, string? Error);

/// <summary>Generate & parse template Excel untuk fitur "Import Neraca Awal" — migrasi saldo pembukaan
/// per akun (Kas, Bank, Piutang, Utang, Cadangan, dst) dari sistem lama ke satu jurnal umum.</summary>
public static class MigrasiService
{
    public static byte[] BuatTemplateNeracaAwal(List<AkunAkuntansi> akunAktif)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Neraca Awal");

        ws.Cell(1, 1).Value = "Kode Akun";
        ws.Cell(1, 2).Value = "Nama Akun";
        ws.Cell(1, 3).Value = "Tipe";
        ws.Cell(1, 4).Value = "Saldo Normal";
        ws.Cell(1, 5).Value = "Debit";
        ws.Cell(1, 6).Value = "Kredit";
        var header = ws.Range(1, 1, 1, 6);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#0891b2");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var akun in akunAktif.OrderBy(a => a.Kode))
        {
            ws.Cell(row, 1).Value = akun.Kode;
            ws.Cell(row, 2).Value = akun.Nama;
            ws.Cell(row, 3).Value = akun.Tipe;
            ws.Cell(row, 4).Value = akun.SaldoNormal;
            ws.Range(row, 1, row, 4).Style.Font.FontColor = XLColor.FromHtml("#64748b");
            ws.Cell(row, 5).Style.NumberFormat.Format = "#,##0";
            ws.Cell(row, 6).Style.NumberFormat.Format = "#,##0";
            row++;
        }

        ws.Cell(row + 1, 1).Value = "Total";
        ws.Cell(row + 1, 5).FormulaA1 = $"SUM(E2:E{row - 1})";
        ws.Cell(row + 1, 6).FormulaA1 = $"SUM(F2:F{row - 1})";
        ws.Range(row + 1, 1, row + 1, 6).Style.Font.Bold = true;
        ws.Cell(row + 1, 5).Style.NumberFormat.Format = "#,##0";
        ws.Cell(row + 1, 6).Style.NumberFormat.Format = "#,##0";

        ws.Columns(1, 6).AdjustToContents();
        ws.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public static List<NeracaAwalBarisParsed> ParseNeracaAwal(Stream fileStream, Dictionary<string, AkunAkuntansi> akunByKode)
    {
        var hasil = new List<NeracaAwalBarisParsed>();
        using var wb = new XLWorkbook(fileStream);
        var ws = wb.Worksheet(1);
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
        {
            var kode = ws.Cell(r, 1).GetString().Trim();
            if (string.IsNullOrWhiteSpace(kode) || kode.Equals("Total", StringComparison.OrdinalIgnoreCase)) continue;

            var debitCell = ws.Cell(r, 5);
            var kreditCell = ws.Cell(r, 6);
            var debit = 0m;
            var kredit = 0m;
            string? error = null;

            if (!debitCell.IsEmpty() && !debitCell.TryGetValue(out debit))
            {
                error = "Nilai Debit tidak valid (bukan angka).";
            }
            else if (!kreditCell.IsEmpty() && !kreditCell.TryGetValue(out kredit))
            {
                error = "Nilai Kredit tidak valid (bukan angka).";
            }
            else if (debit < 0 || kredit < 0)
            {
                error = "Nominal tidak boleh negatif.";
            }
            else if (debit > 0 && kredit > 0)
            {
                error = "Satu baris tidak boleh diisi Debit dan Kredit sekaligus.";
            }
            else if (debit == 0 && kredit == 0)
            {
                continue;
            }

            var akun = akunByKode.GetValueOrDefault(kode);
            if (akun is null) error ??= $"Kode akun \"{kode}\" tidak ditemukan di bagan akun.";

            hasil.Add(new NeracaAwalBarisParsed(r, kode, akun?.Nama, debit, kredit, error));
        }

        return hasil;
    }

    // ═══ Import Simpanan Pokok & Wajib (per-anggota) ═══════════════════════════
    public static byte[] BuatTemplateSimpanan(List<Pengguna> anggotaAktif)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Simpanan Pokok Wajib");
        ws.Cell(1, 1).Value = "NIK";
        ws.Cell(1, 2).Value = "Nama";
        ws.Cell(1, 3).Value = "Saldo Pokok";
        ws.Cell(1, 4).Value = "Saldo Wajib";
        var header = ws.Range(1, 1, 1, 4);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#0891b2");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var p in anggotaAktif.OrderBy(a => a.NamaLengkap))
        {
            ws.Cell(row, 1).Value = p.NomorIndukKaryawan;
            ws.Cell(row, 2).Value = p.NamaLengkap;
            ws.Range(row, 1, row, 2).Style.Font.FontColor = XLColor.FromHtml("#64748b");
            ws.Cell(row, 3).Style.NumberFormat.Format = "#,##0";
            ws.Cell(row, 4).Style.NumberFormat.Format = "#,##0";
            row++;
        }
        ws.Columns(1, 4).AdjustToContents();
        ws.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public record SimpananBarisParsed(int Baris, string Nik, string? Nama, int? PenggunaId, decimal SaldoPokok, decimal SaldoWajib, string? Error);

    public static List<SimpananBarisParsed> ParseSimpanan(Stream fileStream, Dictionary<string, Pengguna> anggotaByNik)
    {
        var hasil = new List<SimpananBarisParsed>();
        using var wb = new XLWorkbook(fileStream);
        var ws = wb.Worksheet(1);
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
        {
            var nik = ws.Cell(r, 1).GetString().Trim();
            if (string.IsNullOrWhiteSpace(nik)) continue;

            var pokokCell = ws.Cell(r, 3);
            var wajibCell = ws.Cell(r, 4);
            decimal pokok = 0, wajib = 0;
            string? error = null;

            if (!pokokCell.IsEmpty() && !pokokCell.TryGetValue(out pokok)) error = "Nilai Saldo Pokok tidak valid.";
            else if (!wajibCell.IsEmpty() && !wajibCell.TryGetValue(out wajib)) error = "Nilai Saldo Wajib tidak valid.";
            else if (pokok < 0 || wajib < 0) error = "Nominal tidak boleh negatif.";
            else if (pokok == 0 && wajib == 0) continue;

            var anggota = anggotaByNik.GetValueOrDefault(nik);
            if (anggota is null) error ??= $"NIK \"{nik}\" tidak ditemukan di daftar anggota aktif.";

            hasil.Add(new SimpananBarisParsed(r, nik, anggota?.NamaLengkap, anggota?.Id, pokok, wajib, error));
        }
        return hasil;
    }

    // ═══ Import Pinjaman Aktif (per-anggota) ═══════════════════════════════════
    public static byte[] BuatTemplatePinjaman(List<Pengguna> anggotaAktif)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Pinjaman Aktif");
        ws.Cell(1, 1).Value = "NIK";
        ws.Cell(1, 2).Value = "Nama";
        ws.Cell(1, 3).Value = "Nominal Pokok Awal";
        ws.Cell(1, 4).Value = "Tenor Bulan (12/24/36/48/60)";
        ws.Cell(1, 5).Value = "Tanggal Mulai (Pencairan)";
        ws.Cell(1, 6).Value = "Angsuran Sudah Dibayar (ke-berapa)";
        ws.Cell(1, 7).Value = "Sisa Pokok Saat Ini (opsional)";
        var header = ws.Range(1, 1, 1, 7);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#0891b2");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var p in anggotaAktif.OrderBy(a => a.NamaLengkap))
        {
            ws.Cell(row, 1).Value = p.NomorIndukKaryawan;
            ws.Cell(row, 2).Value = p.NamaLengkap;
            ws.Range(row, 1, row, 2).Style.Font.FontColor = XLColor.FromHtml("#64748b");
            ws.Cell(row, 3).Style.NumberFormat.Format = "#,##0";
            ws.Cell(row, 5).Style.DateFormat.Format = "yyyy-mm-dd";
            ws.Cell(row, 7).Style.NumberFormat.Format = "#,##0";
            row++;
        }
        ws.Columns(1, 7).AdjustToContents();
        ws.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public record PinjamanBarisParsed(
        int Baris, string Nik, string? Nama, int? PenggunaId, decimal Nominal, int TenorBulan,
        DateTime? TanggalMulai, int AngsuranSudahDibayar, decimal? SisaPokokOverride, string? Error);

    public static List<PinjamanBarisParsed> ParsePinjaman(Stream fileStream, Dictionary<string, Pengguna> anggotaByNik)
    {
        var hasil = new List<PinjamanBarisParsed>();
        using var wb = new XLWorkbook(fileStream);
        var ws = wb.Worksheet(1);
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
        {
            var nik = ws.Cell(r, 1).GetString().Trim();
            var nominalCell = ws.Cell(r, 3);
            if (string.IsNullOrWhiteSpace(nik) || nominalCell.IsEmpty()) continue;

            string? error = null;
            if (!nominalCell.TryGetValue(out decimal nominal) || nominal <= 0) { error = "Nominal Pokok Awal tidak valid."; nominal = 0; }

            var tenorCell = ws.Cell(r, 4);
            var tenor = 0;
            if (error is null && (!tenorCell.TryGetValue(out tenor) || !PinjamanKalkulator.TenorValid.Contains(tenor)))
                error = "Tenor bulan harus salah satu dari 12, 24, 36, 48, 60.";

            DateTime? tanggalMulai = null;
            if (error is null)
            {
                var tglCell = ws.Cell(r, 5);
                if (tglCell.IsEmpty() || !tglCell.TryGetValue(out DateTime tgl)) error = "Tanggal Mulai wajib diisi & valid.";
                else tanggalMulai = tgl.Date;
            }

            var angsuranSudahDibayar = 0;
            if (error is null)
            {
                var kCell = ws.Cell(r, 6);
                if (!kCell.IsEmpty() && !kCell.TryGetValue(out angsuranSudahDibayar)) error = "Angsuran Sudah Dibayar tidak valid.";
                else if (angsuranSudahDibayar < 0 || angsuranSudahDibayar >= tenor) error = "Angsuran Sudah Dibayar harus antara 0 dan (tenor - 1).";
            }

            decimal? sisaOverride = null;
            if (error is null)
            {
                var sCell = ws.Cell(r, 7);
                if (!sCell.IsEmpty())
                {
                    if (!sCell.TryGetValue(out decimal sisa) || sisa < 0) error = "Sisa Pokok Saat Ini tidak valid.";
                    else sisaOverride = sisa;
                }
            }

            var anggota = anggotaByNik.GetValueOrDefault(nik);
            if (anggota is null) error ??= $"NIK \"{nik}\" tidak ditemukan di daftar anggota aktif.";

            hasil.Add(new PinjamanBarisParsed(r, nik, anggota?.NamaLengkap, anggota?.Id, nominal, tenor, tanggalMulai, angsuranSudahDibayar, sisaOverride, error));
        }
        return hasil;
    }

    // ═══ Import Tagihan Kredit (per-anggota) ════════════════════════════════════
    public static byte[] BuatTemplateTagihanKredit(List<Pengguna> anggotaAktif)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Tagihan Kredit");
        ws.Cell(1, 1).Value = "NIK";
        ws.Cell(1, 2).Value = "Nama";
        ws.Cell(1, 3).Value = "Keterangan Barang/Sewa";
        ws.Cell(1, 4).Value = "Total Tagihan";
        ws.Cell(1, 5).Value = "Tenor (jumlah cicilan)";
        ws.Cell(1, 6).Value = "Tanggal Mulai";
        ws.Cell(1, 7).Value = "Sudah Dibayar (ke-berapa)";
        ws.Cell(1, 8).Value = "Sisa Tagihan Saat Ini (opsional)";
        var header = ws.Range(1, 1, 1, 8);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#0891b2");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var p in anggotaAktif.OrderBy(a => a.NamaLengkap))
        {
            ws.Cell(row, 1).Value = p.NomorIndukKaryawan;
            ws.Cell(row, 2).Value = p.NamaLengkap;
            ws.Range(row, 1, row, 2).Style.Font.FontColor = XLColor.FromHtml("#64748b");
            ws.Cell(row, 4).Style.NumberFormat.Format = "#,##0";
            ws.Cell(row, 6).Style.DateFormat.Format = "yyyy-mm-dd";
            ws.Cell(row, 8).Style.NumberFormat.Format = "#,##0";
            row++;
        }
        ws.Columns(1, 8).AdjustToContents();
        ws.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public record TagihanKreditBarisParsed(
        int Baris, string Nik, string? Nama, int? PenggunaId, string Keterangan, decimal Total, int TenorBulan,
        DateTime? TanggalMulai, int AngsuranSudahDibayar, decimal? SisaOverride, string? Error);

    public static List<TagihanKreditBarisParsed> ParseTagihanKredit(Stream fileStream, Dictionary<string, Pengguna> anggotaByNik)
    {
        var hasil = new List<TagihanKreditBarisParsed>();
        using var wb = new XLWorkbook(fileStream);
        var ws = wb.Worksheet(1);
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
        {
            var nik = ws.Cell(r, 1).GetString().Trim();
            var totalCell = ws.Cell(r, 4);
            if (string.IsNullOrWhiteSpace(nik) || totalCell.IsEmpty()) continue;

            var keterangan = ws.Cell(r, 3).GetString().Trim();
            string? error = null;
            if (!totalCell.TryGetValue(out decimal total) || total <= 0) { error = "Total Tagihan tidak valid."; total = 0; }

            var tenorCell = ws.Cell(r, 5);
            var tenor = 1;
            if (error is null && !tenorCell.IsEmpty() && (!tenorCell.TryGetValue(out tenor) || tenor < 1))
                error = "Tenor (jumlah cicilan) harus angka bulat minimal 1.";

            DateTime? tanggalMulai = null;
            if (error is null)
            {
                var tglCell = ws.Cell(r, 6);
                if (tglCell.IsEmpty() || !tglCell.TryGetValue(out DateTime tgl)) error = "Tanggal Mulai wajib diisi & valid.";
                else tanggalMulai = tgl.Date;
            }

            var angsuranSudahDibayar = 0;
            if (error is null)
            {
                var kCell = ws.Cell(r, 7);
                if (!kCell.IsEmpty() && !kCell.TryGetValue(out angsuranSudahDibayar)) error = "Sudah Dibayar tidak valid.";
                else if (angsuranSudahDibayar < 0 || angsuranSudahDibayar > tenor) error = "Sudah Dibayar harus antara 0 dan Tenor.";
            }

            decimal? sisaOverride = null;
            if (error is null)
            {
                var sCell = ws.Cell(r, 8);
                if (!sCell.IsEmpty())
                {
                    if (!sCell.TryGetValue(out decimal sisa) || sisa < 0) error = "Sisa Tagihan Saat Ini tidak valid.";
                    else sisaOverride = sisa;
                }
            }

            var anggota = anggotaByNik.GetValueOrDefault(nik);
            if (anggota is null) error ??= $"NIK \"{nik}\" tidak ditemukan di daftar anggota aktif.";

            hasil.Add(new TagihanKreditBarisParsed(r, nik, anggota?.NamaLengkap, anggota?.Id,
                string.IsNullOrWhiteSpace(keterangan) ? "Migrasi data lama" : keterangan, total, tenor, tanggalMulai, angsuranSudahDibayar, sisaOverride, error));
        }
        return hasil;
    }

    // ═══ Import Jurnal Harian (banyak transaksi bertanggal beda-beda, dikelompokkan per No Bukti) ═══
    // Efek saldo per-anggota yang boleh dipicu oleh satu baris jurnal — dijaga terpisah dari sisi akuntansi
    // (Debit/Kredit) supaya baris tetap valid meski efek anggotanya kosong (baris umum/non-anggota).
    public static readonly string[] EfekSaldoValid = ["SetorPokok", "SetorWajib", "TarikWajib", "SetorSukarela", "TarikSukarela", "AngsuranPinjaman"];

    public static byte[] BuatTemplateJurnalHarian(List<AkunAkuntansi> akunAktif)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Jurnal Harian");
        ws.Cell(1, 1).Value = "No Bukti";
        ws.Cell(1, 2).Value = "Tanggal";
        ws.Cell(1, 3).Value = "Kode Akun";
        ws.Cell(1, 4).Value = "Keterangan";
        ws.Cell(1, 5).Value = "Debit";
        ws.Cell(1, 6).Value = "Kredit";
        ws.Cell(1, 7).Value = "NIK Anggota (opsional)";
        ws.Cell(1, 8).Value = "Efek Saldo Anggota (opsional)";
        var header = ws.Range(1, 1, 1, 8);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#0891b2");
        header.Style.Font.FontColor = XLColor.White;
        ws.Column(2).Style.DateFormat.Format = "yyyy-mm-dd";
        ws.Column(5).Style.NumberFormat.Format = "#,##0";
        ws.Column(6).Style.NumberFormat.Format = "#,##0";
        ws.SheetView.FreezeRows(1);
        ws.Columns(1, 8).AdjustToContents();

        var ws2 = wb.Worksheets.Add("Referensi Kode Akun");
        ws2.Cell(1, 1).Value = "Kode Akun";
        ws2.Cell(1, 2).Value = "Nama Akun";
        ws2.Cell(1, 3).Value = "Tipe";
        ws2.Range(1, 1, 1, 3).Style.Font.Bold = true;
        var r2 = 2;
        foreach (var akun in akunAktif.OrderBy(a => a.Kode))
        {
            ws2.Cell(r2, 1).Value = akun.Kode;
            ws2.Cell(r2, 2).Value = akun.Nama;
            ws2.Cell(r2, 3).Value = akun.Tipe;
            r2++;
        }
        ws2.Columns(1, 3).AdjustToContents();

        var ws3 = wb.Worksheets.Add("Referensi Efek Saldo");
        ws3.Cell(1, 1).Value = "Nilai Kolom \"Efek Saldo Anggota\"";
        ws3.Cell(1, 2).Value = "Yang Terjadi ke Saldo Anggota";
        ws3.Range(1, 1, 1, 2).Style.Font.Bold = true;
        var catatan = new (string, string)[]
        {
            ("SetorPokok", "Nominal baris ini (Debit/Kredit, mana yang terisi) ditambahkan ke Simpanan Pokok NIK terkait."),
            ("SetorWajib", "Ditambahkan ke Simpanan Wajib NIK terkait."),
            ("TarikWajib", "Dikurangkan dari Simpanan Wajib NIK terkait (saldo harus cukup)."),
            ("SetorSukarela", "Ditambahkan ke Simpanan Sukarela NIK terkait."),
            ("TarikSukarela", "Dikurangkan dari Simpanan Sukarela NIK terkait (saldo harus cukup)."),
            ("AngsuranPinjaman", "Mengurangi Sisa Pokok pinjaman aktif NIK terkait (pinjaman aktif TERLAMA dipakai otomatis) & menandai angsuran berikutnya lunas."),
            ("(kosong)", "Baris murni akuntansi, tidak menyentuh saldo anggota mana pun (default)."),
        };
        var r3 = 2;
        foreach (var (nilai, ket) in catatan)
        {
            ws3.Cell(r3, 1).Value = nilai;
            ws3.Cell(r3, 2).Value = ket;
            r3++;
        }
        ws3.Columns(1, 2).AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public record JurnalHarianBarisParsed(
        int Baris, string NoBukti, DateTime? Tanggal, string KodeAkun, string? NamaAkun, string? Keterangan,
        decimal Debit, decimal Kredit, string? Nik, int? PenggunaId, string? EfekSaldo, string? Error);

    public static List<JurnalHarianBarisParsed> ParseJurnalHarian(Stream fileStream, Dictionary<string, AkunAkuntansi> akunByKode, Dictionary<string, Pengguna> anggotaByNik)
    {
        var hasil = new List<JurnalHarianBarisParsed>();
        using var wb = new XLWorkbook(fileStream);
        var ws = wb.Worksheet(1);
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
        {
            var noBukti = ws.Cell(r, 1).GetString().Trim();
            var kode = ws.Cell(r, 3).GetString().Trim();
            if (string.IsNullOrWhiteSpace(noBukti) && string.IsNullOrWhiteSpace(kode)) continue;

            string? error = null;
            if (string.IsNullOrWhiteSpace(noBukti)) error = "No Bukti wajib diisi.";

            DateTime? tanggal = null;
            var tglCell = ws.Cell(r, 2);
            if (error is null)
            {
                if (tglCell.IsEmpty() || !tglCell.TryGetValue(out DateTime tgl)) error = "Tanggal wajib diisi & valid.";
                else tanggal = tgl.Date;
            }

            var keterangan = ws.Cell(r, 4).GetString().Trim();

            var debitCell = ws.Cell(r, 5);
            var kreditCell = ws.Cell(r, 6);
            var debit = 0m;
            var kredit = 0m;
            if (error is null && !debitCell.IsEmpty() && !debitCell.TryGetValue(out debit)) error = "Nilai Debit tidak valid.";
            else if (error is null && !kreditCell.IsEmpty() && !kreditCell.TryGetValue(out kredit)) error = "Nilai Kredit tidak valid.";
            else if (error is null && debit < 0 || kredit < 0) error = "Nominal tidak boleh negatif.";
            else if (error is null && debit > 0 && kredit > 0) error = "Satu baris tidak boleh diisi Debit dan Kredit sekaligus.";
            else if (error is null && debit == 0 && kredit == 0) error = "Baris ini tidak berisi nominal Debit/Kredit.";

            AkunAkuntansi? akun = null;
            if (error is null)
            {
                akun = akunByKode.GetValueOrDefault(kode);
                if (akun is null) error = $"Kode akun \"{kode}\" tidak ditemukan di bagan akun.";
            }

            var nik = ws.Cell(r, 7).GetString().Trim();
            var efek = ws.Cell(r, 8).GetString().Trim();
            int? penggunaId = null;
            if (error is null && !string.IsNullOrWhiteSpace(efek))
            {
                if (!EfekSaldoValid.Contains(efek))
                    error = $"Efek Saldo Anggota \"{efek}\" tidak dikenal — pakai salah satu dari: {string.Join(", ", EfekSaldoValid)}.";
                else if (string.IsNullOrWhiteSpace(nik))
                    error = "NIK Anggota wajib diisi kalau Efek Saldo Anggota diisi.";
                else
                {
                    var anggota = anggotaByNik.GetValueOrDefault(nik);
                    if (anggota is null) error = $"NIK \"{nik}\" tidak ditemukan di daftar anggota aktif.";
                    else penggunaId = anggota.Id;
                }
            }

            hasil.Add(new JurnalHarianBarisParsed(r, noBukti, tanggal, kode, akun?.Nama, keterangan, debit, kredit,
                string.IsNullOrWhiteSpace(nik) ? null : nik, penggunaId, string.IsNullOrWhiteSpace(efek) ? null : efek, error));
        }
        return hasil;
    }

    // ═══ Efek saldo per-anggota dari baris Jurnal Harian (Setor/Tarik Simpanan, Angsuran Pinjaman) ═══
    public static async Task TerapkanSetorAsync(KkcsDbContext db, Dictionary<string, JenisSimpanan> jenisByKode, string kodeJenis, int penggunaId, decimal nominal, DateTime tanggal, string keterangan)
    {
        var jenis = jenisByKode.GetValueOrDefault(kodeJenis) ?? throw new InvalidOperationException($"Jenis Simpanan {kodeJenis} belum ada di sistem.");
        var simpanan = await db.Simpanan.FirstOrDefaultAsync(s => s.PenggunaId == penggunaId && s.JenisSimpananId == jenis.Id);
        if (simpanan is null)
        {
            var pengguna = await db.Pengguna.FirstOrDefaultAsync(p => p.Id == penggunaId)
                ?? throw new InvalidOperationException($"Anggota (Id {penggunaId}) tidak ditemukan.");
            simpanan = new Simpanan
            {
                PenggunaId = penggunaId,
                JenisSimpananId = jenis.Id,
                NomorRekening = $"{pengguna.NomorIndukKaryawan}-{kodeJenis}",
                Saldo = 0,
                TanggalBuka = tanggal,
                Aktif = true
            };
            db.Simpanan.Add(simpanan);
        }
        simpanan.Saldo += nominal;
        db.MutasiSimpanan.Add(new MutasiSimpanan
        {
            Simpanan = simpanan,
            Jenis = "Setor",
            Nominal = nominal,
            SaldoSetelah = simpanan.Saldo,
            Keterangan = keterangan,
            TanggalTransaksi = tanggal
        });
    }

    public static async Task TerapkanTarikAsync(KkcsDbContext db, Dictionary<string, JenisSimpanan> jenisByKode, string kodeJenis, int penggunaId, decimal nominal, DateTime tanggal, string keterangan)
    {
        var jenis = jenisByKode.GetValueOrDefault(kodeJenis) ?? throw new InvalidOperationException($"Jenis Simpanan {kodeJenis} belum ada di sistem.");
        var simpanan = await db.Simpanan.FirstOrDefaultAsync(s => s.PenggunaId == penggunaId && s.JenisSimpananId == jenis.Id);
        if (simpanan is null || simpanan.Saldo < nominal)
            throw new InvalidOperationException($"Saldo {kodeJenis} anggota (Id {penggunaId}) tidak cukup untuk penarikan {nominal:N0}.");
        simpanan.Saldo -= nominal;
        db.MutasiSimpanan.Add(new MutasiSimpanan
        {
            Simpanan = simpanan,
            Jenis = "Tarik",
            Nominal = nominal,
            SaldoSetelah = simpanan.Saldo,
            Keterangan = keterangan,
            TanggalTransaksi = tanggal
        });
    }

    public static async Task TerapkanAngsuranAsync(KkcsDbContext db, int penggunaId, decimal nominal, DateTime tanggal)
    {
        var pinjaman = await db.Pinjaman.Include(p => p.Angsuran)
            .Where(p => p.PenggunaId == penggunaId && p.Status == "Aktif")
            .OrderBy(p => p.TanggalMulai)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"Anggota (Id {penggunaId}) tidak punya pinjaman aktif untuk diangsur.");

        pinjaman.SisaPokok = Math.Max(0, pinjaman.SisaPokok - nominal);
        pinjaman.AngsuranTerbayar += 1;
        var angsuran = pinjaman.Angsuran.FirstOrDefault(a => a.AngsuranKe == pinjaman.AngsuranTerbayar);
        if (angsuran is not null)
        {
            angsuran.Status = "Dibayar";
            angsuran.JumlahDibayar = nominal;
            angsuran.DibayarPada = tanggal;
        }
        if (pinjaman.SisaPokok <= 0)
        {
            pinjaman.Status = "Lunas";
            pinjaman.LunasPada = tanggal;
        }
    }
}
