import { useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board'
import { useAi } from './helpers/useAi';
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
var randomstring = require("randomstring");

function App() {


  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [socket, setSocket] = useState(null);
  const [turn, setTurn] = useState(sessionStorage.getItem('turn') || true);
  const [vsAi, setVsAi] = useState(sessionStorage.getItem('vsAi') || false)

  const [orientation, setOrientation] = useState('h')
  const [boatPlacements, setBoatPlacements] = useState(sessionStorage.getItem('boatPlacements') || [])
  const [gameProgress, setGameProgress] = useState(sessionStorage.getItem('gameProgress') || 'placement')
  const [boardState, setBoardState] = useState(sessionStorage.getItem('boardState') || generateBoard())
  const [boats, setBoats] = useState(sessionStorage.getItem('boats') || [2, 3, 4, 5])
  const [targets, setTargets] = useState(sessionStorage.getItem('targets') || [])
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])

  const [enemyBoatPlacements, setEnemyBoatPlacements] = useState(sessionStorage.getItem('enemyBoatPlacements') || [])
  const [enemyBoats, setEnemyBoats] = useState([2, 3, 4, 5])
  const [enemyBoardState, setEnemyBoardState] = useState(sessionStorage.getItem('enemyBoardState') || generateBoard())
  const [enemyTargets, setEnemyTargets] = useState(sessionStorage.getItem('enemyTargets') || null)
  const [enemyName, setEnemyName] = useState(sessionStorage.getItem('enemyName'))


  // useEffect(() => {
  //   const reset = () => {
  //     setEnemyBoardState(generateBoard())
  //     setBoatPlacements([])
  //     setBoardState(generateBoard())
  //     setEnemyTargets(null)
  //     setTargets([])
  //     setBoats([2, 3, 4, 5])
  //     setBoatNames(['destroyer', 'cruiser', 'battleship', 'carrier'])
  //     setTurn(true)
  //     sessionStorage.removeItem('enemyBoardState')
  //     sessionStorage.removeItem('boatPlacements')
  //     sessionStorage.removeItem('boardState')
  //     sessionStorage.removeItem('enemyTargets')
  //     sessionStorage.removeItem('targets')
  //     sessionStorage.removeItem('boats')
  //     setCookie('user', { ...cookies.user, state: 'gameover' })
  //   }
  //   if (cookies && cookies?.user?.state === 'ongoing' && boats.length !== 0) {
  //     setBoats([])
  //   }
  //   sessionStorage.setItem('enemyBoardState', JSON.stringify(enemyBoardState))
  //   sessionStorage.setItem('boatPlacements', JSON.stringify(boatPlacements))
  //   sessionStorage.setItem('boardState', JSON.stringify(boardState))
  //   sessionStorage.setItem('enemyTargets', JSON.stringify(enemyTargets))
  //   sessionStorage.setItem('targets', JSON.stringify(targets))
  //   sessionStorage.setItem('boats', JSON.stringify(boats))

  //   if (Object.values(boatPlacements).filter((i) => i?.sunk).length === 4 && gameProgress === 'ongoing' && gameProgress !== 'losing screen') {
  //     reset()
  //     setGameProgress('losing screen')
  //   }
  //   if (Object.values(enemyBoatPlacements).filter((i) => i.sunk).length === 4 && gameProgress === 'ongoing' && gameProgress !== 'winning screen') {
  //     reset()
  //     setGameProgress('winning screen')
  //   }
  //   const handleChangeStorage = () => {
  //     console.log('storage')
  //     socket.send(JSON.stringify({ id: cookies.user.id, forfeit: true }))
  //     reset()
  //     setGameProgress('losing screen')
  //   }
  //   window.addEventListener('storage', handleChangeStorage)
  //   return () => {
  //     window.removeEventListener('storage', handleChangeStorage)
  //   }
  // }, [gameProgress, socket, enemyBoardState, boatPlacements, enemyBoatPlacements, boardState, boats, enemyTargets, targets, cookies, setCookie])





  useEffect(() => {
    console.log('ws refresh')
    // const reset = () => {
    //   setEnemyBoardState(generateBoard())
    //   setBoatPlacements([])
    //   setBoardState(generateBoard())
    //   setEnemyTargets(null)
    //   setTargets([])
    //   setBoats([2, 3, 4, 5])
    //   setTurn(true)
    //   setBoatNames(['destroyer', 'cruiser', 'battleship', 'carrier'])
    //   setCookie('user', { ...cookies.user, state: 'gameover' })
    // }
    if (Object.keys(cookies).length === 0) setCookie('user', { id: randomstring.generate(), name: 'noName', state: 'matching' })
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    newSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log(message)
      if (message.turn) {
        setTurn(false)
        // sessionStorage.setItem('turn', JSON.stringify(false))
      }
      // if (message.dataType === 'forefeit') {
      //   newSocket.send(JSON.stringify({ id: cookies.user.id, win: true }))
      //   reset()
      //   setGameProgress('winning screen')
      // }
      // if (message.dataType === 'win') {
      //   reset()
      //   setGameProgress('losing screen')
      // }
      if (message.state === 'matched') {
        setEnemyName(message.name)
        // sessionStorage.setItem('enemyName', message.name)
        setCookie('user', { ...cookies.user, state: 'matched' })
        // setGameProgress('placement')
        // sessionStorage.setItem('gameProgress', 'placement')
      } else if (message.state === 'ongoing') {
        setCookie('user', { ...cookies.user, state: 'ongoing' })
        setGameProgress('ongoing')
        // sessionStorage.setItem('gameProgress', 'ongoing')
        setEnemyBoatPlacements(message.boatPlacements)
        let enemyTargets = Object.values(message.boatPlacements).map(item => item.positions).flat()
        // let targets = Object.values(boatPlacements).map(i => i.positions).flat()
        setEnemyTargets(enemyTargets)
        // setTargets(targets)
        // sessionStorage.setItem('enemyBoatPlacements', JSON.stringify(message.boatPlacements))

      } else if (message.dataType === 'shot') {
        setTurn(true)
        // sessionStorage.setItem('turn', JSON.stringify(true))
        let hitOrMiss = (targets).includes(Number(message.index))
        let state = hitOrMiss ? 'hit' : 'missed'
        let newState = { ...boardState }
        newState[message.index] = { id: message.index, state, hover: false }
        setBoardState(newState)
        // sessionStorage.setItem('boardState', JSON.stringify(newState))
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
          alert('you got HIT!')
        }
      }
    };
    newSocket.onopen = () => {
      if (!turn) newSocket.send(JSON.stringify({ id: cookies.user.id, turnOrder: true }))
    }
    setSocket(newSocket);
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [turn, targets, cookies, boatPlacements, boardState, setBoardState, setBoatPlacements, setCookie, setEnemyTargets, setEnemyBoatPlacements])

  const [dataSent, setDataSent] = useState(sessionStorage.getItem('dataSent') || false)
  useEffect(() => {
    if (Object.keys(boatPlacements).length === 4 && !dataSent) {
      let sendBoats = (socket) => {
        if (socket.readyState === 1) {
          setDataSent(true)
          socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
        } else {
          setTimeout(() => {
            sendBoats(socket)
          }, 200);
        }
      }
      sendBoats(socket)
      // socket.onopen = () => {
      //   console.log('hello')
      //   setDataSent(true)
      //   socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
      // }
    }
    // else if (cookies.user.state === 'gameover') {
    //   setDataSent(false)
    // }
  }, [socket, boatPlacements, cookies, dataSent, vsAi])



  const { generateTargets } = useAi()

  const setInformation = (e) => {
    e.preventDefault()
    let names = Object.values(e.target).filter(i => i.name).map(item => item.value)
    console.log(names)
    let name = names.shift()
    let newBoatNames = [...boatNames]
    for (let i = 0; i < names.length; i++) {
      newBoatNames[i] = names[i] || newBoatNames[i]
    }
    setBoatNames(newBoatNames)
    setCookie('user', { ...cookies.user, name })
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
      <button onClick={() => {
        removeCookie('user')
      }}>remove cookie</button>
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>WELCOME TO BATTLESHIP</div>

      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <div>

        </div>
        {(cookies?.user?.state === 'matched' || vsAi || cookies?.user?.state === 'ongoing') ? <>
          <button onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>
          <Board board={boardState} player={'player'} socket={socket} cookies={cookies} setCookie={setCookie}
            boardState={boardState} setBoardState={setBoardState} enemyTargets={enemyTargets}
            enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
            setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
            targets={targets} setTargets={setTargets} vsAi={vsAi} boatNames={boatNames}
            setBoatNames={setBoatNames} />
          <Board player={'ai'} enemyBoardState={enemyBoardState} socket={socket} cookies={cookies}
            setCookie={setCookie} setEnemyBoardState={setEnemyBoardState} boardState={boardState}
            setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
            enemyBoatPlacements={enemyBoatPlacements} boats={boats}
            setEnemyBoatPlacement={setEnemyBoatPlacements}
            targets={targets} setTargets={setTargets}
            turn={turn} setTurn={setTurn}
            enemyTargets={enemyTargets} setEnemyTargets={setEnemyTargets}
            enemyBoats={enemyBoats} boatPlacements={boatPlacements} setBoatPlacements={setBoatPlacements}
            vsAi={vsAi} enemyName={enemyName} />
        </> : cookies?.user?.state === 'matching' ? <>
          <form onSubmit={(e) => setInformation(e)}>
            <label htmlFor='name'>name</label>
            <input name='name' />
            <label htmlFor='boat1'>destroyer</label>
            <input name='boat1' />
            <label htmlFor='boat2'>cruiser</label>
            <input name='boat2' />
            <label htmlFor='boat3'>battleship</label>
            <input name='boat3' />
            <label htmlFor='boat4'>carrier</label>
            <input name='boat4' />
            <button>submit</button>
          </form>
        </> : <>
          <div>
            <header>
              {gameProgress === 'winning screen' ? <h2>you have won! congragurblations</h2> :
                <h2>you have lost! how embarrasing!</h2>}
            </header>
            <p>well wasn't that fun! <button onClick={() => {
              setCookie('user', { ...cookies.user, state: 'matching' })
              setGameProgress('placement')
              socket.send(JSON.stringify({ id: cookies.user.id, reset: true }))
            }}>Back for more?</button></p>
          </div>
        </>}
      </div>
    </div>
  );
}

export default App;