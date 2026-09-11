public class AkunAkuntansi
{
    public int Id { get; set; }

    public string Kode { get; set; } = string.Empty;

    public string Nama { get; set; } = string.Empty;

    // Aset | Liabilitas | Ekuitas | Pendapatan | Beban
    public string Tipe { get; set; } = string.Empty;

    // Debit | Kredit — sisi yang menambah saldo akun ini.
    public string SaldoNormal { get; set; } = string.Empty;

    // Akun bawaan sistem yang dipakai posting otomatis — tidak boleh dihapus.
    public bool Sistem { get; set; }

    public bool Aktif { get; set; } = true;

    public DateTime DibuatPada { get; set; } = DateTime.UtcNow;

    public ICollection<JurnalBaris> Baris { get; set; } = new List<JurnalBaris>();
}
