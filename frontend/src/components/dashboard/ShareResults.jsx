import { Share2, Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { useState } from 'react'

export default function ShareResults({ type = 'coding', data = {} }) {
  const [copied, setCopied] = useState(false)

  const getMessage = () => {
    switch (type) {
      case 'coding':
        return `I just solved ${data.solved || 0} coding problems on PlaceX! #PlaceX #Coding`
      case 'streak':
        return `I'm on a ${data.streak || 0}-day practice streak on PlaceX! #PlaceX #Streak`
      case 'level':
        return `I reached Level ${data.level || 1} on PlaceX with ${data.xp || 0} XP! #PlaceX #Gamification`
      default:
        return `Check out PlaceX - AI-Powered Placement Platform! #PlaceX`
    }
  }

  function shareTwitter() {
    const msg = encodeURIComponent(getMessage())
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank')
  }

  function shareLinkedIn() {
    const msg = encodeURIComponent(getMessage())
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://placex.app&summary=${msg}`, '_blank')
  }

  async function copyLink() {
    const msg = getMessage()
    await navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={shareTwitter} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-sky-100 hover:text-sky-500 transition-colors" title="Share on Twitter">
        <Twitter size={16} />
      </button>
      <button onClick={shareLinkedIn} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Share on LinkedIn">
        <Linkedin size={16} />
      </button>
      <button onClick={copyLink} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 hover:text-green-600 transition-colors" title="Copy to clipboard">
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  )
}
