import { AxiosError } from 'axios'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import * as participantService from '../../services/participantService'
import { useContext } from 'react'
import { SetParticipantViewContext } from '../../context/Contexts'
import { Mock } from 'vitest'
import './JoinLobbyForm.css'
import { useTranslation } from 'react-i18next'

/**
 * The participant's view when they want to join a lobby
 */
export const JoinLobbyForm = ({
	handleSubmitLobbyCode,
}: {
	/**
	 * An optional function that is called when the user presses 'Submit'. If not provided, runs the default function. Currently used for unit tests 
	 * @param lobbyCode The lobby code the user entered
	 */
	handleSubmitLobbyCode?: (lobbyCode: string) => never | Mock;
}): React.ReactElement => {
	const { setViewTab } = useContext(SetParticipantViewContext)
	const {t} = useTranslation()

	/**
	 * The function that is called if {@link handleSubmitLobbyCode} is not provided.
	 * Tries to contact the backend to validate if the lobby code is valid.
	 * If it is, changes the view to show the user code.
	 * @param values Values from the form
	 * @param setErrors A function provided by {@link FormikHelpers} 
	 * @returns null
	 */
	const defaultHandleSubmitLobbyCode = async (
		values: { lobbyCode: string },
		{ setErrors }: FormikHelpers<{ lobbyCode: string }>
	) => {
		try {
			const lobbyCode = values.lobbyCode

			if (lobbyCode === null) return

			const userCode = await participantService.joinQueue(lobbyCode)

			if (!userCode) {
				console.error('Got response for lobby code but did not receive a user code!')
				return
			}

			participantService.setUserCode(userCode)
			participantService.setLobbyCode(lobbyCode)
			setViewTab('inQueue')
		} catch (e) {
			if (e instanceof AxiosError) {
				console.log(e.code)
				if (e.response?.status === 404) {
					setErrors({
						lobbyCode: t('fieldError.lobbyNotFound'),
					})
				} else {
					console.error(e.response?.data)
				}
			}
		}
	}

	const lobbyFormSchema = Yup.object({
		lobbyCode: Yup.string()
			.required(t('fieldError.notValidLobbyCode'))
			.matches(/^[0-9]+$/, t('fieldError.onlyDigits'))
			.min(4, t('fieldError.notValidLobbyCode'))
			.max(4, t('fieldError.notValidLobbyCode')),
	})

	return (
		<>
			<Formik
				initialValues={{ lobbyCode: '' }}
				validationSchema={lobbyFormSchema}
				onSubmit={(values, formikHelpers) => {
					if (handleSubmitLobbyCode !== undefined) {
						handleSubmitLobbyCode(values.lobbyCode)
					}
					else {
						defaultHandleSubmitLobbyCode(values, formikHelpers)
					}
				}}
			>
				{({ errors, touched, isValid }) => (
					<>
						<Form autoComplete='off'>
							<h2 data-testid="lobby-form-header">{t('welcome')}</h2>
							<a>{t('joinLobby.lobbyCodeInstructions')}</a>
							<br/>
							<Field name="lobbyCode" data-testid="lobbycode-field" size={4} maxLength={4} inputMode='numeric' className='lobbyCodeInput'/>
							<br/>
							{errors.lobbyCode && touched.lobbyCode ? (
								<a data-testid="lobbycode-field-error" style={{ color: 'red' }}>
									{errors.lobbyCode}
								</a>
							) : null}
							<br />
							<button type="submit" data-testid='submit' className='submitLobbyCode' disabled={!isValid}>
								{t('button.submit')}
							</button>
						</Form>
					</>
				)}
			</Formik>
		</>
	)
}
