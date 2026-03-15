export type UserDTO = {
  id: number
  name: string
  email: string
  role: string
  organizationId: number
  avatarUrl: string | null
  bio: string | null
}

export function toUserDTO(user: {
  id: number
  name: string
  email: string
  role: string
  organizationId: number
  avatarUrl?: string | null
  bio?: string | null
}): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
  }
}
