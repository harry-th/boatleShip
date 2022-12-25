const placementLogic = (index, orientation, boats, boatNames, targets, boardState, vsAi, setGameProgress, setTargets, setBoatPlacements, setBoardState, setBoats, setBoatNames) => {
    let num = [...boats].shift()
    let boatName = [...boatNames].shift()

    let positions = Array(num).fill().map((item, i) => {
        return orientation === 'h' ? index + i : index + i * 10
    })
    if (positions.some((pos) => targets.includes(pos))) return
    if (orientation === 'h' && (Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return
    if (orientation === 'v' && positions[positions.length - 1] > 99) return
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

export default placementLogic