using Microsoft.EntityFrameworkCore;

public class KkcsDbContext(DbContextOptions<KkcsDbContext> options) : DbContext(options)
{
	public DbSet<Anggota> Anggota => Set<Anggota>();
	public DbSet<Pengguna> Pengguna => Set<Pengguna>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Anggota>(entity =>
		{
			entity.HasKey(anggota => anggota.Id);
			entity.HasIndex(anggota => anggota.NomorAnggota).IsUnique();
			entity.Property(anggota => anggota.NomorAnggota).HasMaxLength(30).IsRequired();
			entity.Property(anggota => anggota.NamaLengkap).HasMaxLength(150).IsRequired();
			entity.Property(anggota => anggota.NomorIdentitas).HasMaxLength(50);
			entity.Property(anggota => anggota.Email).HasMaxLength(150);
			entity.Property(anggota => anggota.NomorTelepon).HasMaxLength(30);
		});

		modelBuilder.Entity<Pengguna>(entity =>
		{
			entity.HasKey(pengguna => pengguna.Id);
			entity.HasIndex(pengguna => pengguna.NomorIndukKaryawan).IsUnique();
			entity.Property(pengguna => pengguna.NamaLengkap).HasMaxLength(150).IsRequired();
			entity.Property(pengguna => pengguna.NomorIndukKaryawan).HasMaxLength(30).IsRequired();
			entity.Property(pengguna => pengguna.Email).HasMaxLength(150);
			entity.Property(pengguna => pengguna.NomorTelepon).HasMaxLength(30);
			entity.Property(pengguna => pengguna.FotoUrl).HasMaxLength(300);
			entity.Property(pengguna => pengguna.PasswordHash).HasMaxLength(60).IsRequired();
		});
	}
}
