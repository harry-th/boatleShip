const boardHover = (index, gameProgress, hoverState, boats, orientation, setHoverState) => {
    if (gameProgress === 'placement' && hoverState) {
        let coords = []
        for (let i = 0; i < boats[0]; i++) {
            coords.push(orientation === 'h' ? index + i : index + i * 10)
        }
        let newBoardState = JSON.parse(JSON.stringify(hoverState))
        for (let i = 0; i < coords.length; i++) {
            if (hoverState[coords[i]]?.state === 'mine') return
        }

        for (const square in newBoardState) {
            if (coords.includes(Number(square))
                && (orientation === 'v' || ((Math.floor(coords[coords.findIndex((r) => r === square) + 1] / 10) * 10) - (Math.floor(square / 10) * 10) === 0))) {
                if (Number(square) < 100) newBoardState[square].hover = 'hover'
            } else if (newBoardState[square].hover === 'hover') {
                newBoardState[square].hover = false
            }
        }
        setHoverState(newBoardState)
    }
}

export default boardHover