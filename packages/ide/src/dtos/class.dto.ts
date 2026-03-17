import type { UserDTO } from './user.dto'
import { toUserDTO } from './user.dto'

export type ClassDTO = {
  id: number
  name: string
  description: string
  accessCode: string
  status: string
  createdAt: Date
  organizationId: number
  teacherId: number
  teacher?: UserDTO
  _count?: { members: number; exercises: number }
}

export function toClassDTO(cls: {
  id: number
  name: string
  description: string
  accessCode: string
  status: string
  createdAt: Date
  organizationId: number
  teacherId: number
  teacher?: {
    id: number
    name: string
    email: string
    role: string
    organizationId: number
    avatarUrl?: string | null
    bio?: string | null
    [key: string]: unknown
  } | null
  _count?: { members: number; exercises?: number; exerciseLists?: number }
}): ClassDTO {
  return {
    id: cls.id,
    name: cls.name,
    description: cls.description,
    accessCode: cls.accessCode,
    status: cls.status,
    createdAt: cls.createdAt,
    organizationId: cls.organizationId,
    teacherId: cls.teacherId,
    ...(cls.teacher ? { teacher: toUserDTO(cls.teacher) } : {}),
    ...(cls._count ? { _count: { members: cls._count.members, exercises: cls._count.exercises ?? cls._count.exerciseLists ?? 0 } } : {}),
  }
}
