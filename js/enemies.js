// ========================================
// Mushi Breaker - 적 관리
// ========================================

// 화면 밖에서 적 생성 (카메라 밖 20% 테두리)
function spawnEnemy(type) {
  const enemyType = ENEMY_TYPES[type];
  
  // 플레이어 주변 화면 영역 계산
  const margin = 200; // 화면 밖 여백
  const minX = player.x - GAME_WIDTH / 2 - margin;
  const maxX = player.x + GAME_WIDTH / 2 + margin;
  const minY = player.y - GAME_HEIGHT / 2 - margin;
  const maxY = player.y + GAME_HEIGHT / 2 + margin;
  
  // 4방향 중 하나에서 랜덤 생성
  const side = Math.floor(Math.random() * 4);
  let x, y;
  
  switch (side) {
    case 0: // 위쪽
      x = minX + Math.random() * (maxX - minX);
      y = minY;
      break;
    case 1: // 오른쪽
      x = maxX;
      y = minY + Math.random() * (maxY - minY);
      break;
    case 2: // 아래쪽
      x = minX + Math.random() * (maxX - minX);
      y = maxY;
      break;
    case 3: // 왼쪽
      x = minX;
      y = minY + Math.random() * (maxY - minY);
      break;
  }
  
  // 맵 경계 밖으로 나가지 않도록 제한
  x = Math.max(0, Math.min(MAP_SIZE, x));
  y = Math.max(0, Math.min(MAP_SIZE, y));
  
  // 적 이미지 로드
  let imageObj = null;
  if (enemyType.image) {
    imageObj = new Image();
    imageObj.src = enemyType.image;
  }
  
  enemies.push({
    x,
    y,
    vx: 0,
    vy: 0,
    type: enemyType,
    health: enemyType.health,
    maxHealth: enemyType.health,
    attackTimer: 0,
    isBoss: enemyType.isBoss || false,
    size: enemyType.size,
    imageObj: imageObj,
    angle: 0, // 회전 각도
  });
}

// 게임 시간에 따른 적 생성 (웨이브 시스템)
function updateEnemySpawning(deltaTime) {
  // 공원 맵 전용 웨이브 시스템
  if (game.currentMap === 'park') {
    updateEnemySpawningPark(deltaTime);
  } else {
    // 다른 맵은 기본 스포너 사용 (추후 구현)
    updateEnemySpawningDefault(deltaTime);
  }
}

// 공원 맵 전용 웨이브 시스템
function updateEnemySpawningPark(deltaTime) {
  game.spawnTimer += deltaTime;
  
  const currentEnemyCount = enemies.length;
  const gameTime = game.time;
  
  // 현재 말벌 개체수 카운트
  const hornetCount = enemies.filter(e => e.type.name === '말벌').length;
  const maxHornets = 30; // 말벌 최대 개체수
  
  // 웨이브별 설정
  let maxEnemies, spawnInterval, enemyTypes, spawnCount;
  
  if (gameTime < 60) {
    // 0~1분: 초반 - 유충만 등장
    maxEnemies = 15;
    spawnInterval = 1.5;
    spawnCount = 1;
    enemyTypes = [{ type: 'LARVA', weight: 1 }];
  } else if (gameTime < 120) {
    // 1~2분: 유충 + 메뚚기 등장
    maxEnemies = 25;
    spawnInterval = 1.2;
    spawnCount = 2;
    enemyTypes = [
      { type: 'LARVA', weight: 0.6 },
      { type: 'LOCUST', weight: 0.4 }
    ];
  } else if (gameTime < 180) {
    // 2~3분: 메뚚기 + 말벌 등장
    maxEnemies = 40;
    spawnInterval = 1.0;
    spawnCount = 2;
    enemyTypes = [
      { type: 'LOCUST', weight: 0.65 },
      { type: 'HORNET', weight: 0.35 }
    ];
  } else if (gameTime < 300) {
    // 3~5분: 메뚚기 + 말벌 + 딸정벌레
    maxEnemies = 55;
    spawnInterval = 0.8;
    spawnCount = 3;
    enemyTypes = [
      { type: 'LOCUST', weight: 0.45 },
      { type: 'HORNET', weight: 0.25 },
      { type: 'BEETLE', weight: 0.3 }
    ];
  } else {
    // 5분 이후: 모든 적 등장
    maxEnemies = Math.min(70 + Math.floor((gameTime - 300) / 60) * 10, 120);
    spawnInterval = 0.6;
    spawnCount = 3 + Math.floor((gameTime - 300) / 120);
    enemyTypes = [
      { type: 'LOCUST', weight: 0.35 },
      { type: 'HORNET', weight: 0.2 },
      { type: 'BEETLE', weight: 0.25 },
      { type: 'SCORPION', weight: 0.2 }
    ];
  }
  
  // 스폰 인터벌 체크
  if (game.spawnTimer >= spawnInterval) {
    game.spawnTimer = 0;
    
    // 최대 개체수 제한
    if (currentEnemyCount >= maxEnemies) {
      return;
    }
    
    // 적 생성
    const actualSpawnCount = Math.min(spawnCount, maxEnemies - currentEnemyCount);
    
    for (let i = 0; i < actualSpawnCount; i++) {
      // 가중치 기반 랜덤 선택
      const totalWeight = enemyTypes.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedType = enemyTypes[0].type;
      for (const enemy of enemyTypes) {
        random -= enemy.weight;
        if (random <= 0) {
          selectedType = enemy.type;
          break;
        }
      }
      
      // 말벌 개체수 제한
      if (selectedType === 'HORNET' && hornetCount >= maxHornets) {
        // 말벌이 최대치면 메뚚기로 대체
        selectedType = 'LOCUST';
      }
      
      spawnEnemy(selectedType);
    }
  }
  
  // 보스 생성 시스템
  if (!game.bossAlive && game.time >= 60) {
    // 보스 생성 5초 전 경고
    if (!game.bossWarning && game.time >= game.nextBossTime - 5) {
      game.bossWarning = true;
      game.bossWarningTimer = 0;
      console.log('⚠️ 보스 등장 예고!');
    }
    
    // 경고 타이머 업데이트
    if (game.bossWarning) {
      game.bossWarningTimer += deltaTime;
      
      // 5초 후 보스 생성
      if (game.bossWarningTimer >= 5) {
        spawnEnemy('MANTIS');
        game.bossAlive = true;
        game.bossWarning = false;
        game.bossWarningTimer = 0;
        console.log('🐛 보스 사마귀 등장!');
      }
    }
  }
}

// 기본 적 생성 시스템 (도시, 숲속 맵용)
function updateEnemySpawningDefault(deltaTime) {
  // 도시 맵과 숲속 맵 모두 동일한 대규모 물량 공세 시스템 사용
  if (game.currentMap === 'city' || game.currentMap === 'forest') {
    updateEnemySpawningCity(deltaTime);
  }
}

// 도시 맵 전용 대규모 물량 공세 시스템
function updateEnemySpawningCity(deltaTime) {
  game.spawnTimer += deltaTime;
  
  const currentEnemyCount = enemies.length;
  const gameTime = game.time;
  
  let maxEnemies, spawnInterval, enemyTypes, spawnCount;
  
  // 0~1분: 몸풀기 (유충 대량 발생)
  if (gameTime < 60) {
    maxEnemies = 50;
    spawnInterval = 0.5;
    spawnCount = 4;
    enemyTypes = [{ type: 'LARVA', weight: 1 }];
  }
  // 1~2분: 혼합 웨이브 (유충 + 메뚜기)
  else if (gameTime < 120) {
    maxEnemies = 80;
    spawnInterval = 0.5;
    spawnCount = 5;
    enemyTypes = [
      { type: 'LARVA', weight: 0.5 },
      { type: 'LOCUST', weight: 0.5 }
    ];
  }
  // 2~3분: 원거리 견제와 탱커 등장
  else if (gameTime < 180) {
    maxEnemies = 120;
    spawnInterval = 0.3;
    spawnCount = 4;
    enemyTypes = [
      { type: 'LOCUST', weight: 0.5 },
      { type: 'BEETLE', weight: 0.3 },
      { type: 'HORNET', weight: 0.2 }
    ];
  }
  // 3~4분: 🚨 대규모 웨이브 (유충 대량 이벤트)
  else if (gameTime < 240) {
    // 3분 00초 ~ 3분 30초: 유충 300마리 이벤트
    if (gameTime < 210) {
      maxEnemies = 200;
      spawnInterval = 0.1;
      spawnCount = 6;
      enemyTypes = [{ type: 'LARVA', weight: 1 }];
    }
    // 3분 30초 ~ 4분: 정예 몬스터 등장
    else {
      maxEnemies = 200;
      spawnInterval = 0.3;
      spawnCount = 3;
      enemyTypes = [
        { type: 'SCORPION', weight: 0.4 },
        { type: 'BEETLE', weight: 0.4 },
        { type: 'LOCUST', weight: 0.2 }
      ];
    }
  }
  // 5분 이상: 보스전 + 무한 웨이브
  else {
    maxEnemies = 300;
    spawnInterval = 0.1;
    spawnCount = 2;
    enemyTypes = [
      { type: 'LARVA', weight: 0.3 },
      { type: 'LOCUST', weight: 0.3 },
      { type: 'BEETLE', weight: 0.2 },
      { type: 'SCORPION', weight: 0.2 }
    ];
  }
  
  // 적 생성
  if (game.spawnTimer >= spawnInterval) {
    game.spawnTimer = 0;
    
    if (currentEnemyCount >= maxEnemies) {
      return;
    }
    
    const actualSpawnCount = Math.min(spawnCount, maxEnemies - currentEnemyCount);
    
    for (let i = 0; i < actualSpawnCount; i++) {
      const totalWeight = enemyTypes.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedType = enemyTypes[0].type;
      for (const enemy of enemyTypes) {
        random -= enemy.weight;
        if (random <= 0) {
          selectedType = enemy.type;
          break;
        }
      }
      
      spawnEnemy(selectedType);
    }
  }
  
  // 매 1분마다 포위 공격 패턴
  if (Math.floor(gameTime) % 60 === 0 && Math.floor(gameTime) > 0) {
    if (!game.lastSurroundTime || gameTime - game.lastSurroundTime >= 60) {
      game.lastSurroundTime = gameTime;
      spawnSurroundAttack();
    }
  }
  
  // 5분 이상부터 몬스터 가속 (Hurry Up)
  if (gameTime >= 300) {
    const speedBonus = 1 + Math.floor((gameTime - 300) / 10) * 0.05;
    for (const enemy of enemies) {
      if (!enemy.originalSpeed) {
        enemy.originalSpeed = enemy.type.speed;
      }
      enemy.type.speed = enemy.originalSpeed * speedBonus;
    }
  }
  
  // 보스 생성 시스템 (1분부터, 공원과 동일한 기믹)
  if (!game.bossAlive && gameTime >= 60) {
    // 보스 생성 5초 전 경고
    if (!game.bossWarning && gameTime >= game.nextBossTime - 5) {
      game.bossWarning = true;
      game.bossWarningTimer = 0;
      console.log('⚠️ 도시 보스 등장 예고!');
    }
    
    if (game.bossWarning) {
      game.bossWarningTimer += deltaTime;
      
      if (game.bossWarningTimer >= 5) {
        spawnEnemy('MANTIS');
        game.bossAlive = true;
        game.bossWarning = false;
        game.bossWarningTimer = 0;
        console.log('🐛 보스 사마귀 등장!');
      }
    }
  }
}

// 포위 공격 패턴 (플레이어 주변 원형으로 20마리 생성)
function spawnSurroundAttack() {
  console.log('🔴 포위 공격 패턴 발동!');
  
  const radius = 400; // 플레이어로부터 400 거리
  const count = 20;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const x = player.x + Math.cos(angle) * radius;
    const y = player.y + Math.sin(angle) * radius;
    
    // 맵 경계 체크
    const clampedX = Math.max(0, Math.min(MAP_SIZE, x));
    const clampedY = Math.max(0, Math.min(MAP_SIZE, y));
    
    // 강한 적 생성 (메뚜기 또는 전갈)
    const types = ['LOCUST', 'SCORPION'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const enemyType = ENEMY_TYPES[selectedType];
    
    // 적 이미지 로드
    let imageObj = null;
    if (enemyType.image) {
      imageObj = new Image();
      imageObj.src = enemyType.image;
    }
    
    enemies.push({
      x: clampedX,
      y: clampedY,
      vx: 0,
      vy: 0,
      type: enemyType,
      health: enemyType.health,
      maxHealth: enemyType.health,
      attackTimer: 0,
      isBoss: false,
      size: enemyType.size,
      imageObj: imageObj,
      angle: 0,
    });
  }
}

// 적 업데이트
function updateEnemies(deltaTime) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    // 죽은 적 제거
    if (enemy.health <= 0) {
      // 보스 사망 체크
      if (enemy.isBoss) {
        game.bossAlive = false;
        game.nextBossTime = game.time + 60; // 다음 보스는 60초 후
        game.bossKillCount++; // 보스 처치 카운트 증가
        console.log('✅ 보스 처치! 60초 후 다음 보스 등장 (처치 수: ' + game.bossKillCount + '/6)');
        
        // 보스는 무조건 레벨업 아이템 드랍
        dropItems.push({
          type: 'levelup',
          x: enemy.x,
          y: enemy.y,
          lifetime: 30,
          pickupRange: 40
        });
      } else {
        // 일반 적은 2% 확률로 아이템 드랍
        if (Math.random() < 0.02) {
          const itemType = Math.random() < 0.5 ? 'health' : 'magnet';
          dropItems.push({
            type: itemType,
            x: enemy.x,
            y: enemy.y,
            lifetime: 30,
            pickupRange: 40
          });
        }
      }
      
      // 경험치 드랍 (1개로 통합)
      expOrbs.push({
        x: enemy.x,
        y: enemy.y,
        value: enemy.type.exp,
        magnetized: false,
      });
      enemies.splice(i, 1);
      continue;
    }
    
    // AI 행동
    if (enemy.type.behavior === 'chase' || enemy.type.behavior === 'boss') {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        enemy.vx = (dx / dist) * enemy.type.speed;
        enemy.vy = (dy / dist) * enemy.type.speed;
        enemy.angle = Math.atan2(dy, dx); // 플레이어 방향 각도 저장
      }
    } else if (enemy.type.behavior === 'ranged') {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 항상 플레이어 방향을 향함
      enemy.angle = Math.atan2(dy, dx);
      
      if (dist > enemy.type.attackRange) {
        enemy.vx = (dx / dist) * enemy.type.speed;
        enemy.vy = (dy / dist) * enemy.type.speed;
      } else {
        enemy.vx = 0;
        enemy.vy = 0;
        
        enemy.attackTimer += deltaTime;
        if (enemy.attackTimer >= enemy.type.attackCooldown) {
          enemy.attackTimer = 0;
          
          const angle = Math.atan2(dy, dx);
          enemyProjectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 200,
            vy: Math.sin(angle) * 200,
            damage: enemy.type.damage,
            size: 8,
            lifetime: 3.0,
          });
        }
      }
    }
    
    // 위치 업데이트
    enemy.x += enemy.vx * deltaTime;
    enemy.y += enemy.vy * deltaTime;
    
    // 맵 경계
    enemy.x = Math.max(enemy.size / 2, Math.min(MAP_SIZE - enemy.size / 2, enemy.x));
    enemy.y = Math.max(enemy.size / 2, Math.min(MAP_SIZE - enemy.size / 2, enemy.y));
  }
}

// 투사체 업데이트
function updateProjectiles(deltaTime) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx * deltaTime;
    proj.y += proj.vy * deltaTime;
    proj.lifetime -= deltaTime;
    
    if (proj.lifetime <= 0 || 
        proj.x < 0 || proj.x > MAP_SIZE || 
        proj.y < 0 || proj.y > MAP_SIZE) {
      projectiles.splice(i, 1);
    }
  }
  
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const proj = enemyProjectiles[i];
    proj.x += proj.vx * deltaTime;
    proj.y += proj.vy * deltaTime;
    proj.lifetime -= deltaTime;
    
    if (proj.lifetime <= 0) {
      enemyProjectiles.splice(i, 1);
    }
  }
}

// 경험치 구슬 업데이트
function updateExpOrbs(deltaTime) {
  for (const orb of expOrbs) {
    if (orb.magnetized) {
      const dx = player.x - orb.x;
      const dy = player.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const speed = 300;
        orb.x += (dx / dist) * speed * deltaTime;
        orb.y += (dy / dist) * speed * deltaTime;
      }
    }
  }
}
