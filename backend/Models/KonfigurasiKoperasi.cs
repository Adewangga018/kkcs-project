public class KonfigurasiKoperasi
{
    public int Id { get; set; }

    // Saldo awal Simpanan Pokok yang dikreditkan saat pendaftaran anggota disetujui.
    public decimal SimpananPokokNominal { get; set; } = 100_000m;

    // Nominal Simpanan Wajib yang ditagih otomatis setiap bulan.
    public decimal SimpananWajibNominal { get; set; } = 50_000m;

    // Tanggal jatuh tempo tagihan Simpanan Wajib tiap bulan.
    public int TanggalTagihWajib { get; set; } = 25;

    public DateTime DiperbaruiPada { get; set; } = DateTime.UtcNow;
}
