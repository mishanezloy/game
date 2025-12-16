class Player {
    constructor(x, y) {
        this.width = 40;
        this.height = 60;
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -12;
        this.gravity = 0.5;
        this.maxFallSpeed = 15;
        this.isOnGround = false;
        this.hasDoubleJump = true;
        this.isFacingRight = true;
        this.color = '#FF5722';
        this.animationFrame = 0;
        this.health = 100;
        this.score = 0;
        
        // Добавим флаг для плавного приземления
        this.wasOnGround = false;
        this.justLanded = false;
        this.landingGracePeriod = 0;
        this.maxGracePeriod = 5; // кадры "льготного периода" для приземления
    }
    
    update(input, platforms) {
        // Сохраняем предыдущее состояние
        this.wasOnGround = this.isOnGround;
        this.justLanded = false;
        
        // Снижаем льготный период для приземления
        if (this.landingGracePeriod > 0) {
            this.landingGracePeriod--;
        }
        
        // Горизонтальное движение
        this.velocityX = 0;
        
        if (input.isLeftPressed()) {
            this.velocityX = -this.speed;
            this.isFacingRight = false;
        }
        
        if (input.isRightPressed()) {
            this.velocityX = this.speed;
            this.isFacingRight = true;
        }
        
        // Прыжок с земли
        if (input.isJumpPressed() && (this.isOnGround || this.landingGracePeriod > 0)) {
            this.velocityY = this.jumpPower;
            this.isOnGround = false;
            this.hasDoubleJump = true;
            this.landingGracePeriod = 0; // сбрасываем при прыжке
        }
        
        // Двойной прыжок в воздухе
        if (input.isDoubleJumpPressed() && this.hasDoubleJump && !this.isOnGround && this.velocityY > this.jumpPower * 0.5) {
            this.velocityY = this.jumpPower * 0.9;
            this.hasDoubleJump = false;
            input.resetDoubleJump();
        }
        
        // Гравитация
        if (!this.isOnGround) {
            this.velocityY += this.gravity;
            if (this.velocityY > this.maxFallSpeed) {
                this.velocityY = this.maxFallSpeed;
            }
        } else {
            // На земле - сбрасываем вертикальную скорость
            this.velocityY = 0;
        }
        
        // Обновление позиции
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Анимация
        if (this.velocityX !== 0 && this.isOnGround) {
            this.animationFrame += 0.2;
        }
        
        // Проверка границ экрана
        const canvas = document.getElementById('gameCanvas');
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Восстанавливаем возможность двойного прыжка при приземлении
        if (this.isOnGround) {
            this.hasDoubleJump = true;
        }
        
        // Определяем, только что приземлился ли персонаж
        if (this.isOnGround && !this.wasOnGround) {
            this.justLanded = true;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Тень (увеличиваем при прыжке)
        const shadowHeight = this.isOnGround ? 10 : 5 + Math.abs(this.velocityY) * 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + 5, this.y + this.height - 5, this.width, shadowHeight);
        
        // Тело игрока
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Глаза
        ctx.fillStyle = 'white';
        const eyeX = this.isFacingRight ? this.x + 25 : this.x + 15;
        ctx.fillRect(eyeX, this.y + 15, 8, 8);
        
        // Рот (меняем выражение при приземлении)
        ctx.fillStyle = 'black';
        if (this.justLanded) {
            // Улыбка при удачном приземлении
            ctx.beginPath();
            ctx.arc(eyeX, this.y + 35, 10, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else {
            ctx.fillRect(eyeX - 5, this.y + 30, 15, 3);
        }
        
        // Анимация ног
        if (Math.abs(this.velocityX) > 0 && this.isOnGround) {
            const legOffset = Math.sin(this.animationFrame) * 5;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x + 5, this.y + this.height, 10, -20 + legOffset);
            ctx.fillRect(this.x + 25, this.y + this.height, 10, -20 - legOffset);
        } else {
            ctx.fillStyle = '#333';
            // Ноги сгибаются при приземлении
            const legBend = this.justLanded ? -5 : 0;
            ctx.fillRect(this.x + 5, this.y + this.height, 10, -20 + legBend);
            ctx.fillRect(this.x + 25, this.y + this.height, 10, -20 + legBend);
        }
        
        // Эффект двойного прыжка
        if (!this.hasDoubleJump && !this.isOnGround) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            
            // Эффект частиц двойного прыжка
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            for (let i = 0; i < 3; i++) {
                const particleSize = 3 + Math.random() * 4;
                const particleX = this.x + Math.random() * this.width;
                const particleY = this.y + this.height - 5;
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Эффект приземления
        if (this.justLanded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 5; i++) {
                const particleSize = 2 + Math.random() * 3;
                const particleX = this.x + Math.random() * this.width;
                const particleY = this.y + this.height;
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.wasOnGround = false;
        this.justLanded = false;
        this.hasDoubleJump = true;
        this.landingGracePeriod = 0;
        this.health = 100;
    }
}