import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { IconButton, Tooltip } from '@mui/material'
import type { Supplier } from '../types'

const ROW_HEIGHT = 68
const HEADER_HEIGHT = 52
const VIEWPORT_HEIGHT = 408
const OVERSCAN = 2
const STATUS_COLORS = ['sky', 'mint', 'violet', 'amber', 'rose']

interface VirtualSupplierTableProps {
  suppliers: Supplier[]
  page: number
  onDelete: (supplier: Supplier) => void
}

export function VirtualSupplierTable({ suppliers, page, onDelete }: VirtualSupplierTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0
    setScrollTop(0)
  }, [page])

  useEffect(() => {
    const beforePrint = () => flushSync(() => setPrinting(true))
    const afterPrint = () => setPrinting(false)
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  const start = printing
    ? 0
    : Math.min(
        Math.max(0, suppliers.length - 1),
        Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN),
      )
  const end = printing
    ? suppliers.length
    : Math.min(
        suppliers.length,
        Math.ceil((scrollTop + VIEWPORT_HEIGHT - HEADER_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
      )
  const topSpace = start * ROW_HEIGHT
  const bottomSpace = (suppliers.length - end) * ROW_HEIGHT

  return (
    <div
      className="table-scroll"
      ref={containerRef}
      role="region"
      aria-label="Lista de proveedores desplazable"
      tabIndex={0}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <table className="suppliers-table" aria-rowcount={suppliers.length + 1}>
        <colgroup>
          <col className="status-column" />
          <col className="name-column" />
          <col className="business-column" />
          <col className="address-column" />
          <col className="actions-column" />
        </colgroup>
        <thead>
          <tr aria-rowindex={1}>
            <th scope="col">Estado</th>
            <th scope="col">Nombre</th>
            <th scope="col">Razón social</th>
            <th scope="col">Dirección</th>
            <th scope="col" className="actions-cell">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {topSpace > 0 && (
            <tr aria-hidden="true" className="virtual-spacer" style={{ height: topSpace }}>
              <td colSpan={5} />
            </tr>
          )}
          {suppliers.slice(start, end).map((supplier, index) => (
            <tr key={supplier.id} aria-rowindex={start + index + 2}>
              <td>
                <div className="status-cell">
                  <span
                    className={`status-indicator ${STATUS_COLORS[supplier.id % STATUS_COLORS.length]}`}
                    aria-hidden="true"
                  />
                  <span className="supplier-id">#{String(supplier.id).padStart(3, '0')}</span>
                </div>
              </td>
              <td><div className="cell-text supplier-name" title={supplier.nombre}>{supplier.nombre}</div></td>
              <td><div className="cell-text" title={supplier.razonSocial}>{supplier.razonSocial}</div></td>
              <td><div className="cell-text" title={supplier.direccion}>{supplier.direccion}</div></td>
              <td className="actions-cell">
                <Tooltip title="Eliminar proveedor">
                  <IconButton
                    aria-label={`Eliminar ${supplier.nombre}`}
                    size="small"
                    className="delete-row-button"
                    onClick={() => onDelete(supplier)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
          {bottomSpace > 0 && (
            <tr aria-hidden="true" className="virtual-spacer" style={{ height: bottomSpace }}>
              <td colSpan={5} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
