export const isProfileComplete = (user) => {
  if (!user) return false

  if (typeof user.isProfileComplete === 'boolean') {
    return user.isProfileComplete
  }

  const hasUsername = typeof user.username === 'string' && user.username.trim().length >= 3
  const hasBio = typeof user.bio === 'string' && user.bio.trim().length >= 20
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0
  const hasAvatar = typeof user.avatar === 'string' && user.avatar.trim().length > 0

  return hasUsername && hasBio && hasSkills && hasAvatar
}
