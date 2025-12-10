// ========================================
// Mushi Breaker - 플레이어 및 업데이트
// ========================================

// 플레이어 업데이트
function updatePlayer(deltaTime) {
  let dx = 0;
  let dy = 0;
  
  if (keys['a']) dx -= 1;
  if (keys['d']) dx += 1;
  if (keys['w']) dy -= 1;
  if (keys['s']) dy += 1;
  
  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    
    const moveSpeed = player.speed * player.statBonuses.moveSpeedMult;
    player.x += dx * moveSpeed * deltaTime;
    player.y += dy * moveSpeed * deltaTime;
    
    player.facingAngle = Math.atan2(dy, dx);
  }
  
  // 가장 가까운 적을 향해 자동으로 바라보기
  let nearestEnemy = null;
  let nearestDist = ENEMY_DETECT_RANGE;
  
  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestEnemy = enemy;
    }
  }
  
  if (nearestEnemy) {
    player.facingAngle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
  }
  
  // 맵 경계 제한
  player.x = Math.max(player.size / 2, Math.min(MAP_SIZE - player.size / 2, player.x));
  player.y = Math.max(player.size / 2, Math.min(MAP_SIZE - player.size / 2, player.y));
  
  // 드랍 아이템 습득
  for (let i = dropItems.length - 1; i >= 0; i--) {
    const item = dropItems[i];
    const dist = Math.hypot(item.x - player.x, item.y - player.y);
    
    if (dist < item.pickupRange) {
      if (item.type === 'health') {
        // 체력 전체 회복
        player.health = player.maxHealth + player.statBonuses.maxHealthBonus;
        console.log('💊 체력 전체 회복!');
      } else if (item.type === 'magnet') {
        // 모든 경험치 즉시 획득
        for (const orb of expOrbs) {
          player.exp += orb.value;
          if (player.exp >= player.expToNextLevel) {
            levelUp();
          }
        }
        expOrbs.length = 0;
        console.log('🧲 모든 경험치 획득!');
      } else if (item.type === 'levelup') {
        // 증강 선택 화면 표시
        game.isPaused = true;
        showLevelUpScreen();
        console.log('⭐ 보스 보상: 증강 선택!');
      }
      dropItems.splice(i, 1);
    }
  }
  
  // 드랍 아이템 수명 감소
  for (let i = dropItems.length - 1; i >= 0; i--) {
    dropItems[i].lifetime -= deltaTime;
    if (dropItems[i].lifetime <= 0) {
      dropItems.splice(i, 1);
    }
  }
}

// 카메라 업데이트
function updateCamera() {
  camera.x = player.x;
  camera.y = player.y;
}

// 월드 좌표를 화면 좌표로 변환
function worldToScreen(worldX, worldY) {
  return {
    x: worldX - camera.x + GAME_WIDTH / 2,
    y: worldY - camera.y + GAME_HEIGHT / 2,
  };
}

// 레벨업
function levelUp() {
  player.level++;
  player.exp -= player.expToNextLevel;
  player.expToNextLevel = Math.floor(player.expToNextLevel * 1.5);
  
  // 체력 30% 회복
  player.health = Math.min(
    player.maxHealth + player.statBonuses.maxHealthBonus,
    player.health + (player.maxHealth + player.statBonuses.maxHealthBonus) * 0.3
  );
  
  // 리롤 리셋
  player.canReroll = true;
  
  // 레벨업 화면 표시
  game.isPaused = true;
  showLevelUpScreen();
}
