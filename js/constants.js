// ========================================
// Mushi Breaker - 상수 정의
// ========================================

// 게임 해상도
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// 맵 설정
const MAP_SIZE = 3000;

// 플레이어 설정
const PLAYER_SPEED = 200;
const PLAYER_SIZE = 30;
const PICKUP_RANGE = 60; // 기본 획듍 범위 축소
const ENEMY_DETECT_RANGE = 400; // 적 인식 범위

// 증강 시스템 정의
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
      attackSpeedBonus: 0.5 * level,
      bulletCount: 1 + Math.floor(level / 2), // 2레벨마다 +1 (최대 8발)
      damage: 20 + level * 5, // 레벨당 피해량 증가
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5, // 해당 스텟 5레벨 필요
    evolvedName: '헤비 발간',
    evolvedDesc: '총알이 적을 관통하며 엄청난 속도로 발사',
  },
  
  PROXIMITY_MINE: {
    id: 'PROXIMITY_MINE',
    name: '근접 지뢰',
    desc: '적에 닿으면 폭발하는 지뢰 설치',
    icon: '💣',
    statType: 'attackPower',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      mineDamage: 80 + level * 30, // 크게 증가
      mineCount: 1 + Math.floor(level / 2), // 2레벨마다 +1
      explosionRadius: 100 + level * 10, // 폭발 범위 증가
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '연쇄 폭발물',
    evolvedDesc: '지뢰가 터지면 주변에 2차, 3차 연쇄 폭발 발생',
  },
  
  FLAMETHROWER: {
    id: 'FLAMETHROWER',
    name: '화염방사기',
    desc: '바닥에 불을 질러 지속 피해',
    icon: '🔥',
    statType: 'attackRange',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      fireDamage: 15 + level * 5, // 피해량 증가
      fireRange: 120 + level * 25, // 범위 증가
      fireDuration: 3 + level * 0.4, // 지속시간 증가
      fireCount: 1 + Math.floor(level / 4), // 4레벨마다 패치 +1
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '인페르노 존',
    evolvedDesc: '불길이 넓어지며 불타는 적이 죽을 때 불을 전이',
  },
  
  BLADE_DRONE: {
    id: 'BLADE_DRONE',
    name: '회전 칼날 드론',
    desc: '플레이어 주변을 도는 방어형 드론',
    icon: '⚙️',
    statType: 'pickupRange',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      droneDamage: 25 + level * 8, // 피해량 증가
      droneCount: 1 + Math.floor(level / 3), // 3레벨마다 +1
      droneRadius: 90 + level * 12, // 반경 증가
      droneSpeed: 2 + level * 0.3, // 회전 속도 증가
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '믹서기 드론',
    evolvedDesc: '드론이 적을 끌어당기며 갈아버림',
  },
  
  PHEROMONE_BOMB: {
    id: 'PHEROMONE_BOMB',
    name: '페로몬 유도탄',
    desc: '벌레를 유인하고 일정 시간 뒤 폭발',
    icon: '💥',
    statType: 'maxHealth',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      explosionDamage: 120 + level * 40, // 폭발량 크게 증가
      attractRadius: 250 + level * 25, // 유인 범위 증가
      bombCount: 1 + Math.floor(level / 5), // 5레벨마다 +1
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '여왕벌의 둥지',
    evolvedDesc: '거대 아군 벌레가 나와 적을 도발하고 파괴 시 맹독 살포',
  },
  
  ELECTRIC_CHAIN: {
    id: 'ELECTRIC_CHAIN',
    name: '전격 체인',
    desc: '랜덤한 적에게 번개를 떨어뜨리고 전이',
    icon: '⚡',
    statType: 'cooldown',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      lightningDamage: 50 + level * 15, // 피해량 크게 증가
      chainCount: 3 + Math.floor(level / 2), // 2레벨마다 +1 연쇄
      strikeCount: 1 + Math.floor(level / 5), // 5레벨마다 동시 번개 +1
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '뇌운',
    evolvedDesc: '머리 위 먹구름이 끝임없이 베락 발사',
  },
  
  RICOCHET_DISK: {
    id: 'RICOCHET_DISK',
    name: '리코셸 디스크',
    desc: '벽에 튜기는 원반을 던짐',
    icon: '🪃',
    statType: 'projectileSpeed',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      diskDamage: 40 + level * 12, // 피해량 증가
      bounceCount: 4 + Math.floor(level / 2), // 2레벨마다 튜기기 +1
      diskCount: 1 + Math.floor(level / 4), // 4레벨마다 디스크 +1
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '절단기 폭풍',
    evolvedDesc: '디스크가 튜길 때마다 분열하여 화면을 뒤덮음',
  },
  
  POISON_SPRAY: {
    id: 'POISON_SPRAY',
    name: '독가스 분무기',
    desc: '지나간 자리에 독구름을 남김',
    icon: '☠️',
    statType: 'duration',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      poisonDamage: 8 + level * 3, // 피해량 증가
      cloudDuration: 4 + level * 0.6, // 지속시간 증가
      cloudRadius: 50 + level * 5, // 범위 증가
      cloudInterval: Math.max(0.3, 1 - level * 0.05), // 생성 주기 감소
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '바이오하자드',
    evolvedDesc: '독구름이 오라가 되며 적을 느리게 하고 방어력 0',
  },
  
  STOMP_BOOTS: {
    id: 'STOMP_BOOTS',
    name: '스텀프 부츠',
    desc: '일정 거리 이동 시 충격파 발생',
    icon: '👢',
    statType: 'moveSpeed',
    maxLevel: 15,
    isWeapon: true,
    effect: (level) => ({
      shockDamage: 60 + level * 20, // 피해량 증가
      shockRadius: 80 + level * 15, // 범위 증가
      shockKnockback: 30 + level * 5, // 넘백 증가
    }),
    evolveLevel: 7,
    evolveStatRequirement: 5,
    evolvedName: '지진 발생기',
    evolvedDesc: '이동 시 때이 갈라지며 지진 발생',
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

// 적 타입 정의
const ENEMY_TYPES = {
  // 초반 적 - 초반 1분 전용
  LARVA: {
    name: '유충',
    color: '#90EE90',
    size: 20,
    speed: 60,
    health: 15,
    damage: 5,
    exp: 5,
    knockback: 20,
    knockbackResist: 0, // 넉백 저항 0%
    behavior: 'chase',
  },
  
  LOCUST: {
    name: '메뚚기',
    color: '#8B4513',
    size: 25,
    speed: 120,
    health: 50,
    damage: 10,
    exp: 10,
    knockback: 15,
    knockbackResist: 0.1, // 넉백 저항 10%
    behavior: 'chase',
  },
  
  HORNET: {
    name: '말벌',
    color: '#FFD700',
    size: 20,
    speed: 100,
    health: 30,
    damage: 15,
    exp: 15,
    knockback: 10,
    knockbackResist: 0, // 넉백 저항 0%
    behavior: 'ranged',
    attackRange: 300,
    attackCooldown: 2.0,
  },
  
  BEETLE: {
    name: '딱정벌레',
    color: '#2F4F2F',
    size: 35,
    speed: 70,
    health: 300,
    damage: 20,
    exp: 25,
    knockback: 8,
    knockbackResist: 0.8, // 넉백 저항 80% - 움직이는 벽
    behavior: 'chase',
  },
  
  SCORPION: {
    name: '전갈',
    color: '#8B0000',
    size: 30,
    speed: 150,
    health: 150,
    damage: 25,
    exp: 30,
    knockback: 12,
    knockbackResist: 0.3, // 넉백 저항 30%
    behavior: 'chase',
  },
  
  MANTIS: {
    name: '사마귀',
    color: '#00FF00',
    size: 60,
    speed: 110,
    health: 7500,
    damage: 40,
    exp: 200,
    knockback: 0,
    knockbackResist: 1.0, // 넉백 면역
    isBoss: true,
    behavior: 'boss',
  },
};
