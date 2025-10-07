# Tic Tac Toe Game 🎯

A browser-based Tic Tac Toe game using HTML, CSS, and JavaScript.  
Play against another player (2-player mode) with turn switching, win/draw detection, and board reset.

Live demo: [Tic Tac Toe Game by jr-delfin](https://codepen.io/jr-delfin/pen/ZYQLqPy)

---

## Table of Contents

1. Features  
2. Tools & Technologies Used  
3. How It Works  

---

## 1. Features

- 3×3 grid where players alternate placing **X** and **O**  
- Detects win (3 in a row: horizontal, vertical, diagonal)  
- Detects draw (when board fills without a winner)  
- Reset button to clear the board and play again  
- Responsive design: works on desktop and mobile  
- Visual highlight of winning combination  

---

## 2. Tools & Technologies Used

- **HTML5** — structure and elements  
- **CSS3** — styling and responsive layout  
- **JavaScript (ES6+)** — game logic, event handling, DOM updates  
- **CodePen** — development & live demo environment  

---

## 3. How It Works

- The game board is an array of length 9: `["", "", ..., ""]`  
- Each cell is represented by a `.cell` in HTML with a `data-index`  
- When a player clicks on a cell:
  - JS checks if that cell is empty and the game is not over  
  - It updates the board array, re-renders the board, and checks for winner  
  - If a winner is found, it highlights the winning cells and shows a message  
  - If no empty cells remain and no winner, it’s a draw  
- Reset button clears the board, resets game state, and allows a new match  
- The winning combination (if any) is found by checking all possible triplets  
