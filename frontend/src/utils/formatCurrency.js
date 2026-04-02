export const formatINR = (paise) => {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees)
}

export const formatPriceShort = (paise) => {
  const rupees = paise / 100
  if (rupees >= 1000000) {
    return `₹${(rupees / 1000000).toFixed(1)}Cr`
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`
  }
  return `₹${rupees.toFixed(0)}`
}
