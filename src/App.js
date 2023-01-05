import { useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board'
import { useAi } from './helpers/useAi';
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
import useOrangeMan from './characters/useOrangeMan';
import useLineMan from './characters/useLineMan';
import Customization from './components/Customization';
import Endofgame from './components/Endofgame';
import styles from './styles/App.module.css'
import Dashboard from './components/Dashboard';
let randomstring = require("randomstring");
const jose = require('jose');

function App() {

  const [character, setCharacter] = useState(sessionStorage.getItem('character') || 'none')
  let { bluffing, setBluffing, orangeShot, setBluffShots, OrangeManUI } = useOrangeMan()
  let { setLastShots, selecting, setSelecting, setSelection, setCharges, LineManUI } = useLineMan()

  const [messages, setMessages] = useState([])

  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [socket, setSocket] = useState(null);
  const [turn, setTurn] = useState(sessionStorage.getItem('turn') ? JSON.parse(sessionStorage.getItem('turn')) : true);
  const [vsAi, setVsAi] = useState(sessionStorage.getItem('vsAi') ? JSON.parse(sessionStorage.getItem('vsAi')) : false)

  const [orientation, setOrientation] = useState('h')
  const [boatPlacements, setBoatPlacements] = useState(sessionStorage.getItem('boatPlacements') ? JSON.parse(sessionStorage.getItem('boatPlacements')) : [])
  const [gameProgress, setGameProgress] = useState(sessionStorage.getItem('gameProgress') || 'preplacement')
  const [boardState, setBoardState] = useState(sessionStorage.getItem('boardState') ? JSON.parse(sessionStorage.getItem('boardState')) : generateBoard())
  const [boats, setBoats] = useState(sessionStorage.getItem('boats') ? JSON.parse(sessionStorage.getItem('boats')) : [2, 3, 4, 5])
  const [targets, setTargets] = useState(sessionStorage.getItem('targets') ? JSON.parse(sessionStorage.getItem('targets')) : [])
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
  const [turnNumber, setTurnNumber] = useState(0)
  const [turnTime, setTurnTime] = useState(sessionStorage.getItem('turnTime') ? JSON.parse(sessionStorage.getItem('turnTime')) : 60)
  const [playerOrder, setPlayerOrder] = useState(sessionStorage.getItem('playerOrder') || null)

  const [wasBluffing, setWasBluffing] = useState(sessionStorage.getItem('wasBluffing') || 'no')
  const [enemyBoatPlacements, setEnemyBoatPlacements] = useState([])
  const [enemyBoats, setEnemyBoats] = useState([2, 3, 4, 5])
  const [enemyBoardState, setEnemyBoardState] = useState(sessionStorage.getItem('enemyBoardState') ? JSON.parse(sessionStorage.getItem('enemyBoardState')) : generateBoard())
  const [enemyTargets, setEnemyTargets] = useState(Object.values(enemyBoatPlacements)?.map(item => item.positions).flat() || null)
  const [enemyName, setEnemyName] = useState(sessionStorage.getItem('enemyName'))

  const [intCode, setIntCode] = useState(sessionStorage.getItem('intCode') || null)
  const [timeCode, setTimeCode] = useState(sessionStorage.getItem('timeCode') || null)
  const [AfkTimeCode, setAfkTimeCode] = useState(sessionStorage.getItem('AfkTimeCode') || null)

  const [dataSent, setDataSent] = useState(sessionStorage.getItem('dataSent') || false)
  useEffect(() => {
    if (cookies?.user?.state === 'gameover') {
      setTurn(true);
      setVsAi(false)
      setOrientation('h')
      setBoatPlacements([])
      setBoardState(generateBoard())
      setBoats([2, 3, 4, 5])
      setTargets([])
      setBoatNames(['destroyer', 'cruiser', 'battleship', 'carrier'])
      setTurnNumber(0)
      setMessages([])
      // setTurnTime(30)
      setEnemyBoatPlacements([])
      setEnemyBoats([2, 3, 4, 5])
      setEnemyBoardState(generateBoard())
      setEnemyTargets(null)
      setIntCode(null)
      setTimeCode(null)
      setAfkTimeCode(null)
      setDataSent(false)
      //orangeman
      setBluffing(false)
      setBluffShots([])
      //lineman
      setLastShots([])
      setSelecting(false)
      setSelection([])
      setCharges(4)

      sessionStorage.clear()
      // sessionStorage.setItem('character', character)
      clearInterval(intCode)
      clearTimeout(timeCode)
      clearTimeout(AfkTimeCode)
    }
  }, [cookies, character, intCode, timeCode, AfkTimeCode, setBluffing, setBluffShots, setLastShots, setSelecting, setSelection, setCharges,])


  useEffect(() => {
    if (!isNaN(Number(turnTime))) {
      if (turn && gameProgress === 'ongoing' && !Array.isArray(enemyBoatPlacements) && !timeCode) {
        let intcode = setInterval(() => {
          setTurnTime(prev => {
            sessionStorage.setItem('turnTime', JSON.stringify(prev - 1))
            return prev - 1
          })
        }, 1000)
        setIntCode(intcode)
        sessionStorage.setItem('intCode', intcode)
        let timecode = setTimeout(() => {
          setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
          setGameProgress('losing screen')
          setTurnTime('timeout')
        }, turnTime * 1000)
        setTimeCode(timecode)
        sessionStorage.setItem('timeCode', timecode)
      } else if ((timeCode || intCode) && !turn) {
        console.log('close')
        setTimeCode(null)
        setIntCode(null)
        sessionStorage.removeItem('timeCode')
        sessionStorage.removeItem('intCode')
        setTurnTime(prev => {
          if (prev + 20 > 120) {
            sessionStorage.setItem('turnTime', JSON.stringify(120))
            return 120
          } else {
            sessionStorage.setItem('turnTime', JSON.stringify(prev + 20))
            return prev + 20
          }
        })
        clearTimeout(timeCode)
        clearInterval(intCode)
      }
    }
  }, [socket, turnTime, timeCode, intCode, enemyBoatPlacements, turn, gameProgress, cookies, setCookie])

  useEffect(() => {
    setEnemyBoatPlacements(prev => {
      const allHits = Object.values(enemyBoardState).filter((item) => {
        return item.state === 'hit'
      }).map((el) => el.id)
      for (const boat in prev) {
        if (prev[boat].positions.every((b) => allHits.includes(b))) {
          prev[boat].sunk = true
        }
      }
      return prev
    })
  }, [enemyBoardState])

  useEffect(() => {
    if (sessionStorage.getItem('enemyBoatPlacements') && gameProgress === 'ongoing' && Array.isArray(enemyBoatPlacements)) {
      const getEncryptBoats = async () => {
        console.log('getboats')
        try {
          const secret = new TextEncoder().encode(
            process.env.REACT_APP_secret_access_code,
          )
          let cryptoBoatPlacements = sessionStorage.getItem('enemyBoatPlacements')
          const { payload } = await jose.jwtVerify(cryptoBoatPlacements, secret)
          setEnemyBoatPlacements(payload.enemyBoatPlacements)
          setEnemyTargets(Object.values(payload.enemyBoatPlacements).map(item => item.positions).flat())
        } catch (error) {
          console.log(error)
        }

      }
      getEncryptBoats()
    }
    if (!sessionStorage.getItem('enemyBoatPlacements') && gameProgress === 'ongoing' && !Array.isArray(enemyBoatPlacements)) {
      console.log('setboats')
      const setEncryptBoats = async () => {
        const secret = new TextEncoder().encode(
          process.env.REACT_APP_secret_access_code,
        )
        try {
          const jwt = await new jose.SignJWT({ enemyBoatPlacements })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)
          sessionStorage.setItem('enemyBoatPlacements', jwt)
        } catch (error) {
          console.log(error)
        }
      }
      setEncryptBoats()
    }

    sessionStorage.setItem('enemyBoardState', JSON.stringify(enemyBoardState))
    sessionStorage.setItem('boatPlacements', JSON.stringify(boatPlacements))
    // sessionStorage.setItem('boardState', JSON.stringify(boardState))
    // sessionStorage.setItem('gameProgress', JSON.stringify(gameProgress))
    // sessionStorage.setItem('boats', JSON.stringify(boats))

    if (Object.values(boatPlacements).filter((i) => i?.sunk).length === 4 && gameProgress === 'ongoing' && gameProgress !== 'losing screen') {
      console.log(boatPlacements)
      setGameProgress('losing screen')
      setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
    }
    if (Object.values(enemyBoatPlacements).filter((i) => i.sunk).length === 4 && gameProgress === 'ongoing' && gameProgress !== 'winning screen') {
      setCookie('user', { ...cookies.user, state: 'gameover', wins: cookies.user.wins + 1 })
      setGameProgress('winning screen')
    }
    const handleChangeStorage = () => {
      console.log('storage')
      socket.send(JSON.stringify({ id: cookies.user.id, forfeit: true }))
      setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
      setGameProgress('losing screen')
    }
    window.addEventListener('storage', handleChangeStorage)
    return () => {
      window.removeEventListener('storage', handleChangeStorage)
    }
  }, [gameProgress, socket, enemyBoardState, setBluffing, setSelecting, boatPlacements, enemyBoatPlacements, boats, cookies, setCookie])

  useEffect(() => {
    // console.log('ws refresh')

    if (Object.keys(cookies).length === 0) setCookie('user', { id: randomstring.generate(), name: 'noName', state: 'matching', wins: 0, losses: 0 })
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    newSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log(message)
      if (message.turn) {
        setPlayerOrder('second')
        sessionStorage.setItem('playerOrder', 'second')
        setMessages(prev => {
          return [...prev, 'You will go second, freeshot 1 turn earlier...']
        })
        setTurn(false)
        sessionStorage.setItem('turn', JSON.stringify(false))
        setTurnNumber(prev => prev + 1)
      } else if (message.turn === false) {
        setMessages(prev => {
          return [...prev, 'Game start! you go first!']
        })
        setPlayerOrder('first')
        sessionStorage.setItem('playerOrder', 'first')
      }
      if (message.dataType === 'forfeit') {
        setCookie('user', { ...cookies.user, state: 'gameover', wins: cookies.user.wins + 1 })
        setGameProgress('winning screen')
      }
      // if (message.dataType === 'win') {
      //   setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
      //   setGameProgress('losing screen')
      // }
      if (message.bluffing) {
        setWasBluffing('yes')
        sessionStorage.setItem('wasBluffing', 'yes')
      } else {
        setWasBluffing('no')
        sessionStorage.setItem('wasBluffing', 'no')
      }

      if (message.callBluff) {
        setTurnDisplacement(prev => {
          prev += 3
          sessionStorage.setItem('turnDisplacement', JSON.stringify(prev))
          return prev
        })
        setMessages(prev => {
          return [...prev, 'They tried to call your bluff and failed']
        })
        setTurn(true)
        sessionStorage.setItem('turn', JSON.stringify(true))
        if (bluffing) {
          setMessages(prev => {
            return [...prev, 'Your bluff was called! Your retaliation has been disarmed but your shots are now']
          })
          setBluffing(null)
          setEnemyBoardState(message.boardState)
        }
      }
      if (message.bluffArray) { //comes from shot before realitation
        setMessages(prev => {
          return [...prev, 'They were bluffing! And now you have been retaliated upon!']
        })
        let newBoardState = { ...boardState }
        let newBoatPlacements = { ...boatPlacements }
        for (const bluff of message.bluffArray) {
          if (newBoardState[bluff].state === 'hit') newBoardState[bluff].state = 'mine'
          else
            newBoardState[bluff].state = null

          for (const boat in boatPlacements) {
            if (boatPlacements[boat].positions.includes(bluff) && boatPlacements[boat].sunk) newBoatPlacements[boat].sunk = false
          }
        }
        setBoardState(newBoardState)
        setBoatPlacements(newBoatPlacements)
      }
      if (message.state === 'matched') {
        setMessages(prev => {
          return [...prev, `Matched with ${message.name} playing as ${message.character}!`]
        })
        setEnemyName(message.name)
        sessionStorage.setItem('enemyName', message.name)
        setCookie('user', { ...cookies.user, state: 'matched' })
        setGameProgress('placement')
        sessionStorage.setItem('gameProgress', 'placement')
        setTurnTime(60)
        sessionStorage.setItem('turnTime', JSON.stringify(60))

      } else if (message.state === 'ongoing') {
        setCookie('user', { ...cookies.user, state: 'ongoing' })
        setGameProgress('ongoing')
        sessionStorage.setItem('gameProgress', 'ongoing')
        sessionStorage.setItem('boardState', JSON.stringify(boardState))

        setEnemyBoatPlacements(message.boatPlacements)
        let enemyTargets = Object.values(message.boatPlacements).map(item => item.positions).flat()
        let targets = Object.values(boatPlacements).map(i => i.positions).flat()
        setEnemyTargets(enemyTargets)
        // setTargets(targets)
        // sessionStorage.setItem('enemyTargets', JSON.stringify(enemyTargets))
        sessionStorage.setItem('targets', JSON.stringify(targets))
        // sessionStorage.setItem('enemyBoatPlacements', jose.SignJWT(message.boatPlacements).sign(process.env.REACT_APP_secret_access_code))

      } else if (message.dataType === 'shot') {
        if (character === 'orangeMan' && bluffing) setBluffing('ready')
        if (character === 'lineMan') {
          if (!Array.isArray(message.index)) {
            setLastShots(prev => {
              if (prev.length === 2) prev.shift()
              return [...prev, message.index]
            })
          }
        }

        if (!message.freeShot) {
          setTurn(true)
          sessionStorage.setItem('turn', JSON.stringify(true))
          setTurnNumber(prev => prev + 1)
        }
        if (message.orange) {
          setEnemyBoardState(prev => {
            let oldProtected = Object.values(prev).findIndex(i => i.hover === 'protected')
            if (prev[oldProtected]?.hover) prev[oldProtected].hover = prev[oldProtected].oldState
            prev[message.index].oldState = prev[message.index].hover
            prev[message.index].hover = 'protected'
            return prev
          })
        }
        let newState = { ...boardState }
        let hitOrMiss
        if (Array.isArray(message.index)) {
          for (const ind of message.index) {
            let hitOrMisses = (targets).includes(Number(ind))
            if (hitOrMisses) hitOrMiss = true
            let state = hitOrMisses ? 'hit' : 'missed'
            newState[ind] = { id: ind, state, hover: false }
            setBoardState(newState)
          }
          setMessages(prev => {
            return [...prev, `They fired a volley of shots at ${message.index.join(', ')}!`]
          })
        } else {
          hitOrMiss = (targets).includes(Number(message.index))
          let state = hitOrMiss ? 'hit' : 'missed'
          newState[message.index] = { id: message.index, state, hover: false }
          setBoardState(newState)
          setMessages(prev => {
            if (hitOrMiss) return [...prev, `They fired at ${message.index} and it was a ${state}!`]
            else return [...prev, `They fired at ${message.index} but it ${state}!`]
          })
        }
        sessionStorage.setItem('boardState', JSON.stringify(newState))
        if (hitOrMiss) {
          alert('you got HIT!')

          const allHits = Object.values(newState).filter((item) => {
            return item.state === 'hit'
          }).map((el) => Number(el.id))
          for (const boat in boatPlacements) {
            if (!boatPlacements[boat].sunk && boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
              setBoatPlacements(prev => {
                prev[boat].sunk = true
                return { ...prev }
              })
              setMessages(prev => {
                return [...prev, `They sunk your ${boatPlacements[boat].name}`]
              })
              alert(`${boatPlacements[boat].name} was sunk!`)
            }
          }
        }
      }
    };
    newSocket.onopen = () => {
      newSocket.send(JSON.stringify({ id: cookies.user.id, turnOrder: true }))
    }
    setSocket(newSocket);
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [turn, bluffing, character, setBluffing, targets, cookies, boatPlacements, boardState, setBoardState, setBoatPlacements, setCookie, setEnemyTargets, setEnemyBoatPlacements, setLastShots])

  useEffect(() => {
    if (Object.keys(boatPlacements).length === 4 && !dataSent && gameProgress === 'placement') {
      if (socket?.readyState === 1) {
        console.log('ran')
        let sendBoats = (socket) => {
          console.log('not done')
          if (socket?.readyState === 1) {
            console.log('done')
            setDataSent(true)
            socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
          }
          // else {
          //   setTimeout(() => {
          //     console.log('hello')
          //     sendBoats(socket)
          //   }, 200);
          // }
        }
        sendBoats(socket)
      } else {
        if (socket.readyState === 0) {
          setDataSent(true)
          socket.onopen = () => {
            socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
          }
        }
      }
    } else if (cookies?.user?.state === 'gameover') {
      setDataSent(false)
    }
  }, [socket, boatPlacements, gameProgress, cookies, dataSent])

  useEffect(() => {
    if (!turn && !AfkTimeCode) {
      let code = setTimeout(() => {
        setCookie('user', { ...cookies.user, state: 'gameover', wins: cookies.user.wins + 1 })
        setGameProgress('winning screen')
      }, 140000)
      setAfkTimeCode(code)
      sessionStorage.setItem('afkTimeCode', code)
    } else if (turn) {
      clearTimeout(AfkTimeCode)
      setAfkTimeCode(null)
      sessionStorage.removeItem('afkTimecode')
    }
  }, [turn, AfkTimeCode, cookies, setCookie])
  let [enemyTurnNumber, setEnemyTurnNumber] = useState(turnNumber)
  let [turnDisplacement, setTurnDisplacement] = useState(sessionStorage.getItem('turnDisplacement') ? JSON.parse(sessionStorage.getItem('turnDisplacement')) : 0)
  useEffect(() => {
    if (gameProgress === 'ongoing') {
      setEnemyTurnNumber(prev => {
        if (playerOrder === 'first') return (turnNumber + 1 > 4 ? 1 : turnNumber + 1 - turnDisplacement)
        if (playerOrder === 'second') return (turnNumber + 1 > 4 ? 1 : turnNumber - 1 - turnDisplacement)
      })
    }
  }, [turnNumber, gameProgress, playerOrder, turnDisplacement])

  const { generateTargets } = useAi()

  return (
    <div className={styles.app}>
      {gameProgress === 'preplacement' && <button onClick={() => {
        setVsAi(true)
        setEnemyTargets(generateTargets(enemyBoats, setEnemyBoatPlacements))
        setTurn(true);
        setOrientation('h')
        setBoatPlacements([])
        setBoardState(generateBoard())
        setBoats([2, 3, 4, 5])
        setTargets([])
        setBoatNames(['destroyer', 'cruiser', 'battleship', 'carrier'])
        setTurnNumber(0)
        setEnemyName(null)
        setGameProgress('placement')
        setEnemyBoats([2, 3, 4, 5])
        setEnemyBoardState(generateBoard())
        setIntCode(null)
        setTimeCode(null)
        setAfkTimeCode(null)
        setDataSent(false)
        //orangeman
        setBluffing(false)
        setBluffShots([])
        //lineman
        setLastShots([])
        setSelecting(false)
        setSelection([])
        setCharges(4)

        sessionStorage.clear()
        clearInterval(intCode)
        clearTimeout(timeCode)
        clearTimeout(AfkTimeCode)
      }}>play Ai</button>}
      <button onClick={() => {
        removeCookie('user')

        console.log(cookies, turn, boatPlacements)
        setEnemyBoardState(generateBoard())
        setBoatPlacements([])
        setBoardState(generateBoard())
        setEnemyTargets(null)
        setTargets([])
        setBoats([2, 3, 4, 5])
        // setBoatNames(['destroyer', 'cruiser', 'battleship', 'carrier'])
        setBoatNames(Object.values(boatPlacements).map(item => item.name))
        setTurn(true)
        setEnemyBoatPlacements([])
        setGameProgress('preplacement')
        setBluffing(false)
        setSelecting(false)
        setDataSent(false)
        setCharacter('none')
        sessionStorage.clear()

      }}>remove cookie</button>
      <div className={styles.title}>WELCOME TO BATTLESHIP</div>

      <div className={styles.boardcontainer}>
        {(cookies?.user?.state === 'matched' || vsAi || cookies?.user?.state === 'ongoing') ? <>
          {gameProgress === 'placement' && <button
            onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>
          }

          <Board board={boardState} player={'player'} character={character} socket={socket} cookies={cookies} setCookie={setCookie}
            boardState={boardState} setBoardState={setBoardState} enemyTargets={enemyTargets}
            enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
            setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
            targets={targets} setTargets={setTargets} vsAi={vsAi} boatNames={boatNames}
            setBoatNames={setBoatNames} turnTime={turnTime} />
          <Board player={'ai'} character={character} enemyBoardState={enemyBoardState} socket={socket} cookies={cookies}
            setCookie={setCookie} setEnemyBoardState={setEnemyBoardState} boardState={boardState}
            setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
            enemyBoatPlacements={enemyBoatPlacements} boats={boats}
            setEnemyBoatPlacement={setEnemyBoatPlacements}
            targets={targets} setTargets={setTargets}
            turn={turn} setTurn={setTurn} orangeShot={orangeShot}
            enemyTargets={enemyTargets} setEnemyTargets={setEnemyTargets}
            enemyBoats={enemyBoats} boatPlacements={boatPlacements} setBoatPlacements={setBoatPlacements}
            vsAi={vsAi} enemyName={enemyName} selecting={selecting} setSelecting={setSelecting} turnNumber={turnNumber}
            setTurnNumber={setTurnNumber} setCharges={setCharges} />
          <Dashboard
            messages={messages}
            gameProgress={gameProgress}
            turnNumber={turnNumber}
            enemyTurnNumber={enemyTurnNumber}
            character={character}
            OrangeManUI={OrangeManUI}
            turn={turn}
            setTurn={setTurn}
            socket={socket}
            enemyBoardState={enemyBoardState}
            enemyTargets={enemyTargets}
            cookies={cookies}
            setEnemyBoardState={setEnemyBoardState}
            LineManUI={LineManUI}
            wasBluffing={wasBluffing}
            enemyBoatPlacements={enemyBoatPlacements}
            setEnemyBoatPlacements={setEnemyBoatPlacements}
            setTurnNumber={setTurnNumber}
            boardState={boardState}
          />
        </> : cookies?.user?.state === 'matching' ? <>
          <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
            setBoatNames={setBoatNames} setCookie={setCookie} cookies={cookies}
            setVsAi={setVsAi} socket={socket} />
        </> : <Endofgame gameProgress={gameProgress} setCookie={setCookie} cookies={cookies} setGameProgress={setGameProgress} socket={socket} />}
      </div>
    </div>
  );
}

export default App;