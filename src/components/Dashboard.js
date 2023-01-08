import { useEffect, useState } from 'react'
import styles from '../styles/Dashboard.module.css'
import Callbluffbutton from './Callbluffbutton'
import Log from './Log'
const Dashboard = ({
    messages
    , gameProgress
    , turnNumber
    , enemyTurnNumber
    , character
    , OrangeManUI
    , turn
    , setTurn
    , socket
    , enemyBoardState
    , enemyTargets
    , cookies
    , setEnemyBoardState
    , LineManUI
    , wasBluffing
    , enemyBoatPlacements
    , setEnemyBoatPlacements
    , setTurnNumber
    , boardState
    , freeShotMiss
    , setFreeShotMiss
    , enemyFreeShotMiss
    , setEnemyFreeShotMiss }) => {
    const [curTurn, setCurTurn] = useState(true)
    useEffect(() => {
        if (enemyFreeShotMiss > 0) {
            if (!curTurn && enemyTurnNumber % 4 === 0) {
                setEnemyFreeShotMiss(prev => prev - 1)
                setCurTurn(true)
            } else if (enemyTurnNumber % 4 !== 0) {
                setCurTurn(false)
            }
        }
    }, [curTurn, enemyTurnNumber, enemyFreeShotMiss, setEnemyFreeShotMiss])
    return (
        <div className={styles.dashboard}>
            <div className={styles.logcontainer}>
                <Log messages={messages} />
            </div>
            <div className={styles.usercontainer}>
                <div className={styles.turncontainer}>
                    <div className={[(turn && gameProgress === 'ongoing') ? styles.turnIndicatorTrue : styles.turnIndicatorFalse, styles.turnIndicator].join(' ')}>
                        hello
                    </div>
                    <div className={styles.freeshotinformation}>
                        {(turnNumber % 4 !== 0) || !turnNumber ? <p>{(4 - turnNumber % 4) + freeShotMiss * 4} turns until your freeShot</p>
                            : <p>{freeShotMiss ? 'free shot used!' : turn ? 'Take your free shot!' : <p>{(4 - turnNumber % 4) + freeShotMiss * 4} turns until your freeShot</p>}</p>}
                        {(4 - enemyTurnNumber % 4 !== 1) || !enemyTurnNumber ? <p>{4 - enemyTurnNumber % 4 + enemyFreeShotMiss * 4} turns until your opponent's free shot</p>
                            : <p>{enemyFreeShotMiss > 0 && 'they missed'} their free shot</p>}
                    </div>
                </div>
                <div className={styles.charcontainer}>
                    {character === 'orangeMan' && <OrangeManUI turn={turn} setTurn={setTurn} socket={socket}
                        enemyBoardState={enemyBoardState} enemyTargets={enemyTargets} cookies={cookies}
                        setEnemyBoardState={setEnemyBoardState} />
                    }
                    {character === 'lineMan' && <LineManUI turn={turn} setTurn={setTurn} enemyBoardState={enemyBoardState}
                        enemyTargets={enemyTargets} enemyBoatPlacements={enemyBoatPlacements} setEnemyBoatPlacements={setEnemyBoatPlacements}
                        setEnemyBoardState={setEnemyBoardState} socket={socket} cookies={cookies} setTurnNumber={setTurnNumber} turnNumber={turnNumber} setFreeShotMiss={setFreeShotMiss} />
                    }
                    {Object.values(enemyBoardState).some(i => i.hover === 'protected') && <Callbluffbutton setTurn={setTurn}
                        wasBluffing={wasBluffing} boardState={boardState} cookies={cookies} socket={socket} setFreeShotMiss={setFreeShotMiss} />}
                </div>
            </div>
        </div>
    )
}

export default Dashboard