import { useEffect, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { Alert, Button, CircularProgress, Snackbar } from '@mui/material'
import { DeleteSupplierDialog } from '../components/DeleteSupplierDialog'
import { Pagination } from '../components/Pagination'
import { SupplierFormDialog } from '../components/SupplierFormDialog'
import { VirtualSupplierTable } from '../components/VirtualSupplierTable'
import { useAppDispatch, useAppSelector } from '../store'
import { deleteSupplier, fetchSuppliers, PAGE_SIZE } from '../store/suppliersSlice'
import type { Supplier } from '../types'

interface SuppliersViewProps {
  onBack: () => void
}

export function SuppliersView({ onBack }: SuppliersViewProps) {
  const dispatch = useAppDispatch()
  const { data, page, totalElements, totalPages, status, error } = useAppSelector(
    (state) => state.suppliers,
  )
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const request = dispatch(fetchSuppliers({ page: 0, size: PAGE_SIZE }))
    return () => request.abort()
  }, [dispatch])

  function loadPage(nextPage: number) {
    void dispatch(fetchSuppliers({ page: nextPage, size: PAGE_SIZE }))
  }

  async function handleCreated() {
    setFormOpen(false)
    setNotification('El proveedor se agregó correctamente.')
    const result = await dispatch(
      fetchSuppliers({ page: Math.floor(totalElements / PAGE_SIZE), size: PAGE_SIZE }),
    )
    if (
      fetchSuppliers.fulfilled.match(result) &&
      result.payload.totalPages > 0 &&
      result.payload.number !== result.payload.totalPages - 1
    ) {
      loadPage(result.payload.totalPages - 1)
    }
  }

  async function handleDelete() {
    if (!selected || deleting) return
    setDeleting(true)
    setDeleteError(null)
    const result = await dispatch(deleteSupplier(selected.id))
    setDeleting(false)
    if (deleteSupplier.fulfilled.match(result)) {
      setSelected(null)
      setNotification('El proveedor se eliminó correctamente.')
      loadPage(page)
    } else {
      setDeleteError(result.payload?.message || result.error.message || 'No se pudo eliminar el proveedor.')
    }
  }

  const loading = status === 'idle' || status === 'loading'
  const firstItem = totalElements > 0 ? page * PAGE_SIZE + 1 : 0
  const lastItem = Math.min(page * PAGE_SIZE + data.length, totalElements)

  return (
    <div className="suppliers-layout view-enter">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <button type="button" onClick={onBack}>Inicio</button>
        <span aria-hidden="true">/</span>
        <span>Proveedores</span>
      </nav>

      <div className="page-heading">
        <div>
          <div className="eyebrow"><span /> ADMINISTRACIÓN</div>
          <h1>Proveedores<span className="title-dot">.</span></h1>
          <p>Administra y mantén al día la información de tus proveedores.</p>
        </div>
        <div className="page-heading-badge">
          <StorefrontOutlinedIcon />
          <span><small>TU ESPACIO</small>Gestión de proveedores</span>
        </div>
      </div>

      <section className="supplier-card" aria-labelledby="supplier-list-title">
        <div className="table-toolbar">
          <div className="table-heading">
            <div className="table-heading-icon"><Inventory2OutlinedIcon /></div>
            <div>
              <div className="table-heading-title">
                <h2 id="supplier-list-title">Lista de proveedores</h2>
                {status === 'succeeded' && <span className="total-badge">{totalElements}</span>}
              </div>
              <p>Todos tus proveedores, en un solo lugar.</p>
            </div>
          </div>

          <div className="table-actions">
            <Button className="toolbar-action" onClick={() => setFormOpen(true)}>
              <span className="action-icon add-action"><AddRoundedIcon /></span>
              <span>Agregar elemento</span>
            </Button>
            <Button className="toolbar-action" onClick={() => window.print()}>
              <span className="action-icon print-action"><PrintOutlinedIcon /></span>
              <span>Imprimir elemento</span>
            </Button>
          </div>
        </div>

        {status === 'succeeded' && data.length > 0 && (
          <p className="table-scroll-hint">Desliza la tabla horizontalmente para ver más →</p>
        )}

        {loading ? (
          <div className="table-state" role="status">
            <CircularProgress size={30} />
            <span>Cargando proveedores…</span>
          </div>
        ) : status === 'failed' ? (
          <div className="table-state">
            <span className="state-icon"><CloudOffRoundedIcon /></span>
            <strong>No pudimos cargar los proveedores</strong>
            <p role="alert">{error}</p>
            <Button variant="outlined" onClick={() => loadPage(page)}>Reintentar</Button>
          </div>
        ) : data.length === 0 ? (
          <div className="table-state">
            <span className="state-icon"><Inventory2OutlinedIcon /></span>
            <strong>Aún no hay proveedores</strong>
            <p>Agrega el primero para comenzar a gestionar tus registros.</p>
            <Button variant="outlined" onClick={() => setFormOpen(true)}>Agregar proveedor</Button>
          </div>
        ) : (
          <VirtualSupplierTable
            suppliers={data}
            page={page}
            onDelete={(supplier) => {
              setDeleteError(null)
              setSelected(supplier)
            }}
          />
        )}

        <div className="table-footer">
          <div className="table-summary" aria-live="polite">
            {loading ? (
              'Cargando registros…'
            ) : status === 'failed' ? (
              'Lista no disponible'
            ) : totalElements === 0 ? (
              'Sin registros'
            ) : (
              <>Mostrando <strong>{firstItem}–{lastItem}</strong> de <strong>{totalElements}</strong> proveedores</>
            )}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={loading || status === 'failed'}
            onChange={loadPage}
          />
        </div>
      </section>

      <div className="page-bottom">
        <button className="back-link" type="button" onClick={onBack}>
          <ArrowBackRoundedIcon /> Volver al inicio
        </button>
        <span>GESTIONA MEJOR. CONECTA MÁS.</span>
      </div>

      {formOpen && (
        <SupplierFormDialog onClose={() => setFormOpen(false)} onCreated={() => void handleCreated()} />
      )}
      {selected && (
        <DeleteSupplierDialog
          supplier={selected}
          deleting={deleting}
          error={deleteError}
          onClose={() => setSelected(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          variant="filled"
          closeText="Cerrar"
          onClose={() => setNotification(null)}
        >
          {notification}
        </Alert>
      </Snackbar>
    </div>
  )
}
