import React, {useState } from 'react'
import styles from './Board.module.css'
const  Board = ({player, enemyBoardState, setEnemyBoardState, board, targets}) => { 
// console.log(enemyBoardState)



  const [boardState, setBoardState] = useState(board)
  const [yourHits, setHits] = useState(0)
  const [enemyHits, setEnemyHits] = useState(0)




let aiAttack = () => {
  let enemyAttack = Math.floor(Math.random()*100)
  let hitOrMiss = Object.values(targets).includes(enemyAttack)
  let state = hitOrMiss ? 'hit!' : 'missed!'
  console.log(enemyBoardState)
  let newState = {...enemyBoardState}
  newState['a'+enemyAttack] = state
  setEnemyBoardState(newState)
  if (hitOrMiss) {
    setEnemyHits((enemyHits)=>enemyHits+1)
    if(enemyHits>=10) alert('you LOSE')

    alert('you got HIT!')
  }
}


  const checkHit = (index) => {
    let hitOrMiss = Object.values(targets).includes(index)
    // console.log(hitOrMiss, index, targets)
    let state = hitOrMiss ? 'hit!' : 'missed!'
    let newState = {...boardState}
    newState['a'+index] = state
    setBoardState(newState)
    if (hitOrMiss) {
    setHits((hits)=>hits+1)
    console.log(yourHits)
    if(yourHits>8) alert('you Win')
      alert('Nice Shot!')
    }
    aiAttack()
  }
// console.log(boardState['a0'])
    let element = (index) => { 
      let squareID = ''
      player === 'player' ? squareID = boardState['a'+index] : squareID = enemyBoardState['a'+index]
      return <div key={index} style={{'backgroundColor':  squareID === 'missed!' ? 'white' : squareID === 'hit!' ? 'red' : 'blue'}}
  onClick={()=>checkHit(index)}
  className={styles.square}
  >
      {index}
      </div>}
  return (
    <div style={{width:'400px', height:'400px', 'pointerEvents': player==='player' ? 'auto' : 'none'}}>
       {[...Array(100)].map((e, i) => <>{element(i)}</>)}
    </div>
  );
}

export default Board;
