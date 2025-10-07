const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const chooseXBtn = document.getElementById('chooseX');
const chooseOBtn = document.getElementById('chooseO');

let board = Array(9).fill(null);
let player = 'X';
let computer = 'O';
let currentTurn = 'X';
let gameOver = false;

const winCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function renderBoard() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ? board[i] : '';
    cell.className = 'cell';
    if (board[i] === 'X') cell.classList.add('x');
    if (board[i] === 'O') cell.classList.add('o');
  });
}

function checkWinner(b) {
  for (let combo of winCombos) {
    const [a,b1,c] = combo;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if (b.every(v => v)) return 'Tie';
  return null;
}

function playerMove(index) {
  if (gameOver || board[index]) return;
  if (currentTurn !== player) return;

  board[index] = player;
  renderBoard();

  let result = checkWinner(board);
  if (result) return endGame(result);

  currentTurn = computer;
  message.textContent = "Computer's turn...";
  setTimeout(computerMove, 500);
}

function computerMove() {
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  if (empty.length === 0) return;
  const move = empty[Math.floor(Math.random() * empty.length)];
  board[move] = computer;
  renderBoard();

  let result = checkWinner(board);
  if (result) return endGame(result);

  currentTurn = player;
  message.textContent = "Your turn!";
}

function endGame(result) {
  gameOver = true;
  if (result === 'Tie') {
    message.textContent = "It's a tie!";
  } else if (result === player) {
    message.textContent = "You win! 🎉";
  } else {
    message.textContent = "Computer wins! 💻";
  }
  setTimeout(resetGame, 2000);
}

function resetGame() {
  board = Array(9).fill(null);
  gameOver = false;
  currentTurn = 'X';
  renderBoard();
  message.textContent = "New game! Your turn.";
}

cells.forEach((cell, i) => {
  cell.addEventListener('click', () => playerMove(i));
});

resetBtn.addEventListener('click', resetGame);

chooseXBtn.addEventListener('click', () => {
  player = 'X';
  computer = 'O';
  chooseXBtn.classList.add('active');
  chooseOBtn.classList.remove('active');
  resetGame();
});

chooseOBtn.addEventListener('click', () => {
  player = 'O';
  computer = 'X';
  chooseOBtn.classList.add('active');
  chooseXBtn.classList.remove('active');
  resetGame();
});

// initialize
renderBoard();
message.textContent = "Your turn — you are X!";
