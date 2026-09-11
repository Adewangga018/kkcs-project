/// <summary>
/// Baris hasil trigger SQL Server pada tabel finansial sensitif (lihat migrasi TambahDbAuditTrail) —
/// tercatat otomatis oleh mesin database untuk SETIAP perubahan, lewat API maupun lewat koneksi SQL
/// langsung (dBeaver/SSMS/dll). Kelas ini murni untuk baca (EF query); penulisan hanya lewat trigger,
/// bukan lewat kode C#, karena itu tabelnya dikecualikan dari migrasi EF (dikelola manual via SQL).
/// </summary>
public class DbAuditLogEntry
{
    public long Id { get; set; }
    public string Tabel { get; set; } = "";
    public string Operasi { get; set; } = "";
    public string KunciPrimer { get; set; } = "";
    public string? DataSebelum { get; set; }
    public string? DataSesudah { get; set; }
    public DateTime WaktuUtc { get; set; }
    public string DbLogin { get; set; } = "";
    public string? AppName { get; set; }
    public string? HostName { get; set; }
    public string PrevHash { get; set; } = "";
    public string Hash { get; set; } = "";
}
