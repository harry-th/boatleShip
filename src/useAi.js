export function useAi() {


    const generateTargets = (enemyBoats, setEnemyBoatPlacements) => {
        let targets = []
        let boatPlacementsHolder = null
        let q = 0;
        while (q < enemyBoats.length) {
            let orientationTruth = Math.random() > 0.5
            let orientation = orientationTruth ? 'h' : 'v'
            let boundaries = orientationTruth ? Array(11).fill().map((item, i) => (i * 10)).filter(item => item) : Array(10).fill().map((item, i) => i + 99)
            let boatLength = [...enemyBoats][q]
            let array = []
            for (const b of boundaries) {
                for (let i = 1; i < boatLength; i++) {
                    orientationTruth ? array.push(b - i) : array.push(b - i * 10)
                }
            }
            boundaries = boundaries.concat(array)

            if (boatPlacementsHolder) {
                for (const boatP in boatPlacementsHolder) {
                    if (orientationTruth) {
                        boundaries.push(...boatPlacementsHolder[boatP].positions)
                        for (const pos of boatPlacementsHolder[boatP].positions) {
                            for (let i = 1; i <= boatLength; i++) {
                                boundaries.push(pos - i)
                            }
                        }
                    } else {
                        boundaries.push(...boatPlacementsHolder[boatP].positions)
                        for (const pos of boatPlacementsHolder[boatP].positions) {
                            for (let i = 1; i <= boatLength; i++) {
                                boundaries.push(pos - i * 10)
                            }
                        }
                    }
                }
            }
            let useableBoard = Array(100).fill().map((non, i) => {
                return i
            }).filter((item) => {
                return !boundaries.includes(item)
            })
            let index = useableBoard[Math.floor(Math.random() * useableBoard.length)]
            let positions = Array(boatLength).fill().map((item, i) => {
                return orientation === 'h' ? index + i : index + i * 10
            })
            targets = targets.concat(positions)
            boatPlacementsHolder = { ...boatPlacementsHolder, [boatLength]: { name: `boat${boatLength}`, positions, orientation, length: boatLength } }
            q++
        }
        setEnemyBoatPlacements(boatPlacementsHolder)
        return targets
    }
    let aiAttack = (boardState, setBoardState, boatPlacements, setBoatPlacements, targets) => {
        let unknownSquare = []
        for (const square in boardState) {
            if (boardState[square].state !== 'hit' && boardState[square].state !== 'missed') {
                unknownSquare.push((square))
            }
        }
        let enemyAttack = unknownSquare[Math.floor(Math.random() * unknownSquare.length)]
        let hitOrMiss = (targets).includes(Number(enemyAttack))
        let state = hitOrMiss ? 'hit' : 'missed'
        let newState = { ...boardState }
        newState[enemyAttack] = { id: enemyAttack, state, hover: false }
        setBoardState(newState)
        if (hitOrMiss) {
            const allHits = Object.values(newState).filter((item) => {
                return item.state === 'hit'
            }).map((el) => Number(el.id))
            for (const boat in boatPlacements) {
                if (!boatPlacements[boat].sunk && boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                    setBoatPlacements(prev => {
                        prev[boat].sunk = true
                        return { ...prev }
                    })
                    alert(`${boatPlacements[boat].name} was sunk!`)
                }
            }
            if (Object.values(boatPlacements).filter((i) => i?.sunk).length === 4) console.log('You Lose!')

            alert('you got HIT!')
        }
    }
    return {
        generateTargets,
        aiAttack
    }
}