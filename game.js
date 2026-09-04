const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const dog = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    speed: 5
};

const cat = {
    x: canvas.width / 2 + 100,
    y: 150,
    width: 40,
    height: 40,
    speed: 3,
    vx: 2,
    vy: 1
};

let gameRunning = true;
let gameTime = 0;
let mousePosX = canvas.width / 2;
let mousePosY = canvas.height / 2;

document.addEventListener('mousemove', (e) => {
    mousePosX = e.clientX;
    mousePosY = e.clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mousePosX = touch.clientX;
    mousePosY = touch.clientY;
});

function initGame() {
    gameRunning = true;
    gameTime = 0;
    dog.x = canvas.width / 2;
    dog.y = canvas.height - 100;
    cat.x = canvas.width / 2 + 100;
    cat.y = 150;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    
    drawHill();
    
    const dx = mousePosX - dog.x;
    const dy = mousePosY - dog.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > dog.speed) {
        dog.x += (dx / distance) * dog.speed;
        dog.y += (dy / distance) * dog.speed;
    }
    
    const catDx = cat.x - dog.x;
    const catDy = cat.y - dog.y;
    const catDistance = Math.sqrt(catDx * catDx + catDy * catDy);
    
    if (catDistance < 300) {
        if (catDistance > 0) {
            cat.x += (catDx / catDistance) * cat.speed;
            cat.y += (catDy / catDistance) * cat.speed;
        }
    } else {
        cat.x += cat.vx;
        cat.y += cat.vy;
        if (cat.x < 0 || cat.x > canvas.width) cat.vx *= -1;
        if (cat.y < 0 || cat.y > canvas.height / 2) cat.vy *= -1;
    }
    
    if (checkCollision(dog, cat)) {
        gameRunning = false;
        flashScreen();
        return;
    }
    
    drawDog(dog.x, dog.y);
    drawCat(cat.x, cat.y);
    
    gameTime++;
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Время: ${(gameTime / 60).toFixed(1)}с`, 20, 40);
    
    requestAnimationFrame(gameLoop);
}

function drawHill() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDog(x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.fillRect(x - 13, y - 35, 10, 15);
    ctx.fillRect(x + 3, y - 35, 10, 15);
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 10, y - 5, 4, 4);
    ctx.fillRect(x + 6, y - 5, 4, 4);
}

function drawCat(x, y) {
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 20);
    ctx.lineTo(x - 8, y - 35);
    ctx.lineTo(x - 3, y - 20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 20);
    ctx.lineTo(x + 8, y - 35);
    ctx.lineTo(x + 13, y - 20);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 10, y - 5, 4, 4);
    ctx.fillRect(x + 6, y - 5, 4, 4);
}

function checkCollision(obj1, obj2) {
    return obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
           obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
           obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
           obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2;
}

function flashScreen() {
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setTimeout(() => {
        showGameResult();
    }, 500);
}

function showGameResult() {
    gamePermissions.sendDataToDatabase();
    const location = gamePermissions.getUserLocation();
    const resultText = document.getElementById('resultText');
    const resultGeo = document.getElementById('resultGeo');
    
    resultText.textContent = `Поймал кота за ${(gameTime / 60).toFixed(1)} секунд!`;
    
    if (location) {
        resultGeo.textContent = `📍 Координаты: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
    
    gamePermissions.showScreen('result');
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});