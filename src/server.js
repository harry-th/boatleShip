const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const groups = {}
const wscodes = {}
const ready = []
let boats = {}

const findGroup = (groups, id) => {
    for (const group in groups) {
        if (!groups[group]) {
            groups[group] = id
            groups[id] = group
            let matched = JSON.stringify({ state: 'matched' })
            wscodes[id].send(matched)
            wscodes[group].send(matched)
            return
        }
    }
    groups[id] = null
    wscodes[id].send(JSON.stringify({ turn: true }))
}
// When a new websocket connection is established
wss.on('connection', (ws, req) => {


    ws.on('message', (message) => {

        message = JSON.parse(message)
        console.log({ same: wscodes[message?.id] === ws })
        console.log({ message })
        if (message?.id) wscodes[message?.id] = ws
        if (message?.id) wscodes[message?.id] = ws

        if (message.dataType === 'shot') {
            wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index }))
            return
        }

        if (message.state === 'matching') {
            if (Object.keys(groups).includes(message.id)) return
            else {
                findGroup(groups, message.id)
            }
        } else if (message.state === 'matched') {
            boats[message.id] = message.boatPlacements
            if (!ready.includes(message.id)) ready.push(message.id)
            if (ready.includes(groups[message.id])) {
                wscodes[message.id].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[groups[message.id]] }))
                wscodes[groups[message.id]].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[message.id] }))
            }
        } else if (message.state === 'ongoing') {
            console.log(message.index)
        }
        //     const data = JSON.parse(message);
        //     connections.forEach((connection) => connection.send(data.message));
    });
});




