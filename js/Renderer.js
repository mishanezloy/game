class Renderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.backgroundGradient = this.createBackgroundGradient();
        this.clouds = this.generateClouds();
    }
    
    createBackgroundGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Небо
        gradient.addColorStop(1, '#E0F7FF'); // Нижняя часть
        return gradient;
    }
    
    generateClouds() {
        const clouds = [];
        for (let i = 0; i < 10; i++) {
            clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200,
                width: 80 + Math.random() * 120,
                speed: 0.2 + Math.random() * 0.5
            });
        }
        return clouds;
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
                cloud.y = Math.random() * 200;
            }
        });
    }
    
    drawBackground() {
        // Небо
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Облака
        this.updateClouds();
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.drawCloud(cloud.x, cloud.y, cloud.width);
        });
        
        // Солнце
        this.drawSun();
    }
    
    drawCloud(x, y, width) {
        const segments = 5;
        const segmentWidth = width / segments;
        
        for(let i = 0; i < segments; i++) {
            const segmentX = x + i * segmentWidth;
            this.ctx.beginPath();
            this.ctx.arc(segmentX, y, segmentWidth / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawSun() {
        this.ctx.save();
        this.ctx.translate(this.canvas.width - 80, 80);
        
        // Лучи солнца
        this.ctx.fillStyle = '#FFEB3B';
        for(let i = 0; i < 12; i++) {
            this.ctx.save();
            this.ctx.rotate(i * Math.PI / 6);
            this.ctx.fillRect(0, -40, 5, 40);
            this.ctx.restore();
        }
        
        // Центр солнца
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFC107';
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawGround() {
        // Земля внизу
        this.ctx.fillStyle = '#8BC34A';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Трава
        this.ctx.fillStyle = '#7CB342';
        for(let i = 0; i < this.canvas.width; i += 20) {
            const height = 10 + Math.random() * 20;
            this.ctx.fillRect(i, this.canvas.height - 50, 10, -height);
        }
    }
    
    drawGameInfo(score, lives, hasDoubleJump) {
        // Панель информации
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 90);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Очки: ${score}`, 30, 40);
        this.ctx.fillText(`Жизни: ${lives}`, 30, 70);
        this.ctx.fillText(`Двойной прыжок: ${hasDoubleJump ? '✓' : '✗'}`, 30, 100);
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ПАУЗА', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Нажмите ПРОБЕЛ для продолжения', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    drawGameOver(score) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ИГРА ОКОНЧЕНА', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Ваш счет: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Нажмите R для перезапуска', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }
}