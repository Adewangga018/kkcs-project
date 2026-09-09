import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Activity, BadgeCheck, Banknote, Database, HandCoins, LayoutDashboard, LogOut, Menu, PiggyBank, RefreshCw, Search, ShieldCheck, UserPlus, Users, Wallet, X, Zap } from 'lucide-react'
import './App.css'

type AdminUser = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; peran: string; statusKeanggotaan: string; aktif: boolean; dibuatPada: string }
type Pendaftaran = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; statusKeanggotaan: string; dibuatPada: string }
type Konfigurasi = { simpananPokokNominal: number; simpananWajibNominal: number; tanggalTagihWajib: number; diperbaruiPada: string }
type TagihanWajib = { id: number; namaAnggota: string; nomorIndukKaryawan: string; periode: string; nominal: number; jatuhTempo: string; status: string; catatanReview: string | null; dibuatPada: string; diprosesPada: string | null }
type TransaksiSukarela = { id: number; namaAnggota: string; nomorIndukKaryawan: string; jenis: string; nominal: number; catatan: string | null; status: string; catatanReview: string | null; diajukanPada: string; diprosesPada: string | null; saldoSukarela: number }
type ProdukBerjangka = { id: number; nama: string; nominal: number; tenorBulan: number; aktif: boolean }
type SimpananBerjangka = { id: number; namaAnggota: string; nomorIndukKaryawan: string; produkNama: string; nomorSertifikat: string; nominal: number; tenorBulan: number; status: string; catatanReview: string | null; diajukanPada: string; tanggalMulai: string | null; tanggalJatuhTempo: string | null; dicairkanPada: string | null }
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

type View = 'pengguna' | 'pinjaman' | 'simpanan'
const VIEW_TITLE: Record<View, string> = { pengguna: 'Dashboard pengguna', pinjaman: 'Manajemen pinjaman', simpanan: 'Manajemen simpanan' }
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
  })
  const createProduk = () => {
    if (!produkNama.trim() || !(Number(produkNominal) > 0) || !(Number(produkTenor) > 0)) { setError('Nama, nominal, dan tenor produk wajib diisi.'); return }
    void call('produk-baru', '/api/admin/simpanan/berjangka/produk', 'POST', { nama: produkNama.trim(), nominal: Number(produkNominal), tenorBulan: Number(produkTenor) })
      .then(() => { setProdukNama(''); setProdukNominal('') })
  }

  const wajibMenunggu = wajib.filter((item) => item.status === 'Ditagih').length
  const sukarelaMenunggu = sukarela.filter((item) => item.status === 'Diajukan').length
  const berjangkaMenunggu = berjangka.filter((item) => item.status === 'Diajukan').length
  const berjangkaJatuhTempo = berjangka.filter((item) => item.status === 'JatuhTempo').length

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Simpanan anggota</h2><p>Konfigurasi nominal, tagih Simpanan Wajib otomatis, dan setujui setoran / penarikan / berjangka.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Tagihan wajib menunggu" value={wajibMenunggu} icon={<Wallet size={20} />} tone="amber" />
      <StatCard label="Pengajuan sukarela" value={sukarelaMenunggu} icon={<Banknote size={20} />} tone="amber" />
      <StatCard label="Pengajuan berjangka" value={berjangkaMenunggu} icon={<PiggyBank size={20} />} tone="amber" />
      <StatCard label="Berjangka jatuh tempo" value={berjangkaJatuhTempo} icon={<BadgeCheck size={20} />} tone="blue" />
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
      <div className="panel-heading"><div><h2>Simpanan Sukarela</h2><p>Setoran menambah saldo; penarikan mengurangi saldo (dicek kecukupan saat disetujui).</p></div><span className="record-count">{sukarelaMenunggu} menunggu</span></div>
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
      <div className="panel-heading"><div><h2>Pengajuan Simpanan Berjangka</h2><p>Setujui untuk mengunci dana; cairkan saat sudah jatuh tempo.</p></div><span className="record-count">{berjangkaMenunggu} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Paket</th><th>Nominal</th><th>Tenor</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {berjangka.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{item.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{item.nomorSertifikat}</small></td>
          <td>{rupiah(item.nominal)}</td>
          <td>{item.tenorBulan} bln</td>
          <td>{item.tanggalJatuhTempo ? tanggal(item.tanggalJatuhTempo) : '—'}</td>
          <td><span className={`status-pill ${item.status === 'Aktif' || item.status === 'Dicairkan' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span></td>
          <td className="align-right">
            {item.status === 'Diajukan' && <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, true, `berjangka ${item.namaAnggota} ${rupiah(item.nominal)}`)}>Setujui</button>
              <button className="toggle-button deactivate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, false, `berjangka ${item.namaAnggota}`)}>Tolak</button>
            </span>}
            {(item.status === 'JatuhTempo' || item.status === 'Aktif') && <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan`, 'POST', undefined, `Cairkan simpanan berjangka ${item.namaAnggota} ${rupiah(item.nominal)}?`)}>Cairkan</button>}
            {(item.status === 'Ditolak' || item.status === 'Dicairkan') && <small style={{ color: 'var(--muted)' }}>—</small>}
          </td>
        </tr>)}
      </tbody></table>{!loading && berjangka.length === 0 && <div className="empty-state">Belum ada pengajuan simpanan berjangka.</div>}</div>
    </section>
  </div>
}

function StatCard({ label, value, icon, tone, money }: { label: string; value: number; icon: ReactNode; tone: string; money?: boolean }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{money ? rupiah(value) : value}</strong></div></div>
}

function LoginScreen({ nik, password, setNik, setPassword, loading, error, onSubmit }: { nik: string; password: string; setNik: (value: string) => void; setPassword: (value: string) => void; loading: boolean; error: string; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-card"><div className="brand-lockup centered"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div><div className="login-copy"><p className="eyebrow">RUANG PENGURUS</p><h1>Masuk ke console</h1><p>Gunakan akun dengan role Admin atau Pengurus untuk melanjutkan.</p></div>{error && <div className="alert error"><X size={17} />{error}</div>}<form onSubmit={onSubmit}><label>NIK<input value={nik} onChange={(event) => setNik(event.target.value)} placeholder="Nomor Induk Karyawan" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required /></label><button className="submit-button" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button></form><small className="login-note">Akses dicatat berdasarkan role akun di server.</small></div></div> }

export default App
