import { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import type { ApplicationInfo } from '../types'

interface AppHeaderProps {
  info: ApplicationInfo | null
  onNavigate: (view: 'welcome' | 'suppliers') => void
}

export function AppHeader({ info, onNavigate }: AppHeaderProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  function navigate(view: 'welcome' | 'suppliers') {
    setMenuAnchor(null)
    onNavigate(view)
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={() => navigate('welcome')}>
          <img className="brand-logo" src="/assets/gapsi-logo.jpg" alt="Logotipo de Gapsi" />
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-product">e-Commerce Gapsi</span>
        </button>

        <div className="header-right">
          <span className="header-context">
            <span className="header-context-dot" />
            Portal de proveedores
          </span>
          <span className="header-divider" aria-hidden="true" />
          <IconButton
            aria-label="Abrir menú de opciones"
            aria-controls={menuAnchor ? 'header-menu' : undefined}
            aria-expanded={Boolean(menuAnchor)}
            aria-haspopup="menu"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            size="small"
            className="header-menu-button"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="header-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{ list: { 'aria-label': 'Opciones de navegación' } }}
          >
            <MenuItem onClick={() => navigate('welcome')}>
              <ListItemIcon><HomeOutlinedIcon fontSize="small" /></ListItemIcon>
              Inicio
            </MenuItem>
            <MenuItem onClick={() => navigate('suppliers')}>
              <ListItemIcon><StorefrontOutlinedIcon fontSize="small" /></ListItemIcon>
              Proveedores
            </MenuItem>
            {info && <MenuItem disabled>Versión {info.version}</MenuItem>}
          </Menu>
        </div>
      </div>
    </header>
  )
}
