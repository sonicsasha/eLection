import './App.css'
import './style.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home' 
import { SetParticipantViewContextProvider } from './Contexts'
import icon from '../src/img/icon.svg'
import { lazy, Suspense } from 'react'

const Host = lazy(() => import('./routes/Host'))
const ParticipantView = lazy(() => import('./routes/Participant')) 
const Viewer = lazy(() => import('./routes/Viewer')) 

function App() {
	return (
		<>
			<div className='topbar'>
				<div>
					<img className='mainIcon' width={50} height={50} src={icon} />
				</div>
				
			</div>
			<div className='mainContainer'>
				<Suspense fallback={<a>Loading files...</a>}>
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
					</Routes>
				</Suspense>
			</div>
		</>
	)
}

export default App
