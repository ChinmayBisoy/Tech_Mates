import { formatDistanceToNow, format, isBefore, isValid } from 'date-fns'

const toValidDate = (value) => {
  const parsed = new Date(value)
  return isValid(parsed) ? parsed : null
}

export const formatDate = (date) => {
  const parsed = toValidDate(date)
  return parsed ? format(parsed, 'dd MMM yyyy') : '-'
}

export const formatRelative = (date) => {
  const parsed = toValidDate(date)
  return parsed ? formatDistanceToNow(parsed, { addSuffix: true }) : '-'
}

export const formatAbsolute = (date) => {
  const parsed = toValidDate(date)
  return parsed ? format(parsed, 'dd MMM yyyy') : '-'
}

export const formatTime = (date) => {
  const parsed = toValidDate(date)
  return parsed ? format(parsed, 'HH:mm') : '-'
}

export const formatDateTime = (date) => {
  const parsed = toValidDate(date)
  return parsed ? format(parsed, 'dd MMM yyyy HH:mm') : '-'
}

export const formatDeadline = (deadline) => {
  const deadline_date = toValidDate(deadline)
  if (!deadline_date) {
    return '-'
  }

  const today = new Date()

  if (isBefore(deadline_date, today)) {
    const overdueDays = Math.floor(
      (today - deadline_date) / (1000 * 60 * 60 * 24)
    )
    return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`
  }

  const distance = formatDistanceToNow(deadline_date)
  return `${distance} left`
}
