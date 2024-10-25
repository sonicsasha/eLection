import { AxiosError } from 'axios'
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { createElection, endElection, getElectionStatus } from '../../services/lobbyHostService'
import { Fragment, useContext, useEffect, useState } from 'react'
import { ElectionInfo,  ElectionType,  ErrorMessage as ResponseErrorMessage, StatusMessage } from '../../types'
import './CreateElectionForm.css'
import InfoTooltip from '../../elements/Tooltip'
import trashIcon from '/img/icons/trash.svg'
import addIcon from '/img/icons/add.svg'
import { PopupContext } from '../../context/Contexts'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

const CreateElectionForm = ({onSubmitForm, onEndElectionClick, skipStatusCheck} : 
    {
    /**
     * If provided, this will be called when the user submits the election creation form instead of the default function. Right now only used for unit tests.
     */
    onSubmitForm?: ((values: ElectionInfo) => undefined),
    /**
     * If provided, this will be called when the user requests to end the election instead of the default function. Right now only used for unit tests.
     */
    onEndElectionClick?: () => void,
    /**
     * Whether the election status check should be skipped in the beginning and just assume that there are no active elections. Used for unit tests.
     */
    skipStatusCheck?: boolean}) => {

	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
	const [electionType, setElectionType] = useState<ElectionType>('FPTP')
	const [isElectionActive, setIsElectionActive] = useState<boolean>(false)
	const [isRequestPending, setIsRequestPending] = useState<boolean>(!skipStatusCheck)
	const {createPopup} = useContext(PopupContext)
	const {t} = useTranslation()
	const navigate = useNavigate()

	const titleMaxLength = 80
	const candidateLimit = 20
	const candidateNameMaxLength = 40

	useEffect(() => {
		if (!statusMessage) return

		const timeout = setTimeout(() => {
			setStatusMessage(null)
		}, 5000)

		// This clears the timeout when the component is unmounted
		return () => clearTimeout(timeout)

	}, [statusMessage])

	useEffect(() => {
		// This is to make sure that if the host reloads the page, their election control buttons will still be up-to-date.
		if (skipStatusCheck) {
			setIsRequestPending(false)
			return
		}

		setIsRequestPending(true)

		getElectionStatus().then((res) => {
			setIsElectionActive(res.data.electionActive)
			setIsRequestPending(false)
		})
	}, [skipStatusCheck])

	const ElectionCreationSchema = Yup.object().shape({
		type: Yup.string()
			.required(),

		title: Yup.string()
			.required(t('fieldError.missingTitle'))
			.max(titleMaxLength, t('fieldError.titleTooLong', {limit: titleMaxLength})),

		candidates: Yup.array()
			.of(Yup.string()
				.required(t('fieldError.emptyCandidate'))
				.max(candidateNameMaxLength, t('fieldError.nameTooLong', {limit: candidateNameMaxLength}))
			).min(2, t('fieldError.noCandidates'))
			.max(candidateLimit, t('fieldError.tooManyCandidates', {candidateLimit})),
        
		candidatesToRank: Yup.number()
			.min(2, t('fieldError.fewCandidatesToRank'))
	})
	/**
     * This is called if the host receives the UNAUTHORIZED error message when creating elections or ending elections. Show an alert to the user and kick them out from the lobby.
     */
	const handleUnauthorizedRequest = () => {
		createPopup({type: 'alert', message: t('status.unauthorisedHost'), onConfirm: () => {
			navigate('/')
		}})
	}
	/**
     * This is called when the host tries to create an election and if there was no {@link onSubmitForm}. Attempts to collect the data from the form and send it to the backend server.
     * @param values - The values from the form.
     * @param formikHelpers - Helper functions provided by {@link Formik}
     */
	const defaultOnSubmit = async (values: ElectionInfo, formikHelpers: FormikHelpers<ElectionInfo>) => {
		try {
			setIsRequestPending(true)
			await createElection(values)
			formikHelpers.resetForm()
			setStatusMessage({status: 'success', message: t('status.electionCreateSuccess')})
			setIsElectionActive(true)
			setIsRequestPending(false)
		}
		catch(e) {
			if (e instanceof AxiosError) {
				if ((e.response?.data as ResponseErrorMessage).type === 'UNAUTHORIZED') {
					handleUnauthorizedRequest()
				}
				else {
					createPopup({type: 'alert', message: t('unexpectedError', {errorMessage: e.response?.data.message})})
					setIsRequestPending(false)
				}
			}
		}
	}
	/**
     * This is called when the user tries to end an election and there was no {@link onEndElectionClick} provided.
     * Tries to send an election ending request to the backend server.
     */
	const defaultOnEndElectionClick = async () => {
		try {
			setIsRequestPending(true)
			await endElection()
			setIsElectionActive(false)
			setStatusMessage({status: 'success', message: t('status.electionEndSuccess')})
			setIsRequestPending(false)
		}
		catch (e) {
			if (e instanceof AxiosError) {
				switch((e.response?.data as ResponseErrorMessage).type) {
				case 'NO_ACTIVE_ELECTION':
					createPopup({type: 'alert', message: t('status.noActiveElection'), onConfirm: () => {
						setIsElectionActive(false)
					}})
					break
				case 'UNAUTHORIZED':
					handleUnauthorizedRequest()
				}
				setIsRequestPending(false)
			}
		}
	}

	const initialFPTPValues : ElectionInfo = {
		type: 'FPTP',
		title: '',
		candidates: ['', ''],
	}

	const initialRankedValues : ElectionInfo = {
		type: 'ranked',
		title: '',
		candidates: ['', ''],
		candidatesToRank: 2
	}

	return (
		<div>
			<h3>{t('fieldInfo.createElectionHeader')}</h3>
			<Formik
				// Creating different initial values is to avoid problems with TypeScript, since the Formik functions inherit the types from the initial values object.
				initialValues ={electionType === 'FPTP' ? initialFPTPValues : electionType === 'ranked' ? initialRankedValues : initialFPTPValues}
				onSubmit={(values : ElectionInfo, helpers : FormikHelpers<ElectionInfo>) => onSubmitForm !== undefined ? onSubmitForm(values) : defaultOnSubmit(values, helpers)}
				validationSchema={ElectionCreationSchema}
				enableReinitialize={true}
			>
				{({ values }) => (<>
					<div className='electionTypeSelector'>
						<input type="radio" name="type" defaultChecked={electionType === 'FPTP'} onClick={() => setElectionType('FPTP')} value={'FPTP'} disabled={isElectionActive} data-testid="fptp-radio"/>
						<a className='secondaryColor'>{t('electionType.fptp.name')}</a>
						<InfoTooltip>
							<a className='secondaryColor'>{t('electionType.fptp.info')}</a>
						</InfoTooltip>
						<input type="radio" name="type" defaultChecked={electionType === 'ranked'} onClick={() => setElectionType('ranked')} value={'ranked'} disabled={isElectionActive} data-testid="ranked-radio"/>
						<a className='secondaryColor'>{t('electionType.ranked.name')}</a>
						<InfoTooltip>
							<a className='secondaryColor'>{t('electionType.ranked.info')}</a>
						</InfoTooltip>
					</div>
					<Form autoComplete='off'>
						<ErrorMessage
							name="type"
							component="div"
							className="field-error"
							data-testid="radio-error"
						/>
						<br />
						<div className='inputRow'>
							<div className='leftAlign'>
								<label htmlFor={'title'}>{t('fieldInfo.title')}</label>
							</div>
							<div className='centerFill' >
								<Field
									name="title"
									data-testid="title-field"
									placeholder={t('fieldInfo.titlePlaceholder')}
									disabled={isElectionActive}
									data-lpignore="true"
									type="text"
									maxLength={titleMaxLength}
								/>
							</div>
							<div className='rightAlign' />
						</div>
						<ErrorMessage
							name="title"
							component="div"
							className="field-error"
							data-testid="title-error"
						/>
						{values.type === 'ranked' && <>
							<div className='inputRow'>
								<div className='leftAlign'>
									<label htmlFor='candidatesToRank'>{t('fieldInfo.candidatesToRank')}</label>
								</div>
								<div className='centerFill'>
									<Field
										name="candidatesToRank"
										data-testid="candidates-to-rank"
										disabled={isElectionActive}
										type="number"
										min={2}
										max={values.candidates.length}
									/>
								</div>
								<div className='rightAlign'>
									<InfoTooltip>
										<a className='secondaryColor'>{t('fieldInfo.candidatesToRankTooltip')}</a>
									</InfoTooltip>
								</div>
							</div>
						</> 
						}
						<h3>{t('fieldInfo.candidates')}</h3>
						<FieldArray name="candidates">
							{({ remove, push}) => {
								const canDeleteCandidate = values.candidates.length <= 2 || isElectionActive

								return <>
									{values.candidates.length > 0 &&
									values.candidates.map((_candidate, index) => (
										<Fragment key={`candidate_${index}`}>
											<div className='inputRow' key={index}>
												<div className='leftAlign'>
													<label htmlFor={`candidates.${index}`}>{t('name')}</label>
												</div>
												<div className='centerFill'>
													<Field
														name={`candidates.${index}`} 
														placeholder={t('fieldInfo.namePlaceholder')}
														type="string"
														data-testid={'candidate-field'}
														disabled={isElectionActive}
														maxLength={candidateNameMaxLength}
													/>
												</div>
												<div className='rightAlign'>
													<button tabIndex={-1} type="button" className='deleteCandidateButton' disabled={canDeleteCandidate} onClick={() => remove(index)} data-testid="remove-candidate-button">
														<img src={trashIcon} width={20} className={`icon ${canDeleteCandidate && 'disabledIcon'}`} />
													</button>
												</div>
											</div>
											<ErrorMessage 
												name={`candidates.${index}`}
												component="div"
												data-testid="candidate-error"
												className="field-error"
											/>
										</Fragment>
									))
									}
									<button className={'addCandidateButton '} disabled={isElectionActive || values.candidates.length >= 20}type="button" onClick={() => push('')} data-testid="add-candidate-button">
										<img className={`icon ${isElectionActive && 'disabledIcon'}`} src={addIcon} height={30} />
									</button>
								</>
							}}
						</FieldArray>
						<div className='electionControl'>
							<button disabled={isElectionActive || isRequestPending} data-testid="create-election-submit" type="submit">{t('fieldInfo.createElection')}</button>
							<button type='button' data-testid="end-election-button" onClick={() => onEndElectionClick !== undefined ? onEndElectionClick() : defaultOnEndElectionClick()} disabled={!isElectionActive}>{t('fieldInfo.endElection')}</button>
						</div>
					</Form>
				</>)}
			</Formik>
        
			{statusMessage && <a data-testid={`status-${statusMessage.status}`}style={{color: statusMessage.status === 'success' ? 'green' : 'red'}}>{statusMessage.message}</a>}
		</div>
	)
}

export default CreateElectionForm