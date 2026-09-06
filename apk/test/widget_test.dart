import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:apk/main.dart';

void main() {
  testWidgets('landing page menyediakan akses masuk dan daftar', (WidgetTester tester) async {
    final auth = AuthService();
    await tester.pumpWidget(MaterialApp(home: LandingPage(auth: auth)));

    expect(find.text('Layanan koperasi\ndalam satu ruang.'), findsOneWidget);
    expect(find.text('Masuk ke akun'), findsOneWidget);
    expect(find.text('Buat akun baru'), findsOneWidget);
  });

  testWidgets('beranda menampilkan empat layanan anggota', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: HomePage(auth: AuthService(), session: session)));

    expect(find.text('Beranda KKCS'), findsOneWidget);
    expect(find.byTooltip('Akun saya'), findsOneWidget);
    expect(find.text('Portal Mandiri Anggota'), findsOneWidget);
    expect(find.text('Ringkasan keuangan'), findsOneWidget);
    expect(find.text('Total simpanan'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -360));
    await tester.pump();
    expect(find.text('Pengumuman terbaru'), findsOneWidget);
    expect(find.text('Produk terbaru'), findsOneWidget);
    expect(find.text('Beras Premium 5 kg'), findsOneWidget);
    expect(find.text('Minyak Goreng 2 L'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -360));
    await tester.pump();
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('E-Loan'), findsOneWidget);
    expect(find.text('Katalog'), findsNWidgets(2));
    expect(find.text('E-RAT'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);
  });

  testWidgets('modul E-RAT menampilkan voting dan laporan tahunan', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: EratPage(session: session)));

    expect(find.text('Partisipasi E-RAT'), findsOneWidget);
    expect(find.text('Voting Digital'), findsOneWidget);
    expect(find.text('Setuju'), findsOneWidget);
    expect(find.text('Tolak'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -320));
    await tester.pump();
    expect(find.text('Laporan Tahunan'), findsOneWidget);
    expect(find.text('Unduh laporan tahunan'), findsOneWidget);
  });

  testWidgets('modul simpan pinjam menampilkan formulir E-Loan dan simulasi cicilan', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: DigitalSavingsLoanPage(session: session)));

    expect(find.text('Pengajuan Pinjaman (E-Loan)'), findsOneWidget);
    expect(find.text('Pengajuan Pinjaman / E-Loan'), findsOneWidget);
    expect(find.text('Nominal pinjaman'), findsOneWidget);
    expect(find.text('Tenor pinjaman'), findsOneWidget);
    expect(find.text('Tujuan pinjaman'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -360));
    await tester.pump();
    expect(find.text('Simulasi Cicilan'), findsOneWidget);
    expect(find.text('Estimasi cicilan per bulan'), findsOneWidget);
    expect(find.text('Ajukan pinjaman'), findsOneWidget);
    expect(find.text('Multi-Simpanan'), findsNothing);
    expect(find.text('Approval Workflow'), findsNothing);
  });

  testWidgets('modul unit usaha menampilkan katalog produk view-only', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: BusinessUnitPage(session: session)));

    expect(find.text('Katalog Produk Koperasi'), findsNWidgets(2));
    expect(find.text('Mode lihat saja'), findsOneWidget);
    expect(find.text('Beras Premium 5 kg'), findsOneWidget);
    expect(find.text('Rp 78.000'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -320));
    await tester.pump();
    expect(find.text('Digital Ordering'), findsOneWidget);
    expect(find.text('Pelajari tahap berikutnya'), findsOneWidget);
    expect(find.text('POS Toko Karyawan'), findsNothing);
    expect(find.text('Vendor & Supplier'), findsNothing);
  });

  testWidgets('akun menampilkan aksi manajemen anggota dan logout', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: AccountPage(auth: AuthService(), session: session)));

    expect(find.text('Akun saya'), findsOneWidget);
    expect(find.text('Data pribadi'), findsOneWidget);
    expect(find.text('Simpan perubahan'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -360));
    await tester.pump();
    await tester.drag(find.byType(ListView), const Offset(0, -320));
    await tester.pump();
    expect(find.text('Keluar dari akun'), findsOneWidget);
  });
}
