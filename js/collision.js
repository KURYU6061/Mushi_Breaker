// ========================================
// Mushi Breaker - 충돌 처리 및 유닛 분리
// ========================================

// 유닛 간 겹침 방지 (적들끼리)
function separateEnemies(deltaTime) {
  const separationForce = 50; // 분리 힘
  
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const e1 = enemies[i];
      const e2 = enemies[j];
      
      const dx = e2.x - e1.x;
      const dy = e2.y - e1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = (e1.size + e2.size) / 2;
      
      // 겹쳐 있으면 밀어냄
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap * 0.5;
        const pushY = (dy / dist) * overlap * 0.5;
        
        e1.x -= pushX;
        e1.y -= pushY;
        e2.x += pushX;
        e2.y += pushY;
      }
    }
  }
}

// 플레이어와 적 충돌 체크
function checkPlayerEnemyCollision() {
  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = (player.size + enemy.size) / 2;
    
    if (dist < minDist) {
      // 플레이어 피해
      player.health -= enemy.type.damage * 0.016; // 초당 피해로 조정
      
      // 적을 밀어냄
      if (dist > 0) {
        const pushX = (dx / dist) * enemy.type.knockback;
        const pushY = (dy / dist) * enemy.type.knockback;
        enemy.x += pushX;
        enemy.y += pushY;
      }
    }
  }
}

// 투사체와 적 충돌 체크
function checkProjectileCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    let hit = false;
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dx = enemy.x - proj.x;
      const dy = enemy.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= proj.size + enemy.size / 2) {
        enemy.health -= proj.damage;
        
        // 넉백 저항 적용
        const knockbackResist = enemy.type.knockbackResist || 0;
        const effectiveKnockback = enemy.type.knockback * (1 - knockbackResist);
        
        const angle = Math.atan2(dy, dx);
        enemy.x += Math.cos(angle) * effectiveKnockback;
        enemy.y += Math.sin(angle) * effectiveKnockback;
        
        if (!proj.pierce) {
          hit = true;
          break;
        }
      }
    }
    
    if (hit) {
      projectiles.splice(i, 1);
    }
  }
}

// 적 투사체와 플레이어 충돌
function checkEnemyProjectileCollisions() {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const proj = enemyProjectiles[i];
    const dx = player.x - proj.x;
    const dy = player.y - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist <= proj.size + player.size / 2) {
      player.health -= proj.damage;
      enemyProjectiles.splice(i, 1);
    }
  }
}

// 경험치 구슬 획득
function checkExpOrbPickup() {
  const pickupRange = 150 * player.statBonuses.pickupRangeMult;
  
  for (let i = expOrbs.length - 1; i >= 0; i--) {
    const orb = expOrbs[i];
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist <= pickupRange) {
      orb.magnetized = true;
    }
    
    if (dist <= player.size / 2 + 10) {
      player.exp += orb.value;
      expOrbs.splice(i, 1);
    }
  }
  
  // 도시 맵에서 경험치 보석 최적화 (성능 확보)
  if (game.currentMap === 'city' && expOrbs.length > 200) {
    mergeDistantExpOrbs();
  }
}

// 멀리 있는 경험치 보석 합치기 (10개 -> 1개 큰 보석)
function mergeDistantExpOrbs() {
  const mergeDistance = 800; // 플레이어로부터 800 이상 떨어진 보석들
  const distantOrbs = [];
  
  for (let i = expOrbs.length - 1; i >= 0; i--) {
    const orb = expOrbs[i];
    const dist = Math.hypot(orb.x - player.x, orb.y - player.y);
    
    if (dist > mergeDistance) {
      distantOrbs.push(orb);
      expOrbs.splice(i, 1);
    }
  }
  
  // 10개씩 묶어서 큰 보석 1개로 변환
  while (distantOrbs.length >= 10) {
    const batch = distantOrbs.splice(0, 10);
    const totalValue = batch.reduce((sum, orb) => sum + orb.value, 0);
    const avgX = batch.reduce((sum, orb) => sum + orb.x, 0) / batch.length;
    const avgY = batch.reduce((sum, orb) => sum + orb.y, 0) / batch.length;
    
    expOrbs.push({
      x: avgX,
      y: avgY,
      value: totalValue,
      magnetized: false,
      isBig: true // 큰 보석 표시
    });
  }
  
  // 남은 보석들은 다시 추가
  expOrbs.push(...distantOrbs);
}
