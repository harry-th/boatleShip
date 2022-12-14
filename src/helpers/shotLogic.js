let shotLogic = (playerOrAiCallback
    , index
    , enemyTargets
    , enemyBoardState
    , setEnemyBoardState
    , enemyBoatPlacements
    , setEnemyBoatPlacements
    , hitDisplayLogic

) => {
    let hitOrMiss = enemyTargets.includes(index)
    let state = hitOrMiss ? 'hit' : 'missed'
    let newState = { ...enemyBoardState }
    newState[index] = { id: index, state, hover: false }
    setEnemyBoardState(newState)
    if (hitOrMiss) {
        hitDisplayLogic.hit(index, hitOrMiss, state)

        const allHits = Object.values(newState).filter((item) => {
            return item.state === 'hit'
        }).map((el) => el.id)
        for (const boat in enemyBoatPlacements) {
            if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                setEnemyBoatPlacements(prev => {
                    prev[boat].sunk = true
                    return { ...prev }
                })
                hitDisplayLogic.sink(enemyBoatPlacements[boat].name)
            }
        }
    } else {
        hitDisplayLogic.hit(index, hitOrMiss, state)
    }
    playerOrAiCallback(index)
}
export default shotLogic

