// ========================================
// Mushi Breaker - 뱀서라이크 게임
// ========================================

// ========================================
// Canvas 및 해상도 설정
// ========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 해상도 설정
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Canvas 크기를 화면에 맞게 조정
function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
  
  let newWidth = windowWidth;
  let newHeight = windowWidth / aspectRatio;
  
  if (newHeight > windowHeight) {
    newHeight = windowHeight;
    newWidth = windowHeight * aspectRatio;
  }
  
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ========================================
// 게임 상수
// ========================================
const MAP_SIZE = 3000; // 맵 크기 (정사각형)
const PLAYER_SPEED = 200; // 플레이어 이동 속도 (픽셀/초)
const PLAYER_SIZE = 30;

// ========================================
// 증강 시스템 정의
// ========================================
const AUGMENT_TYPES = {
  // 공격 속도 특화 - 속사 기관총
  MACHINE_GUN: {
    id: 'MACHINE_GUN',
    name: '속사 기관총',
    desc: '가장 가까운 적에게 빠르게 총알 발사',
    icon: '🔫',
    statType: 'attackSpeed',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      attackSpeedBonus: 0.3 * level,
      bulletCount: Math.floor(level / 3) + 1,
    }),
    evolveLevel: 10,
    evolvedName: '헤비 발칸',
    evolvedDesc: '총알이 적을 관통하며 극도로 빠른 속도로 발사',
  },
  
  // 공격력 특화 - 근접 지뢰
  PROXIMITY_MINE: {
    id: 'PROXIMITY_MINE',
    name: '근접 지뢰',
    desc: '적에 닿으면 폭발하는 지뢰 설치',
    icon: '💣',
    statType: 'attackPower',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      mineDamage: 50 + level * 20,
      mineCount: Math.floor(level / 2) + 1,
    }),
    evolveLevel: 10,
    evolvedName: '연쇄 폭발물',
    evolvedDesc: '지뢰가 터지면 2차, 3차 연쇄 폭발 발생',
  },
  
  // 공격 범위 특화 - 화염방사기
  FLAMETHROWER: {
    id: 'FLAMETHROWER',
    name: '화염방사기',
    desc: '바닥에 불을 질러 지속 피해',
    icon: '🔥',
    statType: 'attackRange',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      fireDamage: 10 + level * 3,
      fireRange: 100 + level * 20,
      fireDuration: 2 + level * 0.3,
    }),
    evolveLevel: 10,
    evolvedName: '인페르노 존',
    evolvedDesc: '불길이 넓어지며 불타는 적이 죽을 때 불을 전이',
  },
  
  // 획득 범위 특화 - 회전 칼날 드론
  BLADE_DRONE: {
    id: 'BLADE_DRONE',
    name: '회전 칼날 드론',
    desc: '플레이어 주변을 도는 방어형 드론',
    icon: '⚙️',
    statType: 'pickupRange',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      droneDamage: 15 + level * 5,
      droneCount: Math.floor(level / 3) + 1,
      droneRadius: 80 + level * 10,
    }),
    evolveLevel: 10,
    evolvedName: '믹서기 드론',
    evolvedDesc: '드론이 적을 끌어당기며 갈아버림',
  },
  
  // 최대 체력 특화 - 페로몬 유도탄
  PHEROMONE_BOMB: {
    id: 'PHEROMONE_BOMB',
    name: '페로몬 유도탄',
    desc: '벌레를 유인하고 일정 시간 뒤 폭발',
    icon: '💥',
    statType: 'maxHealth',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      explosionDamage: 80 + level * 30,
      attractRadius: 200 + level * 20,
    }),
    evolveLevel: 10,
    evolvedName: '여왕벌의 둥지',
    evolvedDesc: '거대 아군 벌레가 나와 적을 도발하고 파괴 시 맹독 살포',
  },
  
  // 쿨타임 감소 특화 - 전격 체인
  ELECTRIC_CHAIN: {
    id: 'ELECTRIC_CHAIN',
    name: '전격 체인',
    desc: '랜덤한 적에게 번개를 떨어뜨리고 전이',
    icon: '⚡',
    statType: 'cooldown',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      lightningDamage: 30 + level * 10,
      chainCount: 2 + Math.floor(level / 3),
    }),
    evolveLevel: 10,
    evolvedName: '뇌운',
    evolvedDesc: '머리 위 먹구름이 끊임없이 벼락 발사',
  },
  
  // 투사체 속도 특화 - 리코셰 디스크
  RICOCHET_DISK: {
    id: 'RICOCHET_DISK',
    name: '리코셰 디스크',
    desc: '벽에 튕기는 원반을 던짐',
    icon: '🪃',
    statType: 'projectileSpeed',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      diskDamage: 25 + level * 8,
      bounceCount: 3 + Math.floor(level / 2),
    }),
    evolveLevel: 10,
    evolvedName: '절단기 폭풍',
    evolvedDesc: '디스크가 튕길 때마다 분열하여 화면을 뒤덮음',
  },
  
  // 지속시간 특화 - 독가스 분무기
  POISON_SPRAY: {
    id: 'POISON_SPRAY',
    name: '독가스 분무기',
    desc: '지나간 자리에 독구름을 남김',
    icon: '☠️',
    statType: 'duration',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      poisonDamage: 5 + level * 2,
      cloudDuration: 3 + level * 0.5,
    }),
    evolveLevel: 10,
    evolvedName: '바이오하자드',
    evolvedDesc: '독구름이 오라가 되며 적을 느리게 하고 방어력 0',
  },
  
  // 이동속도 특화 - 스톰프 부츠
  STOMP_BOOTS: {
    id: 'STOMP_BOOTS',
    name: '스톰프 부츠',
    desc: '일정 거리 이동 시 충격파 발생',
    icon: '👢',
    statType: 'moveSpeed',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      shockDamage: 40 + level * 15,
      shockRadius: 60 + level * 10,
    }),
    evolveLevel: 10,
    evolvedName: '지진 발생기',
    evolvedDesc: '이동 시 땅이 갈라지며 지진 발생',
  },
};

// 능력치 증강 정의
const STAT_AUGMENTS = {
  ATTACK_SPEED: { name: '공격 속도 +25%', statType: 'attackSpeed', effect: () => ({ attackSpeedMult: 1.25 }) },
  ATTACK_POWER: { name: '공격력 +20%', statType: 'attackPower', effect: () => ({ attackPowerMult: 1.2 }) },
  ATTACK_RANGE: { name: '공격 범위 +15%', statType: 'attackRange', effect: () => ({ attackRangeMult: 1.15 }) },
  MOVE_SPEED: { name: '이동 속도 +15%', statType: 'moveSpeed', effect: () => ({ moveSpeedMult: 1.15 }) },
  MAX_HEALTH: { name: '최대 체력 +20', statType: 'maxHealth', effect: () => ({ maxHealthBonus: 20 }) },
  PICKUP_RANGE: { name: '획득 범위 +30%', statType: 'pickupRange', effect: () => ({ pickupRangeMult: 1.3 }) },
  PROJECTILE_SPEED: { name: '투사체 속도 +25%', statType: 'projectileSpeed', effect: () => ({ projectileSpeedMult: 1.25 }) },
  COOLDOWN: { name: '쿨타임 감소 -15%', statType: 'cooldown', effect: () => ({ cooldownMult: 0.85 }) },
  DURATION: { name: '지속시간 +20%', statType: 'duration', effect: () => ({ durationMult: 1.2 }) },
};

// 적 타입 정의 (거대 곤충 테마)
const ENEMY_TYPES = {
  // 메뚜기 (Locust) - 기본 적
  LOCUST: {
    name: '메뚜기',
    color: '#8B4513',
    size: 25,
    speed: 120,
    health: 30,
    damage: 10,
    exp: 10,
    knockback: 15,
    behavior: 'chase', // 플레이어 추적
  },
  
  // 말벌 (Hornet) - 원거리 공격
  HORNET: {
    name: '말벌',
    color: '#FFD700',
    size: 20,
    speed: 100,
    health: 20,
    damage: 15,
    exp: 15,
    knockback: 10,
    behavior: 'ranged', // 원거리 공격
    attackRange: 300,
    attackCooldown: 2.0,
  },
  
  // 딱정벌레 (Beetle) - 높은 체력
  BEETLE: {
    name: '딱정벌레',
    color: '#2F4F2F',
    size: 35,
    speed: 80,
    health: 80,
    damage: 20,
    exp: 25,
    knockback: 8,
    behavior: 'chase',
  },
  
  // 전갈 (Scorpion) - 빠른 공격
  SCORPION: {
    name: '전갈',
    color: '#8B0000',
    size: 30,
    speed: 150,
    health: 50,
    damage: 25,
    exp: 30,
    knockback: 12,
    behavior: 'chase',
  },
  
  // 사마귀 (Mantis) - 보스
  MANTIS: {
    name: '사마귀',
    color: '#00FF00',
    size: 60,
    speed: 100,
    health: 500,
    damage: 40,
    exp: 200,
    knockback: 0, // 보스는 넉백 면역
    behavior: 'boss',
    isBoss: true,
  },
};

// ========================================
// 입력 관리
// ========================================
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ========================================
// 게임 상태
// ========================================
const game = {
  isPaused: false,
  time: 0, // 게임 시간 (초)
  spawnTimer: 0,
  spawnInterval: 2.0, // 적 생성 주기 (초)
  bossTimer: 0,
  nextBossTime: 60, // 첫 보스 등장 시간 (60초)
};

// ========================================
// 플레이어
// ========================================
const player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: PLAYER_SIZE,
  speed: PLAYER_SPEED,
  health: 100,
  maxHealth: 100,
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  facingAngle: 0, // 바라보는 방향 (라디안)
  attackDamage: 20,
  attackSpeed: 1.0, // 초당 공격 횟수
  attackTimer: 0,
  projectileSpeed: 400,
  
  // 증강 관련
  augments: [{ id: 'MACHINE_GUN', level: 1 }], // 기본 무기로 시작
  statBonuses: {
    attackSpeedMult: 1,
    attackPowerMult: 1,
    attackRangeMult: 1,
    moveSpeedMult: 1,
    maxHealthBonus: 0,
    pickupRangeMult: 1,
    projectileSpeedMult: 1,
    cooldownMult: 1,
    durationMult: 1,
  },
  
  // 통계 (확률 조정용)
  statPreference: {}, // { 'attackSpeed': 0.2, ... } 형태로 추가 확률 저장
  
  // 리롤 횟수
  rerollCount: 0,
  canReroll: true, // 레벨업 시 1회만 가능
};

// ========================================
// 게임 오브젝트 배열
// ========================================
const enemies = [];
const projectiles = []; // 플레이어 투사체
const enemyProjectiles = []; // 적 투사체
const expOrbs = []; // 경험치 구슬

// 무기 전용 오브젝트 배열
const mines = []; // 지뢰
const firePatches = []; // 화염 패치
const drones = []; // 드론
const pheromones = []; // 페로몬 폭탄
const lightnings = []; // 번개
const disks = []; // 리코셰 디스크
const poisonClouds = []; // 독구름
const shockwaves = []; // 충격파

// 무기 타이머
const weaponTimers = {
  MACHINE_GUN: 0,
  PROXIMITY_MINE: 0,
  FLAMETHROWER: 0,
  BLADE_DRONE: 0,
  PHEROMONE_BOMB: 0,
  ELECTRIC_CHAIN: 0,
  RICOCHET_DISK: 0,
  POISON_SPRAY: 0,
  STOMP_BOOTS: 0,
};

// 플레이어 이동 거리 추적 (스톰프 부츠용)
let playerDistanceTraveled = 0;

// ========================================
// 카메라
// ========================================
const camera = {
  x: player.x,
  y: player.y,
};

// 카메라를 플레이어 중심으로 업데이트
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

// ========================================
// 적 생성
// ========================================
function spawnEnemy(type) {
  const enemyType = ENEMY_TYPES[type];
  
  // 맵 끝의 랜덤 위치에서 생성
  const side = Math.floor(Math.random() * 4); // 0: 상, 1: 우, 2: 하, 3: 좌
  let x, y;
  
  switch (side) {
    case 0: // 상단
      x = Math.random() * MAP_SIZE;
      y = 0;
      break;
    case 1: // 우측
      x = MAP_SIZE;
      y = Math.random() * MAP_SIZE;
      break;
    case 2: // 하단
      x = Math.random() * MAP_SIZE;
      y = MAP_SIZE;
      break;
    case 3: // 좌측
      x = 0;
      y = Math.random() * MAP_SIZE;
      break;
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
  });
}

// 게임 시간에 따른 적 생성
function updateEnemySpawning(deltaTime) {
  game.spawnTimer += deltaTime;
  
  if (game.spawnTimer >= game.spawnInterval) {
    game.spawnTimer = 0;
    
    // 게임 시간에 따라 다른 적 생성
    const gameMinutes = Math.floor(game.time / 60);
    const spawnCount = Math.min(3 + gameMinutes, 8); // 최대 8마리씩
    
    for (let i = 0; i < spawnCount; i++) {
      let enemyType;
      
      if (game.time < 30) {
        // 0-30초: 메뚜기만
        enemyType = 'LOCUST';
      } else if (game.time < 60) {
        // 30-60초: 메뚜기 + 말벌
        enemyType = Math.random() < 0.7 ? 'LOCUST' : 'HORNET';
      } else if (game.time < 120) {
        // 60-120초: 메뚜기 + 말벌 + 딱정벌레
        const rand = Math.random();
        if (rand < 0.5) enemyType = 'LOCUST';
        else if (rand < 0.8) enemyType = 'HORNET';
        else enemyType = 'BEETLE';
      } else {
        // 120초 이후: 모든 적
        const rand = Math.random();
        if (rand < 0.4) enemyType = 'LOCUST';
        else if (rand < 0.65) enemyType = 'HORNET';
        else if (rand < 0.85) enemyType = 'BEETLE';
        else enemyType = 'SCORPION';
      }
      
      spawnEnemy(enemyType);
    }
  }
  
  // 보스 생성 (1분마다)
  if (game.time >= game.nextBossTime) {
    spawnEnemy('MANTIS');
    game.nextBossTime += 60; // 다음 보스는 1분 후
    console.log('🐛 보스 사마귀 등장!');
  }
}

// ========================================
// 플레이어 업데이트
// ========================================
function updatePlayer(deltaTime) {
  // 이동 입력 처리
  let dx = 0;
  let dy = 0;
  
  if (keys['a']) dx -= 1;
  if (keys['d']) dx += 1;
  if (keys['w']) dy -= 1;
  if (keys['s']) dy += 1;
  
  // 이동 방향 정규화
  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    
    // 플레이어 이동
    player.x += dx * player.speed * deltaTime;
    player.y += dy * player.speed * deltaTime;
    
    // 바라보는 방향 업데이트
    player.facingAngle = Math.atan2(dy, dx);
  }
  
  // 맵 경계 제한
  player.x = Math.max(player.size / 2, Math.min(MAP_SIZE - player.size / 2, player.x));
  player.y = Math.max(player.size / 2, Math.min(MAP_SIZE - player.size / 2, player.y));
  
  // 기본 자동 공격은 제거 (무기 증강으로 대체)
}

// ========================================
// 자동 공격 시스템
// ========================================
function shootAtNearestEnemy() {
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
  
  // 적 방향으로 발사
  const dx = nearestEnemy.x - player.x;
  const dy = nearestEnemy.y - player.y;
  const angle = Math.atan2(dy, dx);
  
  const projectileSpeed = player.projectileSpeed * player.statBonuses.projectileSpeedMult;
  
  projectiles.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * projectileSpeed,
    vy: Math.sin(angle) * projectileSpeed,
    damage: player.attackDamage * player.statBonuses.attackPowerMult,
    size: 5,
    lifetime: 3.0,
    pierce: false, // 기본은 관통 없음
  });
}

// ========================================
// 무기 증강 업데이트 시스템
// ========================================

// 1. 속사 기관총 (MACHINE_GUN) - 공격속도 증가, 다중 발사
function updateMachineGun(deltaTime) {
  const augment = player.augments.find(a => a.id === 'MACHINE_GUN');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.MACHINE_GUN.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.MACHINE_GUN.evolveLevel;
  
  // 추가 공격속도 보너스 적용 (이미 player.attackSpeed에 반영됨)
  // 다중 발사 처리
  weaponTimers.MACHINE_GUN += deltaTime;
  const interval = 1.0 / (player.attackSpeed * player.statBonuses.attackSpeedMult);
  
  if (weaponTimers.MACHINE_GUN >= interval) {
    weaponTimers.MACHINE_GUN = 0;
    
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
    
    // 다중 발사 (확산)
    const baseAngle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
    const bulletCount = effectData.bulletCount;
    const spreadAngle = Math.PI / 8; // 확산 각도
    
    for (let i = 0; i < bulletCount; i++) {
      const offset = (i - (bulletCount - 1) / 2) * (spreadAngle / bulletCount);
      const angle = baseAngle + offset;
      
      const projectileSpeed = player.projectileSpeed * player.statBonuses.projectileSpeedMult;
      
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * projectileSpeed,
        vy: Math.sin(angle) * projectileSpeed,
        damage: player.attackDamage * player.statBonuses.attackPowerMult * 0.8, // 다중 발사라 약간 약함
        size: 4,
        lifetime: 2.0,
        pierce: isEvolved, // 진화 시 관통
        color: isEvolved ? '#FFD700' : '#FFFF00',
      });
    }
  }
}

// 2. 근접 지뢰 (PROXIMITY_MINE) - 지뢰 설치
function updateProximityMine(deltaTime) {
  const augment = player.augments.find(a => a.id === 'PROXIMITY_MINE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.PROXIMITY_MINE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.PROXIMITY_MINE.evolveLevel;
  
  weaponTimers.PROXIMITY_MINE += deltaTime;
  const interval = 3.0 * player.statBonuses.cooldownMult; // 3초마다
  
  if (weaponTimers.PROXIMITY_MINE >= interval) {
    weaponTimers.PROXIMITY_MINE = 0;
    
    // 플레이어 위치에 지뢰 설치
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
  
  // 지뢰 업데이트
  for (let i = mines.length - 1; i >= 0; i--) {
    const mine = mines[i];
    mine.age += deltaTime;
    
    // 수명 확인
    if (mine.age >= mine.lifetime) {
      mines.splice(i, 1);
      continue;
    }
    
    // 적과 충돌 확인
    for (const enemy of enemies) {
      const dx = enemy.x - mine.x;
      const dy = enemy.y - mine.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= mine.radius) {
        // 폭발 범위 내 모든 적에게 피해
        for (const e of enemies) {
          const edx = e.x - mine.x;
          const edy = e.y - mine.y;
          const eDist = Math.sqrt(edx * edx + edy * edy);
          
          if (eDist <= mine.radius * 1.5) {
            e.health -= mine.damage;
          }
        }
        
        // 진화: 연쇄 폭발
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
              isEvolved: false, // 연쇄 폭발은 더 이상 분열 안 함
            });
          }
        }
        
        mines.splice(i, 1);
        break;
      }
    }
  }
}

// 3. 화염방사기 (FLAMETHROWER) - 화염 패치 생성
function updateFlamethrower(deltaTime) {
  const augment = player.augments.find(a => a.id === 'FLAMETHROWER');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.FLAMETHROWER.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.FLAMETHROWER.evolveLevel;
  
  weaponTimers.FLAMETHROWER += deltaTime;
  const interval = 0.5 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.FLAMETHROWER >= interval) {
    weaponTimers.FLAMETHROWER = 0;
    
    // 플레이어가 바라보는 방향에 화염 패치 생성
    const range = effectData.fireRange * player.statBonuses.attackRangeMult;
    
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
  
  // 화염 패치 업데이트
  for (let i = firePatches.length - 1; i >= 0; i--) {
    const fire = firePatches[i];
    fire.age += deltaTime;
    fire.damageTimer += deltaTime;
    
    if (fire.age >= fire.duration) {
      firePatches.splice(i, 1);
      continue;
    }
    
    // 주기적 피해
    if (fire.damageTimer >= fire.damageInterval) {
      fire.damageTimer = 0;
      
      for (const enemy of enemies) {
        const dx = enemy.x - fire.x;
        const dy = enemy.y - fire.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= fire.radius) {
          enemy.health -= fire.damage;
          enemy.onFire = true; // 불타는 상태 표시
          enemy.fireTime = 2.0;
        }
      }
    }
  }
  
  // 진화: 불타는 적이 죽으면 불 전이
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

// 4. 회전 칼날 드론 (BLADE_DRONE) - 드론 생성 및 회전
function updateBladeDrone(deltaTime) {
  const augment = player.augments.find(a => a.id === 'BLADE_DRONE');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.BLADE_DRONE.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.BLADE_DRONE.evolveLevel;
  
  // 드론 개수 맞추기
  const targetCount = effectData.droneCount;
  while (drones.length < targetCount) {
    drones.push({
      angle: (drones.length * Math.PI * 2) / targetCount,
      radius: effectData.droneRadius,
      damage: effectData.droneDamage * player.statBonuses.attackPowerMult,
      size: 15,
      rotationSpeed: 2.0, // 초당 라디안
      isEvolved,
    });
  }
  
  // 드론 업데이트
  for (const drone of drones) {
    drone.angle += drone.rotationSpeed * deltaTime;
    drone.x = player.x + Math.cos(drone.angle) * drone.radius;
    drone.y = player.y + Math.sin(drone.angle) * drone.radius;
    drone.damage = effectData.droneDamage * player.statBonuses.attackPowerMult;
    drone.radius = effectData.droneRadius;
    
    // 적과 충돌 확인
    for (const enemy of enemies) {
      const dx = enemy.x - drone.x;
      const dy = enemy.y - drone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= drone.size + enemy.size) {
        enemy.health -= drone.damage * deltaTime; // 지속 피해
        
        // 진화: 적을 끌어당김
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

// 5. 페로몬 유도탄 (PHEROMONE_BOMB) - 유인 후 폭발
function updatePheromoneBomb(deltaTime) {
  const augment = player.augments.find(a => a.id === 'PHEROMONE_BOMB');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.PHEROMONE_BOMB.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.PHEROMONE_BOMB.evolveLevel;
  
  weaponTimers.PHEROMONE_BOMB += deltaTime;
  const interval = 8.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.PHEROMONE_BOMB >= interval) {
    weaponTimers.PHEROMONE_BOMB = 0;
    
    // 랜덤 위치에 페로몬 폭탄 투하
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
  
  // 페로몬 업데이트
  for (let i = pheromones.length - 1; i >= 0; i--) {
    const bomb = pheromones[i];
    bomb.age += deltaTime;
    
    // 적 유인
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
    
    // 폭발
    if (bomb.age >= bomb.lifetime) {
      // 범위 내 적에게 피해
      for (const enemy of enemies) {
        const dx = enemy.x - bomb.x;
        const dy = enemy.y - bomb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= bomb.attractRadius) {
          enemy.health -= bomb.explosionDamage;
        }
      }
      
      // 진화: 아군 터렛 생성 (간단 구현 - 추가 폭발)
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

// 6. 전격 체인 (ELECTRIC_CHAIN) - 번개 연쇄
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
    
    // 랜덤한 적 선택
    const startEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    lightnings.push({
      x: startEnemy.x,
      y: startEnemy.y,
      damage: effectData.lightningDamage * player.statBonuses.attackPowerMult,
      chainCount: effectData.chainCount,
      chainRadius: 200,
      targets: [startEnemy],
      lifetime: 0.3,
      age: 0,
    });
  }
  
  // 번개 업데이트
  for (let i = lightnings.length - 1; i >= 0; i--) {
    const lightning = lightnings[i];
    lightning.age += deltaTime;
    
    if (lightning.age >= lightning.lifetime) {
      // 타겟에 피해
      for (const target of lightning.targets) {
        if (target.health > 0) {
          target.health -= lightning.damage;
        }
      }
      
      // 연쇄 번개
      if (lightning.targets.length < lightning.chainCount) {
        const lastTarget = lightning.targets[lightning.targets.length - 1];
        
        // 가까운 적 찾기
        let nearestEnemy = null;
        let minDist = Infinity;
        
        for (const enemy of enemies) {
          if (lightning.targets.includes(enemy)) continue;
          
          const dx = enemy.x - lastTarget.x;
          const dy = enemy.y - lastTarget.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= lightning.chainRadius && dist < minDist) {
            minDist = dist;
            nearestEnemy = enemy;
          }
        }
        
        if (nearestEnemy) {
          lightning.targets.push(nearestEnemy);
          lightning.age = 0; // 타이머 리셋
        } else {
          lightnings.splice(i, 1);
        }
      } else {
        lightnings.splice(i, 1);
      }
    }
  }
}

// 7. 리코셰 디스크 (RICOCHET_DISK) - 벽 튕기기
function updateRicochetDisk(deltaTime) {
  const augment = player.augments.find(a => a.id === 'RICOCHET_DISK');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.RICOCHET_DISK.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.RICOCHET_DISK.evolveLevel;
  
  weaponTimers.RICOCHET_DISK += deltaTime;
  const interval = 3.0 * player.statBonuses.cooldownMult;
  
  if (weaponTimers.RICOCHET_DISK >= interval) {
    weaponTimers.RICOCHET_DISK = 0;
    
    // 랜덤 방향으로 디스크 발사
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
  
  // 디스크 업데이트
  for (let i = disks.length - 1; i >= 0; i--) {
    const disk = disks[i];
    disk.age += deltaTime;
    disk.x += disk.vx * deltaTime;
    disk.y += disk.vy * deltaTime;
    
    if (disk.age >= disk.lifetime || disk.bounces >= disk.bounceCount) {
      disks.splice(i, 1);
      continue;
    }
    
    // 벽 튕김
    if (disk.x <= 0 || disk.x >= MAP_SIZE) {
      disk.vx *= -1;
      disk.bounces++;
      
      // 진화: 분열
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
      
      // 진화: 분열 (위와 동일)
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
    
    // 적과 충돌
    for (const enemy of enemies) {
      const dx = enemy.x - disk.x;
      const dy = enemy.y - disk.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= disk.size + enemy.size) {
        enemy.health -= disk.damage;
      }
    }
  }
}

// 8. 독가스 분무기 (POISON_SPRAY) - 독구름 트레일
function updatePoisonSpray(deltaTime) {
  const augment = player.augments.find(a => a.id === 'POISON_SPRAY');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.POISON_SPRAY.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.POISON_SPRAY.evolveLevel;
  
  weaponTimers.POISON_SPRAY += deltaTime;
  const interval = 0.3;
  
  if (weaponTimers.POISON_SPRAY >= interval) {
    weaponTimers.POISON_SPRAY = 0;
    
    // 플레이어 위치에 독구름 생성
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
  
  // 독구름 업데이트
  for (let i = poisonClouds.length - 1; i >= 0; i--) {
    const cloud = poisonClouds[i];
    cloud.age += deltaTime;
    cloud.damageTimer += deltaTime;
    
    if (cloud.age >= cloud.duration) {
      poisonClouds.splice(i, 1);
      continue;
    }
    
    // 주기적 피해
    if (cloud.damageTimer >= cloud.damageInterval) {
      cloud.damageTimer = 0;
      
      for (const enemy of enemies) {
        const dx = enemy.x - cloud.x;
        const dy = enemy.y - cloud.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= cloud.radius) {
          enemy.health -= cloud.damage;
          
          // 진화: 슬로우 + 방어력 감소 (피해 증가로 표현)
          if (cloud.isEvolved) {
            enemy.poisoned = true;
            enemy.poisonTime = 2.0;
          }
        }
      }
    }
  }
}

// 9. 스톰프 부츠 (STOMP_BOOTS) - 이동 거리 충격파
function updateStompBoots(deltaTime) {
  const augment = player.augments.find(a => a.id === 'STOMP_BOOTS');
  if (!augment) return;
  
  const effectData = AUGMENT_TYPES.STOMP_BOOTS.effect(augment.level);
  const isEvolved = augment.level >= AUGMENT_TYPES.STOMP_BOOTS.evolveLevel;
  
  // 이동 거리 추적
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
    
    // 일정 거리마다 충격파
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
  
  // 충격파 업데이트
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i];
    wave.age += deltaTime;
    wave.radius += wave.expandSpeed * deltaTime;
    
    if (wave.age >= wave.lifetime || wave.radius >= wave.maxRadius) {
      shockwaves.splice(i, 1);
      continue;
    }
    
    // 적과 충돌
    for (const enemy of enemies) {
      const dx = enemy.x - wave.x;
      const dy = enemy.y - wave.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (Math.abs(dist - wave.radius) <= 20) { // 충격파 두께
        enemy.health -= wave.damage;
        
        // 넉백
        const angle = Math.atan2(dy, dx);
        enemy.x += Math.cos(angle) * enemy.type.knockback * 3;
        enemy.y += Math.sin(angle) * enemy.type.knockback * 3;
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

// ========================================
// 기존 자동 공격 비활성화 (무기 증강으로 대체)
// ========================================
function shootAtNearestEnemy() {
  if (enemies.length === 0) return;
  
  // 가장 가까운 적 찾기
  let nearestEnemy = null;
  let minDistance = Infinity;
  
  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestEnemy = enemy;
    }
  }
  
  if (nearestEnemy) {
    // 적 방향으로 발사
    const dx = nearestEnemy.x - player.x;
    const dy = nearestEnemy.y - player.y;
    const angle = Math.atan2(dy, dx);
    
    // 플레이어 방향 업데이트
    player.facingAngle = angle;
    
    projectiles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.projectileSpeed,
      vy: Math.sin(angle) * player.projectileSpeed,
      damage: player.attackDamage,
      size: 8,
    });
  }
}

// ========================================
// 적 업데이트
// ========================================
function updateEnemies(deltaTime) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const type = enemy.type;
    
    // 플레이어 방향 계산
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // 행동 패턴에 따른 이동
    if (type.behavior === 'chase' || type.behavior === 'boss') {
      // 플레이어 추적
      enemy.vx = dirX * type.speed;
      enemy.vy = dirY * type.speed;
      enemy.x += enemy.vx * deltaTime;
      enemy.y += enemy.vy * deltaTime;
    } else if (type.behavior === 'ranged') {
      // 원거리 적: 일정 거리에서 멈추고 공격
      if (distance > type.attackRange) {
        enemy.vx = dirX * type.speed;
        enemy.vy = dirY * type.speed;
        enemy.x += enemy.vx * deltaTime;
        enemy.y += enemy.vy * deltaTime;
      } else {
        enemy.vx = 0;
        enemy.vy = 0;
        
        // 원거리 공격
        enemy.attackTimer += deltaTime;
        if (enemy.attackTimer >= type.attackCooldown) {
          enemy.attackTimer = 0;
          shootEnemyProjectile(enemy, dirX, dirY);
        }
      }
    }
    
    // 플레이어와 충돌 체크 (근접 공격)
    if (distance < (player.size + type.size) / 2) {
      player.health -= type.damage * deltaTime;
      if (player.health <= 0) {
        player.health = 0;
        gameOver();
      }
    }
    
    // 죽은 적 제거
    if (enemy.health <= 0) {
      dropExpOrb(enemy.x, enemy.y, type.exp);
      enemies.splice(i, 1);
    }
  }
}

// 적 원거리 공격
function shootEnemyProjectile(enemy, dirX, dirY) {
  enemyProjectiles.push({
    x: enemy.x,
    y: enemy.y,
    vx: dirX * 200,
    vy: dirY * 200,
    damage: enemy.type.damage,
    size: 6,
  });
}

// ========================================
// 투사체 업데이트
// ========================================
function updateProjectiles(deltaTime) {
  // 플레이어 투사체
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx * deltaTime;
    proj.y += proj.vy * deltaTime;
    
    // 맵 밖으로 나가면 제거
    if (proj.x < 0 || proj.x > MAP_SIZE || proj.y < 0 || proj.y > MAP_SIZE) {
      projectiles.splice(i, 1);
      continue;
    }
    
    // 적과 충돌 체크
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dx = proj.x - enemy.x;
      const dy = proj.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (proj.size + enemy.type.size) / 2) {
        // 데미지 적용
        enemy.health -= proj.damage;
        
        // 넉백 (보스 제외)
        if (enemy.type.knockback > 0) {
          const angle = Math.atan2(proj.vy, proj.vx);
          enemy.x += Math.cos(angle) * enemy.type.knockback;
          enemy.y += Math.sin(angle) * enemy.type.knockback;
        }
        
        projectiles.splice(i, 1);
        break;
      }
    }
  }
  
  // 적 투사체
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const proj = enemyProjectiles[i];
    proj.x += proj.vx * deltaTime;
    proj.y += proj.vy * deltaTime;
    
    // 맵 밖으로 나가면 제거
    if (proj.x < 0 || proj.x > MAP_SIZE || proj.y < 0 || proj.y > MAP_SIZE) {
      enemyProjectiles.splice(i, 1);
      continue;
    }
    
    // 플레이어와 충돌 체크
    const dx = proj.x - player.x;
    const dy = proj.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < (proj.size + player.size) / 2) {
      player.health -= proj.damage;
      if (player.health <= 0) {
        player.health = 0;
        gameOver();
      }
      enemyProjectiles.splice(i, 1);
    }
  }
}

// ========================================
// 경험치 시스템
// ========================================
function dropExpOrb(x, y, exp) {
  expOrbs.push({
    x,
    y,
    exp,
    size: 10,
  });
}

function updateExpOrbs(deltaTime) {
  for (let i = expOrbs.length - 1; i >= 0; i--) {
    const orb = expOrbs[i];
    
    // 플레이어와의 거리
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 자석 효과 (일정 거리 내)
    const magnetRange = 150;
    if (distance < magnetRange) {
      const magnetSpeed = 300;
      orb.x += (dx / distance) * magnetSpeed * deltaTime;
      orb.y += (dy / distance) * magnetSpeed * deltaTime;
    }
    
    // 획득
    if (distance < (player.size + orb.size) / 2) {
      player.exp += orb.exp;
      
      // 레벨업 체크
      if (player.exp >= player.expToNextLevel) {
        levelUp();
      }
      
      expOrbs.splice(i, 1);
    }
  }
}

function levelUp() {
  player.level++;
  player.exp -= player.expToNextLevel;
  player.expToNextLevel = Math.floor(player.expToNextLevel * 1.5);
  
  // 체력 30% 회복
  player.health = Math.min(player.maxHealth + player.statBonuses.maxHealthBonus, player.health + (player.maxHealth + player.statBonuses.maxHealthBonus) * 0.3);
  
  // 리롤 가능 상태 초기화
  player.canReroll = true;
  
  // 게임 일시정지 및 증강 선택 화면 표시
  game.isPaused = true;
  showLevelUpScreen();
}

function getAugmentChoices() {
  const choices = [];
  const weaponChance = 0.6; // 증강 60%, 능력치 40%
  const selectedIds = new Set(); // 중복 방지
  
  for (let i = 0; i < 5; i++) {
    const isWeapon = Math.random() < weaponChance;
    let attempts = 0;
    let selected = null;
    
    // 최대 50번 시도 (무한 루프 방지)
    while (!selected && attempts < 50) {
      attempts++;
      
      if (isWeapon) {
        // 무기 증강 선택
        const availableWeapons = Object.values(AUGMENT_TYPES).filter(aug => {
          const playerAug = player.augments.find(a => a.id === aug.id);
          const level = playerAug ? playerAug.level : 0;
          return level < aug.maxLevel && !selectedIds.has(aug.id);
        });
        
        if (availableWeapons.length > 0) {
          // 확률 가중치 계산
          const weights = availableWeapons.map(aug => {
            let baseWeight = 1.0;
            // 해당 무기의 특화 능력치에 대한 추가 확률 (20%)
            if (player.statPreference[aug.statType]) {
              baseWeight += player.statPreference[aug.statType];
            }
            return baseWeight;
          });
          
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          let random = Math.random() * totalWeight;
          
          for (let j = 0; j < availableWeapons.length; j++) {
            random -= weights[j];
            if (random <= 0) {
              selected = { type: 'weapon', augment: availableWeapons[j] };
              selectedIds.add(availableWeapons[j].id);
              break;
            }
          }
        } else {
          // 무기가 없으면 능력치로 전환
          continue;
        }
      } else {
        // 능력치 증강 선택
        const statAugments = Object.entries(STAT_AUGMENTS).filter(([key]) => !selectedIds.has(key));
        
        if (statAugments.length > 0) {
          const weights = statAugments.map(([key, aug]) => {
            let baseWeight = 1.0;
            if (player.statPreference[aug.statType]) {
              baseWeight += player.statPreference[aug.statType];
            }
            return baseWeight;
          });
          
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          let random = Math.random() * totalWeight;
          
          for (let j = 0; j < statAugments.length; j++) {
            random -= weights[j];
            if (random <= 0) {
              selected = { type: 'stat', augment: statAugments[j][1], key: statAugments[j][0] };
              selectedIds.add(statAugments[j][0]);
              break;
            }
          }
        }
      }
    }
    
    if (selected) {
      choices.push(selected);
    }
  }
  
  return choices;
}

function showLevelUpScreen() {
  const screen = document.getElementById('levelUpScreen');
  const choices = document.getElementById('augmentChoices');
  choices.innerHTML = '';
  
  const augmentChoices = getAugmentChoices();
  
  augmentChoices.forEach(choice => {
    const div = document.createElement('div');
    div.className = 'augment-choice';
    
    if (choice.type === 'weapon') {
      const aug = choice.augment;
      const playerAug = player.augments.find(a => a.id === aug.id);
      const currentLevel = playerAug ? playerAug.level : 0;
      const nextLevel = currentLevel + 1;
      const isEvolved = nextLevel >= aug.evolveLevel;
      const isMaxed = nextLevel >= aug.maxLevel;
      
      const displayName = isEvolved ? aug.evolvedName : aug.name;
      const displayDesc = isEvolved ? aug.evolvedDesc : aug.desc;
      
      div.innerHTML = `
        <div class="augment-icon">${aug.icon}</div>
        <h3>${displayName}</h3>
        <p class="augment-level">레벨 ${currentLevel} → ${nextLevel}${isMaxed ? ' (MAX)' : ''}</p>
        <p>${displayDesc}</p>
      `;
      
      div.onclick = () => {
        selectAugment(choice);
      };
    } else {
      const aug = choice.augment;
      div.innerHTML = `
        <div class="augment-icon">📊</div>
        <h3>${aug.name}</h3>
        <p>능력치 강화</p>
      `;
      
      div.onclick = () => {
        selectAugment(choice);
      };
    }
    
    choices.appendChild(div);
  });
  
  // 리롤 버튼 추가
  const rerollDiv = document.createElement('div');
  rerollDiv.id = 'rerollButton';
  
  if (player.canReroll) {
    rerollDiv.innerHTML = `🔄 리롤 (1회 가능)`;
    rerollDiv.style.opacity = '1';
    rerollDiv.onclick = () => {
      player.rerollCount++;
      player.canReroll = false;
      showLevelUpScreen();
    };
  } else {
    rerollDiv.innerHTML = `🔄 리롤 (사용 완료)`;
    rerollDiv.style.opacity = '0.5';
    rerollDiv.style.cursor = 'not-allowed';
    rerollDiv.onclick = null;
  }
  
  choices.appendChild(rerollDiv);
  
  screen.classList.remove('hidden');
}

function selectAugment(choice) {
  if (choice.type === 'weapon') {
    const aug = choice.augment;
    const playerAug = player.augments.find(a => a.id === aug.id);
    
    if (playerAug) {
      playerAug.level++;
    } else {
      player.augments.push({ id: aug.id, level: 1 });
    }
    
    // 특화 능력치 추가 확률 증가
    if (!player.statPreference[aug.statType]) {
      player.statPreference[aug.statType] = 0;
    }
    player.statPreference[aug.statType] += 0.2;
    
  } else {
    // 능력치 증강
    const aug = choice.augment;
    const effect = aug.effect();
    
    Object.entries(effect).forEach(([key, value]) => {
      if (key.endsWith('Mult')) {
        player.statBonuses[key] *= value;
      } else {
        player.statBonuses[key] = (player.statBonuses[key] || 0) + value;
      }
    });
    
    // 능력치 보너스 적용
    if (effect.maxHealthBonus) {
      player.health += effect.maxHealthBonus;
    }
    
    // 특화 능력치 추가 확률 증가
    if (!player.statPreference[aug.statType]) {
      player.statPreference[aug.statType] = 0;
    }
    player.statPreference[aug.statType] += 0.2;
  }
  
  // 레벨업 화면 닫기
  document.getElementById('levelUpScreen').classList.add('hidden');
  game.isPaused = false;
}

function gameOver() {
  alert(`게임 오버! 레벨: ${player.level}, 생존 시간: ${Math.floor(game.time)}초`);
  location.reload();
}

// ========================================
// 렌더링
// ========================================
function drawMap() {
  // 맵 배경
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // 맵 경계선 (화면에 보이는 부분만)
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  
  const mapScreen = worldToScreen(0, 0);
  const mapEndScreen = worldToScreen(MAP_SIZE, MAP_SIZE);
  
  ctx.strokeRect(
    mapScreen.x,
    mapScreen.y,
    mapEndScreen.x - mapScreen.x,
    mapEndScreen.y - mapScreen.y
  );
  
  // 그리드 (옵션)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  
  const gridSize = 100;
  const startX = Math.floor((camera.x - GAME_WIDTH / 2) / gridSize) * gridSize;
  const endX = Math.ceil((camera.x + GAME_WIDTH / 2) / gridSize) * gridSize;
  const startY = Math.floor((camera.y - GAME_HEIGHT / 2) / gridSize) * gridSize;
  const endY = Math.ceil((camera.y + GAME_HEIGHT / 2) / gridSize) * gridSize;
  
  for (let x = startX; x <= endX; x += gridSize) {
    const screenPos = worldToScreen(x, 0);
    ctx.beginPath();
    ctx.moveTo(screenPos.x, 0);
    ctx.lineTo(screenPos.x, GAME_HEIGHT);
    ctx.stroke();
  }
  
  for (let y = startY; y <= endY; y += gridSize) {
    const screenPos = worldToScreen(0, y);
    ctx.beginPath();
    ctx.moveTo(0, screenPos.y);
    ctx.lineTo(GAME_WIDTH, screenPos.y);
    ctx.stroke();
  }
}

// ========================================
// 무기 효과 렌더링
// ========================================
function drawWeaponEffects() {
  // 지뢰
  for (const mine of mines) {
    const screenPos = worldToScreen(mine.x, mine.y);
    const alpha = Math.max(0.3, 1 - mine.age / mine.lifetime);
    
    ctx.fillStyle = mine.isEvolved ? `rgba(255, 100, 0, ${alpha})` : `rgba(255, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 폭발 범위 표시
    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, mine.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 화염 패치
  for (const fire of firePatches) {
    const screenPos = worldToScreen(fire.x, fire.y);
    const alpha = Math.max(0.3, 1 - fire.age / fire.duration);
    
    // 불꽃 효과
    ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, fire.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, fire.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 드론
  for (const drone of drones) {
    const screenPos = worldToScreen(drone.x, drone.y);
    
    ctx.fillStyle = drone.isEvolved ? '#ffd700' : '#00ffff';
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(drone.angle * 2);
    
    // 회전 날 모양
    ctx.beginPath();
    ctx.moveTo(drone.size, 0);
    ctx.lineTo(0, drone.size * 0.5);
    ctx.lineTo(-drone.size, 0);
    ctx.lineTo(0, -drone.size * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  // 페로몬 폭탄
  for (const bomb of pheromones) {
    const screenPos = worldToScreen(bomb.x, bomb.y);
    const pulseScale = 1 + Math.sin(bomb.age * 10) * 0.2;
    
    ctx.fillStyle = bomb.isEvolved ? 'rgba(255, 0, 255, 0.5)' : 'rgba(255, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 10 * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    
    // 유인 범위
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, bomb.attractRadius * pulseScale, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 번개
  for (const lightning of lightnings) {
    ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    
    for (let i = 0; i < lightning.targets.length - 1; i++) {
      const from = worldToScreen(lightning.targets[i].x, lightning.targets[i].y);
      const to = worldToScreen(lightning.targets[i + 1].x, lightning.targets[i + 1].y);
      
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
  }
  
  // 디스크
  for (const disk of disks) {
    const screenPos = worldToScreen(disk.x, disk.y);
    
    ctx.fillStyle = disk.isEvolved ? '#ff00ff' : '#00ffff';
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(disk.age * 10);
    
    // 디스크 모양
    ctx.beginPath();
    ctx.arc(0, 0, disk.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, disk.size, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 독구름
  for (const cloud of poisonClouds) {
    const screenPos = worldToScreen(cloud.x, cloud.y);
    const alpha = Math.max(0.2, 1 - cloud.age / cloud.duration);
    
    ctx.fillStyle = cloud.isEvolved ? `rgba(100, 0, 150, ${alpha * 0.5})` : `rgba(0, 255, 0, ${alpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 충격파
  for (const wave of shockwaves) {
    const screenPos = worldToScreen(wave.x, wave.y);
    const alpha = 1 - wave.age / wave.lifetime;
    
    ctx.strokeStyle = wave.isEvolved ? `rgba(255, 100, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlayer() {
  const screenPos = worldToScreen(player.x, player.y);
  
  // 플레이어 몸체
  ctx.fillStyle = '#4080ff';
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y, player.size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // 방향 표시 (화살표)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y);
  ctx.lineTo(
    screenPos.x + Math.cos(player.facingAngle) * player.size / 2,
    screenPos.y + Math.sin(player.facingAngle) * player.size / 2
  );
  ctx.stroke();
}

function drawEnemies() {
  for (const enemy of enemies) {
    const screenPos = worldToScreen(enemy.x, enemy.y);
    
    // 적 몸체
    ctx.fillStyle = enemy.type.color;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, enemy.type.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 보스 테두리
    if (enemy.isBoss) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // 체력바
    const barWidth = enemy.type.size;
    const barHeight = 4;
    const healthPercent = enemy.health / enemy.maxHealth;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - enemy.type.size / 2 - 8, barWidth, barHeight);
    
    ctx.fillStyle = '#0f0';
    ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - enemy.type.size / 2 - 8, barWidth * healthPercent, barHeight);
  }
}

function drawProjectiles() {
  // 플레이어 투사체
  ctx.fillStyle = '#ffff00';
  for (const proj of projectiles) {
    const screenPos = worldToScreen(proj.x, proj.y);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, proj.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 적 투사체
  ctx.fillStyle = '#ff0000';
  for (const proj of enemyProjectiles) {
    const screenPos = worldToScreen(proj.x, proj.y);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, proj.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExpOrbs() {
  ctx.fillStyle = '#00ff00';
  for (const orb of expOrbs) {
    const screenPos = worldToScreen(orb.x, orb.y);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, orb.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 테두리
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function render() {
  // 화면 지우기
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // 렌더링 순서
  drawMap();
  drawWeaponEffects(); // 무기 효과 렌더링 추가 (가장 먼저)
  drawExpOrbs();
  drawEnemies();
  drawProjectiles();
  drawPlayer();
  
  // 디버그 정보
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText(`플레이어: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 10, 20);
  ctx.fillText(`FPS: ${currentFPS}`, 10, 40);
  ctx.fillText(`적: ${enemies.length}`, 10, 60);
  ctx.fillText(`게임 시간: ${Math.floor(game.time)}초`, 10, 80);
}

// ========================================
// UI 업데이트
// ========================================
function updateUI() {
  // 체력바
  const healthPercent = (player.health / (player.maxHealth + player.statBonuses.maxHealthBonus)) * 100;
  document.getElementById('healthFill').style.width = `${healthPercent}%`;
  document.getElementById('healthText').textContent = `${Math.floor(player.health)}/${player.maxHealth + player.statBonuses.maxHealthBonus}`;
  
  // 경험치바
  const expPercent = (player.exp / player.expToNextLevel) * 100;
  document.getElementById('expFill').style.width = `${expPercent}%`;
  document.getElementById('levelText').textContent = `레벨 ${player.level}`;
  
  // 증강 슬롯 업데이트
  const slots = document.querySelectorAll('.augment-slot');
  player.augments.forEach((aug, index) => {
    if (index < 5 && slots[index]) {
      const augmentData = AUGMENT_TYPES[aug.id];
      const isEvolved = aug.level >= augmentData.evolveLevel;
      const isMaxed = aug.level >= augmentData.maxLevel;
      
      slots[index].classList.add('active');
      slots[index].innerHTML = `
        <div style="font-size: 24px;">${augmentData.icon}</div>
        <div style="font-size: 10px; margin-top: 2px;">${aug.level}${isMaxed ? '★' : ''}</div>
      `;
      
      if (isEvolved) {
        slots[index].style.borderColor = '#ffd700';
        slots[index].style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
      }
    }
  });
}

// ========================================
// 게임 루프
// ========================================
let lastTime = performance.now();
let fpsFrames = 0;
let fpsTime = 0;
let currentFPS = 60;

function gameLoop(currentTime) {
  // deltaTime 계산 (초 단위)
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // 최대 0.1초로 제한
  lastTime = currentTime;
  
  // FPS 계산
  fpsFrames++;
  fpsTime += deltaTime;
  if (fpsTime >= 1.0) {
    currentFPS = Math.round(fpsFrames / fpsTime);
    fpsFrames = 0;
    fpsTime = 0;
  }
  
  // 게임이 일시정지 상태가 아닐 때만 업데이트
  if (!game.isPaused) {
    game.time += deltaTime;
    
    // 업데이트
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateProjectiles(deltaTime);
    updateExpOrbs(deltaTime);
    updateEnemySpawning(deltaTime);
    updateWeaponAugments(deltaTime); // 무기 증강 업데이트 추가
    updateCamera();
    
    // UI 업데이트
    updateUI();
  }
  
  // 렌더링 (항상 실행)
  render();
  
  // 다음 프레임 요청
  requestAnimationFrame(gameLoop);
}

// ========================================
// 게임 시작
// ========================================
console.log('Mushi Breaker 게임 시작!');
requestAnimationFrame(gameLoop);
