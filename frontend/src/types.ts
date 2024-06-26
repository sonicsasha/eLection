export interface LobbyCreationResponse {
	lobbyCode: string;
	hostID: string;
}

export interface StatusMessage {
	status: 'success' | 'error';
	message: string;
}

export interface JoinLobbyResponse {
	userCode: string;
}

export type ParticipantViewTab = 'joinLobby' | 'inQueue' | 'inLobby';

export type LobbyStatusInfo = {
    status: 'STANDBY'
} | {
    status: 'VOTING',
    electionInfo: ElectionInfo
} | {
    status: 'ELECTION_ENDED',
    results: ElectionResultsInfo
}



export type ElectionType = 'FPTP' | 'ranked'

type ElectionInfoBase = {
    /**
     * The name of the election
     * 
     * @minimum 0
     * @TJS-type string
     */
    title: string,
    /**
     * The list of candidates
     * 
     * @items.type string
     * @items.minimum 2
     */
    candidates: string[]
}

export interface FPTPElectionInfo extends ElectionInfoBase {
    type: 'FPTP'
}

export interface RankedElectionInfo extends ElectionInfoBase {
    type: 'ranked'
    candidatesToRank: number
}

export type ElectionInfo = FPTPElectionInfo | RankedElectionInfo

export type ErrorMessage = {
    type: ErrorType,
    message: string
}

type ErrorType = 'MISSING_AUTH_TOKEN' | 'MISSING_LOBBY_CODE' | 'UNAUTHORIZED' | 'NO_ACTIVE_ELECTION' | 'MALFORMATTED_REQUEST' | 'ALREADY_VOTED'

export interface ElectionResults {
    votes: Record<string, number>
    emptyVotes: number
    usersVoted: string[]
}

export type ElectionResultsInfo = Omit<ElectionResults, 'usersVoted'> & Pick<ElectionInfo, 'type' | 'title'>

export interface ResultCandidateInfo {
    name: string
    votes: number
}