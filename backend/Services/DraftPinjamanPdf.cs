using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

/// <summary>
/// Draft pengajuan pinjaman yang bisa dicetak anggota untuk dilampirkan saat meminta surat
/// rekomendasi ke SDM — bukan dokumen resmi persetujuan koperasi (itu baru terbit setelah pengurus
/// menyetujui pengajuan yang sudah dilengkapi rekomendasi).
/// </summary>
public static class DraftPinjamanPdf
{
    public static byte[] Buat(Pengguna pengguna, PengajuanPinjaman pengajuan)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(col => KoperasiPdfHeader.Gambar(col, "Draft Pengajuan Pinjaman"));

                page.Content().PaddingTop(15).Column(col =>
                {
                    col.Spacing(6);
                    col.Item().Text($"Nomor Pengajuan: {pengajuan.NomorPengajuan}").SemiBold();
                    col.Item().Text($"Tanggal: {pengajuan.DibuatPada:dd MMMM yyyy}");

                    col.Item().PaddingTop(10).Text("Data Pemohon").Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.ConstantColumn(140); c.RelativeColumn(); });
                        void Baris(string label, string nilai)
                        {
                            table.Cell().Text(label);
                            table.Cell().Text($": {nilai}");
                        }
                        Baris("Nama", pengguna.NamaLengkap);
                        Baris("NIK", pengguna.NomorIndukKaryawan);
                    });

                    col.Item().PaddingTop(10).Text("Rincian Pinjaman yang Diajukan").Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.ConstantColumn(140); c.RelativeColumn(); });
                        void Baris(string label, string nilai)
                        {
                            table.Cell().Text(label);
                            table.Cell().Text($": {nilai}");
                        }
                        Baris("Nominal Pinjaman", $"Rp {pengajuan.Nominal:N0}");
                        Baris("Tenor", $"{pengajuan.TenorBulan} bulan");
                        Baris("Cicilan per Bulan (estimasi)", $"Rp {pengajuan.EstimasiCicilanBulanan:N0}");
                        Baris("Tujuan Pinjaman", pengajuan.Tujuan);
                    });

                    col.Item().PaddingTop(15).Text(
                        "Dokumen ini bukan bukti persetujuan pinjaman. Silakan lampirkan dokumen ini saat mengajukan " +
                        "permohonan surat rekomendasi ke bagian SDM. Surat rekomendasi dari SDM wajib diunggah kembali " +
                        "ke aplikasi sebagai syarat pengajuan pinjaman diteruskan ke pengurus koperasi untuk diputuskan."
                    ).FontSize(9.5f).FontColor(Colors.Grey.Darken1);

                    col.Item().PaddingTop(40).Row(row =>
                    {
                        row.RelativeItem();
                        row.RelativeItem().Column(sign =>
                        {
                            sign.Item().AlignCenter().Text($"{pengajuan.DibuatPada:dd MMMM yyyy}");
                            sign.Item().PaddingTop(50).AlignCenter().LineHorizontal(1).LineColor(Colors.Black);
                            sign.Item().AlignCenter().Text("Tanda Tangan SDM / Rekomendasi");
                        });
                    });
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Dicetak otomatis oleh sistem KKCS — ").FontSize(8).FontColor(Colors.Grey.Medium);
                    text.Span(DateTime.Now.ToString("dd MMMM yyyy HH:mm")).FontSize(8).FontColor(Colors.Grey.Medium);
                });
            });
        }).GeneratePdf();
    }
}
