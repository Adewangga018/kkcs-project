using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

/// <summary>Header standar (logo + nama koperasi) yang dipakai di semua dokumen PDF yang diterbitkan sistem.</summary>
public static class KoperasiPdfHeader
{
    private const string Nama = "KOPERASI KONSUMEN KARYAWAN CIPTA SEJAHTERA";

    private static byte[]? logo;

    /// <summary>Dipanggil sekali saat startup (lihat Program.cs) dengan WebRootPath — supaya path benar baik saat dotnet run maupun publish.</summary>
    public static void Inisialisasi(string webRootPath)
    {
        var path = Path.Combine(webRootPath, "logo-kkcs.png");
        logo = File.Exists(path) ? File.ReadAllBytes(path) : null;
    }

    public static void Gambar(ColumnDescriptor col, string subjudul)
    {
        col.Item().Row(row =>
        {
            if (logo is not null) row.ConstantItem(42).Image(logo);
            row.RelativeItem().PaddingLeft(logo is not null ? 10 : 0).Column(text =>
            {
                text.Item().Text(Nama).FontSize(15).Bold();
                text.Item().Text(subjudul).FontSize(13).SemiBold().FontColor(Colors.Blue.Darken2);
            });
        });
        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
    }
}
