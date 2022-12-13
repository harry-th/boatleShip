import { useState } from 'react';
import './App.css';
import Board from './Board'

function App() {
  const generateBoard = () => {
    const setBoard = () => {
      let answer = {}
      for (let i = 0; i < 100; i++) {
        answer[i] = { state: null, hover: false }
      }
      return answer
    }
    let board = setBoard()
    return board
  }

  const [enemyBoatPlacements, setEnemyBoatPlacements] = useState([])
  const [enemyBoats, setEnemyBoats] = useState([2, 3, 4, 5])


  const generateTargets = () => {
    let targets = []
    let boatPlacementsHolder = null
    let q = 0;
    while (q < enemyBoats.length) {
      let orientationTruth = Math.random() > 0.5
      let orientation = orientationTruth ? 'h' : 'v'
      let boundaries = orientationTruth ? Array(10).fill().map((item, i) => i && (i * 10)).filter(item => item) : Array(10).fill().map((item, i) => i + 100)
      let boatLength = [...enemyBoats][q]
      let array = []
      for (const b of boundaries) {
        for (let i = 1; i < boatLength; i++) {
          orientationTruth ? array.push(b - i) : array.push(b - i * 10)
        }
      }
      boundaries = boundaries.concat(array)

      if (boatPlacementsHolder) {
        for (const boatP in boatPlacementsHolder) {
          if (orientationTruth) {
            boundaries.push(...boatPlacementsHolder[boatP].positions)
            for (const pos of boatPlacementsHolder[boatP].positions) {
              for (let i = 1; i <= boatLength; i++) {
                boundaries.push(pos - i)
              }
            }
          } else {
            boundaries.push(...boatPlacementsHolder[boatP].positions)
            for (const pos of boatPlacementsHolder[boatP].positions) {
              for (let i = 1; i <= boatLength; i++) {
                boundaries.push(pos - i * 10)
              }
            }
          }
        }
      }
      let useableBoard = Array(100).fill().map((non, i) => {
        return i
      }).filter((item) => {
        return !boundaries.includes(item)
      })
      let index = useableBoard[Math.floor(Math.random() * useableBoard.length)]
      let positions = Array(boatLength).fill().map((item, i) => {
        return orientation === 'h' ? index + i : index + i * 10
      })
      targets = targets.concat(positions)
      boatPlacementsHolder = { ...boatPlacementsHolder, [q]: { positions, orientation, length: boatLength } }
      //   return { ...prev, [prev.length]: { positions, orientation, length: boatLength } }
      // })
      q++
    }
    // setEnemyBoatPlacements(boatPlacementsHolder)
    return targets
  }

  const [orientation, setOrientation] = useState('h')
  const [boatPlacements, setBoatPlacements] = useState([])
  const [gameProgress, setGameProgress] = useState('placement')
  const [boardState, setBoardState] = useState(generateBoard())
  const [enemyBoardState, setEnemyBoardState] = useState(generateBoard())
  const [targets, setTargets] = useState([])
  const [enemyTargets, setEnemyTargets] = useState()
  const [boats, setBoats] = useState([2, 3, 4, 5])

  return (
    <div className="App">
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>WELCOME TO BATTLESHIP</div>
      <button onClick={() => { setEnemyTargets(generateTargets()) }}>start game</button>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <div>
          <button onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>
          <button onClick={() => {
            let newBoats = [...boats]
            newBoats.unshift(boatPlacements[boatPlacements.length - 1].length)
            setBoatPlacements(prev => prev.slice(0, prev.length - 1))
            setBoats(newBoats)
          }}>
            unplace the last boat
          </button>
        </div>
        <Board board={generateBoard()} player={'player'} boardState={boardState}
          setBoardState={setBoardState} enemyTargets={enemyTargets}
          enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
          setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
          orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
          targets={targets} setTargets={setTargets} />
        <Board player={'ai'} enemyBoardState={enemyBoardState}
          setEnemyBoardState={setEnemyBoardState} boardState={boardState} setBoardState={setBoardState}
          gameProgress={gameProgress} setGameProgress={setGameProgress}
          targets={targets} setTargets={setTargets}
          enemyTargets={enemyTargets} setEnemyTargets={setEnemyTargets} />
      </div>
    </div>
  );
}

export default App;