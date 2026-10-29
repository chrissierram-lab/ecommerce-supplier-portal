import { StrictMode } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import App from './App'
import { createAppStore } from './store'
import './styles.css'

const theme = createTheme({
  palette: {
    primary: { main: '#0088cc' },
    error: { main: '#df4f3d' },
    text: { primary: '#20334c', secondary: '#77879a' },
    background: { default: '#f5f8fc' },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento raíz de la aplicación.')

render(
  <StrictMode>
    <Provider store={createAppStore()}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
  rootElement,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js').catch((error: unknown) => {
      console.error('No se pudo registrar el service worker.', error)
    })
  })
}
