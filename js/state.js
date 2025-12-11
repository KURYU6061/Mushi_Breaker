// ========================================
// Mushi Breaker - 게임 상태 관리
// ========================================

// 입력 관리
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  // 화살표 키 지원
  if (e.key === 'ArrowUp') keys['w'] = true;
  if (e.key === 'ArrowDown') keys['s'] = true;
  if (e.key === 'ArrowLeft') keys['a'] = true;
  if (e.key === 'ArrowRight') keys['d'] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  // 화살표 키 지원
  if (e.key === 'ArrowUp') keys['w'] = false;
  if (e.key === 'ArrowDown') keys['s'] = false;
  if (e.key === 'ArrowLeft') keys['a'] = false;
  if (e.key === 'ArrowRight') keys['d'] = false;
});

// 게임 상태
const game = {
  isPaused: true,
  time: 0,
  spawnTimer: 0,
  spawnInterval: 2.0,
  bossTimer: 0,
  nextBossTime: 60,
  rerollsLeft: 1,
  bossWarning: false,
  bossWarningTimer: 0,
  bossAlive: false,
  bossKillCount: 0, // 보스 처치 횟수
  isCleared: false, // 게임 클리어 여부
  currentMap: 'park', // 현재 맵 ID
  lastSurroundTime: 0 // 마지막 포위 공격 시간 (도시 맵용)
};

// 플레이어
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
  facingAngle: 0,
  attackDamage: 20,
  attackSpeed: 1.0,
  attackTimer: 0,
  projectileSpeed: 400,
  color: '#4080ff',
  image: null, // 캠릭터 이미지 경로
  imageObj: null, // 로드된 이미지 객체
  invincibleTime: 0, // 무적 시간 (1초)
  
  augments: [{ id: 'MACHINE_GUN', level: 1 }],
  selectedStats: [], // 선택된 스텟 증강 기록
  statLevels: {}, // 각 스텟 타입별 레벨 (attackSpeed: 3, attackPower: 5 등)
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
  
  statPreference: {},
  rerollCount: 0,
  canReroll: true,
};

// 게임 오브젝트 배열
const enemies = [];
const projectiles = [];
const enemyProjectiles = [];
const expOrbs = [];
const dropItems = []; // 드롭 아이템 배열 추가

// 무기 전용 오브젝트 배열
const mines = [];
const explosions = []; // 폭발 이펙트 배열
const firePatches = [];
const drones = [];
const pheromones = [];
const lightnings = [];
const disks = [];
const poisonClouds = [];
const shockwaves = [];
const fireParticles = []; // 화염 파티클 배열

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

// 플레이어 이동 거리 추적
let playerDistanceTraveled = 0;

// 카메라
const camera = {
  x: player.x,
  y: player.y,
};

// FPS 추적
let lastTime = performance.now();
let fpsFrames = 0;
let fpsTime = 0;
let currentFPS = 60;
