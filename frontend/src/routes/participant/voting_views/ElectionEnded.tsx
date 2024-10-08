import { useTranslation } from 'react-i18next'
/**
 * An element that shows the user that the election has ended.
 */
const ElectionEnded = () => {
	const {t} = useTranslation()

	return <>
		<h2 data-testid="election-end-header">{t('electionEnd')}</h2>
		<a>{t('lookAtResults')}</a>
	</>
}

export default ElectionEnded