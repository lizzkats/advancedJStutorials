let row = 0;
let column = 0;
let tokenColor = 'red';

function makeGrid(row, column){
  let newBoard = [];
  for (i=0;i<row;i++) {
    // push every empty row
    newBoard.push([]);
    for(j=0;j<column;j++){
      // push 0 into every column of every row
      newBoard[i].push(0);
    }
  }
  return newBoard;
}
let newBoard = makeGrid(3,4);

//setting state could replace this piece of the logic
function placeToken(row, tokenColor) {
  for(i=0;i<row;i++){
    if(newBoard[i][row]!== 0) {
      newBoard[i][row] = tokenColor;
      console.log(newBoard);
    }//no magic numbers
    break;
  }

  newBoard[column][0]= token;

}
