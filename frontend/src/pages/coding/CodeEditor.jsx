import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeEditor({ code, onChange, language, isDark }) {
  const editorRef = useRef(null)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 12 },
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      window.dispatchEvent(new Event('coding-run'))
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      window.dispatchEvent(new Event('coding-submit'))
    })
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={isDark ? 'vs-dark' : 'vs'}
        loading={
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
            <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12 },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
        }}
      />
    </div>
  )
}
