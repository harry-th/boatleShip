import React, { useEffect, useState } from 'react'
import styles from './Board.module.css'
const  Board = (board, player) => { 
console.log(board.player)
  const generateTargets = () => {
    let targets = []
    let i = 0;
    while (i<10) {
      targets.push(Math.floor(Math.random()*100))
      i++
    }
    setTargets(targets)
  }

const [boardState, setBoardState] = useState(board.board)
const [targets, setTargets] = useState()



useEffect(()=>{
  generateTargets()
},[])

  const checkHit = (index) => {
    let hitOrMiss = Object.values(targets).includes(index)
    console.log(hitOrMiss, index, targets)
    let state = hitOrMiss ? 'hit!' : 'missed!'
    let newState = {...boardState}
    newState['a'+index] = state
    setBoardState(newState)
   
    if (hitOrMiss) {
      alert('HIT!')
    }
  }
// console.log(boardState['a0'])
    let element = (index) => { return <div key={index} style={{'backgroundColor':  boardState['a'+index] === 'missed!' ? 'white' : boardState['a'+index] === 'hit!' ? 'red' : 'blue'}}
  onClick={()=>checkHit(index)}
  className={styles.square}
  >
      {index}
      </div>}
    // let item = 'a'
  return (
    <div style={{width:'400px', height:'400px', 'pointerEvents': board.player==='player' ? 'auto' : 'none'}}>
       {[...Array(100)].map((e, i) => <>{element(i)}</>)}
    </div>
  );
}

export default Board;
