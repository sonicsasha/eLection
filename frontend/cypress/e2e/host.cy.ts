describe('In host view', () => {
	beforeEach(() => {
		cy.resetServer()
		cy.createLobbyAndUser()
		cy.visit('/host')
	})
	it('can create a FPTP election and end election', () => {
		cy.get('[data-testid=\'fptp-radio\']').click()
		cy.get('[data-testid=\'title-field\']').type('Language?')
		cy.get('[data-testid=\'candidate-field\']').eq(0).type('Python')
		cy.get('[data-testid=\'candidate-field\']').eq(1).type('JavaScript')

		cy.get('[data-testid=\'end-election-button\']').should('be.disabled')
		cy.get('[data-testid=\'download-results-button\']').should('be.disabled')

		cy.get('[data-testid=\'create-election-submit\']').click()

		cy.get('[data-testid=\'status-success\']')

		cy.get('[data-testid=\'end-election-button\']').should('be.enabled')
		cy.get('[data-testid=\'create-election-submit\']').should('be.disabled')
		cy.get('[data-testid=\'download-results-button\']').should('be.disabled')

		cy.get('[data-testid=\'end-election-button\']').click()

		cy.get('[data-testid=\'status-success\']')

		cy.get('[data-testid=\'end-election-button\']').should('be.disabled')
		cy.get('[data-testid=\'create-election-submit\']').should('be.enabled')
		cy.get('[data-testid=\'download-results-button\']').should('be.enabled')
	})

	it('can create a ranked election', () => {
		cy.get('[data-testid=\'ranked-radio\']').click()
		cy.get('[data-testid=\'title-field\']').type('Who should the next world president be?')
		cy.get('[data-testid=\'candidates-to-rank\'').clear().type('2')
		cy.get('[data-testid=\'candidate-field\']').eq(0).type('Nelson Mandela')
		cy.get('[data-testid=\'candidate-field\']').eq(1).type('Mahatma Gandhi')

		cy.get('[data-testid=\'create-election-submit\']').click()

		cy.get('[data-testid=\'status-success\']')

	})

	it('can close lobby', () => {
		cy.getNumberOfLobbies().then((res) => {
			expect(res.body.numberOfLobbies).eq(1)
		})
		cy.get('[data-testid=\'close-lobby\']').click()
		cy.get('[data-testid=\'confirm-button\']').click()
		cy.get('[data-testid=\'confirm-button\']').click()
		cy.get('[data-testid=\'welcome-message\']')
		cy.getNumberOfLobbies().then((res) => {
			expect(res.body.numberOfLobbies).eq(0)
		})
	})

	it('retains the same lobby code after reload', () => {
		// This isn't the best method, but wait until the election status has been fetched. Otherwise would receive an abort error
		cy.get('[data-testid="create-election-submit"]').should('be.enabled')
		cy.get('[data-testid=\'lobbycode\']').then((lobbyCode1) => {
			cy.reload()
			cy.get('[data-testid=\'lobbycode\']').then((lobbyCode2) => {
				assert.equal(lobbyCode2.text(), lobbyCode1.text())
			})
		})
	})

	it('election control and download buttons are up to date even after the reload', () => {
		//This prevents a CSS preload error
		cy.get('[data-testid=\'create-election-submit\']').should('be.enabled')
		cy.createElection({type: 'FPTP', title: 'Is pineapple a sin against humanity?', candidates: ['Yes', 'No']})
		cy.reload()

		cy.get('[data-testid=\'end-election-button\']').should('be.enabled')
		cy.get('[data-testid=\'create-election-submit\']').should('be.disabled')
		cy.get('[data-testid=\'download-results-button\']').should('be.disabled')

		cy.endElection()
		cy.wait(0)
		cy.reload()

		cy.get('[data-testid=\'create-election-submit\']').should('be.enabled')
		cy.get('[data-testid=\'end-election-button\']').should('be.disabled')
		cy.get('[data-testid=\'download-results-button\']').should('be.enabled')
	})

	//Note that this test may create a false positive if there was already a file downloaded.
	//The headless mode of Cypress should clear the downloads folder before tests.
	//However, this shouldn't affect the CI/CD pipeline
	it('downloads election results correctly', () => {
		cy.get('[data-testid=\'create-election-submit\']').should('be.enabled')

		cy.createElection({type: 'ranked', title: 'Board of office software', candidates: ['Microsoft 365', 'Apple\'s office software', 'OpenOffice', 'LibreOffice'], candidatesToRank: 3})
		cy.castVote(['LibreOffice', 'Microsoft 365', 'Apple\'s office software'])
		cy.endElection()

		cy.reload()
		cy.get('[data-testid=\'download-results-button\']').click()

		//Note that this doesn't check the contents of the file
		cy.readFile(`${Cypress.config('downloadsFolder')}/Board_of_office_software-results.xlsx`)
	})

	describe('when the lobby is closed', () => {
		beforeEach(() => {
			cy.get('[data-testid="create-election-submit"]').should('be.enabled')
			cy.closeLobby()
		})

		it('host is kicked when trying to authenticate a user', () => {
			cy.get('[data-testid="usercode-field"]').type('1234')
			cy.get('[data-testid="submit-authentication"]').click()

			cy.get('[data-testid="popup-text"]')
			cy.get('[data-testid="confirm-button"]').click()
			cy.get('[data-testid="welcome-message"]')
		})

		it('host is kicked when trying to start an election', () => {
			cy.get('[data-testid=\'fptp-radio\']').click()
			cy.get('[data-testid=\'title-field\']').type('Which one is the better nation?')
			cy.get('[data-testid=\'candidate-field\']').eq(0).type('PPO')
			cy.get('[data-testid=\'candidate-field\']').eq(1).type('EPO')
    
			cy.get('[data-testid=\'create-election-submit\']').click()

			cy.get('[data-testid="popup-text"]')
			cy.get('[data-testid="confirm-button"]').click()
			cy.get('[data-testid="welcome-message"]')
		})
	})
})