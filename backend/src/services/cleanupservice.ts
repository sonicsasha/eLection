import { LobbyCloseReason, LobbyStatusInfo } from '../types/types'
import { io } from '../util/server'
import * as lobbyService from './lobbyservice'

const defaultTimeoutDuration = (process.env.LOBBY_TIMEOUT_LENGTH && Number(process.env.LOBBY_TIMEOUT_LENGTH)) | 7200000

export const closeLobby = (lobbyCode : string, reason: LobbyCloseReason) => {
    const viewerSocket = lobbyService.getViewerSocket(lobbyCode)
    const participantSockets = lobbyService.getAllParticipantSockets(lobbyCode)

    const lobbyClosingMessage : LobbyStatusInfo = {status: 'CLOSING', reason}

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyClosingMessage)
    io.of('/viewer').in(viewerSocket).disconnectSockets()
    participantSockets.forEach((socket) => {
        io.of('/lobby').to(socket).emit('status-change', lobbyClosingMessage)
        io.of('/lobby').in(socket).disconnectSockets()
    })

    lobbyService.deleteLobby(lobbyCode)
}

export const cleanupRoutine = () => {
    console.log('Performing cleanup')
    const activityArray = lobbyService.getAllLobbyActivity()

    activityArray.forEach((lobby) => {
        if (Date.now() - lobby.lastActivity >= defaultTimeoutDuration) {
            closeLobby(lobby.lobbyCode, 'INACTIVITY')
        }
    })
}