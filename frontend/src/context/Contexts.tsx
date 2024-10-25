import { Dispatch, SetStateAction, createContext } from 'react'
import { ParticipantViewTab, PopupInfo } from '../types'

// The below is a workaround to avoid TypeScript's requiremenets. This context is always initialized through the provider, so this should be ok

/**
 * Context that controls what the user sees when they are a participant. Check type to see what values this can receive.
 */
export const SetParticipantViewContext = createContext<{
	/**
	 * What a participant sees.
	 */
	viewTab: ParticipantViewTab;
	/**
	 * Set what the participant sees
	 */
	setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
}>(
	{} as {
		viewTab: ParticipantViewTab;
		setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
	}
)

/**
 * Context that controls the popup that the user can see
 */
export const PopupContext = createContext<{
	/**
	 * The information for the popup.
	 */
	popupInfo: PopupInfo | null,
	/**
	 * Creates a popup that the user can see
	 * @param popupInfo Information for the popup
	 * @returns null
	 */
	createPopup: (popupInfo : PopupInfo) => void
	/**
	 * Clears the popup from the user.
	 * @returns null
	 */
	clearPopup: () => void 
		}>(
	{} as {
		popupInfo: PopupInfo,
		createPopup: (popupInfo : PopupInfo) => void,
		clearPopup: () => void
	}
		)

