using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

/// <summary>Laporan ringkas profil & simpanan satu anggota — dicetak dari popup Direktori Anggota.</summary>
public static class AnggotaDetailPdf
{
    public static byte[] Buat(AnggotaDetailResponse detail)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col => KoperasiPdfHeader.Gambar(col, $"Laporan Anggota — {detail.NamaLengkap}"));

                page.Content().PaddingTop(15).Column(col =>
                {
                    col.Spacing(6);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.ConstantColumn(120); c.RelativeColumn(); });
                        void Baris(string label, string nilai)
                        {
                            table.Cell().Text(label);
                            table.Cell().Text($": {nilai}");
                        }
                        Baris("NIK", detail.NomorIndukKaryawan);
                        Baris("Peran", detail.Peran);
                        Baris("Status Keanggotaan", detail.StatusKeanggotaan);
                        Baris("Email", detail.Email ?? "-");
                        Baris("Telepon", detail.NomorTelepon ?? "-");
                        Baris("Bergabung", $"{detail.DibuatPada:dd MMMM yyyy}");
                    });

                    col.Item().PaddingTop(10).Text("Ringkasan Simpanan").Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                        table.Header(header =>
                        {
                            foreach (var judul in new[] { "Pokok", "Wajib", "Sukarela", "Berjangka", "Total" })
                                header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text(judul).Bold();
                        });
                        foreach (var nilai in new[] { detail.SaldoPokok, detail.SaldoWajib, detail.SaldoSukarela, detail.SaldoBerjangka, detail.TotalSimpanan })
                            table.Cell().Padding(4).Text($"Rp {nilai:N0}");
                    });

                    if (detail.Berjangka.Count > 0)
                    {
                        col.Item().PaddingTop(10).Text("Simpanan Berjangka").Bold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(2); c.RelativeColumn(); c.RelativeColumn(); });
                            table.Header(header =>
                            {
                                foreach (var judul in new[] { "No. Sertifikat", "Produk", "Nominal", "Status" })
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text(judul).Bold();
                            });
                            foreach (var b in detail.Berjangka)
                            {
                                table.Cell().Padding(4).Text(b.NomorSertifikat);
                                table.Cell().Padding(4).Text(b.ProdukNama);
                                table.Cell().Padding(4).Text($"Rp {b.Nominal:N0}");
                                table.Cell().Padding(4).Text(b.Status);
                            }
                        });
                    }

                    if (detail.Pinjaman.Count > 0)
                    {
                        col.Item().PaddingTop(10).Text("Riwayat Pinjaman").Bold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                            table.Header(header =>
                            {
                                foreach (var judul in new[] { "No. Pinjaman", "Pokok", "Sisa Pokok", "Status" })
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text(judul).Bold();
                            });
                            foreach (var p in detail.Pinjaman)
                            {
                                table.Cell().Padding(4).Text(p.NomorPinjaman);
                                table.Cell().Padding(4).Text($"Rp {p.Pokok:N0}");
                                table.Cell().Padding(4).Text($"Rp {p.SisaPokok:N0}");
                                table.Cell().Padding(4).Text(p.Status);
                            }
                        });
                    }

                    if (detail.RiwayatSimpanan.Count > 0)
                    {
                        col.Item().PaddingTop(10).Text("Riwayat Mutasi Simpanan Terakhir").Bold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(2); });
                            table.Header(header =>
                            {
                                foreach (var judul in new[] { "Tanggal", "Jenis Simpanan", "Transaksi", "Nominal", "Keterangan" })
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text(judul).Bold();
                            });
                            foreach (var r in detail.RiwayatSimpanan)
                            {
                                table.Cell().Padding(4).Text($"{r.TanggalTransaksi:dd/MM/yyyy}");
                                table.Cell().Padding(4).Text(r.JenisSimpanan);
                                table.Cell().Padding(4).Text(r.Jenis);
                                table.Cell().Padding(4).Text($"Rp {r.Nominal:N0}");
                                table.Cell().Padding(4).Text(r.Keterangan ?? "-");
                            }
                        });
                    }
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
