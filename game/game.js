const kittenContainer = document.getElementById('kittenContainer');
const gameButton = document.getElementById('gameButton');

let gameState = 'start';
let cats = [];
let currentCatIndex = 0;
let animationFrameId = null;
let towerHeight = 0;
const catHeight = 100;
const groundOffset = 150;
let stack = [];

const gravity = 0.5;
const fallInterval = 20;
const catWidth = 100;

let isDropping = false;  // Yalnızca bir kedinin düşmesine izin ver

function createCat(index) {
  const catImg = document.createElement('img');
  catImg.src = `cat/${(index % 5) + 1}.png`;
  catImg.className = 'kitten';
  kittenContainer.appendChild(catImg);

  const startX = Math.random() * (window.innerWidth - catWidth);
  const startY = 100;

  const cat = {
    element: catImg,
    posX: startX,
    posY: startY,
    speedX: Math.random() < 0.5 ? -4 : 4,  // ← burada hız artırıldı
    speedY: 0,
    falling: false,
    direction: 1
  };

  catImg.style.left = `${startX}px`;
  catImg.style.top = `${startY}px`;
  catImg.style.display = 'block';
  cats.push(cat);
}


gameButton.addEventListener('click', () => {
  if (gameState === 'start') {
    startGame();
  } else if (gameState === 'playing') {
    dropCurrentCat();
  } else if (gameState === 'lost') {
    restartGame();
  }
});

function startGame() {
  gameState = 'playing';
  gameButton.textContent = 'Drop Cat';
  towerHeight = 0;
  currentCatIndex = 0;
  clearCats();
  cats = [];
  stack = [];
  createCat(currentCatIndex);
  animateCats();
}

function dropCurrentCat() {
  if (isDropping) return; // Zaten düşen kedi varsa engelle

  const cat = cats[currentCatIndex];
  if (!cat || cat.falling) return;

  isDropping = true;

  cat.falling = true;
  cat.speedY = 0;
  cat.speedX = 0;

  const checkFall = setInterval(() => {
    cat.speedY += gravity;
    cat.posY += cat.speedY;
    cat.element.style.top = `${cat.posY}px`;

    const catRect = cat.element.getBoundingClientRect();
    const groundRect = document.querySelector('.ground').getBoundingClientRect();
    const baseTop = stack.length === 0 ? groundRect.top : stack[stack.length - 1].element.getBoundingClientRect().top;

    if (catRect.bottom >= baseTop) {
      // Kedi yere veya üsteki kediye değdi
      cat.falling = false;
      cat.speedY = 0;

      const targetTop = baseTop - catHeight;
      cat.posY = targetTop;
      cat.element.style.top = `${targetTop}px`;

      clearInterval(checkFall);

      if (isOutOfGround(catRect)) {
        gameOver();
        isDropping = false;
        return;
      }

      if (stack.length > 0) {
        const prev = stack[stack.length - 1].element.getBoundingClientRect();
        const overlapWidth = Math.min(catRect.right, prev.right) - Math.max(catRect.left, prev.left);
        const minOverlap = Math.min(catRect.width, prev.width) * 0.5;

        if (overlapWidth < minOverlap) {
          gameOver();
          isDropping = false;
          return;
        }
      }

      stack.push(cat);

      towerHeight += catHeight;
      if (towerHeight + groundOffset > window.innerHeight) {
        kittenContainer.style.top = `-${towerHeight + groundOffset - window.innerHeight}px`;
      }

      // 10 kedi üst üste gelince oyunu bitir
      if (stack.length >= 10) {
        gameOver();
        isDropping = false;
        return;
      }

      currentCatIndex++;
      createCat(currentCatIndex);

      isDropping = false;
    }

    if (cat.posY > window.innerHeight) {
      clearInterval(checkFall);
      gameOver();
      isDropping = false;
    }
  }, fallInterval);
}

function isOutOfGround(catRect) {
  const groundImg = document.querySelector('.ground');
  const groundRect = groundImg.getBoundingClientRect();

  // Kedi zeminin tamamen solundan ya da sağından taşmış mı?
  const isLeftOutside = catRect.right < groundRect.left;
  const isRightOutside = catRect.left > groundRect.right;

  return isLeftOutside || isRightOutside;
}

function animateCats() {
  animationFrameId = requestAnimationFrame(animateCats);
  if (gameState !== 'playing') return;

  const cat = cats[currentCatIndex];
  if (!cat || cat.falling) return;

  cat.posX += cat.speedX * cat.direction;
  if (cat.posX < 0 || cat.posX > window.innerWidth - catWidth) {
    cat.direction *= -1;
  }
  cat.element.style.left = `${cat.posX}px`;
}

function gameOver() {
  gameState = 'lost';
  gameButton.textContent = 'Restart';
}

function restartGame() {
  gameState = 'start';
  gameButton.textContent = 'Start Game';
  clearCats();
  cats = [];
  currentCatIndex = 0;
  towerHeight = 0;
  stack = [];
  kittenContainer.style.top = '100px';
  isDropping = false;
}

function clearCats() {
  cats.forEach(cat => kittenContainer.removeChild(cat.element));
  cats = [];
  cancelAnimationFrame(animationFrameId);
}
