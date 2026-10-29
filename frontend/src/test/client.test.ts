import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getApplicationInfo, getSupplierPage, toApiProblem } from '../api/client'

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    default: {
      create: () => client,
      isAxiosError: actual.default.isAxiosError,
    },
  }
})

describe('contrato de la API', () => {
  beforeEach(() => {
    client.get.mockReset()
  })

  it('acepta la información requerida y una imagen opcional nula', async () => {
    client.get.mockResolvedValueOnce({
      data: { welcomeMessage: 'Hola', version: '0.0.1', candidateImage: null },
    })
    await expect(getApplicationInfo(new AbortController().signal)).resolves.toEqual({
      welcomeMessage: 'Hola',
      version: '0.0.1',
      candidateImage: null,
    })
  })

  it('rechaza respuestas de información o páginas con formato inválido', async () => {
    client.get.mockResolvedValueOnce({ data: { version: '0.0.1' } })
    await expect(getApplicationInfo(new AbortController().signal)).rejects.toThrow(
      'La información recibida del servidor no tiene el formato esperado.',
    )
    client.get.mockResolvedValueOnce({
      data: {
        content: [{ id: 'no-numérico', nombre: 'A', razonSocial: 'B', direccion: 'C' }],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    })
    await expect(getSupplierPage(0, 10, new AbortController().signal)).rejects.toThrow(
      'La lista recibida del servidor no tiene el formato esperado.',
    )
  })

  it('conserva el mensaje y el estado de un conflicto del backend', () => {
    expect(toApiProblem({
      isAxiosError: true,
      response: { status: 409, data: { error: 'Nombre duplicado.' } },
    })).toEqual({ status: 409, message: 'Nombre duplicado.' })
  })
})
