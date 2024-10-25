import { useState } from 'react'
import { ParticipantViewTab, PopupInfo } from '../types'
import { PopupContext, SetParticipantViewContext } from './Contexts'


/**
 *
 * @param React.PropsWithChildren - React props
 * @returns Context provider for {@link SetParticipantViewContext}
 */

export const SetParticipantViewContextProvider = (props: React.PropsWithChildren) => {
	const [viewTab, setViewTab] = useState<ParticipantViewTab>('joinLobby')

	return (
		<SetParticipantViewContext.Provider value={{ viewTab, setViewTab }}>
			{props.children}
		</SetParticipantViewContext.Provider>
	)
};export const PopupContextProvider = (props: React.PropsWithChildren) => {
	const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

	const createPopup = (popupInfo: PopupInfo) => {
		setPopupInfo(popupInfo)
	}

	const clearPopup = () => {
		setPopupInfo(null)
	}

	return (
		<PopupContext.Provider value={{ popupInfo, createPopup, clearPopup }}>
			{props.children}
		</PopupContext.Provider>
	)
}

