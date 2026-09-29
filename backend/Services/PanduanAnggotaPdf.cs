using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

/// <summary>Manual book untuk anggota — diunduh dari halaman Panduan Anggota di aplikasi mobile.</summary>
public static class PanduanAnggotaPdf
{
    private record Modul(string Judul, string Ringkasan, string[] Poin);

    private static readonly Modul[] Modules =
    [
        new("Daftar & Masuk Aplikasi",
            "Langkah pertama sebelum bisa menikmati semua layanan koperasi lewat aplikasi.",
            [
                "Buka aplikasi lalu pilih \"Daftar\" — isi data diri (NIK, nama lengkap, email, nomor telepon) dan buat password.",
                "Pendaftaran Anda akan ditinjau oleh pengurus koperasi. Selama menunggu, status keanggotaan Anda tertulis \"Menunggu Persetujuan\" dan sebagian fitur belum bisa diakses.",
                "Setelah disetujui pengurus, Simpanan Pokok Anda otomatis tercatat dan seluruh fitur aplikasi bisa langsung digunakan — cukup masuk (login) dengan NIK & password yang sudah dibuat.",
                "Lupa password? Hubungi pengurus/admin koperasi untuk direset — Anda akan mendapat password sementara yang wajib diganti setelah login pertama.",
            ]),

        new("Beranda",
            "Ringkasan kondisi keanggotaan Anda begitu membuka aplikasi.",
            [
                "Kartu \"Transparansi\" menampilkan ringkasan saldo simpanan, pinjaman aktif, dan informasi keanggotaan Anda secara langsung dari sistem koperasi.",
                "Bagian \"Pengumuman\" menampilkan info terbaru dari pengurus koperasi — ketuk salah satu untuk langsung dibawa ke menu terkait.",
                "Bagian \"Produk Terbaru\" menampilkan barang terbaru di Katalog koperasi.",
                "Gunakan navigasi di bagian bawah layar (Beranda, Simpan Pinjam, Katalog, E-RAT) untuk berpindah antar layanan utama.",
            ]),

        new("Simpanan",
            "Kelola simpanan Anda: Wajib (otomatis), Sukarela, Sukarela Rutin, dan Berjangka (deposito).",
            [
                "Simpanan Pokok & Wajib dikelola otomatis oleh koperasi (potong gaji) — Anda cukup memantau saldonya, tidak perlu mengajukan apa-apa.",
                "Simpanan Sukarela — ajukan Setor atau Tarik kapan saja. Untuk Setor, Anda WAJIB melampirkan foto/PDF bukti transfer saat mengajukan; pengurus akan meninjau dan menyetujuinya.",
                "Sukarela Rutin — mode menabung otomatis bulanan. Tentukan nominal & tanggal setor tiap bulan, lalu ajukan; setelah disetujui pengurus, sistem akan menyetor otomatis tiap bulan tanpa perlu mengajukan ulang. Ingin berhenti? Ajukan \"Berhenti\" dan tunggu persetujuan pengurus.",
                "Simpanan Berjangka (deposito) — pilih salah satu paket (nominal + tenor) yang disediakan koperasi, lampirkan bukti transfer, lalu ajukan. Setelah jatuh tempo, Anda bisa mencairkannya untuk menerima pokok + bunga (dipotong pajak). Mencairkan LEBIH CEPAT dari jatuh tempo membuat bunga hangus — Anda hanya menerima pokok.",
            ]),

        new("Pinjaman",
            "Alur pengajuan pinjaman melalui tahap Draft dan surat rekomendasi SDM sebelum diproses pengurus.",
            [
                "Isi nominal & tenor pinjaman yang diinginkan lalu simpan sebagai Draft.",
                "Cetak/unduh draft tersebut dari aplikasi, lalu bawa ke bagian SDM di kantor Anda untuk meminta surat rekomendasi (proses ini dilakukan di luar aplikasi).",
                "Setelah mendapat surat rekomendasi dari SDM, unggah foto/PDF surat itu lewat aplikasi — status pengajuan Anda berubah menjadi \"Diajukan\" dan mulai ditinjau pengurus koperasi.",
                "Setelah disetujui pengurus, dana otomatis cair dan jadwal angsuran bulanan langsung terbentuk.",
                "Bayar angsuran reguler tiap bulan, atau ajukan Pelunasan Dipercepat (Anda hanya perlu membayar sisa pokok, jasa sisa dibebaskan) — kedua jenis pembayaran ini WAJIB melampirkan bukti transfer saat mengajukan.",
            ]),

        new("Katalog",
            "Toko koperasi — belanja produk koperasi atau titip barang Anda sendiri untuk dijual.",
            [
                "Pilih produk di Katalog, lalu beli dengan metode Tunai (bayar langsung) atau Kredit (potong gaji, dicicil lewat Tagihan Kredit).",
                "Ingin menjual barang lewat katalog koperasi? Ajukan \"Titip Barang\" — pengurus akan meninjau sebelum barang Anda tayang di katalog.",
                "Pantau riwayat belanja dan status Tagihan Kredit Anda di menu Akun.",
            ]),

        new("E-RAT (Rapat Anggota Tahunan)",
            "Ikuti Rapat Anggota Tahunan koperasi secara digital, kapan saja dan di mana saja.",
            [
                "Tab Voting — berikan suara Anda untuk agenda yang sedang dibuka pengurus (misalnya pemilihan pengurus atau persetujuan program kerja).",
                "Tab Dokumen — unduh arsip dokumen resmi RAT (laporan tahunan, dll).",
                "Tab Laporan RAT — baca laporan RAT tahun berjalan begitu ditayangkan pengurus: kondisi keuangan koperasi, kegiatan, dan pembagian SHU tahun itu.",
            ]),

        new("Akun Saya",
            "Kelola data pribadi dan keamanan akun Anda.",
            [
                "Ubah foto profil, email, dan nomor telepon lewat menu Akun.",
                "Ganti password secara berkala demi keamanan akun Anda.",
                "Lihat ringkasan status keanggotaan dan riwayat aktivitas Anda di koperasi.",
            ]),
    ];

    public static byte[] Buat()
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10.5f));

                page.Header().Column(col => KoperasiPdfHeader.Gambar(col, "Manual Book — Panduan Anggota"));

                page.Content().PaddingTop(15).Column(col =>
                {
                    col.Spacing(14);

                    col.Item().Text(
                        "Dokumen ini merangkum cara menggunakan aplikasi mobile KKCS untuk anggota koperasi. " +
                        $"Dicetak otomatis dari sistem pada {DateTime.Now:dd MMMM yyyy}."
                    ).FontSize(9.5f).FontColor(Colors.Grey.Darken1).Italic().Justify();

                    var nomor = 1;
                    foreach (var modul in Modules)
                    {
                        col.Item().Column(sec =>
                        {
                            sec.Item().Text($"{nomor}. {modul.Judul}").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                            sec.Item().PaddingLeft(16).PaddingTop(2).Text(modul.Ringkasan).FontSize(10).Italic().FontColor(Colors.Grey.Darken2).Justify();

                            sec.Item().PaddingLeft(16).PaddingTop(6).Column(list =>
                            {
                                list.Spacing(4);
                                foreach (var p in modul.Poin)
                                {
                                    list.Item().Row(row =>
                                    {
                                        row.ConstantItem(12).Text("•").Bold();
                                        row.RelativeItem().Text(p).FontSize(10).Justify();
                                    });
                                }
                            });
                        });
                        nomor++;
                    }
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Manual Book Anggota — KKCS").FontSize(8).FontColor(Colors.Grey.Medium);
                    row.RelativeItem().AlignRight().Text(text =>
                    {
                        text.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Medium));
                        text.Span("Halaman ");
                        text.CurrentPageNumber();
                        text.Span(" dari ");
                        text.TotalPages();
                    });
                });
            });
        }).GeneratePdf();
    }
}
