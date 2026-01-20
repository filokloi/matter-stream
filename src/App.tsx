import { SettingsProvider } from './contexts/SettingsContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { AppLayout } from './components/layout/AppLayout';
import './styles/globals.css'

function App() {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <AppLayout />
      </HistoryProvider>
    </SettingsProvider>
  )
}

export default App
