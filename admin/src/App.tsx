import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { Activity, ArrowRight, BadgeCheck, Banknote, BookOpen, Calculator, Calendar, Check, CheckCircle2, ChevronRight, Clock, Copy, Database, Download, Edit, ExternalLink, Eye, EyeOff, FileSpreadsheet, FileText, Fingerprint, HandCoins, HelpCircle, Info, KeyRound, LayoutDashboard, Lightbulb, LogOut, Mail, MapPin, Menu, Phone, PiggyBank, PlusCircle, Receipt, RefreshCw, Scale, Search, Send, ShieldCheck, Store, Trash2, TrendingUp, Upload, UserCheck, UserCog, UserPlus, Users, Vote, Wallet, X, Zap } from 'lucide-react'
import './App.css'
import logoKkcs from './assets/logo-kkcs.png'

type AdminUser = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; peran: string; statusKeanggotaan: string; aktif: boolean; dibuatPada: string }
type AuditLogEntry = { id: number; waktuUtc: string; pelakuId: number | null; pelakuNama: string; pelakuPeran: string; modul: string; aksi: string; entitasId: number | null; ringkasan: string; detail: string | null; alamatIp: string | null }
type DbAuditLogEntry = { id: number; tabel: string; operasi: string; kunciPrimer: string; dataSebelum: string | null; dataSesudah: string | null; waktuUtc: string; dbLogin: string; appName: string | null; hostName: string | null; prevHash: string; hash: string }
type VerifikasiChainResult = { utuh: boolean; jumlahBermasalah: number; message: string; baris: { id: number; tabel: string; operasi: string; kunciPrimer: string; waktuUtc: string; dbLogin: string; hashTidakCocok: boolean; rantaiTerputus: boolean }[] }
type AnggotaDirektoriItem = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; peran: string; statusKeanggotaan: string; aktif: boolean; totalSimpanan: number; dibuatPada: string }
type BerjangkaRingkas = { nomorSertifikat: string; produkNama: string; nominal: number; tenorBulan: number; status: string; tanggalMulai: string | null; tanggalJatuhTempo: string | null }
type PinjamanRingkas = { nomorPinjaman: string; pokok: number; tenorBulan: number; angsuranPerBulan: number; sisaPokok: number; angsuranTerbayar: number; status: string; tanggalMulai: string; lunasPada: string | null }
type BelanjaRingkas = { nomorTransaksi: string; produkNama: string; jenis: string; jumlah: number; total: number; metodePembayaran: string; status: string; diajukanPada: string }
type AnggotaDetail = {
  id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; nomorTelepon: string | null; alamat: string | null
  peran: string; statusKeanggotaan: string; aktif: boolean; dibuatPada: string; disetujuiPada: string | null
  saldoPokok: number; saldoWajib: number; saldoSukarela: number; totalSimpanan: number
  berjangka: BerjangkaRingkas[]; pinjaman: PinjamanRingkas[]; belanja: BelanjaRingkas[]; totalTagihanKreditBelum: number
}
type Pendaftaran = { id: number; namaLengkap: string; nomorIndukKaryawan: string; email: string | null; statusKeanggotaan: string; dibuatPada: string }
type DashboardTren = { label: string; pendapatan: number; beban: number; labaBersih: number }
type DashboardShuTerakhir = { tahun: number; totalShu: number; totalShuNeto: number; jumlahAnggota: number; difinalisasiPada: string }
type DashboardAktivitas = { waktuUtc: string; pelakuNama: string; modul: string; aksi: string; ringkasan: string }
type DashboardRingkasan = {
  totalAnggotaAktif: number; pendaftaranMenunggu: number
  totalSimpanan: number; saldoPokok: number; saldoWajib: number; saldoSukarela: number; saldoBerjangka: number
  wajibMenunggu: number; sukarelaMenunggu: number; berjangkaMenunggu: number
  pinjamanAktifCount: number; totalSisaPokokPinjaman: number; pengajuanPinjamanMenunggu: number; pembayaranPinjamanMenunggu: number
  titipanMenunggu: number; pembelianMenunggu: number; tagihanKreditBelumLunas: number
  totalAset: number; totalLiabilitas: number; totalEkuitas: number; selisihNeraca: number
  pendapatanTahunIni: number; bebanTahunIni: number; labaBersihTahunIni: number; labaBersihBulanIni: number
  trenBulanan: DashboardTren[]; shuTerakhir: DashboardShuTerakhir | null
  payrollTotalPeriodeIni: number; payrollJumlahAnggota: number
  auditHariIni: number; aktivitasTerbaru: DashboardAktivitas[]
  totalMenunggu: number
}
type Konfigurasi = { simpananPokokNominal: number; simpananWajibNominal: number; tanggalTagihWajib: number; bungaSukarelaTahunan: number; bungaDepositoTahunan: number; tarifPph: number; tarifPphShu: number; diperbaruiPada: string }
type TagihanWajib = { id: number; namaAnggota: string; nomorIndukKaryawan: string; periode: string; nominal: number; jatuhTempo: string; status: string; catatanReview: string | null; dibuatPada: string; diprosesPada: string | null }
type BungaSukarelaTerakhir = { periode: string; bruto: number; pajak: number; neto: number }
type TransaksiSukarela = { id: number; namaAnggota: string; nomorIndukKaryawan: string; jenis: string; nominal: number; catatan: string | null; status: string; catatanReview: string | null; diajukanPada: string; diprosesPada: string | null; saldoSukarela: number; bungaTerakhir: BungaSukarelaTerakhir | null }
type ProdukBerjangka = { id: number; nama: string; nominal: number; tenorBulan: number; aktif: boolean }
type SimpananBerjangka = { id: number; namaAnggota: string; nomorIndukKaryawan: string; produkNama: string; nomorSertifikat: string; nominal: number; tenorBulan: number; status: string; catatanReview: string | null; diajukanPada: string; tanggalMulai: string | null; tanggalJatuhTempo: string | null; dicairkanPada: string | null; estimasiBunga: number; estimasiPajak: number; estimasiBungaNeto: number; sudahDicairkan: boolean; pencairanDiajukan: boolean; pencairanDiajukanPada: string | null; alasanPencairan: string | null }
type Produk = { id: number; kode: string; nama: string; deskripsi: string | null; jenis: string; harga: number; stok: number; satuan: string; fotoUrl: string | null; sumber: string; diajukanOleh: string | null; status: string; aktif: boolean; catatanReview: string | null }
type PembelianProduk = { id: number; nomorTransaksi: string; namaPembeli: string; nomorIndukKaryawan: string; produkNama: string; jenis: string; jumlah: number; hargaSatuan: number; total: number; metodePembayaran: string; status: string; catatan: string | null; catatanReview: string | null; diajukanPada: string; diprosesPada: string | null }
type TagihanKredit = { id: number; pembelianProdukId: number; penggunaId: number; nomorTransaksi: string; namaAnggota: string; nomorIndukKaryawan: string; produkNama: string; total: number; status: string; dibuatPada: string; lunasPada: string | null }
type EratOpsi = { id: number; label: string; jumlah: number }
type EratAgenda = { id: number; judul: string; deskripsi: string | null; status: string; mulaiPada: string | null; selesaiPada: string | null; dibuatPada: string; totalSuara: number; opsi: EratOpsi[] }
type RatDoc = { id: number; tahun: number; judul: string; deskripsi: string | null; fileUrl: string; diterbitkanPada: string; aktif: boolean }
type PayrollItem = { jenis: 'Wajib' | 'Kredit' | 'Cicilan'; id: number; keterangan: string; nominal: number }
type PayrollBaris = { penggunaId: number; nama: string; nik: string; simpananWajib: number; tagihanKredit: number; cicilanPinjaman: number; totalPotongan: number; items: PayrollItem[] }
type PayrollRekap = { periode: string; baris: PayrollBaris[]; totalWajib: number; totalKredit: number; totalCicilanPinjaman: number; totalPotongan: number }
type Akun = { id: number; kode: string; nama: string; tipe: string; saldoNormal: string; sistem: boolean; aktif: boolean }
type JurnalBarisT = { akunId: number; kodeAkun: string; namaAkun: string; debit: number; kredit: number }
type Jurnal = { id: number; nomorJurnal: string; tanggal: string; keterangan: string; sumber: string; referensiModul: string | null; referensiId: string | null; dicatatOleh: string | null; baris: JurnalBarisT[] }
type SaldoAkunItem = { kode: string; nama: string; saldo: number }
type LabaRugi = { dari: string; sampai: string; pendapatan: SaldoAkunItem[]; totalPendapatan: number; beban: SaldoAkunItem[]; totalBeban: number; labaBersih: number }
type Neraca = { tanggal: string; aset: SaldoAkunItem[]; totalAset: number; liabilitas: SaldoAkunItem[]; totalLiabilitas: number; ekuitas: SaldoAkunItem[]; shuBerjalan: number; totalEkuitas: number; selisih: number }
type ProfilKoperasi = { visi: string; misi: string; alamatKantor: string | null; tanggalDidirikan: string | null; nomorAktaPendirian: string | null; tanggalAkta: string | null }
type RatKonten = {
  tahun: number; kegiatanBisnis: string | null; kegiatanSosial: string | null
  rencanaBisnisTahunDepan: string | null; rencanaSosialTahunDepan: string | null
  rabPendapatanPinjaman: number | null; rabPendapatanLain: number | null
  rabBebanOperasional: number | null; rabBebanUmum: number | null; rabCadanganPiutang: number | null
  realisasiPajakShu: number | null; catatanTambahan: string | null
  dipublikasikan: boolean; dipublikasikanPada: string | null
}
type RatShu = { totalShu: number; totalPajak: number; totalShuNeto: number; persenAnggota: number; persenJasaModal: number; persenJasaUsaha: number; persenPengurus: number; persenCadangan: number; jasaPengurusPool: number; cadanganAmount: number; jumlahAnggota: number; difinalisasiPada: string }
type BukuBesarAkun = { kode: string; nama: string; tipe: string; saldoAwal: number; debit: number; kredit: number; saldoAkhir: number }
type LaporanRat = {
  tahun: number
  profil: ProfilKoperasi
  konten: RatKonten
  totalAnggotaAktifSaatIni: number; anggotaBaruTahunIni: number; totalAnggotaNonaktifSaatIni: number
  neracaAkhirTahun: Neraca; neracaTahunLalu: Neraca | null
  labaRugi: LabaRugi; bukuBesar: BukuBesarAkun[]; shu: RatShu | null
  shuSebelumPajak: number; pajakShu: number | null; shuSetelahPajak: number | null
  rabTotalPendapatan: number | null; rabTotalBeban: number | null
  realisasiBebanOperasional: number; realisasiBebanUmum: number; realisasiBebanCadanganPiutang: number
  itemBelumLengkap: string[]
}
type ArusKasBaris = { tanggal: string; nomorJurnal: string; keterangan: string; modul: string | null; masuk: number; keluar: number }
type ArusKas = { dari: string; sampai: string; saldoAwal: number; totalMasuk: number; totalKeluar: number; saldoAkhir: number; baris: ArusKasBaris[] }
type ShuRiwayat = { tahun: number; totalShu: number; totalPajak: number; totalShuNeto: number; persenAnggota: number; persenJasaModal: number; persenJasaUsaha: number; persenPengurus: number; persenCadangan: number; jasaPengurusPool: number; cadanganAmount: number; jumlahAnggota: number; difinalisasiPada: string }
type ShuBaris = { penggunaId: number; nama: string; nomorIndukKaryawan: string; simpananAnggota: number; transaksiAnggota: number; jma: number; jua: number; totalShu: number; pajak: number; totalShuNeto: number }
type ShuHitung = { tahun: number; totalShu: number; persenAnggota: number; persenJasaModal: number; persenJasaUsaha: number; persenPengurus: number; persenCadangan: number; tarifPph: number; totalPajak: number; totalShuNeto: number; anggotaPool: number; jasaPengurusPool: number; cadanganAmount: number; totalSimpananSemuaAnggota: number; totalTransaksiSemuaAnggota: number; rincian: ShuBaris[] }
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

type View = 'dashboard' | 'anggota' | 'simpanpinjam' | 'katalog' | 'erat' | 'akuntansi' | 'akun' | 'audit' | 'migrasi' | 'panduan'
const VIEW_TITLE: Record<View, string> = { dashboard: 'Dashboard', anggota: 'Manajemen Anggota', simpanpinjam: 'Simpan Pinjam', katalog: 'Katalog produk', erat: 'E-RAT & dokumen', akuntansi: 'Akuntansi & Keuangan', akun: 'Akun & Peran Pengguna', audit: 'Audit Trail', migrasi: 'Migrasi Data Lama', panduan: 'Panduan Pengurus' }
type AnggotaTab = 'pendaftaran' | 'direktori' | 'payroll'
type SimpanPinjamTab = 'simpanan' | 'pinjaman'
type AkuntansiTab = 'jurnal' | 'neraca' | 'laba-rugi' | 'shu' | 'arus-kas' | 'akun'
type Peran = 'Admin' | 'Pengurus'
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5168'
const rupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`
const tanggal = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
const waktu = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.endsWith('Z') ? value : `${value}Z`))

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('kkcs_admin_token') ?? '')
  const [peran, setPeran] = useState<Peran | null>(null)
  const [nama, setNama] = useState('')
  const [view, setView] = useState<View>('dashboard')
  const [anggotaTab, setAnggotaTab] = useState<AnggotaTab>('pendaftaran')
  const [spTab, setSpTab] = useState<SimpanPinjamTab>('simpanan')
  const [akuntansiTab, setAkuntansiTab] = useState<AkuntansiTab>('jurnal')
  const [dashboardSummary, setDashboardSummary] = useState<DashboardRingkasan | null>(null)
  const [error, setError] = useState('')
  const [loginNIK, setLoginNIK] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const logout = useCallback(() => { localStorage.removeItem('kkcs_admin_token'); setToken(''); setPeran(null) }, [])
  const handleExpired = useCallback(() => {
    localStorage.removeItem('kkcs_admin_token'); setToken(''); setPeran(null)
    setError('Sesi login berakhir. Silakan masuk kembali.')
  }, [])

  // Resolve peran (role) dari token yang tersimpan — dipakai saat login maupun saat sesi dipulihkan dari localStorage.
  useEffect(() => {
    if (!token) return
    let batal = false
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (response.status === 401) { if (!batal) handleExpired(); return }
        if (!response.ok) return
        const data = await response.json()
        if (batal) return
        if (!['Admin', 'Pengurus'].includes(data.peran)) { handleExpired(); setError('Akun ini bukan akun admin atau pengurus.'); return }
        setPeran(data.peran as Peran); setNama(data.namaLengkap as string)
        if (data.peran === 'Pengurus') setView((v) => (v === 'akun' || v === 'audit') ? 'dashboard' : v)
      } catch { /* diamkan — panel lain akan melaporkan error jaringan */ }
    })()
    return () => { batal = true }
  }, [token, handleExpired])

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

  if (!token) return <LoginScreen nik={loginNIK} password={loginPassword} setNik={setLoginNIK} setPassword={setLoginPassword} loading={loginLoading} error={error} onSubmit={login} />
  if (!peran) return <div className="login-page"><div className="login-card"><p>Memuat sesi…</p></div></div>

  const goto = (target: View, opts?: { anggotaTab?: AnggotaTab; spTab?: SimpanPinjamTab; akuntansiTab?: AkuntansiTab }) => {
    setView(target); setMobileNav(false)
    if (opts?.anggotaTab) setAnggotaTab(opts.anggotaTab)
    if (opts?.spTab) setSpTab(opts.spTab)
    if (opts?.akuntansiTab) setAkuntansiTab(opts.akuntansiTab)
  }
  const isAdmin = peran === 'Admin'

  const anggotaMenunggu = dashboardSummary?.pendaftaranMenunggu ?? 0
  const simpananMenunggu = (dashboardSummary?.wajibMenunggu ?? 0) + (dashboardSummary?.sukarelaMenunggu ?? 0) + (dashboardSummary?.berjangkaMenunggu ?? 0)
  const pinjamanMenunggu = (dashboardSummary?.pengajuanPinjamanMenunggu ?? 0) + (dashboardSummary?.pembayaranPinjamanMenunggu ?? 0)
  const spMenunggu = simpananMenunggu + pinjamanMenunggu
  const katalogMenunggu = (dashboardSummary?.titipanMenunggu ?? 0) + (dashboardSummary?.pembelianMenunggu ?? 0)

  return <div className="console-shell">
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><img src={logoKkcs} alt="Logo KKCS" /></div><div><strong>KKCS</strong><span>Admin Console</span></div></div>
      <nav className="primary-nav">
        <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => goto('dashboard')}><LayoutDashboard size={18} /> <span>Dashboard</span></button>
        <button className={`nav-item ${view === 'anggota' ? 'active' : ''}`} onClick={() => goto('anggota')}><Users size={18} /> <span>Manajemen Anggota</span>{anggotaMenunggu > 0 && <span className="nav-badge amber">{anggotaMenunggu}</span>}</button>
        <button className={`nav-item ${view === 'simpanpinjam' ? 'active' : ''}`} onClick={() => goto('simpanpinjam')}><PiggyBank size={18} /> <span>Simpan Pinjam</span>{spMenunggu > 0 && <span className="nav-badge emerald">{spMenunggu}</span>}</button>
        <button className={`nav-item ${view === 'katalog' ? 'active' : ''}`} onClick={() => goto('katalog')}><Store size={18} /> <span>Katalog</span>{katalogMenunggu > 0 && <span className="nav-badge teal">{katalogMenunggu}</span>}</button>
        <button className={`nav-item ${view === 'akuntansi' ? 'active' : ''}`} onClick={() => goto('akuntansi')}><BookOpen size={18} /> <span>Akuntansi</span></button>
        <button className={`nav-item ${view === 'erat' ? 'active' : ''}`} onClick={() => goto('erat')}><Vote size={18} /> <span>E-RAT</span></button>
        {isAdmin && <>
          <div style={{ margin: '12px 14px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#6a95a3', textTransform: 'uppercase' }}>Khusus Admin</div>
          <button className={`nav-item ${view === 'akun' ? 'active' : ''}`} onClick={() => goto('akun')}><UserCog size={18} /> <span>Akun & Peran</span></button>
          <button className={`nav-item ${view === 'audit' ? 'active' : ''}`} onClick={() => goto('audit')}><Fingerprint size={18} /> <span>Audit Trail</span></button>
          <button className={`nav-item ${view === 'migrasi' ? 'active' : ''}`} onClick={() => goto('migrasi')}><Upload size={18} /> <span>Migrasi Data Lama</span></button>
        </>}
        <div style={{ margin: '12px 14px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#6a95a3', textTransform: 'uppercase' }}>Bantuan</div>
        <button className={`nav-item ${view === 'panduan' ? 'active' : ''}`} onClick={() => goto('panduan')}><HelpCircle size={18} /> <span>Panduan Pengurus</span></button>
      </nav>
      <div className="sidebar-footer"><ShieldCheck size={16} /> Role-based access</div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Buka navigasi"><Menu size={20} /></button>
        <div><p className="eyebrow">OPERASIONAL</p><h1>{VIEW_TITLE[view]}</h1></div>
        <div className="topbar-actions"><button className="profile-chip" onClick={logout} title={nama}><span className="mini-avatar"><Users size={16} /></span><span>{isAdmin ? 'Admin' : 'Pengurus'}</span><LogOut size={15} /></button></div>
      </header>
      {view === 'dashboard' && <DashboardView token={token} onExpired={handleExpired} nama={nama} isAdmin={isAdmin} goto={goto} onSummaryUpdate={setDashboardSummary} />}
      {view === 'anggota' && <AnggotaMenuView token={token} onExpired={handleExpired} tab={anggotaTab} setTab={setAnggotaTab} pendingCount={anggotaMenunggu} />}
      {view === 'simpanpinjam' && <SimpanPinjamView token={token} onExpired={handleExpired} isAdmin={isAdmin} tab={spTab} setTab={setSpTab} simpananPending={simpananMenunggu} pinjamanPending={pinjamanMenunggu} />}
      {view === 'katalog' && <CatalogView token={token} onExpired={handleExpired} />}
      {view === 'erat' && <EratView token={token} onExpired={handleExpired} />}
      {view === 'akuntansi' && <AkuntansiView token={token} onExpired={handleExpired} tab={akuntansiTab} setTab={setAkuntansiTab} />}
      {view === 'akun' && isAdmin && <AkunView token={token} onExpired={handleExpired} />}
      {view === 'audit' && isAdmin && <AuditTrailView token={token} onExpired={handleExpired} />}
      {view === 'migrasi' && isAdmin && <MigrasiView token={token} onExpired={handleExpired} />}
      {view === 'panduan' && <PanduanView isAdmin={isAdmin} goto={goto} />}
    </main>
  </div>
}

function DashboardView({
  token,
  onExpired,
  nama,
  isAdmin,
  goto,
  onSummaryUpdate,
}: {
  token: string
  onExpired: () => void
  nama: string
  isAdmin: boolean
  goto: (target: View, opts?: { anggotaTab?: AnggotaTab; spTab?: SimpanPinjamTab; akuntansiTab?: AkuntansiTab }) => void
  onSummaryUpdate?: (data: DashboardRingkasan) => void
}) {
  const [data, setData] = useState<DashboardRingkasan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/dashboard/ringkasan`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal memuat dashboard.')
      const res = await response.json()
      setData(res)
      onSummaryUpdate?.(res)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }, [token, onExpired, onSummaryUpdate])

  useEffect(() => { void load() }, [load])

  const jam = new Date().getHours()
  const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam'
  const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  // Daftar aksi yang memerlukan tindakan / review pengurus
  const aksiList = data ? [
    {
      id: 'pendaftaran',
      label: 'Pendaftaran Anggota',
      kategori: 'Keanggotaan',
      deskripsi: 'Verifikasi identitas dan persetujuan calon anggota baru',
      jumlah: data.pendaftaranMenunggu,
      target: 'anggota' as View,
      anggotaTab: 'pendaftaran' as AnggotaTab,
      icon: <UserPlus size={20} />,
      tone: 'blue',
    },
    {
      id: 'wajib',
      label: 'Simpanan Wajib',
      kategori: 'Simpanan',
      deskripsi: 'Approval setoran simpanan wajib periode berjalan',
      jumlah: data.wajibMenunggu,
      target: 'simpanpinjam' as View,
      spTab: 'simpanan' as SimpanPinjamTab,
      icon: <PiggyBank size={20} />,
      tone: 'sky',
    },
    {
      id: 'sukarela',
      label: 'Simpanan Sukarela',
      kategori: 'Simpanan',
      deskripsi: 'Konfirmasi setoran mutasi sukarela anggota',
      jumlah: data.sukarelaMenunggu,
      target: 'simpanpinjam' as View,
      spTab: 'simpanan' as SimpanPinjamTab,
      icon: <Wallet size={20} />,
      tone: 'navy',
    },
    {
      id: 'berjangka',
      label: 'Simpanan Berjangka',
      kategori: 'Investasi',
      deskripsi: 'Konfirmasi penerbitan bilyet deposito berjangka',
      jumlah: data.berjangkaMenunggu,
      target: 'simpanpinjam' as View,
      spTab: 'simpanan' as SimpanPinjamTab,
      icon: <BadgeCheck size={20} />,
      tone: 'blue',
    },
    {
      id: 'pinjaman-baru',
      label: 'Pengajuan Pinjaman',
      kategori: 'Pinjaman',
      deskripsi: 'Review permohonan kredit & kelayakan plafon cicilan',
      jumlah: data.pengajuanPinjamanMenunggu,
      target: 'simpanpinjam' as View,
      spTab: 'pinjaman' as SimpanPinjamTab,
      icon: <HandCoins size={20} />,
      tone: 'amber',
    },
    {
      id: 'pinjaman-bayar',
      label: 'Pembayaran Angsuran',
      kategori: 'Pinjaman',
      deskripsi: 'Konfirmasi transfer cicilan atau pelunasan pinjaman',
      jumlah: data.pembayaranPinjamanMenunggu,
      target: 'simpanpinjam' as View,
      spTab: 'pinjaman' as SimpanPinjamTab,
      icon: <Receipt size={20} />,
      tone: 'rose',
    },
    {
      id: 'titipan',
      label: 'Titipan Produk',
      kategori: 'Katalog',
      deskripsi: 'Persetujuan produk konsinyasi titipan anggota',
      jumlah: data.titipanMenunggu,
      target: 'katalog' as View,
      icon: <Store size={20} />,
      tone: 'sky',
    },
    {
      id: 'pembelian',
      label: 'Pesanan Belanja',
      kategori: 'Katalog',
      deskripsi: 'Konfirmasi order pembelian produk toko koperasi',
      jumlah: data.pembelianMenunggu,
      target: 'katalog' as View,
      icon: <Banknote size={20} />,
      tone: 'navy',
    },
  ].filter((a) => a.jumlah > 0) : []

  const komposisiSimpanan = data ? [
    { label: 'Pokok', value: data.saldoPokok, color: '#0891b2' },
    { label: 'Wajib', value: data.saldoWajib, color: '#0e7490' },
    { label: 'Sukarela', value: data.saldoSukarela, color: '#06b6d4' },
    { label: 'Berjangka', value: data.saldoBerjangka, color: '#083344' },
  ].filter((k) => k.value > 0) : []

  return (
    <div className="content-wrap">
      {/* Modern Fintech Emerald Hero Banner */}
      <section className="welcome-banner-modern">
        <div className="banner-left">
          <div className="banner-chips-row">
            <span className="banner-chip"><Calendar size={13} /> {hariIni.toUpperCase()}</span>
            <span className="banner-chip role"><ShieldCheck size={13} /> {isAdmin ? 'ADMINISTRATOR' : 'PENGURUS KOPERASI'}</span>
          </div>
          <h1 className="banner-title">{salam}, {nama.split(' ')[0] || 'Pengurus'} 👋</h1>
          <div className="banner-subtitle">
            {data && data.totalMenunggu > 0 ? (
              <span className="banner-alert-pill">
                <span className="pulse-dot-amber" />
                <span>Ada <strong>{data.totalMenunggu} antrean mendesak</strong> membutuhkan persetujuan Anda hari ini.</span>
              </span>
            ) : (
              <span className="banner-success-pill">
                <CheckCircle2 size={16} /> Seluruh permohonan anggota telah diselesaikan — koperasi berjalan tertib dan lancar.
              </span>
            )}
          </div>
        </div>
        <div className="banner-actions">
          <div className="banner-sync-pill">
            <span className="pulse-dot-green" />
            <span>{loading ? 'Menyinkronkan...' : 'Realtime Data'}</span>
          </div>
          <button className="banner-refresh-btn" onClick={() => void load()} title="Muat ulang data dashboard">
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            <span>Segarkan</span>
          </button>
        </div>
      </section>

      {error && <div className="alert error"><X size={17} />{error}</div>}

      {/* Akses Cepat (Quick Shortcuts) */}
      <div className="quick-shortcuts-bar">
        <span className="shortcuts-label"><Zap size={14} /> Akses Cepat:</span>
        <button className="shortcut-btn" onClick={() => goto('anggota', { anggotaTab: 'pendaftaran' })}>
          <UserPlus size={14} /> Pendaftaran Anggota
        </button>
        <button className="shortcut-btn" onClick={() => goto('simpanpinjam', { spTab: 'simpanan' })}>
          <PiggyBank size={14} /> Simpanan Wajib & Sukarela
        </button>
        <button className="shortcut-btn" onClick={() => goto('simpanpinjam', { spTab: 'pinjaman' })}>
          <HandCoins size={14} /> Review Pinjaman
        </button>
        <button className="shortcut-btn" onClick={() => goto('akuntansi', { akuntansiTab: 'jurnal' })}>
          <BookOpen size={14} /> Jurnal Akuntansi
        </button>
        <button className="shortcut-btn" onClick={() => goto('erat')}>
          <Vote size={14} /> Dokumen RAT
        </button>
      </div>

      {data && (
        <>
          {/* Hero Statistics */}
          <section className="stat-grid">
            <StatCard
              label="Anggota Aktif"
              value={data.totalAnggotaAktif}
              icon={<Users size={22} />}
              tone="tosca"
              subtitle={data.pendaftaranMenunggu > 0 ? `${data.pendaftaranMenunggu} calon menunggu review` : 'Seluruh akun terverifikasi'}
              chip={data.pendaftaranMenunggu > 0 ? { text: `+${data.pendaftaranMenunggu} baru`, type: 'warning' } : { text: 'Terverifikasi', type: 'positive' }}
              onClick={() => goto('anggota', { anggotaTab: 'direktori' })}
            />
            <StatCard
              label="Total Simpanan Anggota"
              value={data.totalSimpanan}
              icon={<PiggyBank size={22} />}
              tone="navy"
              money
              subtitle="Pokok, Wajib, Sukarela & Deposito"
              chip={{ text: 'Kas Likuid', type: 'positive' }}
              onClick={() => goto('simpanpinjam', { spTab: 'simpanan' })}
            />
            <StatCard
              label="Pinjaman Aktif (Sisa Pokok)"
              value={data.totalSisaPokokPinjaman}
              icon={<HandCoins size={22} />}
              tone="tosca"
              money
              subtitle={`${data.pinjamanAktifCount} debitur berjalan`}
              chip={data.pengajuanPinjamanMenunggu > 0 ? { text: `${data.pengajuanPinjamanMenunggu} pengajuan`, type: 'warning' } : { text: 'Lancar', type: 'positive' }}
              onClick={() => goto('simpanpinjam', { spTab: 'pinjaman' })}
            />
            <StatCard
              label="Laba Bersih Tahun Ini"
              value={data.labaBersihTahunIni}
              icon={<TrendingUp size={22} />}
              tone="dark"
              money
              subtitle={`Bulan ini: ${rupiah(data.labaBersihBulanIni)}`}
              chip={data.labaBersihBulanIni >= 0 ? { text: 'Surplus', type: 'positive' } : { text: 'Defisit', type: 'warning' }}
              onClick={() => goto('akuntansi', { akuntansiTab: 'laba-rugi' })}
            />
          </section>

          {/* Pusat Persetujuan & Tindakan (Perlu Tindakan) */}
          <section className="action-hub-section">
            <div className="action-hub-header">
              <div className="action-hub-title">
                <div className="action-hub-icon-wrap">
                  <Zap size={20} />
                </div>
                <div>
                  <h2>Pusat Persetujuan & Tindakan</h2>
                  <p>Tinjau dan selesaikan permohonan anggota yang menunggu verifikasi pengurus.</p>
                </div>
              </div>
              <span className="action-hub-badge">
                <span className={data.totalMenunggu > 0 ? 'pulse-dot-amber' : 'pulse-dot-green'} />
                {data.totalMenunggu > 0 ? `${data.totalMenunggu} Antrean Pending` : 'Semua Beres'}
              </span>
            </div>

            {aksiList.length > 0 ? (
              <div className="action-cards-grid">
                {aksiList.map((a) => (
                  <div
                    key={a.id}
                    className="action-card-item"
                    onClick={() => goto(a.target, { anggotaTab: a.anggotaTab, spTab: a.spTab })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={`action-card-icon ${a.tone}`}>
                      {a.icon}
                    </div>
                    <div className="action-card-body">
                      <div className="action-card-top-row">
                        <span className="action-card-cat">{a.kategori}</span>
                        <span className="action-card-count">{a.jumlah} antrean</span>
                      </div>
                      <div className="action-card-title">{a.label}</div>
                      <div className="action-card-desc">{a.deskripsi}</div>
                    </div>
                    <ChevronRight size={18} className="action-card-arrow" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="action-hub-empty">
                <div className="action-empty-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: 14.5, marginBottom: 3 }}>
                    Tidak ada antrean pending hari ini!
                  </strong>
                  <span style={{ fontSize: 12.5, opacity: 0.9 }}>
                    Semua pendaftaran anggota, mutasi simpanan, dan pengajuan pinjaman telah selesai diproses.
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Tren Keuangan & Komposisi Simpanan */}
          <div className="dash-grid-2">
            {/* Tren keuangan 6 bulan */}
            <section className="table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Tren Keuangan 6 Bulan</h2>
                  <p>Pendapatan vs Beban per bulan dari buku besar (sorot bar untuk rincian).</p>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--muted)', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <i style={{ width: 10, height: 10, borderRadius: 3, background: '#0891b2', display: 'inline-block' }} /> Pendapatan
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <i style={{ width: 10, height: 10, borderRadius: 3, background: '#083344', display: 'inline-block' }} /> Beban
                  </span>
                </div>
              </div>
              <div style={{ padding: '0 24px 22px' }}>
                <TrenChart data={data.trenBulanan} />
              </div>
            </section>

            {/* Komposisi Simpanan */}
            <section className="table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Komposisi Simpanan</h2>
                  <p>Distribusi total saldo simpanan aktif.</p>
                </div>
              </div>
              <div style={{ padding: '8px 24px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DonutChart items={komposisiSimpanan} total={data.totalSimpanan} />
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
                  {komposisiSimpanan.map((k) => {
                    const percent = data.totalSimpanan > 0 ? ((k.value / data.totalSimpanan) * 100).toFixed(1) : '0'
                    return (
                      <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, gap: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <i style={{ width: 10, height: 10, borderRadius: 3, background: k.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{k.label}</span>
                          <span style={{ fontSize: 10.5, color: 'var(--muted)', background: '#ecfeff', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>{percent}%</span>
                        </span>
                        <strong style={{ flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(k.value)}</strong>
                      </div>
                    )
                  })}
                  {komposisiSimpanan.length === 0 && <small style={{ color: 'var(--muted)' }}>Belum ada saldo simpanan tercatat.</small>}
                </div>
              </div>
            </section>
          </div>

          {/* 3 Widgets: Neraca, SHU Terakhir, Tagihan Payroll */}
          <div className="dash-grid-3">
            {/* Kesehatan Neraca */}
            <section className="table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Kesehatan Neraca</h2>
                  <p>Posisi aset vs liabilitas & ekuitas</p>
                </div>
              </div>
              <div style={{ padding: '4px 24px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>Aset Koperasi</span>
                  <strong>{rupiah(data.totalAset)}</strong>
                </div>
                <div style={{ height: 8, borderRadius: 5, background: '#ecfeff', overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #0891b2, #22d3ee)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>Liabilitas + Ekuitas</span>
                  <strong>{rupiah(data.totalLiabilitas + data.totalEkuitas)}</strong>
                </div>
                <div style={{ height: 8, borderRadius: 5, background: '#dbe8ea', overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ width: data.totalAset > 0 ? `${Math.min(100, ((data.totalLiabilitas + data.totalEkuitas) / data.totalAset) * 100)}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #083344, #0e7490)' }} />
                </div>
                <div className={`alert ${Math.abs(data.selisihNeraca) < 1 ? 'success' : 'error'}`} style={{ margin: 0, padding: '9px 12px' }}>
                  {Math.abs(data.selisihNeraca) < 1 ? <BadgeCheck size={16} /> : <X size={16} />}
                  <span>{Math.abs(data.selisihNeraca) < 1 ? 'Neraca Seimbang (Rp 0 Selisih)' : `Selisih ${rupiah(data.selisihNeraca)}`}</span>
                </div>
                <button className="toggle-button" style={{ marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => goto('akuntansi', { akuntansiTab: 'neraca' })}>
                  <span>Buka Neraca Keuangan</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>

            {/* SHU Terakhir */}
            <section className="table-panel">
              <div className="panel-heading">
                <div>
                  <h2>SHU Terakhir</h2>
                  <p>Tahun buku terfinalisasi</p>
                </div>
              </div>
              <div style={{ padding: '4px 24px 22px' }}>
                {data.shuTerakhir ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#0891b2', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {data.shuTerakhir.tahun}
                      </div>
                      <span className="stat-card-chip positive">Final</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: 'var(--muted)' }}>Total SHU (Bruto)</span>
                      <strong>{rupiah(data.shuTerakhir.totalShu)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: 'var(--muted)' }}>Hak Neto Anggota</span>
                      <strong style={{ color: '#0891b2' }}>{rupiah(data.shuTerakhir.totalShuNeto)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Jumlah Penerima</span>
                      <strong>{data.shuTerakhir.jumlahAnggota} Anggota</strong>
                    </div>
                  </>
                ) : (
                  <div className="empty-state" style={{ padding: '24px 0' }}>Belum ada SHU difinalisasi.</div>
                )}
                <button className="toggle-button" style={{ marginTop: 6, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => goto('akuntansi', { akuntansiTab: 'shu' })}>
                  <span>Kelola Pembagian SHU</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>

            {/* Tagihan Anggota (Payroll) */}
            <section className="table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Tagihan Anggota (Payroll)</h2>
                  <p>Potongan gaji periode berjalan</p>
                </div>
              </div>
              <div style={{ padding: '4px 24px 22px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#142220', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 3 }}>
                  {rupiah(data.payrollTotalPeriodeIni)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                  {data.payrollJumlahAnggota} anggota dipotong gaji bulan ini
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>Tagihan kredit belum lunas</span>
                  <strong style={{ color: data.tagihanKreditBelumLunas > 0 ? '#c26919' : 'inherit' }}>
                    {rupiah(data.tagihanKreditBelumLunas)}
                  </strong>
                </div>
                <button className="toggle-button" style={{ marginTop: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => goto('anggota', { anggotaTab: 'payroll' })}>
                  <span>Buka Rekap Payroll</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
          </div>

          {/* Aktivitas Pengurus Realtime */}
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <h2>Aktivitas Pengurus Realtime</h2>
                <p>{data.auditHariIni} aktivitas tercatat hari ini di seluruh sistem.</p>
              </div>
              {isAdmin && (
                <button className="toggle-button" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => goto('audit')}>
                  <span>Audit Trail Lengkap</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
            <div style={{ padding: '0 24px 18px' }}>
              {data.aktivitasTerbaru.length === 0 && (
                <div className="empty-state">Belum ada aktivitas tercatat hari ini.</div>
              )}
              {data.aktivitasTerbaru.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--line-light)' : undefined,
                  }}
                >
                  <span className="avatar" style={{ flexShrink: 0 }}>
                    {a.pelakuNama.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 13 }}>{a.pelakuNama}</strong>
                      <span className={`role-pill ${
                        a.modul.toLowerCase().includes('simpan') ? 'emerald' :
                        a.modul.toLowerCase().includes('pinjam') ? 'amber' :
                        a.modul.toLowerCase().includes('akun') ? 'indigo' :
                        a.modul.toLowerCase().includes('katalog') ? 'cyan' : 'pengurus'
                      }`}>
                        {a.modul}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.ringkasan}
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 11.5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <Clock size={13} />
                    <span>{waktu(a.waktuUtc)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function TrenChart({ data }: { data: DashboardTren[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => Math.max(d.pendapatan, d.beban)))
  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null

  return (
    <div className="chart-modern-container">
      <div className="chart-tooltip-bar">
        {activeItem ? (
          <div className="chart-active-tooltip">
            <span className="tooltip-month">{activeItem.label}</span>
            <div className="tooltip-metrics">
              <span className="tooltip-metric">
                <span className="tooltip-dot tosca" />
                Pendapatan: <strong>{rupiah(activeItem.pendapatan)}</strong>
              </span>
              <span className="tooltip-metric">
                <span className="tooltip-dot dark" />
                Beban: <strong>{rupiah(activeItem.beban)}</strong>
              </span>
              <span className={`tooltip-metric net ${activeItem.labaBersih >= 0 ? 'surplus' : 'defisit'}`}>
                {activeItem.labaBersih >= 0 ? 'Surplus:' : 'Defisit:'} <strong>{rupiah(activeItem.labaBersih)}</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="chart-hint">
            <span>💡 Sorot kursor ke grafik bulan untuk melihat nominal rincian pendapatan & beban.</span>
          </div>
        )}
      </div>

      <div className="chart-bars-wrap">
        {data.map((d, i) => {
          const isHovered = hoveredIdx === i
          const pHeight = Math.max(4, (d.pendapatan / max) * 140)
          const bHeight = Math.max(4, (d.beban / max) * 140)
          return (
            <div
              key={d.label}
              className={`chart-bar-group ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="chart-bar-pillar">
                <div
                  className="chart-bar pendapatan"
                  style={{ height: `${pHeight}px` }}
                  title={`Pendapatan: ${rupiah(d.pendapatan)}`}
                />
                <div
                  className="chart-bar beban"
                  style={{ height: `${bHeight}px` }}
                  title={`Beban: ${rupiah(d.beban)}`}
                />
              </div>
              <span className={`chart-bar-label ${isHovered ? 'active' : ''}`}>{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  let acc = 0
  const stops = items.map((item) => {
    const start = total > 0 ? (acc / total) * 360 : 0
    acc += item.value
    const end = total > 0 ? (acc / total) * 360 : 0
    return `${item.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`
  })
  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : '#edf2f0'

  const formattedShort = total >= 1_000_000_000
    ? `${(total / 1_000_000_000).toFixed(1)} M`
    : total >= 1_000_000
    ? `${(total / 1_000_000).toFixed(1)} Jt`
    : rupiah(total)

  return (
    <div className="donut-chart-modern">
      <div className="donut-circle" style={{ background: gradient }}>
        <div className="donut-inner">
          <span className="donut-inner-label">Total Saldo</span>
          <strong className="donut-inner-val">{formattedShort}</strong>
        </div>
      </div>
    </div>
  )
}

type MenuTabItem<T extends string> = {
  key: T
  label: string
  icon?: ReactNode
  badge?: number
}

function MenuTabBar<T extends string>({
  tabs,
  active,
  onChange,
  className = '',
  style,
}: {
  tabs: MenuTabItem<T>[]
  active: T
  onChange: (key: T) => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`menu-tab-bar-wrap ${className}`.trim()} style={style}>
      <div className="menu-tab-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`menu-tab-btn ${active === t.key ? 'active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.icon && <span className="menu-tab-icon">{t.icon}</span>}
            <span>{t.label}</span>
            {Boolean(t.badge && t.badge > 0) && (
              <span className="menu-tab-badge">{t.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function AnggotaMenuView({
  token,
  onExpired,
  tab,
  setTab,
  pendingCount = 0,
}: {
  token: string
  onExpired: () => void
  tab: AnggotaTab
  setTab: (t: AnggotaTab) => void
  pendingCount?: number
}) {
  return <>
    <MenuTabBar tabs={[
      { key: 'pendaftaran', label: 'Pendaftaran', icon: <UserPlus size={15} />, badge: pendingCount },
      { key: 'direktori', label: 'Direktori Anggota', icon: <Users size={15} /> },
      { key: 'payroll', label: 'Tagihan Anggota', icon: <Receipt size={15} /> },
    ]} active={tab} onChange={setTab} />
    {tab === 'pendaftaran' && <PendaftaranView token={token} onExpired={onExpired} />}
    {tab === 'direktori' && <AnggotaDirektoriView token={token} onExpired={onExpired} />}
    {tab === 'payroll' && <PayrollView token={token} onExpired={onExpired} />}
  </>
}

function SimpanPinjamView({
  token,
  onExpired,
  isAdmin,
  tab,
  setTab,
  simpananPending = 0,
  pinjamanPending = 0,
}: {
  token: string
  onExpired: () => void
  isAdmin: boolean
  tab: SimpanPinjamTab
  setTab: (t: SimpanPinjamTab) => void
  simpananPending?: number
  pinjamanPending?: number
}) {
  return <>
    <MenuTabBar tabs={[
      { key: 'simpanan', label: 'Simpanan', icon: <PiggyBank size={15} />, badge: simpananPending > 0 ? simpananPending : undefined },
      { key: 'pinjaman', label: 'Pinjaman', icon: <Banknote size={15} />, badge: pinjamanPending > 0 ? pinjamanPending : undefined },
    ]} active={tab} onChange={setTab} />
    {tab === 'simpanan' && <SavingsView token={token} onExpired={onExpired} isAdmin={isAdmin} />}
    {tab === 'pinjaman' && <LoansView token={token} onExpired={onExpired} />}
  </>
}

function PendaftaranView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/anggota/pendaftaran`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal memuat pendaftaran anggota.')
      setPendaftaran(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired])
  useEffect(() => { void load() }, [load])

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
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memproses pendaftaran.') }
    finally { setBusyId(0) }
  }
  const pendingPendaftaran = pendaftaran.filter((item) => item.statusKeanggotaan === 'MenungguPersetujuan')

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Pendaftaran anggota baru</h2><p>Menyetujui akan mengaktifkan akun dan mengkreditkan Simpanan Pokok otomatis.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid"><StatCard label="Menunggu persetujuan" value={pendingPendaftaran.length} icon={<UserPlus size={20} />} tone="amber" /><StatCard label="Total pengajuan" value={pendaftaran.length} icon={<Users size={20} />} tone="teal" /></section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Pengajuan keanggotaan</h2><p>Anggota mendaftar lewat aplikasi; setujui untuk mengaktifkan akun.</p></div><span className="record-count">{pendingPendaftaran.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Calon anggota</th><th>NIK</th><th>Email</th><th>Daftar</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pendaftaran.map((calon) => <tr key={calon.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{calon.namaLengkap.charAt(0).toUpperCase()}</span><strong>{calon.namaLengkap}</strong></div></td>
          <td className="mono">{calon.nomorIndukKaryawan}</td>
          <td>{calon.email ?? '—'}</td>
          <td>{tanggal(calon.dibuatPada)}</td>
          <td><span className={`status-pill ${calon.statusKeanggotaan === 'MenungguPersetujuan' ? 'waiting' : 'rejected'}`}><i />{calon.statusKeanggotaan === 'MenungguPersetujuan' ? 'Menunggu' : 'Ditolak'}</span></td>
          <td className="align-right">{calon.statusKeanggotaan === 'MenungguPersetujuan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === calon.id} onClick={() => void decidePendaftaran(calon, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === calon.id} onClick={() => void decidePendaftaran(calon, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>—</small>}</td>
        </tr>)}
      </tbody></table>{!loading && pendaftaran.length === 0 && <div className="empty-state"><UserCheck size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Tidak ada pendaftaran anggota baru.</div></div>}</div>
    </section>
  </div>
}

function AnggotaDirektoriView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [anggota, setAnggota] = useState<AnggotaDirektoriItem[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/anggota/direktori`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal memuat direktori anggota.')
      setAnggota(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired])
  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => anggota.filter((item) => {
    const needle = query.toLowerCase()
    const matchesQuery = !needle || [item.namaLengkap, item.nomorIndukKaryawan, item.email ?? ''].some((value) => value.toLowerCase().includes(needle))
    const matchesRole = roleFilter === 'all' || item.peran === roleFilter
    return matchesQuery && matchesRole
  }), [anggota, query, roleFilter])

  const totalSimpananSemua = anggota.reduce((sum, item) => sum + item.totalSimpanan, 0)

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Direktori anggota</h2><p>Daftar anggota aktif beserta total saldo simpanan. Klik satu baris untuk melihat rincian lengkap.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    <section className="stat-grid">
      <StatCard label="Anggota aktif" value={anggota.length} icon={<Users size={20} />} tone="teal" />
      <StatCard label="Total simpanan seluruh anggota" value={totalSimpananSemua} icon={<PiggyBank size={20} />} tone="green" money />
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Daftar anggota</h2><p>Total simpanan = pokok + wajib + sukarela + berjangka aktif.</p></div><span className="record-count">{filtered.length} data</span></div>
      <div className="filters">
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, NIK, atau email..." />
          {query && <button className="icon-button" style={{ padding: 4 }} onClick={() => setQuery('')}><X size={14} /></button>}
        </label>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Semua Peran</option>
          <option value="Anggota">Anggota</option>
          <option value="Pengurus">Pengurus</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Peran</th><th className="align-right">Total simpanan</th><th>Bergabung</th></tr></thead><tbody>
        {filtered.map((item) => <tr key={item.id} className="clickable-row" onClick={() => setSelectedId(item.id)}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaLengkap.charAt(0).toUpperCase()}</span><div><strong>{item.namaLengkap}</strong><small>{item.email ?? 'Email belum diisi'}</small></div></div></td>
          <td className="mono">{item.nomorIndukKaryawan}</td>
          <td><span className={`role-pill ${item.peran.toLowerCase()}`}>{item.peran}</span></td>
          <td className="align-right" style={{ fontWeight: 700, color: '#083344' }}>{rupiah(item.totalSimpanan)}</td>
          <td>{tanggal(item.dibuatPada)}</td>
        </tr>)}
      </tbody></table>{!loading && filtered.length === 0 && <div className="empty-state">Tidak ada anggota yang cocok dengan pencarian.</div>}</div>
    </section>

    {selectedId !== null && <AnggotaDetailModal id={selectedId} token={token} onExpired={onExpired} onClose={() => setSelectedId(null)} />}
  </div>
}

function AnggotaDetailModal({ id, token, onExpired, onClose }: { id: number; token: string; onExpired: () => void; onClose: () => void }) {
  const [detail, setDetail] = useState<AnggotaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let batal = false
    setLoading(true); setError(''); setDetail(null)
    fetch(`${API_BASE}/api/admin/anggota/${id}/detail`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) { onExpired(); return }
        if (!response.ok) throw new Error('Gagal memuat detail anggota.')
        const data = await response.json()
        if (!batal) setDetail(data)
      })
      .catch((requestError) => { if (!batal) setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') })
      .finally(() => { if (!batal) setLoading(false) })
    return () => { batal = true }
  }, [id, token, onExpired])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        {loading && <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Memuat detail anggota…</div>}
        {error && <div className="alert error" style={{ margin: 20 }}><X size={17} />{error}</div>}
        {detail && (
          <>
            <div className="modal-profile-header">
              <div className="modal-profile-info">
                <span className="modal-avatar">{detail.namaLengkap.charAt(0).toUpperCase()}</span>
                <div className="modal-profile-text">
                  <h2>{detail.namaLengkap}</h2>
                  <div className="modal-chips-row">
                    <span className="mono" style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                      NIK {detail.nomorIndukKaryawan}
                    </span>
                    <span className={`role-pill ${detail.peran.toLowerCase()}`}>{detail.peran}</span>
                    <span className={`status-pill ${detail.aktif ? 'active' : 'inactive'}`}>
                      <i />{detail.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="modal-contacts-row">
                    <span className="modal-contact-item">
                      <Mail size={13} /> {detail.email ?? 'Email belum diisi'}
                    </span>
                    <span className="modal-contact-item">
                      <Phone size={13} /> {detail.nomorTelepon ?? 'Telepon belum diisi'}
                    </span>
                    {detail.alamat && (
                      <span className="modal-contact-item">
                        <MapPin size={13} /> {detail.alamat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div className="modal-section-title"><Wallet size={16} /> Komponen simpanan</div>
              <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatCard label="Simpanan Pokok" value={detail.saldoPokok} icon={<PiggyBank size={18} />} tone="teal" money />
                <StatCard label="Simpanan Wajib" value={detail.saldoWajib} icon={<PiggyBank size={18} />} tone="blue" money />
                <StatCard label="Simpanan Sukarela" value={detail.saldoSukarela} icon={<PiggyBank size={18} />} tone="amber" money />
                <StatCard label="Total simpanan" value={detail.totalSimpanan} icon={<Wallet size={18} />} tone="green" money />
              </div>

              {detail.berjangka.length > 0 && (
                <>
                  <div className="modal-section-title"><Clock size={16} /> Simpanan Berjangka</div>
                  <div className="table-scroll" style={{ marginBottom: 24 }}>
                    <table>
                      <thead><tr><th>No. Sertifikat</th><th>Produk</th><th className="align-right">Nominal</th><th>Tenor</th><th>Status</th><th>Jatuh tempo</th></tr></thead>
                      <tbody>
                        {detail.berjangka.map((b) => (
                          <tr key={b.nomorSertifikat}>
                            <td className="mono">{b.nomorSertifikat}</td><td>{b.produkNama}</td>
                            <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(b.nominal)}</td><td>{b.tenorBulan} bln</td>
                            <td><span className={`status-pill ${b.status === 'Aktif' ? 'active' : ''}`}><i />{b.status}</span></td>
                            <td>{b.tanggalJatuhTempo ? tanggal(b.tanggalJatuhTempo) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="modal-section-title"><Banknote size={16} /> Riwayat pinjaman</div>
              <div className="table-scroll" style={{ marginBottom: 24 }}>
                <table>
                  <thead><tr><th>No. Pinjaman</th><th className="align-right">Pokok</th><th className="align-right">Sisa</th><th>Angsuran</th><th>Status</th><th>Mulai</th></tr></thead>
                  <tbody>
                    {detail.pinjaman.map((p) => (
                      <tr key={p.nomorPinjaman}>
                        <td className="mono">{p.nomorPinjaman}</td>
                        <td className="align-right">{rupiah(p.pokok)}</td>
                        <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(p.sisaPokok)}</td>
                        <td>{p.angsuranTerbayar}/{p.tenorBulan}</td>
                        <td><span className={`status-pill ${p.status === 'Lunas' ? 'active' : (p.status === 'Aktif' ? 'active' : 'inactive')}`}><i />{p.status}</span></td>
                        <td>{tanggal(p.tanggalMulai)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {detail.pinjaman.length === 0 && <div className="empty-state">Belum pernah mengajukan pinjaman.</div>}
              </div>

              <div className="modal-section-title"><Store size={16} /> Riwayat belanja katalog</div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>No. Transaksi</th><th>Produk</th><th>Jenis</th><th className="align-right">Total</th><th>Metode</th><th>Status</th><th>Tanggal</th></tr></thead>
                  <tbody>
                    {detail.belanja.map((b) => (
                      <tr key={b.nomorTransaksi}>
                        <td className="mono">{b.nomorTransaksi}</td><td>{b.produkNama}</td><td>{b.jenis}</td>
                        <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(b.total)}</td><td>{b.metodePembayaran}</td>
                        <td><span className={`status-pill ${b.status === 'Selesai' ? 'active' : ''}`}><i />{b.status}</span></td>
                        <td>{tanggal(b.diajukanPada)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {detail.belanja.length === 0 && <div className="empty-state">Belum pernah berbelanja di katalog.</div>}
              </div>
              {detail.totalTagihanKreditBelum > 0 && (
                <div className="alert error" style={{ marginTop: 18, color: '#9a3412', background: '#fff7ed', borderColor: '#fed7aa' }}>
                  <HandCoins size={17} />
                  <span>Tagihan kredit belum lunas: <strong>{rupiah(detail.totalTagihanKreditBelum)}</strong></span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function UserDetailModal({
  user,
  onClose,
  onToggleStatus,
  onUbahPeran,
  onResetAkses,
  busy,
  resetInfo,
}: {
  user: AdminUser
  onClose: () => void
  onToggleStatus: (user: AdminUser) => Promise<void>
  onUbahPeran: (user: AdminUser, role: string) => Promise<void>
  onResetAkses: (user: AdminUser) => Promise<void>
  busy: boolean
  resetInfo: { nama: string; password: string } | null
}) {
  const [copied, setCopied] = useState(false)
  const isThisReset = resetInfo && resetInfo.nama === user.namaLengkap

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-profile-header">
          <div className="modal-profile-info">
            <span className="modal-avatar">{user.namaLengkap.charAt(0).toUpperCase()}</span>
            <div className="modal-profile-text">
              <h2>{user.namaLengkap}</h2>
              <div className="modal-chips-row">
                <span className="mono" style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  NIK {user.nomorIndukKaryawan}
                </span>
                <span className={`role-pill ${user.peran.toLowerCase()}`}>{user.peran}</span>
                <span className={`status-pill ${user.aktif ? 'active' : 'inactive'}`}>
                  <i />{user.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="modal-contacts-row">
                <span className="modal-contact-item">
                  <Mail size={13} /> {user.email ?? 'Email belum diisi'}
                </span>
                <span className="modal-contact-item">
                  <Clock size={13} /> Terdaftar: {tanggal(user.dibuatPada)}
                </span>
              </div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {isThisReset && (
            <div className="alert success" style={{ marginBottom: 18, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={18} />
                <div>
                  Password Sementara: <strong className="mono" style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, marginLeft: 4 }}>{resetInfo.password}</strong>
                </div>
              </div>
              <button className="toggle-button" onClick={() => handleCopy(resetInfo.password)}>
                {copied ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />} {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          )}

          <div className="modal-section-title"><UserCog size={16} /> Informasi Akun & Akses</div>
          <div className="audit-detail-grid">
            <div className="audit-meta-card">
              <span className="audit-meta-label">ID Akun</span>
              <span className="audit-meta-val mono">#{user.id}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Nomor Induk (NIK)</span>
              <span className="audit-meta-val mono">{user.nomorIndukKaryawan}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Status Keanggotaan</span>
              <span className="audit-meta-val">{user.statusKeanggotaan || 'Anggota'}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Status Login</span>
              <span className="audit-meta-val" style={{ color: user.aktif ? '#059669' : '#dc2626' }}>
                {user.aktif ? 'Aktif (Dapat Mengakses)' : 'Nonaktif (Diblokir)'}
              </span>
            </div>
          </div>

          <div className="modal-section-title" style={{ marginTop: 24 }}><ShieldCheck size={16} /> Tindakan Pengelolaan</div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Ubah Peran Pengguna</strong>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>Tentukan hak akses pengguna ini pada sistem koperasi.</p>
              </div>
              <select
                value={user.peran}
                disabled={busy}
                onChange={(e) => void onUbahPeran(user, e.target.value)}
                style={{ height: 34, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, background: '#fff', fontWeight: 600 }}
              >
                <option value="Admin">Admin</option>
                <option value="Pengurus">Pengurus</option>
                <option value="Anggota">Anggota</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Reset Kata Sandi</strong>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>Buat kata sandi sementara baru untuk pengguna.</p>
              </div>
              <button className="toggle-button" disabled={busy} onClick={() => void onResetAkses(user)}>
                <KeyRound size={13} style={{ marginRight: 4 }} /> Reset Akses
              </button>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Status Akses Akun</strong>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>
                  {user.aktif ? 'Akun saat ini aktif dan dapat masuk.' : 'Akun sedang dinonaktifkan / ditangguhkan.'}
                </p>
              </div>
              <button
                className={`toggle-button ${user.aktif ? 'deactivate' : 'activate'}`}
                disabled={busy}
                onClick={() => void onToggleStatus(user)}
              >
                {user.aktif ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AkunView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resetInfo, setResetInfo] = useState<{ nama: string; password: string } | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error(response.status === 403 ? 'Hanya Admin yang bisa mengelola akun.' : 'Gagal memuat pengguna.')
      setUsers(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired])
  useEffect(() => { void loadUsers() }, [loadUsers])

  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

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
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Status pengguna gagal diperbarui.')
      setUsers((current) => current.map((item) => item.id === data.id ? data : item))
      if (selectedUser?.id === data.id) setSelectedUser(data)
      flash(`${data.namaLengkap} sekarang ${data.aktif ? 'aktif' : 'nonaktif'}.`)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memperbarui status.') }
  }

  const ubahPeran = async (user: AdminUser, peranBaru: string) => {
    if (peranBaru === user.peran) return
    if (!window.confirm(`Ubah peran ${user.namaLengkap} dari ${user.peran} menjadi ${peranBaru}?`)) return
    setBusyId(user.id); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna/${user.id}/peran`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ peran: peranBaru }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengubah peran.')
      setUsers((current) => current.map((item) => item.id === data.id ? data : item))
      if (selectedUser?.id === data.id) setSelectedUser(data)
      flash(`Peran ${data.namaLengkap} sekarang ${data.peran}.`)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal mengubah peran.') }
    finally { setBusyId(0) }
  }

  const resetAkses = async (user: AdminUser) => {
    if (!window.confirm(`Reset password ${user.namaLengkap}? Password lama tidak berlaku lagi.`)) return
    setBusyId(user.id); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna/${user.id}/reset-akses`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal mereset akses.')
      setResetInfo({ nama: user.namaLengkap, password: data.passwordSementara })
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal mereset akses.') }
    finally { setBusyId(0) }
  }

  const [importBusy, setImportBusy] = useState(false)
  const [importResult, setImportResult] = useState<{ diperbarui: number; dilewati: string[]; galat: string[] } | null>(null)

  const exportCsv = async () => {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/pengguna/ekspor`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal mengekspor data anggota.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `anggota-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal mengekspor data anggota.') }
  }

  const importCsv = async (file: File) => {
    setImportBusy(true); setError(''); setImportResult(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/pengguna/impor`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor file.')
      setImportResult({ diperbarui: data.diperbarui ?? 0, dilewati: data.dilewati ?? [], galat: data.galat ?? [] })
      flash(data.message ?? 'Impor selesai.')
      await loadUsers()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal mengimpor file.') }
    finally { setImportBusy(false) }
  }

  return (
    <div className="content-wrap">
      <section className="welcome-row">
        <div>
          <h2>Akun & peran pengguna</h2>
          <p>Operasional teknis sistem — kelola akses masuk, peran admin/pengurus, reset kata sandi, dan sinkronisasi data massal.</p>
        </div>
        <div className="sync-label">
          <Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'}
          <button className="icon-button" onClick={() => void loadUsers()} title="Muat ulang"><RefreshCw size={16} /></button>
        </div>
      </section>

      {error && <div className="alert error"><X size={17} />{error}</div>}
      {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
      {resetInfo && (
        <div className="alert success" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={17} />
            <div>
              Password sementara untuk <strong>{resetInfo.nama}</strong>: <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 5, fontWeight: 700 }}>{resetInfo.password}</code> — segera sampaikan kepada pengguna.
            </div>
          </div>
          <button className="toggle-button" onClick={() => setResetInfo(null)}>Tutup</button>
        </div>
      )}

      <section className="stat-grid">
        <StatCard label="Total pengguna" value={users.length} icon={<Users size={20} />} tone="teal" />
        <StatCard label="Pengguna aktif" value={activeCount} icon={<BadgeCheck size={20} />} tone="green" />
        <StatCard label="Peran terdaftar" value={roles.length} icon={<Database size={20} />} tone="blue" />
      </section>

      <section className="table-panel" style={{ marginBottom: 22 }}>
        <div className="panel-heading">
          <div>
            <h2>Integrasi & Pengelolaan Data Massal (CSV)</h2>
            <p>Ekspor database anggota atau perbarui banyak profil anggota sekaligus lewat berkas spreadsheet CSV.</p>
          </div>
        </div>
        <div className="admin-import-grid">
          <div className="admin-action-box">
            <div>
              <h4><Download size={16} style={{ color: '#0891b2' }} /> Ekspor Data Anggota</h4>
              <p>Unduh berkas CSV berisi seluruh data pengguna dan anggota koperasi untuk arsip atau analisa eksternal.</p>
            </div>
            <div>
              <button className="toggle-button activate" onClick={() => void exportCsv()}>
                <Download size={13} style={{ marginRight: 5 }} /> Unduh Berkas CSV
              </button>
            </div>
          </div>

          <div className="admin-action-box">
            <div>
              <h4><Upload size={16} style={{ color: '#0891b2' }} /> Pembaruan Massal via CSV</h4>
              <p>Unggah berkas CSV yang telah diperbarui. Data anggota dicocokkan otomatis berdasarkan kolom <strong>NIK</strong>.</p>
              <small style={{ color: 'var(--muted)', display: 'block', marginTop: 4, fontSize: 11 }}>
                Format kolom: NIK, Nama, Email, Telepon, Alamat, Peran, StatusKeanggotaan, Aktif.
              </small>
            </div>
            <div>
              <label className="toggle-button" style={{ cursor: importBusy ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                <Upload size={13} style={{ marginRight: 5 }} /> {importBusy ? 'Mengunggah...' : 'Pilih & Impor CSV'}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  disabled={importBusy}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCsv(f); e.target.value = '' }}
                />
              </label>
            </div>
          </div>
        </div>

        {importResult && (
          <div style={{ padding: '0 25px 18px', fontSize: 12, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink)' }}>{importResult.diperbarui} anggota berhasil diperbarui.</strong>
            {importResult.dilewati.length > 0 && <div style={{ marginTop: 2 }}>NIK tidak ditemukan (dilewati): {importResult.dilewati.join(', ')}</div>}
            {importResult.galat.length > 0 && <div style={{ color: '#dc2626', marginTop: 2 }}>{importResult.galat.join(' · ')}</div>}
          </div>
        )}
      </section>

      <section className="table-panel" id="user-table">
        <div className="panel-heading">
          <div>
            <h2>Daftar pengguna & hak akses</h2>
            <p>Klik salah satu baris pengguna untuk melihat rincian akun, mengganti peran, atau mereset sandi.</p>
          </div>
          <span className="record-count">{filteredUsers.length} akun</span>
        </div>
        <div className="filters">
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama pengguna, NIK, atau email..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">Semua peran</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
        <div className="table-scroll table-compact">
          <table>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>NIK</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th className="align-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="tr-interactive" onClick={() => setSelectedUser(user)}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar">{user.namaLengkap.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{user.namaLengkap}</strong>
                        <small className="cell-truncate" style={{ maxWidth: 200 }}>{user.email ?? 'Email belum diisi'}</small>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{user.nomorIndukKaryawan}</td>
                  <td>
                    <select
                      value={user.peran}
                      disabled={busyId === user.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => void ubahPeran(user, e.target.value)}
                      style={{ height: 28, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11, background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Pengurus">Pengurus</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-pill ${user.aktif ? 'active' : 'inactive'}`}>
                      <i />{user.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>{tanggal(user.dibuatPada)}</td>
                  <td className="align-right">
                    <span style={{ display: 'inline-flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button className="toggle-button" onClick={() => setSelectedUser(user)} title="Lihat rincian pengguna">
                        <Eye size={12} /> Detail
                      </button>
                      <button className="toggle-button" disabled={busyId === user.id} onClick={() => void resetAkses(user)} title="Reset kata sandi">
                        <KeyRound size={12} /> Reset
                      </button>
                      <button
                        className={`toggle-button ${user.aktif ? 'deactivate' : 'activate'}`}
                        disabled={busyId === user.id}
                        onClick={() => void toggleUser(user)}
                      >
                        {user.aktif ? 'Nonaktif' : 'Aktifkan'}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && <div className="empty-state">Tidak ada pengguna yang cocok dengan filter.</div>}
        </div>
      </section>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={toggleUser}
          onUbahPeran={ubahPeran}
          onResetAkses={resetAkses}
          busy={busyId === selectedUser.id}
          resetInfo={resetInfo}
        />
      )}
    </div>
  )
}

const AUDIT_MODUL_LABEL: Record<string, string> = {
  Akun: 'Akun', Pendaftaran: 'Pendaftaran', Pinjaman: 'Pinjaman', Simpanan: 'Simpanan',
  Katalog: 'Katalog', ERAT: 'E-RAT', Akuntansi: 'Akuntansi', SHU: 'SHU', Konfigurasi: 'Konfigurasi',
}

function AuditDetailModal({ item, onClose }: { item: AuditLogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  let parsedDetail: Record<string, unknown> | null = null
  if (item.detail) {
    try {
      const obj = JSON.parse(item.detail)
      if (typeof obj === 'object' && obj !== null) parsedDetail = obj
    } catch {
      parsedDetail = null
    }
  }

  const handleCopy = () => {
    const textToCopy = item.detail ? (parsedDetail ? JSON.stringify(parsedDetail, null, 2) : item.detail) : item.ringkasan
    void navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-profile-header">
          <div className="modal-profile-info">
            <span className="modal-avatar" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
              <Fingerprint size={24} />
            </span>
            <div className="modal-profile-text">
              <h2>Rincian Aktivitas Aplikasi</h2>
              <div className="modal-chips-row">
                <span className="mono" style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  Log #{item.id}
                </span>
                <span className="role-pill pengurus">{AUDIT_MODUL_LABEL[item.modul] ?? item.modul}</span>
                <span className="mono" style={{ fontSize: 11, background: '#ecfeff', color: '#0891b2', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {item.aksi}
                </span>
              </div>
              <div className="modal-contacts-row">
                <span className="modal-contact-item"><Clock size={13} /> {waktu(item.waktuUtc)}</span>
                <span className="modal-contact-item"><ShieldCheck size={13} /> IP: {item.alamatIp ?? '127.0.0.1 (Lokal)'}</span>
              </div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-section-title"><Info size={16} /> Informasi Pelaku & Modul</div>
          <div className="audit-detail-grid">
            <div className="audit-meta-card">
              <span className="audit-meta-label">Nama Pelaku</span>
              <span className="audit-meta-val">{item.pelakuNama}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Hak Akses / Peran</span>
              <span className="audit-meta-val">{item.pelakuPeran}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Modul Sistem</span>
              <span className="audit-meta-val">{AUDIT_MODUL_LABEL[item.modul] ?? item.modul}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">ID Entitas Terkait</span>
              <span className="audit-meta-val mono">{item.entitasId ? `#${item.entitasId}` : '—'}</span>
            </div>
          </div>

          <div className="modal-section-title"><FileText size={16} /> Ringkasan Aktivitas</div>
          <div className="audit-summary-box">
            <Info size={18} />
            <div>{item.ringkasan}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px' }}>
            <div className="modal-section-title" style={{ margin: 0 }}><Database size={16} /> Data Payload / Perubahan</div>
            {item.detail && (
              <div style={{ display: 'flex', gap: 8 }}>
                {parsedDetail && (
                  <button className="toggle-button" onClick={() => setShowRaw((v) => !v)}>
                    {showRaw ? 'Tampilan Rapi' : 'Lihat Raw JSON'}
                  </button>
                )}
                <button className="toggle-button" onClick={handleCopy}>
                  {copied ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin JSON'}
                </button>
              </div>
            )}
          </div>

          {item.detail ? (
            parsedDetail && !showRaw ? (
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
                <table className="diff-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Nama Parameter</th>
                      <th>Nilai Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(parsedDetail).map(([key, val]) => (
                      <tr key={key}>
                        <td className="mono" style={{ fontWeight: 600, color: '#083344' }}>{key}</td>
                        <td className="mono" style={{ color: typeof val === 'number' ? '#0891b2' : typeof val === 'boolean' ? '#9333ea' : '#334155' }}>
                          {val === null ? <em style={{ color: '#94a3b8' }}>null</em> : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="audit-code-box">
                {parsedDetail ? JSON.stringify(parsedDetail, null, 2) : item.detail}
              </pre>
            )
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1', color: 'var(--muted)', fontSize: 12.5 }}>
              Tidak ada data payload tambahan yang direkam untuk aktivitas ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AuditTrailView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [data, setData] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [halaman, setHalaman] = useState(1)
  const ukuran = 30
  const [modulList, setModulList] = useState<string[]>([])
  const [modulFilter, setModulFilter] = useState('')
  const [cari, setCari] = useState('')
  const [dari, setDari] = useState('')
  const [sampai, setSampai] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'aplikasi' | 'database'>('aplikasi')
  const [selectedAudit, setSelectedAudit] = useState<AuditLogEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ halaman: String(halaman), ukuran: String(ukuran) })
      if (modulFilter) params.set('modul', modulFilter)
      if (cari.trim()) params.set('cari', cari.trim())
      if (dari) params.set('dari', new Date(dari).toISOString())
      if (sampai) params.set('sampai', new Date(`${sampai}T23:59:59`).toISOString())
      const [logResponse, modulResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/audit-log?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/audit-log/modul`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (logResponse.status === 401 || modulResponse.status === 401) { onExpired(); return }
      if (!logResponse.ok) throw new Error(logResponse.status === 403 ? 'Hanya Admin yang bisa melihat audit trail.' : 'Gagal memuat audit trail.')
      const payload = await logResponse.json()
      setData(payload.data); setTotal(payload.total)
      if (modulResponse.ok) setModulList(await modulResponse.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired, halaman, modulFilter, cari, dari, sampai])
  useEffect(() => { void load() }, [load])

  const totalHalaman = Math.max(1, Math.ceil(total / ukuran))
  const terapkanFilter = () => { setHalaman(1); void load() }
  const resetFilter = () => { setCari(''); setModulFilter(''); setDari(''); setSampai(''); setHalaman(1) }

  return (
    <div className="content-wrap audit-wrap">
      <section className="welcome-row">
        <div>
          <h2>Audit trail & pengawasan</h2>
          <p>Jejak digital setiap perubahan data sensitif & keputusan operasional sistem — untuk transparansi, akuntabilitas, dan keamanan.</p>
        </div>
        <div className="sync-label">
          <Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'}
          <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button>
        </div>
      </section>

      <div className="menu-tab-bar-wrap inline">
        <div className="menu-tab-bar">
          <button className={`menu-tab-btn ${tab === 'aplikasi' ? 'active' : ''}`} onClick={() => setTab('aplikasi')}>
            <Fingerprint size={16} /> <span>Aktivitas Aplikasi</span>
          </button>
          <button className={`menu-tab-btn ${tab === 'database' ? 'active' : ''}`} onClick={() => setTab('database')}>
            <Database size={16} /> <span>Log Database (Mentah)</span>
          </button>
        </div>
      </div>

      {tab === 'database' ? (
        <DbAuditLogPanel token={token} onExpired={onExpired} />
      ) : (
        <>
          {error && <div className="alert error"><X size={17} />{error}</div>}
          <section className="stat-grid">
            <StatCard label="Total tercatat" value={total} icon={<Fingerprint size={20} />} tone="teal" />
            <StatCard label="Modul terpantau" value={modulList.length} icon={<Database size={20} />} tone="blue" />
          </section>
          <p style={{ margin: '-8px 0 14px', fontSize: 12, color: 'var(--muted)' }}>
            Dicatat otomatis oleh sistem pada setiap aksi melalui admin console. Data bersifat permanen dan tidak dapat diubah dari antarmuka.
          </p>

          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <h2>Riwayat aktivitas sistem</h2>
                <p>Klik salah satu baris untuk melihat rincian aktivitas dan data payload lengkap.</p>
              </div>
              <span className="record-count">{total} catatan</span>
            </div>
            <div className="filters" style={{ flexWrap: 'wrap', gap: 8 }}>
              <label className="search-box" style={{ minWidth: 210, height: 35 }}>
                <Search size={15} />
                <input value={cari} onChange={(e) => setCari(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && terapkanFilter()} placeholder="Cari ringkasan, pelaku, aksi..." />
              </label>
              <select value={modulFilter} onChange={(e) => { setModulFilter(e.target.value); setHalaman(1) }} style={{ height: 35, minWidth: 130, fontSize: 11.5 }}>
                <option value="">Semua modul</option>
                {modulList.map((m) => <option key={m} value={m}>{AUDIT_MODUL_LABEL[m] ?? m}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--muted)' }}>
                Dari
                <input type="date" value={dari} onChange={(e) => { setDari(e.target.value); setHalaman(1) }} style={{ height: 35, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11.5 }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--muted)' }}>
                Sampai
                <input type="date" value={sampai} onChange={(e) => { setSampai(e.target.value); setHalaman(1) }} style={{ height: 35, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11.5 }} />
              </label>
              <button className="toggle-button activate" style={{ height: 35, padding: '0 12px' }} onClick={terapkanFilter}>Terapkan</button>
              {(cari || modulFilter || dari || sampai) && (
                <button className="toggle-button" style={{ height: 35, padding: '0 10px' }} onClick={resetFilter}>Reset</button>
              )}
            </div>

            <div className="table-scroll table-compact">
              <table className="audit-compact-table">
                <colgroup>
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '48%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Pelaku</th>
                    <th>Aktivitas</th>
                    <th>Ringkasan</th>
                    <th className="align-right">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="tr-interactive" onClick={() => setSelectedAudit(item)}>
                      <td>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 11.5 }}>{tanggal(item.waktuUtc)}</span>
                          <span style={{ display: 'block', color: 'var(--muted)', fontSize: 10.5, marginTop: 2 }}>
                            {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.waktuUtc.endsWith('Z') ? item.waktuUtc : `${item.waktuUtc}Z`))} WIB
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell" style={{ gap: 7 }}>
                          <span className="avatar" style={{ width: 26, height: 26, flex: '0 0 26px', fontSize: 10.5, borderRadius: 6 }}>
                            {item.pelakuNama.charAt(0).toUpperCase()}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>{item.pelakuNama}</strong>
                            <small style={{ fontSize: 10.5, marginTop: 2, color: 'var(--muted)', lineHeight: 1.2 }}>{item.pelakuPeran}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                          <span className="role-pill pengurus" style={{ fontSize: 9.5, padding: '2px 6px', lineHeight: 1.2 }}>
                            {AUDIT_MODUL_LABEL[item.modul] ?? item.modul}
                          </span>
                          <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: '#083344', background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, lineHeight: 1.3 }}>
                            {item.aksi}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: 11.5,
                            lineHeight: 1.45,
                            color: '#334155',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}
                          title={item.ringkasan}
                        >
                          {item.ringkasan}
                        </div>
                      </td>
                      <td className="align-right">
                        <button
                          className="toggle-button"
                          style={{ padding: '5px 9px', fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedAudit(item) }}
                          title="Buka rincian aktivitas"
                        >
                          <Eye size={11} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && data.length === 0 && <div className="empty-state">Belum ada aktivitas tercatat untuk filter ini.</div>}
            </div>

            {totalHalaman > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '14px 0' }}>
                <button className="toggle-button" disabled={halaman <= 1} onClick={() => setHalaman((h) => h - 1)}>Sebelumnya</button>
                <small style={{ color: 'var(--muted)' }}>Halaman {halaman} / {totalHalaman}</small>
                <button className="toggle-button" disabled={halaman >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>Berikutnya</button>
              </div>
            )}
          </section>

          {selectedAudit && (
            <AuditDetailModal item={selectedAudit} onClose={() => setSelectedAudit(null)} />
          )}
        </>
      )}
    </div>
  )
}

function DbAuditDetailModal({ item, onClose }: { item: DbAuditLogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')

  const parseJson = (str: string | null): Record<string, unknown> | null => {
    if (!str) return null
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object' && parsed !== null ? parsed : null
    } catch {
      return null
    }
  }

  const dataSebelumObj = parseJson(item.dataSebelum)
  const dataSesudahObj = parseJson(item.dataSesudah)

  const allKeys = Array.from(new Set([
    ...(dataSebelumObj ? Object.keys(dataSebelumObj) : []),
    ...(dataSesudahObj ? Object.keys(dataSesudahObj) : []),
  ]))

  const handleCopy = () => {
    const payload = {
      id: item.id,
      tabel: item.tabel,
      operasi: item.operasi,
      kunciPrimer: item.kunciPrimer,
      waktuUtc: item.waktuUtc,
      dbLogin: item.dbLogin,
      sebelum: dataSebelumObj ?? item.dataSebelum,
      sesudah: dataSesudahObj ?? item.dataSesudah,
      hash: item.hash,
      prevHash: item.prevHash,
    }
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-profile-header">
          <div className="modal-profile-info">
            <span className="modal-avatar" style={{ background: 'linear-gradient(135deg, #083344 0%, #0891b2 100%)' }}>
              <Database size={24} />
            </span>
            <div className="modal-profile-text">
              <h2>Log Mutasi Basis Data (SQL Server)</h2>
              <div className="modal-chips-row">
                <span className="mono" style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  Log #{item.id}
                </span>
                <span className="mono" style={{ fontSize: 11, background: '#ecfeff', color: '#0891b2', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {item.tabel}
                </span>
                <span className={`op-pill ${item.operasi.toLowerCase()}`}>{item.operasi}</span>
                <span className="mono" style={{ fontSize: 11, background: '#f8fafc', padding: '3px 8px', borderRadius: 4 }}>
                  Kunci: {item.kunciPrimer}
                </span>
              </div>
              <div className="modal-contacts-row">
                <span className="modal-contact-item"><Clock size={13} /> {waktu(item.waktuUtc)}</span>
                <span className="modal-contact-item"><ShieldCheck size={13} /> DB: {item.dbLogin}</span>
                {item.hostName && <span className="modal-contact-item">Host: {item.hostName}</span>}
              </div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-section-title"><ShieldCheck size={16} /> Informasi Audit & Rantai Kriptografi</div>
          <div className="audit-detail-grid">
            <div className="audit-meta-card">
              <span className="audit-meta-label">Tabel Finansial</span>
              <span className="audit-meta-val mono">{item.tabel}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Operasi SQL</span>
              <span className="audit-meta-val"><span className={`op-pill ${item.operasi.toLowerCase()}`}>{item.operasi}</span></span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">DB Login</span>
              <span className="audit-meta-val">{item.dbLogin}</span>
            </div>
            <div className="audit-meta-card">
              <span className="audit-meta-label">Aplikasi Klien</span>
              <span className="audit-meta-val">{item.appName ?? 'SQL Server Direct'}</span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Integritas Rantai Hash (Immutable SHA-256)</span>
              <span className="status-pill active"><i />Rantai Valid</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
              <div>
                <strong style={{ color: '#475569', marginRight: 6 }}>Hash Baris Ini:</strong>
                <span className="hash-badge" title={item.hash}>{item.hash}</span>
              </div>
              <div>
                <strong style={{ color: '#475569', marginRight: 6 }}>Hash Sebelumnya:</strong>
                <span className="hash-badge" title={item.prevHash}>{item.prevHash || '00000000000000000000000000000000 (Genesis)'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px' }}>
            <div className="modal-section-title" style={{ margin: 0 }}><Activity size={16} /> Perubahan Data (Payload)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="toggle-button" onClick={() => setViewMode((m) => m === 'formatted' ? 'raw' : 'formatted')}>
                {viewMode === 'formatted' ? 'Tampilan Raw JSON' : 'Tampilan Komparasi'}
              </button>
              <button className="toggle-button" onClick={handleCopy}>
                {copied ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin Data'}
              </button>
            </div>
          </div>

          {viewMode === 'raw' ? (
            <div className="db-diff-container">
              <div className="db-diff-card">
                <div className="db-diff-header before"><span>Data Sebelum (Old)</span></div>
                <pre className="audit-code-box" style={{ borderRadius: 0, border: 0 }}>
                  {item.dataSebelum ? (dataSebelumObj ? JSON.stringify(dataSebelumObj, null, 2) : item.dataSebelum) : '— (Tidak ada / INSERT)'}
                </pre>
              </div>
              <div className="db-diff-card">
                <div className="db-diff-header after"><span>Data Sesudah (New)</span></div>
                <pre className="audit-code-box" style={{ borderRadius: 0, border: 0 }}>
                  {item.dataSesudah ? (dataSesudahObj ? JSON.stringify(dataSesudahObj, null, 2) : item.dataSesudah) : '— (Tidak ada / DELETE)'}
                </pre>
              </div>
            </div>
          ) : item.operasi === 'UPDATE' && allKeys.length > 0 ? (
            <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
              <table className="diff-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Nama Kolom</th>
                    <th style={{ width: '35%', background: '#fef2f2', color: '#991b1b' }}>Nilai Sebelum</th>
                    <th style={{ width: '35%', background: '#ecfdf5', color: '#065f46' }}>Nilai Sesudah</th>
                  </tr>
                </thead>
                <tbody>
                  {allKeys.map((key) => {
                    const valBefore = dataSebelumObj ? dataSebelumObj[key] : undefined
                    const valAfter = dataSesudahObj ? dataSesudahObj[key] : undefined
                    const isChanged = JSON.stringify(valBefore) !== JSON.stringify(valAfter)
                    return (
                      <tr key={key} className={isChanged ? 'changed' : ''}>
                        <td className="mono" style={{ fontWeight: 600, color: '#083344' }}>
                          {key} {isChanged && <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>Berubah</span>}
                        </td>
                        <td className={`mono ${isChanged ? 'changed-val' : ''}`}>
                          {valBefore === undefined ? <em style={{ color: '#94a3b8' }}>tidak ada</em> : valBefore === null ? <em style={{ color: '#94a3b8' }}>null</em> : typeof valBefore === 'object' ? JSON.stringify(valBefore) : String(valBefore)}
                        </td>
                        <td className={`mono ${isChanged ? 'changed-val' : ''}`}>
                          {valAfter === undefined ? <em style={{ color: '#94a3b8' }}>tidak ada</em> : valAfter === null ? <em style={{ color: '#94a3b8' }}>null</em> : typeof valAfter === 'object' ? JSON.stringify(valAfter) : String(valAfter)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
              <div className={`db-diff-header ${item.operasi === 'DELETE' ? 'before' : 'after'}`}>
                <span>{item.operasi === 'DELETE' ? 'Data Yang Dihapus' : 'Data Yang Disimpan (Insert)'}</span>
              </div>
              <table className="diff-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Nama Kolom</th>
                    <th>Nilai Data</th>
                  </tr>
                </thead>
                <tbody>
                  {((item.operasi === 'DELETE' ? dataSebelumObj : dataSesudahObj) ? Object.entries((item.operasi === 'DELETE' ? dataSebelumObj : dataSesudahObj) as Record<string, unknown>) : []).map(([key, val]) => (
                    <tr key={key}>
                      <td className="mono" style={{ fontWeight: 600, color: '#083344' }}>{key}</td>
                      <td className="mono">
                        {val === null ? <em style={{ color: '#94a3b8' }}>null</em> : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type NeracaAwalBaris = { baris: number; kodeAkun: string; namaAkun: string | null; debit: number; kredit: number; error: string | null }
type NeracaAwalPreview = { baris: NeracaAwalBaris[]; totalDebit: number; totalKredit: number; balanced: boolean }
type SimpananMigrasiBaris = { baris: number; nik: string; nama: string | null; penggunaId: number | null; saldoPokok: number; saldoWajib: number; error: string | null }
type SimpananMigrasiPreview = { baris: SimpananMigrasiBaris[]; totalPokok: number; totalWajib: number; jumlahValid: number; jumlahError: number }
type PinjamanMigrasiBaris = { baris: number; nik: string; nama: string | null; penggunaId: number | null; nominal: number; tenorBulan: number; tanggalMulai: string | null; angsuranSudahDibayar: number; sisaPokok: number; angsuranPerBulan: number; error: string | null }
type PinjamanMigrasiPreview = { baris: PinjamanMigrasiBaris[]; totalSisaPokok: number; jumlahValid: number; jumlahError: number }
type TagihanKreditMigrasiBaris = { baris: number; nik: string; nama: string | null; penggunaId: number | null; keterangan: string; total: number; tenorBulan: number; tanggalMulai: string | null; angsuranSudahDibayar: number; sisaTagihan: number; error: string | null }
type TagihanKreditMigrasiPreview = { baris: TagihanKreditMigrasiBaris[]; totalSisaTagihan: number; jumlahValid: number; jumlahError: number }
type JurnalHarianBaris = { baris: number; kodeAkun: string; namaAkun: string | null; debit: number; kredit: number; error: string | null }
type JurnalHarianVoucher = { noBukti: string; tanggal: string | null; keterangan: string | null; baris: JurnalHarianBaris[]; totalDebit: number; totalKredit: number; balanced: boolean }
type JurnalHarianPreview = { voucher: JurnalHarianVoucher[]; jumlahValid: number; jumlahError: number; totalVoucher: number }

async function unduhTemplate(token: string, url: string, namaFile: string, onExpired: () => void) {
  const response = await fetch(`${API_BASE}${url}`, { headers: { Authorization: `Bearer ${token}` } })
  if (response.status === 401) { onExpired(); return }
  if (!response.ok) { window.alert('Gagal mengunduh template.'); return }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl; a.download = namaFile; document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(objectUrl)
}

function MigrasiView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [tab, setTab] = useState<'neraca' | 'simpanan' | 'pinjaman' | 'tagihan' | 'jurnal'>('neraca')
  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Migrasi Data Lama</h2><p>Import saldo awal dari sistem lama lewat template Excel — otomatis tercatat sebagai jurnal & tampil di Neraca Saldo.</p></div></section>
    <div className="alert" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e', marginBottom: 18 }}>
      <Lightbulb size={17} /> Urutan yang disarankan: <strong>1) Neraca Awal</strong> (Kas, Bank, Utang, Cadangan, dst) → <strong>2) Simpanan Pokok &amp; Wajib</strong> → <strong>3) Pinjaman Aktif</strong> → <strong>4) Tagihan Kredit</strong> → <strong>5) Jurnal Harian</strong> (transaksi tanggal berjalan setelah cutover). Importer 1-4 posting ke akun kliring <strong>3-3990 "Kliring Migrasi Data Lama"</strong> — cek saldo akun itu di Akuntansi ▸ Neraca Saldo setelah semua selesai; kalau sudah 0, migrasi Anda sudah cocok semua.
    </div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      <button className={`toggle-button ${tab === 'neraca' ? 'activate' : ''}`} onClick={() => setTab('neraca')}>1. Neraca Awal</button>
      <button className={`toggle-button ${tab === 'simpanan' ? 'activate' : ''}`} onClick={() => setTab('simpanan')}>2. Simpanan Pokok &amp; Wajib</button>
      <button className={`toggle-button ${tab === 'pinjaman' ? 'activate' : ''}`} onClick={() => setTab('pinjaman')}>3. Pinjaman Aktif</button>
      <button className={`toggle-button ${tab === 'tagihan' ? 'activate' : ''}`} onClick={() => setTab('tagihan')}>4. Tagihan Kredit</button>
      <button className={`toggle-button ${tab === 'jurnal' ? 'activate' : ''}`} onClick={() => setTab('jurnal')}>5. Jurnal Harian</button>
    </div>
    {tab === 'neraca' && <NeracaAwalImporter token={token} onExpired={onExpired} />}
    {tab === 'simpanan' && <SimpananMigrasiImporter token={token} onExpired={onExpired} />}
    {tab === 'pinjaman' && <PinjamanMigrasiImporter token={token} onExpired={onExpired} />}
    {tab === 'tagihan' && <TagihanKreditMigrasiImporter token={token} onExpired={onExpired} />}
    {tab === 'jurnal' && <JurnalHarianMigrasiImporter token={token} onExpired={onExpired} />}
  </div>
}

function NeracaAwalImporter({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<NeracaAwalPreview | null>(null)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [keterangan, setKeterangan] = useState('Saldo awal migrasi dari sistem lama')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const doPreview = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice(''); setPreview(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/migrasi/neraca-awal/preview`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal memuat preview.')
      setPreview(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  const doKomit = async () => {
    if (!preview || !preview.balanced) return
    if (!window.confirm(`Import Neraca Awal ${preview.baris.length} baris sebagai jurnal umum tanggal ${tanggal}? Tindakan ini tidak bisa dibatalkan dari UI.`)) return
    setBusy(true); setError('')
    try {
      const body = { tanggal, keterangan, baris: preview.baris.map((b) => ({ kodeAkun: b.kodeAkun, debit: b.debit, kredit: b.kredit })) }
      const response = await fetch(`${API_BASE}/api/admin/migrasi/neraca-awal/komit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor.')
      setNotice(`${data.message} (Nomor jurnal: ${data.nomorJurnal})`); setPreview(null); setFile(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  return <section className="table-panel">
    <div className="panel-heading"><div><h2>Import Neraca Awal</h2><p>Template berisi seluruh akun aktif — isi kolom Debit/Kredit sesuai Neraca sistem lama per tanggal cutover.</p></div>
      <button className="toggle-button" onClick={() => void unduhTemplate(token, '/api/admin/migrasi/neraca-awal/template', 'Template Neraca Awal KKCS.xlsx', onExpired)}><Download size={14} /> Download Template</button>
    </div>
    {error && <div className="alert error" style={{ margin: '0 25px 16px' }}><X size={17} />{error}</div>}
    {notice && <div className="alert success" style={{ margin: '0 25px 16px' }}><BadgeCheck size={17} />{notice}</div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tanggal Cutover
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 220 }}>Keterangan Jurnal
        <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>File Excel (hasil isian template)
        <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null) }} />
      </label>
      <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={!file || busy} onClick={() => void doPreview()}><Eye size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Preview</button>
    </div>
    {preview && <>
      <div style={{ padding: '14px 25px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', background: preview.balanced ? '#f0fdf4' : '#fef2f2', borderBottom: '1px solid var(--line)' }}>
        <span><strong>Total Debit:</strong> {rupiah(preview.totalDebit)}</span>
        <span><strong>Total Kredit:</strong> {rupiah(preview.totalKredit)}</span>
        <span className={`status-pill ${preview.balanced ? 'active' : 'inactive'}`}><i />{preview.balanced ? 'Balance — siap diimpor' : 'Belum balance / ada error'}</span>
        <button className="submit-button" style={{ marginLeft: 'auto', height: 34, padding: '0 16px' }} disabled={!preview.balanced || busy} onClick={() => void doKomit()}><CheckCircle2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Komit ke Jurnal</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Baris</th><th>Kode Akun</th><th>Nama Akun</th><th className="align-right">Debit</th><th className="align-right">Kredit</th><th>Error</th></tr></thead><tbody>
        {preview.baris.map((b) => <tr key={b.baris} style={b.error ? { background: '#fef2f2' } : undefined}>
          <td>{b.baris}</td><td>{b.kodeAkun}</td><td>{b.namaAkun ?? '—'}</td>
          <td className="align-right">{b.debit > 0 ? rupiah(b.debit) : '—'}</td>
          <td className="align-right">{b.kredit > 0 ? rupiah(b.kredit) : '—'}</td>
          <td>{b.error && <span style={{ color: '#dc2626', fontSize: 12 }}>{b.error}</span>}</td>
        </tr>)}
      </tbody></table></div>
    </>}
  </section>
}

function SimpananMigrasiImporter({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<SimpananMigrasiPreview | null>(null)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const doPreview = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice(''); setPreview(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/migrasi/simpanan/preview`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal memuat preview.')
      setPreview(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  const doKomit = async () => {
    if (!preview || preview.jumlahValid === 0) return
    if (!window.confirm(`Import Simpanan Pokok & Wajib untuk ${preview.jumlahValid} anggota tanggal ${tanggal}? Baris berisi error akan dilewati.`)) return
    setBusy(true); setError('')
    try {
      const body = { tanggal, baris: preview.baris.filter((b) => !b.error && b.penggunaId).map((b) => ({ penggunaId: b.penggunaId, saldoPokok: b.saldoPokok, saldoWajib: b.saldoWajib })) }
      const response = await fetch(`${API_BASE}/api/admin/migrasi/simpanan/komit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor.')
      setNotice(`${data.message} (Nomor jurnal: ${data.nomorJurnal})`); setPreview(null); setFile(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  return <section className="table-panel">
    <div className="panel-heading"><div><h2>Import Simpanan Pokok &amp; Wajib</h2><p>Template berisi daftar anggota aktif — isi saldo Pokok &amp; Wajib per anggota per tanggal cutover.</p></div>
      <button className="toggle-button" onClick={() => void unduhTemplate(token, '/api/admin/migrasi/simpanan/template', 'Template Simpanan Pokok Wajib KKCS.xlsx', onExpired)}><Download size={14} /> Download Template</button>
    </div>
    {error && <div className="alert error" style={{ margin: '0 25px 16px' }}><X size={17} />{error}</div>}
    {notice && <div className="alert success" style={{ margin: '0 25px 16px' }}><BadgeCheck size={17} />{notice}</div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tanggal Cutover
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>File Excel (hasil isian template)
        <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null) }} />
      </label>
      <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={!file || busy} onClick={() => void doPreview()}><Eye size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Preview</button>
    </div>
    {preview && <>
      <div style={{ padding: '14px 25px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', background: preview.jumlahError === 0 ? '#f0fdf4' : '#fffbeb', borderBottom: '1px solid var(--line)' }}>
        <span><strong>Total Pokok:</strong> {rupiah(preview.totalPokok)}</span>
        <span><strong>Total Wajib:</strong> {rupiah(preview.totalWajib)}</span>
        <span><strong>{preview.jumlahValid}</strong> valid, <strong>{preview.jumlahError}</strong> error</span>
        <button className="submit-button" style={{ marginLeft: 'auto', height: 34, padding: '0 16px' }} disabled={preview.jumlahValid === 0 || busy} onClick={() => void doKomit()}><CheckCircle2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Komit {preview.jumlahValid} Anggota</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>NIK</th><th>Nama</th><th className="align-right">Saldo Pokok</th><th className="align-right">Saldo Wajib</th><th>Error</th></tr></thead><tbody>
        {preview.baris.map((b) => <tr key={b.baris} style={b.error ? { background: '#fef2f2' } : undefined}>
          <td>{b.nik}</td><td>{b.nama ?? '—'}</td>
          <td className="align-right">{rupiah(b.saldoPokok)}</td><td className="align-right">{rupiah(b.saldoWajib)}</td>
          <td>{b.error && <span style={{ color: '#dc2626', fontSize: 12 }}>{b.error}</span>}</td>
        </tr>)}
      </tbody></table></div>
    </>}
  </section>
}

function PinjamanMigrasiImporter({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PinjamanMigrasiPreview | null>(null)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const doPreview = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice(''); setPreview(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/migrasi/pinjaman/preview`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal memuat preview.')
      setPreview(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  const doKomit = async () => {
    if (!preview || preview.jumlahValid === 0) return
    if (!window.confirm(`Import Pinjaman Aktif untuk ${preview.jumlahValid} anggota tanggal ${tanggal}? Baris berisi error akan dilewati.`)) return
    setBusy(true); setError('')
    try {
      const body = {
        tanggal, baris: preview.baris.filter((b) => !b.error && b.penggunaId).map((b) => ({
          penggunaId: b.penggunaId, nominal: b.nominal, tenorBulan: b.tenorBulan, tanggalMulai: b.tanggalMulai,
          angsuranSudahDibayar: b.angsuranSudahDibayar, sisaPokokOverride: null
        }))
      }
      const response = await fetch(`${API_BASE}/api/admin/migrasi/pinjaman/komit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor.')
      setNotice(`${data.message} (Nomor jurnal: ${data.nomorJurnal})`); setPreview(null); setFile(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  return <section className="table-panel">
    <div className="panel-heading"><div><h2>Import Pinjaman Aktif</h2><p>Isi nominal awal, tenor, tanggal mulai, dan sudah nyicil ke berapa — jadwal sisa angsuran dibuat otomatis.</p></div>
      <button className="toggle-button" onClick={() => void unduhTemplate(token, '/api/admin/migrasi/pinjaman/template', 'Template Pinjaman Aktif KKCS.xlsx', onExpired)}><Download size={14} /> Download Template</button>
    </div>
    {error && <div className="alert error" style={{ margin: '0 25px 16px' }}><X size={17} />{error}</div>}
    {notice && <div className="alert success" style={{ margin: '0 25px 16px' }}><BadgeCheck size={17} />{notice}</div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tanggal Cutover (posting jurnal)
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>File Excel (hasil isian template)
        <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null) }} />
      </label>
      <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={!file || busy} onClick={() => void doPreview()}><Eye size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Preview</button>
    </div>
    {preview && <>
      <div style={{ padding: '14px 25px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', background: preview.jumlahError === 0 ? '#f0fdf4' : '#fffbeb', borderBottom: '1px solid var(--line)' }}>
        <span><strong>Total Sisa Pokok:</strong> {rupiah(preview.totalSisaPokok)}</span>
        <span><strong>{preview.jumlahValid}</strong> valid, <strong>{preview.jumlahError}</strong> error</span>
        <button className="submit-button" style={{ marginLeft: 'auto', height: 34, padding: '0 16px' }} disabled={preview.jumlahValid === 0 || busy} onClick={() => void doKomit()}><CheckCircle2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Komit {preview.jumlahValid} Pinjaman</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>NIK</th><th>Nama</th><th className="align-right">Pokok Awal</th><th>Tenor</th><th>Mulai</th><th>Angsuran ke</th><th className="align-right">Sisa Pokok</th><th>Error</th></tr></thead><tbody>
        {preview.baris.map((b) => <tr key={b.baris} style={b.error ? { background: '#fef2f2' } : undefined}>
          <td>{b.nik}</td><td>{b.nama ?? '—'}</td>
          <td className="align-right">{rupiah(b.nominal)}</td><td>{b.tenorBulan} bln</td>
          <td>{b.tanggalMulai ? waktu(b.tanggalMulai) : '—'}</td><td>{b.angsuranSudahDibayar}</td>
          <td className="align-right">{rupiah(b.sisaPokok)}</td>
          <td>{b.error && <span style={{ color: '#dc2626', fontSize: 12 }}>{b.error}</span>}</td>
        </tr>)}
      </tbody></table></div>
    </>}
  </section>
}

function TagihanKreditMigrasiImporter({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<TagihanKreditMigrasiPreview | null>(null)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const doPreview = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice(''); setPreview(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/migrasi/tagihan-kredit/preview`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal memuat preview.')
      setPreview(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  const doKomit = async () => {
    if (!preview || preview.jumlahValid === 0) return
    if (!window.confirm(`Import Tagihan Kredit untuk ${preview.jumlahValid} baris tanggal ${tanggal}? Baris berisi error akan dilewati.`)) return
    setBusy(true); setError('')
    try {
      const body = {
        tanggal, baris: preview.baris.filter((b) => !b.error && b.penggunaId).map((b) => ({
          penggunaId: b.penggunaId, keterangan: b.keterangan, total: b.total, tenorBulan: b.tenorBulan,
          tanggalMulai: b.tanggalMulai, angsuranSudahDibayar: b.angsuranSudahDibayar, sisaPokokOverride: null
        }))
      }
      const response = await fetch(`${API_BASE}/api/admin/migrasi/tagihan-kredit/komit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor.')
      setNotice(`${data.message} (Nomor jurnal: ${data.nomorJurnal})`); setPreview(null); setFile(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  return <section className="table-panel">
    <div className="panel-heading"><div><h2>Import Tagihan Kredit</h2><p>Untuk pembelian/sewa katalog yang dicicil lewat potong gaji — isi total, tenor cicilan, dan sudah dibayar ke berapa.</p></div>
      <button className="toggle-button" onClick={() => void unduhTemplate(token, '/api/admin/migrasi/tagihan-kredit/template', 'Template Tagihan Kredit KKCS.xlsx', onExpired)}><Download size={14} /> Download Template</button>
    </div>
    {error && <div className="alert error" style={{ margin: '0 25px 16px' }}><X size={17} />{error}</div>}
    {notice && <div className="alert success" style={{ margin: '0 25px 16px' }}><BadgeCheck size={17} />{notice}</div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tanggal Cutover (posting jurnal)
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>File Excel (hasil isian template)
        <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null) }} />
      </label>
      <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={!file || busy} onClick={() => void doPreview()}><Eye size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Preview</button>
    </div>
    {preview && <>
      <div style={{ padding: '14px 25px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', background: preview.jumlahError === 0 ? '#f0fdf4' : '#fffbeb', borderBottom: '1px solid var(--line)' }}>
        <span><strong>Total Sisa Tagihan:</strong> {rupiah(preview.totalSisaTagihan)}</span>
        <span><strong>{preview.jumlahValid}</strong> valid, <strong>{preview.jumlahError}</strong> error</span>
        <button className="submit-button" style={{ marginLeft: 'auto', height: 34, padding: '0 16px' }} disabled={preview.jumlahValid === 0 || busy} onClick={() => void doKomit()}><CheckCircle2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Komit {preview.jumlahValid} Tagihan</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>NIK</th><th>Nama</th><th>Keterangan</th><th className="align-right">Total</th><th>Tenor</th><th>Mulai</th><th>Sudah Bayar</th><th className="align-right">Sisa</th><th>Error</th></tr></thead><tbody>
        {preview.baris.map((b) => <tr key={b.baris} style={b.error ? { background: '#fef2f2' } : undefined}>
          <td>{b.nik}</td><td>{b.nama ?? '—'}</td><td>{b.keterangan}</td>
          <td className="align-right">{rupiah(b.total)}</td><td>{b.tenorBulan}x</td>
          <td>{b.tanggalMulai ? waktu(b.tanggalMulai) : '—'}</td><td>{b.angsuranSudahDibayar}</td>
          <td className="align-right">{rupiah(b.sisaTagihan)}</td>
          <td>{b.error && <span style={{ color: '#dc2626', fontSize: 12 }}>{b.error}</span>}</td>
        </tr>)}
      </tbody></table></div>
    </>}
  </section>
}

function JurnalHarianMigrasiImporter({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<JurnalHarianPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const doPreview = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice(''); setPreview(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const response = await fetch(`${API_BASE}/api/admin/migrasi/jurnal-harian/preview`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal memuat preview.')
      setPreview(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  const doKomit = async () => {
    if (!preview || preview.jumlahValid === 0) return
    if (!window.confirm(`Import ${preview.jumlahValid} voucher transaksi sebagai jurnal terpisah (bertanggal masing-masing)? Voucher berisi error akan dilewati.`)) return
    setBusy(true); setError('')
    try {
      const body = {
        voucher: preview.voucher.filter((v) => v.balanced).map((v) => ({
          noBukti: v.noBukti, tanggal: v.tanggal, keterangan: v.keterangan ?? v.noBukti,
          baris: v.baris.map((b) => ({ kodeAkun: b.kodeAkun, debit: b.debit, kredit: b.kredit }))
        }))
      }
      const response = await fetch(`${API_BASE}/api/admin/migrasi/jurnal-harian/komit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Gagal mengimpor.')
      setNotice(data.message); setPreview(null); setFile(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.') }
    finally { setBusy(false) }
  }

  return <section className="table-panel">
    <div className="panel-heading"><div><h2>Import Jurnal Harian</h2><p>Banyak transaksi bertanggal beda-beda, dikelompokkan per No Bukti — tiap voucher jadi 1 jurnal terpisah sesuai tanggal aslinya.</p></div>
      <button className="toggle-button" onClick={() => void unduhTemplate(token, '/api/admin/migrasi/jurnal-harian/template', 'Template Jurnal Harian KKCS.xlsx', onExpired)}><Download size={14} /> Download Template</button>
    </div>
    {error && <div className="alert error" style={{ margin: '0 25px 16px' }}><X size={17} />{error}</div>}
    {notice && <div className="alert success" style={{ margin: '0 25px 16px' }}><BadgeCheck size={17} />{notice}</div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>File Excel (hasil isian template)
        <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null) }} />
      </label>
      <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={!file || busy} onClick={() => void doPreview()}><Eye size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Preview</button>
    </div>
    {preview && <>
      <div style={{ padding: '14px 25px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', background: preview.jumlahError === 0 ? '#f0fdf4' : '#fffbeb', borderBottom: '1px solid var(--line)' }}>
        <span><strong>{preview.totalVoucher}</strong> voucher total</span>
        <span><strong>{preview.jumlahValid}</strong> balance, <strong>{preview.jumlahError}</strong> error</span>
        <button className="submit-button" style={{ marginLeft: 'auto', height: 34, padding: '0 16px' }} disabled={preview.jumlahValid === 0 || busy} onClick={() => void doKomit()}><CheckCircle2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Komit {preview.jumlahValid} Voucher</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>No Bukti</th><th>Tanggal</th><th>Keterangan</th><th className="align-right">Debit</th><th className="align-right">Kredit</th><th>Status</th></tr></thead><tbody>
        {preview.voucher.map((v) => <Fragment key={v.noBukti}>
          <tr style={{ cursor: 'pointer', background: v.balanced ? undefined : '#fef2f2' }} onClick={() => setExpanded(expanded === v.noBukti ? null : v.noBukti)}>
            <td>{v.noBukti}</td><td>{v.tanggal ? waktu(v.tanggal) : '—'}</td><td>{v.keterangan ?? '—'}</td>
            <td className="align-right">{rupiah(v.totalDebit)}</td><td className="align-right">{rupiah(v.totalKredit)}</td>
            <td>{v.balanced ? <span className="status-pill active"><i />Balance</span> : <span className="status-pill inactive"><i />Error</span>}</td>
          </tr>
          {expanded === v.noBukti && <tr><td colSpan={6} style={{ background: '#f8fafc', padding: '10px 20px' }}>
            <table style={{ width: '100%', fontSize: 12 }}><thead><tr><th style={{ textAlign: 'left' }}>Kode Akun</th><th style={{ textAlign: 'left' }}>Nama Akun</th><th className="align-right">Debit</th><th className="align-right">Kredit</th><th style={{ textAlign: 'left' }}>Error</th></tr></thead><tbody>
              {v.baris.map((b) => <tr key={b.baris}>
                <td>{b.kodeAkun}</td><td>{b.namaAkun ?? '—'}</td>
                <td className="align-right">{b.debit > 0 ? rupiah(b.debit) : '—'}</td>
                <td className="align-right">{b.kredit > 0 ? rupiah(b.kredit) : '—'}</td>
                <td>{b.error && <span style={{ color: '#dc2626' }}>{b.error}</span>}</td>
              </tr>)}
            </tbody></table>
          </td></tr>}
        </Fragment>)}
      </tbody></table></div>
    </>}
  </section>
}

function DbAuditLogPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [data, setData] = useState<DbAuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [halaman, setHalaman] = useState(1)
  const ukuran = 30
  const [tabelList, setTabelList] = useState<string[]>([])
  const [tabelFilter, setTabelFilter] = useState('')
  const [cari, setCari] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifikasi, setVerifikasi] = useState<VerifikasiChainResult | null>(null)
  const [verifikasiBusy, setVerifikasiBusy] = useState(false)
  const [selectedDbLog, setSelectedDbLog] = useState<DbAuditLogEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ halaman: String(halaman), ukuran: String(ukuran) })
      if (tabelFilter) params.set('tabel', tabelFilter)
      if (cari.trim()) params.set('cari', cari.trim())
      const [logResponse, tabelResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/audit-log/db?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/audit-log/db/tabel`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (logResponse.status === 401 || tabelResponse.status === 401) { onExpired(); return }
      if (!logResponse.ok) throw new Error('Gagal memuat log database.')
      const payload = await logResponse.json()
      setData(payload.data); setTotal(payload.total)
      if (tabelResponse.ok) setTabelList(await tabelResponse.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired, halaman, tabelFilter, cari])
  useEffect(() => { void load() }, [load])

  const verifikasiIntegritas = async () => {
    setVerifikasiBusy(true); setVerifikasi(null); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/audit-log/db/verifikasi`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal memverifikasi integritas rantai audit.')
      setVerifikasi(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal memverifikasi integritas.') }
    finally { setVerifikasiBusy(false) }
  }

  const totalHalaman = Math.max(1, Math.ceil(total / ukuran))
  const terapkanFilter = () => { setHalaman(1); void load() }

  return (
    <>
      {error && <div className="alert error"><X size={17} />{error}</div>}
      <div className="alert" style={{ background: '#eef6f3', color: '#2f4842', alignItems: 'start' }}>
        <ShieldCheck size={17} />
        <div>
          Tercatat langsung oleh trigger SQL Server pada tabel finansial (Simpanan, Pinjaman, Akuntansi, SHU, Konfigurasi, Pengguna) — mencakup perubahan lewat aplikasi <strong>maupun lewat koneksi database langsung</strong> (dBeaver/SSMS/dll). Setiap baris dirantai dengan hash kriptografis SHA-256; manipulasi retroaktif dapat dideteksi lewat tombol &quot;Verifikasi integritas&quot;.
        </div>
      </div>

      {verifikasi && (
        <div className={`alert ${verifikasi.utuh ? 'success' : 'error'}`} style={{ alignItems: 'start' }}>
          {verifikasi.utuh ? <BadgeCheck size={17} /> : <X size={17} />}
          <div>
            {verifikasi.message}
            {!verifikasi.utuh && (
              <div className="table-scroll table-compact" style={{ marginTop: 10 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Id log</th>
                      <th>Tabel</th>
                      <th>Operasi</th>
                      <th>Kunci</th>
                      <th>Waktu</th>
                      <th>DB login</th>
                      <th>Masalah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifikasi.baris.map((b) => (
                      <tr key={b.id}>
                        <td className="mono">{b.id}</td>
                        <td>{b.tabel}</td>
                        <td><span className={`op-pill ${b.operasi.toLowerCase()}`}>{b.operasi}</span></td>
                        <td className="mono">{b.kunciPrimer}</td>
                        <td>{waktu(b.waktuUtc)}</td>
                        <td>{b.dbLogin}</td>
                        <td>{[b.hashTidakCocok && 'isi baris berubah', b.rantaiTerputus && 'rantai terputus'].filter(Boolean).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="stat-grid">
        <StatCard label="Total baris tercatat" value={total} icon={<Fingerprint size={20} />} tone="teal" />
        <StatCard label="Tabel terpantau" value={tabelList.length} icon={<Database size={20} />} tone="blue" />
      </section>

      <section className="table-panel">
        <div className="panel-heading">
          <div>
            <h2>Log database mentah</h2>
            <p>Setiap mutasi INSERT/UPDATE/DELETE pada tabel finansial. Klik baris untuk perbandingan nilai sebelum vs sesudah.</p>
          </div>
          <button className="toggle-button activate" disabled={verifikasiBusy} onClick={() => void verifikasiIntegritas()}>
            {verifikasiBusy ? 'Memverifikasi...' : 'Verifikasi integritas'}
          </button>
        </div>
        <div className="filters" style={{ flexWrap: 'wrap', gap: 8 }}>
          <label className="search-box" style={{ minWidth: 210, height: 35 }}>
            <Search size={15} />
            <input value={cari} onChange={(e) => setCari(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && terapkanFilter()} placeholder="Cari kunci baris atau DB login..." />
          </label>
          <select value={tabelFilter} onChange={(e) => { setTabelFilter(e.target.value); setHalaman(1) }} style={{ height: 35, minWidth: 130, fontSize: 11.5 }}>
            <option value="">Semua tabel</option>
            {tabelList.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="toggle-button activate" style={{ height: 35, padding: '0 12px' }} onClick={terapkanFilter}>Terapkan</button>
        </div>
        <div className="table-scroll table-compact">
          <table className="audit-compact-table">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '45%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Tabel</th>
                <th>Operasi</th>
                <th>Kunci</th>
                <th>Koneksi / DB</th>
                <th className="align-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="tr-interactive" onClick={() => setSelectedDbLog(item)}>
                  <td>
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 11.5 }}>{tanggal(item.waktuUtc)}</span>
                      <span style={{ display: 'block', color: 'var(--muted)', fontSize: 10, marginTop: 1 }}>
                        {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.waktuUtc.endsWith('Z') ? item.waktuUtc : `${item.waktuUtc}Z`))} WIB
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, color: '#083344', fontSize: 11.5 }}>{item.tabel}</span>
                  </td>
                  <td>
                    <span className={`op-pill ${item.operasi.toLowerCase()}`} style={{ fontSize: 9.5, padding: '2px 6px' }}>{item.operasi}</span>
                  </td>
                  <td>
                    <span className="mono cell-truncate" style={{ maxWidth: 100, fontSize: 11 }} title={item.kunciPrimer}>
                      {item.kunciPrimer}
                    </span>
                  </td>
                  <td className="cell-wrap">
                    <div style={{ fontSize: 11.5, color: 'var(--ink)', fontWeight: 600 }}>{item.dbLogin}</div>
                    <small style={{ color: 'var(--muted)', fontSize: 10.5 }}>{item.appName ?? 'SQL Direct'}</small>
                  </td>
                  <td className="align-right">
                    <button
                      className="toggle-button"
                      style={{ padding: '4px 8px', fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedDbLog(item) }}
                      title="Buka rincian mutasi basis data"
                    >
                      <Eye size={11} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.length === 0 && <div className="empty-state">Belum ada perubahan tercatat untuk filter ini.</div>}
        </div>
        {totalHalaman > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '14px 0' }}>
            <button className="toggle-button" disabled={halaman <= 1} onClick={() => setHalaman((h) => h - 1)}>Sebelumnya</button>
            <small style={{ color: 'var(--muted)' }}>Halaman {halaman} / {totalHalaman}</small>
            <button className="toggle-button" disabled={halaman >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>Berikutnya</button>
          </div>
        )}
      </section>

      {selectedDbLog && (
        <DbAuditDetailModal item={selectedDbLog} onClose={() => setSelectedDbLog(null)} />
      )}
    </>
  )
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Nominal</th><th>Cicilan/bln</th><th>Total jasa</th><th>Tujuan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {applications.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{rupiah(item.nominal)}<br /><small style={{ color: 'var(--muted)' }}>{item.tenorBulan} bln</small></td>
          <td>{rupiah(item.estimasiCicilanBulanan)}<br /><small style={{ color: 'var(--muted)' }}>jasa {(item.bungaTahunan * 100).toFixed(2)}%/th</small></td>
          <td>{rupiah(item.estimasiTotalJasa)}</td>
          <td style={{ whiteSpace: 'normal', maxWidth: 180 }}>{item.tujuan}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'rejected' : 'waiting'}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `app-${item.id}`} onClick={() => void decide(item, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `app-${item.id}`} onClick={() => void decide(item, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diputuskanPada ? tanggal(item.diputuskanPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && applications.length === 0 && <div className="empty-state"><HandCoins size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada pengajuan pinjaman.</div></div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pengajuan pembayaran</h2><p>Menyetujui pembayaran angsuran menandai 1 angsuran lunas; menyetujui pelunasan dipercepat menagih sisa pokok saja dan membebaskan jasa.</p></div><span className="record-count">{pendingPayments.length} menunggu</span></div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Pinjaman</th><th>Jenis</th><th>Jumlah diajukan</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {payments.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td className="mono">{item.nomorPinjaman}</td>
          <td>{item.jenis === 'Pelunasan' ? <span className="role-pill admin"><Zap size={11} /> Pelunasan</span> : <span className="role-pill">Angsuran {item.angsuranKe ? `ke-${item.angsuranKe}` : ''}</span>}</td>
          <td>{rupiah(item.jumlahDiajukan)}{item.jenis === 'Pelunasan' && <><br /><small style={{ color: 'var(--muted)' }}>jasa {rupiah(item.jasaDibebaskan ?? 0)} dibebaskan</small></>}</td>
          <td>{tanggal(item.diajukanPada)}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'rejected' : 'waiting'}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `pay-${item.id}`} onClick={() => void decidePayment(item, true)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `pay-${item.id}`} onClick={() => void decidePayment(item, false)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diputuskanPada ? tanggal(item.diputuskanPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && payments.length === 0 && <div className="empty-state"><Zap size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada pengajuan pembayaran dari anggota.</div></div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Pinjaman aktif & lunas</h2><p>Pantau progres angsuran. Pembayaran diproses lewat panel "Pengajuan pembayaran" di atas.</p></div><span className="record-count">{loans.length} pinjaman</span></div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Nomor</th><th>Pokok</th><th>Cicilan/bln</th><th>Progres</th><th>Sisa pokok</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {loans.map((loan) => [
          <tr key={loan.id}>
            <td><div className="user-cell"><span className="avatar tosca-avatar">{loan.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{loan.namaAnggota}</strong><small className="mono">{loan.nomorIndukKaryawan}</small></div></div></td>
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
          expanded === loan.id && <tr key={`${loan.id}-detail`}><td colSpan={8} style={{ background: '#f8fafc', padding: '14px 18px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              {loan.status === 'Aktif' && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 8, marginBottom: 14, color: '#083344', fontSize: 12.5 }}>
                <Zap size={16} style={{ color: '#0891b2', flexShrink: 0 }} />
                <div>
                  <strong>Pelunasan dipercepat sekarang:</strong> anggota cukup bayar sisa pokok <strong>{rupiah(loan.nilaiPelunasanDipercepat)}</strong> — jasa <strong>{rupiah(loan.jasaDibebaskan)}</strong> dibebaskan.
                </div>
              </div>}
              <div style={{ fontWeight: 700, fontSize: 12.5, color: '#083344', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} style={{ color: '#0891b2' }} />
                Jadwal & Riwayat Angsuran ({loan.nomorPinjaman})
              </div>
              <table className="table-compact" style={{ minWidth: 0 }}><thead><tr><th>#</th><th>Jatuh tempo</th><th>Pokok</th><th>Jasa</th><th>Total</th><th>Status</th><th>Dibayar</th></tr></thead><tbody>
                {loan.angsuran.map((row) => <tr key={row.angsuranKe}>
                  <td>{row.jenis === 'Pelunasan' ? <span style={{ color: '#0891b2', fontWeight: 700 }}>⚡ Pelunasan</span> : row.angsuranKe}</td>
                  <td>{tanggal(row.jatuhTempo)}</td>
                  <td>{rupiah(row.pokok)}</td>
                  <td>{row.jasa === 0 ? '—' : rupiah(row.jasa)}</td>
                  <td style={{ fontWeight: 600 }}>{rupiah(row.total)}</td>
                  <td>
                    <span className={`status-pill ${row.status === 'Dibayar' ? 'active' : row.status === 'Dibatalkan' ? 'inactive' : 'waiting'}`} style={{ padding: '2px 7px', fontSize: 10 }}>
                      <i />{row.status}
                    </span>
                  </td>
                  <td>{row.dibayarPada ? tanggal(row.dibayarPada) : '—'}</td>
                </tr>)}
              </tbody></table>
            </div>
          </td></tr>,
        ])}
      </tbody></table>{!loading && loans.length === 0 && <div className="empty-state"><Wallet size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada pinjaman aktif.</div></div>}</div>
    </section>
  </div>
}

function SavingsView({ token, onExpired, isAdmin }: { token: string; onExpired: () => void; isAdmin: boolean }) {
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
  const [pphInput, setPphInput] = useState('')
  const [pphShuInput, setPphShuInput] = useState('')
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
      setPphInput((k.tarifPph * 100).toString())
      setPphShuInput((k.tarifPphShu * 100).toString())
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
    tarifPph: (Number(pphInput) || 0) / 100,
    tarifPphShu: (Number(pphShuInput) || 0) / 100,
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
      <div className="panel-heading"><div><h2>Konfigurasi simpanan</h2><p>Nominal Simpanan Pokok (saldo awal keanggotaan) dan Simpanan Wajib (tagihan bulanan tanggal {konfigurasi?.tanggalTagihWajib ?? 25}).{!isAdmin && ' Hanya Admin yang bisa mengubah nilai ini.'}</p></div></div>
      <div className="config-card-grid">
        <div className="config-field-box">
          <label className="config-field-label">Simpanan Pokok (Rp)</label>
          <input type="number" className="config-field-input" disabled={!isAdmin} value={pokokInput} onChange={(e) => setPokokInput(e.target.value)} placeholder="0" />
        </div>
        <div className="config-field-box">
          <label className="config-field-label">Simpanan Wajib / bulan (Rp)</label>
          <input type="number" className="config-field-input" disabled={!isAdmin} value={wajibInput} onChange={(e) => setWajibInput(e.target.value)} placeholder="0" />
        </div>
        <div className="config-field-box">
          <label className="config-field-label">Bunga Sukarela (%/th)</label>
          <input type="number" step="0.1" className="config-field-input" disabled={!isAdmin} value={bungaSukarelaInput} onChange={(e) => setBungaSukarelaInput(e.target.value)} placeholder="0.0" />
        </div>
        <div className="config-field-box">
          <label className="config-field-label">Bunga Deposito (%/th)</label>
          <input type="number" step="0.1" className="config-field-input" disabled={!isAdmin} value={bungaDepositoInput} onChange={(e) => setBungaDepositoInput(e.target.value)} placeholder="0.0" />
        </div>
        <div className="config-field-box">
          <label className="config-field-label">Tarif PPh Bunga & Deposito (%)</label>
          <input type="number" step="0.1" className="config-field-input" disabled={!isAdmin} value={pphInput} onChange={(e) => setPphInput(e.target.value)} placeholder="0.0" />
        </div>
        <div className="config-field-box">
          <label className="config-field-label">Tarif PPh SHU (%)</label>
          <input type="number" step="0.1" className="config-field-input" disabled={!isAdmin} value={pphShuInput} onChange={(e) => setPphShuInput(e.target.value)} placeholder="0.0" />
        </div>
        {isAdmin && (
          <button className="submit-button" style={{ alignSelf: 'end', height: 38, padding: '0 20px', marginBottom: 2 }} disabled={busyId === 'konfig'} onClick={saveKonfigurasi}>
            Simpan Perubahan
          </button>
        )}
      </div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading">
        <div><h2>Simpanan Wajib</h2><p>Tagihan dibuat otomatis tiap tanggal {konfigurasi?.tanggalTagihWajib ?? 25}. Approve = kreditkan ke saldo wajib anggota.</p></div>
        <button className="toggle-button activate" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'gen'} onClick={() => void call('gen', '/api/admin/simpanan/wajib/generate', 'POST', {})}>
          <Calendar size={14} /> Buat tagihan bulan ini
        </button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Periode</th><th>Nominal</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {wajib.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{item.periode}</td>
          <td>{rupiah(item.nominal)}</td>
          <td>{tanggal(item.jatuhTempo)}</td>
          <td><span className={`status-pill ${item.status === 'Dibayar' ? 'active' : item.status === 'Ditolak' ? 'rejected' : 'waiting'}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Ditagih'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `w-${item.id}`} onClick={() => putusan(`w-${item.id}`, `/api/admin/simpanan/wajib/${item.id}/putusan`, true, `tagihan wajib ${item.namaAnggota} ${item.periode}`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `w-${item.id}`} onClick={() => putusan(`w-${item.id}`, `/api/admin/simpanan/wajib/${item.id}/putusan`, false, `tagihan wajib ${item.namaAnggota} ${item.periode}`)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diprosesPada ? tanggal(item.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && wajib.length === 0 && <div className="empty-state"><Receipt size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada tagihan wajib. Klik "Buat tagihan bulan ini".</div></div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading">
        <div><h2>Simpanan Sukarela</h2><p>Setoran menambah saldo; penarikan mengurangi saldo. Bunga {konfigurasi ? (konfigurasi.bungaSukarelaTahunan * 100).toFixed(2) : '2.50'}%/th metode saldo harian, dipotong PPh {konfigurasi ? (konfigurasi.tarifPph * 100).toFixed(0) : '20'}%, dibukukan tanggal terakhir tiap bulan.</p></div>
        <button className="toggle-button activate" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'bunga'} onClick={() => void call('bunga', '/api/admin/simpanan/sukarela/bunga', 'POST', {}, 'Hitung & kreditkan bunga sukarela bulan lalu ke semua rekening?')}>
          <Calculator size={14} /> Hitung bunga bulan lalu
        </button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Nominal</th><th>Saldo saat ini</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {sukarela.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>
            <span className={`role-pill ${item.jenis === 'Tarik' ? 'admin' : ''}`} style={{ marginBottom: 3, display: 'inline-block' }}>{item.jenis}</span>
            <div>{rupiah(item.nominal)}</div>
          </td>
          <td>
            <strong>{rupiah(item.saldoSukarela)}</strong>
            {item.bungaTerakhir && <div style={{ marginTop: 3, fontSize: 10.5, lineHeight: 1.6 }}>
              <div style={{ color: 'var(--muted)' }}>Bunga {item.bungaTerakhir.periode}: <span style={{ color: '#0891b2', fontWeight: 700 }}>{rupiah(item.bungaTerakhir.bruto)}</span></div>
              <div style={{ color: 'var(--muted)' }}>PPh: <span style={{ color: '#ad6a16', fontWeight: 700 }}>−{rupiah(item.bungaTerakhir.pajak)}</span></div>
              <div style={{ color: 'var(--muted)' }}>Neto: <span style={{ color: '#2d8155', fontWeight: 700 }}>+{rupiah(item.bungaTerakhir.neto)}</span></div>
            </div>}
          </td>
          <td>{tanggal(item.diajukanPada)}</td>
          <td><span className={`status-pill ${item.status === 'Disetujui' ? 'active' : item.status === 'Ditolak' ? 'rejected' : 'waiting'}`}><i />{item.status}</span></td>
          <td className="align-right">{item.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `s-${item.id}`} onClick={() => putusan(`s-${item.id}`, `/api/admin/simpanan/sukarela/${item.id}/putusan`, true, `${item.jenis.toLowerCase()} sukarela ${item.namaAnggota} ${rupiah(item.nominal)}`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `s-${item.id}`} onClick={() => putusan(`s-${item.id}`, `/api/admin/simpanan/sukarela/${item.id}/putusan`, false, `${item.jenis.toLowerCase()} sukarela ${item.namaAnggota}`)}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{item.diprosesPada ? tanggal(item.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && sukarela.length === 0 && <div className="empty-state"><PiggyBank size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada pengajuan simpanan sukarela.</div></div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Paket Simpanan Berjangka</h2><p>Anggota hanya bisa memilih paket yang aktif di sini.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Nama paket
          <input value={produkNama} onChange={(e) => setProdukNama(e.target.value)} placeholder="Berjangka 10 Juta" style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Nominal
          <input type="number" value={produkNominal} onChange={(e) => setProdukNominal(e.target.value)} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tenor (bulan)
          <input type="number" value={produkTenor} onChange={(e) => setProdukTenor(e.target.value)} style={{ width: 110, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none' }} />
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
      </tbody></table>{!loading && produk.length === 0 && <div className="empty-state"><Database size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada paket berjangka.</div></div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Pengajuan Simpanan Berjangka</h2><p>Setujui untuk mengunci dana; cairkan saat jatuh tempo. Pencairan dipercepat (diajukan anggota) → hanya pokok, bunga hangus.</p></div><span className="record-count">{berjangkaMenunggu} menunggu · {pencairanMenunggu} minta cair</span></div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Paket</th><th>Nominal</th><th>Est. bunga</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {berjangka.map((item) => <tr key={item.id} style={item.pencairanDiajukan ? { background: '#fffbeb' } : undefined}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{item.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{item.nomorSertifikat}</small></td>
          <td>{rupiah(item.nominal)}<br /><small style={{ color: 'var(--muted)' }}>{item.tenorBulan} bln</small></td>
          <td>
            {rupiah(item.estimasiBunga)}
            <div style={{ marginTop: 2, fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              <div>{item.sudahDicairkan ? 'PPh' : 'Est. PPh'}: <span style={{ color: '#ad6a16', fontWeight: 600 }}>−{rupiah(item.estimasiPajak)}</span></div>
              <div>{item.sudahDicairkan ? 'Neto' : 'Est. neto'}: <span style={{ color: '#2d8155', fontWeight: 600 }}>{rupiah(item.estimasiBungaNeto)}</span></div>
            </div>
          </td>
          <td>{item.tanggalJatuhTempo ? tanggal(item.tanggalJatuhTempo) : '—'}</td>
          <td>
            <span className={`status-pill ${item.status === 'Aktif' || item.status === 'Dicairkan' ? 'active' : item.status === 'Ditolak' ? 'rejected' : item.status === 'Diajukan' ? 'waiting' : 'inactive'}`}><i />{item.status}</span>
            {item.pencairanDiajukan && <><br /><span className="status-pill waiting" style={{ marginTop: 4, display: 'inline-flex', fontSize: 10, padding: '2px 6px' }}><Zap size={10} /> Minta cair dipercepat</span>{item.alasanPencairan && <><br /><small style={{ color: 'var(--muted)' }}>{item.alasanPencairan}</small></>}</>}
          </td>
          <td className="align-right">
            {item.status === 'Diajukan' && <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, true, `berjangka ${item.namaAnggota} ${rupiah(item.nominal)}`)}>Setujui</button>
              <button className="toggle-button deactivate" disabled={busyId === `b-${item.id}`} onClick={() => putusan(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/putusan`, false, `berjangka ${item.namaAnggota}`)}>Tolak</button>
            </span>}
            {item.status === 'JatuhTempo' && <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan`, 'POST', undefined, `Cairkan (jatuh tempo) ${item.namaAnggota} ${rupiah(item.nominal)} + bunga neto ${rupiah(item.estimasiBungaNeto)} (bruto ${rupiah(item.estimasiBunga)}, PPh ${rupiah(item.estimasiPajak)})?`)}>Cairkan</button>}
            {item.status === 'Aktif' && item.pencairanDiajukan && <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button activate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan`, 'POST', undefined, `Setujui pencairan DIPERCEPAT ${item.namaAnggota}?\n\nAnggota hanya menerima pokok ${rupiah(item.nominal)}. Bunga ${rupiah(item.estimasiBunga)} HANGUS.`)}>Setujui cair</button>
              <button className="toggle-button deactivate" disabled={busyId === `b-${item.id}`} onClick={() => void call(`b-${item.id}`, `/api/admin/simpanan/berjangka/${item.id}/pencairan/tolak`, 'POST', undefined, `Tolak pengajuan pencairan dipercepat ${item.namaAnggota}? Simpanan tetap aktif.`)}>Tolak cair</button>
            </span>}
            {item.status === 'Aktif' && !item.pencairanDiajukan && <small style={{ color: 'var(--muted)' }}>Terkunci</small>}
            {(item.status === 'Ditolak' || item.status === 'Dicairkan') && <small style={{ color: 'var(--muted)' }}>—</small>}
          </td>
        </tr>)}
      </tbody></table>{!loading && berjangka.length === 0 && <div className="empty-state"><PiggyBank size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada pengajuan simpanan berjangka.</div></div>}</div>
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
  const setJenisForm = (jenis: string) => setForm((f) => ({ ...f, jenis, satuan: jenis === 'Sewa' ? 'Hari' : (f.satuan === 'Hari' || f.satuan === 'Bulan' ? 'pcs' : f.satuan), stok: jenis === 'Sewa' ? '0' : f.stok }))

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
    const map = new Map<number, { penggunaId: number; nama: string; nik: string; rincian: TagihanKredit[]; totalBelum: number; totalLunas: number }>()
    for (const t of tagihan) {
      const g = map.get(t.penggunaId) ?? { penggunaId: t.penggunaId, nama: t.namaAnggota, nik: t.nomorIndukKaryawan, rincian: [], totalBelum: 0, totalLunas: 0 }
      g.rincian.push(t)
      if (t.status === 'Belum') g.totalBelum += t.total
      else g.totalLunas += t.total
      map.set(t.penggunaId, g)
    }
    return [...map.values()].sort((a, b) => b.totalBelum - a.totalBelum)
  }, [tagihan])
  const rekapTampil = rekapAnggota === 'semua' ? rekap : rekap.filter((g) => String(g.penggunaId) === rekapAnggota)
  const totalOutstanding = rekapTampil.reduce((s, g) => s + g.totalBelum, 0)

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
      <div className="panel-heading"><div><h2>{editId ? 'Edit produk koperasi' : 'Tambah produk koperasi'}</h2><p>Produk koperasi langsung tampil di katalog anggota.</p></div>{editId && <button className="toggle-button" onClick={resetForm}>Batal edit</button>}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end', background: editId ? '#f0fbfc' : undefined, borderBottom: '1px solid var(--line)' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Kriteria
          <select value={form.jenis} onChange={(e) => setJenisForm(e.target.value)} style={{ height: 38, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }}>
            <option value="Jual">Penjualan</option><option value="Sewa">Penyewaan</option>
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Nama
          <input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} style={{ width: 200, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>{form.jenis === 'Sewa' ? 'Tarif Sewa' : 'Harga Jual'}
          <input value={form.harga} onChange={(e) => setForm((f) => ({ ...f, harga: e.target.value }))} style={{ width: 130, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }} />
        </label>
        {form.jenis === 'Sewa'
          ? <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Periode Sewa
              <select value={form.satuan} onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))} style={{ width: 130, height: 38, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }}>
                <option value="Hari">Harian</option><option value="Bulan">Bulanan</option>
              </select>
            </label>
          : <>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Stok
                <input value={form.stok} onChange={(e) => setForm((f) => ({ ...f, stok: e.target.value }))} style={{ width: 90, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }}>Satuan
                <input value={form.satuan} onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))} style={{ width: 100, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }} placeholder="pcs / kg / unit" />
              </label>
            </>}
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', flex: 1, minWidth: 200 }}>Deskripsi
          <input value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} style={{ height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, outline: 'none', background: '#fff' }} placeholder="Deskripsi singkat produk" />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'save-produk'} onClick={saveProduk}>{editId ? <CheckCircle2 size={14} /> : <Store size={14} />} {editId ? 'Simpan' : 'Tambah'}</button>
      </div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Produk</th><th>Jenis</th><th>Harga</th><th>Stok</th><th>Sumber</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {produkKoperasi.map((p) => <tr key={p.id}>
          <td><div className="user-cell">
            {p.fotoUrl
              ? <img src={`${API_BASE}${p.fotoUrl}`} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', border: '1px solid #cffafe', flexShrink: 0 }} />
              : <span className="avatar tosca-avatar">{p.nama.charAt(0).toUpperCase()}</span>}
            <div><strong>{p.nama}</strong><small>{p.deskripsi ?? p.kode}</small></div>
          </div></td>
          <td><span className={`role-pill ${p.jenis === 'Sewa' ? 'admin' : 'tosca'}`}>{p.jenis}</span></td>
          <td>{rupiah(p.harga)}/{p.satuan}</td>
          <td>{p.jenis === 'Sewa' ? '—' : p.stok}</td>
          <td>{p.sumber === 'Koperasi' ? <span className="role-pill mini tosca">Koperasi</span> : <span className="role-pill mini" style={{ background: '#f1f5f9', color: '#475569' }}>Titipan {p.diajukanOleh ?? ''}</span>}</td>
          <td><span className={`status-pill ${p.aktif ? 'active' : 'inactive'}`}><i />{p.aktif ? 'Tampil' : 'Disembunyikan'}</span></td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <label className="toggle-button" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Upload size={12} />
              {busyId === `foto-${p.id}` ? '...' : 'Foto'}
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFoto(p.id, f); e.target.value = '' }} />
            </label>
            <button className="toggle-button" onClick={() => editProduk(p)}>Edit</button>
            <button className={`toggle-button ${p.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `t-${p.id}`} onClick={() => void call(`t-${p.id}`, `/api/admin/produk/${p.id}/status`, 'PATCH', { aktif: !p.aktif })}>{p.aktif ? 'Sembunyikan' : 'Tampilkan'}</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && produkKoperasi.length === 0 && <div className="empty-state"><Store size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada produk.</div></div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pengajuan titipan anggota</h2><p>Menyetujui = barang menjadi milik koperasi dan tampil di katalog.</p></div><span className="record-count">{pengajuanTitipan.length} menunggu</span></div>
      <div className="table-scroll"><table><thead><tr><th>Produk</th><th>Anggota</th><th>Jenis</th><th>Harga usulan</th><th>Stok</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pengajuanTitipan.map((p) => <tr key={p.id}>
          <td><div className="user-cell">
            {p.fotoUrl ? <img src={`${API_BASE}${p.fotoUrl}`} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', border: '1px solid #cffafe', flexShrink: 0 }} /> : <span className="avatar tosca-avatar">{p.nama.charAt(0).toUpperCase()}</span>}
            <div><strong>{p.nama}</strong><small>{p.deskripsi ?? '—'}</small></div>
          </div></td>
          <td><strong>{p.diajukanOleh ?? '—'}</strong></td>
          <td><span className={`role-pill ${p.jenis === 'Sewa' ? 'admin' : 'tosca'}`}>{p.jenis}</span></td>
          <td>{rupiah(p.harga)}/{p.satuan}</td>
          <td>{p.stok}</td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <button className="toggle-button activate" disabled={busyId === `pg-${p.id}`} onClick={() => putusanPengajuan(p, true)}>Setujui</button>
            <button className="toggle-button deactivate" disabled={busyId === `pg-${p.id}`} onClick={() => putusanPengajuan(p, false)}>Tolak</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && pengajuanTitipan.length === 0 && <div className="empty-state"><UserPlus size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Tidak ada pengajuan titipan.</div></div>}</div>
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Pembelian & penyewaan anggota</h2><p>Tunai → langsung selesai. Kredit → membuat tagihan hutang.</p></div><span className="record-count">{pembelianMenunggu.length} menunggu</span></div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Produk</th><th>Jenis</th><th>Total</th><th>Metode</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pembelian.map((p) => <tr key={p.id}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{p.namaPembeli.charAt(0).toUpperCase()}</span><div><strong>{p.namaPembeli}</strong><small className="mono">{p.nomorIndukKaryawan}</small></div></div></td>
          <td>{p.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{p.nomorTransaksi}</small></td>
          <td>{p.jenis}<br /><small style={{ color: 'var(--muted)' }}>{p.jumlah}x</small></td>
          <td><strong>{rupiah(p.total)}</strong></td>
          <td><span className={`role-pill ${p.metodePembayaran === 'Kredit' ? 'amber' : 'tosca'}`}>{p.metodePembayaran}</span></td>
          <td><span className={`status-pill ${p.status === 'Selesai' || p.status === 'Disetujui' ? 'active' : p.status === 'Ditolak' ? 'rejected' : 'waiting'}`}><i />{p.status}</span></td>
          <td className="align-right">{p.status === 'Diajukan'
            ? <span style={{ display: 'inline-flex', gap: 6 }}>
                <button className="toggle-button activate" disabled={busyId === `pb-${p.id}`} onClick={() => void call(`pb-${p.id}`, `/api/admin/produk/pembelian/${p.id}/putusan`, 'POST', { setuju: true }, `Setujui ${p.jenis.toLowerCase()} ${p.produkNama} (${rupiah(p.total)}, ${p.metodePembayaran}) oleh ${p.namaPembeli}?`)}>Setujui</button>
                <button className="toggle-button deactivate" disabled={busyId === `pb-${p.id}`} onClick={() => { const c = window.prompt('Alasan penolakan (opsional):'); void call(`pb-${p.id}`, `/api/admin/produk/pembelian/${p.id}/putusan`, 'POST', { setuju: false, catatan: c }) }}>Tolak</button>
              </span>
            : <small style={{ color: 'var(--muted)' }}>{p.diprosesPada ? tanggal(p.diprosesPada) : '—'}</small>}</td>
        </tr>)}
      </tbody></table>{!loading && pembelian.length === 0 && <div className="empty-state"><HandCoins size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada transaksi.</div></div>}</div>
    </section>

    <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Rekap tagihan kredit</h2><p>Rekap hutang kredit produk per anggota, dipotong lewat gaji. Setelah pengurus mengonfirmasi potongan sudah dieksekusi, tandai lunas di sini.</p></div>
        <select value={rekapAnggota} onChange={(e) => setRekapAnggota(e.target.value)} style={{ height: 36, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff', fontSize: 13, outline: 'none' }}>
          <option value="semua">Semua anggota</option>
          {rekap.map((g) => <option key={g.penggunaId} value={String(g.penggunaId)}>{g.nama}</option>)}
        </select>
      </div>
      <div style={{ padding: '12px 25px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#f8fafc' }}>
        <div style={{ fontSize: 13, color: '#083344' }}>
          Total outstanding kredit: <strong style={{ color: totalOutstanding > 0 ? '#b45309' : '#0891b2', fontSize: 14 }}>{rupiah(totalOutstanding)}</strong>
        </div>
        {rekapAnggota === 'semua' && rekap.some((g) => g.totalBelum > 0) && (
          <button className="toggle-button activate" disabled={busyId === 'rekap-lunas'} onClick={() => void call('rekap-lunas', '/api/admin/produk/tagihan-kredit/lunas', 'POST', {}, 'Tandai SEMUA tagihan kredit yang belum lunas menjadi LUNAS?')}>
            <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Tandai semua lunas
          </button>
        )}
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Belum lunas</th><th>Sudah lunas</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {rekapTampil.flatMap((g) => [
          <tr key={g.penggunaId}>
            <td><div className="user-cell"><span className="avatar tosca-avatar">{g.nama.charAt(0).toUpperCase()}</span><div><strong>{g.nama}</strong><small className="mono">{g.nik}</small></div></div></td>
            <td style={{ color: g.totalBelum > 0 ? '#b45309' : 'var(--muted)', fontWeight: g.totalBelum > 0 ? 700 : 400 }}>{rupiah(g.totalBelum)}</td>
            <td style={{ color: '#0891b2', fontWeight: 600 }}>{rupiah(g.totalLunas)}</td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button" onClick={() => setRekapExpanded(rekapExpanded === g.penggunaId ? null : g.penggunaId)}>{rekapExpanded === g.penggunaId ? 'Tutup' : 'Rincian'}</button>
              {g.totalBelum > 0 && <button className="toggle-button activate" disabled={busyId === `rk-${g.penggunaId}`} onClick={() => void call(`rk-${g.penggunaId}`, '/api/admin/produk/tagihan-kredit/lunas', 'POST', { penggunaId: g.penggunaId }, `Tandai tagihan kredit ${g.nama} (${rupiah(g.totalBelum)}) LUNAS?`)}>Tandai lunas</button>}
            </span></td>
          </tr>,
          rekapExpanded === g.penggunaId && <tr key={`${g.penggunaId}-d`}><td colSpan={4} style={{ background: '#f8fafc', padding: '14px 18px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: '#083344', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={15} style={{ color: '#0891b2' }} />
                Rincian Tagihan Kredit — {g.nama} ({g.nik})
              </div>
              <table style={{ minWidth: 520 }}><thead><tr><th>Transaksi</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
                {g.rincian.map((t) => <tr key={t.id}>
                  <td className="mono">{t.nomorTransaksi}</td><td>{t.produkNama}</td><td style={{ fontWeight: 600 }}>{rupiah(t.total)}</td>
                  <td>
                    <span className={`status-pill ${t.status === 'Lunas' ? 'active' : 'waiting'}`} style={{ padding: '2px 7px', fontSize: 10 }}>
                      <i />{t.status === 'Lunas' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td>{tanggal(t.dibuatPada)}</td>
                </tr>)}
              </tbody></table>
            </div>
          </td></tr>,
        ])}
      </tbody></table>{!loading && rekapTampil.length === 0 && <div className="empty-state"><Banknote size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada tagihan kredit.</div></div>}</div>
    </section>
  </div>
}

function EratView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [tab, setTab] = useState<'voting' | 'dokumen' | 'laporan'>('voting')
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
    <section className="welcome-row no-print"><div><h2>E-RAT & dokumen</h2><p>Buat konten voting lalu tayangkan agar muncul di aplikasi anggota. Unggah dokumen RAT — yang terbaru ditandai otomatis.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error no-print"><X size={17} />{error}</div>}
    {notice && <div className="alert success no-print"><BadgeCheck size={17} />{notice}</div>}

    <MenuTabBar
      className="inline no-print"
      tabs={[
        { key: 'voting', label: 'Voting Agenda', icon: <Vote size={15} />, badge: aktifCount > 0 ? aktifCount : undefined },
        { key: 'dokumen', label: 'Dokumen RAT', icon: <FileText size={15} /> },
        { key: 'laporan', label: 'Laporan RAT (Otomatis)', icon: <FileSpreadsheet size={15} /> },
      ]}
      active={tab}
      onChange={setTab}
    />

    {tab === 'voting' && <>
    <section className="stat-grid">
      <StatCard label="Agenda tayang" value={aktifCount} icon={<Vote size={20} />} tone="teal" />
      <StatCard label="Total agenda" value={agenda.length} icon={<Vote size={20} />} tone="blue" />
      <StatCard label="Dokumen RAT" value={dokumen.length} icon={<FileText size={20} />} tone="teal" />
      <StatCard label="Dokumen tampil" value={dokumen.filter((d) => d.aktif).length} icon={<FileText size={20} />} tone="green" />
    </section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Buat agenda voting</h2><p>Satu pilihan per baris. Agenda dibuat sebagai draf — tayangkan untuk memunculkannya ke anggota.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'start' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344', flex: 1, minWidth: 220 }}>Judul
          <input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="mis. Pengesahan Laporan Pertanggungjawaban 2026" style={{ height: 38, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344', flex: 1, minWidth: 220 }}>Deskripsi
          <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Penjelasan singkat mengenai agenda voting ini..." style={{ height: 38, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344', flex: 1, minWidth: 200 }}>Pilihan (satu per baris)
          <textarea value={opsiText} onChange={(e) => setOpsiText(e.target.value)} rows={3} placeholder={"Setuju\nTidak Setuju\nAbstain"} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', background: '#fff' }} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px', alignSelf: 'end' }} disabled={busyId === 'new-agenda'} onClick={createAgenda}><PlusCircle size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Buat draf</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Agenda</th><th>Pilihan & suara</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {agenda.map((a) => {
          const adaSuara = a.totalSuara > 0
          return <tr key={a.id}>
            <td style={{ whiteSpace: 'normal', maxWidth: 260 }}>
              <strong style={{ color: '#083344', fontSize: 13 }}>{a.judul}</strong>
              {a.deskripsi && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{a.deskripsi}</div>}
            </td>
            <td style={{ whiteSpace: 'normal', maxWidth: 260 }}>
              {a.opsi.map((o) => <div key={o.id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '3px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 4 }}>
                <span style={{ flex: 1, fontSize: 12, color: '#1e293b' }}>{o.label}</span>
                <span className="mono" style={{ background: '#ecfeff', color: '#0891b2', fontWeight: 700, padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>{o.jumlah} suara</span>
                {a.status === 'Draft' && !adaSuara && a.opsi.length > 2 && <button className="toggle-button deactivate" style={{ padding: '1px 5px', fontSize: 12, lineHeight: 1 }} disabled={busyId === `op-${a.id}`} onClick={() => void call(`op-${a.id}`, `/api/admin/erat/agenda/${a.id}/opsi/${o.id}`, 'DELETE')} title="Hapus pilihan">×</button>}
              </div>)}
              {a.status === 'Draft' && !adaSuara && <button className="toggle-button" style={{ marginTop: 2, fontSize: 11, padding: '3px 8px' }} disabled={busyId === `op-${a.id}`} onClick={() => addOpsi(a)}>+ Tambah Pilihan</button>}
              <div style={{ marginTop: 5, fontSize: 11.5, fontWeight: 700, color: '#0891b2', display: 'flex', alignItems: 'center', gap: 4 }}><Vote size={13} /> {a.totalSuara} total suara masuk</div>
            </td>
            <td><span className={`status-pill ${a.status === 'Aktif' ? 'active' : a.status === 'Draft' ? 'waiting' : 'inactive'}`}><i />{a.status === 'Aktif' ? 'Tayang' : a.status}</span></td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {a.status !== 'Aktif' && <button className="toggle-button activate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Aktif' })}><Eye size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Tayangkan</button>}
              {a.status === 'Aktif' && <button className="toggle-button deactivate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Draft' }, 'Sembunyikan agenda dari anggota (kembali ke draf)?')}><EyeOff size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Sembunyikan</button>}
              {a.status === 'Aktif' && <button className="toggle-button" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}/status`, 'PATCH', { status: 'Selesai' }, 'Tutup voting? Anggota akan melihat hasil akhir.')}><CheckCircle2 size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Selesai</button>}
              {!adaSuara && <button className="toggle-button deactivate" disabled={busyId === `st-${a.id}`} onClick={() => void call(`st-${a.id}`, `/api/admin/erat/agenda/${a.id}`, 'DELETE', undefined, `Hapus agenda "${a.judul}"?`)}><Trash2 size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Hapus</button>}
            </span></td>
          </tr>
        })}
      </tbody></table>{!loading && agenda.length === 0 && <div className="empty-state"><Vote size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada agenda voting.</div></div>}</div>
    </section>
    </>}

    {tab === 'dokumen' && <section className="table-panel">
      <div className="panel-heading"><div><h2>Dokumen RAT (arsip pengurus)</h2><p>Unggah PDF. Anggota hanya melihat dokumen tahun <strong>terbaru</strong>; arsip tahun-tahun sebelumnya hanya tampil di sini untuk pengurus.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 25px 22px', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344', flex: 1, minWidth: 200 }}>Judul
          <input value={docJudul} onChange={(e) => setDocJudul(e.target.value)} placeholder="mis. Buku Laporan Tahunan RAT 2026" style={{ height: 38, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344' }}>Tahun
          <input type="number" value={docTahun} onChange={(e) => setDocTahun(e.target.value)} style={{ width: 100, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344', flex: 1, minWidth: 180 }}>Deskripsi
          <input value={docDeskripsi} onChange={(e) => setDocDeskripsi(e.target.value)} placeholder="Keterangan singkat dokumen..." style={{ height: 38, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
        </label>
        <label className="toggle-button" style={{ cursor: 'pointer', height: 38, display: 'inline-flex', alignItems: 'center', gap: 6, background: docFile ? '#ecfeff' : '#fff', borderColor: docFile ? '#0891b2' : 'var(--line)', color: docFile ? '#0891b2' : 'inherit', fontWeight: docFile ? 700 : 500 }}>
          <Upload size={14} />
          <span>{docFile ? docFile.name.slice(0, 20) : 'Pilih Berkas PDF'}</span>
          <input type="file" accept="application/pdf" hidden onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={busyId === 'upload-doc'} onClick={uploadDoc}><Upload size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Unggah</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Dokumen</th><th>Tahun</th><th>Diterbitkan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {dokumen.map((d) => <tr key={d.id}>
          <td>
            <strong style={{ color: '#083344' }}>{d.judul}</strong>
            {d.aktif && dokumen[0] && d.tahun === dokumen[0].tahun && <span className="role-pill tosca" style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', verticalAlign: 1 }}>Dilihat anggota</span>}
            {d.deskripsi && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{d.deskripsi}</div>}
          </td>
          <td><span style={{ fontWeight: 700, color: '#083344' }}>{d.tahun}</span></td>
          <td><span style={{ fontSize: 12, color: '#526763' }}>{tanggal(d.diterbitkanPada)}</span></td>
          <td><span className={`status-pill ${d.aktif ? 'active' : 'inactive'}`}><i />{d.aktif ? 'Tampil' : 'Disembunyikan'}</span></td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <a className="toggle-button" href={`${API_BASE}/api/erat/laporan-tahunan/${d.id}/berkas`} target="_blank" rel="noreferrer"><ExternalLink size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Buka</a>
            <button className={`toggle-button ${d.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `d-${d.id}`} onClick={() => void call(`d-${d.id}`, `/api/admin/erat/laporan/${d.id}`, 'PATCH', { aktif: !d.aktif })}>{d.aktif ? <><EyeOff size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Sembunyikan</> : <><Eye size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Tampilkan</>}</button>
            <button className="toggle-button deactivate" disabled={busyId === `d-${d.id}`} onClick={() => void call(`d-${d.id}`, `/api/admin/erat/laporan/${d.id}`, 'DELETE', undefined, `Hapus dokumen "${d.judul}" permanen?`)}><Trash2 size={13} style={{ verticalAlign: -1, marginRight: 4 }} />Hapus</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && dokumen.length === 0 && <div className="empty-state"><FileText size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada dokumen RAT.</div></div>}</div>
    </section>}

    {tab === 'laporan' && <LaporanRatPanel token={token} onExpired={onExpired} />}
  </div>
}

function LaporanRatPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [data, setData] = useState<LaporanRat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mode, setMode] = useState<'lihat' | 'edit'>('lihat')
  const [busyId, setBusyId] = useState('')

  const [visi, setVisi] = useState(''); const [misi, setMisi] = useState('')
  const [alamat, setAlamat] = useState(''); const [tglDidirikan, setTglDidirikan] = useState('')
  const [noAkta, setNoAkta] = useState(''); const [tglAkta, setTglAkta] = useState('')
  const [kegiatanBisnis, setKegiatanBisnis] = useState(''); const [kegiatanSosial, setKegiatanSosial] = useState('')
  const [rencanaBisnis, setRencanaBisnis] = useState(''); const [rencanaSosial, setRencanaSosial] = useState('')
  const [rabPendapatanPinjaman, setRabPendapatanPinjaman] = useState(''); const [rabPendapatanLain, setRabPendapatanLain] = useState('')
  const [rabBebanOperasional, setRabBebanOperasional] = useState(''); const [rabBebanUmum, setRabBebanUmum] = useState('')
  const [rabCadanganPiutang, setRabCadanganPiutang] = useState(''); const [realisasiPajakShu, setRealisasiPajakShu] = useState('')
  const [catatanTambahan, setCatatanTambahan] = useState('')

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const jsonHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const isiForm = (d: LaporanRat) => {
    setVisi(d.profil.visi); setMisi(d.profil.misi); setAlamat(d.profil.alamatKantor ?? '')
    setTglDidirikan(d.profil.tanggalDidirikan?.slice(0, 10) ?? ''); setNoAkta(d.profil.nomorAktaPendirian ?? '')
    setTglAkta(d.profil.tanggalAkta?.slice(0, 10) ?? '')
    setKegiatanBisnis(d.konten.kegiatanBisnis ?? ''); setKegiatanSosial(d.konten.kegiatanSosial ?? '')
    setRencanaBisnis(d.konten.rencanaBisnisTahunDepan ?? ''); setRencanaSosial(d.konten.rencanaSosialTahunDepan ?? '')
    setRabPendapatanPinjaman(d.konten.rabPendapatanPinjaman != null ? String(d.konten.rabPendapatanPinjaman) : '')
    setRabPendapatanLain(d.konten.rabPendapatanLain != null ? String(d.konten.rabPendapatanLain) : '')
    setRabBebanOperasional(d.konten.rabBebanOperasional != null ? String(d.konten.rabBebanOperasional) : '')
    setRabBebanUmum(d.konten.rabBebanUmum != null ? String(d.konten.rabBebanUmum) : '')
    setRabCadanganPiutang(d.konten.rabCadanganPiutang != null ? String(d.konten.rabCadanganPiutang) : '')
    setRealisasiPajakShu(d.konten.realisasiPajakShu != null ? String(d.konten.realisasiPajakShu) : '')
    setCatatanTambahan(d.konten.catatanTambahan ?? '')
  }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/rat/${tahun}/laporan`, { headers })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error(response.status === 403 ? 'Akun ini belum memiliki akses.' : 'Gagal memuat laporan RAT.')
      const d: LaporanRat = await response.json()
      setData(d); isiForm(d)
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [headers, onExpired, tahun])
  useEffect(() => { void load() }, [load])

  const simpanProfil = async () => {
    setBusyId('profil'); setError('')
    try {
      const body = { visi, misi, alamatKantor: alamat || null, tanggalDidirikan: tglDidirikan || null, nomorAktaPendirian: noAkta || null, tanggalAkta: tglAkta || null }
      const response = await fetch(`${API_BASE}/api/admin/profil-koperasi`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(body) })
      const hasil = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(hasil.message ?? 'Gagal menyimpan profil.')
      flash('Profil koperasi disimpan.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan profil.') }
    finally { setBusyId('') }
  }

  const simpanKonten = async () => {
    setBusyId('konten'); setError('')
    try {
      const num = (s: string) => s.trim() === '' ? null : Number(s)
      const body = {
        kegiatanBisnis: kegiatanBisnis || null, kegiatanSosial: kegiatanSosial || null,
        rencanaBisnisTahunDepan: rencanaBisnis || null, rencanaSosialTahunDepan: rencanaSosial || null,
        rabPendapatanPinjaman: num(rabPendapatanPinjaman), rabPendapatanLain: num(rabPendapatanLain),
        rabBebanOperasional: num(rabBebanOperasional), rabBebanUmum: num(rabBebanUmum), rabCadanganPiutang: num(rabCadanganPiutang),
        realisasiPajakShu: num(realisasiPajakShu), catatanTambahan: catatanTambahan || null,
      }
      const response = await fetch(`${API_BASE}/api/admin/rat/${tahun}/konten`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(body) })
      const hasil = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(hasil.message ?? 'Gagal menyimpan konten.')
      flash('Konten RAT disimpan.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan konten.') }
    finally { setBusyId('') }
  }

  const publikasikan = async (publish: boolean) => {
    if (publish && !window.confirm(`Tayangkan laporan RAT tahun ${tahun} ke aplikasi anggota? Semua anggota aktif akan bisa membacanya.`)) return
    if (!publish && !window.confirm(`Batalkan penayangan laporan RAT tahun ${tahun}? Laporan akan hilang dari aplikasi anggota.`)) return
    setBusyId('publikasi'); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/rat/${tahun}/publikasikan`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ publikasikan: publish }) })
      const hasil = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(hasil.message ?? 'Gagal memproses penayangan.')
      flash(hasil.message ?? 'Berhasil.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses penayangan.') }
    finally { setBusyId('') }
  }

  const capaian = (realisasi: number, rencana: number | null) => rencana && rencana !== 0 ? `${((realisasi / rencana) * 100).toFixed(0)}%` : '—'
  const jasaPinjaman = data?.labaRugi.pendapatan.find((p) => p.kode === '4-4100')?.saldo ?? 0
  const pendapatanLain = data ? data.labaRugi.totalPendapatan - jasaPinjaman : 0

  return <div>
    <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 18, background: '#fff', padding: '10px 16px', border: '1px solid var(--line)', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#083344' }}>Tahun buku
        <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} style={{ width: 80, height: 32, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6, background: '#fff', fontSize: 12 }} />
      </label>
      <button className={`toggle-button ${mode === 'lihat' ? 'activate' : ''}`} style={{ height: 32, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 10px', fontSize: 11.5, borderRadius: 6 }} onClick={() => setMode('lihat')}><Eye size={13} />Lihat laporan</button>
      <button className={`toggle-button ${mode === 'edit' ? 'activate' : ''}`} style={{ height: 32, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 10px', fontSize: 11.5, borderRadius: 6 }} onClick={() => setMode('edit')}><Edit size={13} />Edit konten & RAB</button>
      {mode === 'lihat' && <button className="submit-button" style={{ width: 'auto', height: 32, padding: '0 12px', fontSize: 11.5, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => window.print()} title="Cetak atau simpan laporan sebagai PDF"><Download size={13} />Cetak PDF</button>}
      {mode === 'lihat' && data && (data.konten.dipublikasikan
        ? <button className="toggle-button deactivate" style={{ height: 32, padding: '0 10px', fontSize: 11.5, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }} disabled={busyId === 'publikasi'} onClick={() => void publikasikan(false)} title="Batalkan penayangan laporan dari aplikasi anggota"><EyeOff size={13} />Batal Tayang</button>
        : <button className="submit-button" style={{ width: 'auto', height: 32, padding: '0 12px', fontSize: 11.5, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: data.itemBelumLengkap.length > 0 ? '#a9bab5' : undefined }}
            disabled={busyId === 'publikasi' || data.itemBelumLengkap.length > 0} title={data.itemBelumLengkap.length > 0 ? `Lengkapi dulu: ${data.itemBelumLengkap.join('; ')}` : 'Tayangkan laporan tahun ini ke aplikasi anggota'}
            onClick={() => void publikasikan(true)}><Send size={13} />Tayangkan</button>)}
      <span className="sync-label" style={{ marginLeft: 'auto', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Activity size={15} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => void load()} title="Muat ulang"><RefreshCw size={14} /></button></span>
    </div>
    {error && <div className="alert error no-print"><X size={17} />{error}</div>}
    {notice && <div className="alert success no-print"><BadgeCheck size={17} />{notice}</div>}
    {mode === 'lihat' && data && data.konten.dipublikasikan && <div className="alert success no-print"><BadgeCheck size={17} />Laporan tahun {tahun} sedang tayang di aplikasi anggota{data.konten.dipublikasikanPada ? ` sejak ${tanggal(data.konten.dipublikasikanPada)}` : ''}.</div>}
    {mode === 'lihat' && data && !data.konten.dipublikasikan && data.itemBelumLengkap.length > 0 && <div className="alert error no-print" style={{ alignItems: 'start' }}>
      <X size={17} style={{ marginTop: 2, flex: '0 0 auto' }} />
      <div>Belum bisa ditayangkan ke anggota, lengkapi dulu: <strong>{data.itemBelumLengkap.join('; ')}</strong>.</div>
    </div>}

    {mode === 'edit' && <div style={{ display: 'grid', gap: 18 }}>
      <section className="table-panel">
        <div className="panel-heading"><div><h2>Profil koperasi</h2><p>Konten statis (jarang berubah) — dipakai di kop setiap laporan RAT, tidak berulang per tahun.</p></div></div>
        <div style={{ display: 'grid', gap: 12, padding: '16px 25px 22px' }}>
          <label style={{ ...labelStyle, color: '#083344' }}>Visi<textarea value={visi} onChange={(e) => setVisi(e.target.value)} rows={2} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <label style={{ ...labelStyle, color: '#083344' }}>Misi (satu poin per baris)<textarea value={misi} onChange={(e) => setMisi(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ ...labelStyle, color: '#083344', flex: 1, minWidth: 220 }}>Alamat kantor<input value={alamat} onChange={(e) => setAlamat(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>Tanggal didirikan<input type="date" value={tglDidirikan} onChange={(e) => setTglDidirikan(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>No. Akta Pendirian<input value={noAkta} onChange={(e) => setNoAkta(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>Tanggal Akta<input type="date" value={tglAkta} onChange={(e) => setTglAkta(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
          </div>
          <button className="submit-button" style={{ width: 'auto', height: 40, padding: '0 20px', justifySelf: 'start' }} disabled={busyId === 'profil'} onClick={simpanProfil}><CheckCircle2 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Simpan profil</button>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-heading"><div><h2>Konten & RAB tahun {tahun}</h2><p>Narasi kegiatan, rencana tahun depan, dan target RAB untuk kolom "Rencana" pembanding realisasi — khusus tahun buku ini.</p></div></div>
        <div style={{ display: 'grid', gap: 12, padding: '16px 25px 22px' }}>
          <label style={{ ...labelStyle, color: '#083344' }}>Kegiatan Bisnis tahun {tahun} (satu poin per baris)<textarea value={kegiatanBisnis} onChange={(e) => setKegiatanBisnis(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <label style={{ ...labelStyle, color: '#083344' }}>Kegiatan Sosial tahun {tahun} (satu poin per baris)<textarea value={kegiatanSosial} onChange={(e) => setKegiatanSosial(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <label style={{ ...labelStyle, color: '#083344' }}>Rencana Kegiatan Bisnis tahun {tahun + 1}<textarea value={rencanaBisnis} onChange={(e) => setRencanaBisnis(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <label style={{ ...labelStyle, color: '#083344' }}>Rencana Kegiatan Sosial tahun {tahun + 1}<textarea value={rencanaSosial} onChange={(e) => setRencanaSosial(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ ...labelStyle, color: '#083344' }}>RAB Pendapatan Pinjaman<input type="number" value={rabPendapatanPinjaman} onChange={(e) => setRabPendapatanPinjaman(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>RAB Pendapatan Lain<input type="number" value={rabPendapatanLain} onChange={(e) => setRabPendapatanLain(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>RAB Beban Operasional<input type="number" value={rabBebanOperasional} onChange={(e) => setRabBebanOperasional(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>RAB Beban Umum<input type="number" value={rabBebanUmum} onChange={(e) => setRabBebanUmum(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>RAB Cadangan Piutang<input type="number" value={rabCadanganPiutang} onChange={(e) => setRabCadanganPiutang(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, color: '#083344' }}>Realisasi Pajak SHU (badan)<input type="number" value={realisasiPajakShu} onChange={(e) => setRealisasiPajakShu(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
          </div>
          <label style={{ ...labelStyle, color: '#083344' }}>Catatan tambahan<textarea value={catatanTambahan} onChange={(e) => setCatatanTambahan(e.target.value)} rows={2} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', background: '#fff' }} /></label>
          <button className="submit-button" style={{ width: 'auto', height: 40, padding: '0 20px', justifySelf: 'start' }} disabled={busyId === 'konten'} onClick={simpanKonten}><CheckCircle2 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Simpan konten & RAB tahun {tahun}</button>
        </div>
      </section>
    </div>}

    {mode === 'lihat' && data && <div className="rat-print-area" style={{ maxWidth: 1060, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 4px 20px -2px rgba(8, 145, 178, 0.08), 0 2px 6px rgba(0,0,0,0.03)', padding: '36px 44px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30, paddingBottom: 22, borderBottom: '2px solid #0891b2' }}>
        <img src={logoKkcs} alt="Logo KKCS" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 8 }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 999, background: '#ecfeff', border: '1px solid #cffafe', color: '#0891b2', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          Dokumen Resmi Laporan RAT
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#083344', letterSpacing: '-0.01em' }}>LAPORAN RAPAT ANGGOTA TAHUNAN</h1>
        <h2 style={{ margin: '6px 0 8px', fontSize: 16, fontWeight: 700, color: '#0891b2' }}>KOPERASI KONSUMEN KARYAWAN CIPTA SEJAHTERA (KKCS)</h2>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{data.profil.alamatKantor}</p>
        <div style={{ display: 'inline-block', margin: '12px 0 0', padding: '5px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #0891b2, #0e7490)', color: '#ffffff', fontSize: 13, fontWeight: 800, boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)' }}>Tahun Buku {data.tahun}</div>
      </div>

      <RatSection judul="Visi & Misi">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: '#f0fdfa', border: '1px solid #a5f3fc', borderRadius: 10, padding: '18px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0891b2', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0891b2' }}></span> Visi
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0, color: '#083344', fontWeight: 600 }}>{data.profil.visi}</p>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0e7490', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0e7490' }}></span> Misi
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-line', margin: 0, color: '#334155' }}>{data.profil.misi}</p>
          </div>
        </div>
      </RatSection>

      <RatSection judul="Keanggotaan">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <StatCard label="Anggota aktif saat ini" value={data.totalAnggotaAktifSaatIni} icon={<Users size={20} />} tone="teal" />
          <StatCard label={`Anggota baru disetujui ${data.tahun}`} value={data.anggotaBaruTahunIni} icon={<UserPlus size={20} />} tone="green" />
          <StatCard label="Anggota nonaktif saat ini" value={data.totalAnggotaNonaktifSaatIni} icon={<Users size={20} />} tone="amber" />
        </div>
      </RatSection>

      <RatSection judul="Laporan Kegiatan Usaha">
        {(data.konten.kegiatanBisnis || data.konten.kegiatanSosial) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {data.konten.kegiatanBisnis && <RatContentBlock label="Kegiatan Bisnis" text={data.konten.kegiatanBisnis} tone="teal" />}
            {data.konten.kegiatanSosial && <RatContentBlock label="Kegiatan Sosial" text={data.konten.kegiatanSosial} tone="amber" />}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 10, fontSize: 12.5, color: 'var(--muted)' }}>
            Belum diisi — lengkapi lewat mode "Edit konten & RAB".
          </div>
        )}
      </RatSection>

      <RatSection judul="Laporan Perhitungan Sisa Hasil Usaha (SHU)">
        <div className="table-scroll" style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}><table><thead><tr><th>Uraian</th><th className="align-right">Realisasi</th><th className="align-right">Rencana</th><th className="align-right">%</th></tr></thead><tbody>
          <tr><td>Pendapatan Jasa Pinjaman</td><td className="align-right">{rupiah(jasaPinjaman)}</td><td className="align-right">{data.konten.rabPendapatanPinjaman != null ? rupiah(data.konten.rabPendapatanPinjaman) : '—'}</td><td className="align-right">{capaian(jasaPinjaman, data.konten.rabPendapatanPinjaman)}</td></tr>
          <tr><td>Pendapatan Lain-lain</td><td className="align-right">{rupiah(pendapatanLain)}</td><td className="align-right">{data.konten.rabPendapatanLain != null ? rupiah(data.konten.rabPendapatanLain) : '—'}</td><td className="align-right">{capaian(pendapatanLain, data.konten.rabPendapatanLain)}</td></tr>
          <tr style={{ fontWeight: 700, background: '#f8fafc' }}><td>Total Pendapatan</td><td className="align-right">{rupiah(data.labaRugi.totalPendapatan)}</td><td className="align-right">{data.rabTotalPendapatan != null ? rupiah(data.rabTotalPendapatan) : '—'}</td><td className="align-right">{capaian(data.labaRugi.totalPendapatan, data.rabTotalPendapatan)}</td></tr>
          <tr><td>Beban Operasional</td><td className="align-right">{rupiah(data.realisasiBebanOperasional)}</td><td className="align-right">{data.konten.rabBebanOperasional != null ? rupiah(data.konten.rabBebanOperasional) : '—'}</td><td className="align-right">{capaian(data.realisasiBebanOperasional, data.konten.rabBebanOperasional)}</td></tr>
          <tr><td>Beban Umum</td><td className="align-right">{rupiah(data.realisasiBebanUmum)}</td><td className="align-right">{data.konten.rabBebanUmum != null ? rupiah(data.konten.rabBebanUmum) : '—'}</td><td className="align-right">{capaian(data.realisasiBebanUmum, data.konten.rabBebanUmum)}</td></tr>
          <tr><td>Beban Cadangan Piutang</td><td className="align-right">{rupiah(data.realisasiBebanCadanganPiutang)}</td><td className="align-right">{data.konten.rabCadanganPiutang != null ? rupiah(data.konten.rabCadanganPiutang) : '—'}</td><td className="align-right">{capaian(data.realisasiBebanCadanganPiutang, data.konten.rabCadanganPiutang)}</td></tr>
          <tr style={{ fontWeight: 700, background: '#f8fafc' }}><td>Total Beban</td><td className="align-right">{rupiah(data.labaRugi.totalBeban)}</td><td className="align-right">{data.rabTotalBeban != null ? rupiah(data.rabTotalBeban) : '—'}</td><td className="align-right">{capaian(data.labaRugi.totalBeban, data.rabTotalBeban)}</td></tr>
          <tr style={{ fontWeight: 700, background: '#f0fdfa', color: '#083344' }}><td>SHU Sebelum Pajak</td><td className="align-right">{rupiah(data.shuSebelumPajak)}</td><td className="align-right" colSpan={2}>{data.rabTotalPendapatan != null && data.rabTotalBeban != null ? rupiah(data.rabTotalPendapatan - data.rabTotalBeban) : '—'}</td></tr>
          <tr><td>Pajak</td><td className="align-right">{data.pajakShu != null ? `−${rupiah(data.pajakShu)}` : 'Belum diisi'}</td><td colSpan={2}></td></tr>
          <tr style={{ fontWeight: 800, background: '#ecfeff', color: '#0891b2' }}><td>SHU Setelah Pajak</td><td className="align-right">{rupiah(data.shuSetelahPajak ?? data.shuSebelumPajak)}</td><td colSpan={2}></td></tr>
        </tbody></table></div>
        {data.shu && (() => {
          const shu = data.shu
          // Finalisasi lama (sebelum kebijakan 2 lapis) tidak punya persenAnggota tersendiri — dulu
          // persenJasaModal/persenJasaUsaha adalah fraksi LANGSUNG dari Total SHU, jadi jumlah keduanya
          // = porsi Anggota sebenarnya. Rekonstruksi di sini supaya tetap tampil benar (bukan 0%), lalu
          // normalisasi JMA/JUA jadi sub-split di dalam pool Anggota itu (persis makna Lapis 2 sekarang).
          const persenAnggota = shu.persenAnggota > 0 ? shu.persenAnggota : (shu.persenJasaModal + shu.persenJasaUsaha)
          const persenModal = shu.persenAnggota > 0 || persenAnggota === 0 ? shu.persenJasaModal : shu.persenJasaModal / persenAnggota
          const persenUsaha = shu.persenAnggota > 0 || persenAnggota === 0 ? shu.persenJasaUsaha : shu.persenJasaUsaha / persenAnggota
          const anggotaPool = shu.totalShu * persenAnggota
          return <div style={{ marginTop: 24, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: '#083344' }}>Kebijakan Pembagian SHU {data.tahun}</h4>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)' }}>Difinalisasi {tanggal(shu.difinalisasiPada)} · dibagikan ke {shu.jumlahAnggota} anggota aktif sesuai Keputusan RAT.</p>

          <div style={{ padding: '18px 22px', border: '1px solid #cffafe', borderRadius: 12, background: '#ecfeff', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 20, background: '#a5f3fc', color: '#083344', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Lapis 1 — Pembagian Total SHU
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#083344', marginTop: 4 }}>{rupiah(shu.totalShu)}</div>
            </div>
            <AllocationBar segments={[
              { value: persenAnggota, color: '#0891b2', label: 'Anggota' },
              { value: shu.persenPengurus ?? 0, color: '#b45309', label: 'Pengurus' },
              { value: shu.persenCadangan ?? 0, color: '#0e7490', label: 'Cadangan' },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
              <StatCard label={`Anggota (${(persenAnggota * 100).toFixed(0)}%, dipecah di Lapis 2)`} value={anggotaPool} icon={<Users size={18} />} tone="teal" money />
              <StatCard label={`Pengurus (${((shu.persenPengurus ?? 0) * 100).toFixed(0)}%)`} value={shu.jasaPengurusPool ?? 0} icon={<Wallet size={18} />} tone="amber" money />
              <StatCard label={`Cadangan (${((shu.persenCadangan ?? 0) * 100).toFixed(0)}%, ditahan permanen)`} value={shu.cadanganAmount ?? 0} icon={<Scale size={18} />} tone="blue" money />
            </div>
          </div>

          <div style={{ padding: '18px 22px', border: '1px solid #fef3c7', borderRadius: 12, background: '#fffbeb' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 20, background: '#fde68a', color: '#78350f', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Lapis 2 — Pembagian Pool Anggota
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#78350f', marginTop: 4 }}>{rupiah(anggotaPool)}</div>
            </div>
            <AllocationBar segments={[
              { value: persenModal, color: '#0891b2', label: 'Jasa Modal' },
              { value: persenUsaha, color: '#0e7490', label: 'Jasa Usaha' },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
              <StatCard label={`Jasa Modal Anggota — JMA (${(persenModal * 100).toFixed(0)}%)`} value={anggotaPool * persenModal} icon={<PiggyBank size={18} />} tone="teal" money />
              <StatCard label={`Jasa Usaha Anggota — JUA (${(persenUsaha * 100).toFixed(0)}%)`} value={anggotaPool * persenUsaha} icon={<TrendingUp size={18} />} tone="green" money />
            </div>
            <div style={{ textAlign: 'center', margin: '14px 0 0', paddingTop: 10, borderTop: '1px dashed #fde68a', fontSize: 12.5, color: '#78350f' }}>
              Total neto diterima anggota (JMA + JUA setelah PPh {rupiah(shu.totalPajak)}): <strong style={{ color: '#083344', fontSize: 13.5 }}>{rupiah(shu.totalShuNeto)}</strong>
            </div>
          </div>
        </div>
        })()}
        {!data.shu && <div style={{ marginTop: 16, fontSize: 12.5, color: '#ad6a16', textAlign: 'center', padding: '12px 16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>SHU tahun buku {data.tahun} belum difinalisasi di menu Akuntansi → tab SHU.</div>}
      </RatSection>

      <RatSection judul={`Neraca per 31 Desember ${data.tahun}`}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ flex: '1 1 320px', minWidth: 280 }}><AkunTable items={data.neracaAkhirTahun.aset} title={`ASET — ${rupiah(data.neracaAkhirTahun.totalAset)}`} /></div>
          <div style={{ flex: '1 1 320px', minWidth: 280 }}>
            <AkunTable items={data.neracaAkhirTahun.liabilitas} title={`LIABILITAS — ${rupiah(data.neracaAkhirTahun.totalLiabilitas)}`} />
            <div style={{ height: 16 }} />
            <AkunTable items={[...data.neracaAkhirTahun.ekuitas, { kode: '3-3900', nama: 'SHU Tahun Berjalan', saldo: data.neracaAkhirTahun.shuBerjalan }]} title={`EKUITAS — ${rupiah(data.neracaAkhirTahun.totalEkuitas)}`} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 12, paddingTop: 14 }}>
          <div style={{ background: '#f0fdfa', border: '1px solid #a5f3fc', borderRadius: 10, padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#0891b2' }}>Total Aset</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#083344', marginTop: 3 }}>{rupiah(data.neracaAkhirTahun.totalAset)}</div>
          </div>
          <div style={{ background: '#f0fdfa', border: '1px solid #a5f3fc', borderRadius: 10, padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#0e7490' }}>Total Liabilitas + Ekuitas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#083344', marginTop: 3 }}>{rupiah(data.neracaAkhirTahun.totalLiabilitas + data.neracaAkhirTahun.totalEkuitas)}</div>
          </div>
        </div>
        <div className={`alert ${Math.abs(data.neracaAkhirTahun.selisih) < 1 ? 'success' : 'error'}`} style={{ marginTop: 6, justifyContent: 'center', textAlign: 'center' }}>
          {Math.abs(data.neracaAkhirTahun.selisih) < 1 ? <BadgeCheck size={16} /> : <X size={16} />}
          <span style={{ fontWeight: 600 }}>{Math.abs(data.neracaAkhirTahun.selisih) < 1 ? 'Neraca Seimbang — ' : 'Neraca Tidak Seimbang — '}Selisih: {rupiah(data.neracaAkhirTahun.selisih)}</span>
        </div>
      </RatSection>

      {data.neracaTahunLalu && <RatSection judul={`Pembanding Neraca per 31 Desember ${data.tahun - 1}`}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 280 }}><AkunTable items={data.neracaTahunLalu.aset} title={`ASET — ${rupiah(data.neracaTahunLalu.totalAset)}`} /></div>
          <div style={{ flex: '1 1 320px', minWidth: 280 }}>
            <AkunTable items={data.neracaTahunLalu.liabilitas} title={`LIABILITAS — ${rupiah(data.neracaTahunLalu.totalLiabilitas)}`} />
            <div style={{ height: 16 }} />
            <AkunTable items={[...data.neracaTahunLalu.ekuitas, { kode: '3-3900', nama: 'SHU Tahun Berjalan', saldo: data.neracaTahunLalu.shuBerjalan }]} title={`EKUITAS — ${rupiah(data.neracaTahunLalu.totalEkuitas)}`} />
          </div>
        </div>
      </RatSection>}

      {(data.konten.rencanaBisnisTahunDepan || data.konten.rencanaSosialTahunDepan) && <RatSection judul={`Rencana Kegiatan Tahun ${data.tahun + 1}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {data.konten.rencanaBisnisTahunDepan && <RatContentBlock label="Rencana Kegiatan Bisnis" text={data.konten.rencanaBisnisTahunDepan} tone="teal" />}
          {data.konten.rencanaSosialTahunDepan && <RatContentBlock label="Rencana Kegiatan Sosial" text={data.konten.rencanaSosialTahunDepan} tone="amber" />}
        </div>
      </RatSection>}

      {data.konten.catatanTambahan && <RatSection judul="Catatan Tambahan">
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0, color: '#334155' }}>{data.konten.catatanTambahan}</p>
        </div>
      </RatSection>}

      <RatSection judul="Lampiran — Buku Besar per Akun (Saldo Awal, Mutasi, Saldo Akhir)">
        <div className="table-scroll" style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}><table><thead><tr><th>Akun</th><th className="align-right">Saldo Awal</th><th className="align-right">Debit</th><th className="align-right">Kredit</th><th className="align-right">Saldo Akhir</th></tr></thead><tbody>
          {data.bukuBesar.map((b) => <tr key={b.kode}>
            <td><span className="mono" style={{ marginRight: 6 }}>{b.kode}</span>{b.nama} <span style={{ color: 'var(--muted)' }}>({b.tipe})</span></td>
            <td className="align-right">{rupiah(b.saldoAwal)}</td>
            <td className="align-right">{rupiah(b.debit)}</td>
            <td className="align-right">{rupiah(b.kredit)}</td>
            <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(b.saldoAkhir)}</td>
          </tr>)}
        </tbody></table>{data.bukuBesar.length === 0 && <div className="empty-state"><BookOpen size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada mutasi jurnal untuk tahun ini.</div></div>}</div>
      </RatSection>

      <div style={{ textAlign: 'center', marginTop: 36, paddingTop: 20, borderTop: '1px solid #e2e8f0', color: 'var(--muted)', fontSize: 11.5 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 16px', borderRadius: 999, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
          <BadgeCheck size={14} style={{ color: '#0891b2' }} /> Laporan disusun otomatis dari sistem KKCS pada {waktu(new Date().toISOString())}
        </div>
      </div>
    </div>}
  </div>
}

function RatSection({ judul, children }: { judul: string; children: ReactNode }) {
  return <div style={{ marginBottom: 30 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '2px solid #0891b2', marginBottom: 16 }}>
      <span style={{ width: 4, height: 16, background: '#0891b2', borderRadius: 2, display: 'inline-block' }}></span>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', color: '#083344', margin: 0, fontWeight: 800 }}>{judul}</h3>
    </div>
    {children}
  </div>
}

function RatContentBlock({ label, text, tone }: { label: string; text: string; tone: 'teal' | 'amber' }) {
  const bg = tone === 'teal' ? '#f0fdfa' : '#fffbeb'
  const border = tone === 'teal' ? '#a5f3fc' : '#fde68a'
  const labelColor = tone === 'teal' ? '#0891b2' : '#b45309'
  const dotColor = tone === 'teal' ? '#0891b2' : '#d97706'
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: labelColor, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }}></span>
      {label}
    </div>
    <p style={{ fontSize: 13, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0, color: '#1e293b' }}>{text}</p>
  </div>
}

// Bar proporsi yang menormalisasi lebar tiap segmen terhadap jumlah segmen yang tampil (bukan flex-grow
// mentah) — selalu memenuhi lebar penuh 100% walau totalnya bukan 100% persis (mis. data lama sebelum
// model 2-lapis berlaku, atau pembulatan), jadi tidak pernah "tidak sampai kanan".
function AllocationBar({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0)
  return <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 12, marginBottom: 8, background: '#e2e8f0' }}>
      {total > 0 && segments.filter((seg) => seg.value > 0).map((seg) => (
        <div key={seg.label} style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }} title={`${seg.label} ${(seg.value * 100).toFixed(0)}%`} />
      ))}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', fontSize: 11.5 }}>
      {total > 0 && segments.filter((seg) => seg.value > 0).map((seg) => (
        <span key={seg.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }}></span>
          {seg.label}: {((seg.value / total) * 100).toFixed(0)}%
        </span>
      ))}
    </div>
  </div>
}

function currentPeriode() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function PayrollView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [periode, setPeriode] = useState(currentPeriode())
  const [rekap, setRekap] = useState<PayrollRekap | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [detailId, setDetailId] = useState<number | null>(null)

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/payroll/rekap?periode=${periode}`, { headers })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error(response.status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat rekap payroll.')
      setRekap(await response.json())
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [headers, onExpired, periode])
  useEffect(() => { void load() }, [load])

  const exportCsv = async () => {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/payroll/rekap/ekspor?periode=${periode}`, { headers })
      if (!response.ok) throw new Error('Gagal mengekspor rekap.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `potong-gaji-${periode}.csv`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal mengekspor rekap.') }
  }

  const setujuiWajib = async () => {
    if (!window.confirm(`Setujui SEMUA tagihan Simpanan Wajib periode ${periode} (total ${rupiah(rekap?.totalWajib ?? 0)})? Saldo wajib tiap anggota akan otomatis bertambah.`)) return
    setBusyId('wajib'); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/simpanan/wajib/setujui-periode`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ periode }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menyetujui tagihan wajib.')
      flash(data.message ?? 'Berhasil.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyetujui tagihan wajib.') }
    finally { setBusyId('') }
  }

  const setujuiKredit = async () => {
    if (!window.confirm(`Tandai SEMUA Tagihan Kredit yang belum lunas (total ${rupiah(rekap?.totalKredit ?? 0)}) LUNAS?`)) return
    setBusyId('kredit'); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/produk/tagihan-kredit/lunas`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menandai tagihan kredit lunas.')
      flash(data.message ?? 'Berhasil.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menandai tagihan kredit lunas.') }
    finally { setBusyId('') }
  }

  const setujuiCicilan = async () => {
    const items = (rekap?.baris ?? []).flatMap((b) => b.items.filter((i) => i.jenis === 'Cicilan'))
    if (items.length === 0) return
    if (!window.confirm(`Tandai SEMUA Cicilan Pinjaman jatuh tempo bulan ini (total ${rupiah(rekap?.totalCicilanPinjaman ?? 0)}) LUNAS?`)) return
    setBusyId('cicilan'); setError('')
    try {
      for (const item of items) {
        const response = await fetch(`${API_BASE}/api/admin/pinjaman/angsuran/${item.id}/bayar`, { method: 'POST', headers })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message ?? 'Gagal menandai cicilan lunas.')
      }
      flash(`${items.length} cicilan pinjaman ditandai lunas.`); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Sebagian cicilan gagal diproses — cek kembali daftar di bawah.') }
    finally { setBusyId('') }
  }

  return <div className="content-wrap">
    <section className="welcome-row">
      <div><h2>Tagihan Anggota (potong gaji)</h2><p>Rekap otomatis Simpanan Wajib + Tagihan Kredit produk + Cicilan Pinjaman per anggota untuk periode terpilih. Setujui, lalu ekspor CSV.</p></div>
      <div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div>
    </section>

    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    <section className="stat-grid">
      <StatCard label="Anggota terpotong" value={rekap?.baris.length ?? 0} icon={<Users size={20} />} tone="teal" />
      <StatCard label="Simpanan Wajib" value={rekap?.totalWajib ?? 0} icon={<PiggyBank size={20} />} tone="blue" money />
      <StatCard label="Tagihan Kredit" value={rekap?.totalKredit ?? 0} icon={<HandCoins size={20} />} tone="amber" money />
      <StatCard label="Cicilan Pinjaman" value={rekap?.totalCicilanPinjaman ?? 0} icon={<Banknote size={20} />} tone="blue" money />
      <StatCard label="Total potongan" value={rekap?.totalPotongan ?? 0} icon={<Receipt size={20} />} tone="green" money />
    </section>

    <section className="table-panel">
      <div className="panel-heading" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div style={{ flex: '1 1 320px' }}><h2>Rekap periode {periode}</h2><p>Belum ditagih (Simpanan Wajib) + belum lunas (Tagihan Kredit) + cicilan pinjaman jatuh tempo bulan ini untuk periode ini.</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} style={{ height: 36, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
          <button className="toggle-button activate" onClick={() => void exportCsv()}><FileSpreadsheet size={14} style={{ verticalAlign: -2, marginRight: 5 }} />Ekspor CSV</button>
        </div>
      </div>
      <div className="payroll-actions-bar">
        <div className="payroll-actions-label">
          <CheckCircle2 size={15} style={{ color: '#0891b2' }} />
          <span>Aksi Massal Periode {periode}:</span>
        </div>
        <div className="payroll-actions-btns">
          <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalWajib > 0)} onClick={() => void setujuiWajib()}>Setujui Simpanan Wajib</button>
          <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalKredit > 0)} onClick={() => void setujuiKredit()}>Setujui Tagihan Kredit</button>
          <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalCicilanPinjaman > 0)} onClick={() => void setujuiCicilan()}>Setujui Angsuran Cicilan</button>
        </div>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Simpanan Wajib</th><th>Tagihan Kredit</th><th>Cicilan Pinjaman</th><th>Total Potongan</th></tr></thead><tbody>
        {rekap?.baris.map((b) => <tr key={b.penggunaId} className="clickable-row" onClick={() => setDetailId(b.penggunaId)}>
          <td><div className="user-cell"><span className="avatar tosca-avatar">{b.nama.charAt(0).toUpperCase()}</span><strong>{b.nama}</strong></div></td>
          <td className="mono">{b.nik || '—'}</td>
          <td>{b.simpananWajib > 0 ? rupiah(b.simpananWajib) : '—'}</td>
          <td>{b.tagihanKredit > 0 ? rupiah(b.tagihanKredit) : '—'}</td>
          <td>{b.cicilanPinjaman > 0 ? rupiah(b.cicilanPinjaman) : '—'}</td>
          <td style={{ fontWeight: 700, color: '#083344' }}>{rupiah(b.totalPotongan)}</td>
        </tr>)}
      </tbody></table>{!loading && (!rekap || rekap.baris.length === 0) && <div className="empty-state">Tidak ada potongan gaji untuk periode ini.</div>}</div>
    </section>

    {detailId !== null && <PayrollDetailModal
      baris={rekap?.baris.find((b) => b.penggunaId === detailId) ?? null}
      token={token} onExpired={onExpired}
      onClose={() => setDetailId(null)}
      onChanged={() => void load()}
    />}
  </div>
}

function PayrollDetailModal({ baris, token, onExpired, onClose, onChanged }: {
  baris: PayrollBaris | null; token: string; onExpired: () => void; onClose: () => void; onChanged: () => void
}) {
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const post = async (url: string, body?: unknown) => {
    const response = await fetch(`${API_BASE}${url}`, { method: 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) })
    if (response.status === 401) { onExpired(); throw new Error('Sesi berakhir.') }
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message ?? 'Permintaan gagal.')
    return data
  }

  const wajibItems = baris?.items.filter((i) => i.jenis === 'Wajib') ?? []
  const kreditItems = baris?.items.filter((i) => i.jenis === 'Kredit') ?? []
  const cicilanItems = baris?.items.filter((i) => i.jenis === 'Cicilan') ?? []
  const semuaItems = [...wajibItems, ...kreditItems, ...cicilanItems]

  // Setuju = tandai potongan ini diproses (dikreditkan / dilunasi). Tolak untuk Simpanan Wajib benar-benar
  // menolak tagihannya; untuk Tagihan Kredit & Cicilan Pinjaman (utang yang sudah pasti ada), "Tolak" berarti
  // dilewati dulu periode ini — tidak ada perubahan status, akan muncul lagi di rekap periode berikutnya.
  const setuju = async (item: PayrollItem) => {
    if (!window.confirm(`Setujui "${item.keterangan}" (${rupiah(item.nominal)})?`)) return
    setBusyId(`s-${item.id}`); setError('')
    try {
      if (item.jenis === 'Wajib') await post(`/api/admin/simpanan/wajib/${item.id}/putusan`, { setuju: true })
      else if (item.jenis === 'Kredit') await post('/api/admin/produk/tagihan-kredit/lunas', { tagihanKreditId: item.id })
      else await post(`/api/admin/pinjaman/angsuran/${item.id}/bayar`)
      onChanged()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses.') }
    finally { setBusyId('') }
  }

  const tolak = async (item: PayrollItem) => {
    if (item.jenis !== 'Wajib') { flash(`"${item.keterangan}" dilewati — akan muncul lagi periode berikutnya.`); return }
    const catatan = window.prompt(`Alasan menolak "${item.keterangan}" (opsional):`)
    if (catatan === null) return
    setBusyId(`t-${item.id}`); setError('')
    try { await post(`/api/admin/simpanan/wajib/${item.id}/putusan`, { setuju: false, catatan: catatan || null }); onChanged() }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses.') }
    finally { setBusyId('') }
  }

  const setujuiSemua = async () => {
    if (!baris || !window.confirm(`Setujui SEMUA potongan ${baris.nama} periode ini (total ${rupiah(baris.totalPotongan)})?`)) return
    setBusyId('semua'); setError('')
    try {
      for (const item of wajibItems) await post(`/api/admin/simpanan/wajib/${item.id}/putusan`, { setuju: true })
      for (const item of kreditItems) await post('/api/admin/produk/tagihan-kredit/lunas', { tagihanKreditId: item.id })
      for (const item of cicilanItems) await post(`/api/admin/pinjaman/angsuran/${item.id}/bayar`)
      onChanged()
    } catch (e) { setError(e instanceof Error ? e.message : 'Sebagian potongan gagal diproses — cek kembali daftar di bawah.') }
    finally { setBusyId('') }
  }

  const tolakSemua = async () => {
    if (!baris) return
    const catatan = wajibItems.length > 0 ? window.prompt(`Alasan menolak Simpanan Wajib ${baris.nama} (opsional):`) : ''
    if (catatan === null) return
    setBusyId('tolak-semua'); setError('')
    try {
      for (const item of wajibItems) await post(`/api/admin/simpanan/wajib/${item.id}/putusan`, { setuju: false, catatan: catatan || null })
      if (kreditItems.length > 0 || cicilanItems.length > 0) flash('Tagihan Kredit & Cicilan Pinjaman dilewati — akan muncul lagi periode berikutnya.')
      onChanged()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menolak Simpanan Wajib.') }
    finally { setBusyId('') }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-profile-header">
          <div className="modal-profile-info">
            <span className="modal-avatar">{(baris?.nama ?? '?').charAt(0).toUpperCase()}</span>
            <div className="modal-profile-text">
              <h2>{baris?.nama ?? 'Anggota'}</h2>
              <div className="modal-chips-row">
                <span className="mono" style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  NIK {baris?.nik || '—'}
                </span>
                <span className="role-pill tosca" style={{ fontWeight: 800 }}>
                  Total Potongan: {rupiah(baris?.totalPotongan ?? 0)}
                </span>
              </div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {error && <div className="alert error" style={{ marginBottom: 14 }}><X size={17} />{error}</div>}
          {notice && <div className="alert success" style={{ marginBottom: 14 }}><BadgeCheck size={17} />{notice}</div>}
          {!baris && <div className="empty-state">Semua potongan anggota ini sudah diproses.</div>}

          {baris && (
            <>
              {wajibItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="modal-section-title"><PiggyBank size={15} /> Simpanan Wajib</div>
                  {wajibItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
                </div>
              )}

              {kreditItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="modal-section-title"><HandCoins size={15} /> Tagihan Kredit</div>
                  {kreditItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
                </div>
              )}

              {cicilanItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="modal-section-title"><Banknote size={15} /> Cicilan Pinjaman</div>
                  {cicilanItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
                <button className="submit-button" style={{ width: 'auto', height: 38, padding: '0 20px' }} disabled={busyId !== '' || semuaItems.length === 0} onClick={() => void setujuiSemua()}>Setujui semua</button>
                <button className="toggle-button deactivate" disabled={busyId !== '' || semuaItems.length === 0} onClick={() => void tolakSemua()}>Tolak semua</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PayrollItemRow({ item, busy, onSetuju, onTolak }: { item: PayrollItem; busy: boolean; onSetuju: () => void; onTolak: () => void }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
    <div><div style={{ fontSize: 13 }}>{item.keterangan}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{rupiah(item.nominal)}</div></div>
    <span style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
      <button className="toggle-button activate" disabled={busy} onClick={onSetuju}>Setuju</button>
      <button className="toggle-button deactivate" disabled={busy} onClick={onTolak}>Tolak</button>
    </span>
  </div>
}

function todayISO() { return new Date().toISOString().slice(0, 10) }
function startOfYearISO() { return `${new Date().getFullYear()}-01-01` }
const inputStyle: CSSProperties = { height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }
const labelStyle: CSSProperties = { display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763' }

function AkunTable({ items, title }: { items: SaldoAkunItem[]; title: string }) {
  // Sengaja tidak pakai elemen <table> di sini — CSS global untuk tabel data admin (table{min-width:760px})
  // memaksa ringkasan kecil ini melebar dan tumpang tindih dengan kolom sebelahnya saat disusun berdampingan.
  const total = items.reduce((s, a) => s + a.saldo, 0)
  return <div style={{ flex: 1, minWidth: 260, maxWidth: '100%', background: '#f8fafc', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: '#083344', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #0891b2' }}>{title}</div>
    <div style={{ flex: 1 }}>
      {items.map((a) => <div key={a.kode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderTop: '1px solid #e2e8f0', fontSize: 12 }}>
        <span style={{ display: 'flex', gap: 8, minWidth: 0 }}>
          <span className="mono" style={{ color: 'var(--muted)', fontSize: 11, flexShrink: 0 }}>{a.kode}</span>
          <span style={{ wordBreak: 'break-word', color: 'var(--ink)' }}>{a.nama}</span>
        </span>
        <span style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', fontWeight: 600 }}>{rupiah(a.saldo)}</span>
      </div>)}
      {items.length === 0 && <div style={{ padding: '8px 0', color: 'var(--muted)', fontSize: 12, textAlign: 'center' }}>Belum ada saldo.</div>}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #cbd5e1', fontWeight: 800, paddingTop: 8, marginTop: 6, fontSize: 12.5, color: '#083344' }}>
      <span>Total</span><span>{rupiah(total)}</span>
    </div>
  </div>
}

function ringkasNamaAkun(list: { namaAkun: string }[], maks = 1) {
  if (list.length === 0) return '—'
  if (list.length <= maks) return list.map((x) => x.namaAkun).join(', ')
  return `${list.slice(0, maks).map((x) => x.namaAkun).join(', ')} +${list.length - maks} lainnya`
}

function JurnalRincianView({ baris }: { baris: JurnalBarisT[] }) {
  const debitList = baris.filter((b) => b.debit > 0)
  const kreditList = baris.filter((b) => b.kredit > 0)
  const otherList = baris.filter((b) => b.debit === 0 && b.kredit === 0)
  const hasFlow = debitList.length > 0 && kreditList.length > 0
  const dariPenuh = kreditList.map((k) => k.namaAkun).join(', ')
  const kePenuh = debitList.map((d) => d.namaAkun).join(', ')
  const legCount = debitList.length + kreditList.length

  return (
    <div className="jurnal-rincian-box">
      {hasFlow && (
        <div className="jurnal-flow-header" title={`Alur: Dari ${dariPenuh} ➔ Ke ${kePenuh}`}>
          <span className="jurnal-flow-label">Dari</span>
          <span className="jurnal-flow-src">{ringkasNamaAkun(kreditList)}</span>
          <ArrowRight size={10} className="jurnal-flow-arrow" />
          <span className="jurnal-flow-label">Ke</span>
          <span className="jurnal-flow-dst">{ringkasNamaAkun(debitList)}</span>
        </div>
      )}
      <div className="jurnal-leg-timeline" data-multi={legCount > 2 ? 'true' : undefined}>
        {debitList.map((b, i) => (
          <div key={`d-${i}`} className="jurnal-leg-row debit" title={`Debit (Ke): ${b.kodeAkun} ${b.namaAkun} - ${rupiah(b.debit)}`}>
            <span className="jurnal-leg-dot debit" aria-hidden="true" />
            <div className="jurnal-leg-left">
              <span className="jurnal-leg-tag debit">Ke (D)</span>
              <span className="mono jurnal-leg-code">{b.kodeAkun}</span>
              <span className="jurnal-leg-name">{b.namaAkun}</span>
            </div>
            <strong className="jurnal-leg-val">{rupiah(b.debit)}</strong>
          </div>
        ))}
        {kreditList.map((b, i) => (
          <div key={`k-${i}`} className="jurnal-leg-row kredit" title={`Kredit (Dari): ${b.kodeAkun} ${b.namaAkun} - ${rupiah(b.kredit)}`}>
            <span className="jurnal-leg-dot kredit" aria-hidden="true" />
            <div className="jurnal-leg-left">
              <span className="jurnal-leg-tag kredit">Dari (K)</span>
              <span className="mono jurnal-leg-code">{b.kodeAkun}</span>
              <span className="jurnal-leg-name">{b.namaAkun}</span>
            </div>
            <span className="jurnal-leg-val">{rupiah(b.kredit)}</span>
          </div>
        ))}
        {otherList.map((b, i) => (
          <div key={`o-${i}`} className="jurnal-leg-row" style={{ color: 'var(--muted)', fontSize: 10 }}>
            <span className="jurnal-leg-dot" aria-hidden="true" />
            <div className="jurnal-leg-left">
              <span className="mono jurnal-leg-code">{b.kodeAkun}</span>
              <span className="jurnal-leg-name">{b.namaAkun}</span>
            </div>
            <span className="jurnal-leg-val">0</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function JurnalDetailModal({ jurnal, onClose }: { jurnal: Jurnal; onClose: () => void }) {
  const totalDebit = jurnal.baris.reduce((s, b) => s + b.debit, 0)
  const totalKredit = jurnal.baris.reduce((s, b) => s + b.kredit, 0)
  const balance = Math.abs(totalDebit - totalKredit) < 1
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 51, 68, 0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
    <div style={{ background: '#fff', borderRadius: 14, width: 'min(560px, 100%)', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,51,68,.25)' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-deep)' }}>{jurnal.nomorJurnal}</span>
            <span className={`role-pill mini ${jurnal.sumber === 'Otomatis' ? 'tosca' : 'admin'}`}>{jurnal.sumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
            <Calendar size={12} />{tanggal(jurnal.tanggal)}
            {jurnal.dicatatOleh && <span>· dicatat oleh {jurnal.dicatatOleh}</span>}
          </div>
        </div>
        <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
      </div>

      <div style={{ padding: '18px 24px' }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 6px' }}>{jurnal.keterangan}</p>
        {(jurnal.referensiModul || jurnal.referensiId) && <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '0 0 16px' }}>
          Referensi: {jurnal.referensiModul}{jurnal.referensiModul && jurnal.referensiId ? ' · ' : ''}{jurnal.referensiId}
        </p>}

        <h4 style={{ margin: '14px 0 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>Rincian Baris Jurnal</h4>
        <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          {jurnal.baris.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line-light)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className={`role-pill mini ${b.debit > 0 ? 'tosca' : ''}`} style={b.kredit > 0 ? { background: '#f1f5f9', color: '#475569' } : undefined}>{b.debit > 0 ? 'Debit' : 'Kredit'}</span>
                  <span className="mono" style={{ fontSize: 11 }}>{b.kodeAkun}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 3 }}>{b.namaAkun}</div>
              </div>
              <strong style={{ fontSize: 13.5, whiteSpace: 'nowrap', color: b.debit > 0 ? '#0891b2' : '#334155' }}>{rupiah(b.debit > 0 ? b.debit : b.kredit)}</strong>
            </div>
          ))}
        </div>

        <div className={`alert ${balance ? 'success' : 'error'}`} style={{ marginTop: 16, marginBottom: 0 }}>
          {balance ? <BadgeCheck size={16} /> : <X size={16} />}
          Debit {rupiah(totalDebit)} · Kredit {rupiah(totalKredit)} {balance ? '— balance' : '— tidak balance'}
        </div>
      </div>
    </div>
  </div>
}

function AkuntansiView({ token, onExpired, tab, setTab }: { token: string; onExpired: () => void; tab: AkuntansiTab; setTab: (t: AkuntansiTab) => void }) {
  const [akun, setAkun] = useState<Akun[]>([])
  const [jurnal, setJurnal] = useState<Jurnal[]>([])
  const [detailJurnal, setDetailJurnal] = useState<Jurnal | null>(null)
  const [neraca, setNeraca] = useState<Neraca | null>(null)
  const [labaRugi, setLabaRugi] = useState<LabaRugi | null>(null)
  const [arusKas, setArusKas] = useState<ArusKas | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [tanggalNeraca, setTanggalNeraca] = useState(todayISO())
  const [dariRugi, setDariRugi] = useState(startOfYearISO())
  const [sampaiRugi, setSampaiRugi] = useState(todayISO())
  const [dariKas, setDariKas] = useState(startOfYearISO())
  const [sampaiKas, setSampaiKas] = useState(todayISO())

  const [jTanggal, setJTanggal] = useState(todayISO())
  const [jKeterangan, setJKeterangan] = useState('')
  const [jBaris, setJBaris] = useState<{ akunId: string; debit: string; kredit: string }[]>([{ akunId: '', debit: '', kredit: '' }, { akunId: '', debit: '', kredit: '' }])

  const [akunNama, setAkunNama] = useState('')
  const [akunKode, setAkunKode] = useState('')
  const [akunTipe, setAkunTipe] = useState('Beban')
  const [akunSaldoNormal, setAkunSaldoNormal] = useState('Debit')

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const jsonHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const loadAkun = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/admin/akuntansi/akun`, { headers })
    if (response.status === 401) { onExpired(); return }
    if (response.ok) setAkun(await response.json())
  }, [headers, onExpired])

  const loadJurnal = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/admin/akuntansi/jurnal`, { headers })
    if (response.status === 401) { onExpired(); return }
    if (response.ok) setJurnal(await response.json())
  }, [headers, onExpired])

  const loadNeraca = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/admin/akuntansi/neraca?tanggal=${tanggalNeraca}`, { headers })
    if (response.ok) setNeraca(await response.json())
  }, [headers, tanggalNeraca])

  const loadLabaRugi = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/admin/akuntansi/laba-rugi?dari=${dariRugi}&sampai=${sampaiRugi}`, { headers })
    if (response.ok) setLabaRugi(await response.json())
  }, [headers, dariRugi, sampaiRugi])

  const loadArusKas = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/admin/akuntansi/arus-kas?dari=${dariKas}&sampai=${sampaiKas}`, { headers })
    if (response.ok) setArusKas(await response.json())
  }, [headers, dariKas, sampaiKas])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      await Promise.all([loadAkun(), loadJurnal(), loadNeraca(), loadLabaRugi(), loadArusKas()])
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [loadAkun, loadJurnal, loadNeraca, loadLabaRugi, loadArusKas])
  useEffect(() => { void load() }, [load])
  useEffect(() => { void loadNeraca() }, [loadNeraca])
  useEffect(() => { void loadLabaRugi() }, [loadLabaRugi])
  useEffect(() => { void loadArusKas() }, [loadArusKas])

  const ubahBaris = (i: number, patch: Partial<{ akunId: string; debit: string; kredit: string }>) =>
    setJBaris((rows) => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r))
  const totalDebitBaru = jBaris.reduce((s, r) => s + (Number(r.debit) || 0), 0)
  const totalKreditBaru = jBaris.reduce((s, r) => s + (Number(r.kredit) || 0), 0)
  const balanceOk = totalDebitBaru > 0 && totalDebitBaru === totalKreditBaru

  const simpanJurnal = async () => {
    if (!jKeterangan.trim() || !balanceOk) { setError('Keterangan wajib diisi dan total debit harus sama dengan total kredit (> 0).'); return }
    setBusyId('jurnal-baru'); setError('')
    try {
      const baris = jBaris.filter((r) => r.akunId && (Number(r.debit) > 0 || Number(r.kredit) > 0))
        .map((r) => ({ akunId: Number(r.akunId), debit: Number(r.debit) || 0, kredit: Number(r.kredit) || 0 }))
      const response = await fetch(`${API_BASE}/api/admin/akuntansi/jurnal`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ tanggal: jTanggal, keterangan: jKeterangan.trim(), baris }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menyimpan jurnal.')
      flash('Jurnal manual disimpan.')
      setJKeterangan(''); setJBaris([{ akunId: '', debit: '', kredit: '' }, { akunId: '', debit: '', kredit: '' }])
      await Promise.all([loadJurnal(), loadNeraca(), loadLabaRugi(), loadArusKas()])
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan jurnal.') }
    finally { setBusyId('') }
  }

  const hapusJurnal = async (j: Jurnal) => {
    if (!window.confirm(`Hapus jurnal manual "${j.keterangan}"?`)) return
    setBusyId(`hapus-${j.id}`); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/akuntansi/jurnal/${j.id}`, { method: 'DELETE', headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menghapus jurnal.')
      flash('Jurnal dihapus.')
      await Promise.all([loadJurnal(), loadNeraca(), loadLabaRugi(), loadArusKas()])
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menghapus jurnal.') }
    finally { setBusyId('') }
  }

  const tambahAkun = async () => {
    if (!akunKode.trim() || !akunNama.trim()) { setError('Kode dan nama akun wajib diisi.'); return }
    setBusyId('akun-baru'); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/akuntansi/akun`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ kode: akunKode.trim(), nama: akunNama.trim(), tipe: akunTipe, saldoNormal: akunSaldoNormal }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menambah akun.')
      flash('Akun ditambahkan.'); setAkunKode(''); setAkunNama('')
      await loadAkun()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menambah akun.') }
    finally { setBusyId('') }
  }

  const toggleAkun = async (a: Akun) => {
    setBusyId(`akun-${a.id}`); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/akuntansi/akun/${a.id}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ aktif: !a.aktif }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal memperbarui akun.')
      await loadAkun()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal memperbarui akun.') }
    finally { setBusyId('') }
  }

  const TABS: { key: AkuntansiTab; label: string; icon: ReactNode }[] = [
    { key: 'jurnal', label: 'Jurnal Umum', icon: <BookOpen size={15} /> },
    { key: 'neraca', label: 'Neraca', icon: <Scale size={15} /> },
    { key: 'laba-rugi', label: 'Hasil Usaha', icon: <TrendingUp size={15} /> },
    { key: 'shu', label: 'SHU', icon: <Calculator size={15} /> },
    { key: 'arus-kas', label: 'Arus Kas', icon: <Banknote size={15} /> },
    { key: 'akun', label: 'Bagan Akun', icon: <Database size={15} /> },
  ]

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Akuntansi & Keuangan</h2><p>Dapur koperasi — jurnal otomatis dari setiap transaksi sistem, jurnal manual untuk biaya operasional, dan laporan keuangan. Tidak tampil ke anggota.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}

    <MenuTabBar
      className="inline"
      tabs={TABS}
      active={tab}
      onChange={setTab}
    />

    {tab === 'jurnal' && <>
      <section className="table-panel" style={{ marginBottom: 22 }}>
        <div className="panel-heading"><div><h2>Tambah jurnal manual</h2><p>Untuk transaksi di luar sistem (gaji, sewa, listrik, modal awal, dll). Total debit harus sama dengan total kredit.</p></div></div>
        <div style={{ padding: '16px 25px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <label style={labelStyle}>Tanggal<input type="date" value={jTanggal} onChange={(e) => setJTanggal(e.target.value)} style={{ ...inputStyle, background: '#fff' }} /></label>
            <label style={{ ...labelStyle, flex: 1, minWidth: 240 }}>Keterangan<input value={jKeterangan} onChange={(e) => setJKeterangan(e.target.value)} style={{ ...inputStyle, background: '#fff' }} placeholder="mis. Pembayaran gaji staf September 2026" /></label>
          </div>
          {jBaris.map((row, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <label style={{ ...labelStyle, flex: 1 }}>{i === 0 ? 'Akun' : ''}
              <select value={row.akunId} onChange={(e) => ubahBaris(i, { akunId: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">Pilih akun…</option>
                {akun.filter((a) => a.aktif).map((a) => <option key={a.id} value={a.id}>{a.kode} — {a.nama}</option>)}
              </select>
            </label>
            <label style={labelStyle}>{i === 0 ? 'Debit' : ''}<input type="number" value={row.debit} onChange={(e) => ubahBaris(i, { debit: e.target.value, kredit: '' })} style={{ ...inputStyle, width: 140, background: '#fff' }} placeholder="0" /></label>
            <label style={labelStyle}>{i === 0 ? 'Kredit' : ''}<input type="number" value={row.kredit} onChange={(e) => ubahBaris(i, { kredit: e.target.value, debit: '' })} style={{ ...inputStyle, width: 140, background: '#fff' }} placeholder="0" /></label>
            {jBaris.length > 2 && <button className="toggle-button deactivate" onClick={() => setJBaris((rows) => rows.filter((_, idx) => idx !== i))}>×</button>}
          </div>)}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <button className="toggle-button" onClick={() => setJBaris((rows) => [...rows, { akunId: '', debit: '', kredit: '' }])}>+ Baris</button>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: balanceOk ? '#ecfeff' : '#fef2f2',
              border: `1px solid ${balanceOk ? '#a5f3fc' : '#fecaca'}`,
              color: balanceOk ? '#0891b2' : '#dc2626',
            }}>
              Debit {rupiah(totalDebitBaru)} · Kredit {rupiah(totalKreditBaru)} {balanceOk ? '✓ Balance' : '✗ Belum balance'}
            </div>
          </div>
          <button className="submit-button" style={{ marginTop: 14, height: 38, padding: '0 20px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'jurnal-baru' || !balanceOk} onClick={simpanJurnal}>
            <BookOpen size={14} /> Simpan jurnal
          </button>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-heading"><div><h2>Riwayat jurnal umum</h2><p>500 entri terbaru, semua sumber (otomatis & manual).</p></div><span className="record-count">{jurnal.length} entri</span></div>
        <div className="table-scroll"><table className="table-jurnal"><thead><tr>
          <th style={{ width: 145 }}>Transaksi</th>
          <th style={{ width: 170 }}>Keterangan</th>
          <th style={{ width: 'auto', minWidth: 330 }}>Rincian Aliran Dana</th>
          <th className="align-right" style={{ width: 30 }}>Aksi</th>
        </tr></thead><tbody>
          {jurnal.map((j) => <tr key={j.id} onClick={() => setDetailJurnal(j)} style={{ cursor: 'pointer' }}>
            <td>
              <div className="jurnal-meta-cell">
                <div className="jurnal-meta-top">
                  <span className="mono jurnal-meta-no">{j.nomorJurnal}</span>
                  <span className={`role-pill mini ${j.sumber === 'Otomatis' ? 'tosca' : 'admin'}`}>{j.sumber}</span>
                </div>
                <div className="jurnal-meta-date">
                  <Calendar size={11} className="jurnal-meta-icon" />
                  <span>{tanggal(j.tanggal)}</span>
                </div>
              </div>
            </td>
            <td style={{ whiteSpace: 'normal', fontSize: 11.5, lineHeight: 1.35 }}>
              <div>{j.keterangan}</div>
              {j.dicatatOleh && <small style={{ color: 'var(--muted)', fontSize: 10.5, display: 'block', marginTop: 2 }}>oleh {j.dicatatOleh}</small>}
            </td>
            <td style={{ whiteSpace: 'normal' }}>
              <JurnalRincianView baris={j.baris} />
            </td>
            <td className="align-right">{j.sumber === 'Manual' && <button className="icon-button" style={{ color: '#dc2626', padding: 5, width: 26, height: 26 }} disabled={busyId === `hapus-${j.id}`} title="Hapus jurnal" onClick={(e) => { e.stopPropagation(); void hapusJurnal(j) }}><Trash2 size={14} /></button>}</td>
          </tr>)}
        </tbody></table>{!loading && jurnal.length === 0 && <div className="empty-state"><BookOpen size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada jurnal tercatat.</div></div>}</div>
      </section>
      {detailJurnal && <JurnalDetailModal jurnal={detailJurnal} onClose={() => setDetailJurnal(null)} />}
    </>}

    {tab === 'neraca' && neraca && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Neraca (Balance Sheet)</h2><p>Per tanggal terpilih. Selisih harus 0 agar Aset = Liabilitas + Ekuitas.</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: '#0891b2' }} />
          <input type="date" value={tanggalNeraca} onChange={(e) => setTanggalNeraca(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
        </div>
      </div>
      <div style={{ padding: '18px 25px 25px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          <AkunTable items={neraca.aset} title={`ASET — ${rupiah(neraca.totalAset)}`} />
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AkunTable items={neraca.liabilitas} title={`LIABILITAS — ${rupiah(neraca.totalLiabilitas)}`} />
            <AkunTable items={[...neraca.ekuitas, { kode: '3-3999', nama: 'SHU Tahun Berjalan', saldo: neraca.shuBerjalan }]} title={`EKUITAS — ${rupiah(neraca.totalEkuitas)}`} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 10, padding: '14px 18px' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '.04em' }}>Total Aset</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#083344', marginTop: 2 }}>{rupiah(neraca.totalAset)}</div>
            </div>
            <Scale size={24} style={{ color: '#0891b2', opacity: 0.6 }} />
          </div>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em' }}>Total Liabilitas + Ekuitas</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#083344', marginTop: 2 }}>{rupiah(neraca.totalLiabilitas + neraca.totalEkuitas)}</div>
            </div>
            <CheckCircle2 size={24} style={{ color: Math.abs(neraca.selisih) < 1 ? '#0891b2' : '#dc2626', opacity: 0.6 }} />
          </div>
        </div>
        <div className={`alert ${Math.abs(neraca.selisih) < 1 ? 'success' : 'error'}`} style={{ marginBottom: 0 }}>
          {Math.abs(neraca.selisih) < 1 ? <BadgeCheck size={17} /> : <X size={17} />}
          <strong>Selisih: {rupiah(neraca.selisih)}</strong> — {Math.abs(neraca.selisih) < 1 ? 'Neraca seimbang (balance)' : 'Tidak seimbang — periksa entri jurnal'}
        </div>
      </div>
    </section>}

    {tab === 'laba-rugi' && labaRugi && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Hasil Usaha (Income Statement)</h2><p>Pendapatan dikurangi beban pada rentang tanggal terpilih.</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: '#0891b2' }} />
          <input type="date" value={dariRugi} onChange={(e) => setDariRugi(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>s/d</span>
          <input type="date" value={sampaiRugi} onChange={(e) => setSampaiRugi(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
        </div>
      </div>
      <div style={{ padding: '18px 25px 25px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          <AkunTable items={labaRugi.pendapatan} title={`PENDAPATAN — ${rupiah(labaRugi.totalPendapatan)}`} />
          <AkunTable items={labaRugi.beban} title={`BEBAN — ${rupiah(labaRugi.totalBeban)}`} />
        </div>
        <div className={`alert ${labaRugi.labaBersih >= 0 ? 'success' : 'error'}`} style={{ marginBottom: 0, padding: '14px 18px' }}>
          <TrendingUp size={20} />
          <div style={{ fontSize: 13 }}>
            Hasil Usaha Bersih: <strong style={{ fontSize: 16, marginLeft: 4 }}>{rupiah(labaRugi.labaBersih)}</strong>
            <span style={{ opacity: 0.8, marginLeft: 8 }}>({labaRugi.labaBersih >= 0 ? 'Surplus / Laba Bersih' : 'Defisit / Rugi Bersih'})</span>
          </div>
        </div>
      </div>
    </section>}

    {tab === 'shu' && <ShuPanel token={token} onExpired={onExpired} />}

    {tab === 'arus-kas' && arusKas && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Arus Kas (ringkasan)</h2><p>Pergerakan akun Kas & Bank metode langsung sederhana — bukan klasifikasi operasi/investasi/pendanaan penuh sesuai SAK, cukup untuk pemantauan internal.</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: '#0891b2' }} />
          <input type="date" value={dariKas} onChange={(e) => setDariKas(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>s/d</span>
          <input type="date" value={sampaiKas} onChange={(e) => setSampaiKas(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
        </div>
      </div>
      <section className="stat-grid" style={{ padding: '0 25px', margin: '16px 0' }}>
        <StatCard label="Saldo awal" value={arusKas.saldoAwal} icon={<Banknote size={20} />} tone="blue" money />
        <StatCard label="Kas masuk" value={arusKas.totalMasuk} icon={<TrendingUp size={20} />} tone="teal" money />
        <StatCard label="Kas keluar" value={arusKas.totalKeluar} icon={<HandCoins size={20} />} tone="amber" money />
        <StatCard label="Saldo akhir" value={arusKas.saldoAkhir} icon={<Banknote size={20} />} tone="blue" money />
      </section>
      <div className="table-scroll"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Modul</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>
        {arusKas.baris.map((b, i) => <tr key={i}>
          <td>{tanggal(b.tanggal)}</td>
          <td style={{ whiteSpace: 'normal', maxWidth: 280 }}>{b.keterangan}</td>
          <td><span className={`role-pill mini ${b.modul ? 'tosca' : ''}`}>{b.modul ?? '—'}</span></td>
          <td><strong style={{ color: '#0891b2' }}>{b.masuk > 0 ? rupiah(b.masuk) : '—'}</strong></td>
          <td><span style={{ color: '#dc2626' }}>{b.keluar > 0 ? rupiah(b.keluar) : '—'}</span></td>
        </tr>)}
      </tbody></table>{arusKas.baris.length === 0 && <div className="empty-state"><Banknote size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Tidak ada pergerakan kas pada rentang ini.</div></div>}</div>
    </section>}

    {tab === 'akun' && <section className="table-panel">
      <div className="panel-heading"><div><h2>Bagan Akun (Chart of Accounts)</h2><p>Akun bertanda "Sistem" dipakai posting otomatis dan tidak bisa dinonaktifkan.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 25px 18px', alignItems: 'end', background: '#f8fafc', borderBottom: '1px solid var(--line)' }}>
        <label style={labelStyle}>Kode<input value={akunKode} onChange={(e) => setAkunKode(e.target.value)} style={{ ...inputStyle, width: 110, background: '#fff' }} placeholder="6-6100" /></label>
        <label style={{ ...labelStyle, flex: 1, minWidth: 180 }}>Nama<input value={akunNama} onChange={(e) => setAkunNama(e.target.value)} style={{ ...inputStyle, background: '#fff' }} placeholder="Nama akun" /></label>
        <label style={labelStyle}>Tipe
          <select value={akunTipe} onChange={(e) => setAkunTipe(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
            {['Aset', 'Liabilitas', 'Ekuitas', 'Pendapatan', 'Beban'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Saldo Normal
          <select value={akunSaldoNormal} onChange={(e) => setAkunSaldoNormal(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
            <option value="Debit">Debit</option><option value="Kredit">Kredit</option>
          </select>
        </label>
        <button className="submit-button" style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'akun-baru'} onClick={tambahAkun}>
          <Database size={14} /> Tambah
        </button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Saldo Normal</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {akun.map((a) => <tr key={a.id}>
          <td className="mono">{a.kode}</td>
          <td>{a.nama}{a.sistem && <span className="role-pill mini admin" style={{ marginLeft: 6 }}>Sistem</span>}</td>
          <td><span className={`role-pill mini ${a.tipe === 'Aset' || a.tipe === 'Pendapatan' ? 'tosca' : a.tipe === 'Liabilitas' ? 'amber' : a.tipe === 'Ekuitas' ? 'admin' : ''}`} style={a.tipe === 'Beban' ? { background: '#fef2f2', color: '#991b1b' } : undefined}>{a.tipe}</span></td>
          <td>{a.saldoNormal}</td>
          <td><span className={`status-pill ${a.aktif ? 'active' : 'inactive'}`}><i />{a.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
          <td className="align-right">{!a.sistem && <button className={`toggle-button ${a.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === `akun-${a.id}`} onClick={() => void toggleAkun(a)}>{a.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>}</td>
        </tr>)}
      </tbody></table></div>
    </section>}
  </div>
}

function ShuPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [riwayat, setRiwayat] = useState<ShuRiwayat[]>([])
  const [hasil, setHasil] = useState<ShuHitung | null>(null)
  const [expanded, setExpanded] = useState<{ tahun: number; rincian: ShuBaris[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [totalShu, setTotalShu] = useState('')
  // Default sesuai kebijakan pembagian SHU dari RAT — DUA LAPIS:
  // Lapis 1 (dari Total SHU, wajib 100%): Anggota 40% + Pengurus 20% + Cadangan (permanen) 40%.
  // Lapis 2 (dari pool Anggota di atas, wajib 100%): Jasa Modal (JMA) 30% + Jasa Usaha (JUA) 70%.
  const [persenAnggota, setPersenAnggota] = useState('40')
  const [persenPengurus, setPersenPengurus] = useState('20')
  const [persenCadangan, setPersenCadangan] = useState('40')
  const [persenModal, setPersenModal] = useState('30')
  const [persenUsaha, setPersenUsaha] = useState('70')

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const jsonHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])
  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3200) }

  const loadRiwayat = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/shu/riwayat`, { headers })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error(response.status === 403 ? 'Akun ini belum memiliki akses admin.' : 'Gagal memuat riwayat SHU.')
      setRiwayat(await response.json())
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [headers, onExpired])
  useEffect(() => { void loadRiwayat() }, [loadRiwayat])

  const ambilDariLabaRugi = async () => {
    setBusyId('ambil-lr'); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/akuntansi/laba-rugi?dari=${tahun}-01-01&sampai=${tahun}-12-31`, { headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error('Gagal mengambil Hasil Usaha.')
      setTotalShu(String(Math.max(0, Math.round(data.labaBersih ?? 0))))
      flash(`Laba bersih tahun ${tahun}: ${rupiah(data.labaBersih ?? 0)} diusulkan sebagai Total SHU.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal mengambil Hasil Usaha.') }
    finally { setBusyId('') }
  }

  const hitung = async () => {
    if (!(Number(totalShu) > 0)) { setError('Total SHU wajib lebih dari 0.'); return }
    setBusyId('hitung'); setError(''); setHasil(null)
    try {
      const body = { tahun, totalShu: Number(totalShu), persenAnggota: Number(persenAnggota) / 100, persenJasaModal: Number(persenModal) / 100, persenJasaUsaha: Number(persenUsaha) / 100, persenPengurus: Number(persenPengurus) / 100, persenCadangan: Number(persenCadangan) / 100 }
      const response = await fetch(`${API_BASE}/api/admin/shu/hitung`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal menghitung SHU.')
      setHasil(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menghitung SHU.') }
    finally { setBusyId('') }
  }

  const finalisasi = async () => {
    if (!hasil) return
    if (!window.confirm(`Finalisasi SHU tahun ${tahun}?\n\nCadangan: ${rupiah(hasil.cadanganAmount)} (ditahan permanen)\nJasa Pengurus: ${rupiah(hasil.jasaPengurusPool)} (dibagikan sendiri di luar sistem)\nAnggota (${hasil.rincian.length} orang, neto setelah PPh): ${rupiah(hasil.totalShuNeto)}\n\nSetelah ini estimasi SHU akan tampil di aplikasi anggota dan tidak bisa diubah kecuali dihitung ulang.`)) return
    setBusyId('finalisasi'); setError('')
    try {
      const body = { tahun, totalShu: Number(totalShu), persenAnggota: Number(persenAnggota) / 100, persenJasaModal: Number(persenModal) / 100, persenJasaUsaha: Number(persenUsaha) / 100, persenPengurus: Number(persenPengurus) / 100, persenCadangan: Number(persenCadangan) / 100 }
      const response = await fetch(`${API_BASE}/api/admin/shu/finalisasi`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message ?? 'Gagal finalisasi SHU.')
      flash(data.message ?? 'SHU difinalisasi.')
      setHasil(null)
      await loadRiwayat()
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal finalisasi SHU.') }
    finally { setBusyId('') }
  }

  const lihatRincian = async (tahunLihat: number) => {
    if (expanded?.tahun === tahunLihat) { setExpanded(null); return }
    const response = await fetch(`${API_BASE}/api/admin/shu/${tahunLihat}`, { headers })
    if (response.ok) {
      const data = await response.json()
      setExpanded({ tahun: tahunLihat, rincian: data.rincian })
    }
  }

  const eksporCsv = async (tahunEkspor: number) => {
    const response = await fetch(`${API_BASE}/api/admin/shu/${tahunEkspor}/ekspor`, { headers })
    if (!response.ok) { setError('Gagal mengekspor SHU.'); return }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `shu-${tahunEkspor}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  return <>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading">
        <div style={{ flex: '1 1 320px' }}><h2>Kalkulator SHU (Sisa Hasil Usaha)</h2><p>SHU Anggota = Jasa Modal Anggota (JMA) + Jasa Usaha Anggota (JUA), dihitung dari simpanan pokok+wajib dan volume transaksi (pinjaman + belanja) setiap anggota aktif. PPh (lihat Tarif PPh di Konfigurasi Simpanan) dipotong dari SHU bruto tiap anggota sebelum dibagikan.</p></div>
        <div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void loadRiwayat()} title="Muat ulang"><RefreshCw size={16} /></button></div>
      </div>
      <div className="panel-heading" style={{ paddingTop: 0 }}><div><h2 style={{ fontSize: 15 }}>Hitung & tayangkan SHU</h2><p>Pratinjau dulu (tidak tersimpan), lalu finalisasi untuk mengirim estimasi ke aplikasi anggota. Pembagian dua lapis sesuai kebijakan RAT.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '18px 25px 12px', alignItems: 'end' }}>
        <label style={labelStyle}>Tahun buku<input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
        <label style={labelStyle}>Total SHU (Rp)<input type="number" value={totalShu} onChange={(e) => setTotalShu(e.target.value)} style={{ ...inputStyle, width: 160, background: '#fff' }} placeholder="0" /></label>
        <button className="toggle-button activate" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'ambil-lr'} onClick={() => void ambilDariLabaRugi()}>
          <Calculator size={14} /> Ambil dari Hasil Usaha
        </button>
      </div>

      <div style={{ margin: '10px 25px 0', padding: '14px 18px', border: '1px solid #a5f3fc', borderRadius: 10, background: '#f0fdfa' }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: '#083344', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scale size={14} style={{ color: '#0891b2' }} />
          Lapis 1 — Pembagian Total SHU (wajib 100%)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end' }}>
          <label style={labelStyle}>% Anggota<input type="number" value={persenAnggota} onChange={(e) => setPersenAnggota(e.target.value)} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
          <label style={labelStyle}>% Pengurus<input type="number" value={persenPengurus} onChange={(e) => setPersenPengurus(e.target.value)} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
          <label style={labelStyle}>% Cadangan (permanen)<input type="number" value={persenCadangan} onChange={(e) => setPersenCadangan(e.target.value)} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
        </div>
        {(Number(persenAnggota) + Number(persenPengurus) + Number(persenCadangan)) !== 100 && <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Catatan: total Lapis 1 saat ini {Number(persenAnggota) + Number(persenPengurus) + Number(persenCadangan)}% (seharusnya 100%).</div>}
      </div>

      <div style={{ margin: '12px 25px 0', padding: '14px 18px', border: '1px solid #fde68a', borderRadius: 10, background: '#fffbeb' }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: '#92400e', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} style={{ color: '#b45309' }} />
          Lapis 2 — Pembagian Pool Anggota (wajib 100%)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end' }}>
          <label style={labelStyle}>% Jasa Modal (JMA)<input type="number" value={persenModal} onChange={(e) => setPersenModal(e.target.value)} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
          <label style={labelStyle}>% Jasa Usaha (JUA)<input type="number" value={persenUsaha} onChange={(e) => setPersenUsaha(e.target.value)} style={{ ...inputStyle, width: 100, background: '#fff' }} /></label>
        </div>
        {(Number(persenModal) + Number(persenUsaha)) !== 100 && <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Catatan: total Lapis 2 saat ini {Number(persenModal) + Number(persenUsaha)}% (seharusnya 100%).</div>}
      </div>

      <div style={{ padding: '16px 25px 8px' }}>
        <button className="submit-button" style={{ height: 38, padding: '0 20px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'hitung'} onClick={() => void hitung()}>
          <Calculator size={14} /> Hitung (pratinjau)
        </button>
      </div>

      {hasil && <div style={{ padding: '0 25px 22px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="toggle-button activate" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busyId === 'finalisasi'} onClick={() => void finalisasi()}>
            <BadgeCheck size={14} /> Finalisasi & kirim ke aplikasi anggota
          </button>
        </div>
        <div className="stat-grid">
          <StatCard label="Cadangan (ditahan permanen)" value={hasil.cadanganAmount} icon={<PiggyBank size={18} />} tone="blue" money />
          <StatCard label="Jasa Pengurus" value={hasil.jasaPengurusPool} icon={<Users size={18} />} tone="amber" money />
          <StatCard label="Total ke anggota (neto)" value={hasil.totalShuNeto} icon={<BadgeCheck size={18} />} tone="teal" money />
          <StatCard label="PPh anggota" value={hasil.totalPajak} icon={<Receipt size={18} />} tone="blue" money />
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 14px' }}>Total simpanan semua anggota aktif: {rupiah(hasil.totalSimpananSemuaAnggota)} · Total transaksi: {rupiah(hasil.totalTransaksiSemuaAnggota)} · Tarif PPh {(hasil.tarifPph * 100).toFixed(0)}%</p>
        <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Simpanan</th><th>Transaksi</th><th>JMA</th><th>JUA</th><th>Total SHU (Bruto)</th><th>PPh</th><th>Total SHU (Neto)</th></tr></thead><tbody>
          {hasil.rincian.map((r) => <tr key={r.penggunaId}>
            <td><div className="user-cell"><span className="avatar tosca-avatar">{r.nama.charAt(0).toUpperCase()}</span><strong>{r.nama}</strong></div></td>
            <td className="mono">{r.nomorIndukKaryawan || '—'}</td>
            <td>{rupiah(r.simpananAnggota)}</td>
            <td>{rupiah(r.transaksiAnggota)}</td>
            <td>{rupiah(r.jma)}</td>
            <td>{rupiah(r.jua)}</td>
            <td>{rupiah(r.totalShu)}</td>
            <td style={{ color: '#dc2626', fontWeight: 600 }}>−{rupiah(r.pajak)}</td>
            <td style={{ fontWeight: 800, color: '#0891b2' }}>{rupiah(r.totalShuNeto)}</td>
          </tr>)}
        </tbody></table></div>
      </div>}
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Riwayat SHU terfinalisasi</h2><p>Estimasi neto (setelah PPh) yang sudah tampil di aplikasi anggota. Cadangan & Jasa Pengurus tidak masuk aplikasi anggota — dikelola pengurus sendiri.</p></div></div>
      <div className="table-scroll table-compact"><table><thead><tr><th>Tahun</th><th>Total SHU</th><th>Cadangan</th><th>Pengurus</th><th>Anggota (Neto)</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {riwayat.map((r) => [
          <tr key={r.tahun}>
            <td style={{ fontWeight: 800 }}>{r.tahun}<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>{tanggal(r.difinalisasiPada)}</small></td>
            <td>{rupiah(r.totalShu)}</td>
            <td>{rupiah(r.cadanganAmount)}<br /><small style={{ color: 'var(--muted)' }}>{(r.persenCadangan * 100).toFixed(0)}%</small></td>
            <td>{rupiah(r.jasaPengurusPool)}<br /><small style={{ color: 'var(--muted)' }}>{(r.persenPengurus * 100).toFixed(0)}%</small></td>
            <td style={{ fontWeight: 700, color: '#0891b2' }}>{rupiah(r.totalShuNeto)}<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>{r.jumlahAnggota} anggota · JMA {(r.persenJasaModal * 100).toFixed(0)}%/JUA {(r.persenJasaUsaha * 100).toFixed(0)}%</small></td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button" onClick={() => void lihatRincian(r.tahun)}>{expanded?.tahun === r.tahun ? 'Tutup' : 'Rincian'}</button>
              <button className="toggle-button activate" onClick={() => void eksporCsv(r.tahun)}>Ekspor CSV</button>
            </span></td>
          </tr>,
          expanded?.tahun === r.tahun && <tr key={`${r.tahun}-d`}><td colSpan={6} style={{ background: '#f8fafc', padding: '14px 18px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: '#083344', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calculator size={15} style={{ color: '#0891b2' }} />
                Rincian Pembagian SHU Anggota Tahun {r.tahun}
              </div>
              <table className="table-compact" style={{ minWidth: 0 }}><thead><tr><th>Anggota</th><th>NIK</th><th>JMA</th><th>JUA</th><th>Bruto</th><th>PPh</th><th>Neto</th></tr></thead><tbody>
                {expanded.rincian.map((x) => <tr key={x.penggunaId}><td><strong>{x.nama}</strong></td><td className="mono">{x.nomorIndukKaryawan}</td><td>{rupiah(x.jma)}</td><td>{rupiah(x.jua)}</td><td>{rupiah(x.totalShu)}</td><td style={{ color: '#dc2626', fontWeight: 600 }}>−{rupiah(x.pajak)}</td><td style={{ fontWeight: 700, color: '#0891b2' }}>{rupiah(x.totalShuNeto)}</td></tr>)}
              </tbody></table>
            </div>
          </td></tr>,
        ])}
      </tbody></table>{!loading && riwayat.length === 0 && <div className="empty-state"><Calculator size={32} style={{ margin: '0 auto 8px', color: '#0891b2', opacity: 0.6 }} /><div>Belum ada SHU yang difinalisasi.</div></div>}</div>
    </section>
  </>
}

type PanduanItem = {
  key: string; icon: ReactNode; judul: string; warna: string; latar: string
  ringkasan: string
  poin: string[]
  tips?: string
  target?: View
  adminOnly?: boolean
  kategori: 'operasional' | 'finansial' | 'admin'
}

function PanduanView({ isAdmin, goto }: { isAdmin: boolean; goto: (target: View) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'operasional' | 'finansial' | 'admin'>('all')

  const menu: PanduanItem[] = [
    {
      key: 'dashboard', icon: <LayoutDashboard size={22} />, judul: 'Dashboard', warna: '#0891b2', latar: '#ecfeff',
      kategori: 'operasional',
      ringkasan: 'Halaman pertama yang Anda lihat — ringkasan kondisi koperasi hari ini dalam sekali pandang.',
      poin: [
        'Kartu besar di atas menunjukkan jumlah anggota aktif, total simpanan koperasi, pinjaman aktif, dan laba bersih tahun berjalan — angka-angka ini dihitung langsung dari pembukuan (jurnal), bukan angka statis.',
        'Kotak kuning "Perlu tindakan Anda" muncul kalau ada pengajuan yang menunggu persetujuan (pendaftaran, simpanan, pinjaman, katalog) — klik salah satu chip-nya untuk langsung dibawa ke menu & tab yang tepat, tidak perlu cari manual.',
        'Grafik tren 6 bulan menampilkan pendapatan vs beban, dan donut chart "Komposisi Simpanan" menunjukkan proporsi Pokok/Wajib/Sukarela dari total saldo simpanan aktif.',
        'Tiga kartu di bawahnya: "Kesehatan Neraca" (posisi Aset vs Liabilitas+Ekuitas hari ini), "SHU Terakhir" (ringkasan SHU tahun buku yang paling baru difinalisasi), dan "Tagihan Anggota" (total potongan gaji periode berjalan yang belum diproses).',
        'Bagian paling bawah memuat aktivitas terbaru yang tercatat di seluruh sistem — cara cepat memantau "apa saja yang baru terjadi" tanpa buka Audit Trail.',
      ],
      tips: 'Jadikan halaman ini kebiasaan pertama tiap kali login — supaya tidak ada pengajuan anggota yang lolos tanpa diproses.',
      target: 'dashboard',
    },
    {
      key: 'anggota', icon: <Users size={22} />, judul: 'Manajemen Anggota', warna: '#0284c7', latar: '#f0f9ff',
      kategori: 'operasional',
      ringkasan: 'Satu menu, tiga tab: dari calon anggota mendaftar sampai potongan gajinya direkap.',
      poin: [
        'Tab "Pendaftaran" — setujui atau tolak calon anggota baru yang mendaftar lewat aplikasi. Setelah disetujui, Simpanan Pokok (nominalnya diatur di Simpan Pinjam → Konfigurasi) otomatis dikreditkan dan jurnal Kas/Simpanan Pokok langsung tercatat.',
        'Tab "Direktori Anggota" — cari anggota aktif, klik namanya untuk pop-up detail lengkap: rincian saldo tiap jenis simpanan, riwayat simpanan berjangka, riwayat lengkap pinjaman (termasuk progres angsuran), dan riwayat belanja katalog.',
        'Tab "Tagihan Anggota" — rekap otomatis 3 jenis potongan gaji: Simpanan Wajib yang belum ditagih, Tagihan Kredit produk yang belum lunas, dan Cicilan Pinjaman yang jatuh tempo bulan itu. Klik satu baris anggota untuk buka pop-up rinci per item — bisa Setuju/Tolak satu-satu atau pakai tombol "Setujui semua" per kategori di atas tabel.',
        'Setelah semua potongan disetujui, klik "Ekspor CSV" untuk dikirim ke bagian penggajian — sistem tidak lagi mensyaratkan langkah "kirim ke SDM" terpisah, cukup approve lalu ekspor.',
      ],
      tips: 'Anggota baru wajib disetujui dulu di tab Pendaftaran sebelum muncul di Direktori maupun bisa ikut transaksi lain (simpanan, pinjaman, belanja).',
      target: 'anggota',
    },
    {
      key: 'simpanpinjam', icon: <PiggyBank size={22} />, judul: 'Simpan Pinjam', warna: '#059669', latar: '#ecfdf5',
      kategori: 'operasional',
      ringkasan: 'Jantung operasional koperasi — kelola simpanan anggota dan proses pinjaman, dalam dua tab.',
      poin: [
        'Tab "Simpanan" bagian Konfigurasi — atur nominal Simpanan Pokok & Wajib, suku bunga tahunan Sukarela/Deposito, serta dua tarif PPh terpisah: Tarif PPh Bunga (untuk Sukarela & Deposito) dan Tarif PPh SHU (khusus SHU, defaultnya 15%, beda dari PPh bunga).',
        'Simpanan Wajib ditagih otomatis tiap bulan pada tanggal yang Anda atur — setujui satu-satu atau pakai "Setujui semua periode ini" untuk memproses sekaligus.',
        'Simpanan Sukarela: setoran/penarikan anggota disetujui di sini. Bunga dihitung metode saldo harian (per hari: saldo × suku bunga ÷ 365) dan hanya bisa ditutup untuk BULAN YANG SUDAH LEWAT — klik "Hitung bunga bulan lalu" untuk memicunya. Bunga bulan berjalan sengaja tidak bisa dihitung karena saldo hariannya belum final (anggota masih bisa setor/tarik lagi).',
        'Simpanan Berjangka (deposito): buat paket (nominal + tenor) di panel "Paket Simpanan Berjangka", lalu setujui pengajuan anggota untuk mengaktifkannya. Saat jatuh tempo, cairkan untuk memberi pokok + bunga neto (dipotong PPh). Kalau anggota minta cair LEBIH CEPAT dari jatuh tempo, anggota hanya menerima pokok — bunga hangus sepenuhnya sebagai konsekuensi pencairan dipercepat.',
        'Tab "Pinjaman" — tinjau pengajuan pinjaman baru; menyetujui otomatis mencairkan dana dan membuat jadwal angsuran bulanan (pokok + jasa) sesuai tenor. Proses juga pembayaran angsuran reguler, atau pelunasan dipercepat (anggota cukup bayar sisa pokok, jasa sisa dibebaskan penuh).',
      ],
      tips: 'Bunga simpanan sukarela dan bunga deposito sama-sama otomatis dipotong PPh sebelum masuk ke saldo anggota — nominalnya selalu ditampilkan terpisah (bruto, PPh, neto) di tabelnya supaya transparan.',
      target: 'simpanpinjam',
    },
    {
      key: 'katalog', icon: <Store size={22} />, judul: 'Katalog', warna: '#d97706', latar: '#fffbeb',
      kategori: 'operasional',
      ringkasan: 'Toko koperasi — baik barang milik koperasi sendiri maupun barang titipan anggota.',
      poin: [
        'Kelola produk milik koperasi sendiri (tambah, ubah harga & stok) di panel "Tambah produk koperasi".',
        'Anggota bisa menitipkan barang untuk dijual lewat katalog — setujui/tolak di panel "Pengajuan titipan anggota"; menyetujui akan langsung memasukkannya ke katalog aktif.',
        'Setujui transaksi pembelian anggota — metode Tunai langsung berstatus "Selesai" (kas & stok berkurang seketika), sedangkan Kredit (potong gaji) membuat Tagihan Kredit baru berstatus "Belum".',
        'Kelola Tagihan Kredit di panel "Rekap tagihan kredit": tandai lunas satu-satu atau sekaligus semua, SETELAH pengurus mengonfirmasi potongan gajinya benar-benar sudah dieksekusi oleh bagian penggajian — bukan sebelum itu.',
      ],
      target: 'katalog',
    },
    {
      key: 'akuntansi', icon: <BookOpen size={22} />, judul: 'Akuntansi & Keuangan', warna: '#083344', latar: '#f0fbfc',
      kategori: 'finansial',
      ringkasan: '"Dapur" koperasi — semua transaksi di menu lain otomatis tercatat di sini sebagai jurnal, mengikuti prinsip akuntansi standar.',
      poin: [
        'Tab "Jurnal Umum" — riwayat semua jurnal (otomatis dari transaksi + manual). Setiap jurnal minimal 2 baris (Debit & Kredit) dan totalnya harus sama persis — prinsipnya, uang tidak pernah "muncul" atau "hilang" begitu saja, selalu berpindah dari satu pos ke pos lain sehingga bisa dipertanggungjawabkan. Klik satu baris jurnal untuk lihat rinciannya di pop-up, atau pakai form di bawah untuk mencatat transaksi di luar sistem (gaji staf, listrik, sewa, dll).',
        'Tab "Neraca" — posisi keuangan koperasi pada SATU TANGGAL tertentu, ibarat "foto": Aset (Kas, Piutang Pinjaman, Piutang Kredit Produk) harus selalu sama dengan Liabilitas (utang ke anggota: simpanan, dll) ditambah Ekuitas (kekayaan bersih koperasi). Kalau Selisih ≠ Rp 0, itu tandanya ada yang tidak beres — cek tab Jurnal Umum atau Audit Trail.',
        'Tab "Hasil Usaha" (dulu disebut Laba Rugi) — kinerja koperasi selama SATU RENTANG WAKTU, ibarat "video": Pendapatan dikurangi Beban dalam periode itu saja (bukan kumulatif seperti Neraca). Hasil akhirnya (SHU/Laba Bersih) yang mengalir jadi bagian Ekuitas di Neraca.',
        'Tab "Arus Kas" — mutasi kas masuk/keluar pada rentang tanggal. Beda dengan Neraca: Arus Kas hanya melacak satu akun (Kas), sementara Neraca menunjukkan kekayaan bersih koperasi secara utuh (termasuk piutang & utang yang bukan kas) — jangan cuma andalkan Arus Kas untuk menilai kesehatan keuangan koperasi.',
        'Tab "SHU" — kalkulator Sisa Hasil Usaha dengan kebijakan pembagian 2 lapis sesuai RAT: Lapis 1 memecah Total SHU jadi Anggota / Pengurus / Cadangan (wajib berjumlah 100%, default 40/20/40); Lapis 2 memecah lagi porsi Anggota tadi jadi Jasa Modal (JMA) / Jasa Usaha (JUA) (wajib 100%, default 30/70). PPh SHU (15%, beda dari PPh bunga) hanya dipotong dari bagian yang diterima anggota — Cadangan dan Jasa Pengurus tidak kena potong karena bukan penghasilan individu. Klik "Hitung (pratinjau)" dulu sebelum "Finalisasi" (yang langsung menayangkan estimasi ke aplikasi anggota dan tidak bisa dibatalkan, hanya bisa dihitung ulang).',
        'Tab "Bagan Akun" — daftar akun akuntansi standar (Aset/Liabilitas/Ekuitas/Pendapatan/Beban); boleh menambah akun baru non-sistem kalau ada kategori transaksi yang belum tertampung (misalnya kami sudah menambahkan "Beban Umum & Administrasi" dan "Beban Penyisihan Piutang Tak Tertagih" untuk kebutuhan pelaporan RAT).',
      ],
      tips: 'Neraca yang tidak balance seharusnya TIDAK PERNAH terjadi kalau semua transaksi lewat aplikasi — kalau muncul, itu sinyal alarm (biasanya ada yang mengedit data langsung lewat database), bukan hal yang wajar dibiarkan.',
      target: 'akuntansi',
    },
    {
      key: 'erat', icon: <Vote size={22} />, judul: 'E-RAT & Dokumen', warna: '#4f46e5', latar: '#eef2ff',
      kategori: 'finansial',
      ringkasan: 'Rapat Anggota Tahunan secara digital — voting, arsip dokumen resmi, dan laporan RAT otomatis.',
      poin: [
        'Tab "Voting Agenda" — buat agenda voting (misalnya pemilihan pengurus atau persetujuan program kerja), tambah/hapus pilihan, lalu tayangkan agar anggota bisa memberi suara lewat aplikasi. Tutup agenda setelah selesai untuk mengunci hasilnya.',
        'Tab "Dokumen RAT" — unggah dan kelola arsip dokumen PDF (laporan tahunan versi lama, dll) yang bisa diunduh anggota; hanya dokumen tahun terbaru yang tampil menonjol di aplikasi anggota.',
        'Tab "Laporan RAT (Otomatis)" — laporan RAT yang DIBUAT OTOMATIS dari data sistem: Neraca, Hasil Usaha, keanggotaan, dan pembagian SHU tahun itu. Anda hanya perlu melengkapi narasi manual (kegiatan usaha & sosial, rencana tahun depan, target RAB) lewat mode "Edit konten & RAB".',
        'Begitu semua kelengkapan terisi (termasuk SHU tahun itu sudah difinalisasi), tombol "Tayangkan ke Anggota" akan aktif — klik untuk mempublikasikan laporan langsung ke aplikasi anggota, TANPA perlu export/upload PDF manual. Tombol "Cetak / Simpan PDF" tetap tersedia kalau Anda mau versi cetaknya.',
        'Hanya tahun buku TERBARU yang ditayangkan yang tampil ke anggota (sama seperti pola Dokumen RAT) — tahun-tahun sebelumnya tetap tersimpan dan bisa dibuka kapan saja oleh pengurus lewat pemilih tahun buku.',
      ],
      target: 'erat',
    },
  ]

  const adminMenu: PanduanItem[] = [
    {
      key: 'akun', icon: <UserCog size={22} />, judul: 'Akun & Peran Pengguna', warna: '#b45309', latar: '#fefce8',
      kategori: 'admin',
      ringkasan: 'Khusus Admin — kelola siapa saja yang punya akses ke sistem dan sebagai apa.',
      poin: [
        'Lihat semua akun, aktifkan/nonaktifkan login seseorang.',
        'Ubah peran pengguna: Admin, Pengurus, atau Anggota (tidak bisa menurunkan/menonaktifkan satu-satunya Admin yang tersisa, sebagai pengaman supaya sistem tidak pernah kehilangan akses admin sama sekali).',
        'Reset akses (password) anggota yang lupa password — sistem membuatkan password sementara untuk disampaikan langsung; anggota bisa menggantinya sendiri lewat aplikasi setelah login.',
        'Impor/ekspor data anggota massal lewat CSV — berguna untuk migrasi data awal atau backup berkala.',
      ],
      target: 'akun', adminOnly: true,
    },
    {
      key: 'audit', icon: <Fingerprint size={22} />, judul: 'Audit Trail', warna: '#dc2626', latar: '#fef2f2',
      kategori: 'admin',
      ringkasan: 'Khusus Admin — jejak digital setiap perubahan data sensitif, untuk transparansi dan pengawasan.',
      poin: [
        'Tab "Aktivitas aplikasi" — mencatat siapa melakukan apa LEWAT admin console (persetujuan, perubahan peran, finalisasi SHU, dll), bisa difilter per modul. Ini menjawab "siapa pengguna aplikasi yang melakukan aksi ini".',
        'Tab "Log database (mentah)" — lapisan kedua yang berjalan langsung di level database (lewat trigger SQL Server), jadi mencatat perubahan APA PUN JALURNYA, termasuk kalau ada yang mengedit data langsung lewat tool database (SSMS/dBeaver) tanpa lewat aplikasi sama sekali. Kolom "Aplikasi" dan "DB Login" menunjukkan proses & akun mana yang melakukan perubahan itu.',
        'Setiap baris log database saling terhubung lewat rantai hash (mirip blockchain sederhana) — kalau ada yang mencoba mengubah atau menghapus riwayat log itu sendiri secara diam-diam, rantainya akan "putus" dan ketahuan.',
        'Klik tombol "Verifikasi integritas" untuk menghitung ulang seluruh rantai hash dan memastikan tidak ada baris yang dimanipulasi setelah tercatat — laporan "Rantai hash audit database utuh" berarti semua riwayat masih asli.',
      ],
      target: 'audit', adminOnly: true,
    },
  ]

  const semua = useMemo(() => (isAdmin ? [...menu, ...adminMenu] : menu), [isAdmin])

  const filteredPanduan = useMemo(() => {
    return semua.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.kategori === activeCategory
      if (!matchCategory) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const matchJudul = item.judul.toLowerCase().includes(q)
      const matchRingkasan = item.ringkasan.toLowerCase().includes(q)
      const matchTips = item.tips ? item.tips.toLowerCase().includes(q) : false
      const matchPoin = item.poin.some(p => p.toLowerCase().includes(q))
      return matchJudul || matchRingkasan || matchTips || matchPoin
    })
  }, [semua, activeCategory, searchQuery])

  return (
    <div className="content-wrap">
      <section className="panduan-hero">
        <div className="panduan-hero-content">
          <span className="eyebrow"><HelpCircle size={14} /> PANDUAN PENGURUS & ADMIN</span>
          <h1>Pusat Bantuan & Panduan Sistem 👋</h1>
          <p>
            Pelajari alur kerja operasional, pembukuan akuntansi standar, hingga manajemen hak akses pengguna.
            Cari panduan spesifik atau navigasi cepat ke menu terkait di bawah.
          </p>
          <div className="panduan-search-bar">
            <Search size={18} color="#0891b2" />
            <input
              type="text"
              placeholder="Cari fitur, topik, atau kata kunci (misal: 'bunga', 'jurnal', 'tagihan', 'SHU')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: '#94a3b8', display: 'grid', placeItems: 'center', padding: 2 }}
                title="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="panduan-quick-chips">
        <button
          type="button"
          className={`panduan-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Semua Panduan ({semua.length})
        </button>
        <button
          type="button"
          className={`panduan-chip ${activeCategory === 'operasional' ? 'active' : ''}`}
          onClick={() => setActiveCategory('operasional')}
        >
          Operasional & Layanan
        </button>
        <button
          type="button"
          className={`panduan-chip ${activeCategory === 'finansial' ? 'active' : ''}`}
          onClick={() => setActiveCategory('finansial')}
        >
          Keuangan & RAT
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`panduan-chip ${activeCategory === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveCategory('admin')}
          >
            Khusus Admin ({adminMenu.length})
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {filteredPanduan.map((m) => (
          <section key={m.key} id={`panduan-${m.key}`} className="panduan-card" style={{ scrollMarginTop: 24 }}>
            <div className="panduan-card-header">
              <div className="panduan-card-title-group">
                <span className="panduan-card-icon" style={{ background: m.latar, color: m.warna }}>
                  {m.icon}
                </span>
                <div className="panduan-card-title">
                  <h2>
                    {m.judul}
                    {m.adminOnly && <span className="role-pill admin">Khusus Admin</span>}
                  </h2>
                  <p>{m.ringkasan}</p>
                </div>
              </div>
              {m.target && (
                <button
                  type="button"
                  className="panduan-action-btn"
                  onClick={() => goto(m.target as View)}
                >
                  Buka Menu {m.judul} <ArrowRight size={14} />
                </button>
              )}
            </div>
            <div className="panduan-card-body">
              <div className="panduan-step-list">
                {m.poin.map((p, i) => (
                  <div key={i} className="panduan-step-item">
                    <span className="panduan-step-num">{i + 1}</span>
                    <div style={{ flex: 1 }}>{p}</div>
                  </div>
                ))}
              </div>
              {m.tips && (
                <div className="panduan-tips-box">
                  <Lightbulb size={17} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: 2 }}>Tips Pengurus:</strong>
                    <span>{m.tips}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        {filteredPanduan.length === 0 && (
          <div className="table-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Search size={36} style={{ color: '#94a3b8', margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ margin: '0 0 6px', color: '#083344', fontSize: 16 }}>Tidak ada panduan yang cocok</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13 }}>
              Tidak ditemukan hasil untuk kata kunci "{searchQuery}".
            </p>
            <button
              type="button"
              className="panduan-chip active"
              onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      <section className="table-panel" style={{ marginTop: 24, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #ecfeff 100%)' }}>
          <span style={{
            width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
            background: '#0891b2', color: '#ffffff', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
          }}>
            <HelpCircle size={24} />
          </span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: 15, color: '#083344', marginBottom: 4 }}>
              Masih membutuhkan bantuan atau memiliki pertanyaan teknis?
            </strong>
            <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              Diskusikan dengan tim pengurus koperasi atau hubungi tim teknis pengembang sistem.
              Dokumentasi panduan ini diselaraskan langsung dengan pembaruan fitur aplikasi.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
  money,
  subtitle,
  chip,
  onClick,
}: {
  label: string
  value: number | string
  icon: ReactNode
  tone: string
  money?: boolean
  subtitle?: string
  chip?: { text: string; type: 'positive' | 'warning' }
  onClick?: () => void
}) {
  const displayVal = typeof value === 'number' ? (money ? rupiah(value) : value.toLocaleString('id-ID')) : value
  return (
    <div
      className={`stat-card-modern ${tone}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className={`stat-card-icon ${tone}`}>{icon}</span>
      </div>
      <div className="stat-card-value">{displayVal}</div>
      {(subtitle || chip) && (
        <div className="stat-card-footer">
          <span>{subtitle}</span>
          {chip && <span className={`stat-card-chip ${chip.type}`}>{chip.text}</span>}
        </div>
      )}
    </div>
  )
}

function LoginScreen({ nik, password, setNik, setPassword, loading, error, onSubmit }: { nik: string; password: string; setNik: (value: string) => void; setPassword: (value: string) => void; loading: boolean; error: string; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-card"><div className="brand-lockup centered"><div className="brand-mark"><img src={logoKkcs} alt="Logo KKCS" /></div><div><strong>KKCS</strong><span>Admin Console</span></div></div><div className="login-copy"><p className="eyebrow">RUANG PENGURUS</p><h1>Masuk ke console</h1><p>Gunakan akun dengan role Admin atau Pengurus untuk melanjutkan.</p></div>{error && <div className="alert error"><X size={17} />{error}</div>}<form onSubmit={onSubmit}><label>NIK<input value={nik} onChange={(event) => setNik(event.target.value)} placeholder="Nomor Induk Karyawan" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required /></label><button className="submit-button" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button></form><small className="login-note">Akses dicatat berdasarkan role akun di server.</small></div></div> }

export default App
