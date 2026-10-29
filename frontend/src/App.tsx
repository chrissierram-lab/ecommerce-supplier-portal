import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { useAppDispatch, useAppSelector } from './store'
import { fetchApplicationInfo } from './store/infoSlice'
import { SuppliersView } from './views/SuppliersView'
import { WelcomeView } from './views/WelcomeView'

type View = 'welcome' | 'suppliers'

export default function App() {
  const dispatch = useAppDispatch()
  const { data: info, status, error } = useAppSelector((state) => state.info)
  const [view, setView] = useState<View>('welcome')

  useEffect(() => {
    const request = dispatch(fetchApplicationInfo())
    return () => request.abort()
  }, [dispatch])

  useEffect(() => {
    document.title = view === 'suppliers' ? 'Proveedores | e-Commerce Gapsi' : 'e-Commerce Gapsi'
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view])

  return (
    <div className="app-shell">
      <AppHeader info={info} onNavigate={setView} />
      <main className="app-main">
        {view === 'welcome' ? (
          <WelcomeView
            info={info}
            loading={status === 'idle' || status === 'loading'}
            error={error}
            onContinue={() => setView('suppliers')}
            onRetry={() => void dispatch(fetchApplicationInfo())}
          />
        ) : (
          <SuppliersView onBack={() => setView('welcome')} />
        )}
      </main>
      <footer className="app-footer">
        <span><strong>gapsi.</strong> &nbsp;·&nbsp; e-Commerce Gapsi</span>
        <span>Hecho para conectar negocios</span>
      </footer>
    </div>
  )
}
