// ========================================
// Mushi Breaker - 무기 증강 시스템 (파트 2)
// ========================================

// 전기 체인 클래스
class ElectricChain {
  constructor(targets, isEvolved, damage) {
    // targets: 연결할 적들의 좌표 배열 [{x,y}, {x,y}, ...]
    this.targets = targets;
    this.isEvolved = isEvolved;
    this.damage = damage;
    this.life = 10; // 번개가 보여지는 시간 (프레임)
    this.segments = []; // 번개의 꺾이는 지점들
    this.generatePath();
  }

  generatePath() {
    this.segments = [];
    // 타겟들을 순서대로 연결
    for (let i = 0; i < this.targets.length - 1; i++) {
      const start = this.targets[i];
      const end = this.targets[i+1];
      
      // 두 점 사이를 잇는 지그재그 선 생성
      const dist = Math.hypot(end.x - start.x, end.y - start.y);
      const steps = dist / 15; // 15픽셀마다 꺾임

      this.segments.push({x: start.x, y: start.y}); // 시작점

      for (let j = 1; j < steps; j++) {
        const t = j / steps;
        const tx = start.x + (end.x - start.x) * t;
        const ty = start.y + (end.y - start.y) * t;
        
        // 랜덤 오프셋 (지그재그)
        const offsetAmount = this.isEvolved ? 15 : 8; // 진화 시 더 크게 튐
        const offsetX = (Math.random() - 0.5) * offsetAmount;
        const offsetY = (Math.random() - 0.5) * offsetAmount;

        this.segments.push({x: tx + offsetX, y: ty + offsetY});
      }
      this.segments.push({x: end.x, y: end.y}); // 끝점
    }
  }

  update() {
    this.life--;
    // 매 프레임마다 모양을 새로 생성하면 '지지직'거리는 효과 (선택사항)
    if (this.life % 2 === 0) this.generatePath(); 
  }

  draw(ctx, worldToScreen) {
    if (this.life <= 0 || this.segments.length < 2) return;

    ctx.save();
    ctx.beginPath();
    
    const firstScreen = worldToScreen(this.segments[0].x, this.segments[0].y);
    ctx.moveTo(firstScreen.x, firstScreen.y);
    
    for (let i = 1; i < this.segments.length; i++) {
      const screenPos = worldToScreen(this.segments[i].x, this.segments[i].y);
      ctx.lineTo(screenPos.x, screenPos.y);
    }

    if (this.isEvolved) {
      // [진화] 강력한 폭풍우 (청백색 + 굵은 선)
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // 외부 광채 (파랑)
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00BFFF'; // Deep Sky Blue
      ctx.strokeStyle = '#E0FFFF'; // Light Cyan (중심)
      ctx.lineWidth = 4;
      ctx.stroke();

      // 내부 얇은 선 (흰색 - 더 밝게)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else {
      // [기본] 일반 전기 (노란색)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFFF00';
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// 레거시 번개 클래스 (지그재그 효과)
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
    
    // 체인 타겟 수집
    const damage = effectData.lightningDamage * player.statBonuses.attackPowerMult;
    const chainTargets = [{x: player.x, y: player.y}]; // 플레이어 시작점
    const hitEnemies = [nearestEnemy];
    chainTargets.push({x: nearestEnemy.x, y: nearestEnemy.y});
    
    // 즉시 피해 적용
    if (nearestEnemy.health > 0) {
      nearestEnemy.health -= damage;
    }
    
    // 체인 효과로 다음 적들 찾기
    let currentTarget = nearestEnemy;
    const chainRadius = 200;
    
    for (let chain = 1; chain < effectData.chainCount; chain++) {
      let nextEnemy = null;
      let minDist = Infinity;
      
      for (const enemy of enemies) {
        if (hitEnemies.includes(enemy)) continue;
        
        const dx = enemy.x - currentTarget.x;
        const dy = enemy.y - currentTarget.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= chainRadius && dist < minDist) {
          minDist = dist;
          nextEnemy = enemy;
        }
      }
      
      if (!nextEnemy) break;
      
      hitEnemies.push(nextEnemy);
      chainTargets.push({x: nextEnemy.x, y: nextEnemy.y});
      
      if (nextEnemy.health > 0) {
        nextEnemy.health -= damage;
      }
      
      currentTarget = nextEnemy;
    }
    
    // ElectricChain 인스턴스 생성
    if (chainTargets.length >= 2) {
      lightnings.push(new ElectricChain(chainTargets, isEvolved, damage));
    }
  }
  
  // 번개 업데이트
  for (let i = lightnings.length - 1; i >= 0; i--) {
    const lightning = lightnings[i];
    lightning.update();
    
    // 수명 다하면 제거
    if (lightning.life <= 0) {
      lightnings.splice(i, 1);
    }
  }
}

// 7. 리코션 디스크 (RICOCHET_DISK)
// 리코션 디스크 클래스
class RicochetDisk {
  constructor(x, y, angle, isEvolved, damage, bounceCount, lifetime) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    const baseSpeed = isEvolved ? 500 : 400;
    this.speed = baseSpeed * player.statBonuses.projectileSpeedMult;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    
    this.rotation = 0;
    this.rotationSpeed = 0.3; // 회전 속도
    this.radius = isEvolved ? 15 : 10;
    this.size = this.radius; // 충돌 판정용
    this.life = 300; // 5초간 생존
    
    // 게임 로직 데이터
    this.damage = damage;
    this.bounceCount = bounceCount;
    this.bounces = 0;
    this.lifetime = lifetime;
    this.age = 0;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime * 10;
    this.age += deltaTime;
  }

  draw(ctx, screenPos) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(this.rotation);

    if (this.isEvolved) {
      // [진화] 보라색 에너지 톱날
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#8A2BE2'; // BlueViolet
      ctx.fillStyle = '#9400D3';   // DarkViolet

      // 톱날 그리기 (8각형 별 모양)
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        // 외부 점
        ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
        // 내부 점 (날카롭게 파인 부분)
        const innerAngle = angle + (Math.PI / 8);
        ctx.lineTo(Math.cos(innerAngle) * 8, Math.sin(innerAngle) * 8);
      }
      ctx.closePath();
      ctx.fill();

      // 중앙 코어 (흰색)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // [기본] 청록색 원반
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00FFFF';
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;

      // 외곽 링
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();

      // 내부 십자 날
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
      ctx.moveTo(0, -10); ctx.lineTo(0, 10);
      ctx.stroke();
    }

    ctx.restore();
  }
}

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
    const damage = effectData.diskDamage * player.statBonuses.attackPowerMult;
    
    disks.push(new RicochetDisk(
      player.x,
      player.y,
      angle,
      isEvolved,
      damage,
      effectData.bounceCount,
      8.0
    ));
  }
  
  for (let i = disks.length - 1; i >= 0; i--) {
    const disk = disks[i];
    
    if (disk instanceof RicochetDisk) {
      disk.update(deltaTime);
    } else {
      // 레거시 디스크 (분열된 서브 디스크)
      disk.age += deltaTime;
      disk.x += disk.vx * deltaTime;
      disk.y += disk.vy * deltaTime;
    }
    
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
          
          // 분열된 서브 디스크는 RicochetDisk 인스턴스로 생성
          const subDisk = new RicochetDisk(
            disk.x,
            disk.y,
            angle,
            false, // 서브 디스크는 더 이상 분열 안 함
            disk.damage * 0.7,
            disk.bounceCount - disk.bounces,
            disk.lifetime - disk.age
          );
          subDisk.size = disk.size * 0.8;
          disks.push(subDisk);
        }
      }
    }
    
    if (disk.y <= 0 || disk.y >= MAP_SIZE) {
      disk.vy *= -1;
      disk.bounces++;
      
      if (disk.isEvolved && disk.bounces < disk.bounceCount) {
        for (let j = 0; j < 2; j++) {
          const angle = Math.atan2(disk.vy, disk.vx) + (j === 0 ? Math.PI / 4 : -Math.PI / 4);
          
          // 분열된 서브 디스크는 RicochetDisk 인스턴스로 생성
          const subDisk = new RicochetDisk(
            disk.x,
            disk.y,
            angle,
            false, // 서브 디스크는 더 이상 분열 안 함
            disk.damage * 0.7,
            disk.bounceCount - disk.bounces,
            disk.lifetime - disk.age
          );
          subDisk.size = disk.size * 0.8;
          disks.push(subDisk);
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
// 독 구름 클래스
class PoisonCloud {
  constructor(x, y, isEvolved) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    
    // 구름이 약간씩 퍼지는 랜덤 위치
    const offset = Math.random() * 10;
    this.x += (Math.random() - 0.5) * offset;
    this.y += (Math.random() - 0.5) * offset;

    this.size = 1; // 작게 시작해서 커짐
    this.maxSize = isEvolved ? 60 : 35; // 진화 시 범위 2배 느낌
    this.life = 1.0; 
    this.decay = 0.01; // 천천히 사라짐
    
    // 구름 모양의 불규칙성을 위한 스케일
    this.scaleX = 1 + (Math.random() - 0.5) * 0.2;
    this.scaleY = 1 + (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.life -= this.decay;
    // 점점 커지다가 사라질 때즐 멈춤
    if (this.size < this.maxSize) {
      this.size += 0.5;
    }
  }

  draw(ctx, screenPos) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.scale(this.scaleX, this.scaleY); // 찌그러진 원으로 구름 느낌 내기

    // 그라데이션으로 부드러운 가장자리 표현
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    
    if (this.isEvolved) {
      // [진화] 보라색 맹독 오라
      gradient.addColorStop(0, `rgba(75, 0, 130, ${this.life * 0.8})`);  // 중심: 인디고
      gradient.addColorStop(0.6, `rgba(138, 43, 226, ${this.life * 0.5})`); // 중간: 보라
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      // [기본] 녹색 독가스
      gradient.addColorStop(0, `rgba(0, 255, 0, ${this.life * 0.5})`);
      gradient.addColorStop(0.7, `rgba(50, 205, 50, ${this.life * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    // [진화 추가 효과] 보글거리는 기포
    if (this.isEvolved && this.life > 0.5) {
      ctx.fillStyle = `rgba(200, 100, 255, ${this.life})`; // 밝은 보라
      const bubbleSize = this.size * 0.2;
      // 랜덤한 위치에 작은 원 2개 그리기 (기포)
      ctx.beginPath();
      ctx.arc(this.size*0.3, -this.size*0.2, bubbleSize, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function updatePoisonSpray(deltaTime) {
  const augment = player.augments.find(a => a.id === 'POISON_SPRAY');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.POISON_SPRAY.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.POISON_SPRAY.evolveLevel;
  
  weaponTimers.POISON_SPRAY += deltaTime;
  const interval = 0.3;
  
  if (weaponTimers.POISON_SPRAY >= interval) {
    weaponTimers.POISON_SPRAY = 0;
    
    // 피해 판정용 레거시 객체
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
    
    // 시각 효과용 PoisonCloud 파티클 다수 생성
    const cloudCount = isEvolved ? 8 : 5;
    for (let i = 0; i < cloudCount; i++) {
      poisonClouds.push(new PoisonCloud(
        player.x,
        player.y,
        isEvolved
      ));
    }
  }
  
  for (let i = poisonClouds.length - 1; i >= 0; i--) {
    const cloud = poisonClouds[i];
    
    // PoisonCloud 인스턴스 업데이트
    if (cloud instanceof PoisonCloud) {
      cloud.update();
      if (cloud.life <= 0) {
        poisonClouds.splice(i, 1);
      }
      continue;
    }
    
    // 레거시 구름 (피해 판정용)
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
// 충격파 클래스
class StompWave {
  constructor(x, y, isEvolved, damage, maxRadius, expandSpeed, lifetime) {
    this.x = x;
    this.y = y;
    this.isEvolved = isEvolved;
    
    this.radius = 10;
    // 진화 시 범위가 조금 줄어드는 대신(설정 반영) 더 강력해 보임
    this.maxRadius = maxRadius; 
    this.alpha = 1.0;
    this.speed = isEvolved ? 8 : 12; // 진화 시 조금 더 묵직하고 느리게 퍼짐
    
    // 게임 로직 데이터
    this.damage = damage;
    this.expandSpeed = expandSpeed;
    this.lifetime = lifetime;
    this.age = 0;
  }

  update(deltaTime) {
    this.radius += this.speed;
    this.alpha -= 0.03; // 서서히 투명해짐
    this.age += deltaTime;
  }

  draw(ctx, screenPos) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    
    // 원근감을 위해 Y축을 살짝 누러 타원형으로 만들면 바닥에 있는 느낌이 남
    ctx.scale(1, 0.7); 

    if (this.isEvolved) {
      // [진화] 주황색 지진파 (두껑고 강력함)
      ctx.strokeStyle = `rgba(255, 69, 0, ${this.alpha})`; // Red-Orange
      ctx.lineWidth = 8; // 두꺼운 선
      
      // 메인 파동
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // 후속 파동 (안쪽에 하나 더 그려서 잔진 표현)
      if (this.radius > 30) {
        ctx.strokeStyle = `rgba(255, 140, 0, ${this.alpha * 0.7})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 20, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else {
      // [기본] 흰색 충격파
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'white';

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

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
      
      shockwaves.push(new StompWave(
        player.x,
        player.y,
        isEvolved,
        effectData.shockDamage * player.statBonuses.attackPowerMult,
        effectData.shockRadius,
        300,
        0.5
      ));
    }
  }
  
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i];
    
    if (wave instanceof StompWave) {
      wave.update(deltaTime);
    } else {
      // 레거시 충격파
      wave.age += deltaTime;
      wave.radius += wave.expandSpeed * deltaTime;
    }
    
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
