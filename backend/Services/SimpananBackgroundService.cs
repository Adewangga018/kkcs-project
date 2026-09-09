using Microsoft.EntityFrameworkCore;

/// <summary>
/// Tugas latar belakang: (1) membuat tagihan Simpanan Wajib otomatis setiap bulan pada/melewati
/// tanggal jatuh tempo, dan (2) menandai Simpanan Berjangka yang telah melewati tanggal jatuh tempo.
/// Berjalan selama backend menyala; ada juga endpoint manual di Admin Console.
/// </summary>
public class SimpananBackgroundService(IServiceScopeFactory scopeFactory, ILogger<SimpananBackgroundService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await JalankanAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Gagal menjalankan tugas latar belakang simpanan.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    private async Task JalankanAsync(CancellationToken stoppingToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<KkcsDbContext>();

        var konfigurasi = await db.KonfigurasiKoperasi.FirstOrDefaultAsync(stoppingToken)
            ?? new KonfigurasiKoperasi { Id = 1 };

        if (DateTime.Now.Day >= konfigurasi.TanggalTagihWajib)
        {
            var dibuat = await TagihanWajibGenerator.GenerateAsync(db, konfigurasi, TagihanWajibGenerator.PeriodeSekarang());
            if (dibuat > 0) logger.LogInformation("Membuat {Jumlah} tagihan Simpanan Wajib periode {Periode}.", dibuat, TagihanWajibGenerator.PeriodeSekarang());
        }

        var jatuhTempo = await db.SimpananBerjangka
            .Where(item => item.Status == "Aktif" && item.TanggalJatuhTempo != null && item.TanggalJatuhTempo <= DateTime.Now)
            .ToListAsync(stoppingToken);
        foreach (var berjangka in jatuhTempo)
        {
            berjangka.Status = "JatuhTempo";
        }
        if (jatuhTempo.Count > 0) await db.SaveChangesAsync(stoppingToken);
    }
}
