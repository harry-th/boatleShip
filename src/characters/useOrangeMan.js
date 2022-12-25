import { useState } from "react"

let useOrangeMan = () => {
    const [bluffing, setBluffing] = useState(false)
    const [bluffShots, setBluffShots] = useState([])
    const orangeShot = (playerOrAiCallback, index, enemyTargets, enemyBoardState,
        setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement, setBoardState) => {
        if (bluffing) {
            setBluffShots(prev => [...prev, index])
            console.log(bluffShots)
            setBoardState(prev => {
                let oldProtected = Object.values(prev).findIndex(i => i.hover === 'protected')
                if (prev[oldProtected]?.hover) prev[oldProtected].hover = false
                prev[index].hover = 'protected'
                return prev
            })
        } else {
            let hitOrMiss = enemyTargets.includes(index)
            let state = hitOrMiss ? 'hit' : 'missed'
            let newState = { ...enemyBoardState }
            newState[index] = { id: index, state, hover: false }
            setBoardState(prev => {
                let oldProtected = Object.values(prev).findIndex(i => i.hover === 'protected')
                if (prev[oldProtected]?.hover) prev[oldProtected].hover = false
                prev[index].hover = 'protected'
                return prev
            })
            setEnemyBoardState(newState)
            if (hitOrMiss) {
                const allHits = Object.values(newState).filter((item) => {
                    return item.state === 'hit'
                }).map((el) => el.id)
                for (const boat in enemyBoatPlacements) {
                    if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                        setEnemyBoatPlacement(prev => {
                            prev[boat].sunk = true
                            return { ...prev }
                        })
                        alert(`${enemyBoatPlacements[boat].name} was sunk!`)
                    }
                }

                alert('Nice Shot!')
            }
        }
        playerOrAiCallback(index, { bluffing, orange: true })
    }
    const fireBluffShots = (socket, enemyBoardState, enemyTargets, cookies, setEnemyBoardState) => {
        console.log(bluffShots)

        let retaliation = []
        let newEnemyBoardState = { ...enemyBoardState }
        let openShots = Object.values({ ...enemyBoardState }).filter(item => item.state === null)
        console.log({ openShots })
        outerLoop: for (let i = 0; i < bluffShots.length; i++) {
            for (let j = 0; j < 3; j++) {
                let random = Math.floor(Math.random() * openShots.length)
                let hitOrMiss = enemyTargets.includes(openShots[random].id)
                let state = hitOrMiss ? 'hit' : 'missed'
                newEnemyBoardState[openShots[random].id] = { id: openShots[random].id, state, hover: false }
                console.log(openShots[random].id)
                retaliation.push(openShots[random].id)
                openShots.splice(random, 1)
                if (openShots.length === 0) break outerLoop
            }
        }
        setEnemyBoardState(newEnemyBoardState)
        console.log(retaliation)
        socket.send(JSON.stringify({ dataType: 'shot', index: retaliation, id: cookies.user.id, bluffArray: bluffShots }))
    }
    return { bluffing, setBluffing, bluffShots, setBluffShots, orangeShot, fireBluffShots }
}

export default useOrangeMan