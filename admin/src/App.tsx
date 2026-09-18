import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { Activity, BadgeCheck, Banknote, BookOpen, Calculator, Database, Download, FileSpreadsheet, FileText, Fingerprint, HandCoins, HelpCircle, KeyRound, LayoutDashboard, Lightbulb, LogOut, Menu, PiggyBank, Receipt, RefreshCw, Scale, Search, Send, ShieldCheck, Store, TrendingUp, Upload, UserCog, UserPlus, Users, Vote, Wallet, X, Zap } from 'lucide-react'
import './App.css'

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

type View = 'dashboard' | 'anggota' | 'simpanpinjam' | 'katalog' | 'erat' | 'akuntansi' | 'akun' | 'audit' | 'panduan'
const VIEW_TITLE: Record<View, string> = { dashboard: 'Dashboard', anggota: 'Manajemen Anggota', simpanpinjam: 'Simpan Pinjam', katalog: 'Katalog produk', erat: 'E-RAT & dokumen', akuntansi: 'Akuntansi & Keuangan', akun: 'Akun & Peran Pengguna', audit: 'Audit Trail', panduan: 'Panduan Pengurus' }
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
  return <div className="console-shell">
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div>
      <nav className="primary-nav">
        <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => goto('dashboard')}><LayoutDashboard size={18} /> Dashboard</button>
        <button className={`nav-item ${view === 'anggota' ? 'active' : ''}`} onClick={() => goto('anggota')}><Users size={18} /> Manajemen Anggota</button>
        <button className={`nav-item ${view === 'simpanpinjam' ? 'active' : ''}`} onClick={() => goto('simpanpinjam')}><PiggyBank size={18} /> Simpan Pinjam</button>
        <button className={`nav-item ${view === 'katalog' ? 'active' : ''}`} onClick={() => goto('katalog')}><Store size={18} /> Katalog</button>
        <button className={`nav-item ${view === 'akuntansi' ? 'active' : ''}`} onClick={() => goto('akuntansi')}><BookOpen size={18} /> Akuntansi</button>
        <button className={`nav-item ${view === 'erat' ? 'active' : ''}`} onClick={() => goto('erat')}><Vote size={18} /> E-RAT</button>
        {isAdmin && <>
          <div style={{ margin: '10px 13px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#7fa39c', textTransform: 'uppercase' }}>Khusus Admin</div>
          <button className={`nav-item ${view === 'akun' ? 'active' : ''}`} onClick={() => goto('akun')}><UserCog size={18} /> Akun & Peran</button>
          <button className={`nav-item ${view === 'audit' ? 'active' : ''}`} onClick={() => goto('audit')}><Fingerprint size={18} /> Audit Trail</button>
        </>}
        <div style={{ margin: '10px 13px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#7fa39c', textTransform: 'uppercase' }}>Bantuan</div>
        <button className={`nav-item ${view === 'panduan' ? 'active' : ''}`} onClick={() => goto('panduan')}><HelpCircle size={18} /> Panduan Pengurus</button>
      </nav>
      <div className="sidebar-footer"><ShieldCheck size={16} /> Role-based access</div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Buka navigasi"><Menu size={20} /></button>
        <div><p className="eyebrow">OPERASIONAL</p><h1>{VIEW_TITLE[view]}</h1></div>
        <div className="topbar-actions"><button className="profile-chip" onClick={logout} title={nama}><span className="mini-avatar"><Users size={16} /></span><span>{isAdmin ? 'Admin' : 'Pengurus'}</span><LogOut size={15} /></button></div>
      </header>
      {view === 'dashboard' && <DashboardView token={token} onExpired={handleExpired} nama={nama} isAdmin={isAdmin} goto={goto} />}
      {view === 'anggota' && <AnggotaMenuView token={token} onExpired={handleExpired} tab={anggotaTab} setTab={setAnggotaTab} />}
      {view === 'simpanpinjam' && <SimpanPinjamView token={token} onExpired={handleExpired} isAdmin={isAdmin} tab={spTab} setTab={setSpTab} />}
      {view === 'katalog' && <CatalogView token={token} onExpired={handleExpired} />}
      {view === 'erat' && <EratView token={token} onExpired={handleExpired} />}
      {view === 'akuntansi' && <AkuntansiView token={token} onExpired={handleExpired} tab={akuntansiTab} setTab={setAkuntansiTab} />}
      {view === 'akun' && isAdmin && <AkunView token={token} onExpired={handleExpired} />}
      {view === 'audit' && isAdmin && <AuditTrailView token={token} onExpired={handleExpired} />}
      {view === 'panduan' && <PanduanView isAdmin={isAdmin} goto={goto} />}
    </main>
  </div>
}

function DashboardView({ token, onExpired, nama, isAdmin, goto }: { token: string; onExpired: () => void; nama: string; isAdmin: boolean; goto: (target: View, opts?: { anggotaTab?: AnggotaTab; spTab?: SimpanPinjamTab; akuntansiTab?: AkuntansiTab }) => void }) {
  const [data, setData] = useState<DashboardRingkasan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API_BASE}/api/admin/dashboard/ringkasan`, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 401) { onExpired(); return }
      if (!response.ok) throw new Error('Gagal memuat dashboard.')
      setData(await response.json())
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan jaringan.') }
    finally { setLoading(false) }
  }, [token, onExpired])
  useEffect(() => { void load() }, [load])

  const jam = new Date().getHours()
  const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam'
  const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  const aksi = data ? [
    { label: 'Pendaftaran anggota', jumlah: data.pendaftaranMenunggu, target: 'anggota' as View, anggotaTab: 'pendaftaran' as AnggotaTab },
    { label: 'Simpanan Wajib', jumlah: data.wajibMenunggu, target: 'simpanpinjam' as View, spTab: 'simpanan' as SimpanPinjamTab },
    { label: 'Simpanan Sukarela', jumlah: data.sukarelaMenunggu, target: 'simpanpinjam' as View, spTab: 'simpanan' as SimpanPinjamTab },
    { label: 'Simpanan Berjangka', jumlah: data.berjangkaMenunggu, target: 'simpanpinjam' as View, spTab: 'simpanan' as SimpanPinjamTab },
    { label: 'Pengajuan Pinjaman', jumlah: data.pengajuanPinjamanMenunggu, target: 'simpanpinjam' as View, spTab: 'pinjaman' as SimpanPinjamTab },
    { label: 'Pembayaran Pinjaman', jumlah: data.pembayaranPinjamanMenunggu, target: 'simpanpinjam' as View, spTab: 'pinjaman' as SimpanPinjamTab },
    { label: 'Titipan produk', jumlah: data.titipanMenunggu, target: 'katalog' as View },
    { label: 'Pembelian produk', jumlah: data.pembelianMenunggu, target: 'katalog' as View },
  ].filter((a) => a.jumlah > 0) : []

  const komposisiSimpanan = data ? [
    { label: 'Pokok', value: data.saldoPokok, color: '#087f78' },
    { label: 'Wajib', value: data.saldoWajib, color: '#436a97' },
    { label: 'Sukarela', value: data.saldoSukarela, color: '#ad6a16' },
    { label: 'Berjangka', value: data.saldoBerjangka, color: '#7c5cbf' },
  ].filter((k) => k.value > 0) : []

  return <div className="content-wrap">
    <section className="welcome-row" style={{
      background: 'linear-gradient(120deg, #0b6e69 0%, #0f8a7f 55%, #14a693 100%)',
      borderRadius: 16, padding: '28px 32px', color: '#fff', marginBottom: 24, alignItems: 'center',
      boxShadow: '0 18px 45px rgba(11,110,105,.28)',
    }}>
      <div>
        <p className="eyebrow" style={{ color: '#bdeee3' }}>{hariIni.toUpperCase()}</p>
        <h1 style={{ margin: '4px 0 6px', fontSize: 26 }}>{salam}, {nama.split(' ')[0]} 👋</h1>
        <p style={{ color: '#dcf3ec', margin: 0, fontSize: 13 }}>
          {data && data.totalMenunggu > 0
            ? `Ada ${data.totalMenunggu} hal yang menunggu tindakan Anda hari ini.`
            : 'Semua tugas persetujuan sudah tuntas — koperasi berjalan lancar.'}
        </p>
      </div>
      <div className="sync-label" style={{ color: '#dcf3ec' }}><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" style={{ color: '#dcf3ec' }} onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div>
    </section>

    {error && <div className="alert error"><X size={17} />{error}</div>}

    {data && <>
      {/* Hero stats */}
      <section className="stat-grid">
        <StatCard label="Anggota aktif" value={data.totalAnggotaAktif} icon={<Users size={20} />} tone="teal" />
        <StatCard label="Total simpanan koperasi" value={data.totalSimpanan} icon={<PiggyBank size={20} />} tone="blue" money />
        <StatCard label="Pinjaman aktif (sisa pokok)" value={data.totalSisaPokokPinjaman} icon={<HandCoins size={20} />} tone="amber" money />
        <StatCard label="Laba bersih tahun ini" value={data.labaBersihTahunIni} icon={<TrendingUp size={20} />} tone="green" money />
      </section>

      {/* Perlu tindakan */}
      {aksi.length > 0 && (
        <section className="table-panel" style={{ marginBottom: 22, borderColor: '#f2d9b8' }}>
          <div className="panel-heading">
            <div><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} color="#bd6d1d" /> Perlu tindakan Anda</h2><p>Klik salah satu untuk langsung menuju menu terkait.</p></div>
            <span className="record-count" style={{ color: '#ad6a16', background: '#f8ead0' }}>{data.totalMenunggu} total</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '4px 25px 24px' }}>
            {aksi.map((a) => (
              <button key={a.label} onClick={() => goto(a.target, { anggotaTab: a.anggotaTab, spTab: a.spTab })} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
                border: '1px solid #f2d9b8', background: '#fdf7ee', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#8a5a1f',
              }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: '#ad6a16', color: '#fff', fontSize: 11 }}>{a.jumlah}</span>
                {a.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="dash-grid-2">
        {/* Tren keuangan 6 bulan */}
        <section className="table-panel">
          <div className="panel-heading">
            <div><h2>Tren keuangan 6 bulan</h2><p>Pendapatan vs beban per bulan, dihitung langsung dari buku besar.</p></div>
          </div>
          <div style={{ padding: '4px 25px 24px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, fontSize: 11, color: 'var(--muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 3, background: '#087f78', display: 'inline-block' }} />Pendapatan</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 10 }}><i style={{ width: 9, height: 9, borderRadius: 3, background: '#d98a4a', display: 'inline-block' }} />Beban</span>
            </div>
            <TrenChart data={data.trenBulanan} />
          </div>
        </section>

        {/* Komposisi simpanan */}
        <section className="table-panel">
          <div className="panel-heading"><div><h2>Komposisi simpanan</h2><p>Sebaran saldo aktif per jenis.</p></div></div>
          <div style={{ padding: '4px 25px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart items={komposisiSimpanan} total={data.totalSimpanan} />
            <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 0 }}>
              {komposisiSimpanan.map((k) => (
                <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <i style={{ width: 9, height: 9, borderRadius: 3, background: k.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.label}</span>
                  </span>
                  <strong style={{ flexShrink: 0 }}>{rupiah(k.value)}</strong>
                </div>
              ))}
              {komposisiSimpanan.length === 0 && <small style={{ color: 'var(--muted)' }}>Belum ada saldo simpanan.</small>}
            </div>
          </div>
        </section>
      </div>

      <div className="dash-grid-3">
        {/* Kesehatan neraca */}
        <section className="table-panel">
          <div className="panel-heading"><div><h2>Kesehatan neraca</h2><p>Per hari ini.</p></div></div>
          <div style={{ padding: '4px 25px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span>Aset</span><strong>{rupiah(data.totalAset)}</strong></div>
            <div style={{ height: 8, borderRadius: 5, background: '#e5f4ef', overflow: 'hidden', marginBottom: 14 }}><div style={{ width: '100%', height: '100%', background: '#087f78' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span>Liabilitas + Ekuitas</span><strong>{rupiah(data.totalLiabilitas + data.totalEkuitas)}</strong></div>
            <div style={{ height: 8, borderRadius: 5, background: '#e1eaf5', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: data.totalAset > 0 ? `${Math.min(100, ((data.totalLiabilitas + data.totalEkuitas) / data.totalAset) * 100)}%` : '0%', height: '100%', background: '#436a97' }} />
            </div>
            <div className={`alert ${Math.abs(data.selisihNeraca) < 1 ? 'success' : 'error'}`} style={{ margin: 0 }}>
              {Math.abs(data.selisihNeraca) < 1 ? <BadgeCheck size={16} /> : <X size={16} />}
              {Math.abs(data.selisihNeraca) < 1 ? 'Neraca balance' : `Selisih ${rupiah(data.selisihNeraca)}`}
            </div>
            <button className="toggle-button" style={{ marginTop: 12, width: '100%' }} onClick={() => goto('akuntansi', { akuntansiTab: 'neraca' })}>Buka Akuntansi</button>
          </div>
        </section>

        {/* SHU terakhir */}
        <section className="table-panel">
          <div className="panel-heading"><div><h2>SHU terakhir</h2><p>Tahun buku terfinalisasi.</p></div></div>
          <div style={{ padding: '4px 25px 24px' }}>
            {data.shuTerakhir ? <>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#087f78', fontFamily: "'Space Grotesk', sans-serif" }}>{data.shuTerakhir.tahun}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Difinalisasi {tanggal(data.shuTerakhir.difinalisasiPada)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span>Total SHU (bruto)</span><strong>{rupiah(data.shuTerakhir.totalShu)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span>Neto ke anggota</span><strong>{rupiah(data.shuTerakhir.totalShuNeto)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>Jumlah anggota</span><strong>{data.shuTerakhir.jumlahAnggota}</strong></div>
            </> : <div className="empty-state" style={{ padding: '20px 0' }}>Belum ada SHU difinalisasi.</div>}
            <button className="toggle-button" style={{ marginTop: 14, width: '100%' }} onClick={() => goto('akuntansi', { akuntansiTab: 'shu' })}>Buka SHU</button>
          </div>
        </section>

        {/* Tagihan Anggota (payroll) */}
        <section className="table-panel">
          <div className="panel-heading"><div><h2>Tagihan Anggota periode ini</h2><p>Potongan gaji periode berjalan, siap diekspor.</p></div></div>
          <div style={{ padding: '4px 25px 24px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{rupiah(data.payrollTotalPeriodeIni)}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>{data.payrollJumlahAnggota} anggota terpotong bulan ini</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>Tagihan kredit belum lunas</span><strong style={{ color: data.tagihanKreditBelumLunas > 0 ? '#ad6a16' : 'inherit' }}>{rupiah(data.tagihanKreditBelumLunas)}</strong></div>
            <button className="toggle-button" style={{ marginTop: 14, width: '100%' }} onClick={() => goto('anggota', { anggotaTab: 'payroll' })}>Buka Tagihan Anggota</button>
          </div>
        </section>
      </div>

      {/* Aktivitas terbaru */}
      <section className="table-panel">
        <div className="panel-heading">
          <div><h2>Aktivitas terbaru</h2><p>{data.auditHariIni} aktivitas tercatat hari ini di seluruh sistem.</p></div>
          {isAdmin && <button className="toggle-button" onClick={() => goto('audit')}>Lihat Audit Trail</button>}
        </div>
        <div style={{ padding: '4px 25px 20px' }}>
          {data.aktivitasTerbaru.length === 0 && <div className="empty-state">Belum ada aktivitas tercatat.</div>}
          {data.aktivitasTerbaru.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 0', borderTop: i > 0 ? '1px solid var(--line)' : undefined }}>
              <span className="avatar" style={{ flexShrink: 0 }}>{a.pelakuNama.charAt(0).toUpperCase()}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5 }}><strong>{a.pelakuNama}</strong> <span className="role-pill pengurus" style={{ marginLeft: 4 }}>{a.modul}</span></div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.ringkasan}</div>
              </div>
              <small style={{ color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{waktu(a.waktuUtc)}</small>
            </div>
          ))}
        </div>
      </section>
    </>}
  </div>
}

function TrenChart({ data }: { data: DashboardTren[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.pendapatan, d.beban)))
  return <div style={{ display: 'flex', alignItems: 'end', gap: 14, height: 160 }}>
    {data.map((d) => (
      <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'end' }}>
        <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 120, width: '100%', justifyContent: 'center' }} title={`Pendapatan ${rupiah(d.pendapatan)} · Beban ${rupiah(d.beban)}`}>
          <div style={{ width: 9, borderRadius: '3px 3px 0 0', background: '#087f78', height: `${Math.max(2, (d.pendapatan / max) * 120)}px` }} />
          <div style={{ width: 9, borderRadius: '3px 3px 0 0', background: '#d98a4a', height: `${Math.max(2, (d.beban / max) * 120)}px` }} />
        </div>
        <small style={{ fontSize: 10.5, color: 'var(--muted)' }}>{d.label}</small>
      </div>
    ))}
  </div>
}

function DonutChart({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  let acc = 0
  const stops = items.map((item) => {
    const start = total > 0 ? (acc / total) * 360 : 0
    acc += item.value
    const end = total > 0 ? (acc / total) * 360 : 0
    return `${item.color} ${start}deg ${end}deg`
  })
  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : '#edf2f0'
  return <div style={{ flexShrink: 0, width: 108, height: 108, borderRadius: '50%', background: gradient, display: 'grid', placeItems: 'center' }}>
    <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      <div>
        <div style={{ fontSize: 9, color: 'var(--muted)' }}>Total</div>
        <div style={{ fontSize: 10, fontWeight: 800 }}>{total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)}jt` : rupiah(total)}</div>
      </div>
    </div>
  </div>
}

function MenuTabBar<T extends string>({ tabs, active, onChange }: { tabs: { key: T; label: string }[]; active: T; onChange: (key: T) => void }) {
  return <div style={{ display: 'flex', gap: 8, padding: '30px 42px 0', maxWidth: 1380, margin: '0 auto' }}>
    {tabs.map((t) => (
      <button key={t.key} className={`toggle-button ${active === t.key ? 'activate' : ''}`} onClick={() => onChange(t.key)}>{t.label}</button>
    ))}
  </div>
}

function AnggotaMenuView({ token, onExpired, tab, setTab }: { token: string; onExpired: () => void; tab: AnggotaTab; setTab: (t: AnggotaTab) => void }) {
  return <>
    <MenuTabBar tabs={[
      { key: 'pendaftaran', label: 'Pendaftaran' },
      { key: 'direktori', label: 'Direktori Anggota' },
      { key: 'payroll', label: 'Tagihan Anggota' },
    ]} active={tab} onChange={setTab} />
    {tab === 'pendaftaran' && <PendaftaranView token={token} onExpired={onExpired} />}
    {tab === 'direktori' && <AnggotaDirektoriView token={token} onExpired={onExpired} />}
    {tab === 'payroll' && <PayrollView token={token} onExpired={onExpired} />}
  </>
}

function SimpanPinjamView({ token, onExpired, isAdmin, tab, setTab }: { token: string; onExpired: () => void; isAdmin: boolean; tab: SimpanPinjamTab; setTab: (t: SimpanPinjamTab) => void }) {
  return <>
    <MenuTabBar tabs={[
      { key: 'simpanan', label: 'Simpanan' },
      { key: 'pinjaman', label: 'Pinjaman' },
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
  </div>
}

function AnggotaDirektoriView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [anggota, setAnggota] = useState<AnggotaDirektoriItem[]>([])
  const [query, setQuery] = useState('')
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
    return !needle || [item.namaLengkap, item.nomorIndukKaryawan, item.email ?? ''].some((value) => value.toLowerCase().includes(needle))
  }), [anggota, query])

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
      <div className="filters"><label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, NIK, atau email" /></label></div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Peran</th><th className="align-right">Total simpanan</th><th>Bergabung</th></tr></thead><tbody>
        {filtered.map((item) => <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(item.id)}>
          <td><div className="user-cell"><span className="avatar">{item.namaLengkap.charAt(0).toUpperCase()}</span><div><strong>{item.namaLengkap}</strong><small>{item.email ?? 'Email belum diisi'}</small></div></div></td>
          <td className="mono">{item.nomorIndukKaryawan}</td>
          <td><span className={`role-pill ${item.peran.toLowerCase()}`}>{item.peran}</span></td>
          <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(item.totalSimpanan)}</td>
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

  const statusWarna = (status: string) => ({
    Aktif: '#2d8155', Disetujui: '#2d8155', Selesai: '#2d8155', Dibayar: '#2d8155', Lunas: '#2d8155',
    Diajukan: '#ad6a16', MenungguPersetujuan: '#ad6a16', JatuhTempo: '#ad6a16', Ditagih: '#ad6a16',
    Ditolak: '#b3403a', Ditolak2: '#b3403a', Dibatalkan: 'var(--muted)', Dicairkan: '#3768a8',
  } as Record<string, string>)[status] ?? 'var(--muted)'

  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 35, 30, 0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
    <div style={{ background: '#fff', borderRadius: 14, width: 'min(880px, 100%)', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }} onClick={(e) => e.stopPropagation()}>
      {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Memuat detail anggota…</div>}
      {error && <div className="alert error" style={{ margin: 20 }}><X size={17} />{error}</div>}
      {detail && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '22px 26px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span className="avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{detail.namaLengkap.charAt(0).toUpperCase()}</span>
            <div>
              <h2 style={{ margin: 0 }}>{detail.namaLengkap}</h2>
              <small style={{ color: 'var(--muted)' }}>NIK {detail.nomorIndukKaryawan} · {detail.email ?? 'Email belum diisi'} · {detail.nomorTelepon ?? 'Telepon belum diisi'}</small><br />
              <span className={`role-pill ${detail.peran.toLowerCase()}`} style={{ marginTop: 6, display: 'inline-block' }}>{detail.peran}</span>{' '}
              <span className={`status-pill ${detail.aktif ? 'active' : 'inactive'}`} style={{ display: 'inline-flex' }}><i />{detail.aktif ? 'Aktif' : 'Nonaktif'}</span>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
        </div>

        <div style={{ padding: '18px 26px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Komponen simpanan</h3>
          <div className="stat-grid" style={{ marginBottom: 22 }}>
            <StatCard label="Simpanan Pokok" value={detail.saldoPokok} icon={<PiggyBank size={18} />} tone="teal" money />
            <StatCard label="Simpanan Wajib" value={detail.saldoWajib} icon={<PiggyBank size={18} />} tone="blue" money />
            <StatCard label="Simpanan Sukarela" value={detail.saldoSukarela} icon={<PiggyBank size={18} />} tone="amber" money />
            <StatCard label="Total simpanan" value={detail.totalSimpanan} icon={<Wallet size={18} />} tone="green" money />
          </div>

          {detail.berjangka.length > 0 && <>
            <h4 style={{ margin: '0 0 8px', fontSize: 12, color: '#526763' }}>Simpanan Berjangka</h4>
            <div className="table-scroll" style={{ marginBottom: 22 }}><table><thead><tr><th>No. Sertifikat</th><th>Produk</th><th className="align-right">Nominal</th><th>Tenor</th><th>Status</th><th>Jatuh tempo</th></tr></thead><tbody>
              {detail.berjangka.map((b) => <tr key={b.nomorSertifikat}>
                <td className="mono">{b.nomorSertifikat}</td><td>{b.produkNama}</td>
                <td className="align-right">{rupiah(b.nominal)}</td><td>{b.tenorBulan} bln</td>
                <td style={{ color: statusWarna(b.status) }}>{b.status}</td>
                <td>{b.tanggalJatuhTempo ? tanggal(b.tanggalJatuhTempo) : '—'}</td>
              </tr>)}
            </tbody></table></div>
          </>}

          <h3 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Riwayat pinjaman</h3>
          <div className="table-scroll" style={{ marginBottom: 22 }}><table><thead><tr><th>No. Pinjaman</th><th className="align-right">Pokok</th><th className="align-right">Sisa</th><th>Angsuran</th><th>Status</th><th>Mulai</th></tr></thead><tbody>
            {detail.pinjaman.map((p) => <tr key={p.nomorPinjaman}>
              <td className="mono">{p.nomorPinjaman}</td>
              <td className="align-right">{rupiah(p.pokok)}</td>
              <td className="align-right">{rupiah(p.sisaPokok)}</td>
              <td>{p.angsuranTerbayar}/{p.tenorBulan}</td>
              <td style={{ color: statusWarna(p.status) }}>{p.status}</td>
              <td>{tanggal(p.tanggalMulai)}</td>
            </tr>)}
          </tbody></table>{detail.pinjaman.length === 0 && <div className="empty-state">Belum pernah mengajukan pinjaman.</div>}</div>

          <h3 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Riwayat belanja katalog</h3>
          <div className="table-scroll"><table><thead><tr><th>No. Transaksi</th><th>Produk</th><th>Jenis</th><th className="align-right">Total</th><th>Metode</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
            {detail.belanja.map((b) => <tr key={b.nomorTransaksi}>
              <td className="mono">{b.nomorTransaksi}</td><td>{b.produkNama}</td><td>{b.jenis}</td>
              <td className="align-right">{rupiah(b.total)}</td><td>{b.metodePembayaran}</td>
              <td style={{ color: statusWarna(b.status) }}>{b.status}</td>
              <td>{tanggal(b.diajukanPada)}</td>
            </tr>)}
          </tbody></table>{detail.belanja.length === 0 && <div className="empty-state">Belum pernah berbelanja di katalog.</div>}</div>
          {detail.totalTagihanKreditBelum > 0 && <div style={{ marginTop: 14, fontSize: 12, color: '#ad6a16' }}>Tagihan kredit belum lunas: <strong>{rupiah(detail.totalTagihanKreditBelum)}</strong></div>}
        </div>
      </>}
    </div>
  </div>
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

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Akun & peran pengguna</h2><p>Operasional teknis sistem — aktif/nonaktif akun, ubah peran, reset akses, dan kelola data anggota massal. Khusus Admin.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void loadUsers()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    {notice && <div className="alert success"><BadgeCheck size={17} />{notice}</div>}
    {resetInfo && <div className="alert success" style={{ alignItems: 'start' }}>
      <KeyRound size={17} />
      <div>Password sementara untuk <strong>{resetInfo.nama}</strong>: <code style={{ background: '#fff', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{resetInfo.password}</code> — sampaikan langsung/aman, lalu anggota disarankan segera menggantinya. <button className="toggle-button" style={{ marginLeft: 8 }} onClick={() => setResetInfo(null)}>Tutup</button></div>
    </div>}
    <section className="stat-grid"><StatCard label="Total pengguna" value={users.length} icon={<Users size={20} />} tone="teal" /><StatCard label="Pengguna aktif" value={activeCount} icon={<BadgeCheck size={20} />} tone="green" /><StatCard label="Peran terdaftar" value={roles.length} icon={<Database size={20} />} tone="blue" /></section>

    <section className="table-panel" style={{ marginBottom: 22 }}>
      <div className="panel-heading"><div><h2>Impor / ekspor data anggota</h2><p>Perbarui data banyak anggota sekaligus lewat CSV (dibuka & diedit di Excel), dicocokkan berdasarkan kolom NIK.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 25px 12px', alignItems: 'center' }}>
        <button className="toggle-button activate" onClick={() => void exportCsv()}><Download size={14} style={{ verticalAlign: -2, marginRight: 5 }} />Ekspor CSV</button>
        <label className="toggle-button" style={{ cursor: importBusy ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <Upload size={14} style={{ marginRight: 5 }} />{importBusy ? 'Mengunggah...' : 'Impor CSV'}
          <input type="file" accept=".csv,text/csv" hidden disabled={importBusy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCsv(f); e.target.value = '' }} />
        </label>
        <small style={{ color: 'var(--muted)' }}>Kolom: NIK (wajib, kunci pencocokan), Nama, Email, Telepon, Alamat, Peran, StatusKeanggotaan, Aktif.</small>
      </div>
      {importResult && (
        <div style={{ padding: '0 25px 18px', fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{importResult.diperbarui} anggota diperbarui.</strong>
          {importResult.dilewati.length > 0 && <div>NIK tidak ditemukan (dilewati): {importResult.dilewati.join(', ')}</div>}
          {importResult.galat.length > 0 && <div style={{ color: '#a05244' }}>{importResult.galat.join(' · ')}</div>}
        </div>
      )}
    </section>

    <section className="table-panel" id="user-table">
      <div className="panel-heading"><div><h2>Daftar pengguna</h2><p>Aktif/nonaktifkan akses, ubah peran (Admin/Pengurus/Anggota), atau reset password.</p></div><span className="record-count">{filteredUsers.length} data</span></div>
      <div className="filters"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIK, atau email" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">Semua peran</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
      <div className="table-scroll"><table><thead><tr><th>Pengguna</th><th>NIK</th><th>Peran</th><th>Status</th><th>Dibuat</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {filteredUsers.map((user) => <tr key={user.id}>
          <td><div className="user-cell"><span className="avatar">{user.namaLengkap.charAt(0).toUpperCase()}</span><div><strong>{user.namaLengkap}</strong><small>{user.email ?? 'Email belum diisi'}</small></div></div></td>
          <td className="mono">{user.nomorIndukKaryawan}</td>
          <td>
            <select value={user.peran} disabled={busyId === user.id} onChange={(e) => void ubahPeran(user, e.target.value)} style={{ height: 30, padding: '0 6px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11, background: '#fff' }}>
              <option value="Admin">Admin</option><option value="Pengurus">Pengurus</option><option value="Anggota">Anggota</option>
            </select>
          </td>
          <td><span className={`status-pill ${user.aktif ? 'active' : 'inactive'}`}><i />{user.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
          <td>{tanggal(user.dibuatPada)}</td>
          <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
            <button className="toggle-button" disabled={busyId === user.id} onClick={() => void resetAkses(user)}><KeyRound size={12} /> Reset akses</button>
            <button className={`toggle-button ${user.aktif ? 'deactivate' : 'activate'}`} disabled={busyId === user.id} onClick={() => void toggleUser(user)}>{user.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
          </span></td>
        </tr>)}
      </tbody></table>{!loading && filteredUsers.length === 0 && <div className="empty-state">Tidak ada pengguna yang cocok dengan filter.</div>}</div>
    </section>
  </div>
}

const AUDIT_MODUL_LABEL: Record<string, string> = {
  Akun: 'Akun', Pendaftaran: 'Pendaftaran', Pinjaman: 'Pinjaman', Simpanan: 'Simpanan',
  Katalog: 'Katalog', ERAT: 'E-RAT', Akuntansi: 'Akuntansi', SHU: 'SHU', Konfigurasi: 'Konfigurasi',
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
  const [expanded, setExpanded] = useState<number | null>(null)
  const [tab, setTab] = useState<'aplikasi' | 'database'>('aplikasi')

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

  return <div className="content-wrap">
    <section className="welcome-row"><div><h2>Audit trail</h2><p>Jejak digital setiap perubahan data sensitif & keputusan persetujuan — akun, pinjaman, simpanan, katalog, E-RAT, akuntansi, SHU, dan konfigurasi.</p></div><div className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></div></section>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <button className={`toggle-button ${tab === 'aplikasi' ? 'activate' : ''}`} onClick={() => setTab('aplikasi')}>Aktivitas aplikasi</button>
      <button className={`toggle-button ${tab === 'database' ? 'activate' : ''}`} onClick={() => setTab('database')}>Log database (mentah)</button>
    </div>

    {tab === 'database' ? <DbAuditLogPanel token={token} onExpired={onExpired} /> : <>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    <section className="stat-grid"><StatCard label="Total tercatat" value={total} icon={<Fingerprint size={20} />} tone="teal" /><StatCard label="Modul terpantau" value={modulList.length} icon={<Database size={20} />} tone="blue" /></section>
    <p style={{ margin: '-8px 0 14px', fontSize: 12, color: 'var(--muted)' }}>Dicatat oleh aplikasi setiap ada perubahan lewat menu admin console ini. Hanya bisa dibaca, tidak bisa diubah lewat aplikasi.</p>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Riwayat aktivitas</h2><p>Diurutkan dari yang terbaru. Klik baris untuk lihat detail.</p></div><span className="record-count">{total} catatan</span></div>
      <div className="filters" style={{ flexWrap: 'wrap' }}>
        <label className="search-box"><Search size={17} /><input value={cari} onChange={(e) => setCari(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && terapkanFilter()} placeholder="Cari ringkasan atau nama pelaku" /></label>
        <select value={modulFilter} onChange={(e) => { setModulFilter(e.target.value); setHalaman(1) }}>
          <option value="">Semua modul</option>
          {modulList.map((m) => <option key={m} value={m}>{AUDIT_MODUL_LABEL[m] ?? m}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>Dari
          <input type="date" value={dari} onChange={(e) => { setDari(e.target.value); setHalaman(1) }} style={{ height: 34, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>Sampai
          <input type="date" value={sampai} onChange={(e) => { setSampai(e.target.value); setHalaman(1) }} style={{ height: 34, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6 }} />
        </label>
        <button className="toggle-button activate" onClick={terapkanFilter}>Terapkan</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Waktu</th><th>Pelaku</th><th>Modul</th><th>Aksi</th><th>Ringkasan</th></tr></thead><tbody>
        {data.map((item) => <Fragment key={item.id}>
          <tr style={{ cursor: item.detail ? 'pointer' : 'default' }} onClick={() => item.detail && setExpanded((current) => current === item.id ? null : item.id)}>
            <td style={{ whiteSpace: 'nowrap' }}>{waktu(item.waktuUtc)}</td>
            <td><div className="user-cell"><span className="avatar">{item.pelakuNama.charAt(0).toUpperCase()}</span><div><strong>{item.pelakuNama}</strong><small>{item.pelakuPeran}</small></div></div></td>
            <td><span className="role-pill pengurus">{AUDIT_MODUL_LABEL[item.modul] ?? item.modul}</span></td>
            <td className="mono">{item.aksi}</td>
            <td>{item.ringkasan}</td>
          </tr>
          {expanded === item.id && item.detail && <tr>
            <td colSpan={5} style={{ background: '#f6faf8', padding: '10px 16px', fontSize: 11 }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{JSON.stringify(JSON.parse(item.detail), null, 2)}</pre>
              {item.alamatIp && <div style={{ marginTop: 6, color: 'var(--muted)' }}>Alamat IP: {item.alamatIp}</div>}
            </td>
          </tr>}
        </Fragment>)}
      </tbody></table>{!loading && data.length === 0 && <div className="empty-state">Belum ada aktivitas tercatat untuk filter ini.</div>}</div>
      {totalHalaman > 1 && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '14px 0' }}>
        <button className="toggle-button" disabled={halaman <= 1} onClick={() => setHalaman((h) => h - 1)}>Sebelumnya</button>
        <small style={{ color: 'var(--muted)' }}>Halaman {halaman} / {totalHalaman}</small>
        <button className="toggle-button" disabled={halaman >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>Berikutnya</button>
      </div>}
    </section>
    </>}
  </div>
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
  const [expanded, setExpanded] = useState<number | null>(null)
  const [verifikasi, setVerifikasi] = useState<VerifikasiChainResult | null>(null)
  const [verifikasiBusy, setVerifikasiBusy] = useState(false)

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
  const opWarna = (op: string) => op === 'INSERT' ? '#2d8155' : op === 'DELETE' ? '#b3403a' : '#ad6a16'

  return <>
    {error && <div className="alert error"><X size={17} />{error}</div>}
    <div className="alert" style={{ background: '#eef6f3', color: '#2f4842', alignItems: 'start' }}>
      <ShieldCheck size={17} />
      <div>Tercatat langsung oleh trigger SQL Server pada tabel finansial (Simpanan, Pinjaman, Akuntansi, SHU, Konfigurasi, Pengguna) — mencakup perubahan lewat aplikasi <strong>maupun lewat koneksi database langsung</strong> (dBeaver/SSMS/dll). Setiap baris dirantai dengan hash; edit/hapus retroaktif pada log ini sendiri bisa terdeteksi lewat tombol "Verifikasi integritas".</div>
    </div>

    {verifikasi && <div className={`alert ${verifikasi.utuh ? 'success' : 'error'}`} style={{ alignItems: 'start' }}>
      {verifikasi.utuh ? <BadgeCheck size={17} /> : <X size={17} />}
      <div>
        {verifikasi.message}
        {!verifikasi.utuh && <div className="table-scroll" style={{ marginTop: 10 }}><table><thead><tr><th>Id log</th><th>Tabel</th><th>Operasi</th><th>Kunci</th><th>Waktu</th><th>DB login</th><th>Masalah</th></tr></thead><tbody>
          {verifikasi.baris.map((b) => <tr key={b.id}>
            <td className="mono">{b.id}</td><td>{b.tabel}</td><td>{b.operasi}</td><td className="mono">{b.kunciPrimer}</td>
            <td>{waktu(b.waktuUtc)}</td><td>{b.dbLogin}</td>
            <td>{[b.hashTidakCocok && 'isi baris berubah', b.rantaiTerputus && 'rantai terputus'].filter(Boolean).join(', ')}</td>
          </tr>)}
        </tbody></table></div>}
      </div>
    </div>}

    <section className="stat-grid">
      <StatCard label="Total baris tercatat" value={total} icon={<Fingerprint size={20} />} tone="teal" />
      <StatCard label="Tabel terpantau" value={tabelList.length} icon={<Database size={20} />} tone="blue" />
    </section>

    <section className="table-panel">
      <div className="panel-heading"><div><h2>Log database mentah</h2><p>Setiap INSERT/UPDATE/DELETE pada tabel finansial, siapa pun pelakunya.</p></div>
        <button className="toggle-button activate" disabled={verifikasiBusy} onClick={() => void verifikasiIntegritas()}>{verifikasiBusy ? 'Memverifikasi...' : 'Verifikasi integritas'}</button>
      </div>
      <div className="filters" style={{ flexWrap: 'wrap' }}>
        <label className="search-box"><Search size={17} /><input value={cari} onChange={(e) => setCari(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && terapkanFilter()} placeholder="Cari kunci baris atau DB login" /></label>
        <select value={tabelFilter} onChange={(e) => { setTabelFilter(e.target.value); setHalaman(1) }}>
          <option value="">Semua tabel</option>
          {tabelList.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="toggle-button activate" onClick={terapkanFilter}>Terapkan</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Waktu</th><th>Tabel</th><th>Operasi</th><th>Kunci</th><th>DB login</th><th>Aplikasi</th></tr></thead><tbody>
        {data.map((item) => <Fragment key={item.id}>
          <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded((current) => current === item.id ? null : item.id)}>
            <td style={{ whiteSpace: 'nowrap' }}>{waktu(item.waktuUtc)}</td>
            <td className="mono">{item.tabel}</td>
            <td style={{ color: opWarna(item.operasi), fontWeight: 700 }}>{item.operasi}</td>
            <td className="mono">{item.kunciPrimer}</td>
            <td>{item.dbLogin}</td>
            <td><small style={{ color: 'var(--muted)' }}>{item.appName ?? '—'}</small></td>
          </tr>
          {expanded === item.id && <tr>
            <td colSpan={6} style={{ background: '#f6faf8', padding: '10px 16px', fontSize: 11 }}>
              {item.dataSebelum && <div style={{ marginBottom: 8 }}><strong>Sebelum:</strong><pre style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{JSON.stringify(JSON.parse(item.dataSebelum), null, 2)}</pre></div>}
              {item.dataSesudah && <div><strong>Sesudah:</strong><pre style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{JSON.stringify(JSON.parse(item.dataSesudah), null, 2)}</pre></div>}
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>Host: {item.hostName ?? '—'} · Hash: <span className="mono">{item.hash.slice(0, 16)}…</span></div>
            </td>
          </tr>}
        </Fragment>)}
      </tbody></table>{!loading && data.length === 0 && <div className="empty-state">Belum ada perubahan tercatat untuk filter ini.</div>}</div>
      {totalHalaman > 1 && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '14px 0' }}>
        <button className="toggle-button" disabled={halaman <= 1} onClick={() => setHalaman((h) => h - 1)}>Sebelumnya</button>
        <small style={{ color: 'var(--muted)' }}>Halaman {halaman} / {totalHalaman}</small>
        <button className="toggle-button" disabled={halaman >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>Berikutnya</button>
      </div>}
    </section>
  </>
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
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td>{rupiah(item.nominal)}<br /><small style={{ color: 'var(--muted)' }}>{item.tenorBulan} bln</small></td>
          <td>{rupiah(item.estimasiCicilanBulanan)}<br /><small style={{ color: 'var(--muted)' }}>jasa {(item.bungaTahunan * 100).toFixed(2)}%/th</small></td>
          <td>{rupiah(item.estimasiTotalJasa)}</td>
          <td style={{ whiteSpace: 'normal', maxWidth: 180 }}>{item.tujuan}</td>
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Pinjaman</th><th>Jenis</th><th>Jumlah diajukan</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {payments.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td className="mono">{item.nomorPinjaman}</td>
          <td>{item.jenis === 'Pelunasan' ? <span className="role-pill admin"><Zap size={11} /> Pelunasan</span> : <span className="role-pill">Angsuran {item.angsuranKe ? `ke-${item.angsuranKe}` : ''}</span>}</td>
          <td>{rupiah(item.jumlahDiajukan)}{item.jenis === 'Pelunasan' && <><br /><small style={{ color: 'var(--muted)' }}>jasa {rupiah(item.jasaDibebaskan ?? 0)} dibebaskan</small></>}</td>
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Nomor</th><th>Pokok</th><th>Cicilan/bln</th><th>Progres</th><th>Sisa pokok</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
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
              <table className="table-compact" style={{ minWidth: 0 }}><thead><tr><th>#</th><th>Jatuh tempo</th><th>Pokok</th><th>Jasa</th><th>Total</th><th>Status</th><th>Dibayar</th></tr></thead><tbody>
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 18px', padding: '18px 25px 24px' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150 }}>Simpanan Pokok
          <input type="number" disabled={!isAdmin} value={pokokInput} onChange={(e) => setPokokInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150 }}>Simpanan Wajib / bulan
          <input type="number" disabled={!isAdmin} value={wajibInput} onChange={(e) => setWajibInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150 }}>Bunga Sukarela (%/th)
          <input type="number" step="0.1" disabled={!isAdmin} value={bungaSukarelaInput} onChange={(e) => setBungaSukarelaInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150 }}>Bunga Deposito (%/th)
          <input type="number" step="0.1" disabled={!isAdmin} value={bungaDepositoInput} onChange={(e) => setBungaDepositoInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150, lineHeight: 1.4 }}>Tarif PPh (%) — Bunga Sukarela & Deposito
          <input type="number" step="0.1" disabled={!isAdmin} value={pphInput} onChange={(e) => setPphInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#526763', width: 150, lineHeight: 1.4 }}>Tarif PPh SHU (%) — dari penerimaan anggota
          <input type="number" step="0.1" disabled={!isAdmin} value={pphShuInput} onChange={(e) => setPphShuInput(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </label>
        {isAdmin && <button className="submit-button" style={{ alignSelf: 'end', height: 40, padding: '0 18px' }} disabled={busyId === 'konfig'} onClick={saveKonfigurasi}>Simpan</button>}
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
        <div><h2>Simpanan Sukarela</h2><p>Setoran menambah saldo; penarikan mengurangi saldo. Bunga {konfigurasi ? (konfigurasi.bungaSukarelaTahunan * 100).toFixed(2) : '2.50'}%/th metode saldo harian, dipotong PPh {konfigurasi ? (konfigurasi.tarifPph * 100).toFixed(0) : '20'}%, dibukukan tanggal terakhir tiap bulan.</p></div>
        <button className="toggle-button activate" disabled={busyId === 'bunga'} onClick={() => void call('bunga', '/api/admin/simpanan/sukarela/bunga', 'POST', {}, 'Hitung & kreditkan bunga sukarela bulan lalu ke semua rekening?')}>Hitung bunga bulan lalu</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Jenis</th><th>Nominal</th><th>Saldo saat ini</th><th>Diajukan</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {sukarela.map((item) => <tr key={item.id}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
          <td><span className={`role-pill ${item.jenis === 'Tarik' ? 'admin' : ''}`}>{item.jenis}</span></td>
          <td>{rupiah(item.nominal)}</td>
          <td>
            {rupiah(item.saldoSukarela)}
            {item.bungaTerakhir && <div style={{ marginTop: 2, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
              <div>Bunga {item.bungaTerakhir.periode}: <span style={{ color: '#2d8155', fontWeight: 600 }}>+{rupiah(item.bungaTerakhir.bruto)}</span></div>
              <div>PPh: <span style={{ color: '#ad6a16', fontWeight: 600 }}>−{rupiah(item.bungaTerakhir.pajak)}</span> · neto +{rupiah(item.bungaTerakhir.neto)}</div>
            </div>}
          </td>
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Paket</th><th>Nominal</th><th>Est. bunga</th><th>Jatuh tempo</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {berjangka.map((item) => <tr key={item.id} style={item.pencairanDiajukan ? { background: '#fff7ed' } : undefined}>
          <td><div className="user-cell"><span className="avatar">{item.namaAnggota.charAt(0).toUpperCase()}</span><div><strong>{item.namaAnggota}</strong><small className="mono">{item.nomorIndukKaryawan}</small></div></div></td>
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
            <span className={`status-pill ${item.status === 'Aktif' || item.status === 'Dicairkan' ? 'active' : item.status === 'Ditolak' ? 'inactive' : ''}`}><i />{item.status}</span>
            {item.pencairanDiajukan && <><br /><small style={{ color: '#bd6d1d', fontWeight: 700 }}>Minta cair dipercepat</small>{item.alasanPencairan && <><br /><small style={{ color: 'var(--muted)' }}>{item.alasanPencairan}</small></>}</>}
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Produk</th><th>Jenis</th><th>Harga</th><th>Stok</th><th>Sumber</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
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
      <div className="table-scroll table-compact"><table><thead><tr><th>Anggota</th><th>Produk</th><th>Jenis</th><th>Total</th><th>Metode</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {pembelian.map((p) => <tr key={p.id}>
          <td><div className="user-cell"><span className="avatar">{p.namaPembeli.charAt(0).toUpperCase()}</span><div><strong>{p.namaPembeli}</strong><small className="mono">{p.nomorIndukKaryawan}</small></div></div></td>
          <td>{p.produkNama}<br /><small className="mono" style={{ color: 'var(--muted)' }}>{p.nomorTransaksi}</small></td>
          <td>{p.jenis}<br /><small style={{ color: 'var(--muted)' }}>{p.jumlah}x</small></td>
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
        <div><h2>Rekap tagihan kredit</h2><p>Rekap hutang kredit produk per anggota, dipotong lewat gaji. Setelah pengurus mengonfirmasi potongan sudah dieksekusi, tandai lunas di sini. Total outstanding ditampilkan: <strong>{rupiah(totalOutstanding)}</strong>.</p></div>
        <select value={rekapAnggota} onChange={(e) => setRekapAnggota(e.target.value)} style={{ height: 36, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }}>
          <option value="semua">Semua anggota</option>
          {rekap.map((g) => <option key={g.penggunaId} value={String(g.penggunaId)}>{g.nama}</option>)}
        </select>
      </div>
      {rekapAnggota === 'semua' && rekap.some((g) => g.totalBelum > 0) && (
        <div style={{ padding: '12px 25px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 8 }}>
          <button className="toggle-button activate" disabled={busyId === 'rekap-lunas'} onClick={() => void call('rekap-lunas', '/api/admin/produk/tagihan-kredit/lunas', 'POST', {}, 'Tandai SEMUA tagihan kredit yang belum lunas menjadi LUNAS?')}>Tandai semua lunas</button>
        </div>
      )}
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>Belum lunas</th><th>Sudah lunas</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {rekapTampil.flatMap((g) => [
          <tr key={g.penggunaId}>
            <td><div className="user-cell"><span className="avatar">{g.nama.charAt(0).toUpperCase()}</span><div><strong>{g.nama}</strong><small className="mono">{g.nik}</small></div></div></td>
            <td style={{ color: g.totalBelum > 0 ? '#bd6d1d' : 'var(--muted)', fontWeight: g.totalBelum > 0 ? 700 : 400 }}>{rupiah(g.totalBelum)}</td>
            <td style={{ color: 'var(--muted)' }}>{rupiah(g.totalLunas)}</td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button" onClick={() => setRekapExpanded(rekapExpanded === g.penggunaId ? null : g.penggunaId)}>{rekapExpanded === g.penggunaId ? 'Tutup' : 'Rincian'}</button>
              {g.totalBelum > 0 && <button className="toggle-button activate" disabled={busyId === `rk-${g.penggunaId}`} onClick={() => void call(`rk-${g.penggunaId}`, '/api/admin/produk/tagihan-kredit/lunas', 'POST', { penggunaId: g.penggunaId }, `Tandai tagihan kredit ${g.nama} (${rupiah(g.totalBelum)}) LUNAS?`)}>Tandai lunas</button>}
            </span></td>
          </tr>,
          rekapExpanded === g.penggunaId && <tr key={`${g.penggunaId}-d`}><td colSpan={4} style={{ background: '#f7faf9' }}>
            <table style={{ minWidth: 520 }}><thead><tr><th>Transaksi</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
              {g.rincian.map((t) => <tr key={t.id}>
                <td className="mono">{t.nomorTransaksi}</td><td>{t.produkNama}</td><td>{rupiah(t.total)}</td>
                <td style={{ color: t.status === 'Lunas' ? '#2d8155' : '#bd6d1d' }}>{t.status}</td>
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

    <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      <button className={`toggle-button ${tab === 'voting' ? 'activate' : ''}`} onClick={() => setTab('voting')}>Voting Agenda</button>
      <button className={`toggle-button ${tab === 'dokumen' ? 'activate' : ''}`} onClick={() => setTab('dokumen')}>Dokumen RAT</button>
      <button className={`toggle-button ${tab === 'laporan' ? 'activate' : ''}`} onClick={() => setTab('laporan')}>Laporan RAT (Otomatis)</button>
    </div>

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
    </>}

    {tab === 'dokumen' && <section className="table-panel">
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
    <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#526763' }}>Tahun buku
        <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} style={{ width: 100, height: 38, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8 }} />
      </label>
      <button className={`toggle-button ${mode === 'lihat' ? 'activate' : ''}`} onClick={() => setMode('lihat')}>Lihat laporan</button>
      <button className={`toggle-button ${mode === 'edit' ? 'activate' : ''}`} onClick={() => setMode('edit')}>Edit konten & RAB</button>
      {mode === 'lihat' && <button className="submit-button" style={{ width: 'auto', height: 38, padding: '0 18px' }} onClick={() => window.print()}><Download size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Cetak / Simpan PDF</button>}
      {mode === 'lihat' && data && (data.konten.dipublikasikan
        ? <button className="toggle-button deactivate" disabled={busyId === 'publikasi'} onClick={() => void publikasikan(false)}><X size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Batalkan penayangan</button>
        : <button className="submit-button" style={{ width: 'auto', height: 38, padding: '0 18px', background: data.itemBelumLengkap.length > 0 ? '#a9bab5' : undefined }}
            disabled={busyId === 'publikasi' || data.itemBelumLengkap.length > 0} title={data.itemBelumLengkap.length > 0 ? 'Lengkapi item yang kurang terlebih dahulu' : undefined}
            onClick={() => void publikasikan(true)}><Send size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Tayangkan ke Anggota</button>)}
      <span className="sync-label"><Activity size={16} /> {loading ? 'Memuat data...' : 'Data tersinkron'} <button className="icon-button" onClick={() => void load()} title="Muat ulang"><RefreshCw size={16} /></button></span>
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
          <label style={labelStyle}>Visi<textarea value={visi} onChange={(e) => setVisi(e.target.value)} rows={2} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <label style={labelStyle}>Misi (satu poin per baris)<textarea value={misi} onChange={(e) => setMisi(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ ...labelStyle, flex: 1, minWidth: 220 }}>Alamat kantor<input value={alamat} onChange={(e) => setAlamat(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>Tanggal didirikan<input type="date" value={tglDidirikan} onChange={(e) => setTglDidirikan(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>No. Akta Pendirian<input value={noAkta} onChange={(e) => setNoAkta(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>Tanggal Akta<input type="date" value={tglAkta} onChange={(e) => setTglAkta(e.target.value)} style={inputStyle} /></label>
          </div>
          <button className="submit-button" style={{ width: 'auto', height: 40, padding: '0 20px', justifySelf: 'start' }} disabled={busyId === 'profil'} onClick={simpanProfil}>Simpan profil</button>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-heading"><div><h2>Konten & RAB tahun {tahun}</h2><p>Narasi kegiatan, rencana tahun depan, dan target RAB untuk kolom "Rencana" pembanding realisasi — khusus tahun buku ini.</p></div></div>
        <div style={{ display: 'grid', gap: 12, padding: '16px 25px 22px' }}>
          <label style={labelStyle}>Kegiatan Bisnis tahun {tahun} (satu poin per baris)<textarea value={kegiatanBisnis} onChange={(e) => setKegiatanBisnis(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <label style={labelStyle}>Kegiatan Sosial tahun {tahun} (satu poin per baris)<textarea value={kegiatanSosial} onChange={(e) => setKegiatanSosial(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <label style={labelStyle}>Rencana Kegiatan Bisnis tahun {tahun + 1}<textarea value={rencanaBisnis} onChange={(e) => setRencanaBisnis(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <label style={labelStyle}>Rencana Kegiatan Sosial tahun {tahun + 1}<textarea value={rencanaSosial} onChange={(e) => setRencanaSosial(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={labelStyle}>RAB Pendapatan Pinjaman<input type="number" value={rabPendapatanPinjaman} onChange={(e) => setRabPendapatanPinjaman(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>RAB Pendapatan Lain<input type="number" value={rabPendapatanLain} onChange={(e) => setRabPendapatanLain(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>RAB Beban Operasional<input type="number" value={rabBebanOperasional} onChange={(e) => setRabBebanOperasional(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>RAB Beban Umum<input type="number" value={rabBebanUmum} onChange={(e) => setRabBebanUmum(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>RAB Cadangan Piutang<input type="number" value={rabCadanganPiutang} onChange={(e) => setRabCadanganPiutang(e.target.value)} style={inputStyle} /></label>
            <label style={labelStyle}>Realisasi Pajak SHU (badan)<input type="number" value={realisasiPajakShu} onChange={(e) => setRealisasiPajakShu(e.target.value)} style={inputStyle} /></label>
          </div>
          <label style={labelStyle}>Catatan tambahan<textarea value={catatanTambahan} onChange={(e) => setCatatanTambahan(e.target.value)} rows={2} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit' }} /></label>
          <button className="submit-button" style={{ width: 'auto', height: 40, padding: '0 20px', justifySelf: 'start' }} disabled={busyId === 'konten'} onClick={simpanKonten}>Simpan konten & RAB tahun {tahun}</button>
        </div>
      </section>
    </div>}

    {mode === 'lihat' && data && <div className="rat-print-area" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 13, boxShadow: 'var(--shadow)', padding: '36px 42px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>LAPORAN RAPAT ANGGOTA TAHUNAN</h1>
        <h2 style={{ margin: '4px 0 10px', fontSize: 17, color: 'var(--teal-dark)' }}>KOPERASI KONSUMEN KARYAWAN CIPTA SEJAHTERA (KKCS)</h2>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{data.profil.alamatKantor}</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700 }}>Tahun Buku {data.tahun}</p>
      </div>

      <RatSection judul="Visi & Misi">
        <p style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Visi:</strong> {data.profil.visi}</p>
        <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}><strong>Misi:</strong>{'\n'}{data.profil.misi}</p>
      </RatSection>

      <RatSection judul="Keanggotaan">
        <div className="stat-grid" style={{ marginBottom: 0 }}>
          <StatCard label="Anggota aktif saat ini" value={data.totalAnggotaAktifSaatIni} icon={<Users size={20} />} tone="teal" />
          <StatCard label={`Anggota baru disetujui ${data.tahun}`} value={data.anggotaBaruTahunIni} icon={<UserPlus size={20} />} tone="green" />
          <StatCard label="Anggota nonaktif saat ini" value={data.totalAnggotaNonaktifSaatIni} icon={<Users size={20} />} tone="amber" />
        </div>
      </RatSection>

      <RatSection judul="Laporan Kegiatan Usaha">
        {data.konten.kegiatanBisnis && <RatContentBlock label="Kegiatan Bisnis" text={data.konten.kegiatanBisnis} tone="teal" />}
        {data.konten.kegiatanSosial && <RatContentBlock label="Kegiatan Sosial" text={data.konten.kegiatanSosial} tone="amber" />}
        {!data.konten.kegiatanBisnis && !data.konten.kegiatanSosial && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Belum diisi — lengkapi lewat mode "Edit konten & RAB".</p>}
      </RatSection>

      <RatSection judul="Laporan Perhitungan Sisa Hasil Usaha (SHU)">
        <div className="table-scroll"><table><thead><tr><th>Uraian</th><th className="align-right">Realisasi</th><th className="align-right">Rencana</th><th className="align-right">%</th></tr></thead><tbody>
          <tr><td>Pendapatan Jasa Pinjaman</td><td className="align-right">{rupiah(jasaPinjaman)}</td><td className="align-right">{data.konten.rabPendapatanPinjaman != null ? rupiah(data.konten.rabPendapatanPinjaman) : '—'}</td><td className="align-right">{capaian(jasaPinjaman, data.konten.rabPendapatanPinjaman)}</td></tr>
          <tr><td>Pendapatan Lain-lain</td><td className="align-right">{rupiah(pendapatanLain)}</td><td className="align-right">{data.konten.rabPendapatanLain != null ? rupiah(data.konten.rabPendapatanLain) : '—'}</td><td className="align-right">{capaian(pendapatanLain, data.konten.rabPendapatanLain)}</td></tr>
          <tr style={{ fontWeight: 700 }}><td>Total Pendapatan</td><td className="align-right">{rupiah(data.labaRugi.totalPendapatan)}</td><td className="align-right">{data.rabTotalPendapatan != null ? rupiah(data.rabTotalPendapatan) : '—'}</td><td className="align-right">{capaian(data.labaRugi.totalPendapatan, data.rabTotalPendapatan)}</td></tr>
          {data.labaRugi.beban.map((b) => <tr key={b.kode}>
            <td><span className="mono" style={{ marginRight: 6 }}>{b.kode}</span>{b.nama}</td>
            <td className="align-right">{rupiah(b.saldo)}</td><td className="align-right">—</td><td className="align-right">—</td>
          </tr>)}
          {data.labaRugi.beban.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>Belum ada beban tercatat tahun ini.</td></tr>}
          <tr style={{ fontWeight: 700 }}><td>Total Beban</td><td className="align-right">{rupiah(data.labaRugi.totalBeban)}</td><td className="align-right">{data.rabTotalBeban != null ? rupiah(data.rabTotalBeban) : '—'}</td><td className="align-right">{capaian(data.labaRugi.totalBeban, data.rabTotalBeban)}</td></tr>
          <tr style={{ fontWeight: 700, background: '#f7faf9' }}><td>SHU Sebelum Pajak</td><td className="align-right">{rupiah(data.shuSebelumPajak)}</td><td className="align-right" colSpan={2}>{data.rabTotalPendapatan != null && data.rabTotalBeban != null ? rupiah(data.rabTotalPendapatan - data.rabTotalBeban) : '—'}</td></tr>
          <tr><td>Pajak</td><td className="align-right">{data.pajakShu != null ? `−${rupiah(data.pajakShu)}` : 'Belum diisi'}</td><td colSpan={2}></td></tr>
          <tr style={{ fontWeight: 800, background: '#e5f4ef' }}><td>SHU Setelah Pajak</td><td className="align-right">{rupiah(data.shuSetelahPajak ?? data.shuSebelumPajak)}</td><td colSpan={2}></td></tr>
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
          return <div style={{ marginTop: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: 'var(--teal-dark)' }}>Kebijakan Pembagian SHU {data.tahun}</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--muted)' }}>Difinalisasi {tanggal(shu.difinalisasiPada)} · dibagikan ke {shu.jumlahAnggota} anggota aktif sesuai Keputusan RAT.</p>

          <div style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 10, background: '#f7faf9', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--teal-dark)', marginBottom: 10 }}>Lapis 1 — Pembagian Total SHU ({rupiah(shu.totalShu)})</div>
            <AllocationBar segments={[
              { value: persenAnggota, color: '#2d8155', label: 'Anggota' },
              { value: shu.persenPengurus ?? 0, color: '#ad6a16', label: 'Pengurus' },
              { value: shu.persenCadangan ?? 0, color: '#436a97', label: 'Cadangan' },
            ]} />
            <div className="stat-grid">
              <StatCard label={`Anggota (${(persenAnggota * 100).toFixed(0)}%, dipecah di Lapis 2)`} value={anggotaPool} icon={<Users size={18} />} tone="green" money />
              <StatCard label={`Pengurus (${((shu.persenPengurus ?? 0) * 100).toFixed(0)}%)`} value={shu.jasaPengurusPool ?? 0} icon={<Wallet size={18} />} tone="amber" money />
              <StatCard label={`Cadangan (${((shu.persenCadangan ?? 0) * 100).toFixed(0)}%, ditahan permanen)`} value={shu.cadanganAmount ?? 0} icon={<Scale size={18} />} tone="blue" money />
            </div>
          </div>

          <div style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 10, background: '#fbf9f3' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: '#8a5a12', marginBottom: 10 }}>Lapis 2 — Pembagian Pool Anggota ({rupiah(anggotaPool)})</div>
            <AllocationBar segments={[
              { value: persenModal, color: '#087f78', label: 'Jasa Modal' },
              { value: persenUsaha, color: '#0b9488', label: 'Jasa Usaha' },
            ]} />
            <div className="stat-grid">
              <StatCard label={`Jasa Modal Anggota — JMA (${(persenModal * 100).toFixed(0)}%)`} value={anggotaPool * persenModal} icon={<PiggyBank size={18} />} tone="teal" money />
              <StatCard label={`Jasa Usaha Anggota — JUA (${(persenUsaha * 100).toFixed(0)}%)`} value={anggotaPool * persenUsaha} icon={<TrendingUp size={18} />} tone="green" money />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '10px 0 0' }}>Total neto diterima anggota (JMA+JUA setelah PPh {rupiah(shu.totalPajak)}): <strong style={{ color: 'var(--ink)' }}>{rupiah(shu.totalShuNeto)}</strong></p>
          </div>
        </div>
        })()}
        {!data.shu && <div style={{ marginTop: 16, fontSize: 12.5, color: '#ad6a16' }}>SHU tahun buku {data.tahun} belum difinalisasi di menu Akuntansi → tab SHU.</div>}
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
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <div style={{ flex: '1 1 320px', minWidth: 280, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#526763' }}>Total Aset</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{rupiah(data.neracaAkhirTahun.totalAset)}</span>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 280, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#526763' }}>Total Liabilitas + Ekuitas</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{rupiah(data.neracaAkhirTahun.totalLiabilitas + data.neracaAkhirTahun.totalEkuitas)}</span>
          </div>
        </div>
        <div className={`alert ${Math.abs(data.neracaAkhirTahun.selisih) < 1 ? 'success' : 'error'}`} style={{ marginTop: 4 }}>
          {Math.abs(data.neracaAkhirTahun.selisih) < 1 ? <BadgeCheck size={16} /> : <X size={16} />} Selisih: {rupiah(data.neracaAkhirTahun.selisih)}
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
        {data.konten.rencanaBisnisTahunDepan && <RatContentBlock label="Rencana Kegiatan Bisnis" text={data.konten.rencanaBisnisTahunDepan} tone="teal" />}
        {data.konten.rencanaSosialTahunDepan && <RatContentBlock label="Rencana Kegiatan Sosial" text={data.konten.rencanaSosialTahunDepan} tone="amber" />}
      </RatSection>}

      {data.konten.catatanTambahan && <RatSection judul="Catatan Tambahan">
        <p style={{ fontSize: 13, whiteSpace: 'pre-line', lineHeight: 1.6, margin: 0 }}>{data.konten.catatanTambahan}</p>
      </RatSection>}

      <RatSection judul="Lampiran — Buku Besar per Akun (Saldo Awal, Mutasi, Saldo Akhir)">
        <div className="table-scroll"><table><thead><tr><th>Akun</th><th className="align-right">Saldo Awal</th><th className="align-right">Debit</th><th className="align-right">Kredit</th><th className="align-right">Saldo Akhir</th></tr></thead><tbody>
          {data.bukuBesar.map((b) => <tr key={b.kode}>
            <td><span className="mono" style={{ marginRight: 6 }}>{b.kode}</span>{b.nama} <span style={{ color: 'var(--muted)' }}>({b.tipe})</span></td>
            <td className="align-right">{rupiah(b.saldoAwal)}</td>
            <td className="align-right">{rupiah(b.debit)}</td>
            <td className="align-right">{rupiah(b.kredit)}</td>
            <td className="align-right" style={{ fontWeight: 700 }}>{rupiah(b.saldoAkhir)}</td>
          </tr>)}
        </tbody></table>{data.bukuBesar.length === 0 && <div className="empty-state">Belum ada mutasi jurnal untuk tahun ini.</div>}</div>
      </RatSection>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 30 }}>
        Laporan ini disusun otomatis dari data sistem KKCS pada {waktu(new Date().toISOString())}.
      </p>
    </div>}
  </div>
}

function RatSection({ judul, children }: { judul: string; children: ReactNode }) {
  return <div style={{ marginBottom: 26 }}>
    <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--teal-dark)', borderBottom: '2px solid var(--mint)', paddingBottom: 8, marginBottom: 14 }}>{judul}</h3>
    {children}
  </div>
}

function RatContentBlock({ label, text, tone }: { label: string; text: string; tone: 'teal' | 'amber' }) {
  const bg = tone === 'teal' ? '#eef8f5' : '#fdf3e4'
  const border = tone === 'teal' ? '#bfe3d6' : '#f0d9ab'
  const labelColor = tone === 'teal' ? 'var(--teal-dark)' : '#8a5a12'
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: labelColor, marginBottom: 7 }}>{label}</div>
    <p style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{text}</p>
  </div>
}

// Bar proporsi yang menormalisasi lebar tiap segmen terhadap jumlah segmen yang tampil (bukan flex-grow
// mentah) — selalu memenuhi lebar penuh 100% walau totalnya bukan 100% persis (mis. data lama sebelum
// model 2-lapis berlaku, atau pembulatan), jadi tidak pernah "tidak sampai kanan".
function AllocationBar({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0)
  return <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 12, marginBottom: 12, background: '#e7ece9' }}>
    {total > 0 && segments.filter((seg) => seg.value > 0).map((seg) => (
      <div key={seg.label} style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }} title={`${seg.label} ${(seg.value * 100).toFixed(0)}%`} />
    ))}
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 25px 16px' }}>
        <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalWajib > 0)} onClick={() => void setujuiWajib()}>Setujui semua Simpanan Wajib periode ini</button>
        <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalKredit > 0)} onClick={() => void setujuiKredit()}>Setujui semua Tagihan Kredit</button>
        <button className="toggle-button activate" disabled={busyId !== '' || !(rekap && rekap.totalCicilanPinjaman > 0)} onClick={() => void setujuiCicilan()}>Setujui semua Angsuran Cicilan</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Simpanan Wajib</th><th>Tagihan Kredit</th><th>Cicilan Pinjaman</th><th>Total Potongan</th></tr></thead><tbody>
        {rekap?.baris.map((b) => <tr key={b.penggunaId} onClick={() => setDetailId(b.penggunaId)} style={{ cursor: 'pointer' }}>
          <td><div className="user-cell"><span className="avatar">{b.nama.charAt(0).toUpperCase()}</span><strong>{b.nama}</strong></div></td>
          <td className="mono">{b.nik || '—'}</td>
          <td>{b.simpananWajib > 0 ? rupiah(b.simpananWajib) : '—'}</td>
          <td>{b.tagihanKredit > 0 ? rupiah(b.tagihanKredit) : '—'}</td>
          <td>{b.cicilanPinjaman > 0 ? rupiah(b.cicilanPinjaman) : '—'}</td>
          <td style={{ fontWeight: 700 }}>{rupiah(b.totalPotongan)}</td>
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

  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 35, 30, 0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
    <div style={{ background: '#fff', borderRadius: 14, width: 'min(640px, 100%)', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span className="avatar" style={{ width: 44, height: 44, fontSize: 17 }}>{(baris?.nama ?? '?').charAt(0).toUpperCase()}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 17 }}>{baris?.nama ?? 'Anggota'}</h2>
            <small style={{ color: 'var(--muted)' }}>NIK {baris?.nik || '—'} · Total potongan {rupiah(baris?.totalPotongan ?? 0)}</small>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} title="Tutup"><X size={20} /></button>
      </div>

      <div style={{ padding: '18px 24px' }}>
        {error && <div className="alert error" style={{ marginBottom: 14 }}><X size={17} />{error}</div>}
        {notice && <div className="alert success" style={{ marginBottom: 14 }}><BadgeCheck size={17} />{notice}</div>}
        {!baris && <div className="empty-state">Semua potongan anggota ini sudah diproses.</div>}

        {baris && <>
          {wajibItems.length > 0 && <div style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Simpanan Wajib</h3>
            {wajibItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
          </div>}

          {kreditItems.length > 0 && <div style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Tagihan Kredit</h3>
            {kreditItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
          </div>}

          {cicilanItems.length > 0 && <div style={{ marginBottom: 6 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: '#526763' }}>Cicilan Pinjaman</h3>
            {cicilanItems.map((item) => <PayrollItemRow key={item.id} item={item} busy={busyId !== ''} onSetuju={() => void setuju(item)} onTolak={() => void tolak(item)} />)}
          </div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <button className="submit-button" style={{ width: 'auto', height: 38, padding: '0 18px' }} disabled={busyId !== '' || semuaItems.length === 0} onClick={() => void setujuiSemua()}>Setujui semua</button>
            <button className="toggle-button deactivate" disabled={busyId !== '' || semuaItems.length === 0} onClick={() => void tolakSemua()}>Tolak semua</button>
          </div>
        </>}
      </div>
    </div>
  </div>
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
  return <div style={{ flex: 1, minWidth: 260, maxWidth: '100%' }}>
    <h3 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 8px' }}>{title}</h3>
    <div>
      {items.map((a) => <div key={a.kode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '5px 0', borderTop: '1px solid var(--line)', fontSize: 12 }}>
        <span style={{ display: 'flex', gap: 8, minWidth: 0 }}>
          <span className="mono" style={{ color: 'var(--muted)', fontSize: 11, flexShrink: 0 }}>{a.kode}</span>
          <span style={{ wordBreak: 'break-word' }}>{a.nama}</span>
        </span>
        <span style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>{rupiah(a.saldo)}</span>
      </div>)}
      {items.length === 0 && <div style={{ padding: '6px 0', color: 'var(--muted)', fontSize: 12 }}>Belum ada saldo.</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', fontWeight: 800, padding: '6px 0', fontSize: 12 }}>
        <span>Total</span><span>{rupiah(total)}</span>
      </div>
    </div>
  </div>
}

function AkuntansiView({ token, onExpired, tab, setTab }: { token: string; onExpired: () => void; tab: AkuntansiTab; setTab: (t: AkuntansiTab) => void }) {
  const [akun, setAkun] = useState<Akun[]>([])
  const [jurnal, setJurnal] = useState<Jurnal[]>([])
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

    <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      {TABS.map((t) => <button key={t.key} className={`toggle-button ${tab === t.key ? 'activate' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setTab(t.key)}>{t.icon}{t.label}</button>)}
    </div>

    {tab === 'jurnal' && <>
      <section className="table-panel" style={{ marginBottom: 22 }}>
        <div className="panel-heading"><div><h2>Tambah jurnal manual</h2><p>Untuk transaksi di luar sistem (gaji, sewa, listrik, modal awal, dll). Total debit harus sama dengan total kredit.</p></div></div>
        <div style={{ padding: '16px 25px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <label style={labelStyle}>Tanggal<input type="date" value={jTanggal} onChange={(e) => setJTanggal(e.target.value)} style={inputStyle} /></label>
            <label style={{ ...labelStyle, flex: 1, minWidth: 240 }}>Keterangan<input value={jKeterangan} onChange={(e) => setJKeterangan(e.target.value)} style={inputStyle} placeholder="mis. Pembayaran gaji staf September 2026" /></label>
          </div>
          {jBaris.map((row, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <label style={{ ...labelStyle, flex: 1 }}>{i === 0 ? 'Akun' : ''}
              <select value={row.akunId} onChange={(e) => ubahBaris(i, { akunId: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">Pilih akun…</option>
                {akun.filter((a) => a.aktif).map((a) => <option key={a.id} value={a.id}>{a.kode} — {a.nama}</option>)}
              </select>
            </label>
            <label style={labelStyle}>{i === 0 ? 'Debit' : ''}<input type="number" value={row.debit} onChange={(e) => ubahBaris(i, { debit: e.target.value, kredit: '' })} style={{ ...inputStyle, width: 140 }} /></label>
            <label style={labelStyle}>{i === 0 ? 'Kredit' : ''}<input type="number" value={row.kredit} onChange={(e) => ubahBaris(i, { kredit: e.target.value, debit: '' })} style={{ ...inputStyle, width: 140 }} /></label>
            {jBaris.length > 2 && <button className="toggle-button deactivate" onClick={() => setJBaris((rows) => rows.filter((_, idx) => idx !== i))}>×</button>}
          </div>)}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button className="toggle-button" onClick={() => setJBaris((rows) => [...rows, { akunId: '', debit: '', kredit: '' }])}>+ Baris</button>
            <div style={{ fontSize: 12, color: balanceOk ? '#2d8155' : '#a05244', fontWeight: 700 }}>
              Debit {rupiah(totalDebitBaru)} · Kredit {rupiah(totalKreditBaru)} {balanceOk ? '✓ Balance' : '✗ Belum balance'}
            </div>
          </div>
          <button className="submit-button" style={{ marginTop: 14, height: 40, padding: '0 20px', width: 'auto' }} disabled={busyId === 'jurnal-baru' || !balanceOk} onClick={simpanJurnal}>Simpan jurnal</button>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-heading"><div><h2>Riwayat jurnal umum</h2><p>500 entri terbaru, semua sumber (otomatis & manual).</p></div><span className="record-count">{jurnal.length} entri</span></div>
        <div className="table-scroll"><table><thead><tr><th>Tanggal</th><th>No. Jurnal</th><th>Keterangan</th><th>Sumber</th><th>Rincian</th><th className="align-right">Aksi</th></tr></thead><tbody>
          {jurnal.map((j) => <tr key={j.id}>
            <td>{tanggal(j.tanggal)}</td>
            <td className="mono" style={{ fontSize: 11 }}>{j.nomorJurnal}</td>
            <td style={{ whiteSpace: 'normal', maxWidth: 240 }}>{j.keterangan}{j.dicatatOleh && <><br /><small style={{ color: 'var(--muted)' }}>oleh {j.dicatatOleh}</small></>}</td>
            <td><span className={`role-pill ${j.sumber === 'Otomatis' ? '' : 'admin'}`}>{j.sumber}</span></td>
            <td style={{ whiteSpace: 'normal', minWidth: 220 }}>
              {j.baris.map((b, i) => <div key={i} style={{ fontSize: 11 }}>{b.kodeAkun} {b.namaAkun}: {b.debit > 0 ? `D ${rupiah(b.debit)}` : `K ${rupiah(b.kredit)}`}</div>)}
            </td>
            <td className="align-right">{j.sumber === 'Manual' && <button className="toggle-button deactivate" disabled={busyId === `hapus-${j.id}`} onClick={() => void hapusJurnal(j)}>Hapus</button>}</td>
          </tr>)}
        </tbody></table>{!loading && jurnal.length === 0 && <div className="empty-state">Belum ada jurnal.</div>}</div>
      </section>
    </>}

    {tab === 'neraca' && neraca && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Neraca (Balance Sheet)</h2><p>Per tanggal terpilih. Selisih harus 0 agar Aset = Liabilitas + Ekuitas.</p></div>
        <input type="date" value={tanggalNeraca} onChange={(e) => setTanggalNeraca(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ padding: '18px 25px 25px' }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 16 }}>
          <AkunTable items={neraca.aset} title={`ASET — ${rupiah(neraca.totalAset)}`} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <AkunTable items={neraca.liabilitas} title={`LIABILITAS — ${rupiah(neraca.totalLiabilitas)}`} />
            <div style={{ height: 16 }} />
            <AkunTable items={[...neraca.ekuitas, { kode: '3-3999', nama: 'SHU Tahun Berjalan', saldo: neraca.shuBerjalan }]} title={`EKUITAS — ${rupiah(neraca.totalEkuitas)}`} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#526763' }}>Total Aset</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{rupiah(neraca.totalAset)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#526763' }}>Total Liabilitas + Ekuitas</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{rupiah(neraca.totalLiabilitas + neraca.totalEkuitas)}</span>
          </div>
        </div>
        <div className={`alert ${Math.abs(neraca.selisih) < 1 ? 'success' : 'error'}`}>
          {Math.abs(neraca.selisih) < 1 ? <BadgeCheck size={17} /> : <X size={17} />}
          Selisih: {rupiah(neraca.selisih)} {Math.abs(neraca.selisih) < 1 ? '(Neraca balance)' : '(Tidak balance — periksa jurnal)'}
        </div>
      </div>
    </section>}

    {tab === 'laba-rugi' && labaRugi && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Hasil Usaha (Income Statement)</h2><p>Pendapatan dikurangi beban pada rentang tanggal terpilih.</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={dariRugi} onChange={(e) => setDariRugi(e.target.value)} style={inputStyle} />
          <input type="date" value={sampaiRugi} onChange={(e) => setSampaiRugi(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ padding: '18px 25px 25px' }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 16 }}>
          <AkunTable items={labaRugi.pendapatan} title={`PENDAPATAN — ${rupiah(labaRugi.totalPendapatan)}`} />
          <AkunTable items={labaRugi.beban} title={`BEBAN — ${rupiah(labaRugi.totalBeban)}`} />
        </div>
        <div className={`alert ${labaRugi.labaBersih >= 0 ? 'success' : 'error'}`}>
          <BadgeCheck size={17} /> Laba Bersih: <strong style={{ marginLeft: 6 }}>{rupiah(labaRugi.labaBersih)}</strong>
        </div>
      </div>
    </section>}

    {tab === 'shu' && <ShuPanel token={token} onExpired={onExpired} />}

    {tab === 'arus-kas' && arusKas && <section className="table-panel">
      <div className="panel-heading">
        <div><h2>Arus Kas (ringkasan)</h2><p>Pergerakan akun Kas & Bank metode langsung sederhana — bukan klasifikasi operasi/investasi/pendanaan penuh sesuai SAK, cukup untuk pemantauan internal.</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={dariKas} onChange={(e) => setDariKas(e.target.value)} style={inputStyle} />
          <input type="date" value={sampaiKas} onChange={(e) => setSampaiKas(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <section className="stat-grid" style={{ padding: '0 25px', margin: '16px 0' }}>
        <StatCard label="Saldo awal" value={arusKas.saldoAwal} icon={<Banknote size={20} />} tone="blue" money />
        <StatCard label="Kas masuk" value={arusKas.totalMasuk} icon={<TrendingUp size={20} />} tone="green" money />
        <StatCard label="Kas keluar" value={arusKas.totalKeluar} icon={<HandCoins size={20} />} tone="amber" money />
        <StatCard label="Saldo akhir" value={arusKas.saldoAkhir} icon={<Banknote size={20} />} tone="teal" money />
      </section>
      <div className="table-scroll"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Modul</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>
        {arusKas.baris.map((b, i) => <tr key={i}>
          <td>{tanggal(b.tanggal)}</td>
          <td style={{ whiteSpace: 'normal', maxWidth: 280 }}>{b.keterangan}</td>
          <td>{b.modul ?? '—'}</td>
          <td style={{ color: '#2d8155' }}>{b.masuk > 0 ? rupiah(b.masuk) : '—'}</td>
          <td style={{ color: '#a05244' }}>{b.keluar > 0 ? rupiah(b.keluar) : '—'}</td>
        </tr>)}
      </tbody></table>{arusKas.baris.length === 0 && <div className="empty-state">Tidak ada pergerakan kas pada rentang ini.</div>}</div>
    </section>}

    {tab === 'akun' && <section className="table-panel">
      <div className="panel-heading"><div><h2>Bagan Akun (Chart of Accounts)</h2><p>Akun bertanda "Sistem" dipakai posting otomatis dan tidak bisa dinonaktifkan.</p></div></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 25px 18px', alignItems: 'end' }}>
        <label style={labelStyle}>Kode<input value={akunKode} onChange={(e) => setAkunKode(e.target.value)} style={{ ...inputStyle, width: 110 }} placeholder="6-6100" /></label>
        <label style={{ ...labelStyle, flex: 1, minWidth: 180 }}>Nama<input value={akunNama} onChange={(e) => setAkunNama(e.target.value)} style={inputStyle} /></label>
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
        <button className="submit-button" style={{ height: 38, padding: '0 18px' }} disabled={busyId === 'akun-baru'} onClick={tambahAkun}>Tambah</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Saldo Normal</th><th>Status</th><th className="align-right">Aksi</th></tr></thead><tbody>
        {akun.map((a) => <tr key={a.id}>
          <td className="mono">{a.kode}</td>
          <td>{a.nama}{a.sistem && <span className="role-pill" style={{ marginLeft: 6 }}>Sistem</span>}</td>
          <td>{a.tipe}</td>
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '18px 25px 8px', alignItems: 'end' }}>
        <label style={labelStyle}>Tahun buku<input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} style={{ ...inputStyle, width: 100 }} /></label>
        <label style={labelStyle}>Total SHU (Rp)<input type="number" value={totalShu} onChange={(e) => setTotalShu(e.target.value)} style={{ ...inputStyle, width: 160 }} /></label>
        <button className="toggle-button" disabled={busyId === 'ambil-lr'} onClick={() => void ambilDariLabaRugi()}>Ambil dari Hasil Usaha</button>
      </div>

      <div style={{ margin: '10px 25px 0', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 10, background: '#f7faf9' }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--teal-dark)', marginBottom: 10 }}>Lapis 1 — Pembagian Total SHU (wajib 100%)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end' }}>
          <label style={labelStyle}>% Anggota<input type="number" value={persenAnggota} onChange={(e) => setPersenAnggota(e.target.value)} style={{ ...inputStyle, width: 100 }} /></label>
          <label style={labelStyle}>% Pengurus<input type="number" value={persenPengurus} onChange={(e) => setPersenPengurus(e.target.value)} style={{ ...inputStyle, width: 100 }} /></label>
          <label style={labelStyle}>% Cadangan (tidak dibagikan)<input type="number" value={persenCadangan} onChange={(e) => setPersenCadangan(e.target.value)} style={{ ...inputStyle, width: 100 }} /></label>
        </div>
        {(Number(persenAnggota) + Number(persenPengurus) + Number(persenCadangan)) !== 100 && <div style={{ marginTop: 8, fontSize: 12, color: '#bd6d1d' }}>Catatan: total Lapis 1 saat ini {Number(persenAnggota) + Number(persenPengurus) + Number(persenCadangan)}% (seharusnya 100%).</div>}
      </div>

      <div style={{ margin: '12px 25px 0', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 10, background: '#fbf9f3' }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: '#8a5a12', marginBottom: 10 }}>Lapis 2 — Pembagian Pool Anggota (wajib 100%)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end' }}>
          <label style={labelStyle}>% Jasa Modal (JMA)<input type="number" value={persenModal} onChange={(e) => setPersenModal(e.target.value)} style={{ ...inputStyle, width: 100 }} /></label>
          <label style={labelStyle}>% Jasa Usaha (JUA)<input type="number" value={persenUsaha} onChange={(e) => setPersenUsaha(e.target.value)} style={{ ...inputStyle, width: 100 }} /></label>
        </div>
        {(Number(persenModal) + Number(persenUsaha)) !== 100 && <div style={{ marginTop: 8, fontSize: 12, color: '#bd6d1d' }}>Catatan: total Lapis 2 saat ini {Number(persenModal) + Number(persenUsaha)}% (seharusnya 100%).</div>}
      </div>

      <div style={{ padding: '16px 25px 8px' }}>
        <button className="submit-button" style={{ height: 38, padding: '0 18px', width: 'auto' }} disabled={busyId === 'hitung'} onClick={() => void hitung()}>Hitung (pratinjau)</button>
      </div>

      {hasil && <div style={{ padding: '0 25px 22px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="toggle-button activate" disabled={busyId === 'finalisasi'} onClick={() => void finalisasi()}>Finalisasi & kirim ke aplikasi anggota</button>
        </div>
        <div className="stat-grid">
          <StatCard label="Cadangan (ditahan permanen)" value={hasil.cadanganAmount} icon={<PiggyBank size={18} />} tone="blue" money />
          <StatCard label="Jasa Pengurus" value={hasil.jasaPengurusPool} icon={<Users size={18} />} tone="amber" money />
          <StatCard label="Total ke anggota (neto)" value={hasil.totalShuNeto} icon={<BadgeCheck size={18} />} tone="green" money />
          <StatCard label="PPh anggota" value={hasil.totalPajak} icon={<Receipt size={18} />} tone="teal" money />
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 14px' }}>Total simpanan semua anggota aktif: {rupiah(hasil.totalSimpananSemuaAnggota)} · Total transaksi: {rupiah(hasil.totalTransaksiSemuaAnggota)} · Tarif PPh {(hasil.tarifPph * 100).toFixed(0)}%</p>
        <div className="table-scroll"><table><thead><tr><th>Anggota</th><th>NIK</th><th>Simpanan</th><th>Transaksi</th><th>JMA</th><th>JUA</th><th>Total SHU (Bruto)</th><th>PPh</th><th>Total SHU (Neto)</th></tr></thead><tbody>
          {hasil.rincian.map((r) => <tr key={r.penggunaId}>
            <td><div className="user-cell"><span className="avatar">{r.nama.charAt(0).toUpperCase()}</span><strong>{r.nama}</strong></div></td>
            <td className="mono">{r.nomorIndukKaryawan || '—'}</td>
            <td>{rupiah(r.simpananAnggota)}</td>
            <td>{rupiah(r.transaksiAnggota)}</td>
            <td>{rupiah(r.jma)}</td>
            <td>{rupiah(r.jua)}</td>
            <td>{rupiah(r.totalShu)}</td>
            <td style={{ color: '#ad6a16' }}>−{rupiah(r.pajak)}</td>
            <td style={{ fontWeight: 800 }}>{rupiah(r.totalShuNeto)}</td>
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
            <td style={{ fontWeight: 700 }}>{rupiah(r.totalShuNeto)}<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>{r.jumlahAnggota} anggota · JMA {(r.persenJasaModal * 100).toFixed(0)}%/JUA {(r.persenJasaUsaha * 100).toFixed(0)}%</small></td>
            <td className="align-right"><span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="toggle-button" onClick={() => void lihatRincian(r.tahun)}>{expanded?.tahun === r.tahun ? 'Tutup' : 'Rincian'}</button>
              <button className="toggle-button activate" onClick={() => void eksporCsv(r.tahun)}>Ekspor CSV</button>
            </span></td>
          </tr>,
          expanded?.tahun === r.tahun && <tr key={`${r.tahun}-d`}><td colSpan={6} style={{ background: '#f7faf9' }}>
            <table className="table-compact" style={{ minWidth: 0 }}><thead><tr><th>Anggota</th><th>NIK</th><th>JMA</th><th>JUA</th><th>Bruto</th><th>PPh</th><th>Neto</th></tr></thead><tbody>
              {expanded.rincian.map((x) => <tr key={x.penggunaId}><td>{x.nama}</td><td className="mono">{x.nomorIndukKaryawan}</td><td>{rupiah(x.jma)}</td><td>{rupiah(x.jua)}</td><td>{rupiah(x.totalShu)}</td><td style={{ color: '#ad6a16' }}>−{rupiah(x.pajak)}</td><td style={{ fontWeight: 700 }}>{rupiah(x.totalShuNeto)}</td></tr>)}
            </tbody></table>
          </td></tr>,
        ])}
      </tbody></table>{!loading && riwayat.length === 0 && <div className="empty-state">Belum ada SHU yang difinalisasi.</div>}</div>
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
}

function PanduanView({ isAdmin, goto }: { isAdmin: boolean; goto: (target: View) => void }) {
  const menu: PanduanItem[] = [
    {
      key: 'dashboard', icon: <LayoutDashboard size={22} />, judul: 'Dashboard', warna: '#087f78', latar: '#d8f1ec',
      ringkasan: 'Halaman pertama yang Anda lihat — ringkasan kondisi koperasi hari ini dalam sekali pandang.',
      poin: [
        'Kartu besar di atas menunjukkan jumlah anggota aktif, total simpanan koperasi, pinjaman aktif, dan laba bersih tahun berjalan.',
        'Kotak kuning "Perlu tindakan Anda" muncul kalau ada pengajuan yang menunggu persetujuan — klik salah satu chip-nya untuk langsung dibawa ke menu & tab yang tepat.',
        'Grafik tren 6 bulan menampilkan pendapatan vs beban, dan donut chart menunjukkan komposisi simpanan anggota.',
        'Bagian bawah memuat aktivitas terbaru yang tercatat di seluruh sistem.',
      ],
      tips: 'Jadikan halaman ini kebiasaan pertama tiap kali login — supaya tidak ada pengajuan anggota yang lolos tanpa diproses.',
    },
    {
      key: 'anggota', icon: <Users size={22} />, judul: 'Manajemen Anggota', warna: '#375e86', latar: '#e2ecf7',
      ringkasan: 'Satu menu, tiga tab: dari calon anggota mendaftar sampai potongan gajinya direkap.',
      poin: [
        'Tab "Pendaftaran" — setujui atau tolak calon anggota baru. Setelah disetujui, Simpanan Pokok otomatis dikreditkan.',
        'Tab "Direktori Anggota" — cari anggota, klik namanya untuk pop-up detail lengkap: rincian simpanan, riwayat pinjaman, dan riwayat belanja katalog.',
        'Tab "Tagihan Anggota" — rekap otomatis Simpanan Wajib + Tagihan Kredit + Cicilan Pinjaman per anggota untuk periode berjalan, tinggal disetujui lalu diekspor sebagai CSV.',
      ],
      tips: 'Anggota baru wajib disetujui dulu di tab Pendaftaran sebelum muncul di Direktori maupun bisa ikut transaksi lain.',
      target: 'anggota',
    },
    {
      key: 'simpanpinjam', icon: <PiggyBank size={22} />, judul: 'Simpan Pinjam', warna: '#ad6a16', latar: '#f8ead0',
      ringkasan: 'Jantung operasional koperasi — kelola simpanan anggota dan proses pinjaman, dalam dua tab.',
      poin: [
        'Tab "Simpanan" — atur nominal Pokok/Wajib & suku bunga, setujui tagihan Wajib per periode, setujui setoran/penarikan Sukarela, kelola paket & pencairan Simpanan Berjangka (deposito), dan trigger hitung bunga bulanan.',
        'Tab "Pinjaman" — tinjau pengajuan pinjaman baru (setujui/tolak), proses pembayaran angsuran & pelunasan dipercepat, lihat riwayat lengkap tiap pinjaman anggota.',
      ],
      tips: 'Bunga simpanan sukarela dan bunga deposito sama-sama otomatis dipotong PPh sebelum masuk ke saldo anggota — nominalnya selalu ditampilkan terpisah (bruto vs neto) di tabelnya.',
      target: 'simpanpinjam',
    },
    {
      key: 'katalog', icon: <Store size={22} />, judul: 'Katalog', warna: '#6b4fa8', latar: '#ece4f7',
      ringkasan: 'Toko koperasi — baik barang milik koperasi sendiri maupun barang titipan anggota.',
      poin: [
        'Kelola produk milik koperasi (tambah, ubah harga & stok) dan setujui/tolak produk titipan yang diajukan anggota.',
        'Setujui transaksi pembelian — Tunai langsung selesai, sedangkan Kredit (potong gaji) membuat Tagihan Kredit baru.',
        'Kelola Tagihan Kredit: tandai lunas setelah potongan gaji dikonfirmasi terlaksana.',
      ],
      target: 'katalog',
    },
    {
      key: 'akuntansi', icon: <BookOpen size={22} />, judul: 'Akuntansi & Keuangan', warna: '#087f78', latar: '#d8f1ec',
      ringkasan: '"Dapur" koperasi — semua transaksi di menu lain otomatis tercatat di sini sebagai jurnal.',
      poin: [
        'Tab "Jurnal Umum" — riwayat semua jurnal (otomatis dari transaksi + manual), dan form untuk mencatat transaksi di luar sistem (gaji staf, listrik, sewa, dll).',
        'Tab "Neraca" — Aset vs Liabilitas+Ekuitas per tanggal, dengan indikator apakah sudah balance.',
        'Tab "Hasil Usaha" — pendapatan dikurangi beban pada rentang tanggal, jadi dasar penentuan Total SHU.',
        'Tab "SHU" — kalkulator Sisa Hasil Usaha: hitung pratinjau per anggota (JMA + JUA, sudah dipotong PPh), lalu finalisasi agar tayang ke aplikasi anggota.',
        'Tab "Arus Kas" — pergerakan kas masuk/keluar pada rentang tanggal.',
        'Tab "Bagan Akun" — daftar akun akuntansi standar; boleh menambah akun baru non-sistem.',
      ],
      tips: 'Kalau Neraca tidak balance (selisih ≠ Rp 0), biasanya ada jurnal manual yang kurang tepat — cek di tab Jurnal Umum.',
      target: 'akuntansi',
    },
    {
      key: 'erat', icon: <Vote size={22} />, judul: 'E-RAT & Dokumen', warna: '#2d8155', latar: '#e4f3e7',
      ringkasan: 'Rapat Anggota Tahunan secara digital — voting dan arsip dokumen resmi.',
      poin: [
        'Buat agenda voting (misalnya pemilihan pengurus atau persetujuan program kerja), tambah/hapus pilihan, lalu tayangkan agar anggota bisa memberi suara lewat aplikasi.',
        'Tutup agenda setelah selesai untuk mengunci hasil voting.',
        'Unggah dan kelola dokumen RAT (laporan tahunan) yang bisa diunduh anggota.',
      ],
      target: 'erat',
    },
  ]

  const adminMenu: PanduanItem[] = [
    {
      key: 'akun', icon: <UserCog size={22} />, judul: 'Akun & Peran Pengguna', warna: '#725128', latar: '#f8ead0',
      ringkasan: 'Khusus Admin — kelola siapa saja yang punya akses ke sistem dan sebagai apa.',
      poin: [
        'Lihat semua akun, aktifkan/nonaktifkan login seseorang.',
        'Ubah peran pengguna: Admin, Pengurus, atau Anggota (tidak bisa menurunkan/menonaktifkan satu-satunya Admin yang tersisa).',
        'Reset akses (password) anggota yang lupa password — sistem membuatkan password sementara untuk disampaikan langsung.',
        'Impor/ekspor data anggota massal lewat CSV.',
      ],
      target: 'akun', adminOnly: true,
    },
    {
      key: 'audit', icon: <Fingerprint size={22} />, judul: 'Audit Trail', warna: '#9a5a41', latar: '#f8e9e2',
      ringkasan: 'Khusus Admin — jejak digital setiap perubahan data sensitif, untuk transparansi dan pengawasan.',
      poin: [
        'Tab "Aktivitas aplikasi" — siapa melakukan apa lewat admin console (persetujuan, perubahan peran, dll), bisa difilter per modul.',
        'Tab "Log database" — dicatat langsung oleh database, mencakup perubahan lewat jalur mana pun (termasuk kalau ada yang mengedit data langsung lewat tool database), lengkap dengan tombol verifikasi integritas rantai datanya.',
      ],
      target: 'audit', adminOnly: true,
    },
  ]

  const semua = isAdmin ? [...menu, ...adminMenu] : menu

  return <div className="content-wrap">
    <section className="welcome-row" style={{
      background: 'linear-gradient(120deg, #0b6e69 0%, #0f8a7f 55%, #14a693 100%)',
      borderRadius: 16, padding: '28px 32px', color: '#fff', marginBottom: 24, alignItems: 'center',
      boxShadow: '0 18px 45px rgba(11,110,105,.28)',
    }}>
      <div>
        <p className="eyebrow" style={{ color: '#bdeee3', display: 'flex', alignItems: 'center', gap: 6 }}><HelpCircle size={14} /> PANDUAN PENGURUS</p>
        <h1 style={{ margin: '4px 0 6px', fontSize: 24 }}>Bingung mulai dari mana? 👋</h1>
        <p style={{ color: '#dcf3ec', margin: 0, fontSize: 13, maxWidth: 560 }}>
          Halaman ini menjelaskan setiap menu di admin console — apa fungsinya dan apa saja yang bisa Anda lakukan di sana.
          Klik "Buka menu ini" pada tiap kartu untuk langsung mencobanya.
        </p>
      </div>
    </section>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
      {semua.map((m) => (
        <a key={m.key} href={`#panduan-${m.key}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20,
          background: m.latar, color: m.warna, fontSize: 12, fontWeight: 700, textDecoration: 'none',
        }}>{m.judul}</a>
      ))}
    </div>

    <div style={{ display: 'grid', gap: 18 }}>
      {semua.map((m) => (
        <section key={m.key} id={`panduan-${m.key}`} className="table-panel" style={{ scrollMarginTop: 20 }}>
          <div className="panel-heading" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: m.latar, color: m.warna, flexShrink: 0 }}>{m.icon}</span>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{m.judul} {m.adminOnly && <span className="role-pill admin">Khusus Admin</span>}</h2>
                <p>{m.ringkasan}</p>
              </div>
            </div>
            {m.target && <button className="toggle-button activate" style={{ flexShrink: 0 }} onClick={() => goto(m.target as View)}>Buka menu ini</button>}
          </div>
          <div style={{ padding: '4px 25px 22px' }}>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
              {m.poin.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{p}</li>)}
            </ul>
            {m.tips && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'start', marginTop: 16, padding: '12px 14px', borderRadius: 10, background: '#fdf7ee', border: '1px solid #f2d9b8' }}>
                <Lightbulb size={16} color="#ad6a16" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, color: '#8a5a1f' }}>{m.tips}</span>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>

    <section className="table-panel" style={{ marginTop: 18 }}>
      <div style={{ padding: '20px 25px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#e5f4ef', color: 'var(--teal-dark)', flexShrink: 0 }}><HelpCircle size={22} /></span>
        <div>
          <strong style={{ display: 'block', marginBottom: 3 }}>Masih ada yang membingungkan?</strong>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Tanyakan ke sesama pengurus atau hubungi tim pengembang aplikasi — halaman ini akan terus diperbarui seiring bertambahnya fitur baru.</span>
        </div>
      </div>
    </section>
  </div>
}

function StatCard({ label, value, icon, tone, money }: { label: string; value: number; icon: ReactNode; tone: string; money?: boolean }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{money ? rupiah(value) : value}</strong></div></div>
}

function LoginScreen({ nik, password, setNik, setPassword, loading, error, onSubmit }: { nik: string; password: string; setNik: (value: string) => void; setPassword: (value: string) => void; loading: boolean; error: string; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-card"><div className="brand-lockup centered"><div className="brand-mark">K</div><div><strong>KKCS</strong><span>Admin Console</span></div></div><div className="login-copy"><p className="eyebrow">RUANG PENGURUS</p><h1>Masuk ke console</h1><p>Gunakan akun dengan role Admin atau Pengurus untuk melanjutkan.</p></div>{error && <div className="alert error"><X size={17} />{error}</div>}<form onSubmit={onSubmit}><label>NIK<input value={nik} onChange={(event) => setNik(event.target.value)} placeholder="Nomor Induk Karyawan" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required /></label><button className="submit-button" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button></form><small className="login-note">Akses dicatat berdasarkan role akun di server.</small></div></div> }

export default App
