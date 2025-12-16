class Game {
    constructor(canvas, ctx, callbacks = {}) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.callbacks = callbacks;
        
        this.player = new Player(100, 300);
        this.inputHandler = new InputHandler();
        this.renderer = new Renderer(ctx, canvas);
        this.platforms = [];
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        this.win = false;
        this.paused = false;
        this.gameLoop = null;
        this.lastTime = 0;
        this.coinsCollected = 0;
        this.totalCoins = 0;
        
        this.generateLevel();
    }
    
    generateLevel() {
        this.platforms = [];
        this.coinsCollected = 0;
        this.totalCoins = 0;
        
        // Стартовая платформа
		this.platforms.push(new Platform(50, 400, 200, 20, 'normal', this.canvas.height));
        
        // Платформы для прохождения
        const platformTypes = ['normal', 'moving', 'bouncy'];
        
		for(let i = 0; i < 15; i++) {
			const x = 100 + Math.random() * 600;
			const y = 350 - i * 70;
			const width = 80 + Math.random() * 120;
			const type = platformTypes[Math.floor(Math.random() * platformTypes.length)];
			
			// Передаем высоту canvas в конструктор платформы
			const platform = new Platform(x, y, width, 20, type, this.canvas.height);
			if (platform.hasCoin) this.totalCoins++;
			this.platforms.push(platform);
		}
        
        // Финальная платформа
		const finalPlatform = new Platform(600, 100, 150, 20, 'normal', this.canvas.height);
		finalPlatform.hasCoin = true;
		this.totalCoins++;
		this.platforms.push(finalPlatform);
    }
    
    start() {
        this.gameOver = false;
        this.win = false;
        this.lives = 3;
        this.score = 0;
        this.player.reset(100, 300);
        this.generateLevel();
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    togglePause() {
        this.paused = !this.paused;
        if (!this.paused && !this.gameLoop) {
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
        }
    }
    
	update(currentTime) {
		if (this.paused) {
			this.draw();
			this.gameLoop = requestAnimationFrame((time) => this.update(time));
			return;
		}
		
		const deltaTime = currentTime - this.lastTime;
		this.lastTime = currentTime;
		
		// Обновление игрока
		this.player.update(this.inputHandler, this.platforms);
		
		// Обновление платформ
		this.platforms.forEach(platform => platform.update());
		
		// Проверка коллизий
		this.checkCollisions();
		
		// Удаляем полностью исчезнувшие платформы (опционально)
		this.platforms = this.platforms.filter(platform => platform.height > 0);
		
		// Проверка условий победы/поражения
		this.checkGameConditions();
		
		// Отрисовка
		this.draw();
		
		// Обновление UI через callback
		if (this.callbacks.onUpdate) {
			this.callbacks.onUpdate(this.score, this.lives, this.player.hasDoubleJump);
		}
		
		// Продолжаем игровой цикл если игра не окончена
		if (!this.gameOver && !this.win) {
			this.gameLoop = requestAnimationFrame((time) => this.update(time));
		}
	}
    
    checkCollisions() {
		let isOnAnyPlatform = false;
		let landedOnPlatform = null;
		
		// Сначала проверяем все платформы на возможное приземление
		this.platforms.forEach(platform => {
			if (platform.height > 0) {
				const collision = Collision.checkPlayerPlatform(this.player, platform);
				if (collision && !isOnAnyPlatform) {
					isOnAnyPlatform = true;
					landedOnPlatform = platform;
				}
			}
		});
		
		// Устанавливаем состояние нахождения на земле
		this.player.isOnGround = isOnAnyPlatform;
		
		// Если приземлились на новую платформу
		if (landedOnPlatform) {
			// Проверяем сбор монет на этой платформе
			if (Collision.checkPlayerCoin(this.player, landedOnPlatform)) {
				this.score += landedOnPlatform.collectCoin();
				this.coinsCollected++;
			}
		} else {
			// Проверяем сбор монет на всех платформах (если не приземлились)
			this.platforms.forEach(platform => {
				if (Collision.checkPlayerCoin(this.player, platform)) {
					this.score += platform.collectCoin();
					this.coinsCollected++;
				}
			});
		}
		
		// Проверка выхода за границы
		if (Collision.checkPlayerOutOfBounds(this.player, this.canvas)) {
			this.lives--;
			if (this.lives <= 0) {
				this.gameOver = true;
				if (this.callbacks.onGameOver) {
					this.callbacks.onGameOver(this.score);
				}
			} else {
				this.player.reset(100, 300);
			}
		}
	}
    
    checkGameConditions() {
        // Проверка победы (все монеты собраны)
        if (this.coinsCollected >= this.totalCoins && this.totalCoins > 0) {
            this.win = true;
            this.score += 1000; // Бонус за победу
            if (this.callbacks.onWin) {
                this.callbacks.onWin(this.score);
            }
        }
    }
    
    draw() {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка фона
        this.renderer.drawBackground();
        this.renderer.drawGround();
        
        // Отрисовка платформ
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Отрисовка игрока
        this.player.draw(this.ctx);
        
        // Отрисовка информации
        this.renderer.drawGameInfo(this.score, this.lives, this.player.hasDoubleJump);
        
        // Отрисовка экрана паузы
        if (this.paused) {
            this.renderer.drawPauseScreen();
        }
        
        // Отрисовка экрана завершения игры
        if (this.gameOver) {
            this.renderer.drawGameOver(this.score);
        }
        
        // Отрисовка экрана победы
        if (this.win) {
            this.renderer.drawGameOver(this.score);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ПОБЕДА!', this.canvas.width / 2, this.canvas.height / 2 - 100);
            this.ctx.font = '36px Arial';
            this.ctx.fillText('Все монеты собраны!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        }
    }
}