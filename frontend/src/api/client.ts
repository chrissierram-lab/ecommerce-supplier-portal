import axios from 'axios'
import type {
  ApiProblem,
  ApplicationInfo,
  Supplier,
  SupplierInput,
  SupplierPage,
} from '../types'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: { Accept: 'application/json' },
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isApplicationInfo(value: unknown): value is ApplicationInfo {
  return (
    isRecord(value) &&
    typeof value.welcomeMessage === 'string' &&
    typeof value.version === 'string' &&
    (value.candidateImage === undefined ||
      value.candidateImage === null ||
      typeof value.candidateImage === 'string')
  )
}

function isSupplier(value: unknown): value is Supplier {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    typeof value.nombre === 'string' &&
    typeof value.razonSocial === 'string' &&
    typeof value.direccion === 'string' &&
    (value.fechaCreacion === undefined || typeof value.fechaCreacion === 'string')
  )
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isSupplierPage(value: unknown): value is SupplierPage {
  return (
    isRecord(value) &&
    Array.isArray(value.content) &&
    value.content.every(isSupplier) &&
    isNonNegativeInteger(value.number) &&
    isNonNegativeInteger(value.size) &&
    value.size > 0 &&
    isNonNegativeInteger(value.totalElements) &&
    isNonNegativeInteger(value.totalPages)
  )
}

export function toApiProblem(error: unknown): ApiProblem {
  if (axios.isAxiosError(error)) {
    const response = error.response
    const body: unknown = response?.data
    const serverMessage =
      isRecord(body) && typeof body.error === 'string' ? body.error : undefined

    if (response) {
      return {
        message:
          serverMessage ||
          `No se pudo completar la solicitud (HTTP ${response.status}).`,
        status: response.status,
      }
    }

    return {
      message: 'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
    }
  }

  return {
    message:
      error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  }
}

export async function getApplicationInfo(signal: AbortSignal): Promise<ApplicationInfo> {
  const { data } = await client.get<unknown>('/api/info', { signal })
  if (!isApplicationInfo(data)) {
    throw new Error('La información recibida del servidor no tiene el formato esperado.')
  }
  return data
}

export async function getSupplierPage(
  page: number,
  size: number,
  signal: AbortSignal,
): Promise<SupplierPage> {
  const { data } = await client.get<unknown>('/api/suppliers', {
    params: { page, size },
    signal,
  })
  if (!isSupplierPage(data)) {
    throw new Error('La lista recibida del servidor no tiene el formato esperado.')
  }
  return data
}

export async function postSupplier(input: SupplierInput, signal: AbortSignal): Promise<Supplier> {
  const { data } = await client.post<unknown>('/api/suppliers', input, { signal })
  if (!isSupplier(data)) {
    throw new Error('El proveedor recibido del servidor no tiene el formato esperado.')
  }
  return data
}

export async function removeSupplier(id: number, signal: AbortSignal): Promise<void> {
  await client.delete(`/api/suppliers/${id}`, { signal })
}
