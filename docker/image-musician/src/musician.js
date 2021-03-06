/*
 This program simulates a musician, which emit a sound with his instrument
  on a multicast group. Other programs can join the group and listen to the sound.The sound
   are transported in json payloads with the following format:
   {"uuid":aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60,"sound":"pouet"}
 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musicians in parallel and observe that all
        sounds are transmitted via the multicast group):
   node musician.js instrument
*/

var protocol = require('./music-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams
 */
var s = dgram.createSocket('udp4');

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * a instrument to play.
 */
function Musician(instrument) {

    this.instrument = instrument;

    //npm dependancie https://github.com/uuidjs/uuid
    const {v1: uuidv1} = require('uuid');
    this.uuid = uuidv1();

    /*
       * We will simulate a sound production on a regular basis. That is something that
       * we implement in a class method (via the prototype)
       */
    Musician.prototype.update = function () {

        /*
              * Let's create the sound as a dynamic javascript object,
              * add the 2 properties (uuid, instrument)
              * and serialize the object to a JSON string
              */
        let sound = {
            uuid: this.uuid,
            sound: protocol.INSTRUMENTS[instrument],
        };
        let payload = JSON.stringify(sound);

        /*
               * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
               * the multicast address. All subscribers to this address will receive the message.
               */
        message = new Buffer(payload);
        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
        });

    }

    /*
         * Let's take and send a sound every 1000 ms / 1s
         */
    setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the music properties from the command line attributes
 * Some error handling for argument
 */
if (process.argv.length !== 3) {
    console.log("Oh no, it's seem that you don't how to use this program !");
    console.log("We need exactly 1 argument, not less, not more.");
    return;
}
let instrument = process.argv[2];
if (!(instrument in protocol.INSTRUMENTS)) {
    console.log("We need an valid instrument, not your \"".concat(instrument, "\" thing."));
    console.log("Here the list if you needed:");
    for (instrument in protocol.INSTRUMENTS){
            console.log(" - ".concat(instrument));
    }
    return;
}
/*
 * Let's create a new musician - the regular publication of sound will
 * be initiated within the constructor
 */
let M1 = new Musician(instrument);