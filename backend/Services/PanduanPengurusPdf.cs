using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

/// <summary>Manual book (panduan pengurus) — dicetak sebagai satu dokumen PDF utuh dari menu Panduan Pengurus.
/// Isinya diselaraskan dengan konten panduan interaktif di aplikasi (App.tsx, PanduanView).</summary>
public static class PanduanPengurusPdf
{
    private record Alur(string Judul, string[] Langkah);
    private record Modul(string Judul, string Ringkasan, string[] Poin, string? Tips, bool AdminOnly, Alur[]? Diagram = null);

    private static readonly Modul[] Modules =
    [
        new("Dashboard",
            "Halaman pertama yang Anda lihat — ringkasan kondisi koperasi hari ini dalam sekali pandang.",
            [
                "Kartu besar di atas menunjukkan jumlah anggota aktif, total simpanan koperasi, pinjaman aktif, dan laba bersih tahun berjalan — angka-angka ini dihitung langsung dari pembukuan (jurnal), bukan angka statis.",
                "Kotak kuning \"Perlu tindakan Anda\" muncul kalau ada pengajuan yang menunggu persetujuan (pendaftaran, simpanan, pinjaman, katalog) — klik salah satu chip-nya untuk langsung dibawa ke menu & tab yang tepat, tidak perlu cari manual.",
                "Grafik tren 6 bulan menampilkan pendapatan vs beban, dan donut chart \"Komposisi Simpanan\" menunjukkan proporsi Pokok/Wajib/Sukarela dari total saldo simpanan aktif.",
                "Tiga kartu di bawahnya: \"Kesehatan Neraca\" (posisi Aset vs Liabilitas+Ekuitas hari ini), \"SHU Terakhir\" (ringkasan SHU tahun buku yang paling baru difinalisasi), dan \"Tagihan Anggota\" (total potongan gaji periode berjalan yang belum diproses).",
                "Bagian paling bawah memuat aktivitas terbaru yang tercatat di seluruh sistem — cara cepat memantau \"apa saja yang baru terjadi\" tanpa buka Audit Trail.",
            ],
            "Jadikan halaman ini kebiasaan pertama tiap kali login — supaya tidak ada pengajuan anggota yang lolos tanpa diproses.",
            false),

        new("Manajemen Anggota",
            "Satu menu, tiga tab: dari calon anggota mendaftar sampai potongan gajinya direkap.",
            [
                "Tab \"Pendaftaran\" — setujui atau tolak calon anggota baru yang mendaftar lewat aplikasi. Setelah disetujui, Simpanan Pokok (nominalnya diatur di Simpan Pinjam > Konfigurasi) otomatis dikreditkan dan jurnal Kas/Simpanan Pokok langsung tercatat.",
                "Tab \"Direktori Anggota\" — cari anggota aktif, klik namanya untuk pop-up detail lengkap: 5 kartu ringkasan saldo (Pokok/Wajib/Sukarela/Berjangka/Total), riwayat simpanan berjangka, riwayat mutasi simpanan terbaru, riwayat lengkap pinjaman (termasuk progres angsuran), dan riwayat belanja katalog. Klik ikon unduh (biru, di sebelah nama anggota) untuk cetak/ekspor seluruh isi pop-up ini jadi PDF.",
                "Tab \"Tagihan Anggota\" — rekap otomatis 4 jenis potongan gaji: Simpanan Wajib yang belum ditagih, Tagihan Kredit produk yang belum lunas, Cicilan Pinjaman yang jatuh tempo bulan itu, dan Sukarela Rutin aktif milik anggota (setoran sukarela otomatis bulanan). Klik satu baris anggota untuk buka pop-up rinci per item — bisa Setuju/Tolak satu-satu atau pakai tombol \"Setujui semua\" per kategori di atas tabel. Kolom & baris Sukarela Rutin di pop-up bersifat informasi saja (tidak perlu disetujui manual per anggota).",
                "Tombol \"Setujui Sukarela Rutin\" di baris Aksi Massal akan memicu sistem memproses semua setoran Sukarela Rutin yang jatuh tempo periode berjalan — berguna kalau Anda mau memastikan setorannya sudah tercatat segera, tanpa menunggu proses otomatis latar belakang (yang berjalan tiap 6 jam).",
                "Setelah semua potongan disetujui, klik \"Ekspor CSV\" untuk dikirim ke bagian penggajian — sistem tidak lagi mensyaratkan langkah \"kirim ke SDM\" terpisah, cukup approve lalu ekspor.",
            ],
            "Anggota baru wajib disetujui dulu di tab Pendaftaran sebelum muncul di Direktori maupun bisa ikut transaksi lain (simpanan, pinjaman, belanja).",
            false,
            [
                new("Alur Pendaftaran Anggota Baru", ["Anggota daftar via aplikasi", "Pengurus tinjau (tab Pendaftaran)", "Setujui / Tolak", "Simpanan Pokok otomatis dikreditkan"]),
                new("Alur Tagihan Anggota (Potong Gaji)", ["Sistem rekap otomatis tiap periode", "Pengurus tinjau & Setujui per kategori", "Ekspor CSV", "Kirim ke bagian penggajian"]),
            ]),

        new("Simpan Pinjam",
            "Jantung operasional koperasi — kelola simpanan anggota dan proses pinjaman, dalam dua tab.",
            [
                "Tab \"Simpanan\" bagian Konfigurasi — atur nominal Simpanan Pokok & Wajib, suku bunga tahunan Sukarela/Deposito, serta Tarif PPh Bunga (untuk Sukarela & Deposito). Tarif PPh khusus SHU diatur terpisah di halaman Akuntansi > SHU (defaultnya 15%, beda dari PPh bunga).",
                "Simpanan Wajib ditagih otomatis tiap bulan pada tanggal yang Anda atur — setujui satu-satu atau pakai \"Setujui semua periode ini\" untuk memproses sekaligus.",
                "Simpanan Sukarela: setoran/penarikan anggota disetujui di sini. Setiap pengajuan setor WAJIB dilampiri bukti transfer (foto/PDF) oleh anggota — klik \"Lihat\" di kolom Bukti pada tabel untuk memeriksanya sebelum menyetujui. Bunga dihitung metode saldo harian (per hari: saldo × suku bunga ÷ 365) dan hanya bisa ditutup untuk BULAN YANG SUDAH LEWAT — klik \"Hitung bunga bulan lalu\" untuk memicunya.",
                "Panel \"Sukarela Rutin\" — anggota bisa mengajukan mode menabung sukarela otomatis bulanan (nominal + tanggal setor tetap). Setujui/tolak pengajuan instruksi barunya di sini; setelah Aktif, sistem akan menyetor otomatis tiap bulan tanpa perlu approve satu-satu (ikut muncul juga sebagai informasi potongan gaji di tab \"Tagihan Anggota\"). Kalau anggota minta berhenti, statusnya jadi \"Diajukan berhenti\" — tinggal Setujui (instruksi dihentikan) atau Tolak (tetap aktif).",
                "Simpanan Berjangka (deposito): buat paket (nominal + tenor) di panel \"Paket Simpanan Berjangka\", lalu setujui pengajuan anggota untuk mengaktifkannya — setiap pengajuan WAJIB dilampiri bukti transfer, sama seperti Simpanan Sukarela. Saat jatuh tempo, cairkan untuk memberi pokok + bunga neto (dipotong PPh). Kalau anggota minta cair LEBIH CEPAT dari jatuh tempo, anggota hanya menerima pokok — bunga hangus sepenuhnya.",
                "Tab \"Pinjaman\" — pengajuan pinjaman kini melalui tahap Draft dulu: anggota mengisi nominal & tenor lalu mencetak draftnya untuk dibawa ke SDM, meminta surat rekomendasi (di luar aplikasi), lalu mengunggah surat itu lewat aplikasi. Anggota yang masih berstatus Draft TIDAK muncul di antrian pengajuan Anda — hanya yang sudah \"Diajukan\" (rekomendasi sudah diunggah) yang perlu ditinjau. Klik \"Lihat\" pada kolom \"Rekomendasi SDM\" untuk memeriksa suratnya sebelum menyetujui.",
                "Menyetujui pengajuan pinjaman otomatis mencairkan dana dan membuat jadwal angsuran bulanan (pokok + jasa) sesuai tenor. Proses juga pembayaran angsuran reguler, atau pelunasan dipercepat (anggota cukup bayar sisa pokok, jasa sisa dibebaskan penuh) — pengajuan pelunasan dipercepat WAJIB dilampiri bukti transfer juga.",
            ],
            "Bunga simpanan sukarela dan bunga deposito sama-sama otomatis dipotong PPh sebelum masuk ke saldo anggota. Untuk semua jenis setoran/pelunasan yang mewajibkan bukti transfer, selalu periksa buktinya dulu sebelum klik Setuju.",
            false,
            [
                new("Alur Pengajuan Pinjaman", ["Anggota isi nominal & tenor (Draft)", "Cetak draft", "Minta rekomendasi ke SDM (luar aplikasi)", "Upload surat rekomendasi (jadi Diajukan)", "Pengurus setujui", "Dana cair + jadwal angsuran dibuat"]),
                new("Alur Sukarela Rutin", ["Anggota ajukan nominal & tanggal setor", "Pengurus setujui", "Aktif — auto-debit tiap bulan", "Anggota ajukan berhenti (opsional)", "Pengurus setujui berhenti"]),
            ]),

        new("Katalog",
            "Toko koperasi — baik barang milik koperasi sendiri maupun barang titipan anggota.",
            [
                "Kelola produk milik koperasi sendiri (tambah, ubah harga & stok) di panel \"Tambah produk koperasi\".",
                "Anggota bisa menitipkan barang untuk dijual lewat katalog — setujui/tolak di panel \"Pengajuan titipan anggota\"; menyetujui akan langsung memasukkannya ke katalog aktif.",
                "Setujui transaksi pembelian anggota — metode Tunai langsung berstatus \"Selesai\" (kas & stok berkurang seketika), sedangkan Kredit (potong gaji) membuat Tagihan Kredit baru berstatus \"Belum\".",
                "Kelola Tagihan Kredit di panel \"Rekap tagihan kredit\": tandai lunas satu-satu atau sekaligus semua, SETELAH pengurus mengonfirmasi potongan gajinya benar-benar sudah dieksekusi oleh bagian penggajian — bukan sebelum itu.",
            ],
            null, false,
            [
                new("Alur Pembelian Kredit (Potong Gaji)", ["Anggota beli produk metode Kredit", "Tagihan Kredit berstatus Belum", "Potong gaji dieksekusi bagian SDM", "Pengurus tandai Lunas"]),
            ]),

        new("Akuntansi & Keuangan",
            "\"Dapur\" koperasi — semua transaksi di menu lain otomatis tercatat di sini sebagai jurnal, mengikuti prinsip akuntansi standar.",
            [
                "Tab \"Jurnal Umum\" — riwayat semua jurnal (otomatis dari transaksi + manual). Setiap jurnal minimal 2 baris (Debit & Kredit) dan totalnya harus sama persis.",
                "Tab \"Neraca\" — posisi keuangan koperasi pada SATU TANGGAL tertentu: Aset harus selalu sama dengan Liabilitas ditambah Ekuitas. Kalau Selisih ≠ Rp 0, itu tandanya ada yang tidak beres.",
                "Tab \"Hasil Usaha\" (dulu disebut Laba Rugi) — kinerja koperasi selama SATU RENTANG WAKTU: Pendapatan dikurangi Beban dalam periode itu saja. Hasil akhirnya (SHU/Laba Bersih) mengalir jadi bagian Ekuitas di Neraca.",
                "Tab \"Arus Kas\" — mutasi kas masuk/keluar pada rentang tanggal, hanya melacak satu akun (Kas) — jangan cuma andalkan Arus Kas untuk menilai kesehatan keuangan koperasi.",
                "Tab \"SHU\" — kalkulator Sisa Hasil Usaha dengan kebijakan pembagian 2 lapis sesuai RAT: Lapis 1 memecah Total SHU jadi Anggota/Pengurus/Cadangan (default 40/20/40); Lapis 2 memecah porsi Anggota jadi Jasa Modal (JMA)/Jasa Usaha (JUA) (default 30/70). PPh SHU (15%) hanya dipotong dari bagian yang diterima anggota. Klik \"Hitung (pratinjau)\" dulu sebelum \"Finalisasi\" (tidak bisa dibatalkan).",
                "Tab \"Bagan Akun\" — daftar akun akuntansi standar; boleh menambah akun baru non-sistem kalau ada kategori transaksi yang belum tertampung.",
            ],
            "Neraca yang tidak balance seharusnya TIDAK PERNAH terjadi kalau semua transaksi lewat aplikasi — kalau muncul, itu sinyal alarm, bukan hal yang wajar dibiarkan.",
            false),

        new("E-RAT & Dokumen",
            "Rapat Anggota Tahunan secara digital — voting, arsip dokumen resmi, dan laporan RAT otomatis.",
            [
                "Tab \"Voting Agenda\" — buat agenda voting, tambah/hapus pilihan, lalu tayangkan agar anggota bisa memberi suara lewat aplikasi. Tutup agenda setelah selesai untuk mengunci hasilnya.",
                "Tab \"Dokumen RAT\" — unggah dan kelola arsip dokumen PDF yang bisa diunduh anggota; hanya dokumen tahun terbaru yang tampil menonjol di aplikasi anggota.",
                "Tab \"Laporan RAT (Otomatis)\" — laporan RAT yang dibuat otomatis dari data sistem (Neraca, Hasil Usaha, keanggotaan, pembagian SHU tahun itu). Anda hanya perlu melengkapi narasi manual lewat mode \"Edit konten & RAB\".",
                "Begitu semua kelengkapan terisi (termasuk SHU tahun itu sudah difinalisasi), tombol \"Tayangkan ke Anggota\" akan aktif — klik untuk mempublikasikan laporan langsung ke aplikasi anggota. Tombol \"Cetak / Simpan PDF\" tetap tersedia untuk versi cetaknya.",
            ],
            null, false),

        new("Akun & Peran Pengguna",
            "Khusus Admin — kelola siapa saja yang punya akses ke sistem dan sebagai apa.",
            [
                "Lihat semua akun, aktifkan/nonaktifkan login seseorang.",
                "Ubah peran pengguna: Admin, Pengurus, atau Anggota (tidak bisa menurunkan/menonaktifkan satu-satunya Admin yang tersisa).",
                "Reset akses (password) anggota yang lupa password — sistem membuatkan password sementara untuk disampaikan langsung.",
                "Impor/ekspor data anggota massal lewat CSV — berguna untuk migrasi data awal atau backup berkala.",
            ],
            null, true),

        new("Audit Trail",
            "Khusus Admin — jejak digital setiap perubahan data sensitif, untuk transparansi dan pengawasan.",
            [
                "Tab \"Aktivitas aplikasi\" — mencatat siapa melakukan apa LEWAT admin console (persetujuan, perubahan peran, finalisasi SHU, dll), bisa difilter per modul.",
                "Tab \"Log database (mentah)\" — lapisan kedua yang berjalan langsung di level database (lewat trigger SQL Server), mencatat perubahan apa pun jalurnya, termasuk kalau ada yang mengedit data langsung lewat tool database tanpa lewat aplikasi.",
                "Setiap baris log database saling terhubung lewat rantai hash — kalau ada yang mencoba mengubah/menghapus riwayat log itu sendiri, rantainya akan \"putus\" dan ketahuan.",
                "Klik tombol \"Verifikasi integritas\" untuk menghitung ulang seluruh rantai hash dan memastikan tidak ada baris yang dimanipulasi setelah tercatat.",
            ],
            null, true),
    ];

    private static void GambarAlur(ColumnDescriptor sec, string judul, string[] langkah)
    {
        sec.Item().PaddingLeft(16).PaddingTop(8).Text(judul).FontSize(9.5f).Bold().FontColor(Colors.Teal.Darken2);
        sec.Item().PaddingLeft(16).PaddingTop(4).Row(row =>
        {
            for (var i = 0; i < langkah.Length; i++)
            {
                row.RelativeItem().Border(1).BorderColor(Colors.Teal.Lighten2).Background(Colors.Teal.Lighten5)
                    .CornerRadius(4).Padding(6).MinHeight(46).Column(box =>
                    {
                        box.Item().Text($"{i + 1}").FontSize(8).Bold().FontColor(Colors.Teal.Darken3);
                        box.Item().PaddingTop(2).Text(langkah[i]).FontSize(7.5f).FontColor(Colors.Teal.Darken4);
                    });

                if (i < langkah.Length - 1)
                    row.ConstantItem(14).AlignMiddle().AlignCenter().Text(">").FontSize(13).Bold().FontColor(Colors.Grey.Medium);
            }
        });
    }

    public static byte[] Buat()
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10.5f));

                page.Header().Column(col => KoperasiPdfHeader.Gambar(col, "Manual Book — Panduan Pengurus & Admin"));

                page.Content().PaddingTop(15).Column(col =>
                {
                    col.Spacing(14);

                    col.Item().Text(
                        "Dokumen ini merangkum alur kerja utama Admin Console KKCS untuk pengurus & admin koperasi. " +
                        $"Dicetak otomatis dari sistem pada {DateTime.Now:dd MMMM yyyy}."
                    ).FontSize(9.5f).FontColor(Colors.Grey.Darken1).Italic().Justify();

                    var nomor = 1;
                    foreach (var modul in Modules)
                    {
                        col.Item().Column(sec =>
                        {
                            sec.Item().Row(row =>
                            {
                                row.AutoItem().Text($"{nomor}. ").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                                row.RelativeItem().Text(text =>
                                {
                                    text.Span(modul.Judul).FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                                    if (modul.AdminOnly) text.Span("  [Khusus Admin]").FontSize(9).FontColor(Colors.Grey.Medium);
                                });
                            });
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

                            if (modul.Diagram is not null)
                            {
                                foreach (var alur in modul.Diagram)
                                    GambarAlur(sec, alur.Judul, alur.Langkah);
                            }

                            if (modul.Tips is not null)
                            {
                                sec.Item().PaddingLeft(16).PaddingTop(6).Background(Colors.Amber.Lighten4).Padding(8).Text(text =>
                                {
                                    text.Justify();
                                    text.Span("Tips: ").Bold().FontColor(Colors.Amber.Darken3);
                                    text.Span(modul.Tips).FontColor(Colors.Amber.Darken3);
                                });
                            }
                        });
                        nomor++;
                    }
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Manual Book Pengurus — KKCS").FontSize(8).FontColor(Colors.Grey.Medium);
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
