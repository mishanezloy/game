class Collision {
    static checkPlayerPlatform(player, platform) {
        // Пропускаем неактивные или разрушенные платформы
        if (platform.height <= 0 || !platform.isActive) return false;
        
        // Проверяем, находится ли игрок над платформой по вертикали
        const isAbovePlatform = player.y + player.height <= platform.y + 5;
        const isBelowPlatform = player.y >= platform.y + platform.height;
        const isHorizontallyAligned = player.x < platform.x + platform.width && 
                                      player.x + player.width > platform.x;
        
        // Если игрок над платформой и выравнен по горизонтали
        if (isAbovePlatform && isHorizontallyAligned) {
            // Проверяем расстояние до платформы
            const distanceToPlatform = platform.y - (player.y + player.height);
            
            // Если игрок близко к платформе и падает вниз
            if (distanceToPlatform >= -5 && distanceToPlatform <= player.velocityY + 10 && player.velocityY >= 0) {
                // Корректируем позицию игрока
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isOnGround = true;
                player.landingGracePeriod = player.maxGracePeriod; // Устанавливаем льготный период
                
                // Особые эффекты для разных типов платформ
                switch(platform.type) {
                    case 'bouncy':
                        player.velocityY = -15; // Высокий отскок
                        player.isOnGround = false;
                        
                        // Активируем исчезновение платформы после отскока
                        setTimeout(() => {
                            platform.triggerDisappear();
                        }, 50); // Небольшая задержка для визуального эффекта
                        break;
                    case 'breakable':
                        // Платформа разрушается
                        platform.height = 0;
                        player.isOnGround = false; // Игрок продолжает падать
                        break;
                }
                
                return true;
            }
        }
        
        // Если игрок под платформой - проверяем столкновение с нижней стороной
        if (isBelowPlatform && isHorizontallyAligned && player.velocityY < 0) {
            const distanceFromBottom = player.y - (platform.y + platform.height);
            if (distanceFromBottom < 10) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
                return true;
            }
        }
        
        // Если игрок не на платформе, но был на ней ранее
        if (player.isOnGround && !isHorizontallyAligned) {
            // Проверяем, не сошел ли игрок с края платформы
            const isOnLeftEdge = player.x + player.width < platform.x;
            const isOnRightEdge = player.x > platform.x + platform.width;
            
            if ((isOnLeftEdge || isOnRightEdge) && player.velocityY === 0) {
                // Игрок сошел с края - начинаем падение
                player.isOnGround = false;
            }
        }
        
        return false;
    }
    
    static checkPlayerCoin(player, platform) {
        if (!platform.hasCoin || platform.coinCollected || !platform.isActive) return false;
        
        const coinX = platform.x + platform.width / 2;
        const coinY = platform.coinY;
        const coinRadius = 15;
        
        // Проверка расстояния между игроком и монетой
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - coinX, 2) + 
            Math.pow(playerCenterY - coinY, 2)
        );
        
        return distance < (player.width / 2 + coinRadius);
    }
    
    static checkPlayerOutOfBounds(player, canvas) {
        return player.y > canvas.height + 50; // Даем небольшой запас
    }
}