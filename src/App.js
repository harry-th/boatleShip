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

 
 


const [enemyBoardState, setEnemyBoardState] = useState(generateBoard())

  return (
    <div className="App">
      <div style={{marginTop:'30px',marginBottom:'30px'}}>WELCOME TO BATTLESHIP</div>
      <div style={{display:'flex', justifyContent: 'space-evenly'}}>
        <Board board={generateBoard()} player={'player'} setEnemyBoardState={setEnemyBoardState} enemyBoardState={enemyBoardState}  />
        <Board player={'ai'} enemyBoardState={enemyBoardState} />
      </div>
    </div>
  );
}

export default App;