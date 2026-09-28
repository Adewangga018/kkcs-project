SET NOCOUNT ON;
BEGIN TRY
BEGIN TRANSACTION;
UPDATE Pinjaman SET SisaPokok=16666666.67, AngsuranTerbayar=40 WHERE Id=178;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=178 AND AngsuranKe > 33 AND AngsuranKe <= 40;
UPDATE Pinjaman SET SisaPokok=2500000.0, AngsuranTerbayar=10 WHERE Id=179;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=179 AND AngsuranKe > 2 AND AngsuranKe <= 10;
UPDATE Pinjaman SET SisaPokok=16250000.0, AngsuranTerbayar=21 WHERE Id=180;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=180 AND AngsuranKe > 15 AND AngsuranKe <= 21;
UPDATE Pinjaman SET SisaPokok=21000000.0, AngsuranTerbayar=42 WHERE Id=181;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=181 AND AngsuranKe > 35 AND AngsuranKe <= 42;
UPDATE Pinjaman SET SisaPokok=14000000.0, AngsuranTerbayar=18 WHERE Id=187;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=187 AND AngsuranKe > 10 AND AngsuranKe <= 18;
UPDATE Pinjaman SET SisaPokok=26250000.0, AngsuranTerbayar=9 WHERE Id=190;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=190 AND AngsuranKe > 2 AND AngsuranKe <= 9;
UPDATE Pinjaman SET SisaPokok=17777777.78, AngsuranTerbayar=20 WHERE Id=191;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=191 AND AngsuranKe > 14 AND AngsuranKe <= 20;
UPDATE Pinjaman SET SisaPokok=8750000.0, AngsuranTerbayar=10 WHERE Id=192;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=192 AND AngsuranKe > 2 AND AngsuranKe <= 10;
UPDATE Pinjaman SET SisaPokok=30555555.56, AngsuranTerbayar=14 WHERE Id=195;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=195 AND AngsuranKe > 7 AND AngsuranKe <= 14;
UPDATE Pinjaman SET SisaPokok=2916666.67, AngsuranTerbayar=11 WHERE Id=196;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=196 AND AngsuranKe > 4 AND AngsuranKe <= 11;
UPDATE Pinjaman SET SisaPokok=16666666.67, AngsuranTerbayar=38 WHERE Id=197;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=197 AND AngsuranKe > 31 AND AngsuranKe <= 38;
UPDATE Pinjaman SET SisaPokok=46666666.67, AngsuranTerbayar=20 WHERE Id=198;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=198 AND AngsuranKe > 13 AND AngsuranKe <= 20;
UPDATE Pinjaman SET SisaPokok=15625000.0, AngsuranTerbayar=9 WHERE Id=199;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=199 AND AngsuranKe > 2 AND AngsuranKe <= 9;
UPDATE Pinjaman SET SisaPokok=15500000.0, AngsuranTerbayar=29 WHERE Id=200;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=200 AND AngsuranKe > 21 AND AngsuranKe <= 29;
UPDATE Pinjaman SET SisaPokok=9200000.0, AngsuranTerbayar=37 WHERE Id=201;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=201 AND AngsuranKe > 31 AND AngsuranKe <= 37;
UPDATE Pinjaman SET SisaPokok=16666666.67, AngsuranTerbayar=40 WHERE Id=202;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=202 AND AngsuranKe > 33 AND AngsuranKe <= 40;
UPDATE Pinjaman SET SisaPokok=3000000.0, AngsuranTerbayar=54 WHERE Id=203;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=203 AND AngsuranKe > 46 AND AngsuranKe <= 54;
UPDATE Pinjaman SET SisaPokok=5833333.33, AngsuranTerbayar=34 WHERE Id=204;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=204 AND AngsuranKe > 28 AND AngsuranKe <= 34;
UPDATE Pinjaman SET SisaPokok=36833333.33, AngsuranTerbayar=26 WHERE Id=205;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=205 AND AngsuranKe > 20 AND AngsuranKe <= 26;
UPDATE Pinjaman SET SisaPokok=20416666.67, AngsuranTerbayar=25 WHERE Id=206;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=206 AND AngsuranKe > 17 AND AngsuranKe <= 25;
UPDATE Pinjaman SET SisaPokok=35000000.0, AngsuranTerbayar=20 WHERE Id=207;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=207 AND AngsuranKe > 13 AND AngsuranKe <= 20;
UPDATE Pinjaman SET SisaPokok=47833333.33, AngsuranTerbayar=19 WHERE Id=211;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=211 AND AngsuranKe > 11 AND AngsuranKe <= 19;
UPDATE Pinjaman SET SisaPokok=81666666.67, AngsuranTerbayar=11 WHERE Id=213;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=213 AND AngsuranKe > 4 AND AngsuranKe <= 11;
UPDATE Pinjaman SET SisaPokok=8333333.33, AngsuranTerbayar=14 WHERE Id=214;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=214 AND AngsuranKe > 7 AND AngsuranKe <= 14;
UPDATE Pinjaman SET SisaPokok=53333333.33, AngsuranTerbayar=12 WHERE Id=216;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=216 AND AngsuranKe > 5 AND AngsuranKe <= 12;
UPDATE Pinjaman SET SisaPokok=14583333.33, AngsuranTerbayar=17 WHERE Id=217;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=217 AND AngsuranKe > 10 AND AngsuranKe <= 17;
UPDATE Pinjaman SET SisaPokok=8333333.33, AngsuranTerbayar=43 WHERE Id=218;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=218 AND AngsuranKe > 36 AND AngsuranKe <= 43;
UPDATE Pinjaman SET SisaPokok=58333333.33, AngsuranTerbayar=25 WHERE Id=220;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=220 AND AngsuranKe > 17 AND AngsuranKe <= 25;
UPDATE Pinjaman SET SisaPokok=555555.56, AngsuranTerbayar=35 WHERE Id=221;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=221 AND AngsuranKe > 29 AND AngsuranKe <= 35;
UPDATE Pinjaman SET SisaPokok=833333.33, AngsuranTerbayar=22 WHERE Id=226;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=226 AND AngsuranKe > 15 AND AngsuranKe <= 22;
UPDATE Pinjaman SET SisaPokok=30000000.0, AngsuranTerbayar=24 WHERE Id=228;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=228 AND AngsuranKe > 17 AND AngsuranKe <= 24;
UPDATE Pinjaman SET SisaPokok=36250000.0, AngsuranTerbayar=19 WHERE Id=229;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=229 AND AngsuranKe > 13 AND AngsuranKe <= 19;
UPDATE Pinjaman SET SisaPokok=5687500.0, AngsuranTerbayar=9 WHERE Id=230;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=230 AND AngsuranKe > 1 AND AngsuranKe <= 9;
UPDATE Pinjaman SET SisaPokok=56666666.67, AngsuranTerbayar=26 WHERE Id=231;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=231 AND AngsuranKe > 19 AND AngsuranKe <= 26;
UPDATE Pinjaman SET SisaPokok=5729166.67, AngsuranTerbayar=37 WHERE Id=234;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=234 AND AngsuranKe > 31 AND AngsuranKe <= 37;
UPDATE Pinjaman SET SisaPokok=18125000.0, AngsuranTerbayar=19 WHERE Id=235;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=235 AND AngsuranKe > 11 AND AngsuranKe <= 19;
UPDATE Pinjaman SET SisaPokok=50000000.0, AngsuranTerbayar=10 WHERE Id=236;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=236 AND AngsuranKe > 3 AND AngsuranKe <= 10;
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-07-07' WHERE Id=194;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=194 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=36, LunasPada='2026-02-06' WHERE Id=188;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=188 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=24, LunasPada='2026-02-06' WHERE Id=189;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=189 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-05-26' WHERE Id=183;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=183 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-05-26' WHERE Id=184;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=184 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-05-26' WHERE Id=185;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=185 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-05-26' WHERE Id=186;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=186 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-05-26' WHERE Id=182;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=182 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-04-09' WHERE Id=232;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=232 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=36, LunasPada='2026-07-02' WHERE Id=224;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=224 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-07-27' WHERE Id=212;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=212 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada='2026-03-27' WHERE Id=208;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=208 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=36, LunasPada=(SELECT JatuhTempo FROM AngsuranPinjaman WHERE PinjamanId=215 AND AngsuranKe=36) WHERE Id=215;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=215 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=24, LunasPada=(SELECT JatuhTempo FROM AngsuranPinjaman WHERE PinjamanId=222 AND AngsuranKe=24) WHERE Id=222;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=222 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada=(SELECT JatuhTempo FROM AngsuranPinjaman WHERE PinjamanId=209 AND AngsuranKe=60) WHERE Id=209;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=209 AND Status<>'Dibayar';
UPDATE Pinjaman SET Status='Lunas', SisaPokok=0, AngsuranTerbayar=60, LunasPada=(SELECT JatuhTempo FROM AngsuranPinjaman WHERE PinjamanId=210 AND AngsuranKe=60) WHERE Id=210;
UPDATE AngsuranPinjaman SET Status='Dibayar', JumlahDibayar=Total, DibayarPada=JatuhTempo WHERE PinjamanId=210 AND Status<>'Dibayar';

DECLARE @nik9001 NVARCHAR(50) = 'T.225315';
DECLARE @pid9001 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9001);
IF @pid9001 IS NULL THROW 51000, 'NIK tidak ditemukan: T.225315', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9001, 'PLJ-FA26-9001', 10000000.0, 12, 0.07, 891666.66, 699999.96, N'[Migrasi data lama]', 'Disetujui', '2026-05-06', '2026-05-06');
DECLARE @pengajuanId9001 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9001, @pengajuanId9001, 'PJM-FA26-9001', 10000000.0, 12, 0.07, 833333.33, 58333.33, 891666.66, 6666666.67, 4, '2026-05-06', 'Aktif', '2026-05-06');
DECLARE @pinjId9001 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9001 FROM (VALUES
  (833333.33,58333.33,891666.66,'2026-05-06',1,'Reguler','Dibayar',891666.66,'2026-05-06'),
  (833333.33,58333.33,891666.66,'2026-06-06',2,'Reguler','Dibayar',891666.66,'2026-06-06'),
  (833333.33,58333.33,891666.66,'2026-07-06',3,'Reguler','Dibayar',891666.66,'2026-07-06'),
  (833333.33,58333.33,891666.66,'2026-08-06',4,'Reguler','Dibayar',891666.66,'2026-08-06'),
  (833333.33,58333.33,891666.66,'2026-09-06',5,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2026-10-06',6,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2026-11-06',7,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2026-12-06',8,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2027-01-06',9,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2027-02-06',10,'Reguler','Belum',NULL,NULL),
  (833333.33,58333.33,891666.66,'2027-03-06',11,'Reguler','Belum',NULL,NULL),
  (833333.37,58333.33,891666.7,'2027-04-06',12,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9002 NVARCHAR(50) = 'T.213284';
DECLARE @pid9002 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9002);
IF @pid9002 IS NULL THROW 51000, 'NIK tidak ditemukan: T.213284', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9002, 'PLJ-FA26-9002', 50000000.0, 48, 0.08, 1375000.0, 15999999.84, N'[Migrasi data lama]', 'Disetujui', '2026-02-27', '2026-02-27');
DECLARE @pengajuanId9002 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9002, @pengajuanId9002, 'PJM-FA26-9002', 50000000.0, 48, 0.08, 1041666.67, 333333.33, 1375000.0, 43750000.0, 6, '2026-02-27', 'Aktif', '2026-02-27');
DECLARE @pinjId9002 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9002 FROM (VALUES
  (1041666.67,333333.33,1375000.0,'2026-03-01',1,'Reguler','Dibayar',1375000.0,'2026-03-01'),
  (1041666.67,333333.33,1375000.0,'2026-04-01',2,'Reguler','Dibayar',1375000.0,'2026-04-01'),
  (1041666.67,333333.33,1375000.0,'2026-05-01',3,'Reguler','Dibayar',1375000.0,'2026-05-01'),
  (1041666.67,333333.33,1375000.0,'2026-06-01',4,'Reguler','Dibayar',1375000.0,'2026-06-01'),
  (1041666.67,333333.33,1375000.0,'2026-07-01',5,'Reguler','Dibayar',1375000.0,'2026-07-01'),
  (1041666.67,333333.33,1375000.0,'2026-08-01',6,'Reguler','Dibayar',1375000.0,'2026-08-01'),
  (1041666.67,333333.33,1375000.0,'2026-09-01',7,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-10-01',8,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-11-01',9,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-12-01',10,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-01-01',11,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-02-01',12,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-03-01',13,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-04-01',14,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-05-01',15,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-06-01',16,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-07-01',17,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-08-01',18,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-09-01',19,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-10-01',20,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-11-01',21,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-12-01',22,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-01-01',23,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-02-01',24,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-03-01',25,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-04-01',26,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-05-01',27,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-06-01',28,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-07-01',29,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-08-01',30,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-09-01',31,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-10-01',32,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-11-01',33,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-12-01',34,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-01-01',35,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-02-01',36,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-03-01',37,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-04-01',38,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-05-01',39,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-06-01',40,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-07-01',41,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-08-01',42,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-09-01',43,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-10-01',44,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-11-01',45,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-12-01',46,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2030-01-01',47,'Reguler','Belum',NULL,NULL),
  (1041666.51,333333.33,1374999.84,'2030-02-01',48,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9003 NVARCHAR(50) = 'T.213284';
DECLARE @pid9003 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9003);
IF @pid9003 IS NULL THROW 51000, 'NIK tidak ditemukan: T.213284', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9003, 'PLJ-FA26-9003', 50000000.0, 48, 0.08, 1375000.0, 15999999.84, N'[Migrasi data lama]', 'Disetujui', '2026-03-17', '2026-03-17');
DECLARE @pengajuanId9003 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9003, @pengajuanId9003, 'PJM-FA26-9003', 50000000.0, 48, 0.08, 1041666.67, 333333.33, 1375000.0, 44791666.67, 5, '2026-03-17', 'Aktif', '2026-03-17');
DECLARE @pinjId9003 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9003 FROM (VALUES
  (1041666.67,333333.33,1375000.0,'2026-03-17',1,'Reguler','Dibayar',1375000.0,'2026-03-17'),
  (1041666.67,333333.33,1375000.0,'2026-04-17',2,'Reguler','Dibayar',1375000.0,'2026-04-17'),
  (1041666.67,333333.33,1375000.0,'2026-05-17',3,'Reguler','Dibayar',1375000.0,'2026-05-17'),
  (1041666.67,333333.33,1375000.0,'2026-06-17',4,'Reguler','Dibayar',1375000.0,'2026-06-17'),
  (1041666.67,333333.33,1375000.0,'2026-07-17',5,'Reguler','Dibayar',1375000.0,'2026-07-17'),
  (1041666.67,333333.33,1375000.0,'2026-08-17',6,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-09-17',7,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-10-17',8,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-11-17',9,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2026-12-17',10,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-01-17',11,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-02-17',12,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-03-17',13,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-04-17',14,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-05-17',15,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-06-17',16,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-07-17',17,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-08-17',18,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-09-17',19,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-10-17',20,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-11-17',21,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2027-12-17',22,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-01-17',23,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-02-17',24,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-03-17',25,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-04-17',26,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-05-17',27,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-06-17',28,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-07-17',29,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-08-17',30,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-09-17',31,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-10-17',32,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-11-17',33,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2028-12-17',34,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-01-17',35,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-02-17',36,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-03-17',37,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-04-17',38,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-05-17',39,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-06-17',40,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-07-17',41,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-08-17',42,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-09-17',43,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-10-17',44,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-11-17',45,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2029-12-17',46,'Reguler','Belum',NULL,NULL),
  (1041666.67,333333.33,1375000.0,'2030-01-17',47,'Reguler','Belum',NULL,NULL),
  (1041666.51,333333.33,1374999.84,'2030-02-17',48,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9004 NVARCHAR(50) = 'T.211279';
DECLARE @pid9004 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9004);
IF @pid9004 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211279', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9004, 'PLJ-FA26-9004', 100000000.0, 60, 0.085, 2375000.0, 42499999.8, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9004 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9004, @pengajuanId9004, 'PJM-FA26-9004', 100000000.0, 60, 0.085, 1666666.67, 708333.33, 2375000.0, 95000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9004 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9004 FROM (VALUES
  (1666666.67,708333.33,2375000.0,'2026-06-01',1,'Reguler','Dibayar',2375000.0,'2026-06-01'),
  (1666666.67,708333.33,2375000.0,'2026-07-01',2,'Reguler','Dibayar',2375000.0,'2026-07-01'),
  (1666666.67,708333.33,2375000.0,'2026-08-01',3,'Reguler','Dibayar',2375000.0,'2026-08-01'),
  (1666666.67,708333.33,2375000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (1666666.47,708333.33,2374999.8,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9005 NVARCHAR(50) = 'T.211275';
DECLARE @pid9005 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9005);
IF @pid9005 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211275', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9005, 'PLJ-FA26-9005', 20000000.0, 60, 0.085, 475000.0, 8500000.2, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9005 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9005, @pengajuanId9005, 'PJM-FA26-9005', 20000000.0, 60, 0.085, 333333.33, 141666.67, 475000.0, 19000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9005 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9005 FROM (VALUES
  (333333.33,141666.67,475000.0,'2026-06-01',1,'Reguler','Dibayar',475000.0,'2026-06-01'),
  (333333.33,141666.67,475000.0,'2026-07-01',2,'Reguler','Dibayar',475000.0,'2026-07-01'),
  (333333.33,141666.67,475000.0,'2026-08-01',3,'Reguler','Dibayar',475000.0,'2026-08-01'),
  (333333.33,141666.67,475000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (333333.53,141666.67,475000.2,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9006 NVARCHAR(50) = 'T.211275';
DECLARE @pid9006 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9006);
IF @pid9006 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211275', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9006, 'PLJ-FA26-9006', 20000000.0, 60, 0.085, 475000.0, 8500000.2, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9006 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9006, @pengajuanId9006, 'PJM-FA26-9006', 20000000.0, 60, 0.085, 333333.33, 141666.67, 475000.0, 19000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9006 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9006 FROM (VALUES
  (333333.33,141666.67,475000.0,'2026-06-01',1,'Reguler','Dibayar',475000.0,'2026-06-01'),
  (333333.33,141666.67,475000.0,'2026-07-01',2,'Reguler','Dibayar',475000.0,'2026-07-01'),
  (333333.33,141666.67,475000.0,'2026-08-01',3,'Reguler','Dibayar',475000.0,'2026-08-01'),
  (333333.33,141666.67,475000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (333333.53,141666.67,475000.2,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9007 NVARCHAR(50) = 'T.211275';
DECLARE @pid9007 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9007);
IF @pid9007 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211275', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9007, 'PLJ-FA26-9007', 20000000.0, 60, 0.085, 475000.0, 8500000.2, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9007 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9007, @pengajuanId9007, 'PJM-FA26-9007', 20000000.0, 60, 0.085, 333333.33, 141666.67, 475000.0, 19000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9007 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9007 FROM (VALUES
  (333333.33,141666.67,475000.0,'2026-06-01',1,'Reguler','Dibayar',475000.0,'2026-06-01'),
  (333333.33,141666.67,475000.0,'2026-07-01',2,'Reguler','Dibayar',475000.0,'2026-07-01'),
  (333333.33,141666.67,475000.0,'2026-08-01',3,'Reguler','Dibayar',475000.0,'2026-08-01'),
  (333333.33,141666.67,475000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (333333.53,141666.67,475000.2,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9008 NVARCHAR(50) = 'T.211275';
DECLARE @pid9008 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9008);
IF @pid9008 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211275', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9008, 'PLJ-FA26-9008', 20000000.0, 60, 0.085, 475000.0, 8500000.2, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9008 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9008, @pengajuanId9008, 'PJM-FA26-9008', 20000000.0, 60, 0.085, 333333.33, 141666.67, 475000.0, 19000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9008 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9008 FROM (VALUES
  (333333.33,141666.67,475000.0,'2026-06-01',1,'Reguler','Dibayar',475000.0,'2026-06-01'),
  (333333.33,141666.67,475000.0,'2026-07-01',2,'Reguler','Dibayar',475000.0,'2026-07-01'),
  (333333.33,141666.67,475000.0,'2026-08-01',3,'Reguler','Dibayar',475000.0,'2026-08-01'),
  (333333.33,141666.67,475000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (333333.53,141666.67,475000.2,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9009 NVARCHAR(50) = 'T.211275';
DECLARE @pid9009 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9009);
IF @pid9009 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211275', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9009, 'PLJ-FA26-9009', 20000000.0, 60, 0.085, 475000.0, 8500000.2, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9009 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9009, @pengajuanId9009, 'PJM-FA26-9009', 20000000.0, 60, 0.085, 333333.33, 141666.67, 475000.0, 19000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9009 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9009 FROM (VALUES
  (333333.33,141666.67,475000.0,'2026-06-01',1,'Reguler','Dibayar',475000.0,'2026-06-01'),
  (333333.33,141666.67,475000.0,'2026-07-01',2,'Reguler','Dibayar',475000.0,'2026-07-01'),
  (333333.33,141666.67,475000.0,'2026-08-01',3,'Reguler','Dibayar',475000.0,'2026-08-01'),
  (333333.33,141666.67,475000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (333333.33,141666.67,475000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (333333.53,141666.67,475000.2,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9010 NVARCHAR(50) = 'T.205239';
DECLARE @pid9010 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9010);
IF @pid9010 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205239', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9010, 'PLJ-FA26-9010', 30000000.0, 36, 0.075, 1020833.33, 6750000.0, N'[Migrasi data lama]', 'Disetujui', '2026-02-06', '2026-02-06');
DECLARE @pengajuanId9010 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9010, @pengajuanId9010, 'PJM-FA26-9010', 30000000.0, 36, 0.075, 833333.33, 187500.0, 1020833.33, 24166666.67, 7, '2026-02-06', 'Aktif', '2026-02-06');
DECLARE @pinjId9010 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9010 FROM (VALUES
  (833333.33,187500.0,1020833.33,'2026-02-06',1,'Reguler','Dibayar',1020833.33,'2026-02-06'),
  (833333.33,187500.0,1020833.33,'2026-03-06',2,'Reguler','Dibayar',1020833.33,'2026-03-06'),
  (833333.33,187500.0,1020833.33,'2026-04-06',3,'Reguler','Dibayar',1020833.33,'2026-04-06'),
  (833333.33,187500.0,1020833.33,'2026-05-06',4,'Reguler','Dibayar',1020833.33,'2026-05-06'),
  (833333.33,187500.0,1020833.33,'2026-06-06',5,'Reguler','Dibayar',1020833.33,'2026-06-06'),
  (833333.33,187500.0,1020833.33,'2026-07-06',6,'Reguler','Dibayar',1020833.33,'2026-07-06'),
  (833333.33,187500.0,1020833.33,'2026-08-06',7,'Reguler','Dibayar',1020833.33,'2026-08-06'),
  (833333.33,187500.0,1020833.33,'2026-09-06',8,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-10-06',9,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-11-06',10,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-12-06',11,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-01-06',12,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-02-06',13,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-03-06',14,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-04-06',15,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-05-06',16,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-06-06',17,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-07-06',18,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-08-06',19,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-09-06',20,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-10-06',21,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-11-06',22,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-12-06',23,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-01-06',24,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-02-06',25,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-03-06',26,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-04-06',27,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-05-06',28,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-06-06',29,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-07-06',30,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-08-06',31,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-09-06',32,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-10-06',33,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-11-06',34,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-12-06',35,'Reguler','Belum',NULL,NULL),
  (833333.45,187500.0,1020833.45,'2029-01-06',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9011 NVARCHAR(50) = 'T.205239';
DECLARE @pid9011 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9011);
IF @pid9011 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205239', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9011, 'PLJ-FA26-9011', 10000000.0, 36, 0.075, 340277.78, 2250000.0, N'[Migrasi data lama]', 'Disetujui', '2026-06-25', '2026-06-25');
DECLARE @pengajuanId9011 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9011, @pengajuanId9011, 'PJM-FA26-9011', 10000000.0, 36, 0.075, 277777.78, 62500.0, 340277.78, 9444444.44, 2, '2026-06-25', 'Aktif', '2026-06-25');
DECLARE @pinjId9011 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9011 FROM (VALUES
  (277777.78,62500.0,340277.78,'2026-07-01',1,'Reguler','Dibayar',340277.78,'2026-07-01'),
  (277777.78,62500.0,340277.78,'2026-08-01',2,'Reguler','Dibayar',340277.78,'2026-08-01'),
  (277777.78,62500.0,340277.78,'2026-09-01',3,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2026-10-01',4,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2026-11-01',5,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2026-12-01',6,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-01-01',7,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-02-01',8,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-03-01',9,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-04-01',10,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-05-01',11,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-06-01',12,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-07-01',13,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-08-01',14,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-09-01',15,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-10-01',16,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-11-01',17,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2027-12-01',18,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-01-01',19,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-02-01',20,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-03-01',21,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-04-01',22,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-05-01',23,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-06-01',24,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-07-01',25,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-08-01',26,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-09-01',27,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-10-01',28,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-11-01',29,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2028-12-01',30,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2029-01-01',31,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2029-02-01',32,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2029-03-01',33,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2029-04-01',34,'Reguler','Belum',NULL,NULL),
  (277777.78,62500.0,340277.78,'2029-05-01',35,'Reguler','Belum',NULL,NULL),
  (277777.7,62500.0,340277.7,'2029-06-01',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9012 NVARCHAR(50) = 'T.202207';
DECLARE @pid9012 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9012);
IF @pid9012 IS NULL THROW 51000, 'NIK tidak ditemukan: T.202207', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9012, 'PLJ-FA26-9012', 100000000.0, 60, 0.085, 2375000.0, 42499999.8, N'[Migrasi data lama]', 'Disetujui', '2026-07-07', '2026-07-07');
DECLARE @pengajuanId9012 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9012, @pengajuanId9012, 'PJM-FA26-9012', 100000000.0, 60, 0.085, 1666666.67, 708333.33, 2375000.0, 96666666.67, 2, '2026-07-07', 'Aktif', '2026-07-07');
DECLARE @pinjId9012 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9012 FROM (VALUES
  (1666666.67,708333.33,2375000.0,'2026-07-07',1,'Reguler','Dibayar',2375000.0,'2026-07-07'),
  (1666666.67,708333.33,2375000.0,'2026-08-07',2,'Reguler','Dibayar',2375000.0,'2026-08-07'),
  (1666666.67,708333.33,2375000.0,'2026-09-07',3,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-10-07',4,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-11-07',5,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-12-07',6,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-01-07',7,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-02-07',8,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-03-07',9,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-04-07',10,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-05-07',11,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-06-07',12,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-07-07',13,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-08-07',14,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-09-07',15,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-10-07',16,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-11-07',17,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-12-07',18,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-01-07',19,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-02-07',20,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-03-07',21,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-04-07',22,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-05-07',23,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-06-07',24,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-07-07',25,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-08-07',26,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-09-07',27,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-10-07',28,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-11-07',29,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-12-07',30,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-01-07',31,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-02-07',32,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-03-07',33,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-04-07',34,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-05-07',35,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-06-07',36,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-07-07',37,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-08-07',38,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-09-07',39,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-10-07',40,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-11-07',41,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-12-07',42,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-01-07',43,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-02-07',44,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-03-07',45,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-04-07',46,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-05-07',47,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-06-07',48,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-07-07',49,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-08-07',50,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-09-07',51,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-10-07',52,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-11-07',53,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-12-07',54,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-01-07',55,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-02-07',56,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-03-07',57,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-04-07',58,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-05-07',59,'Reguler','Belum',NULL,NULL),
  (1666666.47,708333.33,2374999.8,'2031-06-07',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9013 NVARCHAR(50) = 'T.225319';
DECLARE @pid9013 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9013);
IF @pid9013 IS NULL THROW 51000, 'NIK tidak ditemukan: T.225319', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9013, 'PLJ-FA26-9013', 23000000.0, 48, 0.08, 632500.0, 7359999.84, N'[Migrasi data lama]', 'Disetujui', '2026-05-21', '2026-05-21');
DECLARE @pengajuanId9013 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9013, @pengajuanId9013, 'PJM-FA26-9013', 23000000.0, 48, 0.08, 479166.67, 153333.33, 632500.0, 21562500.0, 3, '2026-05-21', 'Aktif', '2026-05-21');
DECLARE @pinjId9013 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9013 FROM (VALUES
  (479166.67,153333.33,632500.0,'2026-05-21',1,'Reguler','Dibayar',632500.0,'2026-05-21'),
  (479166.67,153333.33,632500.0,'2026-06-21',2,'Reguler','Dibayar',632500.0,'2026-06-21'),
  (479166.67,153333.33,632500.0,'2026-07-21',3,'Reguler','Dibayar',632500.0,'2026-07-21'),
  (479166.67,153333.33,632500.0,'2026-08-21',4,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2026-09-21',5,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2026-10-21',6,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2026-11-21',7,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2026-12-21',8,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-01-21',9,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-02-21',10,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-03-21',11,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-04-21',12,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-05-21',13,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-06-21',14,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-07-21',15,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-08-21',16,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-09-21',17,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-10-21',18,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-11-21',19,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2027-12-21',20,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-01-21',21,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-02-21',22,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-03-21',23,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-04-21',24,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-05-21',25,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-06-21',26,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-07-21',27,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-08-21',28,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-09-21',29,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-10-21',30,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-11-21',31,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2028-12-21',32,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-01-21',33,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-02-21',34,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-03-21',35,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-04-21',36,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-05-21',37,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-06-21',38,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-07-21',39,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-08-21',40,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-09-21',41,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-10-21',42,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-11-21',43,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2029-12-21',44,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2030-01-21',45,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2030-02-21',46,'Reguler','Belum',NULL,NULL),
  (479166.67,153333.33,632500.0,'2030-03-21',47,'Reguler','Belum',NULL,NULL),
  (479166.51,153333.33,632499.84,'2030-04-21',48,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9014 NVARCHAR(50) = 'T.225317';
DECLARE @pid9014 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9014);
IF @pid9014 IS NULL THROW 51000, 'NIK tidak ditemukan: T.225317', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9014, 'PLJ-FA26-9014', 24000000.0, 60, 0.085, 570000.0, 10200000.0, N'[Migrasi data lama]', 'Disetujui', '2026-07-02', '2026-07-02');
DECLARE @pengajuanId9014 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9014, @pengajuanId9014, 'PJM-FA26-9014', 24000000.0, 60, 0.085, 400000.0, 170000.0, 570000.0, 23200000.0, 2, '2026-07-02', 'Aktif', '2026-07-02');
DECLARE @pinjId9014 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9014 FROM (VALUES
  (400000.0,170000.0,570000.0,'2026-07-02',1,'Reguler','Dibayar',570000.0,'2026-07-02'),
  (400000.0,170000.0,570000.0,'2026-08-02',2,'Reguler','Dibayar',570000.0,'2026-08-02'),
  (400000.0,170000.0,570000.0,'2026-09-02',3,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2026-10-02',4,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2026-11-02',5,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2026-12-02',6,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-01-02',7,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-02-02',8,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-03-02',9,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-04-02',10,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-05-02',11,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-06-02',12,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-07-02',13,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-08-02',14,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-09-02',15,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-10-02',16,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-11-02',17,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2027-12-02',18,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-01-02',19,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-02-02',20,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-03-02',21,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-04-02',22,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-05-02',23,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-06-02',24,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-07-02',25,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-08-02',26,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-09-02',27,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-10-02',28,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-11-02',29,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2028-12-02',30,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-01-02',31,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-02-02',32,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-03-02',33,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-04-02',34,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-05-02',35,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-06-02',36,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-07-02',37,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-08-02',38,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-09-02',39,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-10-02',40,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-11-02',41,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2029-12-02',42,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-01-02',43,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-02-02',44,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-03-02',45,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-04-02',46,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-05-02',47,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-06-02',48,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-07-02',49,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-08-02',50,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-09-02',51,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-10-02',52,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-11-02',53,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2030-12-02',54,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-01-02',55,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-02-02',56,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-03-02',57,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-04-02',58,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-05-02',59,'Reguler','Belum',NULL,NULL),
  (400000.0,170000.0,570000.0,'2031-06-02',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9015 NVARCHAR(50) = 'T.210258';
DECLARE @pid9015 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9015);
IF @pid9015 IS NULL THROW 51000, 'NIK tidak ditemukan: T.210258', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9015, 'PLJ-FA26-9015', 15000000.0, 60, 0.085, 356250.0, 6375000.0, N'[Migrasi data lama]', 'Disetujui', '2026-02-22', '2026-02-22');
DECLARE @pengajuanId9015 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9015, @pengajuanId9015, 'PJM-FA26-9015', 15000000.0, 60, 0.085, 250000.0, 106250.0, 356250.0, 13500000.0, 6, '2026-02-22', 'Aktif', '2026-02-22');
DECLARE @pinjId9015 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9015 FROM (VALUES
  (250000.0,106250.0,356250.0,'2026-02-22',1,'Reguler','Dibayar',356250.0,'2026-02-22'),
  (250000.0,106250.0,356250.0,'2026-03-22',2,'Reguler','Dibayar',356250.0,'2026-03-22'),
  (250000.0,106250.0,356250.0,'2026-04-22',3,'Reguler','Dibayar',356250.0,'2026-04-22'),
  (250000.0,106250.0,356250.0,'2026-05-22',4,'Reguler','Dibayar',356250.0,'2026-05-22'),
  (250000.0,106250.0,356250.0,'2026-06-22',5,'Reguler','Dibayar',356250.0,'2026-06-22'),
  (250000.0,106250.0,356250.0,'2026-07-22',6,'Reguler','Dibayar',356250.0,'2026-07-22'),
  (250000.0,106250.0,356250.0,'2026-08-22',7,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2026-09-22',8,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2026-10-22',9,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2026-11-22',10,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2026-12-22',11,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-01-22',12,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-02-22',13,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-03-22',14,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-04-22',15,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-05-22',16,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-06-22',17,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-07-22',18,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-08-22',19,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-09-22',20,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-10-22',21,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-11-22',22,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2027-12-22',23,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-01-22',24,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-02-22',25,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-03-22',26,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-04-22',27,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-05-22',28,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-06-22',29,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-07-22',30,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-08-22',31,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-09-22',32,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-10-22',33,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-11-22',34,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2028-12-22',35,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-01-22',36,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-02-22',37,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-03-22',38,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-04-22',39,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-05-22',40,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-06-22',41,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-07-22',42,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-08-22',43,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-09-22',44,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-10-22',45,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-11-22',46,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2029-12-22',47,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-01-22',48,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-02-22',49,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-03-22',50,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-04-22',51,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-05-22',52,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-06-22',53,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-07-22',54,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-08-22',55,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-09-22',56,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-10-22',57,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-11-22',58,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2030-12-22',59,'Reguler','Belum',NULL,NULL),
  (250000.0,106250.0,356250.0,'2031-01-22',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9016 NVARCHAR(50) = 'T.210261';
DECLARE @pid9016 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9016);
IF @pid9016 IS NULL THROW 51000, 'NIK tidak ditemukan: T.210261', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9016, 'PLJ-FA26-9016', 20000000.0, 36, 0.075, 680555.56, 4500000.0, N'[Migrasi data lama]', 'Disetujui', '2026-07-02', '2026-07-02');
DECLARE @pengajuanId9016 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9016, @pengajuanId9016, 'PJM-FA26-9016', 20000000.0, 36, 0.075, 555555.56, 125000.0, 680555.56, 18888888.89, 2, '2026-07-02', 'Aktif', '2026-07-02');
DECLARE @pinjId9016 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9016 FROM (VALUES
  (555555.56,125000.0,680555.56,'2026-07-02',1,'Reguler','Dibayar',680555.56,'2026-07-02'),
  (555555.56,125000.0,680555.56,'2026-08-02',2,'Reguler','Dibayar',680555.56,'2026-08-02'),
  (555555.56,125000.0,680555.56,'2026-09-02',3,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-10-02',4,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-11-02',5,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-12-02',6,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-01-02',7,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-02-02',8,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-03-02',9,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-04-02',10,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-05-02',11,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-06-02',12,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-07-02',13,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-08-02',14,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-09-02',15,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-10-02',16,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-11-02',17,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-12-02',18,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-01-02',19,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-02-02',20,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-03-02',21,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-04-02',22,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-05-02',23,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-06-02',24,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-07-02',25,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-08-02',26,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-09-02',27,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-10-02',28,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-11-02',29,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-12-02',30,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-01-02',31,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-02-02',32,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-03-02',33,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-04-02',34,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-05-02',35,'Reguler','Belum',NULL,NULL),
  (555555.4,125000.0,680555.4,'2029-06-02',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9017 NVARCHAR(50) = 'T.211272';
DECLARE @pid9017 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9017);
IF @pid9017 IS NULL THROW 51000, 'NIK tidak ditemukan: T.211272', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9017, 'PLJ-FA26-9017', 40000000.0, 60, 0.085, 950000.0, 16999999.8, N'[Migrasi data lama]', 'Disetujui', '2026-05-26', '2026-05-26');
DECLARE @pengajuanId9017 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9017, @pengajuanId9017, 'PJM-FA26-9017', 40000000.0, 60, 0.085, 666666.67, 283333.33, 950000.0, 38000000.0, 3, '2026-05-26', 'Aktif', '2026-05-26');
DECLARE @pinjId9017 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9017 FROM (VALUES
  (666666.67,283333.33,950000.0,'2026-06-01',1,'Reguler','Dibayar',950000.0,'2026-06-01'),
  (666666.67,283333.33,950000.0,'2026-07-01',2,'Reguler','Dibayar',950000.0,'2026-07-01'),
  (666666.67,283333.33,950000.0,'2026-08-01',3,'Reguler','Dibayar',950000.0,'2026-08-01'),
  (666666.67,283333.33,950000.0,'2026-09-01',4,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2026-10-01',5,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2026-11-01',6,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2026-12-01',7,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-01-01',8,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-02-01',9,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-03-01',10,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-04-01',11,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-05-01',12,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-06-01',13,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-07-01',14,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-08-01',15,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-09-01',16,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-10-01',17,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-11-01',18,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2027-12-01',19,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-01-01',20,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-02-01',21,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-03-01',22,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-04-01',23,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-05-01',24,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-06-01',25,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-07-01',26,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-08-01',27,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-09-01',28,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-10-01',29,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-11-01',30,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2028-12-01',31,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-01-01',32,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-02-01',33,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-03-01',34,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-04-01',35,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-05-01',36,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-06-01',37,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-07-01',38,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-08-01',39,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-09-01',40,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-10-01',41,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-11-01',42,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2029-12-01',43,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-01-01',44,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-02-01',45,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-03-01',46,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-04-01',47,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-05-01',48,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-06-01',49,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-07-01',50,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-08-01',51,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-09-01',52,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-10-01',53,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-11-01',54,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2030-12-01',55,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2031-01-01',56,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2031-02-01',57,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2031-03-01',58,'Reguler','Belum',NULL,NULL),
  (666666.67,283333.33,950000.0,'2031-04-01',59,'Reguler','Belum',NULL,NULL),
  (666666.47,283333.33,949999.8,'2031-05-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9018 NVARCHAR(50) = 'T.221310';
DECLARE @pid9018 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9018);
IF @pid9018 IS NULL THROW 51000, 'NIK tidak ditemukan: T.221310', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9018, 'PLJ-FA26-9018', 50000000.0, 60, 0.085, 1187500.0, 21250000.2, N'[Migrasi data lama]', 'Disetujui', '2026-02-27', '2026-02-27');
DECLARE @pengajuanId9018 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9018, @pengajuanId9018, 'PJM-FA26-9018', 50000000.0, 60, 0.085, 833333.33, 354166.67, 1187500.0, 45000000.0, 6, '2026-02-27', 'Aktif', '2026-02-27');
DECLARE @pinjId9018 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9018 FROM (VALUES
  (833333.33,354166.67,1187500.0,'2026-03-01',1,'Reguler','Dibayar',1187500.0,'2026-03-01'),
  (833333.33,354166.67,1187500.0,'2026-04-01',2,'Reguler','Dibayar',1187500.0,'2026-04-01'),
  (833333.33,354166.67,1187500.0,'2026-05-01',3,'Reguler','Dibayar',1187500.0,'2026-05-01'),
  (833333.33,354166.67,1187500.0,'2026-06-01',4,'Reguler','Dibayar',1187500.0,'2026-06-01'),
  (833333.33,354166.67,1187500.0,'2026-07-01',5,'Reguler','Dibayar',1187500.0,'2026-07-01'),
  (833333.33,354166.67,1187500.0,'2026-08-01',6,'Reguler','Dibayar',1187500.0,'2026-08-01'),
  (833333.33,354166.67,1187500.0,'2026-09-01',7,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-10-01',8,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-11-01',9,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-12-01',10,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-01-01',11,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-02-01',12,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-03-01',13,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-04-01',14,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-05-01',15,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-06-01',16,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-07-01',17,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-08-01',18,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-09-01',19,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-10-01',20,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-11-01',21,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-12-01',22,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-01-01',23,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-02-01',24,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-03-01',25,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-04-01',26,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-05-01',27,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-06-01',28,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-07-01',29,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-08-01',30,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-09-01',31,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-10-01',32,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-11-01',33,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-12-01',34,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-01-01',35,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-02-01',36,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-03-01',37,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-04-01',38,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-05-01',39,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-06-01',40,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-07-01',41,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-08-01',42,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-09-01',43,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-10-01',44,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-11-01',45,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-12-01',46,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-01-01',47,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-02-01',48,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-03-01',49,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-04-01',50,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-05-01',51,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-06-01',52,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-07-01',53,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-08-01',54,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-09-01',55,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-10-01',56,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-11-01',57,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-12-01',58,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2031-01-01',59,'Reguler','Belum',NULL,NULL),
  (833333.53,354166.67,1187500.2,'2031-02-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9019 NVARCHAR(50) = 'T.205221';
DECLARE @pid9019 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9019);
IF @pid9019 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205221', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9019, 'PLJ-FA26-9019', 100000000.0, 60, 0.085, 2375000.0, 42499999.8, N'[Migrasi data lama]', 'Disetujui', '2026-07-27', '2026-07-27');
DECLARE @pengajuanId9019 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9019, @pengajuanId9019, 'PJM-FA26-9019', 100000000.0, 60, 0.085, 1666666.67, 708333.33, 2375000.0, 98333333.33, 1, '2026-07-27', 'Aktif', '2026-07-27');
DECLARE @pinjId9019 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9019 FROM (VALUES
  (1666666.67,708333.33,2375000.0,'2026-08-01',1,'Reguler','Dibayar',2375000.0,'2026-08-01'),
  (1666666.67,708333.33,2375000.0,'2026-09-01',2,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-10-01',3,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-11-01',4,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2026-12-01',5,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-01-01',6,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-02-01',7,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-03-01',8,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-04-01',9,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-05-01',10,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-06-01',11,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-07-01',12,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-08-01',13,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-09-01',14,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-10-01',15,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-11-01',16,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2027-12-01',17,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-01-01',18,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-02-01',19,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-03-01',20,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-04-01',21,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-05-01',22,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-06-01',23,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-07-01',24,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-08-01',25,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-09-01',26,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-10-01',27,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-11-01',28,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2028-12-01',29,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-01-01',30,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-02-01',31,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-03-01',32,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-04-01',33,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-05-01',34,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-06-01',35,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-07-01',36,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-08-01',37,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-09-01',38,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-10-01',39,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-11-01',40,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2029-12-01',41,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-01-01',42,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-02-01',43,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-03-01',44,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-04-01',45,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-05-01',46,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-06-01',47,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-07-01',48,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-08-01',49,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-09-01',50,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-10-01',51,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-11-01',52,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2030-12-01',53,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-01-01',54,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-02-01',55,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-03-01',56,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-04-01',57,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-05-01',58,'Reguler','Belum',NULL,NULL),
  (1666666.67,708333.33,2375000.0,'2031-06-01',59,'Reguler','Belum',NULL,NULL),
  (1666666.47,708333.33,2374999.8,'2031-07-01',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9020 NVARCHAR(50) = 'T.205221';
DECLARE @pid9020 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9020);
IF @pid9020 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205221', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9020, 'PLJ-FA26-9020', 20000000.0, 24, 0.0725, 954166.66, 2899999.92, N'[Migrasi data lama]', 'Disetujui', '2026-01-09', '2026-01-09');
DECLARE @pengajuanId9020 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9020, @pengajuanId9020, 'PJM-FA26-9020', 20000000.0, 24, 0.0725, 833333.33, 120833.33, 954166.66, 13333333.33, 8, '2026-01-09', 'Aktif', '2026-01-09');
DECLARE @pinjId9020 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9020 FROM (VALUES
  (833333.33,120833.33,954166.66,'2026-01-09',1,'Reguler','Dibayar',954166.66,'2026-01-09'),
  (833333.33,120833.33,954166.66,'2026-02-09',2,'Reguler','Dibayar',954166.66,'2026-02-09'),
  (833333.33,120833.33,954166.66,'2026-03-09',3,'Reguler','Dibayar',954166.66,'2026-03-09'),
  (833333.33,120833.33,954166.66,'2026-04-09',4,'Reguler','Dibayar',954166.66,'2026-04-09'),
  (833333.33,120833.33,954166.66,'2026-05-09',5,'Reguler','Dibayar',954166.66,'2026-05-09'),
  (833333.33,120833.33,954166.66,'2026-06-09',6,'Reguler','Dibayar',954166.66,'2026-06-09'),
  (833333.33,120833.33,954166.66,'2026-07-09',7,'Reguler','Dibayar',954166.66,'2026-07-09'),
  (833333.33,120833.33,954166.66,'2026-08-09',8,'Reguler','Dibayar',954166.66,'2026-08-09'),
  (833333.33,120833.33,954166.66,'2026-09-09',9,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2026-10-09',10,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2026-11-09',11,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2026-12-09',12,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-01-09',13,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-02-09',14,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-03-09',15,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-04-09',16,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-05-09',17,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-06-09',18,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-07-09',19,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-08-09',20,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-09-09',21,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-10-09',22,'Reguler','Belum',NULL,NULL),
  (833333.33,120833.33,954166.66,'2027-11-09',23,'Reguler','Belum',NULL,NULL),
  (833333.41,120833.33,954166.74,'2027-12-09',24,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9021 NVARCHAR(50) = 'T.215303';
DECLARE @pid9021 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9021);
IF @pid9021 IS NULL THROW 51000, 'NIK tidak ditemukan: T.215303', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9021, 'PLJ-FA26-9021', 15000000.0, 36, 0.075, 510416.67, 3375000.0, N'[Migrasi data lama]', 'Disetujui', '2026-04-09', '2026-04-09');
DECLARE @pengajuanId9021 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9021, @pengajuanId9021, 'PJM-FA26-9021', 15000000.0, 36, 0.075, 416666.67, 93750.0, 510416.67, 12916666.67, 5, '2026-04-09', 'Aktif', '2026-04-09');
DECLARE @pinjId9021 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9021 FROM (VALUES
  (416666.67,93750.0,510416.67,'2026-04-09',1,'Reguler','Dibayar',510416.67,'2026-04-09'),
  (416666.67,93750.0,510416.67,'2026-05-09',2,'Reguler','Dibayar',510416.67,'2026-05-09'),
  (416666.67,93750.0,510416.67,'2026-06-09',3,'Reguler','Dibayar',510416.67,'2026-06-09'),
  (416666.67,93750.0,510416.67,'2026-07-09',4,'Reguler','Dibayar',510416.67,'2026-07-09'),
  (416666.67,93750.0,510416.67,'2026-08-09',5,'Reguler','Dibayar',510416.67,'2026-08-09'),
  (416666.67,93750.0,510416.67,'2026-09-09',6,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2026-10-09',7,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2026-11-09',8,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2026-12-09',9,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-01-09',10,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-02-09',11,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-03-09',12,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-04-09',13,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-05-09',14,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-06-09',15,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-07-09',16,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-08-09',17,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-09-09',18,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-10-09',19,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-11-09',20,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2027-12-09',21,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-01-09',22,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-02-09',23,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-03-09',24,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-04-09',25,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-05-09',26,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-06-09',27,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-07-09',28,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-08-09',29,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-09-09',30,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-10-09',31,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-11-09',32,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2028-12-09',33,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2029-01-09',34,'Reguler','Belum',NULL,NULL),
  (416666.67,93750.0,510416.67,'2029-02-09',35,'Reguler','Belum',NULL,NULL),
  (416666.55,93750.0,510416.55,'2029-03-09',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9022 NVARCHAR(50) = 'T.940138';
DECLARE @pid9022 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9022);
IF @pid9022 IS NULL THROW 51000, 'NIK tidak ditemukan: T.940138', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9022, 'PLJ-FA26-9022', 20000000.0, 12, 0.07, 1783333.34, 1400000.04, N'[Migrasi data lama]', 'Disetujui', '2026-01-06', '2026-01-06');
DECLARE @pengajuanId9022 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9022, @pengajuanId9022, 'PJM-FA26-9022', 20000000.0, 12, 0.07, 1666666.67, 116666.67, 1783333.34, 6666666.67, 8, '2026-01-06', 'Aktif', '2026-01-06');
DECLARE @pinjId9022 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9022 FROM (VALUES
  (1666666.67,116666.67,1783333.34,'2026-01-06',1,'Reguler','Dibayar',1783333.34,'2026-01-06'),
  (1666666.67,116666.67,1783333.34,'2026-02-06',2,'Reguler','Dibayar',1783333.34,'2026-02-06'),
  (1666666.67,116666.67,1783333.34,'2026-03-06',3,'Reguler','Dibayar',1783333.34,'2026-03-06'),
  (1666666.67,116666.67,1783333.34,'2026-04-06',4,'Reguler','Dibayar',1783333.34,'2026-04-06'),
  (1666666.67,116666.67,1783333.34,'2026-05-06',5,'Reguler','Dibayar',1783333.34,'2026-05-06'),
  (1666666.67,116666.67,1783333.34,'2026-06-06',6,'Reguler','Dibayar',1783333.34,'2026-06-06'),
  (1666666.67,116666.67,1783333.34,'2026-07-06',7,'Reguler','Dibayar',1783333.34,'2026-07-06'),
  (1666666.67,116666.67,1783333.34,'2026-08-06',8,'Reguler','Dibayar',1783333.34,'2026-08-06'),
  (1666666.67,116666.67,1783333.34,'2026-09-06',9,'Reguler','Belum',NULL,NULL),
  (1666666.67,116666.67,1783333.34,'2026-10-06',10,'Reguler','Belum',NULL,NULL),
  (1666666.67,116666.67,1783333.34,'2026-11-06',11,'Reguler','Belum',NULL,NULL),
  (1666666.63,116666.67,1783333.3,'2026-12-06',12,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9023 NVARCHAR(50) = 'T.207248';
DECLARE @pid9023 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9023);
IF @pid9023 IS NULL THROW 51000, 'NIK tidak ditemukan: T.207248', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9023, 'PLJ-FA26-9023', 10000000.0, 48, 0.08, 275000.0, 3200000.16, N'[Migrasi data lama]', 'Disetujui', '2026-04-24', '2026-04-24');
DECLARE @pengajuanId9023 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9023, @pengajuanId9023, 'PJM-FA26-9023', 10000000.0, 48, 0.08, 208333.33, 66666.67, 275000.0, 9166666.67, 4, '2026-04-24', 'Aktif', '2026-04-24');
DECLARE @pinjId9023 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9023 FROM (VALUES
  (208333.33,66666.67,275000.0,'2026-04-24',1,'Reguler','Dibayar',275000.0,'2026-04-24'),
  (208333.33,66666.67,275000.0,'2026-05-24',2,'Reguler','Dibayar',275000.0,'2026-05-24'),
  (208333.33,66666.67,275000.0,'2026-06-24',3,'Reguler','Dibayar',275000.0,'2026-06-24'),
  (208333.33,66666.67,275000.0,'2026-07-24',4,'Reguler','Dibayar',275000.0,'2026-07-24'),
  (208333.33,66666.67,275000.0,'2026-08-24',5,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2026-09-24',6,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2026-10-24',7,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2026-11-24',8,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2026-12-24',9,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-01-24',10,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-02-24',11,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-03-24',12,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-04-24',13,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-05-24',14,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-06-24',15,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-07-24',16,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-08-24',17,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-09-24',18,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-10-24',19,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-11-24',20,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2027-12-24',21,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-01-24',22,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-02-24',23,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-03-24',24,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-04-24',25,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-05-24',26,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-06-24',27,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-07-24',28,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-08-24',29,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-09-24',30,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-10-24',31,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-11-24',32,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2028-12-24',33,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-01-24',34,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-02-24',35,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-03-24',36,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-04-24',37,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-05-24',38,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-06-24',39,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-07-24',40,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-08-24',41,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-09-24',42,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-10-24',43,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-11-24',44,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2029-12-24',45,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2030-01-24',46,'Reguler','Belum',NULL,NULL),
  (208333.33,66666.67,275000.0,'2030-02-24',47,'Reguler','Belum',NULL,NULL),
  (208333.49,66666.67,275000.16,'2030-03-24',48,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9024 NVARCHAR(50) = 'T.202206';
DECLARE @pid9024 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9024);
IF @pid9024 IS NULL THROW 51000, 'NIK tidak ditemukan: T.202206', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9024, 'PLJ-FA26-9024', 20000000.0, 36, 0.075, 680555.56, 4500000.0, N'[Migrasi data lama]', 'Disetujui', '2026-04-24', '2026-04-24');
DECLARE @pengajuanId9024 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9024, @pengajuanId9024, 'PJM-FA26-9024', 20000000.0, 36, 0.075, 555555.56, 125000.0, 680555.56, 17777777.78, 4, '2026-04-24', 'Aktif', '2026-04-24');
DECLARE @pinjId9024 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9024 FROM (VALUES
  (555555.56,125000.0,680555.56,'2026-04-24',1,'Reguler','Dibayar',680555.56,'2026-04-24'),
  (555555.56,125000.0,680555.56,'2026-05-24',2,'Reguler','Dibayar',680555.56,'2026-05-24'),
  (555555.56,125000.0,680555.56,'2026-06-24',3,'Reguler','Dibayar',680555.56,'2026-06-24'),
  (555555.56,125000.0,680555.56,'2026-07-24',4,'Reguler','Dibayar',680555.56,'2026-07-24'),
  (555555.56,125000.0,680555.56,'2026-08-24',5,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-09-24',6,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-10-24',7,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-11-24',8,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2026-12-24',9,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-01-24',10,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-02-24',11,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-03-24',12,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-04-24',13,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-05-24',14,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-06-24',15,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-07-24',16,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-08-24',17,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-09-24',18,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-10-24',19,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-11-24',20,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2027-12-24',21,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-01-24',22,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-02-24',23,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-03-24',24,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-04-24',25,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-05-24',26,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-06-24',27,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-07-24',28,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-08-24',29,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-09-24',30,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-10-24',31,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-11-24',32,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2028-12-24',33,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-01-24',34,'Reguler','Belum',NULL,NULL),
  (555555.56,125000.0,680555.56,'2029-02-24',35,'Reguler','Belum',NULL,NULL),
  (555555.4,125000.0,680555.4,'2029-03-24',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9025 NVARCHAR(50) = 'T.205240';
DECLARE @pid9025 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9025);
IF @pid9025 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205240', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9025, 'PLJ-FA26-9025', 15000000.0, 12, 0.07, 1337500.0, 1050000.0, N'[Migrasi data lama]', 'Disetujui', '2026-04-02', '2026-04-02');
DECLARE @pengajuanId9025 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9025, @pengajuanId9025, 'PJM-FA26-9025', 15000000.0, 12, 0.07, 1250000.0, 87500.0, 1337500.0, 8750000.0, 5, '2026-04-02', 'Aktif', '2026-04-02');
DECLARE @pinjId9025 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9025 FROM (VALUES
  (1250000.0,87500.0,1337500.0,'2026-04-02',1,'Reguler','Dibayar',1337500.0,'2026-04-02'),
  (1250000.0,87500.0,1337500.0,'2026-05-02',2,'Reguler','Dibayar',1337500.0,'2026-05-02'),
  (1250000.0,87500.0,1337500.0,'2026-06-02',3,'Reguler','Dibayar',1337500.0,'2026-06-02'),
  (1250000.0,87500.0,1337500.0,'2026-07-02',4,'Reguler','Dibayar',1337500.0,'2026-07-02'),
  (1250000.0,87500.0,1337500.0,'2026-08-02',5,'Reguler','Dibayar',1337500.0,'2026-08-02'),
  (1250000.0,87500.0,1337500.0,'2026-09-02',6,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-10-02',7,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-11-02',8,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-12-02',9,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-01-02',10,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-02-02',11,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-03-02',12,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9026 NVARCHAR(50) = 'T.940160';
DECLARE @pid9026 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9026);
IF @pid9026 IS NULL THROW 51000, 'NIK tidak ditemukan: T.940160', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9026, 'PLJ-FA26-9026', 50000000.0, 36, 0.075, 1701388.89, 11250000.0, N'[Migrasi data lama]', 'Disetujui', '2026-01-06', '2026-01-06');
DECLARE @pengajuanId9026 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9026, @pengajuanId9026, 'PJM-FA26-9026', 50000000.0, 36, 0.075, 1388888.89, 312500.0, 1701388.89, 38888888.89, 8, '2026-01-06', 'Aktif', '2026-01-06');
DECLARE @pinjId9026 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9026 FROM (VALUES
  (1388888.89,312500.0,1701388.89,'2026-01-06',1,'Reguler','Dibayar',1701388.89,'2026-01-06'),
  (1388888.89,312500.0,1701388.89,'2026-02-06',2,'Reguler','Dibayar',1701388.89,'2026-02-06'),
  (1388888.89,312500.0,1701388.89,'2026-03-06',3,'Reguler','Dibayar',1701388.89,'2026-03-06'),
  (1388888.89,312500.0,1701388.89,'2026-04-06',4,'Reguler','Dibayar',1701388.89,'2026-04-06'),
  (1388888.89,312500.0,1701388.89,'2026-05-06',5,'Reguler','Dibayar',1701388.89,'2026-05-06'),
  (1388888.89,312500.0,1701388.89,'2026-06-06',6,'Reguler','Dibayar',1701388.89,'2026-06-06'),
  (1388888.89,312500.0,1701388.89,'2026-07-06',7,'Reguler','Dibayar',1701388.89,'2026-07-06'),
  (1388888.89,312500.0,1701388.89,'2026-08-06',8,'Reguler','Dibayar',1701388.89,'2026-08-06'),
  (1388888.89,312500.0,1701388.89,'2026-09-06',9,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2026-10-06',10,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2026-11-06',11,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2026-12-06',12,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-01-06',13,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-02-06',14,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-03-06',15,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-04-06',16,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-05-06',17,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-06-06',18,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-07-06',19,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-08-06',20,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-09-06',21,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-10-06',22,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-11-06',23,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2027-12-06',24,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-01-06',25,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-02-06',26,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-03-06',27,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-04-06',28,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-05-06',29,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-06-06',30,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-07-06',31,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-08-06',32,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-09-06',33,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-10-06',34,'Reguler','Belum',NULL,NULL),
  (1388888.89,312500.0,1701388.89,'2028-11-06',35,'Reguler','Belum',NULL,NULL),
  (1388888.85,312500.0,1701388.85,'2028-12-06',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9027 NVARCHAR(50) = 'T.205235';
DECLARE @pid9027 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9027);
IF @pid9027 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205235', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9027, 'PLJ-FA26-9027', 15000000.0, 12, 0.07, 1337500.0, 1050000.0, N'[Migrasi data lama]', 'Disetujui', '2026-04-24', '2026-04-24');
DECLARE @pengajuanId9027 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9027, @pengajuanId9027, 'PJM-FA26-9027', 15000000.0, 12, 0.07, 1250000.0, 87500.0, 1337500.0, 10000000.0, 4, '2026-04-24', 'Aktif', '2026-04-24');
DECLARE @pinjId9027 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9027 FROM (VALUES
  (1250000.0,87500.0,1337500.0,'2026-04-24',1,'Reguler','Dibayar',1337500.0,'2026-04-24'),
  (1250000.0,87500.0,1337500.0,'2026-05-24',2,'Reguler','Dibayar',1337500.0,'2026-05-24'),
  (1250000.0,87500.0,1337500.0,'2026-06-24',3,'Reguler','Dibayar',1337500.0,'2026-06-24'),
  (1250000.0,87500.0,1337500.0,'2026-07-24',4,'Reguler','Dibayar',1337500.0,'2026-07-24'),
  (1250000.0,87500.0,1337500.0,'2026-08-24',5,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-09-24',6,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-10-24',7,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-11-24',8,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2026-12-24',9,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-01-24',10,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-02-24',11,'Reguler','Belum',NULL,NULL),
  (1250000.0,87500.0,1337500.0,'2027-03-24',12,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9028 NVARCHAR(50) = 'T.205237';
DECLARE @pid9028 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9028);
IF @pid9028 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205237', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9028, 'PLJ-FA26-9028', 30000000.0, 36, 0.075, 1020833.33, 6750000.0, N'[Migrasi data lama]', 'Disetujui', '2026-07-02', '2026-07-02');
DECLARE @pengajuanId9028 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9028, @pengajuanId9028, 'PJM-FA26-9028', 30000000.0, 36, 0.075, 833333.33, 187500.0, 1020833.33, 28333333.33, 2, '2026-07-02', 'Aktif', '2026-07-02');
DECLARE @pinjId9028 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9028 FROM (VALUES
  (833333.33,187500.0,1020833.33,'2026-07-02',1,'Reguler','Dibayar',1020833.33,'2026-07-02'),
  (833333.33,187500.0,1020833.33,'2026-08-02',2,'Reguler','Dibayar',1020833.33,'2026-08-02'),
  (833333.33,187500.0,1020833.33,'2026-09-02',3,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-10-02',4,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-11-02',5,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-12-02',6,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-01-02',7,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-02-02',8,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-03-02',9,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-04-02',10,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-05-02',11,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-06-02',12,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-07-02',13,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-08-02',14,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-09-02',15,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-10-02',16,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-11-02',17,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-12-02',18,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-01-02',19,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-02-02',20,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-03-02',21,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-04-02',22,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-05-02',23,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-06-02',24,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-07-02',25,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-08-02',26,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-09-02',27,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-10-02',28,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-11-02',29,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-12-02',30,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2029-01-02',31,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2029-02-02',32,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2029-03-02',33,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2029-04-02',34,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2029-05-02',35,'Reguler','Belum',NULL,NULL),
  (833333.45,187500.0,1020833.45,'2029-06-02',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9029 NVARCHAR(50) = 'T.205237';
DECLARE @pid9029 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9029);
IF @pid9029 IS NULL THROW 51000, 'NIK tidak ditemukan: T.205237', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9029, 'PLJ-FA26-9029', 30000000.0, 36, 0.075, 1020833.33, 6750000.0, N'[Migrasi data lama]', 'Disetujui', '2026-01-14', '2026-01-14');
DECLARE @pengajuanId9029 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9029, @pengajuanId9029, 'PJM-FA26-9029', 30000000.0, 36, 0.075, 833333.33, 187500.0, 1020833.33, 23333333.33, 8, '2026-01-14', 'Aktif', '2026-01-14');
DECLARE @pinjId9029 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9029 FROM (VALUES
  (833333.33,187500.0,1020833.33,'2026-01-14',1,'Reguler','Dibayar',1020833.33,'2026-01-14'),
  (833333.33,187500.0,1020833.33,'2026-02-14',2,'Reguler','Dibayar',1020833.33,'2026-02-14'),
  (833333.33,187500.0,1020833.33,'2026-03-14',3,'Reguler','Dibayar',1020833.33,'2026-03-14'),
  (833333.33,187500.0,1020833.33,'2026-04-14',4,'Reguler','Dibayar',1020833.33,'2026-04-14'),
  (833333.33,187500.0,1020833.33,'2026-05-14',5,'Reguler','Dibayar',1020833.33,'2026-05-14'),
  (833333.33,187500.0,1020833.33,'2026-06-14',6,'Reguler','Dibayar',1020833.33,'2026-06-14'),
  (833333.33,187500.0,1020833.33,'2026-07-14',7,'Reguler','Dibayar',1020833.33,'2026-07-14'),
  (833333.33,187500.0,1020833.33,'2026-08-14',8,'Reguler','Dibayar',1020833.33,'2026-08-14'),
  (833333.33,187500.0,1020833.33,'2026-09-14',9,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-10-14',10,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-11-14',11,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2026-12-14',12,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-01-14',13,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-02-14',14,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-03-14',15,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-04-14',16,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-05-14',17,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-06-14',18,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-07-14',19,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-08-14',20,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-09-14',21,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-10-14',22,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-11-14',23,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2027-12-14',24,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-01-14',25,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-02-14',26,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-03-14',27,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-04-14',28,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-05-14',29,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-06-14',30,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-07-14',31,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-08-14',32,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-09-14',33,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-10-14',34,'Reguler','Belum',NULL,NULL),
  (833333.33,187500.0,1020833.33,'2028-11-14',35,'Reguler','Belum',NULL,NULL),
  (833333.45,187500.0,1020833.45,'2028-12-14',36,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9030 NVARCHAR(50) = 'T.980185';
DECLARE @pid9030 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9030);
IF @pid9030 IS NULL THROW 51000, 'NIK tidak ditemukan: T.980185', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9030, 'PLJ-FA26-9030', 10000000.0, 24, 0.0725, 477083.34, 1450000.08, N'[Migrasi data lama]', 'Disetujui', '2026-01-27', '2026-01-27');
DECLARE @pengajuanId9030 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9030, @pengajuanId9030, 'PJM-FA26-9030', 10000000.0, 24, 0.0725, 416666.67, 60416.67, 477083.34, 7083333.33, 7, '2026-01-27', 'Aktif', '2026-01-27');
DECLARE @pinjId9030 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9030 FROM (VALUES
  (416666.67,60416.67,477083.34,'2026-02-01',1,'Reguler','Dibayar',477083.34,'2026-02-01'),
  (416666.67,60416.67,477083.34,'2026-03-01',2,'Reguler','Dibayar',477083.34,'2026-03-01'),
  (416666.67,60416.67,477083.34,'2026-04-01',3,'Reguler','Dibayar',477083.34,'2026-04-01'),
  (416666.67,60416.67,477083.34,'2026-05-01',4,'Reguler','Dibayar',477083.34,'2026-05-01'),
  (416666.67,60416.67,477083.34,'2026-06-01',5,'Reguler','Dibayar',477083.34,'2026-06-01'),
  (416666.67,60416.67,477083.34,'2026-07-01',6,'Reguler','Dibayar',477083.34,'2026-07-01'),
  (416666.67,60416.67,477083.34,'2026-08-01',7,'Reguler','Dibayar',477083.34,'2026-08-01'),
  (416666.67,60416.67,477083.34,'2026-09-01',8,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2026-10-01',9,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2026-11-01',10,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2026-12-01',11,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-01-01',12,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-02-01',13,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-03-01',14,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-04-01',15,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-05-01',16,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-06-01',17,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-07-01',18,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-08-01',19,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-09-01',20,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-10-01',21,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-11-01',22,'Reguler','Belum',NULL,NULL),
  (416666.67,60416.67,477083.34,'2027-12-01',23,'Reguler','Belum',NULL,NULL),
  (416666.59,60416.67,477083.26,'2028-01-01',24,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9031 NVARCHAR(50) = 'T.207246';
DECLARE @pid9031 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9031);
IF @pid9031 IS NULL THROW 51000, 'NIK tidak ditemukan: T.207246', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9031, 'PLJ-FA26-9031', 7000000.0, 48, 0.08, 192500.0, 2240000.16, N'[Migrasi data lama]', 'Disetujui', '2026-04-13', '2026-04-13');
DECLARE @pengajuanId9031 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9031, @pengajuanId9031, 'PJM-FA26-9031', 7000000.0, 48, 0.08, 145833.33, 46666.67, 192500.0, 6270833.33, 5, '2026-04-13', 'Aktif', '2026-04-13');
DECLARE @pinjId9031 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9031 FROM (VALUES
  (145833.33,46666.67,192500.0,'2026-04-13',1,'Reguler','Dibayar',192500.0,'2026-04-13'),
  (145833.33,46666.67,192500.0,'2026-05-13',2,'Reguler','Dibayar',192500.0,'2026-05-13'),
  (145833.33,46666.67,192500.0,'2026-06-13',3,'Reguler','Dibayar',192500.0,'2026-06-13'),
  (145833.33,46666.67,192500.0,'2026-07-13',4,'Reguler','Dibayar',192500.0,'2026-07-13'),
  (145833.33,46666.67,192500.0,'2026-08-13',5,'Reguler','Dibayar',192500.0,'2026-08-13'),
  (145833.33,46666.67,192500.0,'2026-09-13',6,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2026-10-13',7,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2026-11-13',8,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2026-12-13',9,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-01-13',10,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-02-13',11,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-03-13',12,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-04-13',13,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-05-13',14,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-06-13',15,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-07-13',16,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-08-13',17,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-09-13',18,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-10-13',19,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-11-13',20,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2027-12-13',21,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-01-13',22,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-02-13',23,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-03-13',24,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-04-13',25,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-05-13',26,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-06-13',27,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-07-13',28,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-08-13',29,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-09-13',30,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-10-13',31,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-11-13',32,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2028-12-13',33,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-01-13',34,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-02-13',35,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-03-13',36,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-04-13',37,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-05-13',38,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-06-13',39,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-07-13',40,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-08-13',41,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-09-13',42,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-10-13',43,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-11-13',44,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2029-12-13',45,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2030-01-13',46,'Reguler','Belum',NULL,NULL),
  (145833.33,46666.67,192500.0,'2030-02-13',47,'Reguler','Belum',NULL,NULL),
  (145833.49,46666.67,192500.16,'2030-03-13',48,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9032 NVARCHAR(50) = 'T.215300';
DECLARE @pid9032 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9032);
IF @pid9032 IS NULL THROW 51000, 'NIK tidak ditemukan: T.215300', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9032, 'PLJ-FA26-9032', 30000000.0, 60, 0.085, 712500.0, 12750000.0, N'[Migrasi data lama]', 'Disetujui', '2026-04-09', '2026-04-09');
DECLARE @pengajuanId9032 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9032, @pengajuanId9032, 'PJM-FA26-9032', 30000000.0, 60, 0.085, 500000.0, 212500.0, 712500.0, 27500000.0, 5, '2026-04-09', 'Aktif', '2026-04-09');
DECLARE @pinjId9032 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9032 FROM (VALUES
  (500000.0,212500.0,712500.0,'2026-04-09',1,'Reguler','Dibayar',712500.0,'2026-04-09'),
  (500000.0,212500.0,712500.0,'2026-05-09',2,'Reguler','Dibayar',712500.0,'2026-05-09'),
  (500000.0,212500.0,712500.0,'2026-06-09',3,'Reguler','Dibayar',712500.0,'2026-06-09'),
  (500000.0,212500.0,712500.0,'2026-07-09',4,'Reguler','Dibayar',712500.0,'2026-07-09'),
  (500000.0,212500.0,712500.0,'2026-08-09',5,'Reguler','Dibayar',712500.0,'2026-08-09'),
  (500000.0,212500.0,712500.0,'2026-09-09',6,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2026-10-09',7,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2026-11-09',8,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2026-12-09',9,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-01-09',10,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-02-09',11,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-03-09',12,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-04-09',13,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-05-09',14,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-06-09',15,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-07-09',16,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-08-09',17,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-09-09',18,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-10-09',19,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-11-09',20,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2027-12-09',21,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-01-09',22,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-02-09',23,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-03-09',24,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-04-09',25,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-05-09',26,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-06-09',27,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-07-09',28,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-08-09',29,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-09-09',30,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-10-09',31,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-11-09',32,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2028-12-09',33,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-01-09',34,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-02-09',35,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-03-09',36,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-04-09',37,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-05-09',38,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-06-09',39,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-07-09',40,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-08-09',41,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-09-09',42,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-10-09',43,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-11-09',44,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2029-12-09',45,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-01-09',46,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-02-09',47,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-03-09',48,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-04-09',49,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-05-09',50,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-06-09',51,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-07-09',52,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-08-09',53,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-09-09',54,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-10-09',55,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-11-09',56,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2030-12-09',57,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2031-01-09',58,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2031-02-09',59,'Reguler','Belum',NULL,NULL),
  (500000.0,212500.0,712500.0,'2031-03-09',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

DECLARE @nik9033 NVARCHAR(50) = 'T.208255';
DECLARE @pid9033 INT = (SELECT Id FROM Pengguna WHERE NomorIndukKaryawan=@nik9033);
IF @pid9033 IS NULL THROW 51000, 'NIK tidak ditemukan: T.208255', 1;
INSERT INTO PengajuanPinjaman (PenggunaId, NomorPengajuan, Nominal, TenorBulan, BungaTahunan, EstimasiCicilanBulanan, EstimasiTotalJasa, Tujuan, Status, DiputuskanPada, DibuatPada)
VALUES (@pid9033, 'PLJ-FA26-9033', 50000000.0, 60, 0.085, 1187500.0, 21250000.2, N'[Migrasi data lama]', 'Disetujui', '2026-01-21', '2026-01-21');
DECLARE @pengajuanId9033 INT = SCOPE_IDENTITY();
INSERT INTO Pinjaman (PenggunaId, PengajuanPinjamanId, NomorPinjaman, Pokok, TenorBulan, BungaTahunan, PokokPerBulan, JasaPerBulan, AngsuranPerBulan, SisaPokok, AngsuranTerbayar, TanggalMulai, Status, DibuatPada)
VALUES (@pid9033, @pengajuanId9033, 'PJM-FA26-9033', 50000000.0, 60, 0.085, 833333.33, 354166.67, 1187500.0, 43333333.33, 8, '2026-01-21', 'Aktif', '2026-01-21');
DECLARE @pinjId9033 INT = SCOPE_IDENTITY();
INSERT INTO AngsuranPinjaman (Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, PinjamanId)
SELECT Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada, @pinjId9033 FROM (VALUES
  (833333.33,354166.67,1187500.0,'2026-01-21',1,'Reguler','Dibayar',1187500.0,'2026-01-21'),
  (833333.33,354166.67,1187500.0,'2026-02-21',2,'Reguler','Dibayar',1187500.0,'2026-02-21'),
  (833333.33,354166.67,1187500.0,'2026-03-21',3,'Reguler','Dibayar',1187500.0,'2026-03-21'),
  (833333.33,354166.67,1187500.0,'2026-04-21',4,'Reguler','Dibayar',1187500.0,'2026-04-21'),
  (833333.33,354166.67,1187500.0,'2026-05-21',5,'Reguler','Dibayar',1187500.0,'2026-05-21'),
  (833333.33,354166.67,1187500.0,'2026-06-21',6,'Reguler','Dibayar',1187500.0,'2026-06-21'),
  (833333.33,354166.67,1187500.0,'2026-07-21',7,'Reguler','Dibayar',1187500.0,'2026-07-21'),
  (833333.33,354166.67,1187500.0,'2026-08-21',8,'Reguler','Dibayar',1187500.0,'2026-08-21'),
  (833333.33,354166.67,1187500.0,'2026-09-21',9,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-10-21',10,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-11-21',11,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2026-12-21',12,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-01-21',13,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-02-21',14,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-03-21',15,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-04-21',16,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-05-21',17,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-06-21',18,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-07-21',19,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-08-21',20,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-09-21',21,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-10-21',22,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-11-21',23,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2027-12-21',24,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-01-21',25,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-02-21',26,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-03-21',27,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-04-21',28,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-05-21',29,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-06-21',30,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-07-21',31,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-08-21',32,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-09-21',33,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-10-21',34,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-11-21',35,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2028-12-21',36,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-01-21',37,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-02-21',38,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-03-21',39,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-04-21',40,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-05-21',41,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-06-21',42,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-07-21',43,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-08-21',44,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-09-21',45,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-10-21',46,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-11-21',47,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2029-12-21',48,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-01-21',49,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-02-21',50,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-03-21',51,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-04-21',52,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-05-21',53,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-06-21',54,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-07-21',55,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-08-21',56,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-09-21',57,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-10-21',58,'Reguler','Belum',NULL,NULL),
  (833333.33,354166.67,1187500.0,'2030-11-21',59,'Reguler','Belum',NULL,NULL),
  (833333.53,354166.67,1187500.2,'2030-12-21',60,'Reguler','Belum',NULL,NULL)
) AS x(Pokok, Jasa, Total, JatuhTempo, AngsuranKe, Jenis, Status, JumlahDibayar, DibayarPada);

SELECT 'Ringkasan' AS Info, 37 AS Diupdate, 16 AS Dilunaskan, 33 AS Dibuat;
SELECT COUNT(*) AS TotalAktif, SUM(SisaPokok) AS TotalSisaPokokAktif FROM Pinjaman WHERE Status='Aktif';
SELECT COUNT(*) AS TotalLunas FROM Pinjaman WHERE Status='Lunas';
COMMIT;
END TRY
BEGIN CATCH
IF @@TRANCOUNT>0 ROLLBACK;
SELECT 'DIBATALKAN' AS Status, ERROR_MESSAGE() AS Error, ERROR_LINE() AS Baris;
END CATCH