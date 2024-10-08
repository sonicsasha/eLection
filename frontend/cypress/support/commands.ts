/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import '@4tw/cypress-drag-drop'
import 'cypress-real-events'
Cypress.Commands.add('resetServer', () => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`)
})

Cypress.Commands.add('createLobbyAndUser', () => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/createLobbyWithUser`).then((res) => {
		const lobbyCode = res.body.lobbyCode
		const participantID = res.body.participantID
		const hostID = res.body.hostID

		localStorage.setItem('hostLobbyCode', lobbyCode)
		localStorage.setItem('hostID', hostID)
		localStorage.setItem('participantLobbyCode', lobbyCode)
		localStorage.setItem('participantID', participantID)

		cy.wrap(lobbyCode).as('lobbyCode')
		cy.wrap(hostID).as('hostID')
		cy.wrap(participantID).as('participantID')
	})
})

Cypress.Commands.add('createElection', (electionInfo) => {
	cy.get('@lobbyCode').then((lobbyCode) => {
		cy.get('@hostID').then((hostID) => {
			cy.request({
				method: 'post', 
				url: `${Cypress.env('BACKEND_URL')}/host/createElection`,
				headers: {Authorization: hostID},
				body: {lobbyCode,
					electionInfo
				}
			})
		})
	})
})

Cypress.Commands.add('castVote', (voteContent) => {
	cy.get('@lobbyCode').then((lobbyCode) => {
		cy.get('@participantID').then((participantID) => {
			cy.request({
				method: 'post',
				url: `${Cypress.env('BACKEND_URL')}/participant/castVote`,
				headers: {Authorization: participantID},
				body: {lobbyCode, voteContent}
			})
		})
	})
})

Cypress.Commands.add('createUser', () => {
	cy.get('@lobbyCode').then((lobbyCode) => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((res) => {
			const userCode = res.body.userCode

			cy.get('@hostID').then((hostID) => {
				return cy.request({
					method: 'post',
					url: `${Cypress.env('BACKEND_URL')}/host/authenticateUser`,
					body: {lobbyCode, userCode},
					headers: {
						'Authorization': hostID
					}
				})
			})
		})
	})
})

Cypress.Commands.add('closeLobby', function () {
	return cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/host/closeLobby`,
		body: {lobbyCode: this.lobbyCode},
		headers: {
			'Authorization': this.hostID
		}
	})
})

Cypress.Commands.add('startCleanup', function () {
	return cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/testing/forceServerCleanup`,
	})
})

Cypress.Commands.add('endElection', function () {
	cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/host/endElection`,
		body: {lobbyCode: this.lobbyCode},
		headers: {
			'Authorization': this.hostID
		}
	})
})

Cypress.Commands.add('getElectionResults', function () {
	return cy.request(`${Cypress.env('BACKEND_URL')}/testing/getElectionResults`, {lobbyCode: this.lobbyCode})
})

Cypress.Commands.add('setLobbyLastActive', function (lastActiveTime : number) {
	return cy.request('post',`${Cypress.env('BACKEND_URL')}/testing/setLobbyLastActive`, {lobbyCode: this.lobbyCode, lastActiveTime})
})

Cypress.Commands.add('getNumberOfLobbies', function () {
	return cy.request('get', `${Cypress.env('BACKEND_URL')}/testing/getNumberOfLobbies`)
})