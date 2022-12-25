import { useState } from "react"

const useLineMan = () => {
    const [lastShots, setLastShots] = useState([])
    const [selection, setSelection] = useState([])
    const [selecting, setSelecting] = useState(false)
    const addLastShots = (index) => {
        if (Array.isArray(index)) return
        else
            setLastShots(prev => {
                if (prev.length === 2) prev.shift()
                return [...prev, index]
            })
    }
    const shootLine = (index, boardState, socket, cookies, enemyBoardState, enemyTargets, setEnemyBoardState) => {
        if (selection[0] === index) {
            setSelection([])
            setEnemyBoardState(prev => {
                prev[index].hover = false
                return prev
            })
            return
        }
        if (enemyBoardState[index].state !== 'missed') return
        if (selection.length === 0) {
            setSelection([index])
            setEnemyBoardState(prev => {
                prev[index].hover = 'green'
                return prev
            })
        }
        if (selection.length === 1) {
            console.log(selection[0] > index
                , (Math.floor(selection[0] / 10) === Math.floor(index / 10)))
            let result = []
            if ((Math.floor(selection[0] / 10) === Math.floor(index / 10))) {
                let start, end
                if (selection[0] > index) {
                    start = index
                    end = selection[0]
                } else {
                    start = selection[0]
                    end = index
                }
                for (let i = start + 1; i < end; i++) {
                    console.log(i)

                    if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                        console.log('failed')

                        return
                    } else {
                        result.push(i)
                    }
                }
            } else if (((selection[0] % (Math.floor(selection[0] / 10) * 10)) || selection[0]) === ((index % (Math.floor(index / 10) * 10)) || index)) {
                let start, end
                if (selection[0] > index) {
                    start = index
                    end = selection[0]
                } else {
                    start = selection[0]
                    end = index
                }
                for (let i = start; i < end; i += 10) {
                    if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                        return
                    } else {
                        result.push(i)
                    }
                }
            } else {
                return
            }
            console.log(result)
            setEnemyBoardState(prev => {
                prev[selection[0]].hover = false
                return prev
            })
            setSelection([])
            let newEnemyBoardState = { ...enemyBoardState }
            for (const item of result) {
                let hitOrMiss = enemyTargets.includes(item)
                let state = hitOrMiss ? 'hit' : 'missed'
                newEnemyBoardState[item] = { id: item, state, hover: false }
            }
            setEnemyBoardState(newEnemyBoardState)
            socket.send(JSON.stringify({ dataType: 'shot', index: result, id: cookies.user.id }))
        }
    }
    return { lastShots, setLastShots, shootLine, selecting, setSelecting }
}

export default useLineMan