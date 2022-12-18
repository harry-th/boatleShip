let shotLogic = (playerOrAiCallback, index, enemyTargets, enemyBoardState, setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement) => {
    let hitOrMiss = enemyTargets.includes(index)
    let state = hitOrMiss ? 'hit' : 'missed'
    let newState = { ...enemyBoardState }
    newState[index] = { id: index, state, hover: false }
    setEnemyBoardState(newState)
    if (hitOrMiss) {
        const allHits = Object.values(newState).filter((item) => {
            return item.state === 'hit'
        }).map((el) => el.id)
        for (const boat in enemyBoatPlacements) {
            if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                setEnemyBoatPlacement(prev => {
                    prev[boat].sunk = true
                    if (Object.values(enemyBoatPlacements).filter((i) => i.sunk).length === 4) alert('you WIN!')
                    return { ...prev }
                })
                alert(`${enemyBoatPlacements[boat].name} was sunk!`)
            }
        }

        alert('Nice Shot!')
    }
    playerOrAiCallback()
}
export default shotLogic