const EventEmitter = require('events');
const Canvas = require('canvas');
const sharp = require('sharp');
const { ICON_SIZE } = require('elgato-stream-deck');

const textHeight1 = 0;
const textHeight2 = 20;
const textHeight3 = 40;

const ICON_WIDTH = ICON_SIZE;
const ICON_HEIGHT = ICON_SIZE;

class Key extends EventEmitter
{
  constructor( keyNumber, streamDeck )
  {
    super();
    console.log( `Creating key of id=${keyNumber}` );
    this.keyNumber = keyNumber;
    this.streamDeck = streamDeck;

    this.textLine1 = `Key`;
    this.textLine2 = `is`;
    this.textLine3 = `${this.keyNumber}`;
    this.colorBackground = "#0000FF";
    this.colorText = "#000000";

    this.canvas = Canvas.createCanvas( ICON_WIDTH, ICON_HEIGHT );
    this.drawingContext = this.canvas.getContext('2d');
    this.drawingContext.font = '20px Arial';
    this.drawingContext.textBaseline = 'top';
  }

  event_down()
  {
    console.log( `DOWN [${this.keyNumber}]` );
    // this.draw();
    this.emit( 'event_down', this );
  }

  event_up()
  {
    console.log( `UP   [${this.keyNumber}]` );
    this.emit( 'event_up', this );
  }

  draw()
  {
    // Background
    this.drawingContext.fillStyle = this.colorBackground;
    this.drawingContext.fillRect( 0, 0, ICON_WIDTH, ICON_HEIGHT );
  
    // Text
    this.drawingContext.fillStyle = this.colorText;
    this.drawingContext.fillText( this.textLine1, (ICON_WIDTH-this.drawingContext.measureText(this.textLine1).width)/2, textHeight1 );
    this.drawingContext.fillText( this.textLine2, (ICON_WIDTH-this.drawingContext.measureText(this.textLine2).width)/2, textHeight2 );
    this.drawingContext.fillText( this.textLine3, (ICON_WIDTH-this.drawingContext.measureText(this.textLine3).width)/2, textHeight3 );
    this.drawingContext.restore();
  
    // Write Image
    this.drawCanvas( this.canvas );
  }

  async drawCanvas( incomingCanvas )
  {
    let buffer =
      await sharp( incomingCanvas.toBuffer() )
        .flatten() // Eliminate alpha channel, if any.
        .raw()
        .toBuffer()
    ;

    this.streamDeck.fillImage( this.keyNumber, buffer );
  }
}

exports.Key = Key;