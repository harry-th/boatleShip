const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const groups = {}
const wscodes = {}
const ready = []
let boats = {}
let names = {}

const findGroup = (groups, id, name) => {
    for (const group in groups) {
        if (!groups[group]) {
            names[id] = name
            groups[group] = id
            groups[id] = group
            wscodes[id].send(JSON.stringify({ state: 'matched', name: names[group] }))
            wscodes[group].send(JSON.stringify({ state: 'matched', name: names[id] }))
            return
        }
    }
    names[id] = name
    groups[id] = null
    wscodes[id].send(JSON.stringify({ turn: true }))
}
// When a new websocket connection is established
wss.on('connection', (ws, req) => {

    ws.on('message', (message) => {

        message = JSON.parse(message)
        console.log({ groups })
        if (message?.id) wscodes[message?.id] = ws
        if (message?.id) wscodes[message?.id] = ws
        console.log(message)
        if (message.turnOrder) {
            return
        }
        if (message.forfeit) {
            wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'forefeit' }))
            return
        }
        if (message.dataType === 'shot') {

            wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index }))
            return
        }

        if (message.state === 'matching') {
            if (Object.keys(groups).includes(message.id)) return
            else {
                findGroup(groups, message.id, message.name)
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




