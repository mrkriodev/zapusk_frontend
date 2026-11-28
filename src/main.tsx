import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import I18nProvider from './i18n/I18nProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </Provider>,
)
