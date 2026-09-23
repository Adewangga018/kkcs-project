using ClosedXML.Excel;

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
}
