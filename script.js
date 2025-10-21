document.addEventListener('DOMContentLoaded', () => {
    // --- Floating Menu (works on all pages) ---
    const menuCircle = document.getElementById('menu-circle');
    const slideMenu = document.getElementById('slide-menu');

    if (menuCircle && slideMenu) {
        menuCircle.addEventListener('click', () => {
            slideMenu.style.left = slideMenu.style.left === '0px' ? '-250px' : '0px';
        });

        document.addEventListener('click', (e) => {
            if (!slideMenu.contains(e.target) && e.target !== menuCircle) {
                slideMenu.style.left = '-250px';
            }
        });

        slideMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                slideMenu.style.left = '-250px';
            });
        });
    }

    // --- Game (only runs if game elements exist) ---
    const target = document.getElementById('target');
    if (!target) return; // stop here on non-game pages

    const gameContainer = document.getElementById('game-container');
    const scoreBoard = document.getElementById('scoreboard');
    const timerDisplay = document.getElementById('timer');
    const tipSection = document.getElementById('tip-section');
    const restartBtn = document.getElementById('restart-btn');
    const scoresTable = document.getElementById('scores-table');
    const scoresTbody = scoresTable.querySelector('tbody');

    let score = 0;
    let timeLeft = 30;
    let gameInterval;
    let timerInterval;
    let gameActive = false;

    const STORAGE_KEY = 'ankkrypt_fireclicker_scores';

    function loadScores() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function saveScores(scores) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    }

    function addScoreRecord(score) {
        const scores = loadScores();
        const now = new Date();
        scores.unshift({ timestamp: now.toISOString(), score });
        saveScores(scores);
        renderScores();
    }

    function deleteScoreRecord(index) {
        const scores = loadScores();
        scores.splice(index, 1);
        saveScores(scores);
        renderScores();
    }

    function renderScores() {
        const scores = loadScores();
        scoresTbody.innerHTML = '';
        if (scores.length === 0) {
            scoresTable.style.display = 'none';
            return;
        }
        scoresTable.style.display = 'table';
        scores.forEach((record, i) => {
            const tr = document.createElement('tr');
            const date = new Date(record.timestamp);
            tr.innerHTML = `
            <td>${date.toLocaleString()}</td>
            <td>${record.score}</td>
            <td><button class="delete-btn">Delete</button></td>
            `;
            tr.querySelector('button').addEventListener('click', () => deleteScoreRecord(i));
            scoresTbody.appendChild(tr);
        });
    }

    function moveTarget() {
        const containerRect = gameContainer.getBoundingClientRect();
        const maxX = containerRect.width - target.offsetWidth;
        const maxY = containerRect.height - target.offsetHeight;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        target.style.opacity = 0;
        setTimeout(() => {
            target.style.left = randomX + 'px';
            target.style.top = randomY + 'px';
            target.style.opacity = 1;
        }, 200);
    }

    function updateScore() { scoreBoard.textContent = `Score: ${score}`; }
    function updateTimer() { timerDisplay.textContent = `Time left: ${timeLeft}s`; }
    function onTargetClick() { if (!gameActive) return; score++; updateScore(); moveTarget(); }

    function startGame() {
        score = 0;
        timeLeft = 30;
        gameActive = true;
        tipSection.style.display = 'none';
        target.style.display = 'block';
        updateScore();
        updateTimer();
        moveTarget();

        clearInterval(gameInterval);
        clearInterval(timerInterval);

        gameInterval = setInterval(moveTarget, 600);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function endGame() {
        gameActive = false;
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        timerDisplay.textContent = `Game Over! Final Score: ${score}`;
        target.style.display = 'none';
        tipSection.style.display = 'block';
        addScoreRecord(score);
    }

    target.addEventListener('click', () => { if (!gameActive) startGame(); onTargetClick(); });
    target.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); target.click(); } });
    restartBtn.addEventListener('click', startGame);

    renderScores();
    startGame();


});
