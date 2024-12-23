import { Socket, io } from 'socket.io-client'

export const createQueueSocket = (userCode: string, lobbyCode: string): Socket =>
	io(`${import.meta.env.VITE_SOCKET_URL}/queue`, {
		path: import.meta.env.VITE_SOCKET_PATH,
		auth: { userCode, lobbyCode},
		autoConnect: false,
	})

export const createViewerSocket = (hostToken : string) : Socket => 
	io(`${import.meta.env.VITE_SOCKET_URL}/viewer`, {
		auth: { token: hostToken },
		path: import.meta.env.VITE_SOCKET_PATH,
		autoConnect: false,
	})

export const createLobbySocket = (participantToken : string) : Socket => 
	io(`${import.meta.env.VITE_SOCKET_URL}/lobby`, {
		path: import.meta.env.VITE_SOCKET_PATH,
		auth: {token: participantToken},
		autoConnect: false,
	})

