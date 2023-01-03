import { useState } from "react"

let useOrangeMan = () => {
    const [bluffing, setBluffing] = useState(sessionStorage.getItem('bluffing') ? JSON.parse(sessionStorage.getItem('bluffing')) : false)
    const [bluffShots, setBluffShots] = useState(sessionStorage.getItem('bluffShots') ? JSON.parse(sessionStorage.getItem('bluffShots')) : [])
    const orangeShot = (playerOrAiCallback, index, enemyTargets, enemyBoardState,
        setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacements, setBoardState) => {
        if (bluffing) {
            setBluffShots(prev => {
                sessionStorage.setItem('bluffShots', JSON.stringify([...prev, index]))
                return [...prev, index]
            })
            console.log(bluffShots)
            setBoardState(prev => {
                let oldProtected = Object.values(prev).findIndex(i => i.hover === 'protected')
                if (prev[oldProtected]?.hover) prev[oldProtected].hover = false
                prev[index].hover = 'protected'
                sessionStorage.setItem('boardState', JSON.stringify(prev))
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
                sessionStorage.setItem('boardState', JSON.stringify(prev))
                return prev
            })
            setEnemyBoardState(newState)
            if (hitOrMiss) {
                alert('Nice Shot!')
                const allHits = Object.values(newState).filter((item) => {
                    return item.state === 'hit'
                }).map((el) => el.id)
                for (const boat in enemyBoatPlacements) {
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
                retaliation.push(openShots[random].id)
                openShots.splice(random, 1)
                if (openShots.length === 0) break outerLoop
            }
        }
        setEnemyBoardState(newEnemyBoardState)
        console.log(retaliation)
        socket.send(JSON.stringify({ dataType: 'shot', index: retaliation, id: cookies.user.id, bluffArray: bluffShots }))
    }
    const OrangeManUI = ({ turn, setTurn, socket, enemyBoardState, enemyTargets, cookies, setEnemyBoardState }) => {
        return (<div>
            <button onClick={() => {
                if (bluffing === null) return
                if (turn) {
                    if (bluffing !== 'ready') {
                        setBluffing(prev => {
                            sessionStorage.setItem('bluffing', JSON.stringify(!prev))
                            return !prev
                        })
                    }
                    if (bluffing === 'ready') {
                        setTurn(false)
                        setBluffing(null)
                        fireBluffShots(socket, enemyBoardState, enemyTargets, cookies, setEnemyBoardState)
                    }
                }
            }}>{bluffing === 'ready' ? 'fire Retaliation' :
                bluffing === null ? 'fired' : bluffing ? 'stop Bluffing ' : 'start Bluffing'}</button>
        </div>)
    }
    return { bluffing, setBluffing, bluffShots, setBluffShots, orangeShot, fireBluffShots, OrangeManUI }
}

export default useOrangeMan