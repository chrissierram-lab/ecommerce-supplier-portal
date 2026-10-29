import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { version as reactVersion } from 'react'
import { version as reactDomVersion } from 'react-dom'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import {
  getApplicationInfo,
  getSupplierPage,
  postSupplier,
  removeSupplier,
} from '../api/client'
import { createAppStore } from '../store'
import { fetchSuppliers } from '../store/suppliersSlice'
import type { Supplier, SupplierInput, SupplierPage } from '../types'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>()
  return {
    ...actual,
    getApplicationInfo: vi.fn(),
    getSupplierPage: vi.fn(),
    postSupplier: vi.fn(),
    removeSupplier: vi.fn(),
  }
})

let records: Supplier[]

function renderApp() {
  return render(
    <Provider store={createAppStore()}>
      <ThemeProvider theme={createTheme()}>
        <App />
      </ThemeProvider>
    </Provider>,
  )
}

async function openSuppliers(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /continuar/i }))
  await screen.findByRole('heading', { name: /lista de proveedores/i })
}

describe('e-Commerce Gapsi', () => {
  beforeEach(() => {
    records = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      nombre: `Proveedor ${String(index + 1).padStart(2, '0')}`,
      razonSocial: `Empresa ${index + 1}, S.A.`,
      direccion: `Dirección ${index + 1}`,
    }))

    vi.mocked(getApplicationInfo).mockResolvedValue({
      welcomeMessage: 'Bienvenida desde el servidor',
      version: '2.3.4',
      candidateImage: '/assets/candidate.png',
    })
    vi.mocked(getSupplierPage).mockImplementation(async (page, size) => ({
      content: records.slice(page * size, (page + 1) * size),
      number: page,
      size,
      totalElements: records.length,
      totalPages: Math.ceil(records.length / size),
    }))
    vi.mocked(postSupplier).mockImplementation(async (input: SupplierInput) => {
      if (records.some((supplier) => supplier.nombre === input.nombre)) {
        throw {
          isAxiosError: true,
          response: { status: 409, data: { error: 'El proveedor ya existe en la lista.' } },
        }
      }
      const supplier = { ...input, id: 22 }
      records.push(supplier)
      return supplier
    })
    vi.mocked(removeSupplier).mockImplementation(async (id) => {
      records = records.filter((supplier) => supplier.id !== id)
    })
  })

  it('utiliza React y React DOM 17', () => {
    expect(reactVersion).toMatch(/^17\./)
    expect(reactDomVersion).toMatch(/^17\./)
  })

  it('obtiene bienvenida y versión del backend y pagina mediante Redux', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Bienvenida desde el servidor' })).toBeVisible()
    expect(screen.getByText('versión 2.3.4')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Logotipo de Gapsi' })).toHaveAttribute(
      'src',
      '/assets/gapsi-logo.jpg',
    )
    expect(screen.getByRole('img', { name: 'Imagen del candidato' })).toHaveAttribute(
      'src',
      '/assets/candidate.png',
    )
    await openSuppliers(user)
    expect(await screen.findByText('Proveedor 01')).toBeVisible()
    expect(vi.mocked(getSupplierPage)).toHaveBeenCalledWith(0, 10, expect.any(AbortSignal))

    await user.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(await screen.findByText('Proveedor 11')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    expect(vi.mocked(getSupplierPage)).toHaveBeenCalledWith(1, 10, expect.any(AbortSignal))
  })

  it('muestra el logotipo del examen si falla la imagen del candidato', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      renderApp()
      await screen.findByRole('heading', { name: 'Bienvenida desde el servidor' })
      fireEvent.error(screen.getByRole('img', { name: 'Imagen del candidato' }))
      const welcome = screen.getByRole('region', { name: 'Bienvenida desde el servidor' })
      expect(within(welcome).getByRole('img', { name: 'Logotipo de Gapsi' })).toHaveAttribute(
        'src',
        '/assets/gapsi-logo.jpg',
      )
      expect(warning).toHaveBeenCalledOnce()
    } finally {
      warning.mockRestore()
    }
  })

  it('virtualiza las filas, permite desplazarse y muestra toda la página al imprimir', async () => {
    const user = userEvent.setup()
    renderApp()
    await openSuppliers(user)
    await screen.findByText('Proveedor 01')

    expect(screen.queryByText('Proveedor 10')).not.toBeInTheDocument()
    const scrollRegion = screen.getByRole('region', { name: /lista de proveedores desplazable/i })
    scrollRegion.scrollTop = 340
    fireEvent.scroll(scrollRegion)
    expect(await screen.findByText('Proveedor 10')).toBeVisible()
    expect(screen.queryByText('Proveedor 01')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('beforeprint'))
    })
    expect(screen.getByText('Proveedor 01')).toBeInTheDocument()
    expect(screen.getByText('Proveedor 10')).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new Event('afterprint'))
    })
  })

  it('conserva el formulario ante un 409 y permite crear después un proveedor', async () => {
    const user = userEvent.setup()
    renderApp()
    await openSuppliers(user)
    await screen.findByText('Proveedor 01')
    await user.click(screen.getByRole('button', { name: /agregar elemento/i }))

    const dialog = screen.getByRole('dialog', { name: /agregar proveedor/i })
    const name = within(dialog).getByLabelText(/^nombre/i)
    await user.type(name, '  Proveedor 01  ')
    await user.type(within(dialog).getByLabelText(/^razón social/i), ' Empresa Nueva ')
    await user.type(within(dialog).getByLabelText(/^dirección/i), ' Calle 100 ')
    await user.click(within(dialog).getByRole('button', { name: /guardar proveedor/i }))

    expect(await within(dialog).findByText('El proveedor ya existe en la lista.')).toBeVisible()
    expect(name).toHaveValue('  Proveedor 01  ')
    expect(vi.mocked(postSupplier)).toHaveBeenCalledWith(
      { nombre: 'Proveedor 01', razonSocial: 'Empresa Nueva', direccion: 'Calle 100' },
      expect.any(AbortSignal),
    )

    await user.clear(name)
    await user.type(name, 'Proveedor nuevo')
    await user.click(within(dialog).getByRole('button', { name: /guardar proveedor/i }))
    expect(await screen.findByText('El proveedor se agregó correctamente.')).toBeVisible()
    expect(await screen.findByText('Proveedor nuevo')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('valida campos vacíos antes de enviar el formulario', async () => {
    const user = userEvent.setup()
    renderApp()
    await openSuppliers(user)
    await user.click(screen.getByRole('button', { name: /agregar elemento/i }))
    const dialog = screen.getByRole('dialog', { name: /agregar proveedor/i })
    await user.click(within(dialog).getByRole('button', { name: /guardar proveedor/i }))

    expect(within(dialog).getByText('Ingresa el nombre del proveedor.')).toBeVisible()
    expect(within(dialog).getByText('Ingresa la razón social.')).toBeVisible()
    expect(within(dialog).getByText('Ingresa la dirección.')).toBeVisible()
    expect(vi.mocked(postSupplier)).not.toHaveBeenCalled()
  })

  it('confirma la eliminación y vuelve a una página válida si desaparece la última', async () => {
    const user = userEvent.setup()
    renderApp()
    await openSuppliers(user)
    await screen.findByText('Proveedor 01')
    await user.click(screen.getByRole('button', { name: 'Última página' }))
    expect(await screen.findByText('Proveedor 21')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Eliminar Proveedor 21' }))

    const dialog = screen.getByRole('dialog', { name: 'Eliminar proveedor' })
    expect(within(dialog).getByText(/esta acción no se puede deshacer/i)).toBeVisible()
    expect(vi.mocked(removeSupplier)).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('El proveedor se eliminó correctamente.')).toBeVisible()
    expect(await screen.findByText('Proveedor 11')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    expect(vi.mocked(removeSupplier)).toHaveBeenCalledWith(21, expect.any(AbortSignal))
    expect(vi.mocked(getSupplierPage)).toHaveBeenCalledWith(2, 10, expect.any(AbortSignal))
    expect(vi.mocked(getSupplierPage)).toHaveBeenCalledWith(1, 10, expect.any(AbortSignal))
  })

  it('presenta errores de conexión y permite reintentar', async () => {
    const user = userEvent.setup()
    vi.mocked(getApplicationInfo).mockRejectedValueOnce({ isAxiosError: true })
    renderApp()
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible conectar con el servidor')
    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Bienvenida desde el servidor' })).toBeVisible()
    })
  })

  it('mantiene la confirmación abierta cuando falla una eliminación', async () => {
    const user = userEvent.setup()
    vi.mocked(removeSupplier).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { error: 'El proveedor ya no existe.' } },
    })
    renderApp()
    await openSuppliers(user)
    await screen.findByText('Proveedor 01')
    await user.click(screen.getByRole('button', { name: 'Eliminar Proveedor 01' }))
    const dialog = screen.getByRole('dialog', { name: 'Eliminar proveedor' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(await within(dialog).findByText('El proveedor ya no existe.')).toBeVisible()
    expect(dialog).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog', { name: 'Eliminar proveedor' })).not.toBeInTheDocument()
  })

  it('ignora respuestas de páginas anteriores que llegan fuera de orden', async () => {
    let resolveFirst!: (value: SupplierPage) => void
    let resolveSecond!: (value: SupplierPage) => void
    const first = new Promise<SupplierPage>((resolve) => { resolveFirst = resolve })
    const second = new Promise<SupplierPage>((resolve) => { resolveSecond = resolve })
    vi.mocked(getSupplierPage)
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() => second)
    const store = createAppStore()
    const firstRequest = store.dispatch(fetchSuppliers({ page: 0, size: 10 }))
    const secondRequest = store.dispatch(fetchSuppliers({ page: 1, size: 10 }))

    resolveSecond({
      content: records.slice(10, 20),
      number: 1,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    })
    await secondRequest
    resolveFirst({
      content: records.slice(0, 10),
      number: 0,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    })
    await firstRequest

    expect(store.getState().suppliers.page).toBe(1)
    expect(store.getState().suppliers.data[0]?.nombre).toBe('Proveedor 11')
  })
})
