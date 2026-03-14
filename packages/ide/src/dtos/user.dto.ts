export type UserDTO = {
  id: string
  name: string
  email: string
  role: string
  organizationId: string
  avatarUrl: string | null
  bio: string | null
}

export function toUserDTO(user: {
  id: string
  name: string
  email: string
  role: string
  organizationId: string
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
