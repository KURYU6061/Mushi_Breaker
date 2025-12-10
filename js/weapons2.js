// ========================================
// Mushi Breaker - 무기 증강 시스템 (파트 2)
// ========================================

// 번개 클래스 (지그재그 효과)
class LightningBolt {
  constructor(startX, startY, endX, endY, damage) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.damage = damage;
    this.segments = [];
    this.life = 3; // 3프레임 동안만 번쩍이고 사라짐
    this.generatePath();
  }

  generatePath() {
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(3, Math.floor(distance / 15)); // 15픽셀마다 껋임

    this.segments = [];
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const targetX = this.startX + (dx * progress);
      const targetY = this.startY + (dy * progress);

      // 랜덤 오프셋 (전기의 불규칙함)
      const jitter = (Math.random() - 0.5) * 25;
      
      // 수직 방향으로 흔들리게 (진행 방향에 수직)
      const perpX = -dy / distance;
      const perpY = dx / distance;
      
      const nextX = targetX + perpX * jitter;
      const nextY = targetY + perpY * jitter;

      this.segments.push({ x: nextX, y: nextY });
    }
  }

  update() {
    this.life--;
  }

  draw(ctx, worldToScreen) {
    if (this.life <= 0 || this.segments.length < 2) return;

    ctx.beginPath();
    const startScreen = worldToScreen(this.startX, this.startY);
    ctx.moveTo(startScreen.x, startScreen.y);

    for (let point of this.segments) {
      const screenPos = worldToScreen(point.x, point.y);
      ctx.lineTo(screenPos.x, screenPos.y);
    }

    // 스타일링 (빛나는 효과)
    ctx.strokeStyle = '#bffffd'; // 밝은 청록색 (전기 색)
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.stroke();
    
    // 션도우 초기화
    ctx.shadowBlur = 0;
  }
}

// 6. 전격 체인 (ELECTRIC_CHAIN)
function updateElectricChain(deltaTime) {
  const augment = player.augments.find(a => a.id === 'ELECTRIC_CHAIN');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.ELECTRIC_CHAIN.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.ELECTRIC_CHAIN.evolveLevel;
  
  weaponTimers.ELECTRIC_CHAIN += deltaTime;
  let interval = isEvolved ? 0.5 : 2.0;
  interval *= player.statBonuses.cooldownMult;
  
  if (weaponTimers.ELECTRIC_CHAIN >= interval) {
    weaponTimers.ELECTRIC_CHAIN = 0;
    
    if (enemies.length === 0) return;
    
    // 가장 가까운 적 찾기
    let nearestEnemy = null;
    let minDist = Infinity;
    
    for (const enemy of enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = enemy;
      }
    }
    
    if (!nearestEnemy) return;
    
    // 초기 번개 생성 (플레이어 -> 첫 번째 적)
    const damage = effectData.lightningDamage * player.statBonuses.attackPowerMult;
    const bolt = new LightningBolt(player.x, player.y, nearestEnemy.x, nearestEnemy.y, damage);
    bolt.targets = [nearestEnemy];
    bolt.chainCount = effectData.chainCount;
    bolt.chainRadius = 200;
    lightnings.push(bolt);
    
    // 즉시 피해 적용
    if (nearestEnemy.health > 0) {
      nearestEnemy.health -= damage;
    }
  }
  
  // 번개 업데이트 및 체인
  for (let i = lightnings.length - 1; i >= 0; i--) {
    const lightning = lightnings[i];
    lightning.update();
    
    // 수명 다하면 제거
    if (lightning.life <= 0) {
      lightnings.splice(i, 1);
      continue;
    }
    
    // 체인 효과 (첫 프레임에만 실행)
    if (lightning.life === 2 && lightning.targets.length < lightning.chainCount) {
      const lastTarget = lightning.targets[lightning.targets.length - 1];
      
      let nextEnemy = null;
      let minDist = Infinity;
      
      for (const enemy of enemies) {
        if (lightning.targets.includes(enemy)) continue;
        
        const dx = enemy.x - lastTarget.x;
        const dy = enemy.y - lastTarget.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= lightning.chainRadius && dist < minDist) {
          minDist = dist;
          nextEnemy = enemy;
        }
      }
      
      // 다음 적을 찾았으면 새 번개 생성
      if (nextEnemy) {
        const newBolt = new LightningBolt(lastTarget.x, lastTarget.y, nextEnemy.x, nextEnemy.y, lightning.damage);
        newBolt.targets = [...lightning.targets, nextEnemy];
        newBolt.chainCount = lightning.chainCount;
        newBolt.chainRadius = lightning.chainRadius;
        lightnings.push(newBolt);
        
        // 피해 적용
        if (nextEnemy.health > 0) {
          nextEnemy.health -= lightning.damage;
        }
      }
    }
  }
}

// 7. 리코셰 디스크 (RICOCHET_DISK)
function updateRicochetDisk(deltaTime) {
  const augment = player.augments.find(a => a.id === 'RICOCHET_DISK');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.RICOCHET_DISK.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.RICOCHET_DISK.evolveLevel;
  
  weaponTimers.RICOCHET_DISK += deltaTime;
  const interval = 3.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.RICOCHET_DISK >= interval) {
    weaponTimers.RICOCHET_DISK = 0;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 300 * player.statBonuses.projectileSpeedMult;
    
    disks.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: effectData.diskDamage * player.statBonuses.attackPowerMult,
      bounceCount: effectData.bounceCount,
      bounces: 0,
      size: 12,
      lifetime: 8.0,
      age: 0,
      isEvolved,
    });
  }
  
  for (let i = disks.length - 1; i >= 0; i--) {
    const disk = disks[i];
    disk.age += deltaTime;
    disk.x += disk.vx * deltaTime;
    disk.y += disk.vy * deltaTime;
    
    if (disk.age >= disk.lifetime || disk.bounces >= disk.bounceCount) {
      disks.splice(i, 1);
      continue;
    }
    
    if (disk.x <= 0 || disk.x >= MAP_SIZE) {
      disk.vx *= -1;
      disk.bounces++;
      
      if (disk.isEvolved && disk.bounces < disk.bounceCount) {
        for (let j = 0; j < 2; j++) {
          const angle = Math.atan2(disk.vy, disk.vx) + (j === 0 ? Math.PI / 4 : -Math.PI / 4);
          const speed = Math.sqrt(disk.vx * disk.vx + disk.vy * disk.vy);
          
          disks.push({
            x: disk.x,
            y: disk.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: disk.damage * 0.7,
            bounceCount: disk.bounceCount - disk.bounces,
            bounces: 0,
            size: disk.size * 0.8,
            lifetime: disk.lifetime - disk.age,
            age: 0,
            isEvolved: false,
          });
        }
      }
    }
    
    if (disk.y <= 0 || disk.y >= MAP_SIZE) {
      disk.vy *= -1;
      disk.bounces++;
      
      if (disk.isEvolved && disk.bounces < disk.bounceCount) {
        for (let j = 0; j < 2; j++) {
          const angle = Math.atan2(disk.vy, disk.vx) + (j === 0 ? Math.PI / 4 : -Math.PI / 4);
          const speed = Math.sqrt(disk.vx * disk.vx + disk.vy * disk.vy);
          
          disks.push({
            x: disk.x,
            y: disk.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: disk.damage * 0.7,
            bounceCount: disk.bounceCount - disk.bounces,
            bounces: 0,
            size: disk.size * 0.8,
            lifetime: disk.lifetime - disk.age,
            age: 0,
            isEvolved: false,
          });
        }
      }
    }
    
    for (const enemy of enemies) {
      const dx = enemy.x - disk.x;
      const dy = enemy.y - disk.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= disk.size + enemy.size / 2) {
        enemy.health -= disk.damage;
      }
    }
  }
}

// 8. 독가스 분무기 (POISON_SPRAY)
function updatePoisonSpray(deltaTime) {
  const augment = player.augments.find(a => a.id === 'POISON_SPRAY');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.POISON_SPRAY.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.POISON_SPRAY.evolveLevel;
  
  weaponTimers.POISON_SPRAY += deltaTime;
  const interval = 0.3;
  
  if (weaponTimers.POISON_SPRAY >= interval) {
    weaponTimers.POISON_SPRAY = 0;
    
    poisonClouds.push({
      x: player.x,
      y: player.y,
      radius: isEvolved ? 100 : 50,
      damage: effectData.poisonDamage * player.statBonuses.attackPowerMult,
      duration: effectData.cloudDuration * player.statBonuses.durationMult,
      age: 0,
      damageInterval: 0.5,
      damageTimer: 0,
      isEvolved,
    });
  }
  
  for (let i = poisonClouds.length - 1; i >= 0; i--) {
    const cloud = poisonClouds[i];
    cloud.age += deltaTime;
    cloud.damageTimer += deltaTime;
    
    if (cloud.age >= cloud.duration) {
      poisonClouds.splice(i, 1);
      continue;
    }
    
    if (cloud.damageTimer >= cloud.damageInterval) {
      cloud.damageTimer = 0;
      
      for (const enemy of enemies) {
        const dx = enemy.x - cloud.x;
        const dy = enemy.y - cloud.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= cloud.radius) {
          enemy.health -= cloud.damage;
          
          if (cloud.isEvolved) {
            enemy.poisoned = true;
            enemy.poisonTime = 2.0;
          }
        }
      }
    }
  }
}

// 9. 스톰프 부츠 (STOMP_BOOTS)
function updateStompBoots(deltaTime) {
  const augment = player.augments.find(a => a.id === 'STOMP_BOOTS');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.STOMP_BOOTS.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.STOMP_BOOTS.evolveLevel;
  
  let dx = 0;
  let dy = 0;
  
  if (keys['a']) dx -= 1;
  if (keys['d']) dx += 1;
  if (keys['w']) dy -= 1;
  if (keys['s']) dy += 1;
  
  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    const distance = (player.speed * player.statBonuses.moveSpeedMult * deltaTime) / length;
    playerDistanceTraveled += distance;
    
    const triggerDistance = isEvolved ? 100 : 200;
    
    if (playerDistanceTraveled >= triggerDistance) {
      playerDistanceTraveled = 0;
      
      shockwaves.push({
        x: player.x,
        y: player.y,
        radius: 0,
        maxRadius: effectData.shockRadius,
        damage: effectData.shockDamage * player.statBonuses.attackPowerMult,
        expandSpeed: 300,
        lifetime: 0.5,
        age: 0,
        isEvolved,
      });
    }
  }
  
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i];
    wave.age += deltaTime;
    wave.radius += wave.expandSpeed * deltaTime;
    
    if (wave.age >= wave.lifetime || wave.radius >= wave.maxRadius) {
      shockwaves.splice(i, 1);
      continue;
    }
    
    for (const enemy of enemies) {
      const dx = enemy.x - wave.x;
      const dy = enemy.y - wave.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (Math.abs(dist - wave.radius) <= 20) {
        enemy.health -= wave.damage;
        
        if (enemy.type.knockback > 0) {
          const angle = Math.atan2(dy, dx);
          enemy.x += Math.cos(angle) * enemy.type.knockback * 3;
          enemy.y += Math.sin(angle) * enemy.type.knockback * 3;
        }
      }
    }
  }
}

// 통합 무기 업데이트 함수
function updateWeaponAugments(deltaTime) {
  updateMachineGun(deltaTime);
  updateProximityMine(deltaTime);
  updateFlamethrower(deltaTime);
  updateBladeDrone(deltaTime);
  updatePheromoneBomb(deltaTime);
  updateElectricChain(deltaTime);
  updateRicochetDisk(deltaTime);
  updatePoisonSpray(deltaTime);
  updateStompBoots(deltaTime);
}
