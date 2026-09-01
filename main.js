const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const state = {
    money: 10,
    fishCount: 0,
    meatCount: 0,
    frame: 0,
    turtleHp: 100,
    turtleMaxHp: 100,
    message: '',
    messageTimer: 0,
    upgrades: {
        speed: { lvl: 1, cost: 15 },
        depth: { lvl: 1, cost: 20 }
    },
    fishing: false,
    hookX: 0,
    hookY: 0,
    hookBaseX: 0,
    rodTipX: 0,
    rodTipY: 0,
    maxDepth: 180,
    sinkSpeed: 0.42,
    fishes: [],
    cameraY: 0,
    targetCameraY: 0
};

const keys = {};
const boat = { x: 360, y: 230, w: 240, h: 70 };
const player = { localX: 95, speed: 2.4, minX: 25, maxX: 175 };

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyE', 'KeyF', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

function drawPixelMatrix(x, y, matrix, scale = 2, flipX = false) {
    ctx.save();
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            const color = matrix[r][c];
            if (color && color !== '.') {
                ctx.fillStyle = color;
                const drawC = flipX ? (matrix[r].length - 1 - c) : c;
                ctx.fillRect(Math.round(x + drawC * scale), Math.round(y + r * scale), scale, scale);
            }
        }
    }
    ctx.restore();
}

// ===== SPRITES =====
const SPRITE_PLAYER = [
    ['.', '.', '#166534', '#166534', '#166534', '#166534', '.', '.'],
    ['.', '#166534', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#166534', '.'],
    ['.', '#000', '#fde047', '#fde047', '#fde047', '#fde047', '#000', '.'],
    ['.', '#000', '#fde047', '#000', '#fde047', '#ffffff', '#000', '.'],
    ['.', '#000', '#fde047', '#fde047', '#fde047', '#000', '#000', '.'],
    ['.', '.', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '.', '.'],
    ['.', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '.'],
    ['#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c', '#ea580c'],
    ['.', '#1e3a8a', '#1e3a8a', '.', '.', '#1e3a8a', '#1e3a8a', '.'],
    ['.', '#1e3a8a', '#1e3a8a', '.', '.', '#1e3a8a', '#1e3a8a', '.']
];

const SPRITE_TURTLE = [
    ['.', '.', '.', '.', '.', '.', '.', '.', '#3f2a1a', '#5c4033', '#5c4033', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '#3f2a1a', '#8b5a2b', '#d4a574', '#8b5a2b', '#3f2a1a', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '#3f2a1a', '#8b5a2b', '#d4a574', '#000', '#d4a574', '#8b5a2b', '#3f2a1a', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '#1a2e05', '#1a2e05', '#3f6212', '#4d7c0f', '#65a30d', '#4d7c0f', '#3f6212', '#1a2e05', '#1a2e05', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '#1a2e05', '#3f6212', '#65a30d', '#84cc16', '#3f6212', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#1a2e05', '.', '.', '.', '.'],
    ['.', '.', '#1a2e05', '#3f6212', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#65a30d', '#84cc16', '#3f6212', '#65a30d', '#3f6212', '#1a2e05', '.', '.', '.'],
    ['.', '#1a2e05', '#3f6212', '#65a30d', '#84cc16', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#65a30d', '#84cc16', '#65a30d', '#3f6212', '#3f6212', '#1a2e05', '.', '.'],
    ['#1a2e05', '#3f6212', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#65a30d', '#84cc16', '#3f6212', '#65a30d', '#3f6212', '#1a2e05', '.', '.'],
    ['#1a2e05', '#3f6212', '#65a30d', '#84cc16', '#65a30d', '#3f6212', '#84cc16', '#65a30d', '#3f6212', '#65a30d', '#84cc16', '#65a30d', '#3f6212', '#65a30d', '#3f6212', '#1a2e05', '.', '.'],
    ['.', '#1a2e05', '#3f6212', '#65a30d', '#65a30d', '#84cc16', '#65a30d', '#65a30d', '#84cc16', '#65a30d', '#65a30d', '#3f6212', '#65a30d', '#3f6212', '#1a2e05', '.', '.', '.'],
    ['.', '.', '#1a2e05', '#1a2e05', '#3f6212', '#3f6212', '#3f6212', '#3f6212', '#3f6212', '#3f6212', '#3f6212', '#1a2e05', '#1a2e05', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '#5c4033', '#8b5a2b', '#5c4033', '.', '.', '.', '.', '.', '#5c4033', '#8b5a2b', '#5c4033', '.', '.', '.', '.'],
    ['.', '.', '#3f2a1a', '#5c4033', '.', '.', '.', '.', '.', '.', '.', '.', '#5c4033', '#3f2a1a', '.', '.', '.', '.']
];

const SPRITE_FISH = [
    ['.', '.', '#1e40af', '#1e40af', '.', '.'],
    ['.', '#1e40af', '#3b82f6', '#3b82f6', '#1e40af', '.'],
    ['#1e40af', '#3b82f6', '#ffffff', '#3b82f6', '#3b82f6', '#1e40af'],
    ['.', '#1e40af', '#3b82f6', '#3b82f6', '#1e40af', '.'],
    ['.', '.', '#1e40af', '#1e40af', '.', '.']
];

const SPRITE_FISH_GOOD = [
    ['.', '.', '.', '#c2410c', '#c2410c', '#c2410c', '.', '.'],
    ['.', '.', '#c2410c', '#fb923c', '#fb923c', '#fb923c', '#c2410c', '.'],
    ['.', '#c2410c', '#fb923c', '#fef08a', '#fb923c', '#fb923c', '#fb923c', '#c2410c'],
    ['.', '.', '#c2410c', '#fb923c', '#fb923c', '#fb923c', '#c2410c', '.'],
    ['.', '.', '.', '#c2410c', '#c2410c', '#c2410c', '.', '.']
];

const SPRITE_FISH_RARE = [
    ['.', '.', '.', '#6b21a8', '#6b21a8', '#6b21a8', '#6b21a8', '.', '.'],
    ['.', '.', '#6b21a8', '#a855f7', '#a855f7', '#eab308', '#a855f7', '#6b21a8', '.'],
    ['.', '#6b21a8', '#a855f7', '#eab308', '#fef08a', '#a855f7', '#a855f7', '#a855f7', '#6b21a8'],
    ['.', '.', '#6b21a8', '#a855f7', '#a855f7', '#a855f7', '#a855f7', '#6b21a8', '.'],
    ['.', '.', '.', '#6b21a8', '#6b21a8', '#6b21a8', '#6b21a8', '.', '.']
];

const SPRITE_FISH_LEGEND = [
    ['.', '.', '.', '#b45309', '#b45309', '#b45309', '#b45309', '#b45309', '.', '.'],
    ['.', '.', '#b45309', '#f59e0b', '#f59e0b', '#fde047', '#f59e0b', '#f59e0b', '#b45309', '.'],
    ['.', '#b45309', '#f59e0b', '#fde047', '#ffffff', '#fde047', '#f59e0b', '#f59e0b', '#f59e0b', '#b45309'],
    ['.', '.', '#b45309', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#b45309', '.'],
    ['.', '.', '.', '#b45309', '#b45309', '#b45309', '#b45309', '#b45309', '.', '.']
];

// ===== TEXTURAS MELHORADAS =====
function drawSkyAndClouds() {
    // Céu com gradiente suave
    const grad = ctx.createLinearGradient(0, 0, 0, 280);
    grad.addColorStop(0, '#7dd3fc');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 280);

    // Nuvens mais fofas
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    drawCloud(240, 185, 1.1);
    drawCloud(860, 195, 1.0);
}

function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 42 * s, 0, Math.PI * 2);
    ctx.arc(x + 35 * s, y - 22 * s, 38 * s, 0, Math.PI * 2);
    ctx.arc(x + 70 * s, y + 5 * s, 36 * s, 0, Math.PI * 2);
    ctx.arc(x + 30 * s, y + 18 * s, 30 * s, 0, Math.PI * 2);
    ctx.fill();
}

function drawIslandsAndPalms() {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(880, 270, 125, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Palmeiras
    ctx.strokeStyle = '#65a30d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(835, 265);
    ctx.quadraticCurveTo(828, 230, 820, 205);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(860, 265);
    ctx.quadraticCurveTo(868, 225, 875, 200);
    ctx.stroke();

    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(815, 200, 14, 0, Math.PI * 2);
    ctx.arc(830, 198, 13, 0, Math.PI * 2);
    ctx.arc(875, 195, 15, 0, Math.PI * 2);
    ctx.fill();
}

function drawRocks() {
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(210, 280, 38, 22, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(218, 280, 22, 18, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(720, 292, 42, 20, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawWaves() {
    const waveOffset = Math.sin(state.frame * 0.045) * 4;

    // Espuma
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(0, 278);
    for (let x = 0; x <= canvas.width; x += 36) {
        ctx.quadraticCurveTo(x + 18, 265 + waveOffset, x + 36, 278);
    }
    ctx.lineTo(canvas.width, 1300);
    ctx.lineTo(0, 1300);
    ctx.fill();

    // Água com gradiente profundo (textura melhor)
    const waterGrad = ctx.createLinearGradient(0, 280, 0, 900);
    waterGrad.addColorStop(0, '#0ea5e9');
    waterGrad.addColorStop(0.4, '#0284c7');
    waterGrad.addColorStop(0.75, '#0369a1');
    waterGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = waterGrad;

    ctx.beginPath();
    ctx.moveTo(0, 288);
    for (let x = 0; x <= canvas.width; x += 36) {
        ctx.quadraticCurveTo(x + 18, 275 + waveOffset, x + 36, 288);
    }
    ctx.lineTo(canvas.width, 1300);
    ctx.lineTo(0, 1300);
    ctx.fill();
}

function drawBoat(x, y) {
    // Casco
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x + boat.w, y + 20);
    ctx.lineTo(x + boat.w - 22, y + 62);
    ctx.lineTo(x + 12, y + 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Faixa vermelha
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 44);
    ctx.lineTo(x + boat.w - 14, y + 44);
    ctx.lineTo(x + boat.w - 22, y + 62);
    ctx.lineTo(x + 12, y + 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cabine
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 48, y - 32, 108, 52);
    ctx.strokeRect(x + 48, y - 32, 108, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 42, y - 40, 120, 9);
    ctx.strokeRect(x + 42, y - 40, 120, 9);

    // Janelas com reflexo
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + 78, y - 6, 13, 0, Math.PI * 2);
    ctx.arc(x + 118, y - 6, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(x + 74, y - 10, 5, 0, Math.PI * 2);
    ctx.arc(x + 114, y - 10, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 13px monospace';
    ctx.fillText('SS.LIGMA', x + 122, y + 42);

    // Marcadores
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    [[32, 6], [102, -50], [178, -12]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy);
        ctx.lineTo(x + ox + 11, y + oy);
        ctx.lineTo(x + ox + 5.5, y + oy + 11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // Personagem
    drawPixelMatrix(x + player.localX, y + 2, SPRITE_PLAYER, 2.5);

    const rodBaseX = x + player.localX - 8;
    const rodBaseY = y + 28;
    state.rodTipX = rodBaseX - 32;
    state.rodTipY = rodBaseY - 38;

    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.lineTo(state.rodTipX, state.rodTipY);
    ctx.stroke();
}

function drawLineAndHook() {
    if (!state.fishing) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.rodTipX, state.rodTipY);
        ctx.lineTo(state.rodTipX, state.rodTipY + 50);
        ctx.stroke();
        return;
    }

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(state.rodTipX, state.rodTipY);
    ctx.lineTo(state.hookX, state.hookY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(state.rodTipX + 1.5, state.rodTipY + 1.5);
    ctx.lineTo(state.hookX + 1.5, state.hookY + 1.5);
    ctx.stroke();

    const hx = state.hookX;
    const hy = state.hookY;

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(hx - 6, hy - 3, 12, 6);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(hx, hy - 5, 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(hx - 2, hy + 3);
    ctx.lineTo(hx - 9, hy + 14);
    ctx.lineTo(hx + 3, hy + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx - 2, hy - 1, 4, 2);
}

function drawTurtleAndUI() {
    drawPixelMatrix(678, 255, SPRITE_TURTLE, 2.7);

    const barX = 660, barY = 230;
    const hpPercent = state.turtleHp / state.turtleMaxHp;
    ctx.fillStyle = '#000';
    ctx.font = '900 12px monospace';
    ctx.fillText(`Sea turtle: ${Math.floor(state.turtleHp)}`, barX, barY - 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(barX - 2, barY - 2, 104, 14);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(barX, barY, 100, 10);
    ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : (hpPercent > 0.2 ? '#eab308' : '#dc2626');
    ctx.fillRect(barX, barY, 100 * hpPercent, 10);
}

function drawFishes() {
    state.fishes.forEach(f => {
        let sprite = SPRITE_FISH;
        let scale = 2.3;
        if (f.type === 'good') { sprite = SPRITE_FISH_GOOD; scale = 2.6; }
        if (f.type === 'rare') { sprite = SPRITE_FISH_RARE; scale = 2.9; }
        if (f.type === 'legend') { sprite = SPRITE_FISH_LEGEND; scale = 3.3; }
        drawPixelMatrix(f.x, f.y, sprite, scale, f.dir < 0);
    });
}

function showMessage(txt, time = 90) {
    state.message = txt;
    state.messageTimer = time;
}

function spawnFish() {
    if (state.fishes.length >= 16) return;

    const depthLvl = state.upgrades.depth.lvl;
    const currentDepth = Math.max(0, state.hookY - (boat.y + 80));
    const depthFactor = Math.min(1, currentDepth / Math.max(1, state.maxDepth));

    let amount = 1;
    if (depthFactor > 0.25) amount = 2;
    if (depthFactor > 0.50) amount = 3;
    if (depthFactor > 0.75) amount = 4;

    for (let n = 0; n < amount; n++) {
        if (state.fishes.length >= 16) break;

        const fromLeft = Math.random() > 0.5;
        let type = 'common';
        const roll = Math.random();

        if (depthFactor > 0.70 && depthLvl >= 3 && roll < 0.20) type = 'legend';
        else if (depthFactor > 0.45 && depthLvl >= 2 && roll < 0.35) type = 'rare';
        else if (depthFactor > 0.18 && roll < 0.55) type = 'good';

        const spawnY = state.hookY - 100 + Math.random() * 200;

        state.fishes.push({
            x: fromLeft ? state.hookX - 250 - Math.random() * 120 : state.hookX + 250 + Math.random() * 120,
            y: spawnY,
            dir: fromLeft ? 1 : -1,
            speed: type === 'legend' ? 1.5 + Math.random() * 0.5 :
                type === 'rare' ? 1.25 + Math.random() * 0.4 :
                    type === 'good' ? 0.95 + Math.random() * 0.35 :
                        0.65 + Math.random() * 0.55,
            type: type
        });
    }
}

function update() {
    state.frame++;

    if (!state.fishing) {
        if (keys['ArrowLeft'] || keys['KeyA']) player.localX -= player.speed;
        if (keys['ArrowRight'] || keys['KeyD']) player.localX += player.speed;
        player.localX = Math.max(player.minX, Math.min(player.maxX, player.localX));
    }

    if (keys['Space']) {
        if (!state.fishing) {
            state.fishing = true;
            const rodBaseX = boat.x + player.localX - 8;
            state.hookBaseX = rodBaseX - 32;
            state.hookX = state.hookBaseX;
            state.hookY = boat.y + 90;
            state.maxDepth = 160 + state.upgrades.depth.lvl * 55;
            state.sinkSpeed = 0.42 + state.upgrades.speed.lvl * 0.18;
            showMessage('Anzol descendo... quanto mais fundo, mais peixes!');
        } else {
            state.fishing = false;
            state.targetCameraY = 0;
            showMessage('Linha recolhida');
        }
        keys['Space'] = false;
    }

    if (state.fishing) {
        let currentSink = state.sinkSpeed;
        if (keys['ArrowUp'] || keys['KeyW']) currentSink = -1.5;
        if (keys['ArrowDown'] || keys['KeyS']) currentSink = state.sinkSpeed * 2.0;

        state.hookY += currentSink;

        const sideSpeed = 2.3 + state.upgrades.speed.lvl * 0.22;
        if (keys['ArrowLeft'] || keys['KeyA']) state.hookX -= sideSpeed;
        if (keys['ArrowRight'] || keys['KeyD']) state.hookX += sideSpeed;

        state.hookY = Math.max(boat.y + 80, Math.min(boat.y + 80 + state.maxDepth, state.hookY));
        state.hookX = Math.max(state.hookBaseX - 140, Math.min(state.hookBaseX + 140, state.hookX));

        const maxCam = 60 + state.upgrades.depth.lvl * 70;
        state.targetCameraY = Math.min(maxCam, Math.max(0, state.hookY - 300));

        if (state.frame % 28 === 0) spawnFish();

        for (let i = state.fishes.length - 1; i >= 0; i--) {
            const f = state.fishes[i];
            f.x += f.dir * f.speed;

            if (Math.abs(f.x - state.hookX) > 480 || Math.abs(f.y - state.hookY) > 280) {
                state.fishes.splice(i, 1);
                continue;
            }

            const hitSize = f.type === 'legend' ? 24 : f.type === 'rare' ? 19 : 15;
            if (Math.abs(f.x + 10 - state.hookX) < hitSize && Math.abs(f.y + 8 - state.hookY) < hitSize) {
                let gained = 1;
                let msg = '+1 Peixe Comum';
                if (f.type === 'good') { gained = 2; msg = '+2 Peixe Médio'; }
                if (f.type === 'rare') { gained = 4; msg = '+4 Peixe Raro!'; }
                if (f.type === 'legend') { gained = 8; msg = '+8 Peixe LENDÁRIO!!!'; }

                state.fishCount += gained;
                state.fishes.splice(i, 1);
                showMessage(msg);
                updateUI();
            }
        }
    } else {
        state.fishes = [];
        state.targetCameraY = 0;
    }

    state.cameraY += (state.targetCameraY - state.cameraY) * 0.08;

    if (keys['KeyE']) {
        if (state.fishCount > 0) {
            state.fishCount--;
            state.meatCount += 1 + Math.floor(Math.random() * 2);
            showMessage('Escamas removidas!');
            updateUI();
        }
        keys['KeyE'] = false;
    }

    if (keys['KeyF']) {
        if (player.localX > 130) {
            if (state.meatCount > 0) {
                state.meatCount--;
                state.turtleHp = Math.min(state.turtleMaxHp, state.turtleHp + 12);
                const moneyGain = 6 + Math.floor(Math.random() * 10);
                state.money += moneyGain;
                showMessage(`Tartaruga feliz! +12 HP  +$${moneyGain}`);
                updateUI();
            } else {
                showMessage('Sem escamas/carne!');
            }
        } else {
            showMessage('Chegue mais perto da tartaruga!');
        }
        keys['KeyF'] = false;
    }

    if (state.messageTimer > 0) {
        state.messageTimer--;
        if (state.messageTimer === 0) state.message = '';
    }

    if (state.frame % 320 === 0 && state.turtleHp > 20) {
        state.turtleHp = Math.max(20, state.turtleHp - 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -state.cameraY);

    drawSkyAndClouds();
    drawIslandsAndPalms();
    drawRocks();

    const floatY = Math.sin(state.frame * 0.05) * 3;
    drawBoat(boat.x, boat.y + floatY);

    drawWaves();
    drawFishes();
    drawLineAndHook();
    drawTurtleAndUI();

    ctx.restore();

    if (state.message) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(canvas.width / 2 - 180, 55, 360, 38);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width / 2 - 180, 55, 360, 38);
        ctx.fillStyle = '#fff';
        ctx.font = '900 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(state.message, canvas.width / 2, 80);
        ctx.textAlign = 'left';
    }

    if (!state.fishing && player.localX > 130 && state.meatCount > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.font = '900 13px monospace';
        ctx.fillText('F → Dar escamas (+$)', 620, 205);
    }
}

function updateUI() {
    document.getElementById('ui-fish').textContent = state.fishCount;
    document.getElementById('ui-meat').textContent = state.meatCount;
    document.getElementById('ui-money').textContent = state.money;
    document.getElementById('lvl-speed').textContent = state.upgrades.speed.lvl;
    document.getElementById('cost-speed').textContent = state.upgrades.speed.cost;
    document.getElementById('lvl-depth').textContent = state.upgrades.depth.lvl;
    document.getElementById('cost-depth').textContent = state.upgrades.depth.cost;
}

function toggleShop(open) {
    document.getElementById('shop-modal').style.display = open ? 'block' : 'none';
}

function buyUpgrade(type) {
    const upg = state.upgrades[type];
    if (state.money >= upg.cost) {
        state.money -= upg.cost;
        upg.lvl++;
        upg.cost = Math.floor(upg.cost * 1.5);
        updateUI();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

updateUI();
loop();
