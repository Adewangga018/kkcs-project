import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Activity, BadgeCheck, Database, LayoutDashboard, LogOut, Menu, RefreshCw, Search, ShieldCheck, Users, X } from 'lucide-react'
import './App.css'

type AdminUser = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; peran: string; aktif: boolean; dibuatPada: string }
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5168'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('kkcs_admin_token') ?? '')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loginNIK, setLoginNIK] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const loadUsers = async () => {
    if (!token) return
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error(response.status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat pengguna.')
      setUsers(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadUsers() }, [token])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const needle = query.toLowerCase()
    const matchesQuery = !needle || [user.namaLengkap, user.nomorIndukKaryawan, user.email ?? ''].some((value) => value.toLowerCase().includes(needle))
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.aktif : !user.aktif)
    const matchesRole = roleFilter === 'all' || user.peran === roleFilter
    return matchesQuery && matchesStatus && matchesRole
  }), [users, query, statusFilter, roleFilter])
  const activeCount = users.filter((user) => user.aktif).length
  const roles = [...new Set(users.map((user) => user.peran))]

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
  const logout = () => { localStorage.removeItem('kkcs_admin_token'); setToken('') }

  if (!token) return <LoginScreen nik={loginNIK} password={loginPassword} setNik={setLoginNIK} setPassword={setLoginPassword} loading={loginLoading} error={error} onSubmit={login} />
  return <div className="console-shell">
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}><div className="brand-lockup"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div><nav className="primary-nav"><button className="nav-item active"><LayoutDashboard size={18} /> Dashboard</button><button className="nav-item" onClick={() => document.getElementById('user-table')?.scrollIntoView({ behavior: 'smooth' })}><Users size={18} /> Pengguna</button><button className="nav-item"><Database size={18} /> Data koperasi <span className="nav-soon">segera</span></button></nav><div className="sidebar-footer"><ShieldCheck size={16} /> Role-based access</div></aside>
    <main className="main-content"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Buka navigasi"><Menu size={20} /></button><div><p className="eyebrow">OPERASIONAL</p><h1>Dashboard pengguna</h1></div><div className="topbar-actions"><button className="icon-button" onClick={() => void loadUsers()} title="Muat ulang"><RefreshCw size={18} /></button><button className="profile-chip" onClick={logout}><CircleIcon /><span>Pengurus</span><LogOut size={15} /></button></div></header>
      <div className="content-wrap"><section className="welcome-row"><div><h2>Kontrol akses anggota</h2><p>Kelola status akses pengguna koperasi dengan satu tindakan yang tercatat.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'}</div></section>{error && <div className="alert error"><X size={17} />{error}</div>}{notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
        <section className="stat-grid"><StatCard label="Total pengguna" value={users.length} icon={<Users size={20} />} tone="teal" /><StatCard label="Pengguna aktif" value={activeCount} icon={<BadgeCheck size={20} />} tone="green" /><StatCard label="Akses nonaktif" value={users.length - activeCount} icon={<ShieldCheck size={20} />} tone="amber" /><StatCard label="Peran terdaftar" value={roles.length} icon={<Database size={20} />} tone="blue" /></section>
        <section className="table-panel" id="user-table"><div className="panel-heading"><div><h2>Daftar pengguna</h2><p>Aktifkan atau nonaktifkan akses login anggota.</p></div><span className="record-count">{filteredUsers.length} data</span></div><div className="filters"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIK, atau email" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">Semua peran</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>Pengguna</th><th>NIK</th><th>Peran</th><th>Status</th><th>Dibuat</th><th className="align-right">Aksi</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar">{user.namaLengkap.charAt(0).toUpperCase()}</span><div><strong>{user.namaLengkap}</strong><small>{user.email ?? 'Email belum diisi'}</small></div></div></td><td className="mono">{user.nomorIndukKaryawan}</td><td><span className={`role-pill ${user.peran.toLowerCase()}`}>{user.peran}</span></td><td><span className={`status-pill ${user.aktif ? 'active' : 'inactive'}`}><i />{user.aktif ? 'Aktif' : 'Nonaktif'}</span></td><td>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(user.dibuatPada))}</td><td className="align-right"><button className={`toggle-button ${user.aktif ? 'deactivate' : 'activate'}`} onClick={() => void toggleUser(user)}>{user.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></td></tr>)}</tbody></table>{!loading && filteredUsers.length === 0 && <div className="empty-state">Tidak ada pengguna yang cocok dengan filter.</div>}</div></section></div>
    </main></div>
}

function CircleIcon() { return <span className="mini-avatar"><CircleUserIcon /></span> }
function CircleUserIcon() { return <Users size={16} /> }
function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) { return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div> }
function LoginScreen({ nik, password, setNik, setPassword, loading, error, onSubmit }: { nik: string; password: string; setNik: (value: string) => void; setPassword: (value: string) => void; loading: boolean; error: string; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-card"><div className="brand-lockup centered"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div><div className="login-copy"><p className="eyebrow">RUANG PENGURUS</p><h1>Masuk ke console</h1><p>Gunakan akun dengan role Admin atau Pengurus untuk melanjutkan.</p></div>{error && <div className="alert error"><X size={17} />{error}</div>}<form onSubmit={onSubmit}><label>NIK<input value={nik} onChange={(event) => setNik(event.target.value)} placeholder="Nomor Induk Karyawan" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required /></label><button className="submit-button" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button></form><small className="login-note">Akses dicatat berdasarkan role akun di server.</small></div></div> }

export default App
