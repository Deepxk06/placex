import { cn } from '../../utils/helpers'

const inputCls =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 transition'

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      )}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
    </label>
  )
}

export function TextInput({ className, ...props }) {
  return <input className={cn(inputCls, className)} {...props} />
}

export function TextArea({ className, ...props }) {
  return <textarea className={cn(inputCls, 'resize-none leading-relaxed', className)} {...props} />
}

export function SelectInput({ options = [], placeholder, className, children, ...props }) {
  return (
    <select className={cn(inputCls, 'cursor-pointer', className)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      {children}
    </select>
  )
}

export function ButtonRow({ children, className }) {
  return <div className={cn('mt-5 flex items-center justify-end gap-2', className)}>{children}</div>
}

export function ModalFooter({ onCancel, cancelLabel = 'Cancel', submitLabel = 'Save', disabled, onSave, loading }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-gray-200/70 px-5 py-4 dark:border-gray-800/70">
      <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        {cancelLabel}
      </button>
      <button
        onClick={onSave}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}