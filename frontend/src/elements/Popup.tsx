import confirmIcon from '/img/icons/confirm.svg'
import cancelIcon from '/img/icons/cancel.svg'
import { useContext } from 'react'
import { PopupContext } from '../context/Contexts'
import { useTransition, animated } from '@react-spring/web'

/**
 * A popup that covers the entire screen. Uses {@link PopupContext} to get information on what to show.
 */
const Popup = () => {
	const {popupInfo, clearPopup} = useContext(PopupContext)

	const popupBackgroundAnimation = useTransition(popupInfo, {
		from: {opacity: 0},
		enter: {opacity: 1},
		leave: {opacity: 0}
	})

	const popupAnimation = useTransition(popupInfo, {
		from: {opacity: 0, scale: 0},
		enter: {opacity: 1, scale: 1},
		leave: {opacity: 1, scale: 0}
	})

	return <>
		{popupBackgroundAnimation((bgStyle, bgItem) => (bgItem && <animated.div style={bgStyle} className='popupBackground'>
			{popupAnimation((style, item) => (item && <animated.div style={style} className='popupContainer'>
				<a className='popupText' data-testid='popup-text'>{item?.message}</a>
				<div className='buttonsContainer'>
					<button className='confirmButton' data-testid='confirm-button' onClick={() => {item?.onConfirm?.(); clearPopup()}}>
						<img src={confirmIcon} />
					</button>
					{item?.type === 'confirm' && <>
						<button className='cancelButton' data-testid='cancel-button' onClick={() => {item?.onCancel?.(); clearPopup()}}>
							<img src={cancelIcon} />
						</button>
					</>
					}
				</div>
			</animated.div>))}
		</animated.div>))}
	</>
}

export default Popup