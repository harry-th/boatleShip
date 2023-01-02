import { useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board'
import { useAi } from './helpers/useAi';
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
import useOrangeMan from './characters/useOrangeMan';
import useLineMan from './characters/useLineMan';
let randomstring = require("randomstring");
const jose = require('jose');

function App() {

  const [character, setCharacter] = useState(sessionStorage.getItem('character') || 'none')
  let { bluffing, setBluffing, bluffShots, orangeShot, fireBluffShots } = useOrangeMan()
  let { lastShots, setLastShots, selecting, setSelecting } = useLineMan()

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

  const [enemyBoatPlacements, setEnemyBoatPlacements] = useState([])
  const [enemyBoats, setEnemyBoats] = useState([2, 3, 4, 5])
  const [enemyBoardState, setEnemyBoardState] = useState(sessionStorage.getItem('enemyBoardState') ? JSON.parse(sessionStorage.getItem('enemyBoardState')) : generateBoard())
  const [enemyTargets, setEnemyTargets] = useState(Object.values(enemyBoatPlacements)?.map(item => item.positions).flat() || null)
  const [enemyName, setEnemyName] = useState(sessionStorage.getItem('enemyName'))

  const [dataSent, setDataSent] = useState(sessionStorage.getItem('dataSent') || false)

  // useEffect(() => {
  //   setEnemyBoatPlacements(prev => {
  //     const allHits = Object.values(enemyBoardState).filter((item) => {
  //       return item.state === 'hit'
  //     }).map((el) => el.id)
  //     for (const boat in prev) {
  //       if (prev[boat].positions.every((b) => allHits.includes(b))) {
  //         prev[boat].sunk = true
  //       }
  //     }
  //     return prev
  //   })
  // }, [enemyBoardState])
  useEffect(() => {
    // console.log('win/ storage refresh')
    const reset = () => {
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
      sessionStorage.removeItem('enemyBoardState')
      sessionStorage.removeItem('boatPlacements')
      sessionStorage.removeItem('boardState')
      sessionStorage.removeItem('enemyTargets')
      sessionStorage.removeItem('targets')
      sessionStorage.removeItem('boats')
      sessionStorage.removeItem('turn')
      sessionStorage.removeItem('bluffing')
      sessionStorage.removeItem('selecting')
      // setCookie('user', { ...cookies.user, state: 'gameover' })
    }
    if (sessionStorage.getItem('enemyBoatPlacements') && gameProgress === 'ongoing' && Array.isArray(enemyBoatPlacements)) {
      const getEncryptBoats = async () => {
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
    if (!sessionStorage.getItem('enemyBoatPlacements') && gameProgress === 'ongoing') {
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
      reset()
      setGameProgress('losing screen')
      setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
    }
    if (Object.values(enemyBoatPlacements).filter((i) => i.sunk).length === 4 && gameProgress === 'ongoing' && gameProgress !== 'winning screen') {
      reset()
      setCookie('user', { ...cookies.user, state: 'gameover', wins: cookies.user.wins + 1 })
      setGameProgress('winning screen')
    }
    const handleChangeStorage = () => {
      console.log('storage')
      socket.send(JSON.stringify({ id: cookies.user.id, forfeit: true }))
      reset()
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
    const reset = () => {
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
      sessionStorage.removeItem('enemyBoardState')
      sessionStorage.removeItem('boatPlacements')
      sessionStorage.removeItem('boardState')
      sessionStorage.removeItem('enemyTargets')
      sessionStorage.removeItem('targets')
      sessionStorage.removeItem('boats')
      sessionStorage.removeItem('turn')

      // setCookie('user', { ...cookies.user,  })
    }
    if (Object.keys(cookies).length === 0) setCookie('user', { id: randomstring.generate(), name: 'noName', state: 'matching', wins: 0, losses: 0 })
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    newSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log(message)
      if (message.turn) {
        setTurn(false)
        setTurnNumber(prev => prev + 1)
        sessionStorage.setItem('turn', JSON.stringify(false))
      }
      if (message.dataType === 'forfeit') {
        reset()
        setCookie('user', { ...cookies.user, state: 'gameover', wins: cookies.user.wins + 1 })
        setGameProgress('winning screen')
      }
      if (message.dataType === 'win') {
        reset()
        setCookie('user', { ...cookies.user, state: 'gameover', losses: cookies.user.losses + 1 })
        setGameProgress('losing screen')
      }
      if (message.callBluff) {
        setTurn(true)
        sessionStorage.setItem('turn', JSON.stringify(true))
        setTurnNumber(prev => prev - 3)
        if (bluffing) {
          setBluffing(null)
          setEnemyBoardState(message.boardState)
        }
      }
      if (message.bluffArray) {
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
        setEnemyName(message.name)
        sessionStorage.setItem('enemyName', message.name)
        setCookie('user', { ...cookies.user, state: 'matched' })
        setGameProgress('placement')
        sessionStorage.setItem('gameProgress', 'placement')
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
        } else {
          hitOrMiss = (targets).includes(Number(message.index))
          let state = hitOrMiss ? 'hit' : 'missed'
          newState[message.index] = { id: message.index, state, hover: false }
          setBoardState(newState)
        }
        sessionStorage.setItem('boardState', JSON.stringify(newState))
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
    // console.log('sendboats refresh')
    if (Object.keys(boatPlacements).length === 4 && !dataSent) {
      let sendBoats = (socket) => {
        if (socket?.readyState === 1) {
          setDataSent(true)
          socket.send(JSON.stringify({ ...cookies.user, dataType: 'boats', boatPlacements }))
        } else {
          setTimeout(() => {
            sendBoats(socket)
          }, 200);
        }
      }
      sendBoats(socket)
    } else if (cookies?.user?.state === 'gameover') {
      setDataSent(false)
    }
  }, [socket, boatPlacements, cookies, dataSent, vsAi])



  const { generateTargets } = useAi()

  const setInformation = (e) => {
    e.preventDefault()
    let names = Object.values(e.target).filter(i => i.name).map(item => item.value)
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
      {/* {gameProgress === 'preplacement' && <div> */}
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
        setCharacter('none')
        sessionStorage.removeItem('enemyBoardState')
        sessionStorage.removeItem('boatPlacements')
        sessionStorage.removeItem('boardState')
        sessionStorage.removeItem('enemyTargets')
        sessionStorage.removeItem('targets')
        sessionStorage.removeItem('boats')
        sessionStorage.removeItem('turn')
        sessionStorage.removeItem('bluffing')
        sessionStorage.removeItem('selecting')
        sessionStorage.removeItem('character')
        sessionStorage.removeItem('enemyBoatPlacements')

      }}>remove cookie</button>
      {/* </div>} */}
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>WELCOME TO BATTLESHIP</div>

      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <div>

        </div>
        {(cookies?.user?.state === 'matched' || vsAi || cookies?.user?.state === 'ongoing') ? <>
          <button onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>

          <Board board={boardState} player={'player'} character={character} socket={socket} cookies={cookies} setCookie={setCookie}
            boardState={boardState} setBoardState={setBoardState} enemyTargets={enemyTargets}
            enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
            setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
            targets={targets} setTargets={setTargets} vsAi={vsAi} boatNames={boatNames}
            setBoatNames={setBoatNames} />
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
            setTurnNumber={setTurnNumber} />
          {character === 'orangeMan' && <div>
            <button onClick={() => {
              if (bluffing === null) return
              if (turn) {
                if (bluffing !== 'ready') {
                  setBluffing(prev => {
                    sessionStorage.setItem('bluffing', JSON.stringify(!prev))
                    return !prev
                  })
                }
                if (bluffing === 'ready') {
                  setTurn(false)
                  setBluffing(null)
                  fireBluffShots(socket, enemyBoardState, enemyTargets, cookies, setEnemyBoardState)
                }
              }
            }}>{bluffing === 'ready' ? 'fire Retaliation' :
              bluffing === null ? 'fired' : bluffing ? 'stop Bluffing ' : 'start Bluffing'}</button>
          </div>
          }
          {character === 'lineMan' && <div>
            <button onClick={() => {
              if (turn && !selecting) {
                setTurn(false)
                sessionStorage.setItem('turn', JSON.stringify(false))
                let newState = { ...enemyBoardState }
                for (const shot of lastShots) {
                  let hitOrMiss = (enemyTargets).includes(Number(shot))
                  let state = hitOrMiss ? 'hit' : 'missed'
                  if (hitOrMiss && newState[shot].state !== 'hit') {
                    newState[shot] = { id: shot, state, hover: false }
                    const allHits = Object.values(newState).filter((item) => {
                      return item.state === 'hit'
                    }).map((el) => el.id)
                    for (const boat in enemyBoatPlacements) {
                      if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                        setEnemyBoatPlacements(prev => {
                          prev[boat].sunk = true
                          return { ...prev }
                        })
                        alert(`${enemyBoatPlacements[boat].name} was sunk!`)
                      }
                    }
                    newState[shot] = { id: shot, state, hover: false }

                    alert('Nice Shot!')
                  }
                }
                setEnemyBoardState(newState)
                socket.send(JSON.stringify({ dataType: 'shot', index: lastShots, id: cookies.user.id }))
              }
            }}>
              fireLastShots
            </button>
            <button onClick={() => {
              if (turn) {
                let newEnemyBoardState = { ...enemyBoardState }
                for (const square in enemyBoardState) {
                  if (enemyBoardState[square].state === 'missed') newEnemyBoardState[square].state = 'selectable'
                  else if (enemyBoardState[square].state === 'selectable') newEnemyBoardState[square].state = 'missed'
                }
                setEnemyBoardState(newEnemyBoardState)
                setSelecting(prev => {
                  sessionStorage.setItem('selecting', JSON.stringify(!prev))
                  return !prev
                })
                if (selecting) {
                  console.log(selecting, 'selecting')
                  setEnemyBoardState(prev => {
                    if (Object.values(prev).findIndex(i => i.hover === 'green') !== -1) {
                      prev[Object.values(prev).findIndex(i => i.hover === 'green')].hover = false
                    }
                    return prev
                  })
                }
              }
            }}>
              makeLine
            </button>
          </div>
          }
          {Object.values(enemyBoardState).some(i => i.hover === 'protected') && <button onClick={() => {
            let newBoardState = { ...boardState }
            for (const square in newBoardState) {
              if (newBoardState[square].state === 'mine') newBoardState[square].state = null
              if (newBoardState[square].hover) newBoardState[square].hover = false
            }
            socket.send(JSON.stringify({ id: cookies.user.id, callBluff: true, boardState: newBoardState }))
          }}>call bluff</button>}
        </> : cookies?.user?.state === 'matching' ? <>
          <button onClick={() => {
            sessionStorage.setItem('character', 'orangeMan')
            setCharacter('orangeMan')
          }}>orange mode</button>
          <button onClick={() => {
            sessionStorage.setItem('character', 'lineMan')
            setCharacter('lineMan')
          }}>line mode</button>
          <button onClick={() => {
            sessionStorage.setItem('character', 'cornerMan')
            setCharacter('cornerMan')
          }}>corner mode</button>

          <form onSubmit={(e) => setInformation(e)}>
            <label htmlFor='name'>name</label>
            {cookies.user?.name !== 'noName' ? <p>{cookies.user.name} wins/losses:{cookies.user.wins} / {cookies.user.losses}</p> : <input name='name' />}
            <label htmlFor='boat1'>destroyer</label>
            <input name='boat1' defaultValue={boatNames[0]} />
            <label htmlFor='boat2'>cruiser</label>
            <input name='boat2' defaultValue={boatNames[1]} />
            <label htmlFor='boat3'>battleship</label>
            <input name='boat3' defaultValue={boatNames[2]} />
            <label htmlFor='boat4'>carrier</label>
            <input name='boat4' defaultValue={boatNames[3]} />
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
              setGameProgress('preplacement')
              socket.send(JSON.stringify({ id: cookies.user.id, reset: true }))
            }}>Back for more?</button></p>
          </div>

        </>}
      </div>
    </div>
  );
}

export default App;