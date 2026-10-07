export type AppRole = 'admin' | 'member' | 'visitor'

const ROLE_LEVEL: Record<AppRole, number> = {
  visitor: 0,
  member: 1,
  admin: 2,
}

export function roleLevel(role: string | null | undefined): number {
  if (!role || !(role in ROLE_LEVEL)) return 0
  return ROLE_LEVEL[role as AppRole]
}

export function hasPermission(role: string | null | undefined, requiredRole: string): boolean {
  return roleLevel(role) >= roleLevel(requiredRole)
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin'
}

export function isMemberRole(role: string | null | undefined): boolean {
  return role === 'member' || role === 'admin'
}
