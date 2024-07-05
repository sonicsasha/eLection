import { Field, Form, Formik, FormikHelpers } from 'formik'
import { auhtenticateUserWithCode } from '../../services/lobbyHostService'
import * as Yup from 'yup'
import { useEffect, useState } from 'react'
import { StatusMessage } from '../../types'
import { AxiosError } from 'axios'
import { Mock } from 'vitest'
import './Authentication.css'

export const Authentication = ({
	lobbyCode,
	onSubmitUserCode,
}: {
	lobbyCode: string;
	onSubmitUserCode?: ((userCode: string) => never ) | Mock<string[]>;
}): React.ReactElement => {
	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
	const statusMessageColor = statusMessage?.status === 'success' ? 'green' : 'red'

    useEffect(() => {
        if (!statusMessage) return

        const timeout = setTimeout(() => {
            setStatusMessage(null)
        }, 5000)

        // This clears the timeout when the component is unmounted
        return () => clearTimeout(timeout)

    }, [statusMessage])

	const userCodeSchema = Yup.object({
		userCode: Yup.string()
			.required('Please enter the user code')
			.matches(/^[0-9]+$/, 'Please enter only digits')
			.min(4, 'Please enter a valid user code')
			.max(4, 'Please enter a valid user code'),
	})

	const defaultOnSubmitUserCode = async (
		userCode: string,
		actions: FormikHelpers<{ userCode: string }>
	) => {
		try {
			await auhtenticateUserWithCode(userCode)
			setStatusMessage({
				status: 'success',
				message: 'User is now authenticated!',
			})
			actions.resetForm()
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.response?.status === 404) {
					setStatusMessage({
						status: 'error',
						message: 'Could not find a user with the given code',
					})
				} else {
					console.error('An error occurred: ', e.response)
				}
			}
		}
	}

	return (
		<>
			<h2>Lobby code:</h2>
			<h2 className='lobbyCodeDisplay' data-testid="lobbycode">{lobbyCode}</h2>
			<p>Let someone into the lobby by entering their user code below</p>
			<Formik
				initialValues={{ userCode: '' }}
				validationSchema={userCodeSchema}
				onSubmit={(values, actions) => {
					onSubmitUserCode !== undefined
						? onSubmitUserCode(values.userCode)
						: defaultOnSubmitUserCode(values.userCode, actions)
				}}
			>
				{({ errors, touched, isValid }) => (
					<>
					<div className='userCodeField'>
						<Form className='userCodeField'>
							<Field name="userCode" placeholder="User code" data-testid="usercode-field" />
							
							<button type="submit" disabled={!isValid} data-testid="submit-authentication">
								Submit
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
