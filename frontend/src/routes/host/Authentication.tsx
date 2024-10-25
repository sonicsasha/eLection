import { Field, Form, Formik, FormikHelpers } from 'formik'
import { auhtenticateUserWithCode } from '../../services/lobbyHostService'
import * as Yup from 'yup'
import { useContext, useEffect, useState } from 'react'
import { ErrorMessage, StatusMessage } from '../../types'
import { AxiosError } from 'axios'
import { Mock } from 'vitest'
import { useTranslation } from 'react-i18next'
import { PopupContext } from '../../context/Contexts'
import { useNavigate } from 'react-router'
import './Authentication.css'

/**
 * A form that allows the host to let people into the lobby.
 */
export const Authentication = ({
	lobbyCode,
	onSubmitUserCode,
}: {
	lobbyCode: string;
	/**
	 * If provided, this is a function that will be called instead of the default function. Right now used only for unit tests.
	 */
	onSubmitUserCode?: ((userCode: string) => never ) | Mock;
}): React.ReactElement => {
	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
	const statusMessageColor = statusMessage?.status === 'success' ? 'green' : 'red'

	const {t} = useTranslation()
	const {createPopup} = useContext(PopupContext)
	const navigate = useNavigate()

	useEffect(() => {
		// When the status message changes, make the message disappear after a certain time.
		if (!statusMessage) return

		const timeout = setTimeout(() => {
			setStatusMessage(null)
		}, 5000)

		// This clears the timeout when the component is unmounted
		return () => clearTimeout(timeout)

	}, [statusMessage])

	const userCodeSchema = Yup.object({
		userCode: Yup.string()
			.required(t('fieldError.missingUserCode'))
			.matches(/^[0-9]+$/, t('fieldError.onlyDigits'))
			.min(4, t('fieldError.notValidUserCode'))
			.max(4, t('fieldError.notValidUserCode')),
	})

	/**
	 * Called when the host presses 'Submit' if {@link onSubmitUserCode} was not provided.
	 * @param userCode - The user code that should be authenticated.
	 * @param actions - Actions provided by Formik.
	 */
	const defaultOnSubmitUserCode = async (
		userCode: string,
		actions: FormikHelpers<{ userCode: string }>
	) => {
		try {
			await auhtenticateUserWithCode(userCode)
			setStatusMessage({
				status: 'success',
				message: t('status.userAuthenticated'),
			})
			actions.resetForm()
		} catch (e) {
			if (e instanceof AxiosError) {
				switch((e.response?.data as ErrorMessage).type) {
				case 'NOT_FOUND': 
					setStatusMessage({
						status: 'error',
						message: t('status.userNotFound'),
					})
					break
				case 'UNAUTHORIZED':
					// If the host is no longer authorized, it probably means that the lobby has closed and the lobby is redirected to the main menu.
					createPopup({type: 'alert', message: t('status.unauthorisedHost'), onConfirm: () => {
						navigate('/')
					}})
					break
				default:
					console.error(t('unexpectedError'), e.response)
				}
			}
		}
	}

	return (
		<>
			<h2>{t('lobbyCode')}:</h2>
			<h2 className='lobbyCodeDisplay' data-testid="lobbycode">{lobbyCode}</h2>
			<p>{t('hostInstructions.userAuthentication')}</p>
			<Formik
				initialValues={{ userCode: '' }}
				validationSchema={userCodeSchema}
				onSubmit={(values, actions) => {
					if (onSubmitUserCode === undefined) {
						defaultOnSubmitUserCode(values.userCode, actions)
					}
					else {
						onSubmitUserCode(values.userCode)
					}
				}}
			>
				{({ errors, touched, isValid }) => (
					<>
						<div className='userCodeField'>
							<Form className='userCodeField'>
								<Field name="userCode" autoComplete='off' size={4} data-testid="usercode-field" />
							
								<button type="submit" disabled={!isValid} data-testid="submit-authentication">
									{t('button.submit')}
								</button>
							</Form>
						</div>
						{errors.userCode && touched.userCode ? (
							<a data-testid="usercode-field-error">{errors.userCode}</a>
						) : null}
						{statusMessage && (
							<a
								data-testid={`status-message-${statusMessage.status}`}
								style={{ color: statusMessageColor }}
							>
								{statusMessage.message}
							</a>
						)}
					</>
				)}
			</Formik>
		</>
	)
}
