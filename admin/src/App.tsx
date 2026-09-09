import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Activity, BadgeCheck, Banknote, Database, FileText, HandCoins, LayoutDashboard, LogOut, Menu, PiggyBank, RefreshCw, Search, ShieldCheck, Store, UserPlus, Users, Vote, Wallet, X, Zap } from 'lucide-react'
import './App.css'

type AdminUser = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; peran: string; statusKeanggotaan: string; aktif: boolean; dibuatPada: string }
type Pendaftaran = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; statusKeanggotaan: string; dibuatPada: string }
type Konfigurasi = { simpananPokokNominal: number; simpananWajibNominal: number; tanggalTagihWajib: number; bungaSukarelaTahunan: number; bungaDepositoTahunan: number; diperbaruiPada: string }
type TagihanWajib = { id: number; namaAnggota: string; nomorIndukKaryawan: string; periode: string; nominal: number; jatuhTempo: string; status: string; catatanReview: string | null; dibuatPada: string; diprosesPada: string | null }
type TransaksiSukarela = { id: number; namaAnggota: string; nomorIndukKaryawan: string; jenis: string; nominal: number; catatan: string | null; status: string; catatanReview: string | null; diajukanPada: string; diprosesPada: string | null; saldoSukarela: number }
type ProdukBerjangka = { id: number; nama: string; nominal: number; tenorBulan: number; aktif: boolean }
type SimpananBerjangka = { id: number; namaAnggota: string; nomorIndukKaryawan: string; produkNama: string; nomorSertifikat: string; nominal: number; tenorBulan: number; status: string; catatanReview: string | null; diajukanPada: string; tanggalMulai: string | null; tanggalJatuhTempo: string | null; dicairkanPada: string | null; estimasiBunga: number; pencairanDiajukan: boolean; pencairanDiajukanPada: string | null; alasanPencairan: string | null }
type Produk = { id: number; kode: string; nama: string; deskripsi: string | null; jenis: string; harga: number; stok: number; satuan: string; fotoUrl: string | null; sumber: string; diajukanOleh: string | null; status: string; aktif: boolean; catatanReview: string | null }
type PembelianProduk = { id: number; nomorTransaksi: string; namaPembeli: string; nomorIndukKaryawan: string; produkNama: string; jenis: string; jumlah: number; hargaSatuan: number; total: number; metodePembayaran: string; status: string; catatan: string | null; catatanReview: string | null; diajukanPada: string; diprosesPada: string | null }
type TagihanKredit = { id: number; pembelianProdukId: number; penggunaId: number; nomorTransaksi: string; namaAnggota: string; nomorIndukKaryawan: string; produkNama: string; total: number; status: string; dibuatPada: string; dikirimPada: string | null; lunasPada: string | null }
type EratOpsi = { id: number; label: string; jumlah: number }
type EratAgenda = { id: number; judul: string; deskripsi: string | null; status: string; mulaiPada: string | null; selesaiPada: string | null; dibuatPada: string; totalSuara: number; opsi: EratOpsi[] }
type RatDoc = { id: number; tahun: number; judul: string; deskripsi: string | null; fileUrl: string; diterbitkanPada: string; aktif: boolean }
type LoanApplication = {
  id: number; nomorPengajuan: string; namaAnggota: string; nomorIndukKaryawan: string
  nominal: number; tenorBulan: number; bungaTahunan: number; estimasiCicilanBulanan: number; estimasiTotalJasa: number
  tujuan: string; status: string; catatanReview: string | null; dibuatPada: string; diputuskanPada: string | null
}
type LoanInstallment = {
  angsuranKe: number; jatuhTempo: string; pokok: number; jasa: number; total: number; jenis: string; status: string
  jumlahDibayar: number | null; dibayarPada: string | null
}
type Loan = {
  id: number; nomorPinjaman: string; namaAnggota: string; nomorIndukKaryawan: string
  pokok: number; tenorBulan: number; bungaTahunan: number; pokokPerBulan: number; jasaPerBulan: number; angsuranPerBulan: number
  sisaPokok: number; angsuranTerbayar: number; tanggalMulai: string; status: string; lunasPada: string | null
  nilaiPelunasanDipercepat: number; jasaDibebaskan: number; angsuran: LoanInstallment[]
}
type PaymentRequest = {
  id: number; pinjamanId: number; nomorPinjaman: string; namaAnggota: string; nomorIndukKaryawan: string
  jenis: string; jumlahDiajukan: number; jasaDibebaskan: number | null; angsuranKe: number | null
  catatan: string | null; status: string; catatanReview: string | null; diajukanPada: string; diputuskanPada: string | null
}

type View = 'pengguna' | 'pinjaman' | 'simpanan' | 'katalog' | 'erat'
const VIEW_TITLE: Record<View, string> = { pengguna: 'Dashboard pengguna', pinjaman: 'Manajemen pinjaman', simpanan: 'Manajemen simpanan', katalog: 'Katalog produk', erat: 'E-RAT & dokumen' }
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5168'
const rupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`
const tanggal = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('kkcs_admin_token') ?? '')
  const [view, setView] = useState<View>('pengguna')
  const [error, setError] = useState('')
  const [loginNIK, setLoginNIK] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoginLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nomorIndukKaryawan: loginNIK, password: loginPassword }) })
      const data = await response.json()
      if (!response.ok) throw new Error('NIK atau password admin salah.')
      if (!['Admin', 'Pengurus'].includes(data.user.peran)) throw new Error('Akun ini bukan akun admin atau pengurus.')
      localStorage.setItem('kkcs_admin_token', data.token); setToken(data.token)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal masuk.') }
    finally { setLoginLoading(false) }
  }
  const logout = () => { localStorage.removeItem('kkcs_admin_token'); setToken('') }
  const handleExpired = useCallback(() => {
    localStorage.removeItem('kkcs_admin_token'); setToken('')
    setError('Sesi login berakhir. Silakan masuk kembali.')
  }, [])

  if (!token) return <LoginScreen nik={loginNIK} password={loginPassword} setNik={setLoginNIK} setPassword={setLoginPassword} loading={loginLoading} error={error} onSubmit={login} />

  const goto = (target: View) => { setView(target); setMobileNav(false) }
  return <div className="console-shell">
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div>
      <nav className="primary-nav">
        <button className={`nav-item ${view === 'pengguna' ? 'active' : ''}`} onClick={() => goto('pengguna')}><LayoutDashboard size={18} /> Pengguna</button>
        <button className={`nav-item ${view === 'simpanan' ? 'active' : ''}`} onClick={() => goto('simpanan')}><PiggyBank size={18} /> Simpanan</button>
        <button className={`nav-item ${view === 'pinjaman' ? 'active' : ''}`} onClick={() => goto('pinjaman')}><HandCoins size={18} /> Pinjaman</button>
        <button className={`nav-item ${view === 'katalog' ? 'active' : ''}`} onClick={() => goto('katalog')}><Store size={18} /> Katalog</button>
        <button className={`nav-item ${view === 'erat' ? 'active' : ''}`} onClick={() => goto('erat')}><Vote size={18} /> E-RAT</button>
        <button className="nav-item"><Database size={18} /> Data koperasi <span className="nav-soon">segera</span></button>
      </nav>
      <div className="sidebar-footer"><ShieldCheck size={16} /> Role-based access</div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Buka navigasi"><Menu size={20} /></button>
        <div><p className="eyebrow">OPERASIONAL</p><h1>{VIEW_TITLE[view]}</h1></div>
        <div className="topbar-actions"><button className="profile-chip" onClick={logout}><span className="mini-avatar"><Users size={16} /></span><span>Pengurus</span><LogOut size={15} /></button></div>
      </header>
      {view === 'pengguna' && <UsersView token={token} onExpired={handleExpired} />}
      {view === 'simpanan' && <SavingsView token={token} onExpired={handleExpired} />}
      {view === 'pinjaman' && <LoansView token={token} onExpired={handleExpired} />}
      {view === 'katalog' && <CatalogView token={token} onExpired={handleExpired} />}
      {view === 'erat' && <EratView token={token} onExpired={handleExpired} />}
    </main>
  </div>
}

function UsersView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [usersResponse, pendaftaranResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/pengguna`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/anggota/pendaftaran`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (usersResponse.status === 401 || pendaftaranResponse.status === 401) { onExpired(); return }
      if (!usersResponse.ok || !pendaftaranResponse.ok) throw new Error(usersResponse.status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat pengguna.')
      setUsers(await usersResponse.json())
      setPendaftaran(await pendaftaranResponse.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired])
  useEffect(() => { void loadUsers() }, [loadUsers])

  const decidePendaftaran = async (calon: Pendaftaran, setuju: boolean) => {
    if (!window.confirm(`${setuju ? 'Setujui' : 'Tolak'} pendaftaran ${calon.namaLengkap} (NIK ${calon.nomorIndukKaryawan})?${setuju ? '\n\nSimpanan pokok akan otomatis dikreditkan.' : ''}`)) return
    let catatan: string | null = null
    if (!setuju) catatan = window.prompt('Alasan penolakan (opsional):')
    setBusyId(calon.id); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/anggota/${calon.id}/persetujuan`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ setuju, catatan }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal memproses pendaftaran.')
      setNotice(data.message ?? 'Berhasil.'); window.setTimeout(() => setNotice(''), 3200)
      await loadUsers()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memproses pendaftaran.') }
    finally { setBusyId(0) }
  }
  const pendingPendaftaran = pendaftaran.filter((item) => item.statusKeanggotaan === 'MenungguPersetujuan')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const needle = query.toLowerCase()
    const matchesQuery = !needle || [user.namaLengkap, user.nomorIndukKaryawan, user.email ?? ''].some((value) => value.toLowerCase().includes(needle))
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.aktif : !user.aktif)
    const matchesRole = roleFilter === 'all' || user.peran === roleFilter
    return matchesQuery && matchesStatus && matchesRole
  }), [users, query, statusFilter, roleFilter])
  const activeCount = users.filter((user) => user.aktif).length
  const roles = [...new Set(users.map((user) => user.peran))]

  const toggleUser = async (user: AdminUser) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna/${user.id}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ aktif: !user.aktif }) })
      if (!response.ok) throw new Error('Status pengguna gagal diperbarui.')
      const updated: AdminUser = await response.json()
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item))
      setNotice(`${updated.namaLengkap} sekarang ${updated.aktif ? 'aktif' : 'nonaktif'}`); window.setTimeout(() => setNotice(''), 2800)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memperbarui status.') }
  }

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Kontrol akses anggota</h2><p>Kelola status akses pengguna koperasi dengan satu tindakan yang tercatat.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void loadUsers()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid"><StatCard label="Total pengguna" value={users.length} icon={<Users size={20} />} tone="teal" /><StatCard label="Pengguna aktif" value={activeCount} icon={<BadgeCheck size={20} />} tone="green" /><StatCard label="Menunggu persetujuan" value={pendingPendaftaran.length} icon={<UserPlus size={20} />} tone="amber" /><StatCard label="Peran terdaftar" value={roles.length} icon={<Database size={20} />} tone="blue" /></section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pendaftaran anggota baru</h2><p>Menyetujui akan mengaktifkan akun dan mengkreditkan Simpanan Pokok otomatis.</p></div><span className="record-count">{pendingPendaftaran.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Calon anggota</th><th>NIK</th><th>Email</th><th>Daftar</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pendaftaran.map((calon) => <tr key={calon.id}>
          <td><div className="user-cell"><span className="avatar">{calon.namaLengkap.charAt(0).toUpperCase()}</span><strong>{calon.namaLengkap}</strong></div></td>
          <td className="mono">{calon.nomorIndukKaryawan}</td>
          <td>{calon.email ?? '—'}</td>
          <td>{tanggal(calon.dibuatPada)}</td>
          <td><span className={`status-pill ${calon.statusKeanggotaan === 'Ditolak' ? 'inactive' : ''}`}><i />{calon.statusKeanggotaan === 'MenungguPersetujuan' ? 'Menunggu' : 'Ditolak'}</span></td>
          <td className="align-right">{calon.statusKeanggotaan === 'MenungguPersetujuan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === calon.id} onClick={() => void decidePendaftaran(calon, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === calon.id} onClick={() => void decidePendaftaran(calon, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>—</small>}</td>
        </tr>)}
      </tbody></table>{!loading && pendaftaran.length === 0 && <div className="empty-state">Tidak ada pendaftaran anggota baru.</div>}</div>
    </section>

    <section className="table-panel" id="user-table"><div className="panel-heading"><div><h2>Daftar pengguna</h2><p>Aktifkan atau nonaktifkan akses login anggota.</p></div><span className="record-count">{filteredUsers.length} data</span></div><div className="filters"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIK, atau email" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">Semua peran</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>Pengguna</th><th>NIK</th><th>Peran</th><th>Status</th><th>Dibuat</th><th className="align-right">Aksi</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar">{user.namaLengkap.charAt(0).toUpperCase()}</span><div><strong>{user.namaLengkap}</strong><small>{user.email ?? 'Email belum diisi'}</small></div></div></td><td className="mono">{user.nomorIndukKaryawan}</td><td><span className={`role-pill ${user.peran.toLowerCase()}`}>{user.peran}</span></td><td><span className={`status-pill ${user.aktif ? 'active' : 'inactive'}`}><i />{user.aktif ? 'Aktif' : 'Nonaktif'}</span></td><td>{tanggal(user.dibuatPada)}</td><td className="align-right"><button className={`toggle-button ${user.aktif ? 'deactivate' : 'activate'}`} onClick={() => void toggleUser(user)}>{user.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></td></tr>)}</tbody></table>{!loading && filteredUsers.length === 0 && <div className="empty-state">Tidak ada pengguna yang cocok dengan filter.</div>}</div></section>
  </div>
}

function LoansView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string>('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [pengajuanResponse, pinjamanResponse, pembayaranResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/pinjaman/pengajuan`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/pinjaman`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/pinjaman/pembayaran`, { headers: authHeaders }),
      ])
      if ([pengajuanResponse, pinjamanResponse, pembayaranResponse].some((r) => r.status === 401)) { onExpired(); return }
      if (!pengajuanResponse.ok || !pinjamanResponse.ok || !pembayaranResponse.ok) throw new Error(pengajuanResponse.status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat data pinjaman.')
      setApplications(await pengajuanResponse.json())
      setLoans(await pinjamanResponse.json())
      setPayments(await pembayaranResponse.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [authHeaders, onExpired])
  useEffect(() => { void load() }, [load])

  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200) }

  const decide = async (application: LoanApplication, setuju: boolean) => {
    if (!window.confirm(`${setuju ? 'Setujui' : 'Tolak'} pengajuan ${application.nomorPengajuan} atas nama ${application.namaAnggota}?`)) return
    let catatan: string | null = null
    if (!setuju) { catatan = window.prompt('Alasan penolakan (opsional):') }
    setBusyId(`app-${application.id}`); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pinjaman/pengajuan/${application.id}/putusan`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ setuju, catatan }) })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'Gagal memproses keputusan.')
      flash(setuju ? `Pengajuan ${application.nomorPengajuan} disetujui, pinjaman & jadwal angsuran dibuat.` : `Pengajuan ${application.nomorPengajuan} ditolak.`)
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memproses keputusan.') }
    finally { setBusyId('') }
  }

  const decidePayment = async (payment: PaymentRequest, setuju: boolean) => {
    const label = payment.jenis === 'Pelunasan' ? 'pelunasan dipercepat' : 'pembayaran angsuran'
    const detail = payment.jenis === 'Pelunasan'
      ? `Anggota membayar sisa pokok ${rupiah(payment.jumlahDiajukan)}. Jasa ${rupiah(payment.jasaDibebaskan ?? 0)} dibebaskan. Pinjaman menjadi lunas.`
      : `Mencatat 1 angsuran ${rupiah(payment.jumlahDiajukan)} untuk ${payment.nomorPinjaman}.`
    if (!window.confirm(`${setuju ? 'Setujui' : 'Tolak'} ${label} dari ${payment.namaAnggota}?\n\n${setuju ? detail : ''}`)) return
    let catatan: string | null = null
    if (!setuju) catatan = window.prompt('Alasan penolakan (opsional):')
    setBusyId(`pay-${payment.id}`); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pinjaman/pembayaran/${payment.id}/putusan`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ setuju, catatan }) })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'Gagal memproses pengajuan pembayaran.')
      flash(setuju ? `${label[0].toUpperCase()}${label.slice(1)} ${payment.nomorPinjaman} disetujui.` : `Pengajuan ${payment.nomorPinjaman} ditolak.`)
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memproses pengajuan pembayaran.') }
    finally { setBusyId('') }
  }

  const pending = applications.filter((item) => item.status === 'Diajukan')
  const pendingPayments = payments.filter((item) => item.status === 'Diajukan')
  const activeLoans = loans.filter((item) => item.status === 'Aktif')
  const totalSisaPokok = activeLoans.reduce((sum, item) => sum + item.sisaPokok, 0)

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Persetujuan pinjaman & pembayaran</h2><p>Anggota mengajukan pinjaman, pembayaran angsuran, dan pelunasan dipercepat dari aplikasi — pengurus menyetujui di sini.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Pengajuan pinjaman" value={pending.length} icon={<HandCoins size={20} />} tone="amber" />
      <StatCard label="Pengajuan pembayaran" value={pendingPayments.length} icon={<Zap size={20} />} tone="amber" />
      <StatCard label="Pinjaman aktif" value={activeLoans.length} icon={<Wallet size={20} />} tone="teal" />
      <StatCard label="Total sisa pokok" value={totalSisaPokok} icon={<Banknote size={20} />} tone="blue" money />
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pengajuan pinjaman</h2><p>Menyetujui akan otomatis membuat pinjaman aktif beserta jadwal angsuran pokok + jasa.</p></div><span className="record-count">{pending.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Nominal</th><th>Tenor</th><th>Jasa/th</th><th>Cicilan/bln</th><th>Total jasa</th><th>Tujuan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {applications.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{rupiah(item.nominal)}</td>
          <td>{item.tenorBulan} bln</td>
          <td>{(item.bungaTahunan * 100).toFixed(2)}%</td>
          <td>{rupiah(item.estimasiCicilanBulanan)}</td>
          <td>{rupiah(item.estimasiTotalJasa)}</td>
          <td style={{ whiteSpace: 'normal', maxWidth: 220 }}>{item.tujuan}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `app-${item.id}`} onClick={() => void decide(item, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `app-${item.id}`} onClick={() => void decide(item, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diputuskanPada ? tanggal(item.diputuskanPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && applications.length === 0 && <div className="empty-state">Belum ada pengajuan pinjaman.</div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pengajuan pembayaran</h2><p>Menyetujui pembayaran angsuran menandai 1 angsuran lunas; menyetujui pelunasan dipercepat menagih sisa pokok saja dan membebaskan jasa.</p></div><span className="record-count">{pendingPayments.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Pinjaman</th><th>Jenis</th><th>Jumlah diajukan</th><th>Jasa dibebaskan</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {payments.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td className="mono">{item.nomorPinjaman}</td>
          <td>{item.jenis === 'Pelunasan' ? <span className="role-pill admin"><Zap size={11} /> Pelunasan</span> : <span className="role-pill">Angsuran {item.angsuranKe ? `ke-${item.angsuranKe}` : ''}</span>}</td>
          <td>{rupiah(item.jumlahDiajukan)}</td>
          <td>{item.jenis === 'Pelunasan' ? rupiah(item.jasaDibebaskan ?? 0) : '—'}</td>
          <td>{tanggal(item.diajukanPada)}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `pay-${item.id}`} onClick={() => void decidePayment(item, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `pay-${item.id}`} onClick={() => void decidePayment(item, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diputuskanPada ? tanggal(item.diputuskanPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && payments.length === 0 && <div className="empty-state">Belum ada pengajuan pembayaran dari anggota.</div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Pinjaman aktif & lunas</h2><p>Pantau progres angsuran. Pembayaran diproses lewat panel "Pengajuan pembayaran" di atas.</p></div><span className="record-count">{loans.length} pinjaman</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Nomor</th><th>Pokok</th><th>Cicilan/bln</th><th>Progres</th><th>Sisa pokok</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {loans.map((loan) => [
          <tr key={loan.id}>
            <td><div className="user-cell"><span className="avatar">{loan.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{loan.namaAnggota}</strong><small className="mono">{loan.nomorIndukKaryawan}</small></div></div></td>
            <td className="mono">{loan.nomorPinjaman}</td>
            <td>{rupiah(loan.pokok)}</td>
            <td>{rupiah(loan.angsuranPerBulan)}<br /><small style={{ color: 'var(--muted)' }}>pokok {rupiah(loan.pokokPerBulan)} + jasa {rupiah(loan.jasaPerBulan)}</small></td>
            <td>{loan.angsuranTerbayar}/{loan.tenorBulan}</td>
            <td>{rupiah(loan.sisaPokok)}</td>
            <td><span className={`status-pill ${loan.status === 'Aktif' ? 'active' : 'inactive'}`}><i />{loan.status}</span></td>
            <td className="align-right">
              <button className="toggle-button" onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}>{expanded === loan.id ? 'Tutup' : 'Detail'}</button>
            </td>
          </tr>,
          expanded === loan.id && <tr key={`${loan.id}-detail`}><td colSpan={8} style={{ background: '#f7faf9' }}>
            <div style={{ padding: '6px 0 10px' }}>
              {loan.status === 'Aktif' && <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--teal-dark)' }}>
                <strong>Pelunasan dipercepat sekarang:</strong> anggota cukup bayar sisa pokok {rupiah(loan.nilaiPelunasanDipercepat)} — jasa {rupiah(loan.jasaDibebaskan)} dibebaskan.
              </p>}
              <table style={{ minWidth: 620 }}><thead><tr><th>#</th><th>Jatuh tempo</th><th>Pokok</th><th>Jasa</th><th>Total</th><th>Status</th><th>Dibayar</th></tr></thead><tbody>
                {loan.angsuran.map((row) => <tr key={row.angsuranKe}>
                  <td>{row.jenis === 'Pelunasan' ? '⚡ Pelunasan' : row.angsuranKe}</td>
                  <td>{tanggal(row.jatuhTempo)}</td>
                  <td>{rupiah(row.pokok)}</td>
                  <td>{row.jasa === 0 ? '—' : rupiah(row.jasa)}</td>
                  <td>{rupiah(row.total)}</td>
                  <td style={{ color: row.status === 'Dibayar' ? '#2d8155' : row.status === 'Dibatalkan' ? 'var(--muted)' : '#ad6a16' }}>{row.status}</td>
                  <td>{row.dibayarPada ? tanggal(row.dibayarPada) : '—'}</td>
                </tr>)}
              </tbody></table>
            </div>
          </td></tr>,
        ])}
      </tbody></table>{!loading && loans.length === 0 && <div className="empty-state">Belum ada pinjaman aktif.</div>}</div>
    </section>
  </div>
}

function SavingsView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [konfigurasi, setKonfigurasi] = useState<Konfigurasi | null>(null)
  const [wajib, setWajib] = useState<TagihanWajib[]>([])
  const [sukarela, setSukarela] = useState<TransaksiSukarela[]>([])
  const [berjangka, setBerjangka] = useState<SimpananBerjangka[]>([])
  const [produk, setProduk] = useState<ProdukBerjangka[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pokokInput, setPokokInput] = useState('')
  const [wajibInput, setWajibInput] = useState('')
  const [bungaSukarelaInput, setBungaSukarelaInput] = useState('')
  const [bungaDepositoInput, setBungaDepositoInput] = useState('')
  const [produkNama, setProdukNama] = useState('')
  const [produkNominal, setProdukNominal] = useState('')
  const [produkTenor, setProdukTenor] = useState('12')

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200) }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE}/api/admin/konfigurasi`, { headers }),
        fetch(`${API_BASE}/api/admin/simpanan/wajib`, { headers }),
        fetch(`${API_BASE}/api/admin/simpanan/sukarela`, { headers }),
        fetch(`${API_BASE}/api/admin/simpanan/berjangka`, { headers }),
        fetch(`${API_BASE}/api/admin/simpanan/berjangka/produk`, { headers }),
      ])
      if (responses.some((r) => r.status === 401)) { onExpired(); return }
      if (responses.some((r) => !r.ok)) throw new Error(responses[0].status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat data simpanan.')
      const [k, w, s, b, p] = await Promise.all(responses.map((r) => r.json()))
      setKonfigurasi(k); setPokokInput(String(k.simpananPokokNominal)); setWajibInput(String(k.simpananWajibNominal))
      setBungaSukarelaInput((k.bungaSukarelaTahunan * 100).toString()); setBungaDepositoInput((k.bungaDepositoTahunan * 100).toString())
      setWajib(w); setSukarela(s); setBerjangka(b); setProduk(p)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [headers, onExpired])
  useEffect(() => { void load() }, [load])

  const call = async (key: string, url: string, method: string, body?: unknown, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(key); setError('')
    try {
      const response = await fetch(`${API_BASE}${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Permintaan gagal.')
      flash(data.message ?? 'Berhasil.')
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Permintaan gagal.') }
    finally { setBusyId('') }
  }

  const putusan = (key: string, url: string, setuju: boolean, label: string) => {
    let catatan: string | null = null
    if (!setuju) catatan = window.prompt(`Alasan menolak ${label} (opsional):`)
    else if (!window.confirm(`Setujui ${label}?`)) return
    void call(key, url, 'POST', { setuju, catatan })
  }

  const saveKonfigurasi = () => void call('konfig', '/api/admin/konfigurasi', 'PUT', {
    simpananPokokNominal: Number(pokokInput) || 0,
    simpananWajibNominal: Number(wajibInput) || 0,
    bungaSukarelaTahunan: (Number(bungaSukarelaInput) || 0) / 100,
    bungaDepositoTahunan: (Number(bungaDepositoInput) || 0) / 100,
  })
  const createProduk = () => {
    if (!produkNama.trim() || !(Number(produkNominal) > 0) || !(Number(produkTenor) > 0)) { setError('Nama, nominal, dan tenor produk wajib diisi.'); return }
    void call('produk-baru', '/api/admin/simpanan/berjangka/produk', 'POST', { nama: produkNama.trim(), nominal: Number(produkNominal), tenorBulan: Number(produkTenor) })
      .then(() => { setProdukNama(''); setProdukNominal('') })
  }

  const wajibMenunggu = wajib.filter((item) => item.status === 'Ditagih').length
  const sukarelaMenunggu = sukarela.filter((item) => item.status === 'Diajukan').length
  const berjangkaMenunggu = berjangka.filter((item) => item.status === 'Diajukan').length
  const pencairanMenunggu = berjangka.filter((item) => item.status === 'Aktif' && item.pencairanDiajukan).length
  const berjangkaJatuhTempo = berjangka.filter((item) => item.status === 'JatuhTempo').length

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Simpanan anggota</h2><p>Konfigurasi nominal, tagih Simpanan Wajib otomatis, dan setujui setoran / penarikan / berjangka.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Tagihan wajib menunggu" value={wajibMenunggu} icon={<Wallet size={20} />} tone="amber" />
      <StatCard label="Pengajuan sukarela" value={sukarelaMenunggu} icon={<Banknote size={20} />} tone="amber" />
      <StatCard label="Pengajuan berjangka" value={berjangkaMenunggu} icon={<PiggyBank size={20} />} tone="amber" />
      <StatCard label="Berjangka perlu dicairkan" value={berjangkaJatuhTempo + pencairanMenunggu} icon={<BadgeCheck size={20} />} tone="blue" />
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Konfigurasi simpanan</h2><p>Nominal Simpanan Pokok (saldo awal keanggotaan) dan Simpanan Wajib (tagihan bulanan tanggal {konfigurasi?.tanggalTagihWajib ?? 25}).</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '18px 25px 24px' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Simpanan Pokok
          <input type="number" value={pokokInput} onChange={(e) => setPokokInput(e.target.value)} style={{ height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Simpanan Wajib / bulan
          <input type="number" value={wajibInput} onChange={(e) => setWajibInput(e.target.value)} style={{ height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Bunga Sukarela (%/th)
          <input type="number" step="0.1" value={bungaSukarelaInput} onChange={(e) => setBungaSukarelaInput(e.target.value)} style={{ width: 130, height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Bunga Deposito (%/th)
          <input type="number" step="0.1" value={bungaDepositoInput} onChange={(e) => setBungaDepositoInput(e.target.value)} style={{ width: 130, height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <button className="submit-button" style={{ alignSelf: 'end', height: 40, padding: '0 18px' }} disabled={busyId === 'konfig'} onClick={saveKonfigurasi}>Simpan</button>
      </div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading">
        <div><h2>Simpanan Wajib</h2><p>Tagihan dibuat otomatis tiap tanggal {konfigurasi?.tanggalTagihWajib ?? 25}. Approve = kreditkan ke saldo wajib anggota.</p></div>
        <button className="toggle-button activate" disabled={busyId === 'gen'} onClick={() => void call('gen', '/api/admin/simpanan/wajib/generate', 'POST', {})}>Buat tagihan bulan ini</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Periode</th><th>Nominal</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {wajib.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{item.periode}</td>
          <td>{rupiah(item.nominal)}</td>
          <td>{tanggal(item.jatuhTempo)}</td>
          <td><span className={`status-pill ${item.status === 'Dibayar' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Ditagih'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `w-${item.id}`} onClick={() => putusan(`w-${item.id}`, `/api/admin/simpanan/wajib/${item.id}/putusan`, true, `tagihan wajib ${item.namaAnggota} ${item.periode}`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `w-${item.id}`} onClick={() => putusan(`w-${item.id}`, `/api/admin/simpanan/wajib/${item.id}/putusan`, false, `tagihan wajib ${item.namaAnggota} ${item.periode}`)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diprosesPada ? tanggal(item.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && wajib.length === 0 && <div className="empty-state">Belum ada tagihan wajib. Klik "Buat tagihan bulan ini".</div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading">
        <div><h2>Simpanan Sukarela</h2><p>Setoran menambah saldo; penarikan mengurangi saldo. Bunga {konfigurasi ? (konfigurasi.bungaSukarelaTahunan * 100).toFixed(2) : '2.50'}%/th metode saldo harian.</p></div>
        <button className="toggle-button activate" disabled={busyId === 'bunga'} onClick={() => void call('bunga', '/api/admin/simpanan/sukarela/bunga', 'POST', {}, 'Hitung & kreditkan bunga sukarela bulan lalu ke semua rekening?')}>Hitung bunga bulan lalu</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Jenis</th><th>Nominal</th><th>Saldo saat ini</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {sukarela.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td><span className={`role-pill ${item.jenis === 'Tarik' ? 'admin' : ''}`}>{item.jenis}</span></td>
          <td>{rupiah(item.nominal)}</td>
          <td>{rupiah(item.saldoSukarela)}</td>
          <td>{tanggal(item.diajukanPada)}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `s-${item.id}`} onClick={() => putusan(`s-${item.id}`, `/api/admin/simpanan/sukarela/${item.id}/putusan`, true, `${item.jenis.toLowerCase()} sukarela ${item.namaAnggota} ${rupiah(item.nominal)}`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `s-${item.id}`} onClick={() => putusan(`s-${item.id}`, `/api/admin/simpanan/sukarela/${item.id}/putusan`, false, `${item.jenis.toLowerCase()} sukarela ${item.namaAnggota}`)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diprosesPada ? tanggal(item.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && sukarela.length === 0 && <div className="empty-state">Belum ada pengajuan simpanan sukarela.</div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Paket Simpanan Berjangka</h2><p>Anggota hanya bisa memilih paket yang aktif di sini.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Nama paket
          <input value={produkNama} onChange={(e) => setProdukNama(e.target.value)} placeholder="Berjangka 10 Juta" style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Nominal
          <input type="number" value={produkNominal} onChange={(e) => setProdukNominal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tenor (bulan)
          <input type="number" value={produkTenor} onChange={(e) => setProdukTenor(e.target.value)} style={{ width: 110, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 16px' }} disabled={busyId === 'produk-baru'} onClick={createProduk}>Tambah paket</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Nama</th><th>Nominal</th><th>Tenor</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {produk.map((item) => <tr key={item.id}>
          <td><strong>{item.nama}</strong></td>
          <td>{rupiah(item.nominal)}</td>
          <td>{item.tenorBulan} bln</td>
          <td><span className={`status-pill ${item.aktif ? 'active' : 'inactive'}`}><i />{item.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
          <td className="align-right"><button className={`toggle-button ${item.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `p-${item.id}`} onClick={() => void call(`p-${item.id}`, `/api/admin/simpanan/berjangka/produk/${item.id}`, 'PATCH', { aktif: !item.aktif })}>{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
        </tr>)}
      </tbody></table>{!loading && produk.length === 0 && <div className="empty-state">Belum ada paket berjangka.</div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Pengajuan Simpanan Berjangka</h2><p>Setujui untuk mengunci dana; cairkan saat jatuh tempo. Pencairan dipercepat (diajukan anggota) → hanya pokok, bunga hangus.</p></div><span className="record-count">{berjangkaMenunggu} menunggu · {pencairanMenunggu} minta cair</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Paket</th><th>Nominal</th><th>Tenor</th><th>Est. bunga</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {berjangka.map((item) => <tr key={item.id} style={item.pencairanDiajukan ? { background: '#fff7ed' } : undefined}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{item.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{item.nomorSertifikat}</small></td>
          <td>{rupiah(item.nominal)}</td>
          <td>{item.tenorBulan} bln</td>
          <td>{rupiah(item.estimasiBunga)}</td>
          <td>{item.tanggalJatuhTempo ? tanggal(item.tanggalJatuhTempo) : '—'}</td>
          <td>
            <span className={`status-pill ${item.status === 'Aktif' || item.status === 'Dicairkan' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span>
            {item.pencairanDiajukan && <><br /><small style={{ color: '#bd6d1d', fontWeight: 700 }}>Minta cair dipercepat</small>{item.alasanPencairan && <><br /><small style={{ color: 'var(--muted)' }}>{item.alasanPencairan}</small></>}</>}
          </td>
          <td className="align-right">
            {item.status === 'Diajukan' && <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, true, `berjangka ${item.namaAnggota} ${rupiah(item.nominal)}`)}>Setujui</button>
              <button className="toggle-button deactivate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, false, `berjangka ${item.namaAnggota}`)}>Tolak</button>
            </span>}
            {item.status === 'JatuhTempo' && <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan`, 'POST', undefined, `Cairkan (jatuh tempo) ${item.namaAnggota} ${rupiah(item.nominal)} + bunga ${rupiah(item.estimasiBunga)}?`)}>Cairkan</button>}
            {item.status === 'Aktif' && item.pencairanDiajukan && <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan`, 'POST', undefined, `Setujui pencairan DIPERCEPAT ${item.namaAnggota}?\n\nAnggota hanya menerima pokok ${rupiah(item.nominal)}. Bunga ${rupiah(item.estimasiBunga)} HANGUS.`)}>Setujui cair</button>
              <button className="toggle-button deactivate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan/tolak`, 'POST', undefined, `Tolak pengajuan pencairan dipercepat ${item.namaAnggota}? Simpanan tetap aktif.`)}>Tolak cair</button>
            </span>}
            {item.status === 'Aktif' && !item.pencairanDiajukan && <small style={{ color: 'var(--muted)' }}>Terkunci</small>}
            {(item.status === 'Ditolak' || item.status === 'Dicairkan') && <small style={{ color: 'var(--muted)' }}>—</small>}
          </td>
        </tr>)}
      </tbody></table>{!loading && berjangka.length === 0 && <div className="empty-state">Belum ada pengajuan simpanan berjangka.</div>}</div>
    </section>
  </div>
}

function CatalogView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [produk, setProduk] = useState<Produk[]>([])
  const [pembelian, setPembelian] = useState<PembelianProduk[]>([])
  const [tagihan, setTagihan] = useState<TagihanKredit[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ nama: '', deskripsi: '', jenis: 'Jual', harga: '', stok: '0', satuan: 'pcs' })
  const [rekapAnggota, setRekapAnggota] = useState('semua')
  const [rekapExpanded, setRekapExpanded] = useState<number | null>(null)

  const jsonHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }
  const resetForm = () => { setEditId(null); setForm({ nama: '', deskripsi: '', jenis: 'Jual', harga: '', stok: '0', satuan: 'pcs' }) }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE}/api/admin/produk`, { headers: jsonHeaders }),
        fetch(`${API_BASE}/api/admin/produk/pembelian`, { headers: jsonHeaders }),
        fetch(`${API_BASE}/api/admin/produk/tagihan-kredit`, { headers: jsonHeaders }),
      ])
      if (responses.some((r) => r.status === 401)) { onExpired(); return }
      if (responses.some((r) => !r.ok)) throw new Error(responses[0].status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat katalog.')
      const [pr, pb, tg] = await Promise.all(responses.map((r) => r.json()))
      setProduk(pr); setPembelian(pb); setTagihan(tg)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [jsonHeaders, onExpired])
  useEffect(() => { void load() }, [load])

  const call = async (key: string, url: string, method: string, body?: unknown, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(key); setError('')
    try {
      const response = await fetch(`${API_BASE}${url}`, { method, headers: jsonHeaders, body: body === undefined ? undefined : JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Permintaan gagal.')
      flash(data.message ?? 'Berhasil.')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Permintaan gagal.') }
    finally { setBusyId('') }
  }

  const saveProduk = () => {
    if (!form.nama.trim() || !(Number(form.harga) > 0) || !form.satuan.trim()) { setError('Nama, harga, dan satuan wajib diisi.'); return }
    const body = { nama: form.nama.trim(), deskripsi: form.deskripsi.trim() || null, jenis: form.jenis, harga: Number(form.harga), stok: Number(form.stok) || 0, satuan: form.satuan.trim() }
    void call('save-produk', editId ? `/api/admin/produk/${editId}` : '/api/admin/produk', editId ? 'PUT' : 'POST', body).then(resetForm)
  }
  const editProduk = (p: Produk) => {
    setEditId(p.id)
    setForm({ nama: p.nama, deskripsi: p.deskripsi ?? '', jenis: p.jenis, harga: String(p.harga), stok: String(p.stok), satuan: p.satuan })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const uploadFoto = async (id: number, file: File) => {
    setBusyId(`foto-${id}`); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/produk/${id}/foto`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengunggah foto.')
      flash('Foto produk diperbarui.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal mengunggah foto.') }
    finally { setBusyId('') }
  }
  const putusanPengajuan = (p: Produk, setuju: boolean) => {
    let catatan: string | null = null
    let harga: number | undefined
    if (setuju) {
      const input = window.prompt(`Setujui "${p.nama}". Harga jual (kosong = ${rupiah(p.harga)}):`, String(p.harga))
      if (input === null) return
      if (input.trim()) harga = Number(input)
    } else {
      catatan = window.prompt('Alasan penolakan (opsional):')
    }
    void call(`pg-${p.id}`, `/api/admin/produk/pengajuan/${p.id}/putusan`, 'POST', { setuju, catatan, harga })
  }

  const produkKoperasi = produk.filter((p) => p.status === 'Disetujui')
  const pengajuanTitipan = produk.filter((p) => p.status === 'MenungguPersetujuan')
  const pembelianMenunggu = pembelian.filter((p) => p.status === 'Diajukan')
  const tagihanBelum = tagihan.filter((t) => t.status !== 'Lunas')
  const rekap = useMemo(() => {
    const map = new Map<number, { penggunaId: number; nama: string; nik: string; rincian: TagihanKredit[]; totalBelum: number; totalDikirim: number; totalLunas: number }>()
    for (const t of tagihan) {
      const g = map.get(t.penggunaId) ?? { penggunaId: t.penggunaId, nama: t.namaAnggota, nik: t.nomorIndukKaryawan, rincian: [], totalBelum: 0, totalDikirim: 0, totalLunas: 0 }
      g.rincian.push(t)
      if (t.status === 'Belum') g.totalBelum += t.total
      else if (t.status === 'DikirimKeSDM') g.totalDikirim += t.total
      else g.totalLunas += t.total
      map.set(t.penggunaId, g)
    }
    return [...map.values()].sort((a, b) => (b.totalBelum + b.totalDikirim) - (a.totalBelum + a.totalDikirim))
  }, [tagihan])
  const rekapTampil = rekapAnggota === 'semua' ? rekap : rekap.filter((g) => String(g.penggunaId) === rekapAnggota)
  const totalOutstanding = rekapTampil.reduce((s, g) => s + g.totalBelum + g.totalDikirim, 0)

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Katalog produk koperasi</h2><p>Input produk jual/sewa, setujui titipan anggota, proses pembelian & tagihan kredit.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Produk aktif" value={produkKoperasi.filter((p) => p.aktif).length} icon={<Store size={20} />} tone="teal" />
      <StatCard label="Titipan menunggu" value={pengajuanTitipan.length} icon={<UserPlus size={20} />} tone="amber" />
      <StatCard label="Pembelian menunggu" value={pembelianMenunggu.length} icon={<HandCoins size={20} />} tone="amber" />
      <StatCard label="Tagihan kredit aktif" value={tagihanBelum.length} icon={<Banknote size={20} />} tone="blue" />
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>{editId ? 'Edit produk' : 'Tambah produk koperasi'}</h2><p>Produk koperasi langsung tampil di katalog anggota.</p></div>{editId && <button className="toggle-button" onClick={resetForm}>Batal edit</button>}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end' }}>
        {([['nama', 'Nama', 200], ['harga', 'Harga', 130], ['stok', 'Stok', 90], ['satuan', 'Satuan', 100]] as const).map(([key, label, w]) => (
          <label key={key} style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>{label}
            <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: w, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
          </label>
        ))}
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Jenis
          <select value={form.jenis} onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))} style={{ height: 38, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 8 }}>
            <option value="Jual">Jual</option><option value="Sewa">Sewa</option>
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 200 }}>Deskripsi
          <input value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={busyId === 'save-produk'} onClick={saveProduk}>{editId ? 'Simpan' : 'Tambah'}</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Produk</th><th>Jenis</th><th>Harga</th><th>Stok</th><th>Sumber</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {produkKoperasi.map((p) => <tr key={p.id}>
          <td><div className="user-cell">
            {p.fotoUrl
              ? <img src={`${API_BASE}${p.fotoUrl}`} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
              : <span className="avatar">{p.nama.charAt(0).toUpperCase()}</span>}
            <div><strong>{p.nama}</strong><small>{p.deskripsi ?? p.kode}</small></div>
          </div></td>
          <td>{p.jenis}</td>
          <td>{rupiah(p.harga)}/{p.satuan}</td>
          <td>{p.jenis === 'Sewa' ? '—' : p.stok}</td>
          <td>{p.sumber === 'Koperasi' ? 'Koperasi' : `Titipan ${p.diajukanOleh ?? ''}`}</td>
          <td><span className={`status-pill ${p.aktif ? 'active' : 'inactive'}`}><i />{p.aktif ? 'Tampil' : 'Disembunyikan'}</span></td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <label className="toggle-button" style={{ cursor: 'pointer' }}>
              {busyId === `foto-${p.id}` ? '...' : 'Foto'}
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFoto(p.id, f); e.target.value = '' }} />
            </label>
            <button className="toggle-button" onClick={() => editProduk(p)}>Edit</button>
            <button className={`toggle-button ${p.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `t-${p.id}`} onClick={() => void call(`t-${p.id}`, `/api/admin/produk/${p.id}/status`, 'PATCH', { aktif: !p.aktif })}>{p.aktif ? 'Sembunyikan' : 'Tampilkan'}</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && produkKoperasi.length === 0 && <div className="empty-state">Belum ada produk.</div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pengajuan titipan anggota</h2><p>Menyetujui = barang menjadi milik koperasi dan tampil di katalog.</p></div><span className="record-count">{pengajuanTitipan.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Produk</th><th>Anggota</th><th>Jenis</th><th>Harga usulan</th><th>Stok</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pengajuanTitipan.map((p) => <tr key={p.id}>
          <td><div className="user-cell">
            {p.fotoUrl ? <img src={`${API_BASE}${p.fotoUrl}`} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} /> : <span className="avatar">{p.nama.charAt(0).toUpperCase()}</span>}
            <div><strong>{p.nama}</strong><small>{p.deskripsi ?? '—'}</small></div>
          </div></td>
          <td>{p.diajukanOleh ?? '—'}</td>
          <td>{p.jenis}</td>
          <td>{rupiah(p.harga)}/{p.satuan}</td>
          <td>{p.stok}</td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <button className="toggle-button activate" disabled={busyId === `pg-${p.id}`} onClick={() => putusanPengajuan(p, true)}>Setujui</button>
            <button className="toggle-button deactivate" disabled={busyId === `pg-${p.id}`} onClick={() => putusanPengajuan(p, false)}>Tolak</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && pengajuanTitipan.length === 0 && <div className="empty-state">Tidak ada pengajuan titipan.</div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pembelian & penyewaan anggota</h2><p>Tunai → langsung selesai. Kredit → membuat tagihan hutang.</p></div><span className="record-count">{pembelianMenunggu.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Produk</th><th>Jenis</th><th>Jumlah</th><th>Total</th><th>Metode</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pembelian.map((p) => <tr key={p.id}>
          <td><div className="user-cell"><span className="avatar">{p.namaPembeli.charAt(0).toUpperCase()}</span><div><strong>{p.namaPembeli}</strong><small className="mono">{p.nomorIndukKaryawan}</small></div></div></td>
          <td>{p.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{p.nomorTransaksi}</small></td>
          <td>{p.jenis}</td>
          <td>{p.jumlah}</td>
          <td>{rupiah(p.total)}</td>
          <td><span className={`role-pill ${p.metodePembayaran === 'Kredit' ? 'admin' : ''}`}>{p.metodePembayaran}</span></td>
          <td><span className={`status-pill ${p.status === 'Selesai' || p.status === 'Disetujui' ? 'active' : p.status === 'Ditolak' ? 'inactive' : ''}`}><i />{p.status}</span></td>
          <td className="align-right">{p.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `pb-${p.id}`} onClick={() => void call(`pb-${p.id}`, `/api/admin/produk/pembelian/${p.id}/putusan`, 'POST', { setuju: true }, `Setujui ${p.jenis.toLowerCase()} ${p.produkNama} (${rupiah(p.total)}, ${p.metodePembayaran}) oleh ${p.namaPembeli}?`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `pb-${p.id}`} onClick={() => { const c = window.prompt('Alasan penolakan (opsional):'); void call(`pb-${p.id}`, `/api/admin/produk/pembelian/${p.id}/putusan`, 'POST', { setuju: false, catatan: c }) }}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{p.diprosesPada ? tanggal(p.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && pembelian.length === 0 && <div className="empty-state">Belum ada transaksi.</div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Rekap tagihan kredit</h2><p>Rekap hutang kredit produk per anggota untuk dikirim ke SDM (potong gaji). Total outstanding ditampilkan: <strong>{rupiah(totalOutstanding)}</strong>.</p></div>
        <select value={rekapAnggota} onChange={(e) => setRekapAnggota(e.target.value)} style={{ height: 36, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }}>
          <option value="semua">Semua anggota</option>
          {rekap.map((g) => <option key={g.penggunaId} value={String(g.penggunaId)}>{g.nama}</option>)}
        </select>
      </div>
      {rekapAnggota === 'semua' && rekap.some((g) => g.totalBelum > 0) && (
        <div style={{ padding: '12px 25px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 8 }}>
          <button className="toggle-button activate" disabled={busyId === 'rekap-kirim'} onClick={() => void call('rekap-kirim', '/api/admin/produk/tagihan-kredit/kirim', 'POST', {}, 'Tandai SEMUA tagihan "Belum" dikirim ke SDM?')}>Kirim semua ke SDM</button>
          <button className="toggle-button activate" disabled={busyId === 'rekap-lunas'} onClick={() => void call('rekap-lunas', '/api/admin/produk/tagihan-kredit/lunas', 'POST', {}, 'Tandai SEMUA tagihan belum lunas menjadi LUNAS?')}>Tandai semua lunas</button>
        </div>
      )}
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Belum ditagih</th><th>Dikirim ke SDM</th><th>Lunas</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {rekapTampil.flatMap((g) => [
          <tr key={g.penggunaId}>
            <td><div className="user-cell"><span className="avatar">{g.nama.charAt(0).toUpperCase()}</span><div><strong>{g.nama}</strong><small className="mono">{g.nik}</small></div></div></td>
            <td style={{ color: g.totalBelum > 0 ? '#bd6d1d' : 'var(--muted)', fontWeight: g.totalBelum > 0 ? 700 : 400 }}>{rupiah(g.totalBelum)}</td>
            <td>{rupiah(g.totalDikirim)}</td>
            <td style={{ color: 'var(--muted)' }}>{rupiah(g.totalLunas)}</td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button" onClick={() => setRekapExpanded(rekapExpanded === g.penggunaId ? null : g.penggunaId)}>{rekapExpanded === g.penggunaId ? 'Tutup' : 'Rincian'}</button>
              {g.totalBelum > 0 && <button className="toggle-button activate" disabled={busyId === `rk-${g.penggunaId}`} onClick={() => void call(`rk-${g.penggunaId}`, '/api/admin/produk/tagihan-kredit/kirim', 'POST', { penggunaId: g.penggunaId }, `Tandai tagihan "Belum" milik ${g.nama} (${rupiah(g.totalBelum)}) dikirim ke SDM?`)}>Kirim ke SDM</button>}
              {(g.totalBelum > 0 || g.totalDikirim > 0) && <button className="toggle-button activate" disabled={busyId === `rk-${g.penggunaId}`} onClick={() => void call(`rk-${g.penggunaId}`, '/api/admin/produk/tagihan-kredit/lunas', 'POST', { penggunaId: g.penggunaId }, `Tandai semua tagihan ${g.nama} (${rupiah(g.totalBelum + g.totalDikirim)}) LUNAS?`)}>Tandai lunas</button>}
            </span></td>
          </tr>,
          rekapExpanded === g.penggunaId && <tr key={`${g.penggunaId}-d`}><td colSpan={5} style={{ background: '#f7faf9' }}>
            <table style={{ minWidth: 520 }}><thead><tr><th>Transaksi</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
              {g.rincian.map((t) => <tr key={t.id}>
                <td className="mono">{t.nomorTransaksi}</td><td>{t.produkNama}</td><td>{rupiah(t.total)}</td>
                <td style={{ color: t.status === 'Lunas' ? '#2d8155' : t.status === 'DikirimKeSDM' ? '#436a97' : '#bd6d1d' }}>{t.status === 'DikirimKeSDM' ? 'Dikirim ke SDM' : t.status}</td>
                <td>{tanggal(t.dibuatPada)}</td>
              </tr>)}
            </tbody></table>
          </td></tr>,
        ])}
      </tbody></table>{!loading && rekapTampil.length === 0 && <div className="empty-state">Belum ada tagihan kredit.</div>}</div>
    </section>
  </div>
}

function EratView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [agenda, setAgenda] = useState<EratAgenda[]>([])
  const [dokumen, setDokumen] = useState<RatDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [opsiText, setOpsiText] = useState('')
  const [docJudul, setDocJudul] = useState('')
  const [docTahun, setDocTahun] = useState(String(new Date().getFullYear()))
  const [docDeskripsi, setDocDeskripsi] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)

  const jsonHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE}/api/admin/erat/agenda`, { headers: jsonHeaders }),
        fetch(`${API_BASE}/api/admin/erat/laporan`, { headers: jsonHeaders }),
      ])
      if (responses.some((r) => r.status === 401)) { onExpired(); return }
      if (responses.some((r) => !r.ok)) throw new Error(responses[0].status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat data E-RAT.')
      const [ag, dc] = await Promise.all(responses.map((r) => r.json()))
      setAgenda(ag); setDokumen(dc)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [jsonHeaders, onExpired])
  useEffect(() => { void load() }, [load])

  const call = async (key: string, url: string, method: string, body?: unknown, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(key); setError('')
    try {
      const response = await fetch(`${API_BASE}${url}`, { method, headers: jsonHeaders, body: body === undefined ? undefined : JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Permintaan gagal.')
      flash(data.message ?? 'Berhasil.')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Permintaan gagal.') }
    finally { setBusyId('') }
  }

  const createAgenda = () => {
    const opsi = opsiText.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!judul.trim() || opsi.length < 2) { setError('Judul wajib dan minimal 2 pilihan (satu per baris).'); return }
    void call('new-agenda', '/api/admin/erat/agenda', 'POST', { judul: judul.trim(), deskripsi: deskripsi.trim() || null, opsi })
      .then(() => { setJudul(''); setDeskripsi(''); setOpsiText('') })
  }
  const addOpsi = (a: EratAgenda) => {
    const label = window.prompt('Label pilihan baru:')
    if (label?.trim()) void call(`op-${a.id}`, `/api/admin/erat/agenda/${a.id}/opsi`, 'POST', { label: label.trim() })
  }

  const uploadDoc = async () => {
    if (!docFile || !docJudul.trim()) { setError('Judul & file PDF wajib diisi.'); return }
    setBusyId('upload-doc'); setError('')
    try {
      const fd = new FormData()
      fd.append('file', docFile); fd.append('judul', docJudul.trim()); fd.append('tahun', docTahun); fd.append('deskripsi', docDeskripsi.trim())
      const response = await fetch(`${API_BASE}/api/admin/erat/laporan`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengunggah dokumen.')
      flash('Dokumen RAT diunggah.')
      setDocJudul(''); setDocDeskripsi(''); setDocFile(null)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal mengunggah dokumen.') }
    finally { setBusyId('') }
  }

  const aktifCount = agenda.filter((a) => a.status === 'Aktif').length

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>E-RAT & dokumen</h2><p>Buat konten voting lalu tayangkan agar muncul di aplikasi anggota. Unggah dokumen RAT — yang terbaru ditandai otomatis.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Agenda tayang" value={aktifCount} icon={<Vote size={20} />} tone="teal" />
      <StatCard label="Total agenda" value={agenda.length} icon={<Vote size={20} />} tone="blue" />
      <StatCard label="Dokumen RAT" value={dokumen.length} icon={<FileText size={20} />} tone="teal" />
      <StatCard label="Dokumen tampil" value={dokumen.filter((d) => d.aktif).length} icon={<FileText size={20} />} tone="green" />
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Buat agenda voting</h2><p>Satu pilihan per baris. Agenda dibuat sebagai draf — tayangkan untuk memunculkannya ke anggota.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'start' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 220 }}>Judul
          <input value={judul} onChange={(e) => setJudul(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 220 }}>Deskripsi
          <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 200 }}>Pilihan (satu per baris)
          <textarea value={opsiText} onChange={(e) => setOpsiText(e.target.value)} rows={3} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit' }} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px', alignSelf: 'end' }} disabled={busyId === 'new-agenda'} onClick={createAgenda}>Buat draf</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Agenda</th><th>Pilihan & suara</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {agenda.map((a) => {
          const adaSuara = a.totalSuara > 0
          return <tr key={a.id}>
            <td style={{ whiteSpace: 'normal', maxWidth: 260 }}><strong>{a.judul}</strong>{a.deskripsi && <><br /><small style={{ color: 'var(--muted)' }}>{a.deskripsi}</small></>}</td>
            <td style={{ whiteSpace: 'normal', maxWidth: 260 }}>
              {a.opsi.map((o) => <div key={o.id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0' }}>
                <span style={{ flex: 1 }}>{o.label}</span>
                <span className="mono" style={{ color: 'var(--muted)' }}>{o.jumlah}</span>
                {a.status === 'Draft' && !adaSuara && a.opsi.length > 2 && <button className="toggle-button deactivate" style={{ padding: '2px 6px' }} disabled={busyId === `op-${a.id}`} onClick={() => void call(`op-${a.id}`, `/api/admin/erat/agenda/${a.id}/opsi/${o.id}`, 'DELETE')}>×</button>}
              </div>)}
              {a.status === 'Draft' && !adaSuara && <button className="toggle-button" style={{ marginTop: 4 }} disabled={busyId === `op-${a.id}`} onClick={() => addOpsi(a)}>+ Pilihan</button>}
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--teal-dark)' }}>{a.totalSuara} suara total</div>
            </td>
            <td><span className={`status-pill ${a.status === 'Aktif' ? 'active' : a.status === 'Selesai' ? 'inactive' : ''}`}><i />{a.status === 'Aktif' ? 'Tayang' : a.status}</span></td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {a.status !== 'Aktif' && <button className="toggle-button activate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Aktif' })}>Tayangkan</button>}
              {a.status === 'Aktif' && <button className="toggle-button deactivate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Draft' }, 'Sembunyikan agenda dari anggota (kembali ke draf)?')}>Sembunyikan</button>}
              {a.status === 'Aktif' && <button className="toggle-button" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Selesai' }, 'Tutup voting? Anggota akan melihat hasil akhir.')}>Selesai</button>}
              {!adaSuara && <button className="toggle-button deactivate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}`, 'DELETE', undefined, `Hapus agenda "${a.judul}"?`)}>Hapus</button>}
            </span></td>
          </tr>
        })}
      </tbody></table>{!loading && agenda.length === 0 && <div className="empty-state">Belum ada agenda voting.</div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Dokumen RAT (arsip pengurus)</h2><p>Unggah PDF. Anggota hanya melihat dokumen tahun <strong>terbaru</strong>; arsip tahun-tahun sebelumnya hanya tampil di sini untuk pengurus.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 200 }}>Judul
          <input value={docJudul} onChange={(e) => setDocJudul(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tahun
          <input type="number" value={docTahun} onChange={(e) => setDocTahun(e.target.value)} style={{ width: 100, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 180 }}>Deskripsi
          <input value={docDeskripsi} onChange={(e) => setDocDeskripsi(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label className="toggle-button" style={{ cursor: 'pointer', height: 38, display: 'flex', alignItems: 'center' }}>
          {docFile ? docFile.name.slice(0, 20) : 'Pilih PDF'}
          <input type="file" accept="application/pdf" hidden onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={busyId === 'upload-doc'} onClick={uploadDoc}>Unggah</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Dokumen</th><th>Tahun</th><th>Diterbitkan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {dokumen.map((d) => <tr key={d.id}>
          <td><strong>{d.judul}</strong>{d.aktif && dokumen[0] && d.tahun === dokumen[0].tahun && <span className="role-pill pengurus" style={{ marginLeft: 8 }}>Dilihat anggota</span>}{d.deskripsi && <><br /><small style={{ color: 'var(--muted)' }}>{d.deskripsi}</small></>}</td>
          <td>{d.tahun}</td>
          <td>{tanggal(d.diterbitkanPada)}</td>
          <td><span className={`status-pill ${d.aktif ? 'active' : 'inactive'}`}><i />{d.aktif ? 'Tampil' : 'Disembunyikan'}</span></td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <a className="toggle-button" href={`${API_BASE}/api/erat/laporan-tahunan/${d.id}/berkas`} target="_blank" rel="noreferrer">Buka</a>
            <button className={`toggle-button ${d.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `d-${d.id}`} onClick={() => void call(`d-${d.id}`, `/api/admin/erat/laporan/${d.id}`, 'PATCH', { aktif: !d.aktif })}>{d.aktif ? 'Sembunyikan' : 'Tampilkan'}</button>
            <button className="toggle-button deactivate" disabled={busyId === `d-${d.id}`} onClick={() => void call(`d-${d.id}`, `/api/admin/erat/laporan/${d.id}`, 'DELETE', undefined, `Hapus dokumen "${d.judul}" permanen?`)}>Hapus</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && dokumen.length === 0 && <div className="empty-state">Belum ada dokumen RAT.</div>}</div>
    </section>
  </div>
}

function StatCard({ label, value, icon, tone, money }: { label: string; value: number; icon: ReactNode; tone: string; money?: boolean }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{money ? rupiah(value) : value}</strong></div></div>
}

function LoginScreen({ nik, password, setNik, setPassword, loading, error, onSubmit }: { nik: string; password: string; setNik: (value: string) => void; setPassword: (value: string) => void; loading: boolean; error: string; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-card"><div className="brand-lockup centered"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div><div className="login-copy"><p className="eyebrow">RUANG PENGURUS</p><h1>Masuk ke console</h1><p>Gunakan akun dengan role Admin atau Pengurus untuk melanjutkan.</p></div>{error && <div className="alert error"><X size={17} />{error}</div>}<form onSubmit={onSubmit}><label>NIK<input value={nik} onChange={(event) => setNik(event.target.value)} placeholder="Nomor Induk Karyawan" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required /></label><button className="submit-button" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button></form><small className="login-note">Akses dicatat berdasarkan role akun di server.</small></div></div> }

export default App
