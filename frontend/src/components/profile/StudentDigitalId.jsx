import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Printer, Share2, QrCode, BadgeCheck, FileText } from 'lucide-react'
import SectionCard from './SectionCard'
import { useProfileStore } from '../../store/profileStore'
import { currentSemester } from './ProfileHeader'

const CARD_W = 480
const CARD_H = 640

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image'))
    img.src = src
  })
}

async function buildIdCanvas({ name, roll, branch, collegeName, sem, photo, qrSrc }) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const images = await Promise.allSettled([
    photo ? loadImage(photo) : Promise.reject(),
    qrSrc ? loadImage(qrSrc) : Promise.reject(),
  ])
  const photoImg = images[0].status === 'fulfilled' ? images[0].value : null
  const qrImg = images[1].status === 'fulfilled' ? images[1].value : null

  // Background
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#2563eb')
  bg.addColorStop(0.42, '#1d4ed8')
  bg.addColorStop(0.42, '#f8fafc')
  bg.addColorStop(1, '#f8fafc')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Brand
  ctx.beginPath()
  ctx.roundRect(48, 44, 64, 64, 14)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = '#1d4ed8'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('PX', 68, 87)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('PlaceX', 130, 78)
  ctx.font = '13px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('Student Digital ID', 130, 98)

  // Photo
  const cx = 120
  const cy = 200
  if (photoImg) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 58, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(photoImg, cx - 58, cy - 58, 116, 116)
    ctx.restore()
  } else {
    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(cx, cy, 58, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = '#1d4ed8'
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText((name[0] || '?').toUpperCase(), cx, cy + 17)
  }

  // Identity
  ctx.textAlign = 'center'
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(name, cx, cy + 96)
  ctx.font = '15px system-ui, sans-serif'
  ctx.fillStyle = '#475569'
  if (roll && roll !== '—') ctx.fillText(`Reg No  ${roll}`, cx, cy + 124)
  const collegeLine = branch ? `${branch}${collegeName ? ' · ' + collegeName : ''}` : collegeName
  if (collegeLine) ctx.fillText(collegeLine, cx, cy + 150)
  if (sem) ctx.fillText(`Semester ${sem}`, cx, cy + 176)

  // QR
  const qrSize = 170
  const qx = CARD_W / 2 - qrSize / 2
  const qy = 410
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(qx - 12, qy - 12, qrSize + 24, qrSize + 24, 16)
  ctx.fill()
  if (qrImg) ctx.drawImage(qrImg, qx, qy, qrSize, qrSize)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.fillText('Scan to verify with PlaceX', CARD_W / 2, qy + qrSize + 34)

  return canvas
}

function canvasToPdf(dataUrl, w, h) {
  const base64 = dataUrl.split(',')[1]
  const objects = {}
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objects[3] =
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
    '/Resources << /XObject << /Img1 4 0 R >> >> /Contents 5 0 R >>'
  objects[4] =
    `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB ` +
    `/BitsPerComponent 8 /Filter /DCTDecode /Length ${base64.length} >>\nstream\n${base64}\nendstream`
  const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Img1 Do\nQ`
  objects[5] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`

  let pdf = '%PDF-1.4\n'
  const offsets = {}
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pdf.length
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xrefStart = pdf.length
  pdf += 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  return new Blob([pdf], { type: 'application/pdf' })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export default function StudentDigitalId() {
  const { profile } = useProfileStore()
  const qrRef = useRef(null)

  if (!profile) return null

  const name = profile.user?.name || 'Student'
  const college = profile.college || {}
  const sem = currentSemester(college.start_year)
  const photo = profile.photo || ''
  const roll = college.roll_number || '—'
  const payload = JSON.stringify({
    name,
    roll,
    branch: college.branch || '',
    college: college.college_name || '',
    email: profile.user?.email || '',
  })

  const cardData = () => ({
    name,
    roll,
    branch: college.branch || '',
    collegeName: college.college_name || '',
    sem,
    photo,
    qrSrc: qrRef.current ? qrRef.current.toDataURL('image/png') : '',
  })

  const exportPng = async () => {
    const canvas = await buildIdCanvas(cardData())
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${name.replace(/\s+/g, '_')}_placex_id.png`
    a.click()
  }

  const exportPdf = async () => {
    const canvas = await buildIdCanvas(cardData())
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    downloadBlob(canvasToPdf(dataUrl, canvas.width, canvas.height), `${name.replace(/\s+/g, '_')}_placex_id.pdf`)
  }

  const print = () => {
    const win = window.open('', '_blank', 'width=560,height=760')
    if (!win) return
    const qr = qrRef.current ? qrRef.current.toDataURL('image/png') : ''
    win.document.write(`<!doctype html><html><head><title>${name} — PlaceX ID</title>
      <style>
        body{margin:0;padding:28px;background:#eef2f7;display:flex;justify-content:center;font-family:system-ui,sans-serif}
        .card{width:420px;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.15);background:#fff}
        .top{background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;padding:24px}
        .top h1{font-size:26px;margin:0}
        .top p{margin:2px 0 0;opacity:.85;font-size:13px}
        .mid{padding:20px 24px;text-align:center}
        .mid h2{margin:12px 0 2px;font-size:22px}
        .mid p{margin:2px 0;color:#475569;font-size:13px}
        .foot{border-top:1px solid #e2e8f0;text-align:center;padding:10px;font-size:11px;color:#94a3b8}
      </style></head><body><div class="card">
      <div class="top"><h1>PlaceX</h1><p>Student Digital ID</p></div>
      <div class="mid">
        <img src="${qr}" alt="QR" style="width:150px;height:150px"/>
        <h2>${name}</h2>
        <p>${roll !== '—' ? `Roll No ${roll}` : ''}${roll !== '—' && sem ? ' · ' : ''}${sem ? `Semester ${sem}` : ''}</p>
        ${college.branch || college.college_name ? `<p>${college.branch}${college.branch && college.college_name ? ' · ' : ''}${college.college_name}</p>` : ''}
      </div>
      <div class="foot">Present this ID to verify your PlaceX profile · ${new Date().getFullYear()}</div>
    </div><script>window.onload=function(){setTimeout(function(){window.print()},250)}</script></body></html>`)
    win.document.close()
  }

  const share = async () => {
    const text = `${name} — PlaceX Student ID${college.branch ? ' · ' + college.branch : ''}`
    if (navigator.share) {
      try { await navigator.share({ title: 'My PlaceX Student ID', text, url: window.location.href }) } catch { /* cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <SectionCard id="sec-digital-id" icon={QrCode} title="Student Digital ID" subtitle="Verified, shareable campus identity" delay={0.2}>
      <div className="mx-auto max-w-[340px] overflow-hidden rounded-2xl border border-gray-200 shadow-soft dark:border-gray-800">
        <div className="flex items-center gap-2.5 bg-gradient-to-br from-primary-600 to-sky-500 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <FileText size={16} />
          </span>
          <div className="text-white">
            <p className="text-sm font-extrabold leading-none">PlaceX</p>
            <p className="mt-0.5 text-[10px] text-white/70">Student Digital ID</p>
          </div>
          <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <BadgeCheck size={16} />
          </span>
        </div>
        <div className="bg-white p-5 text-center dark:bg-gray-900">
          {photo ? (
            <img src={photo} alt={name} className="mx-auto h-16 w-16 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-500/20" />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-sky-500 text-2xl font-extrabold text-white">
              {(name[0] || '?').toUpperCase()}
            </div>
          )}
          <p className="mt-3 text-lg font-extrabold text-gray-900 dark:text-white">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {roll !== '—' && `Roll ${roll}`}
            {roll !== '—' && sem && ' · '}
            {sem && `Semester ${sem}`}
          </p>
          {(college.branch || college.college_name) && (
            <p className="mt-1 text-[11px] text-gray-400">
              {college.branch}{college.branch && college.college_name ? ' · ' : ''}{college.college_name}
            </p>
          )}
          <div className="mx-auto mt-3 h-24 w-24">
            <QRCodeCanvas ref={qrRef} value={payload} size={96} bgColor="#ffffff" fgColor="#0f172a" level="M" />
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Scan this QR to verify your PlaceX identity</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <IdAction label="PNG" icon={Download} onClick={exportPng} />
        <IdAction label="PDF" icon={FileText} onClick={exportPdf} />
        <IdAction label="Print" icon={Printer} onClick={print} />
        <IdAction label="Share" icon={Share2} onClick={share} />
      </div>
    </SectionCard>
  )
}

function IdAction({ label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 py-2.5 text-[11px] font-semibold text-gray-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
    >
      <Icon size={16} /> {label}
    </button>
  )
}