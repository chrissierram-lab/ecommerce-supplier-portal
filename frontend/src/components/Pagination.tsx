import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded'
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded'
import { IconButton } from '@mui/material'

interface PaginationProps {
  page: number
  totalPages: number
  disabled: boolean
  onChange: (page: number) => void
}

function visiblePages(current: number, total: number): Array<number | 'start' | 'end'> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1)

  const firstMiddle = Math.max(2, Math.min(current - 1, total - 3))
  const lastMiddle = Math.min(total - 1, firstMiddle + 2)
  const pages: Array<number | 'start' | 'end'> = [1]
  if (firstMiddle > 2) pages.push('start')
  for (let index = firstMiddle; index <= lastMiddle; index += 1) pages.push(index)
  if (lastMiddle < total - 1) pages.push('end')
  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, disabled, onChange }: PaginationProps) {
  const pageCount = Math.max(1, totalPages)
  const current = page + 1
  const isFirst = page <= 0
  const isLast = totalPages === 0 || current >= totalPages

  return (
    <nav className="pagination-controls" aria-label="Paginación de proveedores">
      <IconButton
        aria-label="Primera página"
        size="small"
        disabled={disabled || isFirst}
        onClick={() => onChange(0)}
      >
        <FirstPageRoundedIcon />
      </IconButton>
      <IconButton
        aria-label="Página anterior"
        size="small"
        disabled={disabled || isFirst}
        onClick={() => onChange(page - 1)}
      >
        <KeyboardDoubleArrowLeftRoundedIcon />
      </IconButton>
      <span className="pagination-divider" aria-hidden="true" />
      {visiblePages(current, pageCount).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            className={`page-number${item === current ? ' is-current' : ''}`}
            type="button"
            aria-label={`Página ${item}`}
            aria-current={item === current ? 'page' : undefined}
            disabled={disabled || totalPages === 0}
            onClick={() => onChange(item - 1)}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="page-ellipsis" aria-hidden="true">…</span>
        ),
      )}
      <span className="pagination-divider" aria-hidden="true" />
      <IconButton
        aria-label="Página siguiente"
        size="small"
        disabled={disabled || isLast}
        onClick={() => onChange(page + 1)}
      >
        <KeyboardDoubleArrowRightRoundedIcon />
      </IconButton>
      <IconButton
        aria-label="Última página"
        size="small"
        disabled={disabled || isLast}
        onClick={() => onChange(totalPages - 1)}
      >
        <LastPageRoundedIcon />
      </IconButton>
    </nav>
  )
}
