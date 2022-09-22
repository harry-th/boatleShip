import { useState } from 'react';
import './App.css';
import Board from './Board'

function App() {
  const generateBoard= () => {
    const setBoard = () => {
      let answer = {}
      for (let i = 0; i < 100; i++) {
       answer['a'+i]= ''
      }
      return answer
    }
    let board = setBoard()
    return board
  }

  const generateTargets = () => {
    let targets = []
    let i = 0;
    while (i<10) {
      targets.push(Math.floor(Math.random()*100))
      i++
    }
    return targets
  }

const [enemyBoardState, setEnemyBoardState] = useState(generateBoard())

  return (
    <div className="App">
      <div style={{marginTop:'30px',marginBottom:'30px'}}>WELCOME TO BATTLESHIP</div>
      <div style={{display:'flex', justifyContent: 'space-evenly'}}>
        <Board board={generateBoard()} player={'player'} setEnemyBoardState={setEnemyBoardState} enemyBoardState={enemyBoardState} targets={generateTargets()} />
        <Board player={'ai'} enemyBoardState={enemyBoardState} targets={generateTargets()} />
      </div>
    </div>
  );
}

export default App;