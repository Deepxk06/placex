import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Trash2, Download, ShieldCheck, Loader2 } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const DOC_TYPES = [
  { id: 'student_id', label: 'Student ID', desc: 'College ID card (jpg, png, pdf)' },
  { id: 'aadhaar', label: 'Aadhaar Card', desc: 'Masked or full (jpg, png, pdf)' },
  { id: 'driving_license', label: 'Driving License', desc: 'Front/back (jpg, png, pdf)' },
]

const MAX_SIZE = 5 * 1024 * 1024

export default function DocumentsCard({ profile, onUpdate }) {
  const { toast } = useToast()

  const upload = useCallback(async (docType, file) => {
    if (file.size > MAX_SIZE) {
      toast({ type: 'error', message: 'File too large. Maximum size is 5 MB' })
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post(`/profile/documents/${docType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (onUpdate) onUpdate(res.data)
      toast({ type: 'success', message: 'Document uploaded' })
    } catch (err) {
      const detail = err.response?.data?.detail
      toast({ type: 'error', message: typeof detail === 'string' ? detail : 'Upload failed' })
    }
  }, [onUpdate, toast])

  const remove = async (docType) => {
    if (!window.confirm('Remove this document?')) return
    try {
      const res = await api.delete(`/profile/documents/${docType}`)
      if (onUpdate) onUpdate(res.data)
      toast({ type: 'success', message: 'Document removed' })
    } catch {
      toast({ type: 'error', message: 'Failed to remove document' })
    }
  }

  const download = (doc) => {
    const a = document.createElement('a')
    a.href = doc.dataUrl
    a.download = doc.name || 'document'
    a.click()
  }

  return (
    <div className="card dark:bg-gray-900 dark:border-gray-800">
      <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
        <ShieldCheck size={18} className="text-primary-600" /> Identity Documents
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload identity documents for verification. Max 5 MB each.
      </p>
      <div className="space-y-3">
        {DOC_TYPES.map((doc) => {
          const stored = profile.documents?.[doc.id] || {}
          const hasDoc = stored && stored.name
          return (
            <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-sm text-gray-800 dark:text-white">{doc.label}</div>
                  <div className="text-xs text-gray-400">{doc.desc}</div>
                </div>
                {hasDoc && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => download(stored)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Download">
                      <Download size={16} />
                    </button>
                    <button onClick={() => remove(doc.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {hasDoc ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">
                  <FileText size={15} />
                  <span className="truncate">{stored.name}</span>
                  <span className="text-xs text-gray-400">({Math.round(stored.size / 1024)} KB)</span>
                </div>
              ) : (
                <DropzoneSlot docType={doc.id} label={doc.label} onUpload={(f) => upload(doc.id, f)} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DropzoneSlot({ docType, label, onUpload }) {
  const onDrop = useCallback((accepted) => {
    if (accepted && accepted[0]) onUpload(accepted[0])
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg py-3 px-4 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {isDragReject ? (
          <span className="text-red-500">Invalid file type</span>
        ) : isDragActive ? (
          <>
            <Upload size={15} className="text-primary-600" /> Drop {label} here
          </>
        ) : (
          <>
            <Upload size={15} /> Drag & drop or click to upload
          </>
        )}
      </div>
    </div>
  )
}
