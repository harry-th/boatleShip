import React from 'react'
import styles from '../styles/Board.module.css'
import { useAi } from '../helpers/useAi'
import shotLogic from '../helpers/shotLogic'
import boardHover from '../helpers/boardHover'
import placementLogic from '../helpers/placementLogic'
import cornerMan from '../characters/cornerMan'
import useLineMan from '../characters/useLineMan'
const Board = ({ player, socket, cookies, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, boatPlacements,
  setBoatPlacements, boats, setBoats, setEnemyBoatPlacement, enemyBoatPlacements, enemyBoats,
  gameProgress, setGameProgress, turn, setTurn, vsAi, boatNames, setBoatNames, enemyName, setCookie,
  character, orangeShot, selecting, setSelecting, turnNumber, setTurnNumber, turnTime, dataSent, setCharges }) => {

  let { aiAttack } = useAi()
  let { cornerManPlacement, cornerHover, cornerShot } = cornerMan()
  let { shootLine } = useLineMan()
  const checkHit = (index) => {

    if (gameProgress === 'placement') {
      character === 'cornerMan' ?
        cornerManPlacement(index, orientation, boats, boatNames, targets, boardState, vsAi, setGameProgress, setTargets, setBoatPlacements, setBoardState, setBoats, setBoatNames)
        : placementLogic(index, orientation, boats, boatNames, targets, boardState, vsAi, setGameProgress, setTargets, setBoatPlacements, setBoardState, setBoats, setBoatNames)

    } else if (turn || vsAi) {
      let callback = vsAi ? () => {
        aiAttack(boardState, setBoardState, boatPlacements, setBoatPlacements, targets)
      }
        : (shot, shotData) => {
          let freeShot
          if (enemyBoardState[shot] === 'missed') return
          if (turnNumber !== 4) setTurn(false)
          if (turnNumber >= 4) {
            setTurnNumber(0)
            freeShot = true
          }
          sessionStorage.setItem('turn', JSON.stringify(false))
          if (character === 'orangeMan') socket.send(JSON.stringify({ dataType: 'shot', index: shot, id: cookies.user.id, freeShot, ...shotData }))
          else
            socket.send(JSON.stringify({ dataType: 'shot', index: shot, id: cookies.user.id, freeShot }))
        }
      character === 'cornerMan' ?
        cornerShot(callback,
          index, enemyTargets, enemyBoardState,
          setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement,

        ) : character === 'orangeMan' ?
          orangeShot(callback,
            index, enemyTargets, enemyBoardState,
            setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement,
            setBoardState
          ) : character === 'lineMan' && selecting ?
            shootLine(index, boardState, socket, cookies, enemyBoardState, enemyTargets, setBoardState, setEnemyBoardState, setTurn, setSelecting, enemyBoatPlacements, setEnemyBoatPlacement, setCharges)
            : shotLogic(callback,
              index, enemyTargets, enemyBoardState,
              setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement,

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
        if (boardClass[index].state === null || boardClass[index].state === 'selectable') checkHit(index)
      }}
      onMouseEnter={() =>
        character === 'cornerMan' ?
          cornerHover(index, gameProgress, boardState, boats, orientation, setBoardState) :
          boardHover(index, gameProgress, boardState, boats, orientation, setBoardState)
      }
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
      {(player === 'player') && turnTime}

      <button onClick={() => { console.log(dataSent, gameProgress, boatPlacements) }}>print</button>
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
