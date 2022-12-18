import React from 'react'
import styles from './styles/Board.module.css'
import { useAi } from './useAi'
import shotLogic from './helpers/shotLogic'
import boardHover from './helpers/boardHover'
import { useEffect } from 'react'
import { useState } from 'react'
const Board = ({ player, socket, cookies, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, boatPlacements,
  setBoatPlacements, boats, setBoats, setEnemyBoatPlacement, enemyBoatPlacements, enemyBoats,
  gameProgress, setGameProgress, turn, setTurn, vsAi }) => {
  const [dataSent, setDataSent] = useState(false)
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
  useEffect(() => {
    if (!vsAi) {
      if (Object.keys(boatPlacements).length === 4 && !dataSent) {
        socket.onopen = () => {
          setDataSent(true)
          socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
        }
      }
    }
  }, [vsAi, socket, boatPlacements, cookies, dataSent])


  let { aiAttack } = useAi()

  const checkHit = (index) => {
    if (gameProgress === 'placement') {

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
        return ({ ...prev, [num]: { name: `boat${num}`, positions, orientation, length: num } })
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
    } else if (turn || vsAi) {
      let callback = vsAi ? () => {
        aiAttack(boardState, setBoardState, boatPlacements, setBoatPlacements, targets)
      }
        : () => {
          setTurn(false)
          socket.send(JSON.stringify({ dataType: 'shot', index, id: cookies.user.id }))
        }

      shotLogic(callback,
        index, enemyTargets, enemyBoardState,
        setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement
      )
    }
  }



  let element = (index) => {
    let boardClass = player === 'player' ? boardState : enemyBoardState
    let condition = player === 'ai' ? !boats.length : boats.length
    let interactivity = condition ? 'active' : 'inactive'
    return <div key={index}
      onClick={() => checkHit(index)}
      onMouseEnter={() => boardHover(index, gameProgress, boardState, boats, orientation, setBoardState)}
      className={[styles.square, styles[interactivity],
      boardClass && styles[(boardClass)[index].state],
      boardClass && styles[(boardClass)[index].hover]
      ].join(' ')
      }>
      {index}
    </div >
  }

  return (
    <div>
      <button onClick={() => { console.log(boatPlacements, enemyBoatPlacements, gameProgress) }}>print</button>
      {(gameProgress === 'YOU WON' || gameProgress === 'YOU LOSE') ? <p>{gameProgress}</p> : ""}
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
