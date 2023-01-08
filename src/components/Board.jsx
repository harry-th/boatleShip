import React from 'react'
import styles from '../styles/Board.module.css'
import { useAi } from '../helpers/useAi'
import shotLogic from '../helpers/shotLogic'
import boardHover from '../helpers/boardHover'
import placementLogic from '../helpers/placementLogic'
import cornerMan from '../characters/cornerMan'
import useLineMan from '../characters/useLineMan'
import generateBoard from '../helpers/generateBoard'
import { useState } from 'react'
const Board = ({ player, socket, cookies, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, boatPlacements,
  setBoatPlacements, boats, setBoats, setEnemyBoatPlacement, enemyBoatPlacements, enemyBoats,
  gameProgress, setGameProgress, turn, setTurn, vsAi, boatNames, setBoatNames, enemyName, setCookie,
  character, orangeShot, selecting, setSelecting, turnNumber, setTurnNumber,
  turnTime, dataSent, setCharges, freeShotMiss, setFreeShotMiss, setMessages }) => {

  let { aiAttack } = useAi()
  let { cornerManPlacement, cornerHover, cornerShot } = cornerMan()
  let { shootLine } = useLineMan()
  const [hoverState, setHoverState] = useState(generateBoard(true, true))
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
          else if (!turnNumber || turnNumber % 4 !== 0) {
            setTurn(false)
            sessionStorage.setItem('turn', JSON.stringify(false))
          } else if (turnNumber && turnNumber % 4 === 0) {
            if (!freeShotMiss) {
              setFreeShotMiss(prev => prev + 1)
              freeShot = true
            }
            else {
              setTurn(false)
              sessionStorage.setItem('turn', JSON.stringify(false))
              setFreeShotMiss(prev => prev - 1)
            }
          }
          if (character === 'orangeMan') socket.send(JSON.stringify({ dataType: 'shot', index: shot, id: cookies.user.id, freeShot, ...shotData }))
          else
            socket.send(JSON.stringify({ dataType: 'shot', index: shot, id: cookies.user.id, freeShot }))
        }

      //message read out logic for shot processing
      let hitDisplayLogic = {
        hit: (index, hitOrMiss, state) => {
          if (Array.isArray(index)) {
            setMessages(prev => {
              return [...prev, `You fired a volley of shots at ${index.join(', ')}!`]
            })
          } else {
            setMessages(prev => {
              if (hitOrMiss) return [...prev, `You fired at ${index} and it was a ${state}!`]
              else return [...prev, `You fired at ${index} but it ${state}!`]
            })
          }
        },
        sink: (name) => {
          setMessages(prev => {
            return [...prev, `You sunk their ${name}`]
          })
        }
      }
      character === 'cornerMan' ?
        cornerShot(callback,
          index, enemyTargets, enemyBoardState,
          setEnemyBoardState, enemyBoatPlacements,
          setEnemyBoatPlacement, hitDisplayLogic
        ) : character === 'orangeMan' ?
          orangeShot(callback,
            index, enemyTargets, enemyBoardState,
            setEnemyBoardState, enemyBoatPlacements, setEnemyBoatPlacement,
            setBoardState, hitDisplayLogic
          ) : character === 'lineMan' && selecting ?
            shootLine(index, boardState, socket, cookies, enemyBoardState,
              enemyTargets, setBoardState, setEnemyBoardState, setTurn, setSelecting,
              enemyBoatPlacements, setEnemyBoatPlacement, setCharges, freeShotMiss,
              hitDisplayLogic
            ) : shotLogic(callback,
              index, enemyTargets, enemyBoardState,
              setEnemyBoardState, enemyBoatPlacements,
              setEnemyBoatPlacement, hitDisplayLogic

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
          cornerHover(index, gameProgress, hoverState, boats, orientation, setHoverState) :
          boardHover(index, gameProgress, hoverState, boats, orientation, setHoverState)
      }
      className={[styles.square, styles[interactivity],
      boardClass && styles[(boardClass)[index].state],
      boardClass && styles[(boardClass)[index].hover],
      (player === 'player' && gameProgress === 'placement') && styles[(hoverState)[index].hover]
      ].join(' ')
      }>
      {index}
    </div >
  }

  return (
    <div>
      {player === 'ai' ? enemyName : cookies.user.name}
      {(player === 'player') && <span> Turn Timer:{turnTime}</span>}

      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
