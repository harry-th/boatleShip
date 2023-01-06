const Endofgame = ({ gameProgress, setCookie, cookies, setGameProgress, socket }) => {
    return (<>
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
    </>)
}
export default Endofgame