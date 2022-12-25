const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const groups = {}
const wscodes = {}
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
    return
}
// When a new websocket connection is established
wss.on('connection', (ws, req) => {

    ws.on('message', (message) => {

        message = JSON.parse(message)
        // console.log({ groups })
        if (message?.id) wscodes[message?.id] = ws
        console.log(message)
        if (message.turnOrder) {
            return
        }
        if (message.win) {
            if (wscodes[groups[message.id]]) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'win' }))
            delete groups[message.id]
            delete groups[groups[message.id]]
            return
        }
        if (message.forfeit) {
            if (wscodes[groups[message.id]]) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'forfeit' }))
            delete groups[message.id]
            delete groups[groups[message.id]]
            return
        }
        if (message.reset) {
            delete groups[message.id]
            delete groups[groups[message.id]]
            return
        }
        if (message.dataType === 'shot') {
            if (message.bluffArray) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, bluffArray: message.bluffArray }))
            else if (message.orange) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, orange: message.orange, bluffing: message.bluffing }))
            else
                wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index }))
            return
        }
        if (message.dataType === 'boats') {
            boats[message.id] = message.boatPlacements
        }
        if (message.state === 'matching') {
            if (Object.keys(groups).includes(message.id)) return
            else {
                findGroup(groups, message.id, message.name)
            }
        } else if (message.state === 'matched') {
            console.log('attempt get boats')

            if (Object.keys(boats).includes(groups[message.id])) {

                wscodes[message.id].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[groups[message.id]] }))
                wscodes[groups[message.id]].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[message.id], turn: true }))
                delete boats[groups[message.id]]
                delete boats[message.id]
            }
        } else if (message.state === 'ongoing') {
            console.log(message.index)
        }
        //     const data = JSON.parse(message);
        //     connections.forEach((connection) => connection.send(data.message));
    });
});




