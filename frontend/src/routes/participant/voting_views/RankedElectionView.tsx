import { Fragment, useState } from 'react'
import { RankedElectionInfo } from '../../../types'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { clamp } from 'lodash'

// Used React Spring's Draggable List example as base: https://codesandbox.io/s/zfy9p

const candidateContainerHeight = 100
const candidateContainerGap = 20
const candidateContainerSpace = candidateContainerHeight + candidateContainerGap

const animateFn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) => 
    active && index === originalIndex
        ? {
            y: curIndex * candidateContainerSpace + y,
            scale: 1.1,
            zIndex: 1,
            shadow: 15,
            immediate: (key :string) => key === 'y' || key === 'zIndex',
        }
        : {
            y: order.indexOf(index) * candidateContainerSpace,
            scale: 1,
            zIndex: 0,
            shadow: 1,
            immediate: false
        }

const swap = (array: number[], indexA : number, indexB : number) => {
    const arrayCopy = array.slice() as number[]

    [arrayCopy[indexA], arrayCopy[indexB]] = [array[indexB], array[indexA]]

    return arrayCopy
}

const RankedElectionView = ({electionInfo, onSubmitVote} : {electionInfo : RankedElectionInfo, onSubmitVote: (voteContent: string[] | string | null) => Promise<void> | void}) => {
    const [candidateOrder, setCandidateOrder] = useState(electionInfo.candidates.map((_,index) => index))

    const [springs, animationApi] = useSprings(candidateOrder.length, animateFn(candidateOrder))

    const bind = useDrag(({args: [originalIndex], active, movement: [, y]}) => {
        const curIndex = candidateOrder.indexOf(originalIndex)
        const curRow = clamp(Math.round((curIndex * candidateContainerSpace + y) / candidateContainerSpace), 0, candidateOrder.length - 1)
        const newOrder = swap(candidateOrder, curIndex, curRow)
        animationApi.start(animateFn(newOrder, active, originalIndex, curIndex, y))
        if (!active) setCandidateOrder(newOrder)
    })

    const handleButtonClick = () => {
        const orderedCandidates : string[] = []

        candidateOrder.some((candidateOrderIndex, i) => {
            orderedCandidates.push(electionInfo.candidates[candidateOrderIndex])
            if (i >= electionInfo.candidatesToRank - 1) return true
        })
        onSubmitVote(orderedCandidates)
    }

    const handleEmptyVote = () => {
        const castEmptyVote = window.confirm('Are you sure you want to submit an empty vote?')
        if (castEmptyVote) {
            onSubmitVote(null)
        }
    }

    return (
        <>
        <h2>{electionInfo.title}</h2>
        <p>Rank your top {electionInfo.candidatesToRank} candidates by dragging and press 'Submit'</p>
        <div className='rankedCandidatesContainer' style={{minHeight: candidateOrder.length * candidateContainerSpace}}>
            {springs.map(({ zIndex, shadow, y, scale }, i) => {
                const orderPosition = candidateOrder.indexOf(i)
                const votes = electionInfo.candidatesToRank - orderPosition
                return <Fragment key={`candidateFragment_${i}`}>
                <animated.div
                    {...bind(i)}
                    key={`dragCandidate_${i}`}
                    data-testid={`candidate-drag-${i}`}
                    className={'candidateContainer rankedCandidate'}
                    style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        position: 'absolute',
                        zIndex,
                        boxShadow: shadow.to(s => `rgba(0,0,0,0.15) 0px ${s}px ${2 * s} px 0px`),
                        y,
                        scale,
                    }}
                children={<>
                    <div className='candidatePosition'>
                        {votes > 0 && <a>{orderPosition + 1}.</a>}
                    </div>
                    <a className='candidateName'>{electionInfo.candidates[i]}</a>
                    <div className='candidateVotes'>
                        {votes > 0 && <a>{votes} votes</a>}
                    </div>
                </>}
                />
                </Fragment>
    })}
            {electionInfo.candidatesToRank < electionInfo.candidates.length && 
                <hr key='separator' style={{position: 'absolute', top: electionInfo.candidatesToRank * candidateContainerSpace - 1.5 * (candidateContainerGap / 2), width: '100%'}} />
            }
        </div>
        <div className='submitContainer' >
            <button type='button' data-testid='cast-vote' onClick={handleButtonClick}>Submit</button>
            <button type='button' data-testid='cast-empty-vote' onClick={handleEmptyVote} style={{backgroundColor: 'red'}}>Cast empty vote</button>
        </div>
        </>
    )
}

export default RankedElectionView