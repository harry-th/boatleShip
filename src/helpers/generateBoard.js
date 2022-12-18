const generateBoard = () => {
    const setBoard = () => {
        let answer = {}
        for (let i = 0; i < 100; i++) {
            answer[i] = { id: i, state: null, hover: false }
        }
        return answer
    }
    let board = setBoard()
    return board
}

export default generateBoard