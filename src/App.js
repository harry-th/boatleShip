import { useEffect, useState } from 'react';
import './App.css';
import Board from './Board'
import { useAi } from './useAi';
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
var randomstring = require("randomstring");

function App() {

  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [socket, setSocket] = useState(null);
  const [turn, setTurn] = useState(true);
  const [vsAi, setVsAi] = useState(false)

  const [orientation, setOrientation] = useState('h')
  const [boatPlacements, setBoatPlacements] = useState([])
  const [gameProgress, setGameProgress] = useState('placement')
  const [boardState, setBoardState] = useState(generateBoard())
  const [boats, setBoats] = useState([2, 3, 4, 5])
  const [targets, setTargets] = useState([])

  const [enemyBoatPlacements, setEnemyBoatPlacements] = useState([])
  const [enemyBoats, setEnemyBoats] = useState([2, 3, 4, 5])
  const [enemyBoardState, setEnemyBoardState] = useState(generateBoard())
  const [enemyTargets, setEnemyTargets] = useState()


  useEffect(() => {
    if (Object.keys(cookies).length === 0) setCookie('user', { id: randomstring.generate(), state: 'matching' })
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    newSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log(message)
      if (message.turn) {
        setTurn(false)
      }
      if (message.state === 'matched') {
        setCookie('user', { id: cookies.user.id, state: 'matched' })
        setGameProgress('placement')
      } else if (message.state === 'ongoing') {
        setCookie('user', { id: cookies.user.id, state: 'ongoing' })
        setGameProgress('ongoing')
        setEnemyBoatPlacements(message.boatPlacements)
        setEnemyTargets(Object.values(message.boatPlacements).map(item => item.positions).flat())
        setTargets(Object.values(boatPlacements).map(i => i.positions).flat())
      } else if (message.dataType === 'shot') {
        setTurn(true)
        let hitOrMiss = (targets).includes(Number(message.index))
        let state = hitOrMiss ? 'hit' : 'missed'
        let newState = { ...boardState }
        newState[message.index] = { id: message.index, state, hover: false }
        setBoardState(newState)
        if (hitOrMiss) {
          const allHits = Object.values(newState).filter((item) => {
            return item.state === 'hit'
          }).map((el) => Number(el.id))
          for (const boat in boatPlacements) {
            if (!boatPlacements[boat].sunk && boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
              setBoatPlacements(prev => {
                prev[boat].sunk = true
                return { ...prev }
              })
              alert(`${boatPlacements[boat].name} was sunk!`)
            }
          }
          if (Object.values(boatPlacements).filter((i) => i?.sunk).length === 4) console.log('You Lose!')

          alert('you got HIT!')
        }
      }
    };

    setSocket(newSocket);
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [targets, cookies, boatPlacements, boardState, setBoardState, setBoatPlacements, setCookie, setEnemyTargets, setEnemyBoatPlacements])



  const { generateTargets } = useAi()

  const setInformation = (e) => {
    e.preventDefault()
    console.log(Object.values(e.target))
    let data = Object.values(e.target).filter(i => i.name).map(item => item.value)
    console.log(data)
    let yourBoats = boatPlacements
    for (const boat in yourBoats) {
      yourBoats[boat].name =
    }
  }

  return (
    <div className="App">
      <button onClick={() => {
        console.log(cookies)
        setVsAi(false)
        socket.send(JSON.stringify({ ...cookies.user }))
      }}>find game</button>
      <button onClick={() => {
        setVsAi(true)
        setEnemyTargets(generateTargets(enemyBoats, setEnemyBoatPlacements))
      }}>play Ai</button>
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>WELCOME TO BATTLESHIP</div>

      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <div>

        </div>
        {(cookies?.user?.state === 'matched' || vsAi || cookies?.user?.state === 'ongoing') ? <>
          <button onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>
          <Board board={generateBoard()} player={'player'} socket={socket} cookies={cookies}
            boardState={boardState} setBoardState={setBoardState} enemyTargets={enemyTargets}
            enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
            setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
            targets={targets} setTargets={setTargets} vsAi={vsAi} />
          <Board player={'ai'} enemyBoardState={enemyBoardState} socket={socket} cookies={cookies}
            setEnemyBoardState={setEnemyBoardState} boardState={boardState} setBoardState={setBoardState}
            gameProgress={gameProgress} setGameProgress={setGameProgress}
            enemyBoatPlacements={enemyBoatPlacements} boats={boats}
            setEnemyBoatPlacement={setEnemyBoatPlacements}
            targets={targets} setTargets={setTargets}
            turn={turn} setTurn={setTurn}
            enemyTargets={enemyTargets} setEnemyTargets={setEnemyTargets}
            enemyBoats={enemyBoats} boatPlacements={boatPlacements} setBoatPlacements={setBoatPlacements}
            vsAi={vsAi} />
        </> : <>
          <form onSubmit={(e) => setInformation(e)}>
            <label for='name'>name</label>
            <input name='name' />
            <label for='boat1'>destroyer</label>
            <input name='boat1' />
            <label for='boat2'>cruiser</label>
            <input name='boat2' />
            <label for='boat3'>battleship</label>
            <input name='boat3' />
            <label for='boat4'>carrier</label>
            <input name='boat4' />
            <button>submit</button>
          </form>
        </>}
      </div>
    </div>
  );
}

export default App;