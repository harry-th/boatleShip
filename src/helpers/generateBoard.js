const generateBoard = (state, hover) => {
    const setBoard = () => {
        let answer = {}
        for (let i = 0; i < 100; i++) {
            answer[i] = { id: i }
            if (state) answer[i].state = null
            if (hover) answer[i].hover = false
        }
        return answer
    }
    let board = setBoard()
    return board
}

export default generateBoard