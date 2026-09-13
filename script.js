const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// טעינת תמונות
const images = {
    bg: new Image(),
    rabbit: new Image(),
    carrot: new Image(),
    rock: new Image()
};

images.bg.src = 'images/images/background.png';
images.rabbit.src = 'images/images/rabbit.png';
images.carrot.src = 'images/images/carrot.png';
images.rock.src = 'images/images/rock.png';

let highScore = localStorage.getItem('bunny_highScore') || 0;
let gameOver = false;

const player = {
    x: canvas.width / 2 - 35,
    y: canvas.height - 110,
    width: 70,
    height: 70,
    speed: 6,
    dx: 0
};

let items = [];
let spawnTimer = 0;

// מקלדת
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Right') player.dx = player.speed;
    if (e.key === 'ArrowLeft' || e.key === 'Left') player.dx = -player.speed;
});

document.addEventListener('keyup', (e) => {
    if (['ArrowRight', 'ArrowLeft', 'Right', 'Left'].includes(e.key)) player.dx = 0;
});
// התחלת משחק בלחיצה
document.addEventListener('keydown', () => {
    if (gameOver) {
        gameOver = false;
        score = 0;
        items = [];
    }
});

document.addEventListener('click', () => {
    if (gameOver) {
        gameOver = false;
        score = 0;
        items = [];
    }
})

// מקשי מגע
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

if (leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = -player.speed; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = player.speed; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
}

function spawnItem() {
    const isCarrot = Math.random() > 0.3;
    items.push({
        x: Math.random() * (canvas.width - 45),
        y: -40,
        width: 40,
        height: 40,
        speed: 2.5 + Math.random() * 2 + (score * 0.02),
        type: isCarrot ? 'carrot' : 'rock'
    });
}

function update() {
    if (gameOver) return;

    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    spawnTimer++;
    if (spawnTimer % 45 === 0) spawnItem();

    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        ) {
            if (item.type === 'carrot') {
                score += 10;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('bunny_highScore', highScore);
                }
            } else {
                gameOver = true;
            }
            items.splice(i, 1);
            continue;
        }

        if (item.y > canvas.height) items.splice(i, 1);
    }
}

function draw() {
    // 1. רקע
    if (images.bg.complete && images.bg.naturalWidth !== 0) {
        ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. ארנב
    if (images.rabbit.complete && images.rabbit.naturalWidth !== 0) {
        ctx.drawImage(images.rabbit, player.x, player.y, player.width, player.height);
    }

    // 3. עצמים
    items.forEach(item => {
        const img = item.type === 'carrot' ? images.carrot : images.rock;
        if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, item.x, item.y, item.width, item.height);
        }
    });

    // 4. תיבת ניקוד מעוצבת בעברית
    ctx.save();
    // רקע חצי שקוף מבוסס פינות מעוגלות
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#5c2c16';
    ctx.lineWidth = 3;
    
    // ציור תיבה מעוגלת
    ctx.beginPath();
    ctx.roundRect(20, 20, 170, 75, 15);
    ctx.fill();
    ctx.stroke();

    // טקסט בעברית
    ctx.fillStyle = '#3a1e05';
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    
    ctx.fillText(`ניקוד: ${score}`, 170, 50);
    ctx.fillText(`שיא: ${highScore}`, 170, 78);
    ctx.restore();

    // 5. מסך סיום משחק מעוצב
    if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // כותרת סיום
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        
        ctx.fillText('המשחק נגמר!', canvas.width / 2, canvas.height / 2 - 20);
        
        // תת כותרת
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('רענן את הדף כדי לשחק שוב', canvas.width / 2, canvas.height / 2 + 25);
        ctx.restore();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
