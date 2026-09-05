import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:apk/main.dart';

void main() {
  testWidgets('landing page menyediakan akses masuk dan daftar', (WidgetTester tester) async {
    final auth = AuthService();
    await tester.pumpWidget(MaterialApp(home: LandingPage(auth: auth)));

    expect(find.text('Koperasi yang tumbuh\nbersama anggotanya.'), findsOneWidget);
    expect(find.text('Masuk ke akun'), findsOneWidget);
    expect(find.text('Buat akun baru'), findsOneWidget);
  });

  testWidgets('beranda menampilkan lima modul dengan satu modul terbuka', (WidgetTester tester) async {
    const session = AuthSession(
      token: 'test-token',
      user: AuthUser(id: 1, namaLengkap: 'Test User', nomorIndukKaryawan: 'NIK-001', email: 'test@example.com'),
    );
    await tester.pumpWidget(MaterialApp(home: HomePage(auth: AuthService(), session: session)));

    expect(find.text('Beranda KKCS'), findsOneWidget);
    expect(find.byIcon(Icons.account_circle_outlined), findsOneWidget);
    expect(find.text('Manajemen Anggota & HR Integration'), findsOneWidget);
    expect(find.text('Simpan Pinjam Digital'), findsOneWidget);
    expect(find.text('Unit Usaha Tambahan'), findsOneWidget);
    expect(find.text('Akuntansi & Keuangan'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -280));
    await tester.pump();
    expect(find.text('Keamanan & Tata Kelola Enterprise'), findsOneWidget);
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
    expect(find.text('Laporan Potong Gaji'), findsOneWidget);
    expect(find.text('Portal Mandiri Anggota'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, -320));
    await tester.pump();
    expect(find.text('Keluar dari akun'), findsOneWidget);
  });
}
