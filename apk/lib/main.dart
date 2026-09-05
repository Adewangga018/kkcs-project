import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
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
    request.files.add(http.MultipartFile.fromBytes('file', await photo.readAsBytes(), filename: photo.name));
    final response = await http.Response.fromStream(await request.send());
    _ensureSuccess(response);
    return AuthUser.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
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
                    'Koperasi yang tumbuh\nbersama anggotanya.',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          height: 1.05,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Selamat datang di KKCS. Kelola perjalanan koperasi Anda dalam satu ruang yang sederhana.',
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
      subtitle: 'Daftarkan diri untuk mulai menggunakan layanan koperasi.',
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
              MaterialPageRoute(builder: (_) => AccountPage(auth: auth, session: session)),
            ),
            icon: const Icon(Icons.account_circle_outlined),
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
              'Pilih modul untuk melanjutkan aktivitas koperasi Anda.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 24),
            Text('Modul KKCS', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            _ModuleTile(
              icon: Icons.groups_outlined,
              title: 'Manajemen Anggota & HR Integration',
              subtitle: 'Anggota, HRIS, payroll, impor data, dan portal mandiri',
              enabled: true,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AccountPage(auth: auth, session: session)),
              ),
            ),
            const _ModuleTile(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Simpan Pinjam Digital',
              subtitle: 'Simpanan, pengajuan pinjaman, dan persetujuan',
              enabled: false,
            ),
            const _ModuleTile(
              icon: Icons.storefront_outlined,
              title: 'Unit Usaha Tambahan',
              subtitle: 'POS toko, PPOB, stok, dan supplier',
              enabled: false,
            ),
            const _ModuleTile(
              icon: Icons.analytics_outlined,
              title: 'Akuntansi & Keuangan',
              subtitle: 'Jurnal, laporan keuangan, dan kalkulator SHU',
              enabled: false,
            ),
            const _ModuleTile(
              icon: Icons.shield_outlined,
              title: 'Keamanan & Tata Kelola Enterprise',
              subtitle: 'Akses peran, E-RAT, dan audit trail',
              enabled: false,
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.enabled,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: enabled ? null : colorScheme.surfaceContainerHighest.withValues(alpha: .45),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: enabled ? colorScheme.primaryContainer : colorScheme.surfaceContainerHighest,
          child: Icon(icon, color: enabled ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant),
        ),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.w700, color: enabled ? null : Colors.black54)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(subtitle),
        ),
        trailing: Icon(enabled ? Icons.arrow_forward_ios : Icons.lock_outline, size: 17),
        onTap: enabled
            ? onTap
            : () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Modul ini akan segera tersedia.')),
                ),
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
            const SizedBox(height: 16),
            _AccountSectionCard(
              icon: Icons.payments_outlined,
              title: 'Laporan Potong Gaji',
              subtitle: 'Ringkasan kewajiban bulanan untuk HR atau Keuangan.',
              children: const [
                _InfoRow(label: 'Simpanan wajib bulan ini', value: 'Belum tersedia'),
                _InfoRow(label: 'Cicilan pinjaman bulan ini', value: 'Belum tersedia'),
                _InfoRow(label: 'Status laporan', value: 'Menunggu periode berjalan'),
              ],
            ),
            const SizedBox(height: 16),
            _AccountSectionCard(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Portal Mandiri Anggota',
              subtitle: 'Pantau kondisi keanggotaan Anda secara mandiri.',
              children: const [
                _InfoRow(label: 'Total saldo simpanan', value: 'Belum tersedia'),
                _InfoRow(label: 'Riwayat pinjaman', value: 'Belum tersedia'),
                _InfoRow(label: 'Estimasi SHU', value: 'Belum tersedia'),
              ],
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
