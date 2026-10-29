import { useState } from 'react'
import type { FormEvent } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material'
import { useAppDispatch } from '../store'
import { createSupplier } from '../store/suppliersSlice'
import type { SupplierInput } from '../types'

interface SupplierFormDialogProps {
  onClose: () => void
  onCreated: () => void
}

const initialValues: SupplierInput = { nombre: '', razonSocial: '', direccion: '' }

export function SupplierFormDialog({ onClose, onCreated }: SupplierFormDialogProps) {
  const dispatch = useAppDispatch()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierInput, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof SupplierInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const trimmed = {
      nombre: values.nombre.trim(),
      razonSocial: values.razonSocial.trim(),
      direccion: values.direccion.trim(),
    }
    const nextErrors: Partial<Record<keyof SupplierInput, string>> = {}
    if (!trimmed.nombre) nextErrors.nombre = 'Ingresa el nombre del proveedor.'
    if (!trimmed.razonSocial) nextErrors.razonSocial = 'Ingresa la razón social.'
    if (!trimmed.direccion) nextErrors.direccion = 'Ingresa la dirección.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setServerError(null)
    const result = await dispatch(createSupplier(trimmed))
    setSubmitting(false)
    if (createSupplier.fulfilled.match(result)) {
      onCreated()
    } else {
      setServerError(result.payload?.message || result.error.message || 'No se pudo crear el proveedor.')
    }
  }

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="supplier-form-title"
    >
      <form onSubmit={submit} noValidate>
        <DialogTitle id="supplier-form-title" className="dialog-heading">
          <span className="dialog-icon"><PersonAddAlt1RoundedIcon /></span>
          <span>Agregar proveedor<small>Completa la información para crear un nuevo registro.</small></span>
          <IconButton aria-label="Cerrar" onClick={onClose} disabled={submitting} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="supplier-form-content">
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Nombre"
            placeholder="Ej. Distribuidora del Centro"
            value={values.nombre}
            onChange={(event) => update('nombre', event.target.value)}
            error={Boolean(errors.nombre)}
            helperText={errors.nombre}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Razón Social"
            placeholder="Ej. Distribuidora del Centro, S.A. de C.V."
            value={values.razonSocial}
            onChange={(event) => update('razonSocial', event.target.value)}
            error={Boolean(errors.razonSocial)}
            helperText={errors.razonSocial}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            required
            fullWidth
          />
          <TextField
            label="Dirección"
            placeholder="Ej. Av. Reforma 100, Ciudad de México"
            value={values.direccion}
            onChange={(event) => update('direccion', event.target.value)}
            error={Boolean(errors.direccion)}
            helperText={errors.direccion}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            required
            fullWidth
          />
          <p className="required-note">* Campos obligatorios</p>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={onClose} disabled={submitting} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={submitting} disableElevation>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Guardar proveedor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
