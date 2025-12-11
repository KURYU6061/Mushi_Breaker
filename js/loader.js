// ========================================
// Mushi Breaker - 리소스 로더
// ========================================

const imageAssets = {
  // UI 이미지
  ui: [
    'img/ui/MB_Title.png',
    'img/ui/mapSelect.png',
    'img/ui/chSelect.png',
    'img/ui/title_gstart.png',
    'img/ui/title_gIndex.png',
    'img/ui/back.png'
  ],
  // 맵 이미지
  maps: [
    'img/map/park.png',
    'img/map/ruins.png',
    'img/map/forest.png'
  ],
  // 플레이어 이미지
  player: [
    'img/player/hunter_Stand.png',
    'img/player/hunter_Play.png',
    'img/player/fireman_Stand.png',
    'img/player/fireman_Play.png',
    'img/player/criminal_Stand.png',
    'img/player/criminal_Play.png'
  ]
};

// 모든 이미지 경로를 하나의 배열로
const allImagePaths = [
  ...imageAssets.ui,
  ...imageAssets.maps,
  ...imageAssets.player
];

let loadedImages = 0;
const totalImages = allImagePaths.length;
const loadedImageCache = {};

// 이미지 로딩 함수
function preloadImages() {
  return new Promise((resolve, reject) => {
    if (totalImages === 0) {
      resolve();
      return;
    }

    allImagePaths.forEach(path => {
      const img = new Image();
      
      img.onload = () => {
        loadedImages++;
        loadedImageCache[path] = img;
        updateLoadingProgress();
        
        if (loadedImages === totalImages) {
          resolve();
        }
      };
      
      img.onerror = () => {
        console.warn(`Failed to load image: ${path}`);
        loadedImages++;
        updateLoadingProgress();
        
        if (loadedImages === totalImages) {
          resolve(); // 일부 이미지 실패해도 계속 진행
        }
      };
      
      img.src = path;
    });
  });
}

// 로딩 진행도 업데이트
function updateLoadingProgress() {
  const progress = Math.floor((loadedImages / totalImages) * 100);
  const loadingBar = document.getElementById('loadingBar');
  const loadingText = document.getElementById('loadingText');
  
  if (loadingBar) {
    loadingBar.style.width = progress + '%';
  }
  
  if (loadingText) {
    loadingText.textContent = `Loading... ${progress}%`;
  }
}

// 로딩 화면 숨기기
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// 게임 시작 (모든 리소스 로드 후)
async function initGame() {
  try {
    await preloadImages();
    
    // 로딩 완료 후 잠깐 대기
    await new Promise(resolve => setTimeout(resolve, 300));
    
    hideLoadingScreen();
    
    // 게임 루프 시작
    if (typeof gameLoop === 'function') {
      requestAnimationFrame(gameLoop);
    }
    
    console.log('All assets loaded successfully!');
  } catch (error) {
    console.error('Error loading assets:', error);
    hideLoadingScreen(); // 에러가 있어도 게임은 시작
  }
}

// 페이지 로드 완료 시 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
