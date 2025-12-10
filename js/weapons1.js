// ========================================
// Mushi Breaker - 무기 증강 시스템 (파트 1)
// ========================================

// 1. 속사 기관총 (MACHINE_GUN)
function updateMachineGun(deltaTime) {
  const augment = player.augments.find(a => a.id === 'MACHINE_GUN');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.MACHINE_GUN.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.MACHINE_GUN.evolveLevel;
  
  weaponTimers.MACHINE_GUN += deltaTime;
  
  // 레벨에 따라 발사 속도 증가 (bulletCount만큼 더 빠르게)
  const bulletCount = effectData.bulletCount;
  const interval = (1.0 / (player.attackSpeed * player.statBonuses.attackSpeedMult)) / bulletCount;
  
  if (weaponTimers.MACHINE_GUN >= interval) {
    weaponTimers.MACHINE_GUN = 0;
    
    if (enemies.length === 0) return;
    
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
    
    const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
    
    // 한 발씩 연속으로 발사 (속사!)
    const projectileSpeed = player.projectileSpeed * player.statBonuses.projectileSpeedMult;
    const damage = effectData.damage || (player.attackDamage * player.statBonuses.attackPowerMult * 0.8);
    
    projectiles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * projectileSpeed,
      vy: Math.sin(angle) * projectileSpeed,
      damage: damage,
      size: 4,
      lifetime: 2.0,
      pierce: isEvolved,
      color: isEvolved ? '#FFD700' : '#FFFF00',
    });
  }
}

// 2. 근접 지뢰 (PROXIMITY_MINE)
function updateProximityMine(deltaTime) {
  const augment = player.augments.find(a => a.id === 'PROXIMITY_MINE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.PROXIMITY_MINE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.PROXIMITY_MINE.evolveLevel;
  
  weaponTimers.PROXIMITY_MINE += deltaTime;
  const interval = 3.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.PROXIMITY_MINE >= interval) {
    weaponTimers.PROXIMITY_MINE = 0;
    
    for (let i = 0; i < effectData.mineCount; i++) {
      const angle = (Math.PI * 2 * i) / effectData.mineCount;
      const distance = 80;
      
      mines.push({
        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,
        damage: effectData.mineDamage * player.statBonuses.attackPowerMult,
        radius: 60,
        lifetime: 10.0,
        age: 0,
        isEvolved,
      });
    }
  }
  
  for (let i = mines.length - 1; i >= 0; i--) {
    const mine = mines[i];
    mine.age += deltaTime;
    
    if (mine.age >= mine.lifetime) {
      mines.splice(i, 1);
      continue;
    }
    
    for (const enemy of enemies) {
      const dx = enemy.x - mine.x;
      const dy = enemy.y - mine.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= mine.radius) {
        for (const e of enemies) {
          const edx = e.x - mine.x;
          const edy = e.y - mine.y;
          const eDist = Math.sqrt(edx * edx + edy * edy);
          
          if (eDist <= mine.radius * 1.5) {
            e.health -= mine.damage;
          }
        }
        
        if (mine.isEvolved) {
          for (let j = 0; j < 3; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            
            mines.push({
              x: mine.x + Math.cos(angle) * distance,
              y: mine.y + Math.sin(angle) * distance,
              damage: mine.damage * 0.5,
              radius: mine.radius * 0.7,
              lifetime: 2.0,
              age: 0,
              isEvolved: false,
            });
          }
        }
        
        mines.splice(i, 1);
        break;
      }
    }
  }
}

// 3. 화염방사기 (FLAMETHROWER)
// 화염 파티클 클래스
class FireParticle {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    // 화염이 퍼지는 각도 (약간의 랜덤성 추가)
    const spread = (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 3 + 2; // 불길 속도
    
    this.vx = Math.cos(angle + spread) * speed;
    this.vy = Math.sin(angle + spread) * speed;
    
    this.life = 1.0; // 생명력 (1.0에서 0으로 줄어듦)
    this.decay = Math.random() * 0.03 + 0.01; // 사라지는 속도
    this.size = Math.random() * 5 + 5; // 초기 불꽃 크기
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.size -= 0.1; // 불꽃이 점점 작아짐
  }
  
  draw(ctx, screenPos) {
    // 생명력에 따라 색상 변화
    let color;
    if (this.life > 0.7) {
      color = `rgba(255, 255, 100, ${this.life})`; // 노랑 (가장 뜨거움)
    } else if (this.life > 0.3) {
      color = `rgba(255, 100, 0, ${this.life})`; // 주황/빨강 (중간)
    } else {
      color = `rgba(100, 100, 100, ${this.life})`; // 회색 연기
    }
    
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, Math.max(0, this.size), 0, Math.PI * 2);
    ctx.fillStyle = color;
    
    // 불꽃이 겹칠수록 밝게 빛나게 하는 효과
    ctx.globalCompositeOperation = 'lighter';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; // 다시 원래대로 복구
  }
}

function updateFlamethrower(deltaTime) {
  const augment = player.augments.find(a => a.id === 'FLAMETHROWER');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.FLAMETHROWER.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.FLAMETHROWER.evolveLevel;
  
  weaponTimers.FLAMETHROWER += deltaTime;
  const interval = 0.5 * player.statBonuses.cooldownMult;
  
  // 매 프레임마다 화염 파티클 생성 (풍성한 불길)
  const range = effectData.fireRange * player.statBonuses.attackRangeMult;
  for (let i = 0; i < 3; i++) {
    fireParticles.push(new FireParticle(
      player.x + Math.cos(player.facingAngle) * 30,
      player.y + Math.sin(player.facingAngle) * 30,
      player.facingAngle
    ));
  }
  
  // 화염 파티클 업데이트
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const particle = fireParticles[i];
    particle.update();
    
    if (particle.life <= 0 || particle.size <= 0) {
      fireParticles.splice(i, 1);
    }
  }
  
  if (weaponTimers.FLAMETHROWER >= interval) {
    weaponTimers.FLAMETHROWER = 0;
    
    firePatches.push({
      x: player.x + Math.cos(player.facingAngle) * range * 0.5,
      y: player.y + Math.sin(player.facingAngle) * range * 0.5,
      radius: 50,
      damage: effectData.fireDamage * player.statBonuses.attackPowerMult,
      duration: effectData.fireDuration * player.statBonuses.durationMult,
      age: 0,
      damageInterval: 0.5,
      damageTimer: 0,
      isEvolved,
    });
  }
  
  for (let i = firePatches.length - 1; i >= 0; i--) {
    const fire = firePatches[i];
    fire.age += deltaTime;
    fire.damageTimer += deltaTime;
    
    if (fire.age >= fire.duration) {
      firePatches.splice(i, 1);
      continue;
    }
    
    if (fire.damageTimer >= fire.damageInterval) {
      fire.damageTimer = 0;
      
      for (const enemy of enemies) {
        const dx = enemy.x - fire.x;
        const dy = enemy.y - fire.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= fire.radius) {
          enemy.health -= fire.damage;
          enemy.onFire = true;
          enemy.fireTime = 2.0;
        }
      }
    }
  }
  
  if (isEvolved) {
    for (const enemy of enemies) {
      if (enemy.onFire && enemy.health <= 0) {
        firePatches.push({
          x: enemy.x,
          y: enemy.y,
          radius: 60,
          damage: effectData.fireDamage * player.statBonuses.attackPowerMult * 0.5,
          duration: 3.0 * player.statBonuses.durationMult,
          age: 0,
          damageInterval: 0.5,
          damageTimer: 0,
          isEvolved: false,
        });
      }
    }
  }
}

// 4. 회전 칼날 드론 (BLADE_DRONE)
function updateBladeDrone(deltaTime) {
  const augment = player.augments.find(a => a.id === 'BLADE_DRONE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.BLADE_DRONE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.BLADE_DRONE.evolveLevel;
  
  const targetCount = effectData.droneCount;
  while (drones.length < targetCount) {
    drones.push({
      angle: (drones.length * Math.PI * 2) / targetCount,
      radius: effectData.droneRadius,
      damage: effectData.droneDamage * player.statBonuses.attackPowerMult,
      size: 15,
      rotationSpeed: 2.0,
      isEvolved,
    });
  }
  
  for (const drone of drones) {
    drone.angle += drone.rotationSpeed * deltaTime;
    drone.x = player.x + Math.cos(drone.angle) * drone.radius;
    drone.y = player.y + Math.sin(drone.angle) * drone.radius;
    drone.damage = effectData.droneDamage * player.statBonuses.attackPowerMult;
    drone.radius = effectData.droneRadius;
    
    for (const enemy of enemies) {
      const dx = enemy.x - drone.x;
      const dy = enemy.y - drone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= drone.size + enemy.size / 2) {
        enemy.health -= drone.damage * deltaTime;
        
        if (drone.isEvolved) {
          const pullStrength = 100 * deltaTime;
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.x += Math.cos(angle) * pullStrength;
          enemy.y += Math.sin(angle) * pullStrength;
        }
      }
    }
  }
}

// 5. 페로몬 유도탄 (PHEROMONE_BOMB)
function updatePheromoneBomb(deltaTime) {
  const augment = player.augments.find(a => a.id === 'PHEROMONE_BOMB');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.PHEROMONE_BOMB.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.PHEROMONE_BOMB.evolveLevel;
  
  weaponTimers.PHEROMONE_BOMB += deltaTime;
  const interval = 8.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.PHEROMONE_BOMB >= interval) {
    weaponTimers.PHEROMONE_BOMB = 0;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 100;
    
    pheromones.push({
      x: player.x + Math.cos(angle) * distance,
      y: player.y + Math.sin(angle) * distance,
      attractRadius: effectData.attractRadius,
      explosionDamage: effectData.explosionDamage * player.statBonuses.attackPowerMult,
      lifetime: 3.0,
      age: 0,
      isEvolved,
    });
  }
  
  for (let i = pheromones.length - 1; i >= 0; i--) {
    const bomb = pheromones[i];
    bomb.age += deltaTime;
    
    for (const enemy of enemies) {
      const dx = bomb.x - enemy.x;
      const dy = bomb.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= bomb.attractRadius) {
        const angle = Math.atan2(dy, dx);
        const pullStrength = 150 * deltaTime;
        enemy.x += Math.cos(angle) * pullStrength;
        enemy.y += Math.sin(angle) * pullStrength;
      }
    }
    
    if (bomb.age >= bomb.lifetime) {
      for (const enemy of enemies) {
        const dx = enemy.x - bomb.x;
        const dy = enemy.y - bomb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= bomb.attractRadius) {
          enemy.health -= bomb.explosionDamage;
        }
      }
      
      if (bomb.isEvolved) {
        for (let j = 0; j < 5; j++) {
          const angle = (Math.PI * 2 * j) / 5;
          const distance = bomb.attractRadius * 0.7;
          
          pheromones.push({
            x: bomb.x + Math.cos(angle) * distance,
            y: bomb.y + Math.sin(angle) * distance,
            attractRadius: bomb.attractRadius * 0.5,
            explosionDamage: bomb.explosionDamage * 0.3,
            lifetime: 1.5,
            age: 0,
            isEvolved: false,
          });
        }
      }
      
      pheromones.splice(i, 1);
    }
  }
}
