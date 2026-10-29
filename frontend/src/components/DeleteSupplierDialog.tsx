import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import type { Supplier } from '../types'

interface DeleteSupplierDialogProps {
  supplier: Supplier
  deleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSupplierDialog({
  supplier,
  deleting,
  error,
  onClose,
  onConfirm,
}: DeleteSupplierDialogProps) {
  return (
    <Dialog
      open
      onClose={deleting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
    >
      <DialogTitle id="delete-title" className="delete-dialog-title">
        <span className="delete-dialog-icon"><DeleteOutlineRoundedIcon /></span>
        Eliminar proveedor
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-description">
          ¿Deseas eliminar a <strong>{supplier.nombre}</strong>? Esta acción no se puede deshacer.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button color="inherit" disabled={deleting} onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="error" disabled={deleting} onClick={onConfirm} disableElevation>
          {deleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
