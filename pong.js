const Canvas = require('canvas');
const StreamDeck = require('elgato-stream-deck');
const gameloop = require('node-gameloop');
const sharp = require('sharp');

const Key = require('./key');
const Utilities = require('./utilities');

const myStreamDeck = new StreamDeck();

const ICON_WIDTH = StreamDeck.ICON_SIZE; // 72
const ICON_HEIGHT = StreamDeck.ICON_SIZE; // 72

class Ball
{
  constructor( position = { x: 0, y: 0}, w = 10, h = 10 )
  {
    this.position = position;

    this.w = w;
    this.h = h;

    this.offsetWidth = this.w / 2;
    this.offsetHeight = this.h / 2;

    this.speedX = Utilities.randomInt( 10 );
    this.speedY = Utilities.randomInt( 10 );

    this.collisions = { vertical: false, horizontal: false };
  }

  move()
  {
    this.collisions.horizontal = false;
    this.collisions.vertical = false;
    let newPosition = this.position;
    newPosition.x += this.speedX;
    newPosition.y += this.speedY;

    this.collisions = Screen.doesCollide( newPosition );
    if( this.collisions.vertical )
    {
      this.speedY = -this.speedY;
    }
    if( this.collisions.horizontal )
    {
      this.speedX = -this.speedX;
    }

    this.position = newPosition;
  }

  draw( context )
  {
    context.fillStyle = `#ffffff`;
    context.fillRect(
      this.position.x - this.offsetWidth,
      this.position.y - this.offsetHeight, 
      this.w,
      this.h
    );
  }
}

class Screen
{
  constructor( streamDeck )
  {
    this.streamDeck = streamDeck;
    this.canvas = Canvas.createCanvas( Screen.WIDTH, Screen.HEIGHT );
    this.drawingContext = this.canvas.getContext('2d');

    this.balls = [];
    this.balls.push ( new Ball() );
  }

  static doesCollide( position )
  {
    let collisionHorizontal = false;
    let collisionVeritcal = false;
    let newPosition = position;
    if( position.x >= Screen.WIDTH )
    {
      newPosition.x = Screen.WIDTH;
      collisionHorizontal = true;
    }
    else if( position.x <= 0 )
    {
      newPosition.x = 0;
      collisionHorizontal = true;
    }

    if( position.y >= Screen.HEIGHT )
    {
      newPosition.y = Screen.HEIGHT;

      collisionVeritcal = true;
    }
    else if( position.y <= 0 )
    {
      newPosition.y = 0;

      collisionVeritcal = true;
    }

    position = newPosition;

    return { horizontal: collisionHorizontal, vertical: collisionVeritcal };
  }

  async draw()
  {
    console.time( `Move balls` );
    let anyCollision = false;
    let anyCollisionPerfect = false;
  
    for( let ball of this.balls )
    {
      ball.move();
      if( ball.collisions.horizontal || ball.collisions.vertical ) anyCollision = true;
      if( ball.collisions.horizontal && ball.collisions.vertical ) anyCollisionPerfect = true;
    }

    console.timeEnd( `Move balls` );

    if( anyCollisionPerfect ) this.drawingContext.fillStyle = `#00ff00`;
    else if( anyCollision )   this.drawingContext.fillStyle = `#ff00ff`;
    else                      this.drawingContext.fillStyle = `#000000`;

    this.drawingContext.fillRect( 0, 0, Screen.WIDTH, Screen.HEIGHT );

    for( let ball of this.balls )
    {
      ball.draw( this.drawingContext );
    }

    console.time( `Draw screen` );
    let buffer =
      await sharp( this.canvas.toBuffer() )
        .flatten() // Eliminate alpha channel, if any.
        .raw()
        .toBuffer()
    ;
    this.streamDeck.fillPanel( buffer, { raw: { width: Screen.WIDTH, height: Screen.HEIGHT, channels: 3 } } );
    console.timeEnd( `Draw screen` );
  }
}

Screen.WIDTH = ICON_WIDTH * 5;
Screen.HEIGHT = ICON_HEIGHT * 3;

const screen = new Screen( myStreamDeck );
const allKeys = [];

myStreamDeck.on( 'down', keyIndex => {
  allKeys[keyIndex].event_down();
} );

myStreamDeck.on( 'up', keyIndex => {
  allKeys[keyIndex].event_up();
} );

allKeys.push( new Key.Key( 4, myStreamDeck ) );
allKeys.push( new Key.Key( 3, myStreamDeck ) );
allKeys.push( new Key.Key( 2, myStreamDeck ) );
allKeys.push( new Key.Key( 1, myStreamDeck ) );
allKeys.push( new Key.Key( 0, myStreamDeck ) );

allKeys.push( new Key.Key( 9, myStreamDeck ) );
allKeys.push( new Key.Key( 8, myStreamDeck ) );
allKeys.push( new Key.Key( 7, myStreamDeck ) );
allKeys.push( new Key.Key( 6, myStreamDeck ) );
allKeys.push( new Key.Key( 5, myStreamDeck ) );

allKeys.push( new Key.Key( 14, myStreamDeck ) );
allKeys.push( new Key.Key( 13, myStreamDeck ) );
allKeys.push( new Key.Key( 12, myStreamDeck ) );
allKeys.push( new Key.Key( 11, myStreamDeck ) );
allKeys.push( new Key.Key( 10, myStreamDeck ) );

async function doLoop()
{
  await screen.draw();
}

for( let key of allKeys )
{
  key.on( 'event_down', (clickedKey) => {
    const keyNumber = clickedKey.keyNumber;
    const newLocation = {
      x: ( ICON_WIDTH * ( keyNumber % 5 ) ) + ( ICON_WIDTH / 2 ),
      y: ( ICON_HEIGHT * Math.floor( keyNumber / 5 ) ) + ( ICON_HEIGHT / 2 ),
    };
    const newBall = new Ball( newLocation );
    screen.balls.push( newBall );
  } )
}
gameloop.setGameLoop( async(delta) => {
  console.log( `delta=[${delta}]` );
  await doLoop();
}, 1000 / 10 );

// myStreamDeck.on( 'down', keyIndex => {
//   doLoop( 0 );
// } );
