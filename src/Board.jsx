import React, { useState } from 'react'
import styles from './styles/Board.module.css'
const Board = ({ player, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, setBoatPlacements, boats, setBoats,
  gameProgress, setGameProgress }) => {


  const [yourHits, setHits] = useState(0)
  const [enemyHits, setEnemyHits] = useState(0)

  let aiAttack = () => {
    let unknownSquare = []
    for (const square in boardState) {
      if (boardState[square].state !== 'hit' && boardState[square].state !== 'missed') {
        unknownSquare.push((square))
      }
    }
    let enemyAttack = unknownSquare[Math.floor(Math.random() * unknownSquare.length)]
    let hitOrMiss = (targets).includes(Number(enemyAttack))
    console.log(enemyAttack, hitOrMiss, targets, unknownSquare)
    let state = hitOrMiss ? 'hit' : 'missed'
    let newState = { ...boardState }
    newState[enemyAttack] = { state, hover: false }
    setBoardState(newState)
    if (hitOrMiss) {
      setEnemyHits((enemyHits) => enemyHits + 1)
      if (enemyHits >= 5) setGameProgress('YOU LOSE')
      alert('you got HIT!')
    }
  }

  const checkHit = (index) => {
    if (gameProgress === 'placement') {
      if (boats.length === 1) {
        setGameProgress('ongoing')
      }
      let num = [...boats].shift()
      let positions = Array(num).fill().map((item, i) => {
        return orientation === 'h' ? index + i : index + i * 10
      })
      if (positions.some((pos) => targets.includes(pos))) return
      if ((Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return
      setTargets(p => [...p, ...positions])
      setBoatPlacements(prev => {
        return ({ ...prev, [prev.length]: { positions, orientation, length: num } })
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
    } else {
      let hitOrMiss = enemyTargets.includes(index)
      let state = hitOrMiss ? 'hit' : 'missed'
      let newState = { ...enemyBoardState }
      newState[index] = { state, hover: false }
      setEnemyBoardState(newState)
      if (hitOrMiss) {
        setHits((hits) => hits + 1)
        if (yourHits >= 5) setGameProgress('YOU WON')
        alert('Nice Shot!')
      }
      aiAttack()
    }
  }



  let element = (index) => {
    let boardClass = player === 'player' ? boardState : enemyBoardState

    return <div key={index}
      onClick={() => checkHit(index)}

      onMouseEnter={() => {
        if (gameProgress === 'placement' && boardState) {
          let coords = []
          for (let i = 0; i < boats[0]; i++) {
            coords.push(orientation === 'h' ? index + i : index + i * 10)
          }
          let newBoardState = { ...boardState }
          for (let i = 0; i < coords.length; i++) {
            if (boardState[coords[i]].state === 'mine') return
          }
          // console.log((Math.floor(coords[coords.findIndex((r) => r === square)] / 10) * 10), (Math.floor(coords[0] / 10) * 10))

          for (const square in newBoardState) {
            if (coords.includes(Number(square)) && ((Math.floor(coords[coords.findIndex((r) => r === square) + 1] / 10) * 10) - (Math.floor(square / 10) * 10) === 0)) {
              newBoardState[square].hover = 'hover'
            } else if (newBoardState[square].hover === 'hover') {
              newBoardState[square].hover = false
            }
          }
          setBoardState(newBoardState)
        }
      }
      }
      className={[styles.square,
      boardClass && styles[(boardClass)[index].state],
      boardClass && styles[(boardClass)[index].hover]
      ].join(' ')
      }>
      {index}
    </div >
  }

  return (
    <div>
      <button onClick={() => { console.log(targets, enemyTargets) }}>print</button>
      {(gameProgress === 'YOU WON' || gameProgress === 'YOU LOSE') ? <p>{gameProgress}</p> : ""}
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
