const Canvas = require('canvas');

function splitCanvas( contextOriginal, point1, point2 )
{
  const imageData = contextOriginal.getImageData( point1.x, point1.y, point2.x, point2.y );
  
  // create a new cavnas same as clipped size and a context
  const newWidth = point2.x - point1.x;
  const newHeight = point2.y - point1.y;
  const newCanvas = Canvas.createCanvas( newWidth, newHeight );
  
  const contextNew = newCanvas.getContext('2d');

  // put the clipped image on the new canvas.
  contextNew.putImageData( imageData, 0, 0 );

  return newCanvas;
}

exports.splitCanvas = splitCanvas;