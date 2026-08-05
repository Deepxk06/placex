import { useEffect, useState } from 'react'

export function useTypingEffect(text: string, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState('')
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!active) {
      setDisplayed('')
      setComplete(false)
      return
    }
    setDisplayed('')
    setComplete(false)
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setComplete(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, active])

  return { displayed, complete }
}
