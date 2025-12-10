// ========================================
// Mushi Breaker - 메인 게임 루프
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');

// 화면 스케일 정보
let canvasScale = 1;

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
  
  // 스케일 비율 저장 (마우스 이벤트 변환용)
  canvasScale = newWidth / GAME_WIDTH;
  
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
    checkPlayerEnemyCollision();
    checkProjectileCollisions();
    checkEnemyProjectileCollisions();
    checkExpOrbPickup();
    
    updateUI();
    
    // 게임 클리어 체크 (공원 맵만)
    if (game.currentMap === 'park') {
      if (game.bossKillCount >= 6 && !game.isCleared) {
        game.isCleared = true;
        game.isPaused = true;
        showVictoryScreen();
      }
    }
  }
  
  render();
  
  requestAnimationFrame(gameLoop);
}

console.log('Mushi Breaker 게임 시작!');
requestAnimationFrame(gameLoop);
