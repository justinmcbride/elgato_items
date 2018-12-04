const StreamDeck = require('elgato-stream-deck');
const _ = require('lodash');

const Key = require('./key');

const myStreamDeck = new StreamDeck();

const allKeys = new Array( 15 );
for( i = 0; i < allKeys.length; i++ )
{
  const newKey = new Key.Key( i, myStreamDeck );
  allKeys[i] = newKey;
}

myStreamDeck.on( 'down', keyIndex => {
  allKeys[keyIndex].event_down();
} );

myStreamDeck.on( 'up', keyIndex => {
  allKeys[keyIndex].event_up();
} );

allKeys[4].on( 'event_down', (key) => {
  console.log( `HAHAHAHAH --> ${key.keyNumber}` );
} );

myStreamDeck.on( 'error', error => {
  console.error( `Error received on streamdeck: [${error}]` );
} );
