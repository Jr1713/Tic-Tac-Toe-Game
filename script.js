// Tic Tac Toe with Single-Player AI, Sounds, Animations, and Score Tracking
// Paste into CodePen JS panel (no external libs required)

(() => {
  // ELEMENTS
  const boardEl = document.getElementById("board");
  const cellsEls = Array.from(document.querySelectorAll(".cell"));
  const messageEl = document.getElementById("message");
  const modeSingleBtn = document.getElementById("modeSingle");
  const modeTwoBtn = document.getElementById("modeTwo");
  const chooseXBtn = document.getElementById("chooseX");
  const chooseOBtn = document.getElementById("chooseO");
  const resetBtn = document.getElementById("resetBtn");
  const resetScoresBtn = document.getElementById("resetScoresBtn");
  const playerScoreEl = document.getElementById("playerScore");
  const opponentScoreEl = document.getElementById("opponentScore");
  const tiesScoreEl = document.getElementById("tiesScore");
  const playerLabelEl = document.getElementById("playerLabel");
  const opponentLabelEl = document.getElementById("opponentLabel");
  const soundToggleEl = document.getElementById("soundToggle");

  // GAME STATE
  let board = Array(9).fill(null);
  let mode = "single"; // "single" or "two"
  let playerSymbol = "X"; // user's symbol in single-player, or Player 1 in two-player
  let opponentSymbol = "O"; // computer or Player 2
  let currentTurn = "X"; // who is to move now
  let gameOver = false;
  let scores = { player: 0, opponent: 0, ties: 0 };

  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // AUDIO (lazy-created)
  let audioCtx = null;
  function ensureAudio() {
    if (!soundToggleEl.checked) return null;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }
  function playTone(freq=440, dur=0.08, type='sine', vol=0.05) {
    if (!soundToggleEl.checked) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }
  function soundMove(){ playTone(540, 0.07, 'sine', 0.06); }
  function soundWin(){ playTone(880, 0.08); setTimeout(()=>playTone(660,0.12),90); }
  function soundLose(){ playTone(340,0.09); setTimeout(()=>playTone(300,0.09),90); }
  function soundTie(){ playTone(320,0.08); setTimeout(()=>playTone(260,0.08),80); }

  // RENDER
  function renderBoard() {
    cellsEls.forEach((cell, idx) => {
      cell.textContent = board[idx] ? board[idx] : "";
      cell.className = "cell"; // reset classes
      if (board[idx] === "X") cell.classList.add("x");
      if (board[idx] === "O") cell.classList.add("o");
      // disable clicks for occupied cells or if game over
      cell.style.pointerEvents = (board[idx] || gameOver) ? "none" : "auto";
    });
  }

  // WIN CHECK
  function checkWinner(bd) {
    for (const combo of winCombos) {
      const [a,b,c] = combo;
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
        return { winner: bd[a], combo };
      }
    }
    if (bd.every(v => v)) return { winner: 'Tie' };
    return null;
  }

  function highlightCombo(combo = []) {
    combo.forEach(i => {
      const el = cellsEls[i];
      if (el) el.classList.add('win');
    });
  }

  // UTILS for AI
  function emptyIndices() {
    return board.map((v,i)=>v?null:i).filter(v=>v!==null);
  }

  function findWinningMove(symbol) {
    const empties = emptyIndices();
    for (let idx of empties) {
      const copy = board.slice();
      copy[idx] = symbol;
      const r = checkWinner(copy);
      if (r && r.winner === symbol) return idx;
    }
    return null;
  }

  // AI logic (heuristic)
  function aiChooseMove() {
    const empties = emptyIndices();
    if (empties.length === 0) return null;

    // 1. Win
    let move = findWinningMove(opponentSymbol);
    // 2. Block player
    if (move === null) move = findWinningMove(playerSymbol);
    // 3. Center
    if (move === null && board[4] === null) move = 4;
    // 4. Opposite corner (if player in corner)
    if (move === null) {
      const corners = [[0,8],[2,6]];
      for (const [p,opp] of corners) {
        if (board[p] === playerSymbol && board[opp] === null) { move = opp; break; }
        if (board[opp] === playerSymbol && board[p] === null) { move = p; break; }
      }
    }
    // 5. Any corner
    if (move === null) {
      const cornerList = [0,2,6,8].filter(i=>board[i]===null);
      if (cornerList.length) move = cornerList[Math.floor(Math.random()*cornerList.length)];
    }
    // 6. Any side
    if (move === null) {
      const sides = [1,3,5,7].filter(i=>board[i]===null);
      if (sides.length) move = sides[Math.floor(Math.random()*sides.length)];
    }
    // fallback
    if (move === null) move = empties[Math.floor(Math.random()*empties.length)];
    return move;
  }

  // GAME ACTIONS
  function playerAction(index) {
    if (gameOver || board[index]) return;
    // In single-player only allow user to play on their turn
    if (mode === 'single' && currentTurn !== playerSymbol) return;
    board[index] = currentTurn;
    soundMove();
    renderBoard();
    const res = checkWinner(board);
    if (res) return finishRound(res);
    // switch turn
    if (mode === 'single') {
      currentTurn = opponentSymbol;
      messageEl.textContent = "Computer's turn...";
      // small delay for AI "thinking"
      setTimeout(() => {
        if (!gameOver) computerAction();
      }, 450);
    } else {
      currentTurn = currentTurn === 'X' ? 'O' : 'X';
      messageEl.textContent = `Player ${currentTurn}'s turn`;
    }
  }

  function computerAction() {
    if (gameOver) return;
    const idx = aiChooseMove();
    if (idx === null) return;
    board[idx] = opponentSymbol;
    soundMove();
    renderBoard();
    const res = checkWinner(board);
    if (res) return finishRound(res);
    // back to player
    currentTurn = playerSymbol;
    messageEl.textContent = `Your turn (${playerSymbol})`;
  }

  function finishRound(result) {
    gameOver = true;
    if (result.winner === 'Tie') {
      messageEl.textContent = `It's a tie!`;
      scores.ties++;
      tiesScoreEl.textContent = scores.ties;
      soundTie();
      setTimeout(resetBoard, 1400);
      return;
    }
    // highlight combo & update scores
    highlightCombo(result.combo);
    if (mode === 'single') {
      if (result.winner === playerSymbol) {
        messageEl.textContent = "You win!";
        scores.player++;
        playerScoreEl.textContent = scores.player;
        soundWin();
      } else {
        messageEl.textContent = "Computer wins!";
        scores.opponent++;
        opponentScoreEl.textContent = scores.opponent;
        soundLose();
      }
    } else { // two-player
      // determine which player (Player 1 or Player 2)
      const winnerIs = result.winner;
      if (winnerIs === playerSymbol) {
        messageEl.textContent = `Player 1 (${playerSymbol}) wins!`;
        scores.player++;
        playerScoreEl.textContent = scores.player;
        soundWin();
      } else {
        messageEl.textContent = `Player 2 (${opponentSymbol}) wins!`;
        scores.opponent++;
        opponentScoreEl.textContent = scores.opponent;
        soundLose();
      }
    }
    setTimeout(resetBoard, 1600);
  }

  function resetBoard() {
    // clear cells and classes
    board = Array(9).fill(null);
    gameOver = false;
    cellsEls.forEach(el => {
      el.classList.remove('win');
    });
    // X always starts by convention
    currentTurn = 'X';
    renderBoard();
    // if single-player and computer is X, it should start
    if (mode === 'single' && opponentSymbol === 'X') {
      messageEl.textContent = "Computer starts...";
      setTimeout(() => { if (!gameOver) computerAction(); }, 450);
    } else {
      messageEl.textContent = `Your turn (${playerSymbol})`;
    }
  }

  function resetScores() {
    scores = {player:0, opponent:0, ties:0};
    playerScoreEl.textContent = '0';
    opponentScoreEl.textContent = '0';
    tiesScoreEl.textContent = '0';
    resetBoard();
  }

  // MODE / UI handlers
  function setMode(newMode) {
    mode = newMode;
    if (mode === 'single') {
      modeSingleBtn.classList.add('active');
      modeTwoBtn.classList.remove('active');
      opponentLabelEl.textContent = 'Computer';
    } else {
      modeTwoBtn.classList.add('active');
      modeSingleBtn.classList.remove('active');
      opponentLabelEl.textContent = 'Player 2';
    }
    // keep chosen symbols but ensure resets reflect who should start
    resetBoard();
  }

  function chooseSymbol(sym) {
    playerSymbol = sym;
    opponentSymbol = sym === 'X' ? 'O' : 'X';
    // toggle UI
    chooseXBtn.classList.toggle('active', sym === 'X');
    chooseOBtn.classList.toggle('active', sym === 'O');
    // if single-player and opponent starts, trigger reset so AI moves if needed
    resetBoard();
  }

  // EVENT LISTENERS
  cellsEls.forEach((cellEl, i) => {
    cellEl.addEventListener('click', () => {
      // ensure audio context resumes on first user gesture when sound enabled
      if (soundToggleEl.checked) ensureAudio();
      playerAction(i);
    });
    // keyboard support
    cellEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (soundToggleEl.checked) ensureAudio();
        playerAction(i);
      }
    });
  });

  modeSingleBtn.addEventListener('click', () => setMode('single'));
  modeTwoBtn.addEventListener('click', () => setMode('two'));

  chooseXBtn.addEventListener('click', () => chooseSymbol('X'));
  chooseOBtn.addEventListener('click', () => chooseSymbol('O'));

  resetBtn.addEventListener('click', () => {
    // small sound to acknowledge
    if (soundToggleEl.checked) ensureAudio();
    resetBoard();
  });

  resetScoresBtn.addEventListener('click', () => {
    if (soundToggleEl.checked) ensureAudio();
    resetScores();
  });

  // Initialize UI
  function initUI() {
    // set default labels and values
    playerLabelEl.textContent = 'Player';
    opponentLabelEl.textContent = mode === 'single' ? 'Computer' : 'Player 2';
    playerScoreEl.textContent = scores.player;
    opponentScoreEl.textContent = scores.opponent;
    tiesScoreEl.textContent = scores.ties;
    chooseXBtn.classList.add('active');
    chooseOBtn.classList.remove('active');
    modeSingleBtn.classList.add('active');
    modeTwoBtn.classList.remove('active');
    renderBoard();
    messageEl.textContent = `Choose mode and symbol — X starts.`;
  }

  // start
  initUI();
  resetBoard();

})();
