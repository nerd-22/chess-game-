const chessboard = document.getElementById("chessboard");
const statusDiv = document.getElementById("status");

let selectedPiece = null;
let turn = "white";

// Unicode pieces
const initialBoard = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"]
];

function isWhite(piece) {
  return ["♙","♖","♘","♗","♕","♔"].includes(piece);
}

function isBlack(piece) {
  return ["♟","♜","♞","♝","♛","♚"].includes(piece);
}

function createBoard() {
  chessboard.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "white" : "black");
      square.dataset.row = row;
      square.dataset.col = col;
      square.textContent = initialBoard[row][col];
      square.addEventListener("click", handleClick);
      chessboard.appendChild(square);
    }
  }
}

function handleClick(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  const piece = initialBoard[row][col];

  // Selecting a piece
  if (selectedPiece === null) {
    if ((turn === "white" && isWhite(piece)) || (turn === "black" && isBlack(piece))) {
      selectedPiece = { row, col, piece };
      highlightMoves(row, col, piece);
    }
  } else {
    // Move piece
    if (isValidMove(selectedPiece, row, col)) {
      movePiece(selectedPiece, row, col);
      turn = turn === "white" ? "black" : "white";
      statusDiv.textContent = `Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
    }
    clearHighlights();
    selectedPiece = null;
  }
}

function movePiece(from, toRow, toCol) {
  initialBoard[toRow][toCol] = from.piece;
  initialBoard[from.row][from.col] = "";
  createBoard();
}

function clearHighlights() {
  document.querySelectorAll(".square").forEach(sq => sq.classList.remove("highlight"));
}

function highlightMoves(row, col, piece) {
  clearHighlights();
  const moves = getValidMoves(row, col, piece);
  moves.forEach(([r, c]) => {
    const sq = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
    sq.classList.add("highlight");
  });
}

function getValidMoves(row, col, piece) {
  const moves = [];

  if (piece.toLowerCase() === "♙".toLowerCase()) {
    // Pawn
    const dir = isWhite(piece) ? -1 : 1;
    if (initialBoard[row + dir] && initialBoard[row + dir][col] === "") {
      moves.push([row + dir, col]);
    }
    // Capture diagonally
    if (initialBoard[row + dir] && initialBoard[row + dir][col - 1] && isEnemy(piece, initialBoard[row + dir][col - 1])) {
      moves.push([row + dir, col - 1]);
    }
    if (initialBoard[row + dir] && initialBoard[row + dir][col + 1] && isEnemy(piece, initialBoard[row + dir][col + 1])) {
      moves.push([row + dir, col + 1]);
    }
  } else if (piece.toLowerCase() === "♖".toLowerCase()) {
    // Rook moves
    moves.push(...getLinearMoves(row, col, piece, [[1,0],[-1,0],[0,1],[0,-1]]));
  } else if (piece.toLowerCase() === "♘".toLowerCase()) {
    // Knight moves
    const knightMoves = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]];
    knightMoves.forEach(([dx, dy]) => {
      const r = row + dx, c = col + dy;
      if (r>=0 && r<8 && c>=0 && c<8 && !isFriend(piece, initialBoard[r][c])) moves.push([r,c]);
    });
  } else if (piece.toLowerCase() === "♗".toLowerCase()) {
    moves.push(...getLinearMoves(row, col, piece, [[1,1],[1,-1],[-1,1],[-1,-1]]));
  } else if (piece.toLowerCase() === "♕".toLowerCase()) {
    moves.push(...getLinearMoves(row, col, piece, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]));
  } else if (piece.toLowerCase() === "♔".toLowerCase()) {
    const kingMoves = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    kingMoves.forEach(([dx, dy]) => {
      const r = row + dx, c = col + dy;
      if (r>=0 && r<8 && c>=0 && c<8 && !isFriend(piece, initialBoard[r][c])) moves.push([r,c]);
    });
  }

  return moves;
}

function getLinearMoves(row, col, piece, directions) {
  const moves = [];
  directions.forEach(([dx, dy]) => {
    let r = row + dx, c = col + dy;
    while(r>=0 && r<8 && c>=0 && c<8) {
      if(initialBoard[r][c] === "") moves.push([r,c]);
      else {
        if(isEnemy(piece, initialBoard[r][c])) moves.push([r,c]);
        break;
      }
      r += dx; c += dy;
    }
  });
  return moves;
}

function isEnemy(piece, target) {
  if (piece === "" || target === "") return false;
  return (isWhite(piece) && isBlack(target)) || (isBlack(piece) && isWhite(target));
}

function isFriend(piece, target) {
  if (piece === "" || target === "") return false;
  return (isWhite(piece) && isWhite(target)) || (isBlack(piece) && isBlack(target));
}

createBoard();
