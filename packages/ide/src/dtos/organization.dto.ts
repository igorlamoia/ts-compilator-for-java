export type OrganizationDTO = {
  id: string
  name: string
}

export function toOrganizationDTO(org: { id: string; name: string }): OrganizationDTO {
  return { id: org.id, name: org.name }
}
