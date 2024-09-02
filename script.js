document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const hpElement = document.getElementById('hp');
    const gun = document.getElementById('gun');
    const hpPotion = document.getElementById('hpPotion');
    const deathScreen = document.getElementById('deathScreen');
    const restartBtn = document.getElementById('restartBtn');
    const scoreElement = document.getElementById('score');
    const stopwatchElement = document.getElementById('stopwatch');
    let playerHP = 100;
    let score = 0;
    let gunAiming = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let stopwatch = 0;
    let stopwatchInterval;

    function updateHP() {
        hpElement.textContent = `HP: ${playerHP}`;
        if (playerHP <= 0) {
            player.classList.add('explode');
            setTimeout(() => {
                deathScreen.style.display = 'block';
                clearInterval(stopwatchInterval);
            }, 500);
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
    }

    function updateStopwatch() {
        stopwatch += 1;
        const minutes = Math.floor(stopwatch / 60);
        const seconds = stopwatch % 60;
        stopwatchElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function checkCollision(el1, el2) {
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    function spawnZombie() {
        const zombie = document.createElement('div');
        zombie.className = 'zombie';
        zombie.textContent = '🧟';
        zombie.style.top = `${Math.random() * (window.innerHeight - 40)}px`;
        zombie.style.left = `${Math.random() * (window.innerWidth - 40)}px`;

        const types = [
            { color: '#f00', health: 30, attack: 5, points: 10 },
            { color: '#f80', health: 50, attack: 10, points: 20 },
            { color: '#f0f', health: 70, attack: 15, points: 30 }
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        zombie.style.color = type.color;
        zombie.dataset.health = type.health;
        zombie.dataset.attack = type.attack;
        zombie.dataset.points = type.points;

        gameArea.appendChild(zombie);
    }

    function spawnHPotion() {
        if (Math.random() < 0.2) {
            hpPotion.style.display = 'block';
            hpPotion.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
            hpPotion.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
        }
    }

    function moveZombies() {
        document.querySelectorAll('.zombie').forEach(zombie => {
            const zombieRect = zombie.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            const xMove = (playerRect.left + playerRect.width / 2 - (zombieRect.left + zombieRect.width / 2)) / 50;
            const yMove = (playerRect.top + playerRect.height / 2 - (zombieRect.top + zombieRect.height / 2)) / 50;

            zombie.style.left = `${zombieRect.left + xMove}px`;
            zombie.style.top = `${zombieRect.top + yMove}px`;

            if (checkCollision(player, zombie)) {
                playerHP -= parseInt(zombie.dataset.attack);
                updateHP();
                zombie.remove();
            }
        });
    }

    function shootBullet(x, y) {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.width = '10px';
        bullet.style.height = '10px';
        bullet.style.position = 'absolute';
        bullet.style.top = `${player.offsetTop + 20}px`;
        bullet.style.left = `${player.offsetLeft + 20}px`;
        bullet.textContent = '⁍';
        bullet.style.fontSize = '20px';
        bullet.style.textAlign = 'center';
        bullet.style.lineHeight = '10px';
        gameArea.appendChild(bullet);

        const angle = Math.atan2(y - (player.offsetTop + 20), x - (player.offsetLeft + 20));
        const bulletInterval = setInterval(() => {
            bullet.style.left = `${bullet.offsetLeft + Math.cos(angle) * 10}px`;
            bullet.style.top = `${bullet.offsetTop + Math.sin(angle) * 10}px`;

            document.querySelectorAll('.zombie').forEach(zombie => {
                if (checkCollision(bullet, zombie)) {
                    updateScore(parseInt(zombie.dataset.points));
                    zombie.remove();
                    bullet.remove();
                    clearInterval(bulletInterval);
                }
            });

            if (bullet.offsetLeft > window.innerWidth || bullet.offsetTop < 0 || bullet.offsetTop > window.innerHeight) {
                bullet.remove();
                clearInterval(bulletInterval);
            }
        }, 50);
    }

    function pickUpHPotion() {
        if (checkCollision(player, hpPotion)) {
            playerHP = Math.min(100, playerHP + 20);
            updateHP();
            hpPotion.style.display = 'none';
        }
    }

    restartBtn.addEventListener('click', () => {
        document.location.reload();
    });

    document.addEventListener('keydown', (event) => {
        const step = 10;
        const playerRect = player.getBoundingClientRect();

        switch(event.key) {
            case 'w':
                player.style.top = `${Math.max(0, playerRect.top - step)}px`;
                break;
            case 's':
                player.style.top = `${Math.min(window.innerHeight - playerRect.height, playerRect.top + step)}px`;
                break;
            case 'a':
                player.style.left = `${Math.max(0, playerRect.left - step)}px`;
                break;
            case 'd':
                player.style.left = `${Math.min(window.innerWidth - playerRect.width, playerRect.left + step)}px`;
                break;
        }
    });

    document.addEventListener('mousemove', (event) => {
        gunAiming.x = event.clientX;
        gunAiming.y = event.clientY;
        gun.style.left = `${gunAiming.x - 20}px`;
        gun.style.top = `${gunAiming.y - 20}px`;
    });

    gameArea.addEventListener('click', () => {
        shootBullet(gunAiming.x, gunAiming.y);
    });

    function startStopwatch() {
        stopwatchInterval = setInterval(updateStopwatch, 1000);
    }

    startStopwatch();

    setInterval(spawnZombie, 3000);
    setInterval(moveZombies, 100);
    setInterval(spawnHPotion, 5000);
    setInterval(pickUpHPotion, 50);
});
