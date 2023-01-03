import { useState } from 'react'
import styles from '../styles/Customization.module.css'

const Customization = ({ character, setCharacter, boatNames, setBoatNames, setCookie, cookies, setVsAi, socket }) => {
    const [name, setName] = useState(null)
    const [display, setDisplay] = useState(character === 'none' ? 'character' : cookies.user.name !== 'noName' ? 'done' : 'name')
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
        setDisplay('done')
    }

    return (
        <div className={styles.customization}>
            {character === 'none' && <div className={styles.characterselect}>
                <div onClick={() => {
                    sessionStorage.setItem('character', 'orangeMan')
                    setCharacter('orangeMan')
                    setDisplay('name')
                }}>orange mode</div>
                <div onClick={() => {
                    sessionStorage.setItem('character', 'lineMan')
                    setCharacter('lineMan')
                    setDisplay('name')
                }}>line mode</div>
                <div onClick={() => {
                    sessionStorage.setItem('character', 'cornerMan')
                    setCharacter('cornerMan')
                    setDisplay('name')
                }}>corner mode</div>
            </div>}
            <div onClick={() => {
                setName(null)
                setDisplay('name')
            }}> {name || cookies.user.name} {cookies.user.name !== 'noName' && <span> wins/losses: {cookies.user.wins} / {cookies.user.losses}</span>}</div>
            <div className={styles.boatform}>
                {(name && display === 'name') && <p>choose Boat names?</p>}
                <form onSubmit={(e) => setInformation(e)}>
                    {(display === 'name') && <div>
                        <div>
                            <label htmlFor='name'>name</label>
                        </div>
                        <input name='name' onChange={(e) => setName(e.target.value)}
                            onBlur={() => { if (name) setDisplay('boats') }} />
                    </div>}
                    {display === 'boats' && <div className={styles.boatfields}>
                        <h4>Choose your Boat Names:</h4>
                        <input name='name' value={name} hidden />
                        <label htmlFor='boat1'>destroyer</label>
                        <input name='boat1' defaultValue={boatNames[0]} />
                        <label htmlFor='boat2'>cruiser</label>
                        <input name='boat2' defaultValue={boatNames[1]} />
                        <label htmlFor='boat3'>battleship</label>
                        <input name='boat3' defaultValue={boatNames[2]} />
                        <label htmlFor='boat4'>carrier</label>
                        <input name='boat4' defaultValue={boatNames[3]} />
                        <button>submit</button> </div>}
                </form>
            </div>
            {display === 'done' && <button onClick={() => {
                console.log(cookies)
                setVsAi(false)
                socket.send(JSON.stringify({ ...cookies.user }))
            }}>find game</button>}
        </div>)
}
export default Customization