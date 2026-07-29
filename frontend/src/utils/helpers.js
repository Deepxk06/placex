import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed'
  const fmt = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
    return `₹${n}`
  }
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBg(score) {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
