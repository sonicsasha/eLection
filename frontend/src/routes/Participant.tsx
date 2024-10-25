import { useContext, useEffect, useState } from 'react'
import { JoinLobbyForm } from './participant/JoinLobbyForm'
import { UserCode } from './participant/UserCode'
import { SetParticipantViewContext } from '../context/Contexts'
import * as participantService from '../services/participantService'
import LobbyView from './participant/LobbyView'
import Loading from '../elements/Loading'

/**
 * The participant's view.
 */
const ParticipantView: () => JSX.Element = () => {
	const { viewTab, setViewTab } = useContext(SetParticipantViewContext)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		/**
		 * Checks if there are any values stored in local storage. If yes, let the user directly into the lobby.
		 */
		const validateStoredValues = async () => {
			setIsLoading(true)
			participantService.validateStoredUserValues().then(() => {
				setViewTab('inLobby')
			})
				.catch((error) => {
					console.log(error)
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
		validateStoredValues()
	}, [setViewTab])

	if (isLoading) return <Loading><a>Loading....</a></Loading>

	return (
		<div>
			{viewTab === 'joinLobby' && <JoinLobbyForm />}
			{viewTab === 'inQueue' && <UserCode />}
			{viewTab === 'inLobby' && <>
				<a data-testid="lobby-header" hidden></a>
				<LobbyView />
			</>}
		</div>
	)
}

export default ParticipantView