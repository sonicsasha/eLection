import { Navigate, Route, Routes } from 'react-router'
import { Home } from './routes/Home' 
import { SetParticipantViewContextProvider } from './context/ContextProviders'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Loading from './elements/Loading'
import Popup from './elements/Popup'
import Topbar from './elements/Topbar'
import './App.css'
import './style.css'


const Host = lazy(() => import('./routes/Host'))
const ParticipantView = lazy(() => import('./routes/Participant')) 
const Viewer = lazy(() => import('./routes/Viewer')) 



function App() {
	const {t, i18n} = useTranslation()

	useEffect(() => {
		document.title = t('pageTitle')
	})

	if (i18n.language !== i18n.resolvedLanguage) i18n.changeLanguage(i18n.resolvedLanguage)

	return (
		<>
			<Popup/>
			<Topbar />

			<div className='mainContainer'>
				<Suspense fallback={<Loading>
					<a>{t('status.loadingFiles')}</a>
				</Loading>
				}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/host" element={
							<Host />} />
						<Route path='/viewer' element={
							<div className='viewerContainer'>
								<Viewer />
							</div>} />
						<Route
							path="/participant"
							element={
								<SetParticipantViewContextProvider>
									<ParticipantView />
								</SetParticipantViewContextProvider>
							}
						/>
						<Route
							//If none of the paths match, navigate back to main menu. 
							path='*'
							element={<Navigate to='/' replace />}
						/>
					</Routes>
				</Suspense>
			</div>
		</>
	)
}

export default App
