const Customization = ({ setCharacter, boatNames, setBoatNames, setCookie, cookies }) => {

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

    return (<>
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
    </>)
}
export default Customization