import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const KkcsApp());
}

class KkcsApp extends StatelessWidget {
  const KkcsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KKCS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0B6E69),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F8F7),
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
        useMaterial3: true,
      ),
      home: const AuthGate(),
    );
  }
}

class AuthUser {
  const AuthUser({
    required this.id,
    required this.namaLengkap,
    required this.nomorIndukKaryawan,
    required this.statusKeanggotaan,
    this.email,
    this.nomorTelepon,
    this.alamat,
    this.fotoUrl,
  });

  final int id;
  final String namaLengkap;
  final String nomorIndukKaryawan;
  final String statusKeanggotaan;
  final String? email;
  final String? nomorTelepon;
  final String? alamat;
  final String? fotoUrl;

  bool get anggotaAktif => statusKeanggotaan == 'Aktif';

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as int,
      namaLengkap: json['namaLengkap'] as String,
      nomorIndukKaryawan: json['nomorIndukKaryawan'] as String,
      statusKeanggotaan: json['statusKeanggotaan'] as String? ?? 'Aktif',
      email: json['email'] as String?,
      nomorTelepon: json['nomorTelepon'] as String?,
      alamat: json['alamat'] as String?,
      fotoUrl: json['fotoUrl'] as String?,
    );
  }
}

class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final AuthUser user;
}

class ApiException implements Exception {
  const ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

class AuthService {
  static const _tokenKey = 'kkcs_auth_token';

  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5168';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5168';
    }
    return 'http://localhost:5168';
  }

  Future<AuthSession?> restoreSession() async {
    final preferences = await SharedPreferences.getInstance();
    final token = preferences.getString(_tokenKey);
    if (token == null || token.isEmpty) return null;

    try {
      final user = await currentUser(token);
      return AuthSession(token: token, user: user);
    } catch (_) {
      await preferences.remove(_tokenKey);
      return null;
    }
  }

  Future<AuthSession> login({required String nomorIndukKaryawan, required String password}) async {
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'nomorIndukKaryawan': nomorIndukKaryawan.trim(), 'password': password}),
        ));
    final session = _sessionFromResponse(response);
    await _saveToken(session.token);
    return session;
  }

  Future<AuthSession> register({
    required String namaLengkap,
    required String nomorIndukKaryawan,
    String? email,
    required String password,
  }) async {
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/auth/register'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'namaLengkap': namaLengkap.trim(),
            'nomorIndukKaryawan': nomorIndukKaryawan.trim(),
            'email': email?.trim(),
            'password': password,
          }),
        ));
    final session = _sessionFromResponse(response);
    await _saveToken(session.token);
    return session;
  }

  Future<AuthUser> currentUser(String token) async {
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/auth/me'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return AuthUser.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<List<Map<String, dynamic>>> getProducts() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/produk'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.cast<Map<String, dynamic>>();
  }

  Future<void> submitLoan({required double nominal, required int tenorBulan, required String tujuan}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/pinjaman'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({
            'nominal': nominal,
            'tenorBulan': tenorBulan,
            'tujuan': tujuan.trim(),
          }),
        ));
    _ensureSuccess(response);
  }

  Future<LoanOverview> fetchMyLoans() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/pinjaman/saya'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return LoanOverview.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  /// [jenis] = 'Angsuran' atau 'Pelunasan'. Diajukan anggota, disetujui pengurus.
  Future<void> requestLoanPayment({required int loanId, required String jenis}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/pinjaman/$loanId/pembayaran'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'jenis': jenis}),
        ));
    _ensureSuccess(response);
  }

  Future<SavingsOverview> fetchSavings() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/simpanan/saya'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return SavingsOverview.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  /// [jenis] = 'Setor' atau 'Tarik'.
  Future<void> requestSukarela({required String jenis, required double nominal}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/simpanan/sukarela'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'jenis': jenis, 'nominal': nominal}),
        ));
    _ensureSuccess(response);
  }

  Future<void> requestBerjangka({required int produkId}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/simpanan/berjangka'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'produkBerjangkaId': produkId}),
        ));
    _ensureSuccess(response);
  }

  Future<void> logout() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
  }

  Future<AuthUser> updateProfile({
    required String namaLengkap,
    String? email,
    String? nomorTelepon,
    String? alamat,
  }) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.put(
          Uri.parse('$baseUrl/api/auth/profile'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({
            'namaLengkap': namaLengkap.trim(),
            'email': email?.trim(),
            'nomorTelepon': nomorTelepon?.trim(),
            'alamat': alamat?.trim(),
          }),
        ));
    _ensureSuccess(response);
    return AuthUser.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<AuthUser> uploadProfilePhoto(XFile photo) async {
    final token = await _getToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/api/auth/profile/photo'))
      ..headers['Authorization'] = 'Bearer $token';
    request.files.add(http.MultipartFile.fromBytes(
      'file',
      await photo.readAsBytes(),
      filename: photo.name,
      contentType: _photoMediaType(photo),
    ));
    final response = await http.Response.fromStream(await request.send());
    _ensureSuccess(response);
    return AuthUser.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  MediaType _photoMediaType(XFile photo) {
    final mimeType = photo.mimeType;
    if (mimeType != null && mimeType.startsWith('image/')) {
      return MediaType.parse(mimeType);
    }

    final extension = photo.name.toLowerCase().split('.').last;
    return switch (extension) {
      'jpg' || 'jpeg' => MediaType('image', 'jpeg'),
      'webp' => MediaType('image', 'webp'),
      _ => MediaType('image', 'png'),
    };
  }

  Future<String> _getToken() async {
    final preferences = await SharedPreferences.getInstance();
    final token = preferences.getString(_tokenKey);
    if (token == null || token.isEmpty) throw const ApiException('Sesi login sudah berakhir.');
    return token;
  }

  Future<void> _saveToken(String token) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_tokenKey, token);
  }

  Future<http.Response> _sendRequest(Future<http.Response> Function() request) async {
    try {
      return await request();
    } on http.ClientException {
      throw const ApiException(
        'Tidak dapat terhubung ke server. Jalankan backend di http://localhost:5168 terlebih dahulu.',
      );
    }
  }

  AuthSession _sessionFromResponse(http.Response response) {
    _ensureSuccess(response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return AuthSession(
      token: json['token'] as String,
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }

  void _ensureSuccess(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    throw ApiException(_errorMessage(response));
  }

  String _errorMessage(http.Response response) {
    try {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      if (json['message'] is String) return json['message'] as String;
      final errors = json['errors'];
      if (errors is Map<String, dynamic>) {
        final messages = errors.values
            .whereType<List<dynamic>>()
            .expand((items) => items)
            .whereType<String>()
            .toList();
        if (messages.isNotEmpty) return messages.join(' ');
      }
    } catch (_) {
      // Use the status message when the response is not JSON.
    }
    if (response.statusCode == 401) return 'NIK atau password salah.';
    return 'Terjadi kesalahan pada server (${response.statusCode}).';
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthService();
    return FutureBuilder<AuthSession?>(
      future: auth.restoreSession(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        final session = snapshot.data;
        return session == null
            ? LandingPage(auth: auth)
            : HomePage(auth: auth, session: session);
      },
    );
  }
}

class LandingPage extends StatelessWidget {
  const LandingPage({required this.auth, super.key});

  final AuthService auth;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const _BrandMark(),
                  const SizedBox(height: 32),
                  Text(
                    'Layanan koperasi\ndalam satu ruang.',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          height: 1.05,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Selamat datang di KKCS. Akses layanan anggota dengan mudah, transparan, dan terarah.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          height: 1.5,
                        ),
                  ),
                  const SizedBox(height: 40),
                  FilledButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => LoginPage(auth: auth)),
                    ),
                    child: const Text('Masuk ke akun'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => RegisterPage(auth: auth)),
                    ),
                    child: const Text('Buat akun baru'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({required this.auth, super.key});

  final AuthService auth;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _nikController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _nikController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final session = await widget.auth.login(
        nomorIndukKaryawan: _nikController.text,
        password: _passwordController.text,
      );
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => HomePage(auth: widget.auth, session: session)),
        (_) => false,
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: 'Selamat datang kembali',
      subtitle: 'Masuk untuk melanjutkan ke akun KKCS Anda.',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _ErrorMessage(message: _error),
            TextFormField(
              controller: _nikController,
              decoration: const InputDecoration(labelText: 'Nomor Induk Karyawan (NIK)'),
              validator: _requiredNik,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _passwordController,
              obscureText: !_showPassword,
              decoration: InputDecoration(
                labelText: 'Password',
                suffixIcon: IconButton(
                  onPressed: () => setState(() => _showPassword = !_showPassword),
                  icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                  tooltip: 'Tampilkan password',
                ),
              ),
              validator: (value) => value == null || value.isEmpty ? 'Password wajib diisi' : null,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const _ButtonLoader() : const Text('Masuk'),
            ),
            const SizedBox(height: 18),
            TextButton(
              onPressed: () => Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => RegisterPage(auth: widget.auth)),
              ),
              child: const Text('Belum punya akun? Daftar'),
            ),
          ],
        ),
      ),
    );
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({required this.auth, super.key});

  final AuthService auth;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _nikController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _nikController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final session = await widget.auth.register(
        namaLengkap: _nameController.text,
        nomorIndukKaryawan: _nikController.text,
        email: _emailController.text,
        password: _passwordController.text,
      );
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => HomePage(auth: widget.auth, session: session)),
        (_) => false,
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: 'Buat akun KKCS',
      subtitle: 'Daftarkan akun anggota untuk mengakses layanan koperasi.',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _ErrorMessage(message: _error),
            TextFormField(
              controller: _nameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Nama lengkap'),
              validator: (value) => value == null || value.trim().isEmpty ? 'Nama wajib diisi' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _nikController,
              decoration: const InputDecoration(labelText: 'Nomor Induk Karyawan (NIK)'),
              validator: _requiredNik,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email (opsional)'),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _passwordController,
              obscureText: !_showPassword,
              decoration: InputDecoration(
                labelText: 'Password',
                suffixIcon: IconButton(
                  onPressed: () => setState(() => _showPassword = !_showPassword),
                  icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                  tooltip: 'Tampilkan password',
                ),
              ),
              validator: (value) => value != null && value.length >= 8 ? null : 'Minimal 8 karakter',
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _confirmController,
              obscureText: !_showPassword,
              decoration: const InputDecoration(labelText: 'Konfirmasi password'),
              validator: (value) => value == _passwordController.text ? null : 'Password belum sama',
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const _ButtonLoader() : const Text('Daftar'),
            ),
            const SizedBox(height: 18),
            TextButton(
              onPressed: () => Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => LoginPage(auth: widget.auth)),
              ),
              child: const Text('Sudah punya akun? Masuk'),
            ),
          ],
        ),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({required this.auth, required this.session, super.key});

  final AuthService auth;
  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    if (!session.user.anggotaAktif) {
      return MembershipStatusPage(auth: auth, user: session.user);
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Beranda KKCS'),
        actions: [
          IconButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => _ServiceShell(
                  auth: auth,
                  session: session,
                  selectedIndex: 0,
                  child: AccountPage(auth: auth, session: session),
                ),
              ),
            ),
            icon: _ProfileAvatar(user: session.user, radius: 16),
            tooltip: 'Akun saya',
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Text(
              'Halo, ${session.user.namaLengkap.split(' ').first}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              'Akses layanan anggota dan transparansi koperasi dalam satu tempat.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 20),
            const _TransparencyDashboard(),
            const SizedBox(height: 24),
            _HomeAnnouncementCard(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => EratPage(session: session)),
              ),
            ),
            const SizedBox(height: 20),
            const _LatestProductsPreview(),
            const SizedBox(height: 24),
            Text(
              'Pilih layanan dari navigasi di bawah.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 0) return;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => _ServiceShell(
                auth: auth,
                session: session,
                selectedIndex: index,
                child: _servicePage(index),
              ),
            ),
          );
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Beranda'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Simpan Pinjam'),
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Katalog'),
          NavigationDestination(icon: Icon(Icons.how_to_vote_outlined), label: 'E-RAT'),
        ],
      ),
    );
  }

  Widget _servicePage(int index) {
    return switch (index) {
      1 => DigitalSavingsLoanPage(session: session),
      2 => BusinessUnitPage(session: session),
      3 => EratPage(session: session),
      _ => AccountPage(auth: auth, session: session),
    };
  }
}

class _ServiceShell extends StatelessWidget {
  const _ServiceShell({required this.auth, required this.session, required this.selectedIndex, required this.child});

  final AuthService auth;
  final AuthSession session;
  final int selectedIndex;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          if (index == 0) {
            Navigator.pop(context);
            return;
          }
          if (index == selectedIndex) return;
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => _ServiceShell(
                auth: auth,
                session: session,
                selectedIndex: index,
                child: _servicePage(index),
              ),
            ),
          );
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Beranda'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Simpan Pinjam'),
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Katalog'),
          NavigationDestination(icon: Icon(Icons.how_to_vote_outlined), label: 'E-RAT'),
        ],
      ),
    );
  }

  Widget _servicePage(int index) {
    return switch (index) {
      1 => DigitalSavingsLoanPage(session: session),
      2 => BusinessUnitPage(session: session),
      3 => EratPage(session: session),
      _ => AccountPage(auth: auth, session: session),
    };
  }
}

class _TransparencyDashboard extends StatelessWidget {
  const _TransparencyDashboard();

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: colors.primary,
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
            child: Row(
              children: [
                Icon(Icons.visibility_outlined, color: colors.onPrimary),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Portal Mandiri Anggota',
                        style: TextStyle(color: colors.onPrimary, fontWeight: FontWeight.w800, fontSize: 17),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Dashboard transparansi keanggotaan Anda',
                        style: TextStyle(color: colors.onPrimary.withValues(alpha: .82)),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.lock_open_outlined, color: colors.onPrimary.withValues(alpha: .8), size: 18),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ringkasan keuangan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                Row(
                  children: const [
                    Expanded(child: _DashboardMetric(icon: Icons.savings_outlined, label: 'Total simpanan', value: 'Belum tersedia')),
                    SizedBox(width: 10),
                    Expanded(child: _DashboardMetric(icon: Icons.request_quote_outlined, label: 'Pinjaman aktif', value: 'Belum tersedia')),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: const [
                    Expanded(child: _DashboardMetric(icon: Icons.payments_outlined, label: 'Cicilan berjalan', value: 'Belum tersedia')),
                    SizedBox(width: 10),
                    Expanded(child: _DashboardMetric(icon: Icons.auto_graph_outlined, label: 'Estimasi SHU', value: 'Belum tersedia')),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.sync_outlined, size: 15, color: colors.onSurfaceVariant),
                    const SizedBox(width: 6),
                    Text('Pembaruan data: menunggu integrasi transaksi', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeAnnouncementCard extends StatelessWidget {
  const _HomeAnnouncementCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      color: colors.tertiaryContainer,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: colors.tertiary,
                child: Icon(Icons.campaign_outlined, color: colors.onTertiary),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Pengumuman terbaru', style: TextStyle(fontWeight: FontWeight.w800)),
                    SizedBox(height: 4),
                    Text('Voting E-RAT akan segera dibuka. Lihat agenda dan berikan suara Anda.'),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class _LatestProductsPreview extends StatelessWidget {
  const _LatestProductsPreview();

  static const products = [
    ('Beras Premium 5 kg', 'Rp 78.000', 'Tersedia'),
    ('Minyak Goreng 2 L', 'Rp 36.500', 'Tersedia'),
    ('Paket Sembako Hemat', 'Rp 125.000', 'Tersedia'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('Produk terbaru', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
            ),
            Text('Katalog', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Theme.of(context).colorScheme.primary)),
          ],
        ),
        const SizedBox(height: 10),
        ...products.map((product) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.shopping_bag_outlined)),
                title: Text(product.$1, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text(product.$3),
                trailing: Text(product.$2, style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
            )),
      ],
    );
  }
}

class _DashboardMetric extends StatelessWidget {
  const _DashboardMetric({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      constraints: const BoxConstraints(minHeight: 82),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: .45),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 19, color: colors.primary),
          const SizedBox(height: 7),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 3),
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
        ],
      ),
    );
  }
}

class EratPage extends StatefulWidget {
  const EratPage({required this.session, super.key});

  final AuthSession session;

  @override
  State<EratPage> createState() => _EratPageState();
}

class _EratPageState extends State<EratPage> {
  String? _vote;

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Partisipasi E-RAT')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Text(
              'Rapat Anggota Tahunan Digital',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              'Gunakan hak suara dan akses laporan koperasi secara mandiri.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 20),
            _AccountSectionCard(
              icon: Icons.how_to_vote_outlined,
              title: 'Voting Digital',
              subtitle: 'Suara anggota aktif untuk keputusan penting koperasi.',
              children: [
                const _InfoRow(label: 'Agenda voting', value: 'Belum tersedia'),
                const _InfoRow(label: 'Periode voting', value: 'Menunggu jadwal E-RAT'),
                const SizedBox(height: 8),
                RadioListTile<String>(
                  contentPadding: EdgeInsets.zero,
                  value: 'setuju',
                  groupValue: _vote,
                  title: const Text('Setuju'),
                  onChanged: (value) => setState(() => _vote = value),
                ),
                RadioListTile<String>(
                  contentPadding: EdgeInsets.zero,
                  value: 'tolak',
                  groupValue: _vote,
                  title: const Text('Tolak'),
                  onChanged: (value) => setState(() => _vote = value),
                ),
                FilledButton.icon(
                  onPressed: _vote == null ? null : () => _showMessage('Voting akan tersedia saat periode E-RAT aktif.'),
                  icon: const Icon(Icons.how_to_vote_outlined),
                  label: const Text('Kirim suara'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _AccountSectionCard(
              icon: Icons.description_outlined,
              title: 'Laporan Tahunan',
              subtitle: 'Dokumen operasional dan finansial koperasi.',
              children: [
                const _InfoRow(label: 'Laporan tahun terakhir', value: 'Belum tersedia'),
                const _InfoRow(label: 'Format dokumen', value: 'PDF'),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () => _showMessage('Laporan tahunan akan tersedia setelah dokumen diterbitkan.'),
                  icon: const Icon(Icons.download_outlined),
                  label: const Text('Unduh laporan tahunan'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('Akun: ${widget.session.user.namaLengkap}', style: Theme.of(context).textTheme.labelSmall),
          ],
        ),
      ),
    );
  }
}

class DigitalSavingsLoanPage extends StatelessWidget {
  const DigitalSavingsLoanPage({required this.session, super.key});

  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Simpanan & Pinjaman Digital'),
          bottom: const TabBar(tabs: [
            Tab(icon: Icon(Icons.savings_outlined), text: 'Simpanan'),
            Tab(icon: Icon(Icons.request_quote_outlined), text: 'Pinjaman'),
          ]),
        ),
        body: SafeArea(
          child: TabBarView(children: [
            SavingsTab(session: session),
            LoanTab(session: session),
          ]),
        ),
      ),
    );
  }
}

class LoanTab extends StatefulWidget {
  const LoanTab({required this.session, super.key});

  final AuthSession session;

  @override
  State<LoanTab> createState() => _LoanTabState();
}

class _LoanTabState extends State<LoanTab> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController(text: '10000000');
  final _purposeController = TextEditingController();
  int _tenor = 12;
  bool _submittingLoan = false;
  bool _loadingLoans = true;
  String? _loansError;
  LoanOverview? _overview;
  int? _paymentBusyLoanId;

  @override
  void initState() {
    super.initState();
    _loadLoans();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  double get _amount => double.tryParse(_amountController.text.replaceAll('.', '').replaceAll(',', '')) ?? 0;

  LoanInstallmentBreakdown get _breakdown => LoanInstallmentBreakdown.compute(_amount, _tenor);

  Future<void> _loadLoans() async {
    setState(() {
      _loadingLoans = true;
      _loansError = null;
    });
    try {
      final overview = await AuthService().fetchMyLoans();
      if (!mounted) return;
      setState(() => _overview = overview);
    } catch (error) {
      if (mounted) setState(() => _loansError = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loadingLoans = false);
    }
  }

  Future<void> _requestPayment(Loan loan, String jenis) async {
    final isPayoff = jenis == 'Pelunasan';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(isPayoff ? 'Ajukan pelunasan dipercepat' : 'Ajukan pembayaran angsuran'),
        content: Text(isPayoff
            ? 'Anda akan mengajukan pelunasan pinjaman ${loan.nomorPinjaman} sebesar ${formatRupiah(loan.nilaiPelunasanDipercepat)} (sisa pokok). '
                'Jasa ${formatRupiah(loan.jasaDibebaskan)} dibebaskan. Pengajuan diverifikasi pengurus terlebih dahulu.'
            : 'Anda akan mengajukan pembayaran 1 angsuran ${loan.nomorPinjaman} sebesar ${formatRupiah(loan.angsuranPerBulan)}. '
                'Pengajuan diverifikasi pengurus terlebih dahulu.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Batal')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Ajukan')),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _paymentBusyLoanId = loan.id);
    try {
      await AuthService().requestLoanPayment(loanId: loan.id, jenis: jenis);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pengajuan terkirim. Menunggu persetujuan pengurus.')),
      );
      await _loadLoans();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString().replaceFirst('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _paymentBusyLoanId = null);
    }
  }

  Future<void> _submitLoan() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submittingLoan = true);
    try {
      await AuthService().submitLoan(
        nominal: _amount,
        tenorBulan: _tenor,
        tujuan: _purposeController.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pengajuan pinjaman berhasil dikirim. Menunggu persetujuan pengurus.')),
      );
      _purposeController.clear();
      await _loadLoans();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString().replaceFirst('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _submittingLoan = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final overview = _overview;
    final activeLoans = overview?.pinjaman.where((loan) => !loan.lunas).toList() ?? const <Loan>[];
    final settledLoans = overview?.pinjaman.where((loan) => loan.lunas).toList() ?? const <Loan>[];
    final pendingApplications = overview?.pengajuan.where((item) => item.status == 'Diajukan').toList() ?? const <LoanApplication>[];

    return RefreshIndicator(
          onRefresh: _loadLoans,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            children: [
              Text(
                'Halo, ${widget.session.user.namaLengkap.split(' ').first}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                'Ajukan pinjaman, bayar angsuran, dan pelunasan dipercepat secara paperless.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
              ),
              const SizedBox(height: 20),
              if (_loadingLoans) const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: LinearProgressIndicator(minHeight: 2),
              ),
              if (_loansError != null) Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(_loansError!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ),
              for (final loan in activeLoans) ...[
                _ActiveLoanCard(
                  loan: loan,
                  busy: _paymentBusyLoanId == loan.id,
                  onRequestPayment: (jenis) => _requestPayment(loan, jenis),
                ),
                const SizedBox(height: 16),
              ],
              for (final application in pendingApplications) ...[
                _PendingApplicationCard(application: application),
                const SizedBox(height: 16),
              ],
              _AccountSectionCard(
                icon: Icons.request_quote_outlined,
                title: 'Pengajuan Pinjaman / E-Loan',
                subtitle: 'Lengkapi formulir pengajuan pinjaman baru.',
                children: [
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextFormField(
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Nominal pinjaman', prefixText: 'Rp '),
                          onChanged: (_) => setState(() {}),
                          validator: (value) => _amount > 0 ? null : 'Nominal pinjaman wajib diisi',
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<int>(
                          value: _tenor,
                          decoration: const InputDecoration(labelText: 'Tenor pinjaman'),
                          items: kLoanAnnualRates.entries
                              .map((entry) => DropdownMenuItem(
                                    value: entry.key,
                                    child: Text('${entry.key ~/ 12} tahun (${entry.key} bln) — jasa ${(entry.value * 100).toStringAsFixed(2)}%/th'),
                                  ))
                              .toList(),
                          onChanged: (value) => setState(() => _tenor = value ?? 12),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _purposeController,
                          maxLines: 2,
                          decoration: const InputDecoration(labelText: 'Tujuan pinjaman'),
                          validator: (value) => value == null || value.trim().isEmpty ? 'Tujuan pinjaman wajib diisi' : null,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _AccountSectionCard(
                icon: Icons.calculate_outlined,
                title: 'Simulasi Cicilan',
                subtitle: 'Skema KKCS: jasa flat ${(kLoanAnnualRates[_tenor]! * 100).toStringAsFixed(2)}% per tahun untuk tenor ini.',
                children: [
                  _InfoRow(label: 'Pokok pinjaman', value: formatRupiah(_amount)),
                  _InfoRow(label: 'Tenor', value: '$_tenor bulan'),
                  const Divider(height: 20),
                  _InfoRow(label: 'Pokok / bulan', value: formatRupiah(_breakdown.principalPerMonth)),
                  _InfoRow(label: 'Jasa / bulan', value: formatRupiah(_breakdown.interestPerMonth)),
                  _InfoRow(label: 'Cicilan / bulan', value: formatRupiah(_breakdown.installmentPerMonth)),
                  const Divider(height: 20),
                  _InfoRow(label: 'Total jasa ($_tenor bln)', value: formatRupiah(_breakdown.totalInterest)),
                  _InfoRow(label: 'Total pembayaran', value: formatRupiah(_breakdown.totalPayment)),
                  const SizedBox(height: 8),
                  Text(
                    'Jika dilunasi sebelum tenor berakhir, Anda cukup membayar sisa pokok — jasa bulan berikutnya tidak dibebankan.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                  ),
                  const SizedBox(height: 10),
                  FilledButton.icon(
                    onPressed: _submittingLoan ? null : _submitLoan,
                    icon: _submittingLoan
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_outlined),
                    label: Text(_submittingLoan ? 'Mengirim...' : 'Ajukan pinjaman'),
                  ),
                ],
              ),
              if (settledLoans.isNotEmpty) ...[
                const SizedBox(height: 16),
                _AccountSectionCard(
                  icon: Icons.verified_outlined,
                  title: 'Riwayat pinjaman lunas',
                  subtitle: 'Pinjaman yang sudah selesai.',
                  children: [
                    for (final loan in settledLoans)
                      _InfoRow(label: loan.nomorPinjaman, value: '${formatRupiah(loan.pokok)} · Lunas'),
                  ],
                ),
              ],
            ],
          ),
        );
  }
}

class _PendingApplicationCard extends StatelessWidget {
  const _PendingApplicationCard({required this.application});

  final LoanApplication application;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      color: colors.surfaceContainerHighest.withValues(alpha: .5),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.hourglass_top_outlined, size: 18, color: colors.primary),
                const SizedBox(width: 8),
                const Expanded(child: Text('Pengajuan menunggu persetujuan', style: TextStyle(fontWeight: FontWeight.w800))),
              ],
            ),
            const SizedBox(height: 10),
            _InfoRow(label: 'Nomor pengajuan', value: application.nomorPengajuan),
            _InfoRow(label: 'Nominal', value: formatRupiah(application.nominal)),
            _InfoRow(label: 'Tenor', value: '${application.tenorBulan} bulan'),
            _InfoRow(label: 'Estimasi cicilan / bulan', value: formatRupiah(application.estimasiCicilanBulanan)),
          ],
        ),
      ),
    );
  }
}

class _ActiveLoanCard extends StatelessWidget {
  const _ActiveLoanCard({required this.loan, required this.busy, required this.onRequestPayment});

  final Loan loan;
  final bool busy;
  final void Function(String jenis) onRequestPayment;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final progress = loan.tenorBulan == 0 ? 0.0 : loan.angsuranTerbayar / loan.tenorBulan;
    final pending = loan.pembayaranTertunda;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: colors.primary,
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(
              children: [
                Icon(Icons.request_quote_outlined, color: colors.onPrimary),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Pinjaman aktif', style: TextStyle(color: colors.onPrimary, fontWeight: FontWeight.w800, fontSize: 16)),
                      Text(loan.nomorPinjaman, style: TextStyle(color: colors.onPrimary.withValues(alpha: .85), fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(value: progress.clamp(0.0, 1.0), minHeight: 8),
                ),
                const SizedBox(height: 6),
                Text(
                  'Angsuran ke-${loan.angsuranTerbayar} dari ${loan.tenorBulan} · sisa ${loan.sisaAngsuran} bulan',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 10),
                _InfoRow(label: 'Pokok pinjaman', value: formatRupiah(loan.pokok)),
                _InfoRow(label: 'Cicilan / bulan', value: formatRupiah(loan.angsuranPerBulan)),
                Padding(
                  padding: const EdgeInsets.only(bottom: 7),
                  child: Text(
                    'Pokok ${formatRupiah(loan.pokokPerBulan)} + jasa ${formatRupiah(loan.jasaPerBulan)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                  ),
                ),
                _InfoRow(label: 'Sisa pokok', value: formatRupiah(loan.sisaPokok)),
                const SizedBox(height: 12),
                if (pending != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: colors.surfaceContainerHighest.withValues(alpha: .55),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.hourglass_top_outlined, size: 18, color: colors.primary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            pending.jenis == 'Pelunasan'
                                ? 'Pengajuan pelunasan dipercepat ${formatRupiah(pending.jumlahDiajukan)} menunggu persetujuan pengurus.'
                                : 'Pengajuan pembayaran angsuran ${formatRupiah(pending.jumlahDiajukan)} menunggu persetujuan pengurus.',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ],
                    ),
                  )
                else ...[
                  FilledButton.icon(
                    onPressed: busy ? null : () => onRequestPayment('Angsuran'),
                    icon: const Icon(Icons.payments_outlined, size: 18),
                    label: Text('Ajukan pembayaran angsuran (${formatRupiah(loan.angsuranPerBulan)})'),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: colors.tertiaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.bolt_outlined, size: 18, color: colors.onTertiaryContainer),
                            const SizedBox(width: 8),
                            Text('Pelunasan dipercepat', style: TextStyle(fontWeight: FontWeight.w800, color: colors.onTertiaryContainer)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Bayar sekarang', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.onTertiaryContainer)),
                        Text(formatRupiah(loan.nilaiPelunasanDipercepat),
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, color: colors.onTertiaryContainer)),
                        const SizedBox(height: 4),
                        Text(
                          loan.jasaDibebaskan > 0
                              ? 'Hanya sisa pokok — jasa ${formatRupiah(loan.jasaDibebaskan)} dibebaskan.'
                              : 'Anda hanya membayar sisa pokok, tanpa tambahan jasa.',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.onTertiaryContainer),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          onPressed: busy ? null : () => onRequestPayment('Pelunasan'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: colors.onTertiaryContainer,
                            side: BorderSide(color: colors.onTertiaryContainer.withValues(alpha: .4)),
                          ),
                          icon: const Icon(Icons.bolt_outlined, size: 18),
                          label: const Text('Ajukan pelunasan dipercepat'),
                        ),
                        const SizedBox(height: 6),
                        Text('Pengajuan diverifikasi pengurus koperasi sebelum pinjaman dinyatakan lunas.',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: colors.onTertiaryContainer.withValues(alpha: .8))),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    childrenPadding: EdgeInsets.zero,
                    title: const Text('Lihat jadwal angsuran'),
                    children: [_LoanScheduleTable(installments: loan.angsuran)],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LoanScheduleTable extends StatelessWidget {
  const _LoanScheduleTable({required this.installments});

  final List<LoanInstallment> installments;

  String _month(DateTime date) {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return '${names[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columnSpacing: 18,
        headingRowHeight: 36,
        dataRowMinHeight: 34,
        dataRowMaxHeight: 44,
        columns: const [
          DataColumn(label: Text('#')),
          DataColumn(label: Text('Jatuh tempo')),
          DataColumn(label: Text('Pokok')),
          DataColumn(label: Text('Jasa')),
          DataColumn(label: Text('Total')),
          DataColumn(label: Text('Status')),
        ],
        rows: [
          for (final item in installments)
            DataRow(cells: [
              DataCell(Text(item.jenis == 'Pelunasan' ? '⚡' : '${item.angsuranKe}')),
              DataCell(Text(_month(item.jatuhTempo))),
              DataCell(Text(formatRupiah(item.pokok))),
              DataCell(Text(item.jasa == 0 ? '—' : formatRupiah(item.jasa))),
              DataCell(Text(formatRupiah(item.total))),
              DataCell(Text(
                item.status,
                style: TextStyle(
                  color: switch (item.status) {
                    'Dibayar' => Colors.green.shade700,
                    'Dibatalkan' => Colors.black45,
                    _ => Colors.orange.shade800,
                  },
                ),
              )),
            ]),
        ],
      ),
    );
  }
}

class BusinessUnitPage extends StatefulWidget {
  const BusinessUnitPage({required this.session, super.key});

  final AuthSession session;

  @override
  State<BusinessUnitPage> createState() => _BusinessUnitPageState();
}

class _BusinessUnitPageState extends State<BusinessUnitPage> {
  static const fallbackProducts = [
    _CatalogProduct('Beras Premium 5 kg', 'Rp 78.000', 'Tersedia', Icons.shopping_bag_outlined),
    _CatalogProduct('Minyak Goreng 2 L', 'Rp 36.500', 'Tersedia', Icons.local_drink_outlined),
    _CatalogProduct('Gula Pasir 1 kg', 'Rp 17.000', 'Stok terbatas', Icons.inventory_2_outlined),
    _CatalogProduct('Paket Sembako Hemat', 'Rp 125.000', 'Tersedia', Icons.local_mall_outlined),
  ];

  List<_CatalogProduct> _products = fallbackProducts;
  bool _loadingProducts = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final products = await AuthService().getProducts();
      if (!mounted || products.isEmpty) return;
      setState(() => _products = products.map(_CatalogProduct.fromJson).toList());
    } catch (_) {
      // Keep the local preview while the inventory API is unavailable.
    } finally {
      if (mounted) setState(() => _loadingProducts = false);
    }
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Digital Ordering akan tersedia pada tahap berikutnya.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Katalog Produk Koperasi')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Text(
              'Katalog Produk Koperasi',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              'Lihat harga dan ketersediaan barang sebelum datang ke toko koperasi.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.visibility_outlined, size: 15, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 6),
                const Text('Mode lihat saja', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 20),
            if (_loadingProducts) const LinearProgressIndicator(minHeight: 2),
            ..._products.map((product) => _CatalogProductTile(product: product)),
            const SizedBox(height: 8),
            Card(
              color: Theme.of(context).colorScheme.secondaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.shopping_cart_outlined, color: Theme.of(context).colorScheme.onSecondaryContainer),
                        const SizedBox(width: 10),
                        const Expanded(child: Text('Digital Ordering', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16))),
                        const Icon(Icons.lock_outline, size: 18),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('Pilih barang, checkout dari smartphone, dan pembayaran langsung terhubung dengan saldo simpanan atau limit cicilan.'),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => _showComingSoon(context),
                      icon: const Icon(Icons.arrow_forward_outlined),
                      label: const Text('Pelajari tahap berikutnya'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Data katalog terakhir diperbarui oleh koperasi. Hubungi toko jika informasi stok berbeda saat kunjungan.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 8),
            Text('Untuk ${widget.session.user.namaLengkap}', style: Theme.of(context).textTheme.labelSmall),
          ],
        ),
      ),
    );
  }
}

class _CatalogProduct {
  const _CatalogProduct(this.name, this.price, this.availability, this.icon);

  factory _CatalogProduct.fromJson(Map<String, dynamic> json) {
    final stock = (json['stok'] as num?)?.toDouble() ?? 0;
    return _CatalogProduct(
      json['nama'] as String,
      _formatCatalogPrice((json['harga'] as num?)?.toDouble() ?? 0),
      stock > 0 ? (stock < 5 ? 'Stok terbatas' : 'Tersedia') : 'Stok belum tersedia',
      Icons.shopping_bag_outlined,
    );
  }

  final String name;
  final String price;
  final String availability;
  final IconData icon;
}

class _CatalogProductTile extends StatelessWidget {
  const _CatalogProductTile({required this.product});

  final _CatalogProduct product;

  @override
  Widget build(BuildContext context) {
    final isLimited = product.availability == 'Stok terbatas';
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(product.icon),
        ),
        title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 5),
          child: Text(product.availability, style: TextStyle(color: isLimited ? Colors.orange.shade800 : Colors.green.shade700)),
        ),
        trailing: Text(product.price, style: const TextStyle(fontWeight: FontWeight.w800)),
      ),
    );
  }
}

String _formatCatalogPrice(double value) {
  final rounded = value.round().toString();
  return 'Rp ${rounded.replaceAllMapped(RegExp(r'(?<=\d)(?=(\d{3})+$)'), (_) => '.')}';
}

// ── Pinjaman ─────────────────────────────────────────────────────────────────
// Tabel Pinjaman KKCS (per 1 Juli 2023): bunga flat tahunan menurut tenor.
const Map<int, double> kLoanAnnualRates = {
  12: 0.0700,
  24: 0.0725,
  36: 0.0750,
  48: 0.0800,
  60: 0.0850,
};

String formatRupiah(num value) {
  final rounded = value.round().toString();
  final withDots = rounded.replaceAllMapped(RegExp(r'(?<=\d)(?=(\d{3})+$)'), (_) => '.');
  return 'Rp $withDots';
}

/// Rincian satu angsuran: pokok (inti) + jasa (bunga).
class LoanInstallmentBreakdown {
  const LoanInstallmentBreakdown({
    required this.principalPerMonth,
    required this.interestPerMonth,
    required this.installmentPerMonth,
    required this.totalInterest,
    required this.totalPayment,
  });

  final double principalPerMonth;
  final double interestPerMonth;
  final double installmentPerMonth;
  final double totalInterest;
  final double totalPayment;

  factory LoanInstallmentBreakdown.compute(double nominal, int tenorBulan) {
    final rate = kLoanAnnualRates[tenorBulan] ?? 0;
    final principal = nominal <= 0 ? 0.0 : (nominal / tenorBulan);
    final interest = nominal <= 0 ? 0.0 : (nominal * rate / 12);
    return LoanInstallmentBreakdown(
      principalPerMonth: principal,
      interestPerMonth: interest,
      installmentPerMonth: principal + interest,
      totalInterest: interest * tenorBulan,
      totalPayment: nominal + interest * tenorBulan,
    );
  }
}

class LoanApplication {
  const LoanApplication({
    required this.id,
    required this.nomorPengajuan,
    required this.nominal,
    required this.tenorBulan,
    required this.bungaTahunan,
    required this.estimasiCicilanBulanan,
    required this.estimasiTotalJasa,
    required this.tujuan,
    required this.status,
    this.catatanReview,
  });

  final int id;
  final String nomorPengajuan;
  final double nominal;
  final int tenorBulan;
  final double bungaTahunan;
  final double estimasiCicilanBulanan;
  final double estimasiTotalJasa;
  final String tujuan;
  final String status;
  final String? catatanReview;

  factory LoanApplication.fromJson(Map<String, dynamic> json) => LoanApplication(
        id: json['id'] as int,
        nomorPengajuan: json['nomorPengajuan'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        tenorBulan: json['tenorBulan'] as int,
        bungaTahunan: (json['bungaTahunan'] as num).toDouble(),
        estimasiCicilanBulanan: (json['estimasiCicilanBulanan'] as num).toDouble(),
        estimasiTotalJasa: (json['estimasiTotalJasa'] as num).toDouble(),
        tujuan: json['tujuan'] as String,
        status: json['status'] as String,
        catatanReview: json['catatanReview'] as String?,
      );
}

class LoanInstallment {
  const LoanInstallment({
    required this.angsuranKe,
    required this.jatuhTempo,
    required this.pokok,
    required this.jasa,
    required this.total,
    required this.jenis,
    required this.status,
  });

  final int angsuranKe;
  final DateTime jatuhTempo;
  final double pokok;
  final double jasa;
  final double total;
  final String jenis;
  final String status;

  factory LoanInstallment.fromJson(Map<String, dynamic> json) => LoanInstallment(
        angsuranKe: json['angsuranKe'] as int,
        jatuhTempo: DateTime.parse(json['jatuhTempo'] as String),
        pokok: (json['pokok'] as num).toDouble(),
        jasa: (json['jasa'] as num).toDouble(),
        total: (json['total'] as num).toDouble(),
        jenis: json['jenis'] as String,
        status: json['status'] as String,
      );
}

class PendingLoanPayment {
  const PendingLoanPayment({required this.jenis, required this.jumlahDiajukan});

  final String jenis;
  final double jumlahDiajukan;

  factory PendingLoanPayment.fromJson(Map<String, dynamic> json) => PendingLoanPayment(
        jenis: json['jenis'] as String,
        jumlahDiajukan: (json['jumlahDiajukan'] as num).toDouble(),
      );
}

class Loan {
  const Loan({
    required this.id,
    required this.nomorPinjaman,
    required this.pokok,
    required this.tenorBulan,
    required this.bungaTahunan,
    required this.pokokPerBulan,
    required this.jasaPerBulan,
    required this.angsuranPerBulan,
    required this.sisaPokok,
    required this.angsuranTerbayar,
    required this.sisaAngsuran,
    required this.status,
    required this.nilaiPelunasanDipercepat,
    required this.jasaDibebaskan,
    required this.pembayaranTertunda,
    required this.angsuran,
  });

  final int id;
  final String nomorPinjaman;
  final double pokok;
  final int tenorBulan;
  final double bungaTahunan;
  final double pokokPerBulan;
  final double jasaPerBulan;
  final double angsuranPerBulan;
  final double sisaPokok;
  final int angsuranTerbayar;
  final int sisaAngsuran;
  final String status;
  final double nilaiPelunasanDipercepat;
  final double jasaDibebaskan;
  final PendingLoanPayment? pembayaranTertunda;
  final List<LoanInstallment> angsuran;

  bool get lunas => status == 'Lunas';

  factory Loan.fromJson(Map<String, dynamic> json) => Loan(
        id: json['id'] as int,
        nomorPinjaman: json['nomorPinjaman'] as String,
        pokok: (json['pokok'] as num).toDouble(),
        tenorBulan: json['tenorBulan'] as int,
        bungaTahunan: (json['bungaTahunan'] as num).toDouble(),
        pokokPerBulan: (json['pokokPerBulan'] as num).toDouble(),
        jasaPerBulan: (json['jasaPerBulan'] as num).toDouble(),
        angsuranPerBulan: (json['angsuranPerBulan'] as num).toDouble(),
        sisaPokok: (json['sisaPokok'] as num).toDouble(),
        angsuranTerbayar: json['angsuranTerbayar'] as int,
        sisaAngsuran: json['sisaAngsuran'] as int,
        status: json['status'] as String,
        nilaiPelunasanDipercepat: (json['nilaiPelunasanDipercepat'] as num).toDouble(),
        jasaDibebaskan: (json['jasaDibebaskan'] as num).toDouble(),
        pembayaranTertunda: json['pembayaranTertunda'] == null
            ? null
            : PendingLoanPayment.fromJson(json['pembayaranTertunda'] as Map<String, dynamic>),
        angsuran: (json['angsuran'] as List<dynamic>)
            .map((item) => LoanInstallment.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}

class LoanOverview {
  const LoanOverview({required this.pengajuan, required this.pinjaman});

  final List<LoanApplication> pengajuan;
  final List<Loan> pinjaman;

  factory LoanOverview.fromJson(Map<String, dynamic> json) => LoanOverview(
        pengajuan: (json['pengajuan'] as List<dynamic>)
            .map((item) => LoanApplication.fromJson(item as Map<String, dynamic>))
            .toList(),
        pinjaman: (json['pinjaman'] as List<dynamic>)
            .map((item) => Loan.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}

// ── Simpanan ─────────────────────────────────────────────────────────────────
class SavingsAccount {
  const SavingsAccount({required this.saldo, this.nomorRekening});
  final double saldo;
  final String? nomorRekening;
  factory SavingsAccount.fromJson(Map<String, dynamic> json) => SavingsAccount(
        saldo: (json['saldo'] as num).toDouble(),
        nomorRekening: json['nomorRekening'] as String?,
      );
}

class WajibBill {
  const WajibBill({required this.id, required this.periode, required this.nominal, required this.jatuhTempo, required this.status});
  final int id;
  final String periode;
  final double nominal;
  final DateTime jatuhTempo;
  final String status;
  factory WajibBill.fromJson(Map<String, dynamic> json) => WajibBill(
        id: json['id'] as int,
        periode: json['periode'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        jatuhTempo: DateTime.parse(json['jatuhTempo'] as String),
        status: json['status'] as String,
      );
}

class WajibSection {
  const WajibSection({required this.saldo, required this.nominalBulanan, required this.tanggalTagih, required this.tagihan});
  final double saldo;
  final double nominalBulanan;
  final int tanggalTagih;
  final List<WajibBill> tagihan;
  factory WajibSection.fromJson(Map<String, dynamic> json) => WajibSection(
        saldo: (json['saldo'] as num).toDouble(),
        nominalBulanan: (json['nominalBulanan'] as num).toDouble(),
        tanggalTagih: json['tanggalTagih'] as int,
        tagihan: (json['tagihan'] as List<dynamic>).map((e) => WajibBill.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class SukarelaRequest {
  const SukarelaRequest({required this.id, required this.jenis, required this.nominal, required this.status, required this.diajukanPada, this.catatanReview});
  final int id;
  final String jenis;
  final double nominal;
  final String status;
  final DateTime diajukanPada;
  final String? catatanReview;
  factory SukarelaRequest.fromJson(Map<String, dynamic> json) => SukarelaRequest(
        id: json['id'] as int,
        jenis: json['jenis'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        status: json['status'] as String,
        diajukanPada: DateTime.parse(json['diajukanPada'] as String),
        catatanReview: json['catatanReview'] as String?,
      );
}

class SukarelaSection {
  const SukarelaSection({required this.saldo, required this.pengajuan});
  final double saldo;
  final List<SukarelaRequest> pengajuan;
  factory SukarelaSection.fromJson(Map<String, dynamic> json) => SukarelaSection(
        saldo: (json['saldo'] as num).toDouble(),
        pengajuan: (json['pengajuan'] as List<dynamic>).map((e) => SukarelaRequest.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class BerjangkaProduct {
  const BerjangkaProduct({required this.id, required this.nama, required this.nominal, required this.tenorBulan});
  final int id;
  final String nama;
  final double nominal;
  final int tenorBulan;
  factory BerjangkaProduct.fromJson(Map<String, dynamic> json) => BerjangkaProduct(
        id: json['id'] as int,
        nama: json['nama'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        tenorBulan: json['tenorBulan'] as int,
      );
}

class TermDeposit {
  const TermDeposit({required this.id, required this.nomorSertifikat, required this.produkNama, required this.nominal, required this.tenorBulan, required this.status, this.tanggalMulai, this.tanggalJatuhTempo});
  final int id;
  final String nomorSertifikat;
  final String produkNama;
  final double nominal;
  final int tenorBulan;
  final String status;
  final DateTime? tanggalMulai;
  final DateTime? tanggalJatuhTempo;
  factory TermDeposit.fromJson(Map<String, dynamic> json) => TermDeposit(
        id: json['id'] as int,
        nomorSertifikat: json['nomorSertifikat'] as String,
        produkNama: json['produkNama'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        tenorBulan: json['tenorBulan'] as int,
        status: json['status'] as String,
        tanggalMulai: json['tanggalMulai'] == null ? null : DateTime.parse(json['tanggalMulai'] as String),
        tanggalJatuhTempo: json['tanggalJatuhTempo'] == null ? null : DateTime.parse(json['tanggalJatuhTempo'] as String),
      );
}

class BerjangkaSection {
  const BerjangkaSection({required this.produk, required this.milikSaya});
  final List<BerjangkaProduct> produk;
  final List<TermDeposit> milikSaya;
  factory BerjangkaSection.fromJson(Map<String, dynamic> json) => BerjangkaSection(
        produk: (json['produk'] as List<dynamic>).map((e) => BerjangkaProduct.fromJson(e as Map<String, dynamic>)).toList(),
        milikSaya: (json['milikSaya'] as List<dynamic>).map((e) => TermDeposit.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class SavingsMutation {
  const SavingsMutation({required this.rekening, required this.jenis, required this.nominal, required this.saldoSetelah, this.keterangan, required this.tanggal});
  final String rekening;
  final String jenis;
  final double nominal;
  final double saldoSetelah;
  final String? keterangan;
  final DateTime tanggal;
  factory SavingsMutation.fromJson(Map<String, dynamic> json) => SavingsMutation(
        rekening: json['rekening'] as String,
        jenis: json['jenis'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        saldoSetelah: (json['saldoSetelah'] as num).toDouble(),
        keterangan: json['keterangan'] as String?,
        tanggal: DateTime.parse(json['tanggal'] as String),
      );
}

class SavingsOverview {
  const SavingsOverview({required this.pokok, required this.wajib, required this.sukarela, required this.berjangka, required this.mutasi});
  final SavingsAccount pokok;
  final WajibSection wajib;
  final SukarelaSection sukarela;
  final BerjangkaSection berjangka;
  final List<SavingsMutation> mutasi;
  factory SavingsOverview.fromJson(Map<String, dynamic> json) => SavingsOverview(
        pokok: SavingsAccount.fromJson(json['pokok'] as Map<String, dynamic>),
        wajib: WajibSection.fromJson(json['wajib'] as Map<String, dynamic>),
        sukarela: SukarelaSection.fromJson(json['sukarela'] as Map<String, dynamic>),
        berjangka: BerjangkaSection.fromJson(json['berjangka'] as Map<String, dynamic>),
        mutasi: (json['mutasiTerakhir'] as List<dynamic>).map((e) => SavingsMutation.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

String _statusLabel(String status) => switch (status) {
      'Ditagih' => 'Menunggu konfirmasi pengurus',
      'Dibayar' => 'Lunas',
      'Diajukan' => 'Menunggu persetujuan',
      'Disetujui' => 'Disetujui',
      'Ditolak' => 'Ditolak',
      'Aktif' => 'Aktif (dana terkunci)',
      'JatuhTempo' => 'Jatuh tempo',
      'Dicairkan' => 'Dicairkan',
      _ => status,
    };

Color _statusColor(BuildContext context, String status) => switch (status) {
      'Dibayar' || 'Disetujui' || 'Aktif' || 'Dicairkan' => Colors.green.shade700,
      'Ditolak' => Theme.of(context).colorScheme.error,
      'JatuhTempo' => Colors.blue.shade700,
      _ => Colors.orange.shade800,
    };

String _monthLabel(DateTime date) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return '${date.day} ${names[date.month - 1]} ${date.year}';
}

class MembershipStatusPage extends StatefulWidget {
  const MembershipStatusPage({required this.auth, required this.user, super.key});

  final AuthService auth;
  final AuthUser user;

  @override
  State<MembershipStatusPage> createState() => _MembershipStatusPageState();
}

class _MembershipStatusPageState extends State<MembershipStatusPage> {
  bool _checking = false;

  Future<void> _refresh() async {
    setState(() => _checking = true);
    try {
      final session = await widget.auth.restoreSession();
      if (!mounted) return;
      if (session != null && session.user.anggotaAktif) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => HomePage(auth: widget.auth, session: session)),
          (_) => false,
        );
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pendaftaran masih ditinjau pengurus.')),
      );
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  Future<void> _logout() async {
    await widget.auth.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => LandingPage(auth: widget.auth)),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final ditolak = widget.user.statusKeanggotaan == 'Ditolak';
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(ditolak ? Icons.cancel_outlined : Icons.hourglass_top_outlined,
                    size: 64, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 20),
                Text(
                  ditolak ? 'Pendaftaran ditolak' : 'Menunggu persetujuan pengurus',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                Text(
                  ditolak
                      ? 'Silakan hubungi pengurus koperasi untuk informasi lebih lanjut.'
                      : 'Akun Anda akan aktif setelah pengurus menyetujui pendaftaran dan menyetorkan simpanan pokok Rp 100.000.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
                ),
                const SizedBox(height: 28),
                if (!ditolak)
                  FilledButton.icon(
                    onPressed: _checking ? null : _refresh,
                    icon: _checking
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.refresh),
                    label: const Text('Periksa status'),
                  ),
                const SizedBox(height: 10),
                TextButton(onPressed: _logout, child: const Text('Keluar')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class SavingsTab extends StatefulWidget {
  const SavingsTab({required this.session, super.key});

  final AuthSession session;

  @override
  State<SavingsTab> createState() => _SavingsTabState();
}

class _SavingsTabState extends State<SavingsTab> {
  bool _loading = true;
  String? _error;
  bool _busy = false;
  SavingsOverview? _data;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await AuthService().fetchSavings();
      if (!mounted) return;
      setState(() => _data = data);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message.replaceFirst('Exception: ', ''))));
  }

  Future<void> _submitSukarela(String jenis) async {
    final controller = TextEditingController();
    final nominal = await showDialog<double>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(jenis == 'Tarik' ? 'Tarik simpanan sukarela' : 'Setor simpanan sukarela'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Nominal', prefixText: 'Rp '),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Batal')),
          FilledButton(
            onPressed: () {
              final value = double.tryParse(controller.text.replaceAll('.', '').replaceAll(',', '')) ?? 0;
              Navigator.pop(dialogContext, value);
            },
            child: const Text('Ajukan'),
          ),
        ],
      ),
    );
    if (nominal == null || nominal <= 0) return;
    setState(() => _busy = true);
    try {
      await AuthService().requestSukarela(jenis: jenis, nominal: nominal);
      if (!mounted) return;
      _toast('Pengajuan terkirim. Menunggu persetujuan pengurus.');
      await _load();
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _ajukanBerjangka(BerjangkaProduct produk) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Ajukan simpanan berjangka'),
        content: Text(
          '${produk.nama}\nNominal ${formatRupiah(produk.nominal)} · terkunci ${produk.tenorBulan} bulan.\n\n'
          'Dana tidak dapat ditarik sebelum jatuh tempo. Pengajuan diverifikasi pengurus.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Batal')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Ajukan')),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _busy = true);
    try {
      await AuthService().requestBerjangka(produkId: produk.id);
      if (!mounted) return;
      _toast('Pengajuan simpanan berjangka terkirim.');
      await _load();
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = _data;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        children: [
          Text('Simpanan saya', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          Text('Pokok, wajib, sukarela, dan berjangka dalam satu tempat.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54)),
          const SizedBox(height: 16),
          if (_loading) const Padding(padding: EdgeInsets.only(bottom: 12), child: LinearProgressIndicator(minHeight: 2)),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          if (data != null) ...[
            _SavingsBalanceCard(
              icon: Icons.verified_user_outlined,
              title: 'Simpanan Pokok',
              saldo: data.pokok.saldo,
              caption: 'Setoran wajib keanggotaan. Tidak dapat ditarik selama menjadi anggota.',
            ),
            const SizedBox(height: 14),
            _AccountSectionCard(
              icon: Icons.event_repeat_outlined,
              title: 'Simpanan Wajib',
              subtitle: 'Ditagih otomatis setiap tanggal ${data.wajib.tanggalTagih}.',
              children: [
                _InfoRow(label: 'Saldo terkumpul', value: formatRupiah(data.wajib.saldo)),
                _InfoRow(label: 'Nominal per bulan', value: formatRupiah(data.wajib.nominalBulanan)),
                const SizedBox(height: 6),
                Text('Pembayaran dikonfirmasi pengurus (potong gaji / setor).',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54)),
                const SizedBox(height: 8),
                if (data.wajib.tagihan.isEmpty)
                  Text('Belum ada tagihan.', style: Theme.of(context).textTheme.bodySmall)
                else
                  ...data.wajib.tagihan.take(6).map((bill) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(children: [
                          Expanded(child: Text('Periode ${bill.periode} · ${formatRupiah(bill.nominal)}')),
                          Text(_statusLabel(bill.status),
                              style: TextStyle(color: _statusColor(context, bill.status), fontWeight: FontWeight.w600, fontSize: 12)),
                        ]),
                      )),
              ],
            ),
            const SizedBox(height: 14),
            _AccountSectionCard(
              icon: Icons.volunteer_activism_outlined,
              title: 'Simpanan Sukarela',
              subtitle: 'Nominal bebas. Setoran & penarikan disetujui pengurus.',
              children: [
                _InfoRow(label: 'Saldo', value: formatRupiah(data.sukarela.saldo)),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _busy ? null : () => _submitSukarela('Setor'),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Setor'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _busy ? null : () => _submitSukarela('Tarik'),
                      icon: const Icon(Icons.remove, size: 18),
                      label: const Text('Tarik'),
                    ),
                  ),
                ]),
                if (data.sukarela.pengajuan.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  ...data.sukarela.pengajuan.take(5).map((req) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(children: [
                          Expanded(child: Text('${req.jenis} ${formatRupiah(req.nominal)}')),
                          Text(_statusLabel(req.status),
                              style: TextStyle(color: _statusColor(context, req.status), fontWeight: FontWeight.w600, fontSize: 12)),
                        ]),
                      )),
                ],
              ],
            ),
            const SizedBox(height: 14),
            _AccountSectionCard(
              icon: Icons.lock_clock_outlined,
              title: 'Simpanan Berjangka',
              subtitle: 'Pilih paket dari pengurus. Dana terkunci hingga jatuh tempo.',
              children: [
                if (data.berjangka.produk.isEmpty)
                  Text('Belum ada paket berjangka tersedia.', style: Theme.of(context).textTheme.bodySmall)
                else
                  ...data.berjangka.produk.map((produk) => Card(
                        margin: const EdgeInsets.symmetric(vertical: 5),
                        child: ListTile(
                          title: Text(produk.nama, style: const TextStyle(fontWeight: FontWeight.w700)),
                          subtitle: Text('${formatRupiah(produk.nominal)} · ${produk.tenorBulan} bulan'),
                          trailing: FilledButton(
                            onPressed: _busy ? null : () => _ajukanBerjangka(produk),
                            child: const Text('Ajukan'),
                          ),
                        ),
                      )),
                if (data.berjangka.milikSaya.isNotEmpty) ...[
                  const Divider(height: 22),
                  Text('Simpanan berjangka saya', style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  ...data.berjangka.milikSaya.map((deposit) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Expanded(child: Text('${deposit.produkNama} · ${formatRupiah(deposit.nominal)}', style: const TextStyle(fontWeight: FontWeight.w600))),
                            Text(_statusLabel(deposit.status),
                                style: TextStyle(color: _statusColor(context, deposit.status), fontWeight: FontWeight.w600, fontSize: 12)),
                          ]),
                          if (deposit.tanggalJatuhTempo != null)
                            Text('Jatuh tempo ${_monthLabel(deposit.tanggalJatuhTempo!)}',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54)),
                        ]),
                      )),
                ],
              ],
            ),
            if (data.mutasi.isNotEmpty) ...[
              const SizedBox(height: 14),
              _AccountSectionCard(
                icon: Icons.receipt_long_outlined,
                title: 'Mutasi terakhir',
                subtitle: 'Riwayat transaksi simpanan.',
                children: data.mutasi
                    .take(10)
                    .map((m) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5),
                          child: Row(children: [
                            Expanded(child: Text('${m.rekening} · ${m.jenis}', style: const TextStyle(fontSize: 13))),
                            Text('${m.jenis == 'Tarik' ? '-' : '+'}${formatRupiah(m.nominal)}',
                                style: TextStyle(fontWeight: FontWeight.w700, color: m.jenis == 'Tarik' ? Colors.red.shade700 : Colors.green.shade700)),
                          ]),
                        ))
                    .toList(),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _SavingsBalanceCard extends StatelessWidget {
  const _SavingsBalanceCard({required this.icon, required this.title, required this.saldo, required this.caption});

  final IconData icon;
  final String title;
  final double saldo;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      color: colors.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, color: colors.onPrimaryContainer, size: 20),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(fontWeight: FontWeight.w800, color: colors.onPrimaryContainer)),
          ]),
          const SizedBox(height: 10),
          Text(formatRupiah(saldo),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800, color: colors.onPrimaryContainer)),
          const SizedBox(height: 6),
          Text(caption, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.onPrimaryContainer.withValues(alpha: .8))),
        ]),
      ),
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({required this.user, required this.radius});

  final AuthUser user;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final photoUrl = user.fotoUrl;
    return CircleAvatar(
      radius: radius,
      backgroundColor: Theme.of(context).colorScheme.primary,
      backgroundImage: photoUrl == null ? null : NetworkImage('${AuthService.baseUrl}$photoUrl'),
      child: photoUrl == null
          ? Text(user.namaLengkap[0].toUpperCase(), style: TextStyle(color: Colors.white, fontSize: radius * .7, fontWeight: FontWeight.bold))
          : null,
    );
  }
}

class _PersonalDataCard extends StatelessWidget {
  const _PersonalDataCard({
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.addressController,
    required this.saving,
    required this.onSave,
  });

  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController addressController;
  final bool saving;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text('Data pribadi', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 14),
          TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Nama lengkap')),
          const SizedBox(height: 10),
          TextField(controller: emailController, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 10),
          TextField(controller: phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Nomor telepon')),
          const SizedBox(height: 10),
          TextField(controller: addressController, maxLines: 2, decoration: const InputDecoration(labelText: 'Alamat')),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: saving ? null : onSave,
            icon: saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.save_outlined),
            label: Text(saving ? 'Menyimpan...' : 'Simpan perubahan'),
          ),
        ]),
      ),
    );
  }
}

class _AccountSectionCard extends StatelessWidget {
  const _AccountSectionCard({required this.icon, required this.title, required this.subtitle, required this.children});

  final IconData icon;
  final String title;
  final String subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Row(children: [
            CircleAvatar(backgroundColor: Theme.of(context).colorScheme.secondaryContainer, child: Icon(icon)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 3),
              Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
            ])),
          ]),
          const SizedBox(height: 12),
          ...children,
        ]),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(child: Text(label)),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontWeight: FontWeight.w600),
          ),
        ),
      ]),
    );
  }
}

class AccountPage extends StatefulWidget {
  const AccountPage({required this.auth, required this.session, super.key});

  final AuthService auth;
  final AuthSession session;

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  late AuthUser _user;
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressController;
  bool _savingProfile = false;
  bool _uploadingPhoto = false;

  @override
  void initState() {
    super.initState();
    _user = widget.session.user;
    _nameController = TextEditingController(text: _user.namaLengkap);
    _emailController = TextEditingController(text: _user.email ?? '');
    _phoneController = TextEditingController(text: _user.nomorTelepon ?? '');
    _addressController = TextEditingController(text: _user.alamat ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _logout(BuildContext context) async {
    await widget.auth.logout();
    if (!context.mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => LandingPage(auth: widget.auth)),
      (_) => false,
    );
  }

  Future<void> _saveProfile() async {
    if (_nameController.text.trim().isEmpty) return;
    setState(() => _savingProfile = true);
    try {
      final user = await widget.auth.updateProfile(
        namaLengkap: _nameController.text,
        email: _emailController.text,
        nomorTelepon: _phoneController.text,
        alamat: _addressController.text,
      );
      if (!mounted) return;
      setState(() => _user = user);
      _showMessage('Data pribadi berhasil diperbarui.');
    } catch (error) {
      if (mounted) _showMessage(error.toString());
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  Future<void> _pickPhoto(ImageSource source) async {
    final photo = await ImagePicker().pickImage(source: source, imageQuality: 85, maxWidth: 1200);
    if (photo == null) return;
    setState(() => _uploadingPhoto = true);
    try {
      final user = await widget.auth.uploadProfilePhoto(photo);
      if (!mounted) return;
      setState(() => _user = user);
      _showMessage('Foto profil berhasil diperbarui.');
    } catch (error) {
      if (mounted) _showMessage(error.toString());
    } finally {
      if (mounted) setState(() => _uploadingPhoto = false);
    }
  }

  void _showPhotoOptions() {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(children: [
          ListTile(leading: const Icon(Icons.photo_library_outlined), title: const Text('Pilih dari galeri'), onTap: () { Navigator.pop(context); _pickPhoto(ImageSource.gallery); }),
          ListTile(leading: const Icon(Icons.photo_camera_outlined), title: const Text('Ambil foto'), onTap: () { Navigator.pop(context); _pickPhoto(ImageSource.camera); }),
        ]),
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message.replaceFirst('Exception: ', ''))));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Akun saya')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Card(
              elevation: 0,
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        _ProfileAvatar(user: _user, radius: 32),
                        Positioned(
                          right: -8,
                          bottom: -4,
                          child: IconButton.filled(
                            onPressed: _uploadingPhoto ? null : _showPhotoOptions,
                            icon: _uploadingPhoto ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.camera_alt_outlined, size: 17),
                            tooltip: 'Ubah foto profil',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_user.namaLengkap, style: const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('NIK: ${_user.nomorIndukKaryawan}'),
                          if (_user.email != null) ...[
                            const SizedBox(height: 4),
                            Text(_user.email!, overflow: TextOverflow.ellipsis),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            _PersonalDataCard(
              nameController: _nameController,
              emailController: _emailController,
              phoneController: _phoneController,
              addressController: _addressController,
              saving: _savingProfile,
              onSave: _saveProfile,
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => _logout(context),
              icon: const Icon(Icons.logout),
              label: const Text('Keluar dari akun'),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthScaffold extends StatelessWidget {
  const _AuthScaffold({required this.title, required this.subtitle, required this.child});

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const _BrandMark(size: 56),
                  const SizedBox(height: 28),
                  Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text(subtitle, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54)),
                  const SizedBox(height: 28),
                  child,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BrandMark extends StatelessWidget {
  const _BrandMark({this.size = 72});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(size * .28),
        ),
        child: Icon(Icons.account_balance_rounded, size: size * .48, color: Colors.white),
      ),
    );
  }
}

class _ErrorMessage extends StatelessWidget {
  const _ErrorMessage({required this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    if (message == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Text(message!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    );
  }
}

class _ButtonLoader extends StatelessWidget {
  const _ButtonLoader();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
    );
  }
}

String? _requiredNik(String? value) {
  if (value == null || value.trim().isEmpty) return 'NIK wajib diisi';
  if (value.trim().length < 5) return 'NIK minimal 5 karakter';
  return null;
}
