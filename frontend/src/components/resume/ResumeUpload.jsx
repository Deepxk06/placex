import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../utils/helpers'

const MAX_SIZE = 5 * 1024 * 1024
const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
}

export const PROCESSING_STEPS = [
  'Uploading Resume',
  'Extracting Content',
  'Detecting Sections',
  'Analyzing Skills',
  'Calculating Score',
  'Generating Insights',
]

export default function ResumeUpload({ processing = false, step = 0, onFileSelected, onError }) {
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError('')
      const file = acceptedFiles[0]
      if (!file) {
        const rejection = rejectedFiles?.[0]
        if (rejection?.errors?.some((e) => e.code === 'file-too-large')) {
          setError('File is too large. Maximum size is 5 MB.')
        } else {
          setError('Unsupported file type. Please upload a PDF, DOCX or TXT file.')
        }
        onError?.()
        return
      }
      if (file.size > MAX_SIZE) {
        setError('File is too large. Maximum size is 5 MB.')
        onError?.()
        return
      }
      setFileName(file.name)
      onFileSelected?.(file)
    },
    [onFileSelected, onError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        role="button"
        aria-label="Upload resume"
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-gray-300 hover:border-primary-400 dark:border-gray-700',
          processing && 'pointer-events-none opacity-90'
        )}
      >
        <input {...getInputProps()} />
        {processing ? (
          <div className="space-y-4">
            <Loader2 size={40} className="mx-auto animate-spin text-primary-500" />
            <div className="mx-auto max-w-md space-y-2 text-left">
              {PROCESSING_STEPS.map((label, i) => {
                const done = i < step
                const active = i === step
                return (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                    ) : active ? (
                      <Loader2 size={16} className="shrink-0 animate-spin text-primary-500" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}
                    <span className={cn(done ? 'text-green-600 dark:text-green-400' : active ? 'font-medium' : 'text-gray-400')}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <UploadCloud size={40} className="mx-auto mb-4 text-gray-400" />
            {fileName ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <span className="font-medium">{fileName}</span>
              </div>
            ) : (
              <>
                <p className="font-medium text-gray-700 dark:text-gray-200">Drag &amp; drop your resume here</p>
                <p className="mt-1 text-sm text-gray-400">or click to browse files</p>
              </>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <FileText size={14} />
              <span>PDF / DOCX / TXT &middot; up to 5 MB</span>
            </div>
          </div>
        )}
      </div>

      {error && !processing && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}