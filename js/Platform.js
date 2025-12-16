class Platform {
    constructor(x, y, width, height, type = 'normal', canvasHeight = 500) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'moving', 'breakable', 'bouncy'
        this.color = this.getColorByType();
        this.velocityX = 0;
        this.velocityY = 0;
        this.direction = 1;
        this.speed = type === 'moving' ? 2 : 0;
        this.originalX = x;
        this.originalY = y;
        this.hasCoin = Math.random() > 0.7;
        this.coinCollected = false;
        
        // Новые свойства для исчезающих платформ
        this.isActive = true; // Активна ли платформа
        this.disappearTimer = 0; // Таймер для анимации исчезновения
        this.disappearDelay = 10; // Задержка перед началом исчезновения (в кадрах)
        this.disappearSpeed = 0.1; // Скорость исчезновения
        
        // Определяем положение монеты с проверкой границ
        let coinY = y - 30;
        
        // Проверяем, чтобы монета не выходила за верхнюю границу (с небольшим отступом)
        const minCoinY = 20; // Минимальная высота от верхнего края
        if (coinY < minCoinY) {
            coinY = minCoinY;
        }
        
        this.coinY = coinY;
        this.coinRotation = 0;
    }
    
    getColorByType() {
        switch(this.type) {
            case 'moving':
                return '#9C27B0';
            case 'breakable':
                return '#795548';
            case 'bouncy':
                return '#00BCD4';
            default:
                return '#4CAF50';
        }
    }
    
    update() {
        if (!this.isActive) {
            // Анимация исчезновения
            this.disappearTimer++;
            if (this.disappearTimer > this.disappearDelay) {
                this.height = Math.max(0, this.height - this.disappearSpeed);
            }
            return;
        }
        
        if (this.type === 'moving') {
            this.x += this.speed * this.direction;
            
            // Изменяем направление при достижении границ
            if (this.x > this.originalX + 100 || this.x < this.originalX - 100) {
                this.direction *= -1;
            }
        }
        
        // Анимация монеты
        if (this.hasCoin && !this.coinCollected) {
            this.coinRotation += 0.1;
        }
    }
    
    draw(ctx) {
        // Если платформа исчезла, не рисуем ее
        if (this.height <= 0) return;
        
        ctx.save();
        
        // Для исчезающих платформ добавляем эффект
        if (!this.isActive && this.disappearTimer > this.disappearDelay) {
            const opacity = 0.5 + 0.5 * Math.sin(this.disappearTimer * 0.3);
            ctx.fillStyle = `rgba(0, 188, 212, ${opacity})`; // Прозрачный голубой
        } else {
            ctx.fillStyle = this.color;
        }
        
        // Платформа
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Текстура платформы (только для активных платформ)
        if (this.isActive) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for(let i = 0; i < this.width; i += 10) {
                ctx.fillRect(this.x + i, this.y + 2, 5, this.height - 4);
            }
        }
        
        // Монета (только для активных платформ с монетами)
        if (this.isActive && this.hasCoin && !this.coinCollected) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.coinY);
            ctx.rotate(this.coinRotation);
            
            // Монета
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFC400';
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Блики на монете
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-5, -3, 3, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Эффект трещин для исчезающих платформ
        if (!this.isActive && this.disappearTimer > this.disappearDelay / 2) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            
            // Рисуем трещины
            for (let i = 0; i < 3; i++) {
                const crackX = this.x + Math.random() * this.width;
                const crackY = this.y + Math.random() * this.height;
                const crackLength = 10 + Math.random() * 20;
                
                ctx.beginPath();
                ctx.moveTo(crackX, crackY);
                ctx.lineTo(crackX + crackLength, crackY + crackLength);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    // Метод для активации исчезновения (для прыгучих платформ)
    triggerDisappear() {
        if (this.type === 'bouncy' && this.isActive) {
            this.isActive = false;
            return true;
        }
        return false;
    }
    
    collectCoin() {
        if (this.hasCoin && !this.coinCollected) {
            this.coinCollected = true;
            return 100; // очки за монету
        }
        return 0;
    }
}