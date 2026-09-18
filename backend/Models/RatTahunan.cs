/// <summary>
/// Konten manual per tahun buku untuk laporan RAT otomatis — narasi kegiatan usaha/sosial, rencana tahun
/// depan, dan target RAB (Rencana Anggaran Belanja) untuk kolom "Rencana" vs "Realisasi". Semua figur
/// keuangan REALISASI (Neraca, Laba Rugi, SHU) dihitung otomatis dari buku besar — tidak disimpan di sini,
/// hanya angka rencana/target yang memang kebijakan pengurus, bukan hasil transaksi.
/// </summary>
public class RatTahunan
{
    public int Id { get; set; }

    public int Tahun { get; set; }

    public string? KegiatanBisnis { get; set; }

    public string? KegiatanSosial { get; set; }

    public string? RencanaBisnisTahunDepan { get; set; }

    public string? RencanaSosialTahunDepan { get; set; }

    // Target RAB tahun ini, untuk kolom "Rencana" pembanding "Realisasi".
    public decimal? RabPendapatanPinjaman { get; set; }
    public decimal? RabPendapatanLain { get; set; }
    public decimal? RabBebanOperasional { get; set; }
    public decimal? RabBebanUmum { get; set; }
    public decimal? RabCadanganPiutang { get; set; }

    // Pajak penghasilan badan atas SHU — dihitung/dilaporkan pengurus sendiri (di luar cakupan PPh
    // simpanan anggota yang sudah otomatis), diisi manual setelah diketahui.
    public decimal? RealisasiPajakShu { get; set; }

    public string? CatatanTambahan { get; set; }

    public DateTime DiperbaruiPada { get; set; } = DateTime.UtcNow;

    // Ditayangkan ke aplikasi anggota begitu konten + SHU tahun ini lengkap — menggantikan alur
    // unggah PDF manual untuk laporan yang di-generate otomatis oleh sistem.
    public bool Dipublikasikan { get; set; }
    public DateTime? DipublikasikanPada { get; set; }
}
