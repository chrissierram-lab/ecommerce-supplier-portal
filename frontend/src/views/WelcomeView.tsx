import { useEffect, useState } from 'react'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { Alert, Button, Skeleton } from '@mui/material'
import type { ApplicationInfo } from '../types'

interface WelcomeViewProps {
  info: ApplicationInfo | null
  loading: boolean
  error: string | null
  onContinue: () => void
  onRetry: () => void
}

const FALLBACK_LOGO = '/assets/gapsi-logo.jpg'

export function WelcomeView({ info, loading, error, onContinue, onRetry }: WelcomeViewProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [info?.candidateImage])

  const image = !imageFailed && info?.candidateImage
    ? info.candidateImage
    : FALLBACK_LOGO

  return (
    <div className="welcome-layout view-enter">
      <div className="welcome-heading">
        <span className="eyebrow"><span /> TU ESPACIO DE TRABAJO</span>
        <p>Todo comienza con una buena conexión.</p>
      </div>

      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-card-accent" />
        <div className="welcome-card-content">
          <div className="welcome-avatar-frame">
            <div className="welcome-avatar">
              <img
                src={image}
                className={image === FALLBACK_LOGO ? 'welcome-logo' : undefined}
                alt={image === FALLBACK_LOGO ? 'Logotipo de Gapsi' : 'Imagen del candidato'}
                onError={() => {
                  if (image === FALLBACK_LOGO) {
                    console.error('No se pudo cargar el logotipo de Gapsi.')
                  } else {
                    console.warn('No se pudo cargar la imagen del candidato; se mostrará el logotipo de Gapsi.')
                    setImageFailed(true)
                  }
                }}
              />
            </div>
            <span className="avatar-sparkle" aria-hidden="true">
              <AutoAwesomeRoundedIcon />
            </span>
          </div>

          <div className="welcome-kicker">¡QUÉ GUSTO VERTE!</div>
          {loading && !info ? (
            <Skeleton
              id="welcome-title"
              variant="text"
              width="70%"
              height={56}
              aria-label="Cargando bienvenida"
            />
          ) : info ? (
            <h1 id="welcome-title">{info.welcomeMessage}</h1>
          ) : (
            <h1 id="welcome-title">Bienvenido a Gapsi</h1>
          )}
          <p className="welcome-description">
            Un lugar para conectar y administrar a tus proveedores de manera simple y eficiente.
          </p>

          {error && (
            <Alert
              severity="error"
              className="welcome-error"
              action={<Button color="inherit" size="small" onClick={onRetry}>Reintentar</Button>}
            >
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            className="continue-button"
            onClick={onContinue}
            endIcon={<ArrowForwardRoundedIcon />}
            disableElevation
          >
            Continuar
          </Button>
          <span className="welcome-button-note">IR A MIS PROVEEDORES</span>
        </div>
        <div className="welcome-card-footer">
          <span className="footer-identity"><span /> HECHO PARA CONECTAR</span>
          <span>
            {info ? `versión ${info.version}` : loading ? 'Cargando versión…' : 'versión no disponible'}
          </span>
        </div>
      </section>

      <div className="welcome-bottom-note">
        <span className="note-line" />
        UNA MEJOR FORMA DE TRABAJAR
        <span className="note-line" />
      </div>
    </div>
  )
}
