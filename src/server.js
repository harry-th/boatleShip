const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080, ssl: true });

const groups = {}
const wscodes = {}
let boats = {}
let info = {}

const findGroup = (groups, id, name, character) => {
    for (const group in groups) {
        if (!groups[group]) {
            info[id] = { name, character }
            groups[group] = id
            groups[id] = group
            wscodes[id].send(JSON.stringify({ state: 'matched', name: info[group].name, character: info[group].character }))
            wscodes[group].send(JSON.stringify({ state: 'matched', name: info[id].name, character: info[id].character }))
            return
        }
    }
    info[id] = { name, character }
    groups[id] = null
    return
}
// When a new websocket connection is established
wss.on('connection', (ws, req) => {

    ws.on('message', (message) => {
        message = JSON.parse(message)
        console.log(message)

        if (message?.id) wscodes[message?.id] = ws

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
        if (message.callBluff) {
            wscodes[groups[message.id]].send(JSON.stringify({ callBluff: true, boardState: message.boardState }))
            return
        }
        if (message.dataType === 'shot') {
            if (message.bluffArray) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, bluffArray: message.bluffArray, time: message.time }))
            else if (message.orange && message.freeShot) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, orange: message.orange, bluffing: message.bluffing, freeShot: true, time: message.time }))
            else if (message.orange) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, orange: message.orange, bluffing: message.bluffing, time: message.time }))
            else if (message.freeShot) wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, freeShot: true, time: message.time }))
            else
                wscodes[groups[message.id]].send(JSON.stringify({ dataType: 'shot', index: message.index, time: message.time }))
            return
        }
        if (message.dataType === 'boats') {
            boats[message.id] = message.boatPlacements
        }
        if (message.state === 'matching') {
            if (Object.keys(groups).includes(message.id)) return // could be groups[message.id]
            else {
                findGroup(groups, message.id, message.name, message.character)
            }
        } else if (message.state === 'matched') {
            if (Object.keys(boats).includes(groups[message.id])) {
                wscodes[message.id].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[groups[message.id]], turn: false }))
                wscodes[groups[message.id]].send(JSON.stringify({ state: 'ongoing', boatPlacements: boats[message.id], turn: true }))
                delete boats[groups[message.id]]
                delete boats[message.id]
            }
        }
    });
});




