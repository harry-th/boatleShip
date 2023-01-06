let cornerMan = () => {
    const cornerManPlacement = (index, orientation, boats, boatNames, targets, boardState, vsAi, setGameProgress, setTargets, setBoatPlacements, setBoardState, setBoats, setBoatNames) => {
        let num = [...boats].shift()
        let boatName = [...boatNames].shift()

        let positions = Array(num).fill().map((item, i) => {
            return orientation === 'h' ? index + i : index + i * 10
        })
        if (positions.some((pos) => targets.includes(pos))) return
        for (let i = 0; i < positions.length; i++) {
            if (positions[i] > 99) positions[i] = positions[i] - 100
        }

        // if (orientation === 'h' && (Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return
        // if (orientation === 'v' && positions[positions.length - 1] > 99) return
        if (boats.length === 1 && vsAi) {
            setGameProgress('ongoing')
        }
        setTargets(p => [...p, ...positions])
        setBoatPlacements(prev => {
            return ({ ...prev, [boatName]: { name: boatName, positions, orientation, length: num } })
        })
        let newBoardState = { ...boardState }
        for (const square in newBoardState) {
            if (positions.includes(Number(square))) {
                newBoardState[square].state = 'mine'
            }
        }
        setBoardState(newBoardState)
        setBoats(prev => {
            return prev.slice(1, prev.length)
        })
        setBoatNames(prev => {
            return prev.slice(1, prev.length)
        })
    }
    const cornerShot = (playerOrAiCallback, index, enemyTargets, enemyBoardState, setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacements) => {
        let hitOrMiss = enemyTargets.includes(index)
        let multiple
        let state = hitOrMiss ? 'hit' : 'missed'
        let newState = { ...enemyBoardState }
        newState[index] = { id: index, state, hover: false }
        const allHits = Object.values(newState).filter((item) => {
            return item.state === 'hit'
        }).map((el) => el.id)
        if (hitOrMiss) {
            alert('Nice Shot!')

            for (const boat in enemyBoatPlacements) {
                if (allHits.includes(enemyBoatPlacements[boat].positions[0]) && allHits.includes(enemyBoatPlacements[boat].positions[enemyBoatPlacements[boat].positions.length - 1])) {
                    multiple = enemyBoatPlacements[boat].positions
                    for (const pos of multiple) {
                        newState[pos] = { id: index, state, hover: false }
                    }
                    alert(`${enemyBoatPlacements[boat].name} was sunk!`)
                } else {
                    if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                        setEnemyBoatPlacements(prev => {
                            prev[boat].sunk = true
                            return { ...prev }
                        })
                        alert(`${enemyBoatPlacements[boat].name} was sunk!`)
                    }
                }
            }
        }
        setEnemyBoardState(newState)
        playerOrAiCallback(multiple || index)
    }

    const cornerHover = (index, gameProgress, boardState, boats, orientation, setBoardState) => {
        if (gameProgress === 'placement' && boardState) {
            let coords = []
            for (let i = 0; i < boats[0]; i++) {
                coords.push(orientation === 'h' ? index + i : index + i * 10)
            }
            for (let i = 0; i < coords.length; i++) {
                if (coords[i] > 99) coords[i] = coords[i] - 100
            }
            let newBoardState = { ...boardState }
            for (let i = 0; i < coords.length; i++) {
                if (boardState[coords[i]]?.state === 'mine') return
            }

            for (const square in newBoardState) {
                if (coords.includes(Number(square))) {
                    newBoardState[square].hover = 'hover'
                } else if (newBoardState[square].hover === 'hover') {
                    newBoardState[square].hover = false
                }
            }
            setBoardState(newBoardState)
        }
    }
    return {
        cornerManPlacement,
        cornerShot,
        cornerHover
    }
}

export default cornerMan




