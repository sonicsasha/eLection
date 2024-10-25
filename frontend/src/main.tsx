import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Globals } from '@react-spring/web'
import { PopupContextProvider } from './context/ContextProviders.tsx'
import './index.css'
import './i18n.ts'

if (import.meta.env.VITE_SKIP_ANIMATIONS) {
	console.log('Skipping animations...')
	// This will force React Spring to skip animations
	Globals.assign({skipAnimation: true})
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<PopupContextProvider>
				<App />
			</PopupContextProvider>
		</BrowserRouter>
	</React.StrictMode>
)
