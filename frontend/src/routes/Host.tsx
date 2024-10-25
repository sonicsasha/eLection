import { useContext, useEffect, useRef, useState } from 'react'
import * as lobbyService from '../services/lobbyHostService'
import { Authentication } from './host/Authentication'
import CreateElectionForm from './host/CreateElectionForm'
import { useNavigate } from 'react-router'
import linkIcon from '/img/icons/link.svg'
import './Host.css'
import Loading from '../elements/Loading'
import { PopupContext } from '../context/Contexts'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'

/**
 * The host's view
 */
const Host = () => {
	const [lobbyCode, setLobbyCode] = useState<string | null>(null)
	const navigate = useNavigate()
	const {createPopup} = useContext(PopupContext)
	const lobbyInitialised = useRef<boolean>(false)

	const {t} = useTranslation()

	/**
	 * Called when the user clicks 'Close lobby'. First tries to confirm the action with the user, then tries to send the lobby closure request to the backend.
	 * If succesful, shows the user an alert and throws the user back to the main menu.
	 */
	const handleCloseLobbyClick = async () => {
		createPopup({type: 'confirm', message: t('hostInstructions.closeLobbyConfirm'), onConfirm: async () => {
			await lobbyService.closeLobby()

			createPopup({type: 'alert', message: t('hostInstructions.closeLobbyConfirmation'), onConfirm: () => {
				lobbyService.clearSavedInfo()
				navigate('/')
			}})
		}})		
	}

	// Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
	// This is why lobbyCode is also saved to a state, as otherwise it may cause bugs in development mode.
	useEffect(() => {
		/**
		 * Initialises the lobby. First checks if there is any lobby information stored in local storage and if it is valid.
		 * If yes, show the host view with the saved values.
		 * If the saved information is not valid, send a lobby creation request to the backend.
		 */
		const initLobby = async () => {
			// This is a bit hacky, but this is to make sure that this function only gets called once.
			if (lobbyInitialised.current) return
			lobbyInitialised.current = true

			setLobbyCode(null)
			try {
				await lobbyService.validateStoredValues()
				setLobbyCode(lobbyService.getLobbyCode())
			} catch {
				lobbyService.clearSavedInfo()
				lobbyService.createLobby().then(() => {
					setLobbyCode(lobbyService.getLobbyCode())
				}).catch((reason) => {
					if (reason instanceof AxiosError) {
						createPopup({type: 'alert', message: t('unexpectedError', {errorMessage: reason.message}), onConfirm: () => navigate('/')})
					}
				})
			}}
		
		initLobby()
	}, [createPopup, navigate, t])

	if (lobbyCode === null) return <Loading><a>{t('status.loading')}</a></Loading>

	return ( 
		<>
			<Authentication lobbyCode={lobbyCode} />
			<button className='viewerOpen'onClick={() => window.open('/viewer', '_blank', 'popup=true')}>
				<img src={linkIcon} className='icon' height={20} />{t('hostInstructions.openViewerWindow')}
			</button>
			<a>{t('hostInstructions.viewerWindowDesc')}</a>
			<hr style={{width: '100%'}}/>
			<CreateElectionForm />
			<br />
			<hr style={{width: '100%'}}/>
			<button className='closeLobby' onClick={handleCloseLobbyClick} data-testid='close-lobby'>{t('hostInstructions.closeLobby')}</button>
		</>
	)
}

export default Host