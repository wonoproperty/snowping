// Utility functions for time formatting and relative time calculation

export const getRelativeTime = (timestamp) => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMs = now - past
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes === 1) {
    return '1 minute ago'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours === 1) {
    return '1 hour ago'
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else if (diffInDays === 1) {
    return '1 day ago'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }
}

export const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

export const formatDateTimeWithRelative = (timestamp) => {
  const formatted = formatDateTime(timestamp)
  const relative = getRelativeTime(timestamp)
  return `${formatted}, ${relative}`
}