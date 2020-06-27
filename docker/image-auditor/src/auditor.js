/*
 This program simulates a "data collection of musician", which joins a multicast
 group in order to receive sounds published by musician.
 The sounds are transported in json payloads with the following format:
   {"uuid":"21b0c050-b869-11ea-9b5a-bb4069c9fb2b","sound":"ti-ta-ti"}
 Usage: to start the auditor, use the following command in a terminal
   node auditor.js
*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * musician.js and auditor.js. The address and the port are part of our simple
 * application-level protocol
 */
const protocol = require('./music-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');
/*
 * We use a standard Node.js module to work with TCP
 */
const net = require('net');

// let's create a TCP server
const server = net.createServer();

const moment = require('moment');

server.on('connection',
    congolexicomatisationDesLoisDuMarche);
//Start listening on port 9907
server.listen(2205);

/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musician and containing sound
 */
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

function cleanup(mapyy) {
    musiciansList.forEach(function (value, key) {
        if (moment().subtract(value.moment).format("X") > 5) {
            musiciansList.delete(key);
        }
    });
    console.log(musiciansList);
}

let musiciansList = new Map();

function congolexicomatisationDesLoisDuMarche(socket) {
    let jsonSend = [];
    cleanup(musiciansList);
    musiciansList.forEach(function (value, key) {
        jsonSend.push({uuid: key, instrument: value.instrument, activeSince: value.createdAt.format()})
    });
    socket.write(JSON.stringify(jsonSend));
    socket.end();
}

/*
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    let jsonData = JSON.parse(msg);
    let instrument = undefined;
    for (instr in protocol.INSTRUMENTS) {
        if (protocol.INSTRUMENTS[instr] === jsonData.sound) {
            instrument = instr;
        }
    }
    if (musiciansList.has(jsonData.uuid)) {
        musiciansList.set(jsonData.uuid, {
            instrument: instrument,
            moment: moment(),
            createdAt: musiciansList.get(jsonData.uuid).createdAt
        });
    } else {
        musiciansList.set(jsonData.uuid, {instrument: instrument, moment: moment(), createdAt: moment()});
    }
    cleanup(musiciansList);
});