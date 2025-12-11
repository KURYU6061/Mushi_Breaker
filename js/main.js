// ========================================
// Mushi Breaker - 메인 게임 루프
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');

// 화면 스케일 정보
let canvasScale = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

// 마우스 좌표를 게임 좌표로 변환하는 헬퍼 함수
function getGameCoordinates(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME_WIDTH / rect.width;
  const scaleY = GAME_HEIGHT / rect.height;
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

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
  
  // CSS 크기 설정
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
  
  // Canvas 내부 해상도는 고정 (픽셀 퍼펙트 유지)
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  
  // 스케일 비율 및 오프셋 저장 (마우스 이벤트 변환용)
  canvasScale = newWidth / GAME_WIDTH;
  const rect = canvas.getBoundingClientRect();
  canvasOffsetX = rect.left;
  canvasOffsetY = rect.top;
  
  // 오버레이도 Canvas와 동일한 크기로 조정
  if (canvasOverlay) {
    canvasOverlay.style.width = `${newWidth}px`;
    canvasOverlay.style.height = `${newHeight}px`;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;
  
  fpsFrames++;
  fpsTime += deltaTime;
  if (fpsTime >= 1.0) {
    currentFPS = Math.round(fpsFrames / fpsTime);
    fpsFrames = 0;
    fpsTime = 0;
  }
  
  // 메뉴 화면에서는 게임 로직 실행 안 함
  if (typeof menuState !== 'undefined' && menuState.isShowingMenu) {
    render();
    requestAnimationFrame(gameLoop);
    return;
  }
  
  if (!game.isPaused) {
    game.time += deltaTime;
    
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateProjectiles(deltaTime);
    updateExpOrbs(deltaTime);
    updateEnemySpawning(deltaTime);
    updateWeaponAugments(deltaTime);
    updateCamera();
    
    separateEnemies(deltaTime);
    checkPlayerEnemyCollision(deltaTime);
    checkProjectileCollisions();
    checkEnemyProjectileCollisions();
    checkExpOrbPickup();
    
    updateUI();
    
    // 게임 클리어 체크 (공원, 도시 맵)
    if (game.currentMap === 'park' || game.currentMap === 'city') {
      if (game.bossKillCount >= 6 && !game.isCleared) {
        game.isCleared = true;
        game.isPaused = true;
        showVictoryScreen();
      }
    }
    
    // 게임 오버 체크 (체력 0 이하)
    if (player.health <= 0) {
      game.isPaused = true;
      showGameOverScreen();
    }
  }
  
  render();
  
  requestAnimationFrame(gameLoop);
}

// 게임 루프는 loader.js의 initGame()에서 시작됨
console.log('Mushi Breaker ready!');
