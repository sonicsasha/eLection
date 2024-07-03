import { useEffect, useState } from 'react'
import * as lobbyService from '../services/lobbyHostService'
import { Authentication } from './host/Authentication'
import CreateElectionForm from './host/CreateElectionForm'
import { useNavigate } from 'react-router'

export const Host = () => {
	const [lobbyCode, setLobbyCode] = useState<string | null>(null)
	const navigate = useNavigate()

	const handleCloseLobbyClick = async () => {
		const confirmLobbyClose = window.confirm('Are you sure you want to close this lobby?')
		if (!confirmLobbyClose) return
	
		await lobbyService.closeLobby()
		window.alert('The lobby has been succesfully closed')
		navigate('/')
	}

	// Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
	// This is why lobbyCode is also saved to a state, as otherwise it may cause bugs in development mode.
	useEffect(() => {
		const initLobby = async () => {
			setLobbyCode(null)
			try {
				await lobbyService.validateInfoFromStorage()
				setLobbyCode(lobbyService.getLobbyCode())
			} catch {
				lobbyService.clearSavedInfo()
				lobbyService.createLobby().then(() => {
					setLobbyCode(lobbyService.getLobbyCode())
				})
			}
		}
		initLobby()
	}, [])

	if (lobbyCode === null) return <a>Loading...</a>

	return ( 
    <>
        <Authentication lobbyCode={lobbyCode} />
        <CreateElectionForm />
		<br />
        <button onClick={() => window.open('/viewer', '_blank', 'popup=true')}>Open the viewer window</button>
		<button onClick={handleCloseLobbyClick} data-testid='close-lobby' style={{backgroundColor: 'red'}}>Close lobby</button>
    </>
    )
}
