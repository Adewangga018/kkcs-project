import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show Clipboard, ClipboardData;
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

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

  Future<List<CatalogProduct>> _getProductList(String path) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl$path'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => CatalogProduct.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<EratAgendaItem>> fetchEratAgenda() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/erat/agenda'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => EratAgendaItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> submitVote({required int agendaId, required int opsiId}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/erat/agenda/$agendaId/suara'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'opsiId': opsiId}),
        ));
    _ensureSuccess(response);
  }

  Future<List<RatDocument>> fetchRatDocuments() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/erat/laporan-tahunan'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => RatDocument.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CatalogProduct>> fetchCatalog() => _getProductList('/api/produk');
  Future<List<CatalogProduct>> fetchMyListings() => _getProductList('/api/produk/pengajuan/saya');

  Future<CatalogProduct> submitProductListing({
    required String nama,
    String? deskripsi,
    required String jenis,
    required double harga,
    required double stok,
    required String satuan,
  }) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/produk/pengajuan'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({
            'nama': nama.trim(),
            'deskripsi': deskripsi?.trim(),
            'jenis': jenis,
            'harga': harga,
            'stok': stok,
            'satuan': satuan.trim(),
          }),
        ));
    _ensureSuccess(response);
    return CatalogProduct.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<void> uploadProductListingPhoto(int produkId, XFile photo) async {
    final token = await _getToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/api/produk/pengajuan/$produkId/foto'))
      ..headers['Authorization'] = 'Bearer $token';
    request.files.add(http.MultipartFile.fromBytes('file', await photo.readAsBytes(),
        filename: photo.name, contentType: _photoMediaType(photo)));
    final response = await http.Response.fromStream(await request.send());
    _ensureSuccess(response);
  }

  Future<void> buyProduct({
    required int produkId,
    required double jumlah,
    required String metodePembayaran,
    String? catatan,
  }) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/produk/$produkId/beli'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'jumlah': jumlah, 'metodePembayaran': metodePembayaran, 'catatan': catatan?.trim()}),
        ));
    _ensureSuccess(response);
  }

  Future<List<ProductPurchase>> fetchMyPurchases() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/produk/pembelian/saya'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => ProductPurchase.fromJson(e as Map<String, dynamic>))
        .toList();
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

  Future<HomeSummary> fetchHomeSummary() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/beranda/ringkasan'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return HomeSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
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

  Future<PersonalCashFlow> fetchCashFlow() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/akun/arus-kas'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return PersonalCashFlow.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<List<ShuHistoryEntry>> fetchMyShu() async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.get(
          Uri.parse('$baseUrl/api/shu/saya'),
          headers: {'Authorization': 'Bearer $token'},
        ));
    _ensureSuccess(response);
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => ShuHistoryEntry.fromJson(e as Map<String, dynamic>))
        .toList();
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

  Future<void> requestEarlyWithdrawal({required int berjangkaId}) async {
    final token = await _getToken();
    final response = await _sendRequest(() => http.post(
          Uri.parse('$baseUrl/api/simpanan/berjangka/$berjangkaId/pencairan'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({}),
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

class HomePage extends StatefulWidget {
  const HomePage({required this.auth, required this.session, super.key});

  final AuthService auth;
  final AuthSession session;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _loading = true;
  String? _error;
  HomeSummary? _summary;

  @override
  void initState() {
    super.initState();
    if (widget.session.user.anggotaAktif) _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final summary = await widget.auth.fetchHomeSummary();
      if (!mounted) return;
      setState(() => _summary = summary);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _servicePage(int index) {
    return switch (index) {
      1 => DigitalSavingsLoanPage(session: widget.session),
      2 => BusinessUnitPage(session: widget.session),
      3 => EratPage(session: widget.session),
      _ => AccountPage(auth: widget.auth, session: widget.session),
    };
  }

  Future<void> _openService(int index) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _ServiceShell(
          auth: widget.auth,
          session: widget.session,
          selectedIndex: index,
          child: _servicePage(index),
        ),
      ),
    );
    if (mounted) _load();
  }

  void _openTautan(String tautan) {
    switch (tautan) {
      case 'erat':
        _openService(3);
      case 'katalog':
        _openService(2);
      case 'simpanan':
      case 'pinjaman':
        _openService(1);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.session.user.anggotaAktif) {
      return MembershipStatusPage(auth: widget.auth, user: widget.session.user);
    }
    final s = _summary;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Beranda KKCS'),
        actions: [
          IconButton(
            onPressed: () => _openService(0),
            icon: _ProfileAvatar(user: widget.session.user, radius: 16),
            tooltip: 'Akun saya',
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            children: [
              Text(
                'Halo, ${widget.session.user.namaLengkap.split(' ').first}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                'Akses layanan anggota dan transparansi koperasi dalam satu tempat.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
              ),
              const SizedBox(height: 20),
              _TransparencyDashboard(session: widget.session, summary: s, loading: _loading, error: _error, onRefresh: _load),
              const SizedBox(height: 24),
              _HomeAnnouncementCard(items: s?.pengumuman ?? const [], onOpen: _openTautan),
              const SizedBox(height: 20),
              _LatestProductsPreview(products: s?.produkTerbaru ?? const [], onOpenCatalog: () => _openService(2)),
              const SizedBox(height: 24),
              Text(
                'Pilih layanan dari navigasi di bawah.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 0) return;
          _openService(index);
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
  const _TransparencyDashboard({required this.session, required this.summary, required this.loading, required this.error, required this.onRefresh});

  final AuthSession session;
  final HomeSummary? summary;
  final bool loading;
  final String? error;
  final Future<void> Function() onRefresh;

  String _value(double? amount) => amount == null ? '—' : formatRupiah(amount);

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final s = summary;
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
                      Text('Portal Mandiri Anggota',
                          style: TextStyle(color: colors.onPrimary, fontWeight: FontWeight.w800, fontSize: 17)),
                      const SizedBox(height: 4),
                      Text('Dashboard transparansi keanggotaan Anda',
                          style: TextStyle(color: colors.onPrimary.withValues(alpha: .82))),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: loading ? null : () => onRefresh(),
                  icon: Icon(Icons.refresh, color: colors.onPrimary.withValues(alpha: .9), size: 19),
                  tooltip: 'Muat ulang',
                ),
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
                if (loading) const Padding(padding: EdgeInsets.only(bottom: 10), child: LinearProgressIndicator(minHeight: 2)),
                if (error != null) Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(error!, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.error)),
                ),
                Row(children: [
                  Expanded(child: _DashboardMetric(icon: Icons.savings_outlined, label: 'Total simpanan', value: _value(s?.totalSimpanan))),
                  const SizedBox(width: 10),
                  Expanded(child: _DashboardMetric(
                    icon: Icons.request_quote_outlined,
                    label: 'Pinjaman aktif',
                    value: s == null ? '—' : (s.jumlahPinjamanAktif == 0 ? 'Tidak ada' : '${formatRupiah(s.sisaPokokPinjaman)} sisa'),
                  )),
                ]),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(child: _DashboardMetric(
                    icon: Icons.payments_outlined,
                    label: 'Cicilan berjalan',
                    value: s == null ? '—' : (s.cicilanBulananBerjalan == 0 ? 'Tidak ada' : '${formatRupiah(s.cicilanBulananBerjalan)} / bln'),
                  )),
                  const SizedBox(width: 10),
                  Expanded(child: _DashboardMetric(
                    icon: Icons.auto_graph_outlined,
                    label: s?.estimasiShuTahun == null ? 'Estimasi SHU' : 'Estimasi SHU ${s!.estimasiShuTahun}',
                    value: s?.estimasiShuNominal == null ? 'Belum tersedia' : formatRupiah(s!.estimasiShuNominal!),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ShuSayaPage(session: session)),
                    ),
                  )),
                ]),
                const SizedBox(height: 12),
                Row(children: [
                  Icon(Icons.sync_outlined, size: 15, color: colors.onSurfaceVariant),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      s == null
                          ? 'Memuat data terkini...'
                          : 'Pokok ${formatRupiah(s.simpananPokok)} · Wajib ${formatRupiah(s.simpananWajib)} · Sukarela ${formatRupiah(s.simpananSukarela)} · Berjangka ${formatRupiah(s.simpananBerjangka)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant),
                    ),
                  ),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeAnnouncementCard extends StatelessWidget {
  const _HomeAnnouncementCard({required this.items, required this.onOpen});

  final List<Announcement> items;
  final void Function(String tautan) onOpen;

  IconData _icon(String ikon) => switch (ikon) {
        'vote' => Icons.how_to_vote_outlined,
        'dokumen' => Icons.picture_as_pdf_outlined,
        'produk' => Icons.storefront_outlined,
        _ => Icons.campaign_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Pengumuman', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 10),
        if (items.isEmpty)
          Card(
            color: colors.tertiaryContainer,
            child: const Padding(padding: EdgeInsets.all(16), child: Text('Belum ada pengumuman.')),
          )
        else
          ...items.map((a) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                color: colors.tertiaryContainer,
                child: InkWell(
                  onTap: a.tautan.isEmpty ? null : () => onOpen(a.tautan),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(children: [
                      CircleAvatar(backgroundColor: colors.tertiary, child: Icon(_icon(a.ikon), color: colors.onTertiary, size: 20)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(a.judul, style: const TextStyle(fontWeight: FontWeight.w800)),
                          const SizedBox(height: 3),
                          Text(a.isi, style: Theme.of(context).textTheme.bodySmall),
                        ]),
                      ),
                      if (a.tautan.isNotEmpty) const Icon(Icons.chevron_right),
                    ]),
                  ),
                ),
              )),
      ],
    );
  }
}

class _LatestProductsPreview extends StatelessWidget {
  const _LatestProductsPreview({required this.products, required this.onOpenCatalog});

  final List<CatalogProduct> products;
  final VoidCallback onOpenCatalog;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Expanded(child: Text('Produk terbaru', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800))),
          TextButton(onPressed: onOpenCatalog, child: const Text('Buka katalog')),
        ]),
        const SizedBox(height: 6),
        if (products.isEmpty)
          Text('Belum ada produk di katalog.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54))
        else
          ...products.map((p) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  onTap: onOpenCatalog,
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(
                      width: 44,
                      height: 44,
                      child: p.fotoUrl == null
                          ? Container(color: colors.primaryContainer, child: Icon(Icons.shopping_bag_outlined, color: colors.onPrimaryContainer))
                          : Image.network('${AuthService.baseUrl}${p.fotoUrl}', fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(color: colors.primaryContainer, child: const Icon(Icons.image_not_supported_outlined))),
                    ),
                  ),
                  title: Text(p.nama, style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text(p.sewa
                      ? 'Sewa · ${p.sumber == 'TitipanAnggota' ? 'titipan anggota' : 'koperasi'}'
                      : (p.stok > 0 ? 'Stok ${p.stok.toStringAsFixed(p.stok % 1 == 0 ? 0 : 2)} ${p.satuan}' : 'Stok habis')),
                  trailing: Text('${formatRupiah(p.harga)}${p.sewa ? '/${p.satuan}' : ''}', style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
              )),
      ],
    );
  }
}

class _DashboardMetric extends StatelessWidget {
  const _DashboardMetric({required this.icon, required this.label, required this.value, this.onTap});

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final content = Container(
      constraints: const BoxConstraints(minHeight: 82),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: .45),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 19, color: colors.primary),
              if (onTap != null) ...[
                const Spacer(),
                Icon(Icons.chevron_right, size: 16, color: colors.onSurfaceVariant),
              ],
            ],
          ),
          const SizedBox(height: 7),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 3),
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
        ],
      ),
    );
    if (onTap == null) return content;
    return InkWell(borderRadius: BorderRadius.circular(10), onTap: onTap, child: content);
  }
}

class ShuSayaPage extends StatefulWidget {
  const ShuSayaPage({required this.session, super.key});

  final AuthSession session;

  @override
  State<ShuSayaPage> createState() => _ShuSayaPageState();
}

class _ShuSayaPageState extends State<ShuSayaPage> {
  bool _loading = true;
  String? _error;
  List<ShuHistoryEntry> _riwayat = const [];

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
      final data = await AuthService().fetchMyShu();
      if (!mounted) return;
      setState(() => _riwayat = data);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiException ? e.message : 'Gagal memuat data SHU.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('SHU Saya')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  children: [
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(_error!, style: TextStyle(color: colors.error)),
                      ),
                    Text(
                      'Sisa Hasil Usaha (SHU) adalah bagian keuntungan koperasi yang dibagikan ke setiap anggota aktif, '
                      'dihitung dari jasa modal (simpanan pokok+wajib) dan jasa usaha (transaksi pinjaman & belanja) Anda tiap tahun buku.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
                    ),
                    const SizedBox(height: 18),
                    if (_riwayat.isEmpty && !_loading)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(Icons.auto_graph_outlined, size: 48, color: colors.outline),
                            const SizedBox(height: 12),
                            Text('Belum ada SHU yang difinalisasi',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Text(
                              'Estimasi SHU akan muncul di sini setelah pengurus memfinalisasi tahun buku.',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                            ),
                          ],
                        ),
                      )
                    else
                      ..._riwayat.asMap().entries.map((entry) => Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: _ShuYearCard(data: entry.value, highlighted: entry.key == 0),
                          )),
                  ],
                ),
        ),
      ),
    );
  }
}

class _ShuYearCard extends StatelessWidget {
  const _ShuYearCard({required this.data, required this.highlighted});

  final ShuHistoryEntry data;
  final bool highlighted;

  Widget _baris(BuildContext context, String label, double value, {bool bold = false, Color? color}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54)),
            Text(formatRupiah(value),
                style: TextStyle(fontWeight: bold ? FontWeight.w800 : FontWeight.w600, fontSize: bold ? 15 : 13, color: color)),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      elevation: highlighted ? 2 : 0,
      color: highlighted ? colors.primaryContainer.withValues(alpha: .35) : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: highlighted ? BorderSide(color: colors.primary.withValues(alpha: .4)) : BorderSide(color: colors.outlineVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_graph_outlined, size: 18, color: colors.primary),
                const SizedBox(width: 8),
                Text('Tahun Buku ${data.tahun}', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                if (highlighted) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: colors.primary, borderRadius: BorderRadius.circular(20)),
                    child: Text('Terbaru', style: TextStyle(color: colors.onPrimary, fontSize: 10, fontWeight: FontWeight.w700)),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            _baris(context, 'Simpanan Anda (dasar Jasa Modal)', data.simpananAnggota),
            _baris(context, 'Transaksi Anda (dasar Jasa Usaha)', data.transaksiAnggota),
            const Divider(height: 20),
            _baris(context, 'Jasa Modal Anggota (JMA)', data.jma),
            _baris(context, 'Jasa Usaha Anggota (JUA)', data.jua),
            _baris(context, 'Total SHU (Bruto)', data.totalShu),
            _baris(context, 'PPh Final', -data.pajak, color: Colors.orange.shade800),
            const Divider(height: 20),
            _baris(context, 'SHU Diterima (Neto)', data.totalShuNeto, bold: true, color: colors.primary),
            const SizedBox(height: 10),
            Text(
              'Difinalisasi ${_monthLabel(data.difinalisasiPada)} · Jasa Modal ${(data.persenJasaModal * 100).toStringAsFixed(0)}% / Jasa Usaha ${(data.persenJasaUsaha * 100).toStringAsFixed(0)}%',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black45, fontSize: 11),
            ),
          ],
        ),
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

class EratOption {
  const EratOption({required this.id, required this.label, required this.jumlah});
  final int id;
  final String label;
  final int jumlah;
  factory EratOption.fromJson(Map<String, dynamic> json) =>
      EratOption(id: json['id'] as int, label: json['label'] as String, jumlah: json['jumlah'] as int);
}

class EratAgendaItem {
  const EratAgendaItem({
    required this.id,
    required this.judul,
    this.deskripsi,
    required this.status,
    required this.totalSuara,
    this.pilihanSaya,
    required this.opsi,
  });

  final int id;
  final String judul;
  final String? deskripsi;
  final String status; // Aktif | Selesai
  final int totalSuara;
  final int? pilihanSaya;
  final List<EratOption> opsi;

  bool get sudahMemilih => pilihanSaya != null;
  bool get tampilkanHasil => sudahMemilih || status == 'Selesai';

  factory EratAgendaItem.fromJson(Map<String, dynamic> json) => EratAgendaItem(
        id: json['id'] as int,
        judul: json['judul'] as String,
        deskripsi: json['deskripsi'] as String?,
        status: json['status'] as String,
        totalSuara: json['totalSuara'] as int,
        pilihanSaya: json['pilihanSaya'] as int?,
        opsi: (json['opsi'] as List<dynamic>).map((e) => EratOption.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class RatDocument {
  const RatDocument({required this.id, required this.tahun, required this.judul, this.deskripsi, required this.fileUrl, required this.diterbitkanPada});
  final int id;
  final int tahun;
  final String judul;
  final String? deskripsi;
  final String fileUrl;
  final DateTime diterbitkanPada;
  factory RatDocument.fromJson(Map<String, dynamic> json) => RatDocument(
        id: json['id'] as int,
        tahun: json['tahun'] as int,
        judul: json['judul'] as String,
        deskripsi: json['deskripsi'] as String?,
        fileUrl: json['fileUrl'] as String,
        diterbitkanPada: DateTime.parse(json['diterbitkanPada'] as String),
      );
}

class _EratPageState extends State<EratPage> {
  bool _loading = true;
  String? _error;
  int? _busyAgenda;
  List<EratAgendaItem> _agenda = const [];
  List<RatDocument> _dokumen = const [];
  final Map<int, int> _pilihan = {};

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
      final results = await Future.wait([
        AuthService().fetchEratAgenda(),
        AuthService().fetchRatDocuments(),
      ]);
      if (!mounted) return;
      setState(() {
        _agenda = results[0] as List<EratAgendaItem>;
        _dokumen = results[1] as List<RatDocument>;
      });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message.replaceFirst('Exception: ', ''))));
  }

  Future<void> _vote(EratAgendaItem agenda) async {
    final opsiId = _pilihan[agenda.id];
    if (opsiId == null) return;
    setState(() => _busyAgenda = agenda.id);
    try {
      await AuthService().submitVote(agendaId: agenda.id, opsiId: opsiId);
      if (!mounted) return;
      _toast('Suara Anda tercatat.');
      await _load();
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _busyAgenda = null);
    }
  }

  Future<void> _openDocument(RatDocument doc) async {
    final uri = Uri.parse('${AuthService.baseUrl}/api/erat/laporan-tahunan/${doc.id}/berkas');
    var opened = false;
    for (final mode in [LaunchMode.externalApplication, LaunchMode.platformDefault, LaunchMode.inAppBrowserView]) {
      try {
        if (await launchUrl(uri, mode: mode)) {
          opened = true;
          break;
        }
      } catch (_) {
        // coba mode berikutnya
      }
    }
    if (!opened && mounted) {
      showDialog<void>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Buka dokumen di browser'),
          content: SelectableText('$uri'),
          actions: [
            TextButton(
              onPressed: () {
                Clipboard.setData(ClipboardData(text: '$uri'));
                Navigator.pop(dialogContext);
                _toast('Tautan disalin.');
              },
              child: const Text('Salin tautan'),
            ),
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Tutup')),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Partisipasi E-RAT'),
        actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh), tooltip: 'Muat ulang')],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            children: [
              Text('Rapat Anggota Tahunan Digital',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text('Gunakan hak suara Anda dan baca dokumen RAT koperasi.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54)),
              const SizedBox(height: 16),
              if (_loading) const Padding(padding: EdgeInsets.only(bottom: 12), child: LinearProgressIndicator(minHeight: 2)),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ),
              Text('Voting', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              if (!_loading && _agenda.isEmpty)
                Text('Belum ada agenda voting yang ditayangkan.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54)),
              ..._agenda.map(_buildAgendaCard),
              const SizedBox(height: 16),
              Text('Dokumen RAT terkini', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              if (!_loading && _dokumen.isEmpty)
                Text('Belum ada dokumen RAT diterbitkan.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54)),
              ..._dokumen.asMap().entries.map((entry) => _buildDocumentCard(entry.value, terbaru: entry.key == 0)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAgendaCard(EratAgendaItem agenda) {
    final colors = Theme.of(context).colorScheme;
    final selesai = agenda.status == 'Selesai';
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Expanded(child: Text(agenda.judul, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: selesai ? colors.surfaceContainerHighest : colors.primaryContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(selesai ? 'Selesai' : 'Berlangsung',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: selesai ? Colors.black54 : colors.onPrimaryContainer)),
              ),
            ]),
            if (agenda.deskripsi != null && agenda.deskripsi!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(agenda.deskripsi!, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54)),
            ],
            const SizedBox(height: 10),
            if (agenda.tampilkanHasil)
              ...agenda.opsi.map((o) {
                final pct = agenda.totalSuara == 0 ? 0.0 : o.jumlah / agenda.totalSuara;
                final dipilih = agenda.pilihanSaya == o.id;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Text('${o.label}${dipilih ? '  (pilihan Anda)' : ''}',
                          style: TextStyle(fontWeight: dipilih ? FontWeight.w800 : FontWeight.w500))),
                      Text('${o.jumlah} · ${(pct * 100).toStringAsFixed(0)}%', style: Theme.of(context).textTheme.bodySmall),
                    ]),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(value: pct, minHeight: 7, backgroundColor: colors.surfaceContainerHighest),
                    ),
                  ]),
                );
              })
            else ...[
              ...agenda.opsi.map((o) => RadioListTile<int>(
                    contentPadding: EdgeInsets.zero,
                    value: o.id,
                    groupValue: _pilihan[agenda.id],
                    title: Text(o.label),
                    onChanged: _busyAgenda == agenda.id ? null : (v) => setState(() => _pilihan[agenda.id] = v!),
                  )),
              const SizedBox(height: 6),
              FilledButton.icon(
                onPressed: (_pilihan[agenda.id] == null || _busyAgenda == agenda.id) ? null : () => _vote(agenda),
                icon: _busyAgenda == agenda.id
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.how_to_vote_outlined, size: 18),
                label: const Text('Kirim suara'),
              ),
            ],
            const SizedBox(height: 6),
            Text('${agenda.totalSuara} suara masuk', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  Widget _buildDocumentCard(RatDocument doc, {required bool terbaru}) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: terbaru ? colors.primaryContainer : null,
      child: ListTile(
        leading: Icon(Icons.picture_as_pdf_outlined, color: terbaru ? colors.onPrimaryContainer : colors.primary),
        title: Row(children: [
          Flexible(child: Text(doc.judul, style: const TextStyle(fontWeight: FontWeight.w700))),
          if (terbaru) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(color: colors.primary, borderRadius: BorderRadius.circular(6)),
              child: Text('Terbaru', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: colors.onPrimary)),
            ),
          ],
        ]),
        subtitle: Text('Tahun ${doc.tahun}${doc.deskripsi != null && doc.deskripsi!.isNotEmpty ? ' · ${doc.deskripsi}' : ''}'),
        trailing: const Icon(Icons.open_in_new),
        onTap: () => _openDocument(doc),
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

class CatalogProduct {
  const CatalogProduct({
    required this.id,
    required this.kode,
    required this.nama,
    this.deskripsi,
    required this.jenis,
    required this.harga,
    required this.stok,
    required this.satuan,
    this.fotoUrl,
    required this.sumber,
    this.diajukanOleh,
    required this.status,
    required this.aktif,
    this.catatanReview,
  });

  final int id;
  final String kode;
  final String nama;
  final String? deskripsi;
  final String jenis; // Jual | Sewa
  final double harga;
  final double stok;
  final String satuan;
  final String? fotoUrl;
  final String sumber; // Koperasi | TitipanAnggota
  final String? diajukanOleh;
  final String status; // MenungguPersetujuan | Disetujui | Ditolak
  final bool aktif;
  final String? catatanReview;

  bool get sewa => jenis == 'Sewa';

  factory CatalogProduct.fromJson(Map<String, dynamic> json) => CatalogProduct(
        id: json['id'] as int,
        kode: json['kode'] as String,
        nama: json['nama'] as String,
        deskripsi: json['deskripsi'] as String?,
        jenis: json['jenis'] as String,
        harga: (json['harga'] as num).toDouble(),
        stok: (json['stok'] as num).toDouble(),
        satuan: json['satuan'] as String,
        fotoUrl: json['fotoUrl'] as String?,
        sumber: json['sumber'] as String,
        diajukanOleh: json['diajukanOleh'] as String?,
        status: json['status'] as String,
        aktif: json['aktif'] as bool,
        catatanReview: json['catatanReview'] as String?,
      );
}

class ProductPurchase {
  const ProductPurchase({
    required this.id,
    required this.nomorTransaksi,
    required this.produkNama,
    required this.jenis,
    required this.jumlah,
    required this.total,
    required this.metodePembayaran,
    required this.status,
    this.catatanReview,
    this.tagihanKreditStatus,
  });

  final int id;
  final String nomorTransaksi;
  final String produkNama;
  final String jenis;
  final double jumlah;
  final double total;
  final String metodePembayaran;
  final String status;
  final String? catatanReview;
  final String? tagihanKreditStatus;

  factory ProductPurchase.fromJson(Map<String, dynamic> json) => ProductPurchase(
        id: json['id'] as int,
        nomorTransaksi: json['nomorTransaksi'] as String,
        produkNama: json['produkNama'] as String,
        jenis: json['jenis'] as String,
        jumlah: (json['jumlah'] as num).toDouble(),
        total: (json['total'] as num).toDouble(),
        metodePembayaran: json['metodePembayaran'] as String,
        status: json['status'] as String,
        catatanReview: json['catatanReview'] as String?,
        tagihanKreditStatus: (json['tagihanKredit'] as Map<String, dynamic>?)?['status'] as String?,
      );
}

class _BusinessUnitPageState extends State<BusinessUnitPage> {
  bool _loading = true;
  String? _error;
  bool _busy = false;
  List<CatalogProduct> _catalog = const [];
  List<CatalogProduct> _myListings = const [];
  List<ProductPurchase> _myPurchases = const [];

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
      final results = await Future.wait([
        AuthService().fetchCatalog(),
        AuthService().fetchMyListings(),
        AuthService().fetchMyPurchases(),
      ]);
      if (!mounted) return;
      setState(() {
        _catalog = results[0] as List<CatalogProduct>;
        _myListings = results[1] as List<CatalogProduct>;
        _myPurchases = results[2] as List<ProductPurchase>;
      });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message.replaceFirst('Exception: ', ''))));
  }

  Future<void> _buy(CatalogProduct product) async {
    final result = await showModalBottomSheet<({double jumlah, String metode, String? catatan})>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _BuySheet(product: product),
    );
    if (result == null) return;
    setState(() => _busy = true);
    try {
      await AuthService().buyProduct(
        produkId: product.id,
        jumlah: result.jumlah,
        metodePembayaran: result.metode,
        catatan: result.catatan,
      );
      if (!mounted) return;
      _toast('Pengajuan ${product.sewa ? 'sewa' : 'pembelian'} terkirim. Menunggu persetujuan pengurus.');
      await _load();
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sell() async {
    final ok = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const SellProductPage()),
    );
    if (ok == true) await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog Produk Koperasi'),
        actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh), tooltip: 'Muat ulang')],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            children: [
              Text('Katalog Produk Koperasi', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text('Beli atau sewa produk koperasi, atau jual produk Anda ke koperasi.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54)),
              const SizedBox(height: 16),
              if (_loading) const Padding(padding: EdgeInsets.only(bottom: 12), child: LinearProgressIndicator(minHeight: 2)),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ),
              if (!_loading && _catalog.isEmpty)
                Text('Belum ada produk di katalog.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54)),
              ..._catalog.map((product) => _CatalogProductCard(
                    product: product,
                    onBuy: _busy ? null : () => _buy(product),
                  )),
              const SizedBox(height: 8),
              _AccountSectionCard(
                icon: Icons.sell_outlined,
                title: 'Jual produk ke koperasi',
                subtitle: 'Ajukan barang milik Anda untuk dijual / disewakan lewat koperasi. Disetujui pengurus dulu.',
                children: [
                  FilledButton.icon(
                    onPressed: _busy ? null : _sell,
                    icon: const Icon(Icons.add_business_outlined, size: 18),
                    label: const Text('Ajukan produk baru'),
                  ),
                  if (_myListings.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    ..._myListings.map((item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5),
                          child: Row(children: [
                            Expanded(child: Text('${item.nama} · ${formatRupiah(item.harga)}')),
                            Text(_statusLabel(item.status),
                                style: TextStyle(color: _statusColor(context, item.status), fontWeight: FontWeight.w600, fontSize: 12)),
                          ]),
                        )),
                  ],
                ],
              ),
              if (_myPurchases.isNotEmpty) ...[
                const SizedBox(height: 14),
                _AccountSectionCard(
                  icon: Icons.receipt_long_outlined,
                  title: 'Transaksi saya',
                  subtitle: 'Riwayat pembelian & penyewaan produk.',
                  children: _myPurchases
                      .map((p) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: [
                                Expanded(child: Text('${p.jenis} ${p.produkNama} · ${formatRupiah(p.total)}', style: const TextStyle(fontWeight: FontWeight.w600))),
                                Text(_statusLabel(p.status),
                                    style: TextStyle(color: _statusColor(context, p.status), fontWeight: FontWeight.w600, fontSize: 12)),
                              ]),
                              Text(
                                p.metodePembayaran == 'Kredit'
                                    ? 'Kredit · tagihan: ${p.tagihanKreditStatus ?? 'menunggu'}'
                                    : 'Tunai',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                              ),
                            ]),
                          ))
                      .toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CatalogProductCard extends StatelessWidget {
  const _CatalogProductCard({required this.product, required this.onBuy});

  final CatalogProduct product;
  final VoidCallback? onBuy;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final habis = !product.sewa && product.stok <= 0;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 64,
                height: 64,
                child: product.fotoUrl == null
                    ? Container(color: colors.primaryContainer, child: Icon(Icons.inventory_2_outlined, color: colors.onPrimaryContainer))
                    : Image.network('${AuthService.baseUrl}${product.fotoUrl}', fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(color: colors.primaryContainer, child: const Icon(Icons.broken_image_outlined))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(child: Text(product.nama, style: const TextStyle(fontWeight: FontWeight.w700))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(color: colors.secondaryContainer, borderRadius: BorderRadius.circular(6)),
                      child: Text(product.sewa ? 'Sewa' : 'Jual', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: colors.onSecondaryContainer)),
                    ),
                  ]),
                  const SizedBox(height: 2),
                  Text('${formatRupiah(product.harga)} / ${product.satuan}', style: const TextStyle(fontWeight: FontWeight.w800)),
                  if (product.deskripsi != null && product.deskripsi!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(product.deskripsi!, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                  ],
                  const SizedBox(height: 4),
                  Row(children: [
                    Expanded(
                      child: Text(
                        product.sewa
                            ? (product.sumber == 'TitipanAnggota' ? 'Titipan ${product.diajukanOleh ?? 'anggota'}' : 'Milik koperasi')
                            : (habis ? 'Stok habis' : 'Stok ${product.stok.toStringAsFixed(product.stok % 1 == 0 ? 0 : 2)} ${product.satuan}'),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: habis ? Colors.red.shade700 : Colors.black54),
                      ),
                    ),
                    FilledButton(
                      onPressed: habis ? null : onBuy,
                      child: Text(product.sewa ? 'Sewa' : 'Beli'),
                    ),
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BuySheet extends StatefulWidget {
  const _BuySheet({required this.product});
  final CatalogProduct product;

  @override
  State<_BuySheet> createState() => _BuySheetState();
}

class _BuySheetState extends State<_BuySheet> {
  final _jumlahController = TextEditingController(text: '1');
  final _catatanController = TextEditingController();
  String _metode = 'Tunai';

  @override
  void dispose() {
    _jumlahController.dispose();
    _catatanController.dispose();
    super.dispose();
  }

  double get _jumlah => double.tryParse(_jumlahController.text.replaceAll(',', '.')) ?? 0;

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('${p.sewa ? 'Sewa' : 'Beli'} ${p.nama}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('${formatRupiah(p.harga)} / ${p.satuan}', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 14),
          TextField(
            controller: _jumlahController,
            keyboardType: TextInputType.number,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(labelText: p.sewa ? 'Jumlah / durasi' : 'Jumlah', suffixText: p.satuan),
          ),
          const SizedBox(height: 12),
          const Text('Metode pembayaran', style: TextStyle(fontWeight: FontWeight.w700)),
          RadioListTile<String>(
            contentPadding: EdgeInsets.zero,
            value: 'Tunai',
            groupValue: _metode,
            onChanged: (v) => setState(() => _metode = v!),
            title: const Text('Tunai'),
            subtitle: const Text('Dibayar fisik ke pengurus'),
          ),
          RadioListTile<String>(
            contentPadding: EdgeInsets.zero,
            value: 'Kredit',
            groupValue: _metode,
            onChanged: (v) => setState(() => _metode = v!),
            title: const Text('Kredit'),
            subtitle: const Text('Jadi hutang — ditagih lewat SDM (potong gaji)'),
          ),
          const SizedBox(height: 8),
          TextField(controller: _catatanController, decoration: const InputDecoration(labelText: 'Catatan (opsional)')),
          const SizedBox(height: 14),
          _InfoRow(label: 'Total', value: formatRupiah(p.harga * _jumlah)),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _jumlah <= 0
                ? null
                : () => Navigator.pop(context, (
                    jumlah: _jumlah,
                    metode: _metode,
                    catatan: _catatanController.text.trim().isEmpty ? null : _catatanController.text.trim(),
                  )),
            child: const Text('Ajukan'),
          ),
        ],
      ),
    );
  }
}

class SellProductPage extends StatefulWidget {
  const SellProductPage({super.key});

  @override
  State<SellProductPage> createState() => _SellProductPageState();
}

class _SellProductPageState extends State<SellProductPage> {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _deskripsiController = TextEditingController();
  final _hargaController = TextEditingController();
  final _stokController = TextEditingController(text: '1');
  final _satuanController = TextEditingController(text: 'unit');
  String _jenis = 'Jual';
  XFile? _foto;
  bool _saving = false;

  @override
  void dispose() {
    _namaController.dispose();
    _deskripsiController.dispose();
    _hargaController.dispose();
    _stokController.dispose();
    _satuanController.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final photo = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1400);
    if (photo != null) setState(() => _foto = photo);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final produk = await AuthService().submitProductListing(
        nama: _namaController.text,
        deskripsi: _deskripsiController.text,
        jenis: _jenis,
        harga: double.parse(_hargaController.text.replaceAll('.', '').replaceAll(',', '')),
        stok: double.tryParse(_stokController.text.replaceAll(',', '.')) ?? 1,
        satuan: _satuanController.text,
      );
      if (_foto != null) {
        await AuthService().uploadProductListingPhoto(produk.id, _foto!);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pengajuan produk terkirim. Menunggu persetujuan pengurus.')),
      );
      Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Exception: ', ''))));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Jual produk ke koperasi')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Text(
                'Barang yang disetujui akan menjadi milik koperasi dan tampil di katalog. Pelunasan ke Anda diatur pengurus.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _pickPhoto,
                child: Container(
                  height: 160,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Center(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(_foto == null ? Icons.add_a_photo_outlined : Icons.check_circle_outline,
                          color: _foto == null ? null : Colors.green.shade700),
                      const SizedBox(height: 6),
                      Text(_foto == null ? 'Tambahkan foto produk (opsional)' : 'Foto dipilih: ${_foto!.name}'),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _namaController,
                decoration: const InputDecoration(labelText: 'Nama produk'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _deskripsiController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Deskripsi (opsional)'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _jenis,
                decoration: const InputDecoration(labelText: 'Jenis'),
                items: const [
                  DropdownMenuItem(value: 'Jual', child: Text('Dijual')),
                  DropdownMenuItem(value: 'Sewa', child: Text('Disewakan')),
                ],
                onChanged: (v) => setState(() => _jenis = v ?? 'Jual'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _hargaController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: _jenis == 'Sewa' ? 'Harga sewa' : 'Harga jual', prefixText: 'Rp '),
                validator: (v) {
                  final n = double.tryParse((v ?? '').replaceAll('.', '').replaceAll(',', ''));
                  return n == null || n <= 0 ? 'Harga tidak valid' : null;
                },
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: TextFormField(
                    controller: _stokController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Stok / jumlah'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _satuanController,
                    decoration: const InputDecoration(labelText: 'Satuan'),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Wajib' : null,
                  ),
                ),
              ]),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: _saving ? null : _submit,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.send_outlined),
                label: Text(_saving ? 'Mengirim...' : 'Kirim pengajuan'),
              ),
            ],
          ),
        ),
      ),
    );
  }
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

// ── Beranda ──────────────────────────────────────────────────────────────────
class Announcement {
  const Announcement({required this.ikon, required this.judul, required this.isi, required this.tautan});
  final String ikon; // vote | dokumen | produk | info
  final String judul;
  final String isi;
  final String tautan; // erat | katalog | simpanan | pinjaman | ''
  factory Announcement.fromJson(Map<String, dynamic> json) => Announcement(
        ikon: json['ikon'] as String,
        judul: json['judul'] as String,
        isi: json['isi'] as String,
        tautan: json['tautan'] as String,
      );
}

class HomeSummary {
  const HomeSummary({
    required this.totalSimpanan,
    required this.simpananPokok,
    required this.simpananWajib,
    required this.simpananSukarela,
    required this.simpananBerjangka,
    required this.jumlahPinjamanAktif,
    required this.sisaPokokPinjaman,
    required this.cicilanBulananBerjalan,
    required this.sisaAngsuran,
    required this.pengumuman,
    required this.produkTerbaru,
    this.estimasiShuTahun,
    this.estimasiShuNominal,
  });

  final double totalSimpanan;
  final double simpananPokok;
  final double simpananWajib;
  final double simpananSukarela;
  final double simpananBerjangka;
  final int jumlahPinjamanAktif;
  final double sisaPokokPinjaman;
  final double cicilanBulananBerjalan;
  final int sisaAngsuran;
  final List<Announcement> pengumuman;
  final List<CatalogProduct> produkTerbaru;
  final int? estimasiShuTahun;
  final double? estimasiShuNominal;

  factory HomeSummary.fromJson(Map<String, dynamic> json) {
    final estimasiShu = json['estimasiShu'] as Map<String, dynamic>?;
    return HomeSummary(
      totalSimpanan: (json['totalSimpanan'] as num).toDouble(),
      simpananPokok: (json['simpananPokok'] as num).toDouble(),
      simpananWajib: (json['simpananWajib'] as num).toDouble(),
      simpananSukarela: (json['simpananSukarela'] as num).toDouble(),
      simpananBerjangka: (json['simpananBerjangka'] as num).toDouble(),
      jumlahPinjamanAktif: json['jumlahPinjamanAktif'] as int,
      sisaPokokPinjaman: (json['sisaPokokPinjaman'] as num).toDouble(),
      cicilanBulananBerjalan: (json['cicilanBulananBerjalan'] as num).toDouble(),
      sisaAngsuran: json['sisaAngsuran'] as int,
      pengumuman: (json['pengumuman'] as List<dynamic>? ?? [])
          .map((e) => Announcement.fromJson(e as Map<String, dynamic>))
          .toList(),
      produkTerbaru: (json['produkTerbaru'] as List<dynamic>? ?? [])
          .map((e) => CatalogProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
      estimasiShuTahun: estimasiShu?['tahun'] as int?,
      estimasiShuNominal: (estimasiShu?['totalShu'] as num?)?.toDouble(),
    );
  }
}

// ── SHU (Sisa Hasil Usaha) ──────────────────────────────────────────────────
class ShuHistoryEntry {
  const ShuHistoryEntry({
    required this.tahun,
    required this.simpananAnggota,
    required this.transaksiAnggota,
    required this.jma,
    required this.jua,
    required this.totalShu,
    required this.pajak,
    required this.totalShuNeto,
    required this.persenJasaModal,
    required this.persenJasaUsaha,
    required this.difinalisasiPada,
  });

  final int tahun;
  final double simpananAnggota;
  final double transaksiAnggota;
  final double jma;
  final double jua;
  final double totalShu;
  final double pajak;
  final double totalShuNeto;
  final double persenJasaModal;
  final double persenJasaUsaha;
  final DateTime difinalisasiPada;

  factory ShuHistoryEntry.fromJson(Map<String, dynamic> json) => ShuHistoryEntry(
        tahun: json['tahun'] as int,
        simpananAnggota: (json['simpananAnggota'] as num).toDouble(),
        transaksiAnggota: (json['transaksiAnggota'] as num).toDouble(),
        jma: (json['jma'] as num).toDouble(),
        jua: (json['jua'] as num).toDouble(),
        totalShu: (json['totalShu'] as num).toDouble(),
        pajak: (json['pajak'] as num).toDouble(),
        totalShuNeto: (json['totalShuNeto'] as num).toDouble(),
        persenJasaModal: (json['persenJasaModal'] as num).toDouble(),
        persenJasaUsaha: (json['persenJasaUsaha'] as num).toDouble(),
        difinalisasiPada: DateTime.parse(json['difinalisasiPada'] as String),
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
  const SukarelaSection({required this.saldo, required this.bungaTahunan, required this.tarifPphBunga, required this.pengajuan});
  final double saldo;
  final double bungaTahunan;
  final double tarifPphBunga;
  final List<SukarelaRequest> pengajuan;
  factory SukarelaSection.fromJson(Map<String, dynamic> json) => SukarelaSection(
        saldo: (json['saldo'] as num).toDouble(),
        bungaTahunan: (json['bungaTahunan'] as num?)?.toDouble() ?? 0,
        tarifPphBunga: (json['tarifPphBunga'] as num?)?.toDouble() ?? 0,
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
  const TermDeposit({required this.id, required this.nomorSertifikat, required this.produkNama, required this.nominal, required this.tenorBulan, required this.status, this.tanggalMulai, this.tanggalJatuhTempo, required this.estimasiBunga, this.bungaDibayar, required this.pencairanDiajukan});
  final int id;
  final String nomorSertifikat;
  final String produkNama;
  final double nominal;
  final int tenorBulan;
  final String status;
  final DateTime? tanggalMulai;
  final DateTime? tanggalJatuhTempo;
  final double estimasiBunga;
  final double? bungaDibayar;
  final bool pencairanDiajukan;
  factory TermDeposit.fromJson(Map<String, dynamic> json) => TermDeposit(
        id: json['id'] as int,
        nomorSertifikat: json['nomorSertifikat'] as String,
        produkNama: json['produkNama'] as String,
        nominal: (json['nominal'] as num).toDouble(),
        tenorBulan: json['tenorBulan'] as int,
        status: json['status'] as String,
        tanggalMulai: json['tanggalMulai'] == null ? null : DateTime.parse(json['tanggalMulai'] as String),
        tanggalJatuhTempo: json['tanggalJatuhTempo'] == null ? null : DateTime.parse(json['tanggalJatuhTempo'] as String),
        estimasiBunga: (json['estimasiBunga'] as num?)?.toDouble() ?? 0,
        bungaDibayar: (json['bungaDibayar'] as num?)?.toDouble(),
        pencairanDiajukan: json['pencairanDiajukan'] as bool? ?? false,
      );
}

class BerjangkaSection {
  const BerjangkaSection({required this.bungaTahunan, required this.produk, required this.milikSaya});
  final double bungaTahunan;
  final List<BerjangkaProduct> produk;
  final List<TermDeposit> milikSaya;
  factory BerjangkaSection.fromJson(Map<String, dynamic> json) => BerjangkaSection(
        bungaTahunan: (json['bungaTahunan'] as num?)?.toDouble() ?? 0,
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

// ── Arus kas pribadi ─────────────────────────────────────────────────────────
class CashFlowItem {
  const CashFlowItem({required this.tanggal, required this.kategori, required this.keterangan, required this.masuk, required this.nominal});
  final DateTime tanggal;
  final String kategori;
  final String keterangan;
  final bool masuk;
  final double nominal;
  factory CashFlowItem.fromJson(Map<String, dynamic> json) => CashFlowItem(
        tanggal: DateTime.parse(json['tanggal'] as String),
        kategori: json['kategori'] as String,
        keterangan: json['keterangan'] as String,
        masuk: json['arah'] == 'Masuk',
        nominal: (json['nominal'] as num).toDouble(),
      );
}

class PersonalCashFlow {
  const PersonalCashFlow({required this.totalMasuk, required this.totalKeluar, required this.saldoBersih, required this.riwayat});
  final double totalMasuk;
  final double totalKeluar;
  final double saldoBersih;
  final List<CashFlowItem> riwayat;
  factory PersonalCashFlow.fromJson(Map<String, dynamic> json) => PersonalCashFlow(
        totalMasuk: (json['totalMasuk'] as num).toDouble(),
        totalKeluar: (json['totalKeluar'] as num).toDouble(),
        saldoBersih: (json['saldoBersih'] as num).toDouble(),
        riwayat: (json['riwayat'] as List<dynamic>).map((e) => CashFlowItem.fromJson(e as Map<String, dynamic>)).toList(),
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

  Future<void> _ajukanPencairan(TermDeposit deposit) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Ajukan pencairan dipercepat'),
        content: Text(
          '${deposit.produkNama} · ${formatRupiah(deposit.nominal)}\n\n'
          'Jika dicairkan sebelum jatuh tempo, Anda hanya menerima pokok — '
          'bunga ${formatRupiah(deposit.estimasiBunga)} TIDAK dibayarkan. '
          'Pengajuan diverifikasi pengurus.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Batal')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Ajukan pencairan')),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _busy = true);
    try {
      await AuthService().requestEarlyWithdrawal(berjangkaId: deposit.id);
      if (!mounted) return;
      _toast('Pengajuan pencairan dipercepat terkirim.');
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
              subtitle: 'Bunga ${(data.sukarela.bungaTahunan * 100).toStringAsFixed(2)}%/th, dihitung saldo harian, dipotong PPh ${(data.sukarela.tarifPphBunga * 100).toStringAsFixed(0)}%, dibukukan tanggal akhir tiap bulan.',
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
              subtitle: 'Bunga ${(data.berjangka.bungaTahunan * 100).toStringAsFixed(2)}%/th. Dana terkunci hingga jatuh tempo.',
              children: [
                if (data.berjangka.produk.isEmpty)
                  Text('Belum ada paket berjangka tersedia.', style: Theme.of(context).textTheme.bodySmall)
                else
                  ...data.berjangka.produk.map((produk) {
                    final bunga = produk.nominal * data.berjangka.bungaTahunan * produk.tenorBulan / 12;
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 5),
                      child: ListTile(
                        title: Text(produk.nama, style: const TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: Text('${formatRupiah(produk.nominal)} · ${produk.tenorBulan} bulan\nEstimasi bunga ${formatRupiah(bunga)}'),
                        isThreeLine: true,
                        trailing: FilledButton(
                          onPressed: _busy ? null : () => _ajukanBerjangka(produk),
                          child: const Text('Ajukan'),
                        ),
                      ),
                    );
                  }),
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
                          Text(
                            deposit.bungaDibayar != null
                                ? (deposit.bungaDibayar == 0
                                    ? 'Dicairkan dipercepat — tanpa bunga'
                                    : 'Bunga dibayar ${formatRupiah(deposit.bungaDibayar!)} (masuk ke sukarela)')
                                : 'Estimasi bunga saat jatuh tempo ${formatRupiah(deposit.estimasiBunga)}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                          ),
                          if (deposit.status == 'Aktif') ...[
                            const SizedBox(height: 6),
                            if (deposit.pencairanDiajukan)
                              Text('Pengajuan pencairan dipercepat menunggu persetujuan pengurus.',
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.orange.shade800, fontWeight: FontWeight.w600))
                            else
                              OutlinedButton.icon(
                                onPressed: _busy ? null : () => _ajukanPencairan(deposit),
                                icon: const Icon(Icons.lock_open_outlined, size: 16),
                                label: const Text('Ajukan pencairan dipercepat'),
                              ),
                          ],
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
                    .map((m) {
                      final debit = m.jenis == 'Tarik' || m.jenis == 'Pajak';
                      return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5),
                          child: Row(children: [
                            Expanded(child: Text('${m.rekening} · ${m.jenis}', style: const TextStyle(fontSize: 13))),
                            Text('${debit ? '-' : '+'}${formatRupiah(m.nominal)}',
                                style: TextStyle(fontWeight: FontWeight.w700, color: debit ? Colors.red.shade700 : Colors.green.shade700)),
                          ]),
                        );
                    })
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

class _CashFlowCard extends StatefulWidget {
  const _CashFlowCard({required this.loading, required this.error, required this.data, required this.onRefresh});

  final bool loading;
  final String? error;
  final PersonalCashFlow? data;
  final Future<void> Function() onRefresh;

  @override
  State<_CashFlowCard> createState() => _CashFlowCardState();
}

class _CashFlowCardState extends State<_CashFlowCard> {
  bool _showAll = false;

  IconData _iconFor(String kategori) => switch (kategori) {
        'Simpanan' => Icons.savings_outlined,
        'Pinjaman' => Icons.request_quote_outlined,
        'Katalog' => Icons.storefront_outlined,
        _ => Icons.swap_horiz,
      };

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final data = widget.data;
    final riwayat = data?.riwayat ?? const <CashFlowItem>[];
    final tampil = _showAll ? riwayat : riwayat.take(6).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Row(children: [
            Expanded(child: Text('Arus kas pribadi', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800))),
            IconButton(
              onPressed: widget.loading ? null : () => widget.onRefresh(),
              icon: widget.loading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.refresh, size: 20),
              tooltip: 'Muat ulang',
            ),
          ]),
          Text('Ringkasan uang masuk & keluar dari simpanan, pinjaman, dan belanja katalog Anda.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54)),
          const SizedBox(height: 14),
          if (widget.error != null)
            Text(widget.error!, style: TextStyle(color: colors.error))
          else if (data == null && widget.loading)
            const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Center(child: CircularProgressIndicator()))
          else if (data != null) ...[
            Row(children: [
              Expanded(child: _CashFlowStat(label: 'Masuk', value: data.totalMasuk, color: Colors.green.shade700, icon: Icons.arrow_downward)),
              const SizedBox(width: 10),
              Expanded(child: _CashFlowStat(label: 'Keluar', value: data.totalKeluar, color: Colors.red.shade700, icon: Icons.arrow_upward)),
              const SizedBox(width: 10),
              Expanded(child: _CashFlowStat(label: 'Bersih', value: data.saldoBersih, color: colors.primary, icon: Icons.account_balance_wallet_outlined)),
            ]),
            const SizedBox(height: 12),
            if (riwayat.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Text('Belum ada aktivitas keuangan tercatat.', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54)),
              )
            else ...[
              const Divider(height: 20),
              ...tampil.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: (item.masuk ? Colors.green : Colors.red).withValues(alpha: .1),
                        child: Icon(_iconFor(item.kategori), size: 16, color: item.masuk ? Colors.green.shade700 : Colors.red.shade700),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(item.keterangan, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          Text(_monthLabel(item.tanggal), style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black45, fontSize: 11)),
                        ]),
                      ),
                      Text(
                        '${item.masuk ? '+' : '−'}${formatRupiah(item.nominal)}',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: item.masuk ? Colors.green.shade700 : Colors.red.shade700),
                      ),
                    ]),
                  )),
              if (riwayat.length > 6)
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => setState(() => _showAll = !_showAll),
                    child: Text(_showAll ? 'Tampilkan lebih sedikit' : 'Lihat semua (${riwayat.length})'),
                  ),
                ),
            ],
          ],
        ]),
      ),
    );
  }
}

class _CashFlowStat extends StatelessWidget {
  const _CashFlowStat({required this.label, required this.value, required this.color, required this.icon});

  final String label;
  final double value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(color: color.withValues(alpha: .08), borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 15, color: color),
        const SizedBox(height: 6),
        Text(label, style: TextStyle(fontSize: 11, color: color.withValues(alpha: .85))),
        const SizedBox(height: 2),
        Text(formatRupiah(value), maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: color)),
      ]),
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

  bool _loadingCashFlow = true;
  String? _cashFlowError;
  PersonalCashFlow? _cashFlow;

  @override
  void initState() {
    super.initState();
    _user = widget.session.user;
    _nameController = TextEditingController(text: _user.namaLengkap);
    _emailController = TextEditingController(text: _user.email ?? '');
    _phoneController = TextEditingController(text: _user.nomorTelepon ?? '');
    _addressController = TextEditingController(text: _user.alamat ?? '');
    _loadCashFlow();
  }

  Future<void> _loadCashFlow() async {
    setState(() {
      _loadingCashFlow = true;
      _cashFlowError = null;
    });
    try {
      final data = await AuthService().fetchCashFlow();
      if (!mounted) return;
      setState(() => _cashFlow = data);
    } catch (error) {
      if (!mounted) return;
      setState(() => _cashFlowError = error is ApiException ? error.message : 'Gagal memuat arus kas.');
    } finally {
      if (mounted) setState(() => _loadingCashFlow = false);
    }
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
            _CashFlowCard(loading: _loadingCashFlow, error: _cashFlowError, data: _cashFlow, onRefresh: _loadCashFlow),
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
