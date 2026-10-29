export interface ApplicationInfo {
  welcomeMessage: string
  version: string
  candidateImage?: string | null
}

export interface Supplier {
  id: number
  nombre: string
  razonSocial: string
  direccion: string
  fechaCreacion?: string
}

export interface SupplierInput {
  nombre: string
  razonSocial: string
  direccion: string
}

export interface SupplierPage {
  content: Supplier[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiProblem {
  message: string
  status?: number
}
