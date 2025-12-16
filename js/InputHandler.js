class InputHandler {
    constructor() {
        this.keys = {};
        this.doubleJumpPressed = false;
        this.lastJumpPress = 0;
        this.doubleJumpTimeout = null;
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Обнаружение быстрого двойного нажатия для двойного прыжка
            if (e.key === ' ' || e.key === 'ArrowUp') {
                const currentTime = Date.now();
                
                // Если предыдущее нажатие было недавно (менее 250ms)
                if (currentTime - this.lastJumpPress < 250) {
                    this.doubleJumpPressed = true;
                    
                    // Автосброс через короткое время
                    if (this.doubleJumpTimeout) {
                        clearTimeout(this.doubleJumpTimeout);
                    }
                    this.doubleJumpTimeout = setTimeout(() => {
                        this.doubleJumpPressed = false;
                    }, 100);
                }
                
                this.lastJumpPress = currentTime;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            // Сбрасываем двойной прыжок при отпускании клавиш
            if (e.key === ' ' || e.key === 'ArrowUp') {
                setTimeout(() => {
                    if (!this.keys[' '] && !this.keys['ArrowUp']) {
                        this.doubleJumpPressed = false;
                    }
                }, 50);
            }
        });
        
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        // Можно добавить сенсорное управление
    }
    
    isLeftPressed() {
        return this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    }
    
    isRightPressed() {
        return this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
    }
    
    isJumpPressed() {
        return this.keys[' '] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'];
    }
    
    isDoubleJumpPressed() {
        return this.doubleJumpPressed || this.keys['Shift'] || this.keys['Control'];
    }
    
    resetDoubleJump() {
        this.doubleJumpPressed = false;
    }
}