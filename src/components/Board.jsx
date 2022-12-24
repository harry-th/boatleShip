import React from 'react'
import styles from '../styles/Board.module.css'
import { useAi } from '../helpers/useAi'
import shotLogic from '../helpers/shotLogic'
import boardHover from '../helpers/boardHover'
import { useEffect } from 'react'
import { useState } from 'react'
const Board = ({ player, socket, cookies, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, boatPlacements,
  setBoatPlacements, boats, setBoats, setEnemyBoatPlacement, enemyBoatPlacements, enemyBoats,
  gameProgress, setGameProgress, turn, setTurn, vsAi, boatNames, setBoatNames, enemyName, setCookie }) => {

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

    } else if (turn || vsAi) {
      let callback = vsAi ? () => {
        aiAttack(boardState, setBoardState, boatPlacements, setBoatPlacements, targets)
      }
        : () => {
          setTurn(false)
          sessionStorage.setItem('turn', JSON.stringify(false))
          socket.send(JSON.stringify({ dataType: 'shot', index, id: cookies.user.id }))
        }

      shotLogic(callback,
        index, enemyTargets, enemyBoardState,
        setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement,
        setGameProgress, cookies, setCookie
      )
      sessionStorage.setItem('enemyBoardState', JSON.stringify(enemyBoardState))
    }
  }



  let element = (index) => {
    let boardClass = player === 'player' ? boardState : enemyBoardState
    let condition = player === 'ai' && gameProgress === 'ongoing' ? true : player === 'player' && gameProgress === 'placement' && boats.length ?
      true : false
    let interactivity = condition ? 'active' : 'inactive'
    return <div key={index}
      onClick={() => {
        checkHit(index)
      }}
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
      {player === 'ai' ? enemyName : cookies.user.name}
      <button onClick={() => { console.log(enemyBoatPlacements, enemyTargets) }}>print</button>
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
