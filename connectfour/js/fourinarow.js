$(function() {
  if ($.fourinarow) return; //redundant

  $.fn.fourinarow = function (options) {
    'use strict';

    let isCurrentPlayerRed = true,
          disk = {
            red: {
              name: 'red',
              fill: 'red',
              stroke: 'purple'
            },
            yellow: {
              name: 'yellow',
              fill: 'yellow',
              stroke: 'seagreen'
            }
          },
    cells = [
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""]
    ],
    lastMoveRow = [],
    lastMoveCol = [],
    lastMove = [],
     //we can use our function here to determine how many columns and rows
    canvas, context, winner = '',
    settings = $.extend({
      canvas: {
        id: 'fourinarow',
        background: 'royalblue'
      },
      disk: {
        diameter: 'default',
        padding: 8
      },
      text: {
        size: 80,
        font: 'Arial',
        padding: 8
      },
      target: 4, //adjusts depending on how many you need in a row to win the game
      pageBackground: 'white'
    }, options);

    canvas = document.getElementById(settings.canvas.id);
    context = canvas.getContext('2d'); //returns a 2D canvas to draw elements on a canvas
    canvas.style.background = settings.canvas.background;

    if(settings.disk.diameter == 'default') settings.disk.diameter = (canvas.width / 7) - (settings.disk.padding * 2);

    function drawCircle(cx, cy, fill, stroke) {
      context.beginPath();
      context.arc(cx, cy, settings.disk.diameter / 2, 0, 2 * Math.PI, false);
      context.shadowColor = stroke;
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowBlur = 8;
      context.fillStyle = fill;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = stroke;
      context.stroke();

    }
    function drawDisk(col, row, name) {
      let cx = (canvas.width / 7) * (col + 1 ) - settings.disk.diameter / 2 - settings.disk.padding,
        cy = canvas.height - ((canvas.height / 6) * (row + 1) - settings.disk.diameter / 2 - settings.disk.padding);
      switch (name) {
        case disk.red.name:
          drawCircle(cx, cy, disk.red.fill, disk.red.stroke);
            break;
        case disk.yellow.name:
          drawCircle(cx, cy, disk.yellow.fill, disk.yellow.stroke);
            break;
        default:
          drawCircle(cx, cy, settings.pageBackground,  settings.pageBackground);

      }

    }

    function placeDisk() {
      for (let row = 0; row < cells.length; row++){
        for(let col = 0; col < cells[row].length; col++) {
          drawDisk(col, row, cells[row][col]);
        }
      }
    }
    function addDisk(col, name) {
      for(let row = 0; row < cells.length; row++) {
        if (cells[row][col] == '') {
          cells[row][col] = name;
          lastMoveRow = row;
          return true;
        }
      }
      return false;
    }
    //column selector to drop token
    function getCol(evt) {
      let rect = canvas.getBoundingClientRect(),
        x = evt.clientX - rect.left; // returns boundary to select collumn
      return Math.floor(x / (settings.disk.diameter + (settings.disk.padding * 2)));
    }

    function reset() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function checkUp(row, col) {
      let count = 0;
      if (cells[row][col] != ''){
        for(let offset = 1; offset < settings.target; offset++) {
          if(cells[row+offset][col] != cells[row][col]) return;
          count++;
        }
      }
      if (count == settings.target -1) winner = cells[row][col];
    }

    function checkRight(row, col) {
      let count = 0;
      if (cells[row][col] != ''){
        for(let offset = 1; offset < settings.target; offset++) {
          if(cells[row][col+offset] != cells[row][col]) return;
          count++;
        }
      }
      if (count == settings.target -1) winner = cells[row][col];
    }
    function checkUpRight(row, col) {
      let count = 0;
      if (cells[row][col] != ''){
        for(let offset = 1; offset < settings.target; offset++) {
          if(cells[row+offset][col+offset] != cells[row][col]) return;
          count++;
        }
      }
      if (count == settings.target -1) winner = cells[row][col];
    }

    function checkUpLeft(row, col) {
      let count = 0;
      if (cells[row][col] != ''){
        for(let offset = 1; offset < settings.target; offset++) {
          if(cells[row+offset][col-offset] != cells[row][col]) return;
          count++;
        }
      }
      if (count == settings.target -1) winner = cells[row][col];
    }


// identifying a winning pattern by checking for direction of win
    function identifyPatterns() {
      for (let row = 0; row < cells.length; row++){
        for (let col = 0; col < cells[row].length; col++){
          if(row + settings.target < cells[row].length) checkUp(row, col);
          if (col + settings.target - 1 <= cells.length) checkRight(row, col);
          if (row + settings.target < cells[row].length && col >= settings.target - 1) checkUpLeft(row, col);
          if (row + settings.target < cells[row].length && col + settings.target - 1 <= cells.length) checkUpRight(row, col);

        }
      }
    }
    function drawFade(){ // fades the background while the text appeara at the end of the game
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
      context.fillStyle = "rgba(255, 255, 255, 0.5)";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawText(text, fill, stroke) { // text to restart the game
      drawFade();
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.font = settings.text.size + 'px ' + settings.text.font;
      context.shadowColor = stroke;
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowBlur = 8;
      let x = (canvas.width - context.measureText(text).width) / 2,
      y = canvas.height / 2;
      context.fillText(text, x, y);
      context.font = settings.text.size / 2 + "px " + settings.text.font;
      let restart = "click to restart";
      context.fillText(restart, (canvas.width - context.measureText(restart).width) / 2, canvas.height -settings.text.padding)
    }

    // checks to see if there is a winner and then displays message to declare winner
    function identifyWinner() {
      if (winner == disk.red.name) {drawText("Red wins", disk.red.fill, disk.red.stroke); } //
      else if (winner == disk.yellow.name) {drawText("Yellow wins", disk.yellow.fill, disk.yellow.stroke);}
    }

    function hardReset() {
      isCurrentPlayerRed = (winner == disk.red.name);
      winner = '';
      for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[row].length; col++) {
          cells[row][col] = '';
        }
      }
    }

    placeDisk();


    canvas.addEventListener('click', function(evt){ // deciding which player gets to move next
      reset();
      if(winner != '') {
        hardReset();
      } else {

        if (isCurrentPlayerRed){
          addDisk(getCol(evt), disk.red.name);
          isCurrentPlayerRed = false;
        } else {
          addDisk(getCol(evt), disk.yellow.name)
          isCurrentPlayerRed = true;

        }

      }

    // store the last row and collumn info and use it for the undo function
    lastMoveCol = getCol(evt);
    lastMove = [lastMoveRow, lastMoveCol];

    // create undo function to set the cell from the last move to nothing. And apply reset at the start of function to cleanup board.
    undoButton.addEventListener('click', function(evt) {
        reset();
        cells[lastMoveRow][lastMoveCol] = "";
        placeDisk();
    })

      placeDisk();
      identifyPatterns();
      identifyWinner();
    }, false);

  };


}(jQuery));
