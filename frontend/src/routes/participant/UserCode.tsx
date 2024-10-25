import { useContext, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { createQueueSocket } from '../../sockets'
import { SetParticipantViewContext } from '../../context/Contexts'
import { getLobbyCode, getUserCode, setAuthToken } from '../../services/participantService'
import './UserCode.css'
import Loading from '../../elements/Loading'
import { useTranslation } from 'react-i18next'

/**
 * Shows the user their code after they entered a valid lobby code.
 */
export const UserCode = ({ onAuthenticated }: {
	/**
	 * If provided, this is called when the host authenticates the user. Currently used for unit tests.
	 * @param userID - The ID/Authentication token the user receives
	 */
	onAuthenticated?: (userID: string) => void }) => {
	const [isConnecting, setIsConnecting] = useState<boolean>(true)

	const { setViewTab } = useContext(SetParticipantViewContext)

	const lobbyCode = getLobbyCode()
	const userCode = getUserCode()

	const {t} = useTranslation()

	useEffect(() => {
		/**
		 * Called if {@link onAuthenticated} is not provided.
		 * @param userID - The ID/Authentication token the user receives
		 */
		const defaultOnAuthenticated = (userID: string) => {
			setAuthToken(userID)
			setViewTab('inLobby')
		}

		// If there isn't a lobby code or user code stored in memory, then an error occurred and the user is sent back to the lobby joining screen
		if (lobbyCode === null || userCode === null) {
			setViewTab('joinLobby')
			return
		}

		setIsConnecting(true)

		const lobbySocket: Socket = createQueueSocket(userCode, lobbyCode)
		lobbySocket.on('connect', () => setIsConnecting(false))
		lobbySocket.on('connect_error', (err) => console.error(err))
		lobbySocket.on('error', (error) => console.error('A socket error occurred: ', error))
		lobbySocket.on('authorize', ({ userID }) => {
			(onAuthenticated === null ? onAuthenticated : defaultOnAuthenticated)(userID)
		})
		lobbySocket.connect()

		const handleDisconnect = () => {
			lobbySocket.disconnect()
		}
		//Diconnect the socket if this element is unmounted.
		return handleDisconnect
	}, [lobbyCode, userCode, setViewTab, onAuthenticated])

	if (isConnecting) return <Loading><a>{t('status.connecting')}</a></Loading>

	return (
		<>
			<h3>{t('joinLobby.userCodeHeader')}</h3>
			<div className='codeDisplay'>
				<a data-testid={'usercode'}>
					{userCode}
				</a>
			</div>
			<h3>{t('joinLobby.userCodeInstructions')}</h3>
			<a>{t('joinLobby.awaitingAccess')}</a>
		</>
	)
}
