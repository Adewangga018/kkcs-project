using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

/// <summary>
/// Menandatangani baris data yang dihasilkan endpoint "preview" migrasi, supaya endpoint "komit"
/// bisa memastikan nominal yang dikirim persis sama dengan yang baru saja diuraikan dari file Excel
/// yang diunggah — bukan angka yang disusun ulang/diubah di sisi klien sebelum dikirim.
/// </summary>
public class MigrasiSignatureService(IConfiguration configuration)
{
    private readonly byte[] _key = Encoding.UTF8.GetBytes(
        configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key belum dikonfigurasi."));

    public string Tandatangani<T>(T data)
    {
        var json = JsonSerializer.Serialize(data);
        var hash = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(json));
        return Convert.ToHexString(hash);
    }

    public bool Verifikasi<T>(T data, string? signature)
    {
        if (string.IsNullOrWhiteSpace(signature)) return false;
        var expected = Tandatangani(data);
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(signature.Trim()));
    }
}
