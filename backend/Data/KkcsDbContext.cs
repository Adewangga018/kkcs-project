using Microsoft.EntityFrameworkCore;

public class KkcsDbContext(DbContextOptions<KkcsDbContext> options) : DbContext(options)
{
	public DbSet<Anggota> Anggota => Set<Anggota>();
	public DbSet<Pengguna> Pengguna => Set<Pengguna>();
	public DbSet<JenisSimpanan> JenisSimpanan => Set<JenisSimpanan>();
	public DbSet<Simpanan> Simpanan => Set<Simpanan>();
	public DbSet<MutasiSimpanan> MutasiSimpanan => Set<MutasiSimpanan>();
	public DbSet<PengajuanPinjaman> PengajuanPinjaman => Set<PengajuanPinjaman>();
	public DbSet<Produk> Produk => Set<Produk>();
	public DbSet<EratAgenda> EratAgenda => Set<EratAgenda>();
	public DbSet<EratOpsi> EratOpsi => Set<EratOpsi>();
	public DbSet<EratSuara> EratSuara => Set<EratSuara>();
	public DbSet<LaporanTahunan> LaporanTahunan => Set<LaporanTahunan>();

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
			entity.Property(pengguna => pengguna.Peran).HasMaxLength(30).IsRequired().HasDefaultValue("Anggota");
			entity.Property(pengguna => pengguna.Email).HasMaxLength(150);
			entity.Property(pengguna => pengguna.NomorTelepon).HasMaxLength(30);
			entity.Property(pengguna => pengguna.FotoUrl).HasMaxLength(300);
			entity.Property(pengguna => pengguna.PasswordHash).HasMaxLength(60).IsRequired();
		});

		modelBuilder.Entity<JenisSimpanan>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Kode).IsUnique();
			entity.Property(item => item.Kode).HasMaxLength(30).IsRequired();
			entity.Property(item => item.Nama).HasMaxLength(100).IsRequired();
			entity.Property(item => item.Deskripsi).HasMaxLength(300);
			entity.HasData(
				new JenisSimpanan { Id = 1, Kode = "POKOK", Nama = "Simpanan Pokok", Deskripsi = "Simpanan awal keanggotaan." },
				new JenisSimpanan { Id = 2, Kode = "WAJIB", Nama = "Simpanan Wajib", Deskripsi = "Simpanan berkala anggota." },
				new JenisSimpanan { Id = 3, Kode = "SUKARELA", Nama = "Simpanan Sukarela", Deskripsi = "Simpanan tambahan sesuai kemampuan anggota." },
				new JenisSimpanan { Id = 4, Kode = "BERJANGKA", Nama = "Simpanan Berjangka", Deskripsi = "Simpanan dengan jangka waktu tertentu." });
		});

		modelBuilder.Entity<Simpanan>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorRekening).IsUnique();
			entity.Property(item => item.NomorRekening).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Saldo).HasPrecision(18, 2);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
			entity.HasOne(item => item.JenisSimpanan).WithMany(item => item.Simpanan).HasForeignKey(item => item.JenisSimpananId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<MutasiSimpanan>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Jenis).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.SaldoSetelah).HasPrecision(18, 2);
			entity.Property(item => item.Keterangan).HasMaxLength(300);
			entity.HasOne(item => item.Simpanan).WithMany(item => item.Mutasi).HasForeignKey(item => item.SimpananId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<PengajuanPinjaman>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorPengajuan).IsUnique();
			entity.Property(item => item.NomorPengajuan).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.BungaBulanan).HasPrecision(5, 4);
			entity.Property(item => item.EstimasiCicilanBulanan).HasPrecision(18, 2);
			entity.Property(item => item.Tujuan).HasMaxLength(500).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<Produk>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Kode).IsUnique();
			entity.Property(item => item.Kode).HasMaxLength(30).IsRequired();
			entity.Property(item => item.Nama).HasMaxLength(150).IsRequired();
			entity.Property(item => item.Harga).HasPrecision(18, 2);
			entity.Property(item => item.Stok).HasPrecision(18, 3);
			entity.Property(item => item.Satuan).HasMaxLength(20).IsRequired();
			entity.HasData(
				new Produk { Id = 1, Kode = "PRD-BRSPRM5", Nama = "Beras Premium 5 kg", Harga = 78000, Stok = 0, Satuan = "paket", DiperbaruiPada = new DateTime(2026, 1, 1) },
				new Produk { Id = 2, Kode = "PRD-MNYK2", Nama = "Minyak Goreng 2 L", Harga = 36500, Stok = 0, Satuan = "botol", DiperbaruiPada = new DateTime(2026, 1, 1) },
				new Produk { Id = 3, Kode = "PRD-GULA1", Nama = "Gula Pasir 1 kg", Harga = 17000, Stok = 0, Satuan = "paket", DiperbaruiPada = new DateTime(2026, 1, 1) });
		});

		modelBuilder.Entity<EratAgenda>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Judul).HasMaxLength(200).IsRequired();
			entity.Property(item => item.Deskripsi).HasMaxLength(2000);
			entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
		});

		modelBuilder.Entity<EratOpsi>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Label).HasMaxLength(100).IsRequired();
			entity.HasOne(item => item.EratAgenda).WithMany(item => item.Opsi).HasForeignKey(item => item.EratAgendaId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<EratSuara>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.EratAgendaId, item.PenggunaId }).IsUnique();
			entity.HasOne(item => item.EratAgenda).WithMany(item => item.Suara).HasForeignKey(item => item.EratAgendaId).OnDelete(DeleteBehavior.NoAction);
			entity.HasOne(item => item.EratOpsi).WithMany(item => item.Suara).HasForeignKey(item => item.EratOpsiId).OnDelete(DeleteBehavior.NoAction);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<LaporanTahunan>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Tahun).IsUnique();
			entity.Property(item => item.Judul).HasMaxLength(200).IsRequired();
			entity.Property(item => item.FileUrl).HasMaxLength(500).IsRequired();
		});
	}
}
