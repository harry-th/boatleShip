const boardHover = (index, gameProgress, boardState, boats, orientation, setBoardState) => {
    if (gameProgress === 'placement' && boardState) {
        let coords = []
        for (let i = 0; i < boats[0]; i++) {
            coords.push(orientation === 'h' ? index + i : index + i * 10)
        }
        let newBoardState = { ...boardState }
        for (let i = 0; i < coords.length; i++) {
            if (boardState[coords[i]]?.state === 'mine') return
        }

        for (const square in newBoardState) {
            if (coords.includes(Number(square))
                && (orientation === 'v' || ((Math.floor(coords[coords.findIndex((r) => r === square) + 1] / 10) * 10) - (Math.floor(square / 10) * 10) === 0))) {
                if (Number(square) < 100) newBoardState[square].hover = 'hover'
            } else if (newBoardState[square].hover === 'hover') {
                newBoardState[square].hover = false
            }
        }
        setBoardState(newBoardState)
    }
}

export default boardHover