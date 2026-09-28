using Microsoft.EntityFrameworkCore;

public class KkcsDbContext(DbContextOptions<KkcsDbContext> options) : DbContext(options)
{
	public DbSet<Anggota> Anggota => Set<Anggota>();
	public DbSet<Pengguna> Pengguna => Set<Pengguna>();
	public DbSet<JenisSimpanan> JenisSimpanan => Set<JenisSimpanan>();
	public DbSet<Simpanan> Simpanan => Set<Simpanan>();
	public DbSet<MutasiSimpanan> MutasiSimpanan => Set<MutasiSimpanan>();
	public DbSet<PengajuanPinjaman> PengajuanPinjaman => Set<PengajuanPinjaman>();
	public DbSet<Pinjaman> Pinjaman => Set<Pinjaman>();
	public DbSet<AngsuranPinjaman> AngsuranPinjaman => Set<AngsuranPinjaman>();
	public DbSet<PembayaranPinjaman> PembayaranPinjaman => Set<PembayaranPinjaman>();
	public DbSet<Produk> Produk => Set<Produk>();
	public DbSet<PembelianProduk> PembelianProduk => Set<PembelianProduk>();
	public DbSet<TagihanKredit> TagihanKredit => Set<TagihanKredit>();
	public DbSet<AngsuranTagihanKredit> AngsuranTagihanKredit => Set<AngsuranTagihanKredit>();
	public DbSet<EratAgenda> EratAgenda => Set<EratAgenda>();
	public DbSet<EratOpsi> EratOpsi => Set<EratOpsi>();
	public DbSet<EratSuara> EratSuara => Set<EratSuara>();
	public DbSet<LaporanTahunan> LaporanTahunan => Set<LaporanTahunan>();
	public DbSet<KonfigurasiKoperasi> KonfigurasiKoperasi => Set<KonfigurasiKoperasi>();
	public DbSet<TagihanWajib> TagihanWajib => Set<TagihanWajib>();
	public DbSet<TransaksiSukarela> TransaksiSukarela => Set<TransaksiSukarela>();
	public DbSet<SukarelaRutin> SukarelaRutin => Set<SukarelaRutin>();
	public DbSet<ProdukBerjangka> ProdukBerjangka => Set<ProdukBerjangka>();
	public DbSet<SimpananBerjangka> SimpananBerjangka => Set<SimpananBerjangka>();
	public DbSet<PostingBungaSukarela> PostingBungaSukarela => Set<PostingBungaSukarela>();
	public DbSet<AkunAkuntansi> AkunAkuntansi => Set<AkunAkuntansi>();
	public DbSet<JurnalEntri> JurnalEntri => Set<JurnalEntri>();
	public DbSet<JurnalBaris> JurnalBaris => Set<JurnalBaris>();
	public DbSet<ShuRun> ShuRun => Set<ShuRun>();
	public DbSet<ShuAnggota> ShuAnggota => Set<ShuAnggota>();
	public DbSet<AuditLog> AuditLog => Set<AuditLog>();
	// Tabel & trigger dikelola manual lewat migrasi TambahDbAuditTrail (raw SQL) — dikecualikan dari
	// migrasi EF (ExcludeFromMigrations) supaya `dotnet ef migrations add` tidak mencoba membuat/mengubahnya.
	public DbSet<DbAuditLogEntry> DbAuditLog => Set<DbAuditLogEntry>();
	public DbSet<ProfilKoperasi> ProfilKoperasi => Set<ProfilKoperasi>();
	public DbSet<RatTahunan> RatTahunan => Set<RatTahunan>();

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
			// Tabel punya trigger audit (lihat migrasi TambahDbAuditTrail) — SQL Server melarang klausa
			// OUTPUT tanpa INTO pada tabel yang punya trigger aktif, jadi EF Core harus dimatikan dari
			// memakainya untuk INSERT/UPDATE (dia akan fallback ke SELECT terpisah bila perlu nilai balik).
			entity.ToTable(tb => tb.UseSqlOutputClause(false));
			entity.HasKey(pengguna => pengguna.Id);
			entity.HasIndex(pengguna => pengguna.NomorIndukKaryawan).IsUnique();
			entity.Property(pengguna => pengguna.NamaLengkap).HasMaxLength(150).IsRequired();
			entity.Property(pengguna => pengguna.NomorIndukKaryawan).HasMaxLength(30).IsRequired();
			entity.Property(pengguna => pengguna.Peran).HasMaxLength(30).IsRequired().HasDefaultValue("Anggota");
			entity.Property(pengguna => pengguna.StatusKeanggotaan).HasMaxLength(30).IsRequired().HasDefaultValue("Aktif");
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
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorRekening).IsUnique();
			entity.Property(item => item.NomorRekening).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Saldo).HasPrecision(18, 2);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
			entity.HasOne(item => item.JenisSimpanan).WithMany(item => item.Simpanan).HasForeignKey(item => item.JenisSimpananId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<MutasiSimpanan>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
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
			entity.Property(item => item.BungaTahunan).HasPrecision(5, 4);
			entity.Property(item => item.EstimasiCicilanBulanan).HasPrecision(18, 2);
			entity.Property(item => item.EstimasiTotalJasa).HasPrecision(18, 2);
			entity.Property(item => item.Tujuan).HasMaxLength(500).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.Property(item => item.SuratRekomendasiUrl).HasMaxLength(300);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<Pinjaman>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorPinjaman).IsUnique();
			entity.Property(item => item.NomorPinjaman).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Pokok).HasPrecision(18, 2);
			entity.Property(item => item.BungaTahunan).HasPrecision(5, 4);
			entity.Property(item => item.PokokPerBulan).HasPrecision(18, 2);
			entity.Property(item => item.JasaPerBulan).HasPrecision(18, 2);
			entity.Property(item => item.AngsuranPerBulan).HasPrecision(18, 2);
			entity.Property(item => item.SisaPokok).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
			entity.HasOne(item => item.Pengajuan).WithOne(item => item.Pinjaman).HasForeignKey<Pinjaman>(item => item.PengajuanPinjamanId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<AngsuranPinjaman>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PinjamanId, item.AngsuranKe });
			entity.Property(item => item.Pokok).HasPrecision(18, 2);
			entity.Property(item => item.Jasa).HasPrecision(18, 2);
			entity.Property(item => item.Total).HasPrecision(18, 2);
			entity.Property(item => item.JumlahDibayar).HasPrecision(18, 2);
			entity.Property(item => item.Jenis).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.HasOne(item => item.Pinjaman).WithMany(item => item.Angsuran).HasForeignKey(item => item.PinjamanId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<PembayaranPinjaman>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PinjamanId, item.Status });
			entity.Property(item => item.Jenis).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.JumlahDiajukan).HasPrecision(18, 2);
			entity.Property(item => item.JasaDibebaskan).HasPrecision(18, 2);
			entity.Property(item => item.Catatan).HasMaxLength(500);
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.Property(item => item.BuktiTransferUrl).HasMaxLength(300);
			entity.HasOne(item => item.Pinjaman).WithMany().HasForeignKey(item => item.PinjamanId).OnDelete(DeleteBehavior.Cascade);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<Produk>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Kode).IsUnique();
			entity.Property(item => item.Kode).HasMaxLength(30).IsRequired();
			entity.Property(item => item.Nama).HasMaxLength(150).IsRequired();
			entity.Property(item => item.Deskripsi).HasMaxLength(1000);
			entity.Property(item => item.Jenis).HasMaxLength(10).IsRequired();
			entity.Property(item => item.Harga).HasPrecision(18, 2);
			entity.Property(item => item.Stok).HasPrecision(18, 3);
			entity.Property(item => item.Satuan).HasMaxLength(20).IsRequired();
			entity.Property(item => item.FotoUrl).HasMaxLength(300);
			entity.Property(item => item.Sumber).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.HasOne(item => item.DiajukanOleh).WithMany().HasForeignKey(item => item.DiajukanOlehId).OnDelete(DeleteBehavior.SetNull);
			entity.HasData(
				new Produk { Id = 1, Kode = "PRD-BRSPRM5", Nama = "Beras Premium 5 kg", Jenis = "Jual", Harga = 78000, Stok = 0, Satuan = "paket", Sumber = "Koperasi", Status = "Disetujui", DiperbaruiPada = new DateTime(2026, 1, 1) },
				new Produk { Id = 2, Kode = "PRD-MNYK2", Nama = "Minyak Goreng 2 L", Jenis = "Jual", Harga = 36500, Stok = 0, Satuan = "botol", Sumber = "Koperasi", Status = "Disetujui", DiperbaruiPada = new DateTime(2026, 1, 1) },
				new Produk { Id = 3, Kode = "PRD-GULA1", Nama = "Gula Pasir 1 kg", Jenis = "Jual", Harga = 17000, Stok = 0, Satuan = "paket", Sumber = "Koperasi", Status = "Disetujui", DiperbaruiPada = new DateTime(2026, 1, 1) },
				// Produk placeholder untuk transaksi kredit hasil Import Migrasi Data Lama (item aslinya tidak
				// ada di katalog sistem baru) — Aktif=false supaya tidak pernah tampil di katalog anggota.
				new Produk { Id = 4, Kode = "PRD-MIGRASI", Nama = "Migrasi Data Lama", Jenis = "Jual", Harga = 0, Stok = 0, Satuan = "paket", Sumber = "Koperasi", Status = "Disetujui", Aktif = false, DiperbaruiPada = new DateTime(2026, 1, 1) });
		});

		modelBuilder.Entity<PembelianProduk>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorTransaksi).IsUnique();
			entity.Property(item => item.NomorTransaksi).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Jenis).HasMaxLength(10).IsRequired();
			entity.Property(item => item.Jumlah).HasPrecision(18, 3);
			entity.Property(item => item.HargaSatuan).HasPrecision(18, 2);
			entity.Property(item => item.Total).HasPrecision(18, 2);
			entity.Property(item => item.MetodePembayaran).HasMaxLength(10).IsRequired();
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Catatan).HasMaxLength(500);
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.HasOne(item => item.Produk).WithMany().HasForeignKey(item => item.ProdukId).OnDelete(DeleteBehavior.Restrict);
			entity.HasOne(item => item.Pembeli).WithMany().HasForeignKey(item => item.PembeliId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<TagihanKredit>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.PembelianProdukId).IsUnique();
			entity.Property(item => item.Total).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Keterangan).HasMaxLength(500);
			entity.Property(item => item.AngsuranPerBulan).HasPrecision(18, 2);
			entity.HasOne(item => item.Pembelian).WithOne(item => item.TagihanKredit).HasForeignKey<TagihanKredit>(item => item.PembelianProdukId).OnDelete(DeleteBehavior.Cascade);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<AngsuranTagihanKredit>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.TagihanKreditId, item.AngsuranKe });
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.JumlahDibayar).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.HasOne(item => item.TagihanKredit).WithMany(item => item.Angsuran).HasForeignKey(item => item.TagihanKreditId).OnDelete(DeleteBehavior.Cascade);
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
			entity.HasIndex(item => item.Tahun);
			entity.Property(item => item.Judul).HasMaxLength(200).IsRequired();
			entity.Property(item => item.Deskripsi).HasMaxLength(1000);
			entity.Property(item => item.FileUrl).HasMaxLength(500).IsRequired();
		});

		modelBuilder.Entity<KonfigurasiKoperasi>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.Property(item => item.SimpananPokokNominal).HasPrecision(18, 2);
			entity.Property(item => item.SimpananWajibNominal).HasPrecision(18, 2);
			entity.Property(item => item.BungaSukarelaTahunan).HasPrecision(5, 4);
			entity.Property(item => item.BungaDepositoTahunan).HasPrecision(5, 4);
			entity.Property(item => item.TarifPph).HasPrecision(5, 4);
			entity.Property(item => item.TarifPphShu).HasPrecision(5, 4);
			entity.HasData(new KonfigurasiKoperasi
			{
				Id = 1,
				SimpananPokokNominal = 100_000m,
				SimpananWajibNominal = 50_000m,
				TanggalTagihWajib = 25,
				BungaSukarelaTahunan = 0.025m,
				BungaDepositoTahunan = 0.045m,
				TarifPph = 0.20m,
				TarifPphShu = 0.15m,
				DiperbaruiPada = new DateTime(2026, 1, 1)
			});
		});

		modelBuilder.Entity<TagihanWajib>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PenggunaId, item.Periode }).IsUnique();
			entity.Property(item => item.Periode).HasMaxLength(7).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<TransaksiSukarela>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PenggunaId, item.Status });
			entity.Property(item => item.Jenis).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.Catatan).HasMaxLength(500);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.Property(item => item.BuktiTransferUrl).HasMaxLength(300);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<SukarelaRutin>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PenggunaId, item.Status });
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.Property(item => item.TerakhirDijalankanPeriode).HasMaxLength(7);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<ProdukBerjangka>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Nama).HasMaxLength(150).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
		});

		modelBuilder.Entity<SimpananBerjangka>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorSertifikat).IsUnique();
			entity.Property(item => item.NomorSertifikat).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.Status).HasMaxLength(20).IsRequired();
			entity.Property(item => item.CatatanReview).HasMaxLength(500);
			entity.Property(item => item.BungaDibayar).HasPrecision(18, 2);
			entity.Property(item => item.PajakBunga).HasPrecision(18, 2);
			entity.Property(item => item.BungaNeto).HasPrecision(18, 2);
			entity.Property(item => item.AlasanPencairan).HasMaxLength(500);
			entity.Property(item => item.BuktiTransferUrl).HasMaxLength(300);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Cascade);
			entity.HasOne(item => item.Produk).WithMany(item => item.SimpananBerjangka).HasForeignKey(item => item.ProdukBerjangkaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<PostingBungaSukarela>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.PenggunaId, item.Periode }).IsUnique();
			entity.Property(item => item.Periode).HasMaxLength(7).IsRequired();
			entity.Property(item => item.Nominal).HasPrecision(18, 2);
			entity.Property(item => item.BungaBruto).HasPrecision(18, 2);
			entity.Property(item => item.Pajak).HasPrecision(18, 2);
			entity.Property(item => item.BungaNeto).HasPrecision(18, 2);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<AkunAkuntansi>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Kode).IsUnique();
			entity.Property(item => item.Kode).HasMaxLength(20).IsRequired();
			entity.Property(item => item.Nama).HasMaxLength(150).IsRequired();
			entity.Property(item => item.Tipe).HasMaxLength(20).IsRequired();
			entity.Property(item => item.SaldoNormal).HasMaxLength(10).IsRequired();
			entity.HasData(
				new AkunAkuntansi { Id = 1, Kode = KodeAkun.Kas, Nama = "Kas & Bank", Tipe = "Aset", SaldoNormal = "Debit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 2, Kode = KodeAkun.PiutangPinjaman, Nama = "Piutang Pinjaman Anggota", Tipe = "Aset", SaldoNormal = "Debit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 3, Kode = KodeAkun.PiutangKreditProduk, Nama = "Piutang Kredit Produk (Potong Gaji)", Tipe = "Aset", SaldoNormal = "Debit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 4, Kode = "1-1400", Nama = "Persediaan Barang", Tipe = "Aset", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 5, Kode = KodeAkun.SimpananSukarela, Nama = "Simpanan Sukarela Anggota", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 6, Kode = KodeAkun.SimpananBerjangka, Nama = "Simpanan Berjangka Anggota", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 7, Kode = KodeAkun.UtangPph, Nama = "Utang PPh Ps 4(2) — Bunga Simpanan", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 8, Kode = KodeAkun.UtangShuAnggota, Nama = "Utang SHU ke Anggota", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 9, Kode = KodeAkun.SimpananPokok, Nama = "Simpanan Pokok (Modal Anggota)", Tipe = "Ekuitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 10, Kode = KodeAkun.SimpananWajib, Nama = "Simpanan Wajib (Modal Anggota)", Tipe = "Ekuitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 11, Kode = KodeAkun.ShuDitahan, Nama = "SHU Ditahan / Cadangan", Tipe = "Ekuitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 12, Kode = KodeAkun.PendapatanJasaPinjaman, Nama = "Pendapatan Jasa Pinjaman", Tipe = "Pendapatan", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 13, Kode = KodeAkun.PendapatanPenjualanProduk, Nama = "Pendapatan Penjualan & Sewa Produk", Tipe = "Pendapatan", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 14, Kode = "4-4300", Nama = "Pendapatan Lain-lain", Tipe = "Pendapatan", SaldoNormal = "Kredit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 15, Kode = KodeAkun.BebanBungaSukarela, Nama = "Beban Bunga Simpanan Sukarela", Tipe = "Beban", SaldoNormal = "Debit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 16, Kode = KodeAkun.BebanBungaBerjangka, Nama = "Beban Bunga Simpanan Berjangka", Tipe = "Beban", SaldoNormal = "Debit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 17, Kode = "5-5300", Nama = "Beban Pokok Penjualan", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 18, Kode = "5-5900", Nama = "Beban Operasional Lain (Gaji, Sewa, dll)", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 19, Kode = KodeAkun.UtangJasaPengurus, Nama = "Utang Jasa Pengurus, Pengawas & Admin (SHU)", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 20, Kode = KodeAkun.CadanganKoperasi, Nama = "Cadangan Koperasi", Tipe = "Ekuitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 21, Kode = "5-5910", Nama = "Beban Umum & Administrasi", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
				new AkunAkuntansi { Id = 22, Kode = "5-5920", Nama = "Beban Penyisihan Piutang Tak Tertagih", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			// Akun sementara penampung lawan-jurnal semua importer migrasi data lama (Simpanan Pokok/Wajib,
			// Pinjaman Aktif, Tagihan Kredit) — karena kas riilnya sudah tercatat lewat Import Neraca Awal,
			// bukan lewat importer per-anggota ini. Saldo akun ini idealnya NOL setelah semua importer migrasi
			// selesai dijalankan; kalau tidak nol berarti ada data yang belum lengkap/tidak cocok.
			new AkunAkuntansi { Id = 23, Kode = "3-3990", Nama = "Kliring Migrasi Data Lama", Tipe = "Ekuitas", SaldoNormal = "Kredit", Sistem = true, DibuatPada = new DateTime(2026, 1, 1) },
			// Piutang/utang ke pihak NON-anggota (bukan anggota koperasi, tidak lewat importer Pinjaman/Tagihan
			// Kredit yang mensyaratkan NIK terdaftar) — dipakai lewat Import Neraca Awal untuk kasus seperti
			// piutang/utang lama yang sudah disisihkan sejak awal tapi belum pernah dihapusbukukan.
			new AkunAkuntansi { Id = 24, Kode = "1-1500", Nama = "Piutang Non-Anggota", Tipe = "Aset", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			// Kontra-aset: dicatat di sisi KREDIT supaya mengurangi Total Aset (nilai bersih piutang jadi 0
			// kalau penyisihannya penuh), TANPA menghapus jejak nilai piutang aslinya dari pembukuan.
			new AkunAkuntansi { Id = 25, Kode = "1-1510", Nama = "Cadangan Penyisihan Piutang Tak Tertagih", Tipe = "Aset", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 26, Kode = "2-2700", Nama = "Utang Non-Anggota", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			// Pinjaman non-rutin/kasbon (campuran anggota & non-anggota) — dicatat agregat, terpisah dari
			// Piutang Pinjaman Anggota (yang khusus Pinjaman Rutin berjadwal lewat importer Pinjaman Aktif).
			new AkunAkuntansi { Id = 27, Kode = "1-1250", Nama = "Piutang Lain-lain", Tipe = "Aset", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 28, Kode = "2-2650", Nama = "Utang Lain-lain", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 29, Kode = "2-2660", Nama = "Biaya Yang Masih Harus Dibayar", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 30, Kode = "5-5400", Nama = "Beban Pokok Pinjaman (HPP)", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 31, Kode = "5-5930", Nama = "Beban di Luar Usaha", Tipe = "Beban", SaldoNormal = "Debit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) },
			new AkunAkuntansi { Id = 32, Kode = "2-2450", Nama = "Utang Pajak", Tipe = "Liabilitas", SaldoNormal = "Kredit", Sistem = false, DibuatPada = new DateTime(2026, 1, 1) });
		});

		modelBuilder.Entity<JurnalEntri>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.NomorJurnal).IsUnique();
			entity.HasIndex(item => item.Tanggal);
			entity.Property(item => item.NomorJurnal).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Keterangan).HasMaxLength(500).IsRequired();
			entity.Property(item => item.Sumber).HasMaxLength(20).IsRequired();
			entity.Property(item => item.ReferensiModul).HasMaxLength(40);
			entity.Property(item => item.ReferensiId).HasMaxLength(40);
			entity.HasOne(item => item.DicatatOleh).WithMany().HasForeignKey(item => item.DicatatOlehId).OnDelete(DeleteBehavior.SetNull);
		});

		modelBuilder.Entity<JurnalBaris>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Debit).HasPrecision(18, 2);
			entity.Property(item => item.Kredit).HasPrecision(18, 2);
			entity.Property(item => item.Keterangan).HasMaxLength(300);
			entity.HasOne(item => item.JurnalEntri).WithMany(item => item.Baris).HasForeignKey(item => item.JurnalEntriId).OnDelete(DeleteBehavior.Cascade);
			entity.HasOne(item => item.Akun).WithMany(item => item.Baris).HasForeignKey(item => item.AkunId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<ShuRun>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Tahun).IsUnique();
			entity.Property(item => item.TotalShu).HasPrecision(18, 2);
			entity.Property(item => item.TotalPajak).HasPrecision(18, 2);
			entity.Property(item => item.TotalShuNeto).HasPrecision(18, 2);
			entity.Property(item => item.PersenAnggota).HasPrecision(5, 4);
			entity.Property(item => item.PersenJasaModal).HasPrecision(5, 4);
			entity.Property(item => item.PersenJasaUsaha).HasPrecision(5, 4);
			entity.Property(item => item.PersenPengurus).HasPrecision(5, 4);
			entity.Property(item => item.PersenCadangan).HasPrecision(5, 4);
			entity.Property(item => item.JasaPengurusPool).HasPrecision(18, 2);
			entity.Property(item => item.CadanganAmount).HasPrecision(18, 2);
			entity.Property(item => item.TotalSimpananSemuaAnggota).HasPrecision(18, 2);
			entity.Property(item => item.TotalTransaksiSemuaAnggota).HasPrecision(18, 2);
			entity.HasOne(item => item.DifinalisasiOleh).WithMany().HasForeignKey(item => item.DifinalisasiOlehId).OnDelete(DeleteBehavior.SetNull);
		});

		modelBuilder.Entity<ShuAnggota>(entity =>
		{
			entity.ToTable(tb => tb.UseSqlOutputClause(false)); // ada trigger audit — lihat catatan di Pengguna di atas
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => new { item.ShuRunId, item.PenggunaId }).IsUnique();
			entity.Property(item => item.SimpananAnggota).HasPrecision(18, 2);
			entity.Property(item => item.TransaksiAnggota).HasPrecision(18, 2);
			entity.Property(item => item.JasaPinjamanAnggota).HasPrecision(18, 2);
			entity.Property(item => item.BelanjaAnggota).HasPrecision(18, 2);
			entity.Property(item => item.Jma).HasPrecision(18, 2);
			entity.Property(item => item.Jua).HasPrecision(18, 2);
			entity.Property(item => item.TotalShu).HasPrecision(18, 2);
			entity.Property(item => item.Pajak).HasPrecision(18, 2);
			entity.Property(item => item.TotalShuNeto).HasPrecision(18, 2);
			entity.HasOne(item => item.ShuRun).WithMany(item => item.Rincian).HasForeignKey(item => item.ShuRunId).OnDelete(DeleteBehavior.Cascade);
			entity.HasOne(item => item.Pengguna).WithMany().HasForeignKey(item => item.PenggunaId).OnDelete(DeleteBehavior.Restrict);
		});

		modelBuilder.Entity<AuditLog>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.WaktuUtc);
			entity.HasIndex(item => item.Modul);
			entity.Property(item => item.PelakuNama).HasMaxLength(150).IsRequired();
			entity.Property(item => item.PelakuPeran).HasMaxLength(30).IsRequired();
			entity.Property(item => item.Modul).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Aksi).HasMaxLength(40).IsRequired();
			entity.Property(item => item.Ringkasan).HasMaxLength(500).IsRequired();
			entity.Property(item => item.Detail).HasMaxLength(2000);
			entity.Property(item => item.AlamatIp).HasMaxLength(50);
		});

		modelBuilder.Entity<DbAuditLogEntry>(entity =>
		{
			entity.ToTable("DbAuditLog", t => t.ExcludeFromMigrations());
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Tabel).HasMaxLength(60);
			entity.Property(item => item.Operasi).HasMaxLength(10);
			entity.Property(item => item.KunciPrimer).HasMaxLength(50);
			entity.Property(item => item.DbLogin).HasMaxLength(128);
			entity.Property(item => item.AppName).HasMaxLength(128);
			entity.Property(item => item.HostName).HasMaxLength(128);
			entity.Property(item => item.PrevHash).HasMaxLength(64);
			entity.Property(item => item.Hash).HasMaxLength(64);
		});

		modelBuilder.Entity<ProfilKoperasi>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.Property(item => item.Visi).HasMaxLength(1000).IsRequired();
			entity.Property(item => item.Misi).HasMaxLength(2000).IsRequired();
			entity.Property(item => item.AlamatKantor).HasMaxLength(300);
			entity.Property(item => item.NomorAktaPendirian).HasMaxLength(100);
			entity.HasData(new ProfilKoperasi
			{
				Id = 1,
				Visi = "Mendorong ekspansi usaha koperasi sehingga menjadi koperasi yang mandiri dan tangguh berlandaskan amanah dalam membangun ekonomi bersama dan berkeadilan demi kesejahteraan Anggota.",
				Misi = "A. Melaksanakan amanat AD/ART untuk melayani Anggota sebagai prioritas utama.\nB. Mengembangkan unit usaha yang sudah berjalan dan mengembangkan usaha baru.\nC. Bekerjasama dengan mitra usaha dan atau Lembaga Keuangan untuk memperkuat permodalan.\nD. Bersama dengan pihak-pihak berkepentingan mewujudkan kesejahteraan Anggota.",
				AlamatKantor = "JL KIG RAYA SELATAN A-5, GRESIK 61121",
				TanggalDidirikan = new DateTime(2009, 7, 24),
				NomorAktaPendirian = "160/BN/XVI.6/VI/2010",
				TanggalAkta = new DateTime(2010, 6, 4),
				DiperbaruiPada = new DateTime(2026, 1, 1)
			});
		});

		modelBuilder.Entity<RatTahunan>(entity =>
		{
			entity.HasKey(item => item.Id);
			entity.HasIndex(item => item.Tahun).IsUnique();
			entity.Property(item => item.KegiatanBisnis).HasMaxLength(4000);
			entity.Property(item => item.KegiatanSosial).HasMaxLength(4000);
			entity.Property(item => item.RencanaBisnisTahunDepan).HasMaxLength(4000);
			entity.Property(item => item.RencanaSosialTahunDepan).HasMaxLength(4000);
			entity.Property(item => item.CatatanTambahan).HasMaxLength(2000);
			entity.Property(item => item.RabPendapatanPinjaman).HasPrecision(18, 2);
			entity.Property(item => item.RabPendapatanLain).HasPrecision(18, 2);
			entity.Property(item => item.RabBebanOperasional).HasPrecision(18, 2);
			entity.Property(item => item.RabBebanUmum).HasPrecision(18, 2);
			entity.Property(item => item.RabCadanganPiutang).HasPrecision(18, 2);
			entity.Property(item => item.RealisasiPajakShu).HasPrecision(18, 2);
		});
	}
}
