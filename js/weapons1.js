// ========================================
// Mushi Breaker - 무기 증강 시스템 (파트 1)
// ========================================

// 1. 속사 기관총 (MACHINE_GUN)
// 기관총 탄환 클래스
class MachineGunBullet {
  constructor(x, y, angle, isEvolved, damage) {
    this.x = x;
    this.y = y;
    this.speed = isEvolved ? 16 : 12; // 진화 시 속도 증가
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.isEvolved = isEvolved;
    this.damage = damage;
    this.life = 60;
    this.pierce = isEvolved; // 진화 시 관통
    // 트레일 효과를 위한 이전 위치 기록 배열
    this.history = [];
  }
  
  update() {
    // 트레일 생성: 현재 위치를 기록 (최대 5개까지만 유지)
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 5) this.history.shift();
    
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  
  draw(ctx, screenPos) {
    ctx.save();
    
    // 1. 진화 시: 빛나는 잔상 (트레일) 그리기
    if (this.isEvolved && this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      for (let i = this.history.length - 1; i >= 0; i--) {
        const pos = this.history[i];
        const trailScreen = worldToScreen(pos.x, pos.y);
        ctx.lineTo(trailScreen.x, trailScreen.y);
      }
      // 뒤로 갈수록 투명해지는 금색 선
      const firstTrail = worldToScreen(this.history[0].x, this.history[0].y);
      const gradient = ctx.createLinearGradient(screenPos.x, screenPos.y, firstTrail.x, firstTrail.y);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)'); // 앞쪽: 선명한 금색
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');   // 뒤쪽: 투명
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    // 2. 총알 본체 그리기
    ctx.translate(screenPos.x, screenPos.y);
    // 탄환 회전 (진행 방향에 맞춤)
    ctx.rotate(Math.atan2(this.vy, this.vx));
    
    if (this.isEvolved) {
      // [진화] 빛나는 금색 탄환
      ctx.fillStyle = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFA500'; // 주황색 빛 번짐
      ctx.fillRect(-12, -4, 24, 8); // 더 크고 길게
    } else {
      // [기본] 노란색 탄환
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(-6, -2, 12, 4);
    }
    
    ctx.restore();
  }
}

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
    const damage = effectData.damage || (player.attackDamage * player.statBonuses.attackPowerMult * 0.8);
    
    // 새로운 총알 객체 생성
    projectiles.push(new MachineGunBullet(player.x, player.y, angle, isEvolved, damage));
  }
  
  // 총알 업데이트
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const bullet = projectiles[i];
    if (bullet instanceof MachineGunBullet) {
      bullet.update();
      
      // 수명이 다한 총알 제거
      if (bullet.life <= 0) {
        projectiles.splice(i, 1);
      }
    }
  }
}

// 2. 근접 지뢰 (PROXIMITY_MINE)
// 근접 지뢰 클래스
class ProximityMine {
  constructor(x, y, isEvolved, damage, radius) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    this.damage = damage;
    this.radius = radius;
    this.timer = 0;
    this.lifetime = 10.0;
    this.age = 0;
  }
  
  update(deltaTime) {
    this.timer += deltaTime * 10;
    this.age += deltaTime;
  }
  
  draw(ctx, screenPos) {
    ctx.save();
    // 진화 여부에 따라 본체 색상 변경
    const baseColor = this.isEvolved ? '255, 100, 0' : '255, 0, 0'; // 주황 vs 빨강
    const alpha = 0.5 + Math.abs(Math.sin(this.timer)) * 0.5;
    
    // 지뢰 본체
    ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.isEvolved ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 감지 범위 (진화 시 더 넓고 진하게)
    ctx.strokeStyle = `rgba(${baseColor}, 0.3)`;
    ctx.lineWidth = this.isEvolved ? 2 : 1;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.isEvolved ? 60 : 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// 폭발 이펙트 클래스
class ExplosionFX {
  constructor(x, y, isEvolved) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    this.radius = 1;
    // 진화 시 훨씬 큰 폭발 범위
    this.maxRadius = isEvolved ? 120 : 60;
    this.alpha = 1;
    // 진화 시 더 강렬한 주황/노랑 폭발
    this.color = isEvolved ? '#FF8C00' : '#FF0000';
  }
  
  update() {
    // 진화 시 더 빠르게 퍼짐
    this.radius += this.isEvolved ? 6 : 4;
    this.alpha -= 0.04;
  }
  
  draw(ctx, screenPos) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // 폭발은 밝게
    
    // 메인 폭발원
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // [진화 추가 효과] 2차 파편 폭발 고리
    if (this.isEvolved && this.alpha > 0.5) {
      ctx.strokeStyle = '#FFFF00'; // 노란색 충격파
      ctx.lineWidth = 3;
      ctx.beginPath();
      // 메인 폭발보다 조금 더 바깥쪽의 고리
      ctx.arc(screenPos.x, screenPos.y, this.radius * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function updateProximityMine(deltaTime) {
  const augment = player.augments.find(a => a.id === 'PROXIMITY_MINE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.PROXIMITY_MINE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.PROXIMITY_MINE.evolveLevel;
  
  weaponTimers.PROXIMITY_MINE += deltaTime;
  const interval = 3.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.PROXIMITY_MINE >= interval) {
    weaponTimers.PROXIMITY_MINE = 0;
    
    const damage = effectData.mineDamage * player.statBonuses.attackPowerMult;
    
    for (let i = 0; i < effectData.mineCount; i++) {
      const angle = (Math.PI * 2 * i) / effectData.mineCount;
      const distance = 80;
      
      mines.push(new ProximityMine(
        player.x + Math.cos(angle) * distance,
        player.y + Math.sin(angle) * distance,
        isEvolved,
        damage,
        60
      ));
    }
  }
  
  // 지뢰 업데이트
  for (let i = 0; i < mines.length; i++) {
    const mine = mines[i];
    if (mine instanceof ProximityMine) {
      mine.update(deltaTime);
    }
  }
  
  // 지뢰 충돌 및 폭발 체크
  for (let i = mines.length - 1; i >= 0; i--) {
    const mine = mines[i];
    
    if (!(mine instanceof ProximityMine)) continue;
    
    if (mine.age >= mine.lifetime) {
      mines.splice(i, 1);
      continue;
    }
    
    for (const enemy of enemies) {
      const dx = enemy.x - mine.x;
      const dy = enemy.y - mine.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= mine.radius) {
        // 폭발 이펙트 생성
        explosions.push(new ExplosionFX(mine.x, mine.y, mine.isEvolved));
        
        // 범위 내 적들에게 피해
        for (const e of enemies) {
          const edx = e.x - mine.x;
          const edy = e.y - mine.y;
          const eDist = Math.sqrt(edx * edx + edy * edy);
          
          if (eDist <= mine.radius * 1.5) {
            e.health -= mine.damage;
          }
        }
        
        // 진화 시 연쇄 지뢰 생성
        if (mine.isEvolved) {
          for (let j = 0; j < 3; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            
            mines.push(new ProximityMine(
              mine.x + Math.cos(angle) * distance,
              mine.y + Math.sin(angle) * distance,
              false, // 연쇄 지뢰는 진화 효과 없음
              mine.damage * 0.5,
              mine.radius * 0.7
            ));
          }
        }
        
        mines.splice(i, 1);
        break;
      }
    }
  }
  
  // 폭발 이펙트 업데이트
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.update();
    
    if (explosion.alpha <= 0 || explosion.radius >= explosion.maxRadius) {
      explosions.splice(i, 1);
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

// 화염 장판 클래스 (FirePatch)
class FirePatch {
  constructor(x, y, angle, isEvolved) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    
    // 랜덤한 위치에 생성하여 자연스러운 불길 장판 형성
    const offset = Math.random() * (isEvolved ? 30 : 20);
    this.x += Math.cos(angle) * offset;
    this.y += Math.sin(angle) * offset;

    // 진화 시 기본 크기가 더 큼
    this.size = Math.random() * 10 + (isEvolved ? 15 : 8);
    this.life = 1.0; 
    this.decay = Math.random() * 0.02 + 0.01;
  }

  update() {
    this.life -= this.decay;
    this.size += 0.3; // 불길이 퍼지는 효과
  }

  draw(ctx, screenPos) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // 겹치면 밝아짐 (핵심)

    let color;
    if (this.isEvolved) {
      // [진화] 고온의 푸른 화염 (파랑 -> 하늘색 -> 흰색)
      if (this.life > 0.7) color = `rgba(200, 240, 255, ${this.life})`; // 흰색에 가까운 중심
      else if (this.life > 0.4) color = `rgba(0, 150, 255, ${this.life})`; // 밝은 파랑
      else color = `rgba(0, 50, 200, ${this.life})`; // 어두운 파랑 (연기)
    } else {
      // [기본] 일반 화염 (노랑 -> 주황 -> 빨강)
      if (this.life > 0.7) color = `rgba(255, 255, 100, ${this.life})`; // 중심부 노랑
      else if (this.life > 0.4) color = `rgba(255, 100, 0, ${this.life})`; // 중간 주황
      else color = `rgba(200, 50, 0, ${this.life})`; // 외곽 빨강
    }

    // 외곽이 부드러운 원 그리기 (그라데이션 효과)
    const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, this.size);
    gradient.addColorStop(0, color); // 중심 색상
    // 외곽은 투명하게 처리하여 요청한 '외곽+내부' 느낌 구현
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
    
    // 화염 장판 생성 (피해 판정용 레거시 객체)
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
    
    // 시각 효과용 FirePatch 파티클 다수 생성
    const patchCount = isEvolved ? 12 : 8;
    for (let i = 0; i < patchCount; i++) {
      firePatches.push(new FirePatch(
        player.x + Math.cos(player.facingAngle) * range * 0.5,
        player.y + Math.sin(player.facingAngle) * range * 0.5,
        player.facingAngle + (Math.random() - 0.5) * 0.5,
        isEvolved
      ));
    }
  }
  
  for (let i = firePatches.length - 1; i >= 0; i--) {
    const fire = firePatches[i];
    
    // FirePatch 인스턴스 업데이트
    if (fire instanceof FirePatch) {
      fire.update();
      if (fire.life <= 0 || fire.size <= 0) {
        firePatches.splice(i, 1);
      }
      continue;
    }
    
    // 레거시 화염 패치 (피해 판정용)
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
        // 피해 판정용 레거시 객체
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
        
        // 시각 효과용 FirePatch 파티클 생성 (진화 전 적에서 나온 불)
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          firePatches.push(new FirePatch(
            enemy.x,
            enemy.y,
            angle,
            false // 전이된 불은 기본 화염
          ));
        }
      }
    }
  }
}

// 4. 회전 칼날 드론 (BLADE_DRONE)
// 회전 칼날 드론 클래스
class BladeDrone {
  constructor(player, index, total, isEvolved, effectData) {
    this.player = player;
    this.index = index;
    this.total = total;
    this.isEvolved = isEvolved;
    
    this.angle = (Math.PI * 2 / total) * index; // 드론 간 간격 배치
    this.distance = isEvolved ? 120 : 80; // 진화 시 회전 반경 증가
    this.rotationSpeed = isEvolved ? 0.08 : 0.05; // 진화 시 더 빠르게 회전
    this.selfRotation = 0; // 드론 자체의 회전
    this.size = 15;
    
    // 피해량 및 게임 데이터
    this.damage = effectData.droneDamage * player.statBonuses.attackPowerMult;
    
    // 위치 초기화
    this.x = player.x + Math.cos(this.angle) * this.distance;
    this.y = player.y + Math.sin(this.angle) * this.distance;
  }

  update(deltaTime, effectData) {
    this.angle += this.rotationSpeed;
    this.selfRotation += 0.2; // 드론이 스스로 뱅글뱅글 돔
    
    // 플레이어 기준 위치 갱신
    this.x = this.player.x + Math.cos(this.angle) * this.distance;
    this.y = this.player.y + Math.sin(this.angle) * this.distance;
    
    // 피해량 업데이트
    this.damage = effectData.droneDamage * this.player.statBonuses.attackPowerMult;
  }

  draw(ctx, screenPos) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(this.angle + this.selfRotation); // 진행 방향 + 자체 회전 혼합

    // [진화] 금색 + 진공 이펙트
    if (this.isEvolved) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFD700'; // 금색 빛
      ctx.fillStyle = '#FFD700';
      
      // 드론 본체 (날카로운 4각 수리검 형태)
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-8, 0);
      ctx.fill();

      // 진공 효과 (빨아들이는 듯한 원형 라인)
      ctx.strokeStyle = 'rgba(255, 255, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2); // 드론 주변의 공기 흐름
      ctx.stroke();

    } else {
      // [기본] 청록색 기계 드론
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00FFFF';
      ctx.fillStyle = '#00FFFF'; // Cyan
      
      // 드론 본체 (다이아몬드)
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 0);
      ctx.fill();
    }

    ctx.restore();
  }
}

function updateBladeDrone(deltaTime) {
  const augment = player.augments.find(a => a.id === 'BLADE_DRONE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.BLADE_DRONE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.BLADE_DRONE.evolveLevel;
  
  const targetCount = effectData.droneCount;
  
  // BladeDrone 인스턴스로 드론 생성
  while (drones.length < targetCount) {
    drones.push(new BladeDrone(
      player,
      drones.length,
      targetCount,
      isEvolved,
      effectData
    ));
  }
  
  // 드론 수가 줄어들 경우 처리
  while (drones.length > targetCount) {
    drones.pop();
  }
  
  for (const drone of drones) {
    if (drone instanceof BladeDrone) {
      drone.update(deltaTime, effectData);
    }
    
    // 충돌 판정 및 피해
    for (const enemy of enemies) {
      const dx = enemy.x - drone.x;
      const dy = enemy.y - drone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= drone.size + enemy.size / 2) {
        enemy.health -= drone.damage * deltaTime;
        
        // 진화 시 진공 효과 (적을 플레이어 쪽으로 끌어당김)
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
// 페로몬 폭탄 클래스
class PheromoneBomb {
  constructor(x, y, isEvolved, attractRadius, explosionDamage) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    this.attractRadius = attractRadius;
    this.explosionDamage = explosionDamage;
    this.lifetime = 3.0;
    this.age = 0;
    this.timer = 0; // 60fps * 3초 = 180 프레임 카운트다운용
    this.maxTime = 180;
  }

  update(deltaTime) {
    this.age += deltaTime;
    this.timer++;
  }

  draw(ctx, screenPos) {
    // 남은 시간에 비례하여 깜박임 속도 증가 (긴박감 조성)
    const pulseSpeed = (this.timer / this.maxTime) * 0.5 + 0.1;
    const scale = 1 + Math.sin(this.timer * pulseSpeed) * 0.1;
    
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    if (this.isEvolved) {
      // [진화] 강력한 유인 (핑크/레드)
      // 유인 범위 (넓은 원)
      ctx.strokeStyle = 'rgba(255, 20, 147, 0.3)'; // DeepPink
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2); // 넓은 범위
      ctx.stroke();

      // 중심 폭탄 (불안정하게 떨림)
      const shake = (Math.random() - 0.5) * 3;
      ctx.translate(shake, shake);
      
      ctx.fillStyle = '#FF1493';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FF69B4';
      ctx.beginPath();
      ctx.arc(0, 0, 15 * scale, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // [기본] 유인 (노란색)
      // 유인 범위
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.stroke();

      // 중심 폭탄
      ctx.fillStyle = '#FFFF00';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFFFE0';
      ctx.beginPath();
      ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

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
    
    pheromones.push(new PheromoneBomb(
      player.x + Math.cos(angle) * distance,
      player.y + Math.sin(angle) * distance,
      isEvolved,
      effectData.attractRadius,
      effectData.explosionDamage * player.statBonuses.attackPowerMult
    ));
  }
  
  for (let i = pheromones.length - 1; i >= 0; i--) {
    const bomb = pheromones[i];
    
    if (bomb instanceof PheromoneBomb) {
      bomb.update(deltaTime);
    } else {
      // 레거시 폭탄 (연쇄 폭발용)
      bomb.age += deltaTime;
    }
    
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
          
          // 연쇄 폭발은 PheromoneBomb 인스턴스로 생성
          pheromones.push(new PheromoneBomb(
            bomb.x + Math.cos(angle) * distance,
            bomb.y + Math.sin(angle) * distance,
            false, // 연쇄 폭탄은 더 이상 진화 효과 없음
            bomb.attractRadius * 0.5,
            bomb.explosionDamage * 0.3
          ));
          // 라이프타임 조정
          pheromones[pheromones.length - 1].lifetime = 1.5;
        }
      }
      
      pheromones.splice(i, 1);
    }
  }
}
