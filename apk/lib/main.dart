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
    this.email,
    this.nomorTelepon,
    this.alamat,
    this.fotoUrl,
  });

  final int id;
  final String namaLengkap;
  final String nomorIndukKaryawan;
  final String? email;
  final String? nomorTelepon;
  final String? alamat;
  final String? fotoUrl;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as int,
      namaLengkap: json['namaLengkap'] as String,
      nomorIndukKaryawan: json['nomorIndukKaryawan'] as String,
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

class DigitalSavingsLoanPage extends StatefulWidget {
  const DigitalSavingsLoanPage({required this.session, super.key});

  final AuthSession session;

  @override
  State<DigitalSavingsLoanPage> createState() => _DigitalSavingsLoanPageState();
}

class _DigitalSavingsLoanPageState extends State<DigitalSavingsLoanPage> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController(text: '10000000');
  final _purposeController = TextEditingController();
  int _tenor = 12;
  bool _submittingLoan = false;

  @override
  void dispose() {
    _amountController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  double get _amount => double.tryParse(_amountController.text.replaceAll('.', '').replaceAll(',', '')) ?? 0;

  double get _monthlyInstallment {
    const monthlyRate = .01;
    return _amount <= 0 ? 0 : (_amount / _tenor) + (_amount * monthlyRate);
  }

  String _formatRupiah(double value) {
    final rounded = value.round().toString();
    final withSeparators = rounded.replaceAllMapped(RegExp(r'(?<=\d)(?=(\d{3})+$)'), (_) => '.');
    return 'Rp $withSeparators';
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
        const SnackBar(content: Text('Pengajuan pinjaman berhasil dikirim.')),
      );
      _purposeController.clear();
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

  void _showSavingsComingSoon(BuildContext context) {

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Pencatatan simpanan akan tersedia setelah API transaksi diaktifkan.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Simpanan & Pinjaman Digital')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Text(
              'Halo, ${widget.session.user.namaLengkap.split(' ').first}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              'Catat simpanan dan ajukan pinjaman secara paperless dari satu halaman.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 20),
            _AccountSectionCard(
              icon: Icons.savings_outlined,
              title: 'Multi-Simpanan',
              subtitle: 'Pencatatan otomatis untuk seluruh jenis simpanan anggota.',
              children: [
                const _InfoRow(label: 'Simpanan pokok', value: 'Belum tersedia'),
                const _InfoRow(label: 'Simpanan wajib', value: 'Belum tersedia'),
                const _InfoRow(label: 'Simpanan sukarela', value: 'Belum tersedia'),
                const _InfoRow(label: 'Simpanan berjangka', value: 'Belum tersedia'),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () => _showSavingsComingSoon(context),
                  icon: const Icon(Icons.add_circle_outline),
                  label: const Text('Catat simpanan'),
                ),
              ],
            ),
            const SizedBox(height: 16),
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
                        items: [6, 12, 18, 24, 36].map((month) => DropdownMenuItem(value: month, child: Text('$month bulan'))).toList(),
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
              subtitle: 'Estimasi menggunakan bunga flat 1% per bulan.',
              children: [
                _InfoRow(label: 'Pokok pinjaman', value: _formatRupiah(_amount)),
                _InfoRow(label: 'Tenor', value: '$_tenor bulan'),
                _InfoRow(label: 'Estimasi cicilan per bulan', value: _formatRupiah(_monthlyInstallment)),
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
          ],
        ),
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
      child: Row(children: [
        Expanded(child: Text(label)),
        Text(value, style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontWeight: FontWeight.w600)),
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
