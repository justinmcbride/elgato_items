const Canvas = require('canvas');
const StreamDeck = require('elgato-stream-deck');
const gameloop = require('node-gameloop');

const Key = require('./key');
const Utilities = require('./utilities');

const myStreamDeck = new StreamDeck();

const ICON_WIDTH = StreamDeck.ICON_SIZE; // 72
const ICON_HEIGHT = StreamDeck.ICON_SIZE; // 72

class Ball
{
  constructor()
  {
    this.size = 10;
    this.x = 0;
    this.y = 0;

    this.speedX = 11;
    this.speedY = 3;
    this.isCollided = false;
    this.isPerfectCollision = false;
  }

  move( boundX, boundY )
  {
    this.isCollided = false;
    this.isPerfectCollision = false;

    this.x += this.speedX;
    if( this.x >= boundX )
    {
      this.x = boundX;
      this.speedX = -(this.speedX);

      this.isCollided = true;
    }
    else if( this.x <= 0 )
    {
      this.x = 0;
      this.speedX = -(this.speedX);

      this.isCollided = true;
    }


    this.y += this.speedY;
    if( this.y >= boundY )
    {
      this.y = boundY;
      this.speedY = -(this.speedY);

      if( this.isCollided ) this.isPerfectCollision = true;
      this.isCollided = true;
    }
    else if( this.y <= 0 )
    {
      this.y = 0;
      this.speedY = -(this.speedY);

      if( this.isCollided ) this.isPerfectCollision = true;
      this.isCollided = true;
    }
  }

  draw( context )
  {
    context.fillStyle = `#ffffff`;
    context.fillRect( this.x - ( this.size / 2 ), this.y - ( this.size / 2 ), this.size, this.size );
  }
}

class Screen
{
  constructor()
  {
    this.width = ICON_WIDTH * 5;
    this.height = ICON_HEIGHT * 3;
    this.canvas = Canvas.createCanvas( this.width, this.height );
    this.drawingContext = this.canvas.getContext('2d');

    this.ball = new Ball();
  }

  draw()
  {
    if( this.ball.isPerfectCollision ) this.drawingContext.fillStyle = `#00ff00`;
    else if( this.ball.isCollided )    this.drawingContext.fillStyle = `#ff00ff`;
    else                               this.drawingContext.fillStyle = `#000000`;

    this.drawingContext.fillRect( 0, 0, this.width, this.height );

    this.ball.move( this.width, this.height );
    this.ball.draw( this.drawingContext );
  }
}

const screen = new Screen();
const allKeys = new Array( 15 );
// for( i = 0; i < allKeys.length; i++ )
// {
//   const newKey = new Key.Key( i, myStreamDeck );
//   allKeys[i] = newKey;
// }

allKeys[0] = new Key.Key( 4, myStreamDeck );
allKeys[1] = new Key.Key( 3, myStreamDeck );
allKeys[2] = new Key.Key( 2, myStreamDeck );
allKeys[3] = new Key.Key( 1, myStreamDeck );
allKeys[4] = new Key.Key( 0, myStreamDeck );

allKeys[5] = new Key.Key( 9, myStreamDeck );
allKeys[6] = new Key.Key( 8, myStreamDeck );
allKeys[7] = new Key.Key( 7, myStreamDeck );
allKeys[8] = new Key.Key( 6, myStreamDeck );
allKeys[9] = new Key.Key( 5, myStreamDeck );

allKeys[10] = new Key.Key( 14, myStreamDeck );
allKeys[11] = new Key.Key( 13, myStreamDeck );
allKeys[12] = new Key.Key( 12, myStreamDeck );
allKeys[13] = new Key.Key( 11, myStreamDeck );
allKeys[14] = new Key.Key( 10, myStreamDeck );

function doLoop( delta )
{
  screen.draw();
  console.log( `Ball=[${screen.ball.x},${screen.ball.y}] delta=[${delta}]` );

  for( i = 0; i < allKeys.length; i++ )
  {
    // TODO: can remember last icon the ball was on, and the new one and only render those two.
    const topLeft = {
      x: ICON_WIDTH * ( i % 5 ),
      y: ICON_HEIGHT * Math.floor( i / 5 )
    };

    const bottomRight = {
      x: ICON_WIDTH * ( i % 5 ) + ICON_WIDTH,
      y: ICON_HEIGHT * Math.floor( i / 5 ) + ICON_HEIGHT
    };

    let newCanvas = Utilities.splitCanvas( screen.drawingContext, topLeft, bottomRight );
    allKeys[i].drawCanvas( newCanvas );
  }
}
gameloop.setGameLoop( (delta) => {
  doLoop( delta );
}, 1000 / 5);

// myStreamDeck.on( 'down', keyIndex => {
//   doLoop( 0 );
// } );
