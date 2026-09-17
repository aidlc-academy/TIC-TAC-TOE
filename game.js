// ── State ──────────────────────────────────────────────
const HUMAN = 'X';
const AI    = 'O';

let board       = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = HUMAN;
let gameOver    = false;
let vsAI        = false;

const scores = { X: 0, O: 0, draw: 0 };

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diagonals
];

// ── DOM refs ────────────────────────────────────────────
const cells       = document.querySelectorAll('.cell');
const statusEl    = document.getElementById('status');
const scoreXEl    = document.getElementById('score-x');
const scoreOEl    = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const btnRestart  = document.getElementById('btn-restart');
const btnTwoPlayer = document.getElementById('btn-two-player');
const btnVsAI     = document.getElementById('btn-vs-ai');

// ── Helpers ─────────────────────────────────────────────
function checkWinner(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line: [a, c, d] };
    }
  }
  if (b.every(cell => cell !== null)) return { winner: 'draw' };
  return null;
}

function setStatus(msg, isWinner = false) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (isWinner ? ' winner' : '');
}

function renderBoard() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? '';
    cell.className   = 'cell' + (board[i] ? ` ${board[i].toLowerCase()}` : '');
    cell.disabled    = !!board[i] || gameOver;
  });
}

function highlightWinLine(line) {
  line.forEach(i => cells[i].classList.add('win'));
}

function updateScoreboard() {
  scoreXEl.textContent    = scores.X;
  scoreOEl.textContent    = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

// ── Game logic ───────────────────────────────────────────
function makeMove(index) {
  if (board[index] || gameOver) return;

  board[index]    = currentPlayer;
  renderBoard();

  const result = checkWinner(board);
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = currentPlayer === HUMAN ? AI : HUMAN;

  if (vsAI && currentPlayer === AI && !gameOver) {
    setStatus("AI is thinking…");
    // Small timeout so the UI renders the human move first
    setTimeout(aiMove, 300);
  } else {
    setStatus(`Player ${currentPlayer}'s turn`);
  }
}

function endGame(result) {
  gameOver = true;
  cells.forEach(c => c.disabled = true);

  if (result.winner === 'draw') {
    scores.draw++;
    setStatus("It's a draw!");
  } else {
    scores[result.winner]++;
    const label = vsAI && result.winner === AI ? 'AI wins! 🤖' : `Player ${result.winner} wins! 🎉`;
    setStatus(label, true);
    highlightWinLine(result.line);
  }
  updateScoreboard();
}

function restartGame() {
  board         = Array(9).fill(null);
  currentPlayer = HUMAN;
  gameOver      = false;
  renderBoard();
  setStatus(`Player ${HUMAN}'s turn`);
}

// ── Minimax AI ───────────────────────────────────────────
function minimax(b, isMaximizing) {
  const result = checkWinner(b);
  if (result) {
    if (result.winner === AI)    return  10;
    if (result.winner === HUMAN) return -10;
    return 0; // draw
  }

  const moves = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0);

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of moves) {
      b[i] = AI;
      best = Math.max(best, minimax(b, false));
      b[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of moves) {
      b[i] = HUMAN;
      best = Math.min(best, minimax(b, true));
      b[i] = null;
    }
    return best;
  }
}

function bestMove() {
  let best  = -Infinity;
  let move  = -1;
  const b   = [...board];

  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = AI;
      const score = minimax(b, false);
      b[i] = null;
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

function aiMove() {
  if (gameOver) return;
  const move = bestMove();
  if (move !== -1) makeMove(move);
}

// ── Event listeners ──────────────────────────────────────
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (vsAI && currentPlayer === AI) return; // block clicks during AI turn
    makeMove(Number(cell.dataset.index));
  });
});

btnRestart.addEventListener('click', restartGame);

btnTwoPlayer.addEventListener('click', () => {
  vsAI = false;
  btnTwoPlayer.classList.add('active');
  btnVsAI.classList.remove('active');
  restartGame();
});

btnVsAI.addEventListener('click', () => {
  vsAI = true;
  btnVsAI.classList.add('active');
  btnTwoPlayer.classList.remove('active');
  restartGame();
});

// ── Init ─────────────────────────────────────────────────
renderBoard();
setStatus(`Player ${HUMAN}'s turn`);
