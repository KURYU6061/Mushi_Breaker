// ========================================
// Mushi Breaker - 메뉴 시스템
// ========================================

// 이미지 로드
const menuImages = {
  title: new Image(),
  mapSelect: new Image(),
  characterSelect: new Image()
};

menuImages.title.src = 'img/ui/MB_Title.png';
menuImages.mapSelect.src = 'img/ui/mapSelect.png';
menuImages.characterSelect.src = 'img/ui/chSelect.png';

const menuState = {
  currentScreen: 'title', // 'title', 'mapSelect', 'characterSelect'
  isShowingMenu: true,
  showingLanguageModal: false,
  showingGuideModal: false,
  selectedGuideIndex: 0,
  selectedMap: null,
  selectedCharacter: null,
  characterScrollOffset: 0,
  guideScrollOffset: 0
};

const maps = [
  {
    id: 'park',
    nameKR: '공원',
    nameEN: 'Park',
    color: '#7cb342',
    bgColor: '#a5d6a7',
    gridColor: '#81c784'
  },
  {
    id: 'city',
    nameKR: '도시',
    nameEN: 'City',
    color: '#757575',
    bgColor: '#9e9e9e',
    gridColor: '#bdbdbd'
  },
  {
    id: 'forest',
    nameKR: '숲속',
    nameEN: 'Forest',
    color: '#558b2f',
    bgColor: '#689f38',
    gridColor: '#7cb342'
  }
];

const characters = [
  {
    id: 'poacher',
    nameKR: '밀렵꾼',
    nameEN: 'Poacher',
    color: '#4080ff',
    image: 'img/player/hunter_Play.png',
    weapon: 'MACHINE_GUN',
    specialty: 'attackSpeed',
    specialtyKR: '공격 속도',
    specialtyEN: 'Attack Speed',
    bonuses: {
      attackSpeedMult: 1.2
    }
  },
  {
    id: 'arsonist',
    nameKR: '방화범',
    nameEN: 'Arsonist',
    color: '#ff4444',
    image: 'img/player/fireman_Play.png',
    weapon: 'FLAMETHROWER',
    specialty: 'attackRange',
    specialtyKR: '공격 범위',
    specialtyEN: 'Attack Range',
    bonuses: {
      attackRangeMult: 1.2
    }
  },
  {
    id: 'criminal',
    nameKR: '범죄자',
    nameEN: 'Criminal',
    color: '#ff8800',
    image: 'img/player/criminal_Play.png',
    weapon: 'ELECTRIC_CHAIN',
    specialty: 'pickupRange',
    specialtyKR: '획득 범위',
    specialtyEN: 'Pickup Range',
    bonuses: {
      pickupRangeMult: 1.2
    }
  }
];

const translations = {
  KR: {
    title: "Mushi Breaker!",
    startButton: "게임 시작",
    languageButton: "언어 선택",
    guideButton: "게임 설명",
    languageModalTitle: "언어 선택",
    guideModalTitle: "게임 가이드",
    guideItems: [
      {
        title: "게임 목적",
        content: "갑자기 불어난 거대화 벌레들로 인하여 나라가 마비될 정도의 위험에 처했다.\n적들을 처치하여 경험을 쌓고 무기를 강화하세요!"
      },
      {
        title: "게임 방식",
        content: "적들을 처치할때 나오는 경험치를 획득, 레벨을 올려 증강을 획득합니다.\n증강으로 무기를 강화하거나 스탯을 올려서 더욱 더 강한 적들에 대비하세요.\n보스는 1분마다 스폰되고 총 6번의 보스 웨이브를 클리어 하여야합니다."
      },
      {
        title: "속사 기관총",
        content: "빠른 연사 속도로 다수의 탄환을 발사합니다.\n진화 시 탄환이 관통 능력을 얻어 여러 적을 동시에 공격할 수 있습니다."
      },
      {
        title: "근접 지뢰",
        content: "지면에 지뢰를 설치하여 접근하는 적을 폭파시킵니다.\n진화 시 폭발이 연쇄적으로 일어나 더 넓은 범위를 공격합니다."
      },
      {
        title: "화염 방사기",
        content: "전방에 화염을 발사하여 지속 피해를 입힙니다.\n진화 시 적이 죽을 때 화염이 퍼져 주변 적도 공격합니다."
      },
      {
        title: "블레이드 드론",
        content: "플레이어 주변을 공전하며 적을 베는 드론을 소환합니다.\n진화 시 적을 빨아들이는 진공 효과가 추가됩니다."
      },
      {
        title: "페로몬 폭탄",
        content: "적을 유인한 후 폭발하는 페로몬 폭탄을 투척합니다.\n진화 시 여러 방향으로 연쇄 폭발을 일으킵니다."
      },
      {
        title: "전기 체인",
        content: "가장 가까운 적에게 전기를 발사하여 주변으로 연쇄 공격합니다.\n진화 시 발사 속도가 4배 증가합니다."
      },
      {
        title: "리코셰 디스크",
        content: "벽에 튕기며 날아가는 디스크를 발사합니다.\n진화 시 디스크가 분열하여 더 많은 적을 공격합니다."
      },
      {
        title: "독 스프레이",
        content: "독구름을 남기며 이동하여 지속 피해를 입힙니다.\n진화 시 플레이어 주변에 독 오라가 생기고 적의 이동 속도를 감소시킵니다."
      },
      {
        title: "스톰프 부츠",
        content: "이동 거리에 따라 충격파를 발생시켜 주변 적을 공격합니다.\n진화 시 충격파 발생 빈도가 2배 증가합니다."
      }
    ]
  },
  EN: {
    title: "Mushi Breaker!",
    startButton: "Start Game",
    languageButton: "Language",
    guideButton: "Game Guide",
    languageModalTitle: "Select Language",
    guideModalTitle: "Game Guide",
    guideItems: [
      {
        title: "Game Objective",
        content: "Giant mutated insects have caused a national crisis.\nDefeat enemies to gain experience and upgrade your weapons!"
      },
      {
        title: "Gameplay",
        content: "Collect experience orbs from defeated enemies to level up and gain augments.\nUse augments to upgrade weapons or boost stats to prepare for stronger enemies.\nBosses spawn every minute, and you must clear 6 boss waves to win."
      },
      {
        title: "Machine Gun",
        content: "Fires rapid bullets at enemies.\nWhen evolved, bullets pierce through multiple enemies."
      },
      {
        title: "Proximity Mine",
        content: "Places mines on the ground that explode when enemies approach.\nWhen evolved, explosions chain react for wider area damage."
      },
      {
        title: "Flamethrower",
        content: "Shoots flames forward dealing damage over time.\nWhen evolved, flames spread to nearby enemies on death."
      },
      {
        title: "Blade Drone",
        content: "Summons drones that orbit and slash enemies.\nWhen evolved, adds vacuum effect to pull enemies closer."
      },
      {
        title: "Pheromone Bomb",
        content: "Throws bombs that attract then explode on enemies.\nWhen evolved, creates multiple explosions in different directions."
      },
      {
        title: "Electric Chain",
        content: "Shoots lightning at the nearest enemy that chains to others.\nWhen evolved, firing rate increases by 4x."
      },
      {
        title: "Ricochet Disk",
        content: "Fires disks that bounce off walls.\nWhen evolved, disks split to hit more enemies."
      },
      {
        title: "Poison Spray",
        content: "Leaves poison clouds while moving that deal damage over time.\nWhen evolved, creates poison aura around player and slows enemies."
      },
      {
        title: "Stomp Boots",
        content: "Creates shockwaves based on distance traveled.\nWhen evolved, shockwave frequency doubles."
      }
    ]
  }
};

let currentLanguage = 'KR';

function drawMenu() {
  if (menuState.currentScreen === 'title') {
    hideBackButton(); // 타이틀 화면에서는 뒤로가기 버튼 숨김
    hideCharacterButtons(); // 캐릭터 버튼 숨김
    drawTitleScreen();
  } else if (menuState.currentScreen === 'mapSelect') {
    hideTitleButtons(); // 맵 선택 화면에서는 버튼 숨김
    hideCharacterButtons(); // 캐릭터 버튼 숨김
    drawMapSelectScreen();
  } else if (menuState.currentScreen === 'characterSelect') {
    hideTitleButtons(); // 캐릭터 선택 화면에서는 버튼 숨김
    drawCharacterSelectScreen();
  }
  
  // 모달들은 어느 화면에서든 표시
  if (menuState.showingLanguageModal) {
    drawLanguageModal();
  }
  
  if (menuState.showingGuideModal) {
    drawGuideModal();
  }
}

function drawTitleScreen() {
  const t = translations[currentLanguage];
  
  // 배경 이미지
  if (menuImages.title.complete) {
    ctx.drawImage(menuImages.title, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  } else {
    // 이미지 로딩 중일 때 기본 배경
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 타이틀
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.title, GAME_WIDTH / 2, 150);
  }
  
  // DOM 버튼 표시 (Canvas 버튼 대신 이미지 버튼 사용)
  showTitleButtons();
}

function drawMapSelectScreen() {
  // 배경 이미지
  if (menuImages.mapSelect.complete) {
    ctx.drawImage(menuImages.mapSelect, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  } else {
    // 이미지 로딩 중일 때 기본 배경
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 제목
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentLanguage === 'KR' ? 'MAP SELECT' : 'MAP SELECT', GAME_WIDTH / 2, 80);
  }
  
  // 뒤로가기 버튼 표시
  showBackButton();
  
  // 맵 선택 카드들
  const cardWidth = 340;
  const cardHeight = 320;
  const cardSpacing = 60;
  const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
  const startX = (GAME_WIDTH - totalWidth) / 2;
  const cardY = 200;
  
  for (let i = 0; i < maps.length; i++) {
    const map = maps[i];
    const x = startX + i * (cardWidth + cardSpacing);
    
    // 카드 배경 (투명)
    // ctx.fillStyle = map.bgColor;
    // ctx.fillRect(x, cardY, cardWidth, cardHeight);
    
    // 카드 테두리 (투명)
    // ctx.strokeStyle = '#ffffff';
    // ctx.lineWidth = 3;
    // ctx.strokeRect(x, cardY, cardWidth, cardHeight);
    
    // 맵 미리보기 (작은 그리드) (투명)
    // ctx.fillStyle = map.color;
    // ctx.fillRect(x + 20, cardY + 20, cardWidth - 40, 200);
    
    // 그리드 라인 (투명)
    // ctx.strokeStyle = map.gridColor;
    // ctx.lineWidth = 1;
    // for (let gx = 0; gx < 5; gx++) {
    //   const lineX = x + 20 + (gx * (cardWidth - 40) / 4);
    //   ctx.beginPath();
    //   ctx.moveTo(lineX, cardY + 20);
    //   ctx.lineTo(lineX, cardY + 220);
    //   ctx.stroke();
    // }
    // for (let gy = 0; gy < 5; gy++) {
    //   const lineY = cardY + 20 + (gy * 200 / 4);
    //   ctx.beginPath();
    //   ctx.moveTo(x + 20, lineY);
    //   ctx.lineTo(x + cardWidth - 20, lineY);
    //   ctx.stroke();
    // }
    
    // 맵 이름 (투명)
    // ctx.fillStyle = '#ffffff';
    // ctx.font = 'bold 32px Arial';
    // ctx.textAlign = 'center';
    // ctx.fillText(currentLanguage === 'KR' ? map.nameKR : map.nameEN, x + cardWidth / 2, cardY + 280);
  }
}

function drawCharacterSelectScreen() {
  // 배경 이미지
  if (menuImages.characterSelect.complete) {
    ctx.drawImage(menuImages.characterSelect, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  } else {
    // 이미지 로딩 중일 때 기본 배경
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
  
  // 제목
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(currentLanguage === 'KR' ? 'CHARACTER SELECT' : 'CHARACTER SELECT', GAME_WIDTH / 2, 80);
  
  // 뒤로가기 버튼 표시
  showBackButton();
  
  // 캐릭터 선택 DOM 버튼 표시
  showCharacterButtons();
}

function showBackButton() {
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.style.display = 'block';
  }
}

function hideBackButton() {
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.style.display = 'none';
  }
}

function showCharacterButtons() {
  const characterButtons = document.getElementById('characterSelectButtons');
  if (characterButtons) {
    characterButtons.style.display = 'flex';
  }
}

function hideCharacterButtons() {
  const characterButtons = document.getElementById('characterSelectButtons');
  if (characterButtons) {
    characterButtons.style.display = 'none';
  }
}

function drawBackButton(x, y) {
  // Canvas 뒤로가기 버튼 그리기는 이제 DOM 버튼으로 대체됨
  showBackButton();
}

function drawButton(x, y, width, height, text, color) {
  // 버튼 배경
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  
  // 버튼 테두리
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
  
  // 버튼 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
}

function drawLanguageModal() {
  const t = translations[currentLanguage];
  const modalWidth = 400;
  const modalHeight = 300;
  const modalX = GAME_WIDTH / 2 - modalWidth / 2;
  const modalY = GAME_HEIGHT / 2 - modalHeight / 2;
  
  // 반투명 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // 모달 배경
  ctx.fillStyle = '#2d2d44';
  ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
  
  // 모달 테두리
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
  
  // X 버튼
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(modalX + modalWidth - 40, modalY + 10, 30, 30);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(modalX + modalWidth - 40, modalY + 10, 30, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', modalX + modalWidth - 25, modalY + 25);
  
  // 제목
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(t.languageModalTitle, modalX + modalWidth / 2, modalY + 60);
  
  // 언어 버튼들
  const langButtonWidth = 120;
  const langButtonHeight = 50;
  const langButtonY = modalY + 130;
  
  // KR 버튼
  drawButton(modalX + 70, langButtonY, langButtonWidth, langButtonHeight, 'KR', currentLanguage === 'KR' ? '#ff6b6b' : '#666666');
  
  // EN 버튼
  drawButton(modalX + 210, langButtonY, langButtonWidth, langButtonHeight, 'EN', currentLanguage === 'EN' ? '#ff6b6b' : '#666666');
}

function drawGuideModal() {
  const t = translations[currentLanguage];
  const modalWidth = 900;
  const modalHeight = 550;
  const modalX = GAME_WIDTH / 2 - modalWidth / 2;
  const modalY = GAME_HEIGHT / 2 - modalHeight / 2;
  
  // 반투명 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // 모달 배경
  ctx.fillStyle = '#2d2d44';
  ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
  
  // 모달 테두리
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
  
  // X 버튼
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(modalX + modalWidth - 40, modalY + 10, 30, 30);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(modalX + modalWidth - 40, modalY + 10, 30, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', modalX + modalWidth - 25, modalY + 25);
  
  // 제목
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(t.guideModalTitle, modalX + modalWidth / 2, modalY + 40);
  
  // 좌측 리스트 영역
  const listWidth = 280;
  const listX = modalX + 20;
  const listY = modalY + 80;
  const listHeight = modalHeight - 100;
  
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(listX, listY, listWidth, listHeight);
  ctx.strokeStyle = '#555555';
  ctx.strokeRect(listX, listY, listWidth, listHeight);
  
  // 리스트 아이템들
  const itemHeight = 40;
  const itemPadding = 5;
  
  // 클리핑 영역 설정
  ctx.save();
  ctx.beginPath();
  ctx.rect(listX, listY, listWidth, listHeight);
  ctx.clip();
  
  for (let i = 0; i < t.guideItems.length; i++) {
    const itemY = listY + i * (itemHeight + itemPadding) - menuState.guideScrollOffset;
    
    // 보이는 영역만 그리기
    if (itemY + itemHeight < listY || itemY > listY + listHeight) continue;
    
    if (i === menuState.selectedGuideIndex) {
      ctx.fillStyle = '#4ecdc4';
    } else {
      ctx.fillStyle = '#333344';
    }
    ctx.fillRect(listX + 5, itemY + 5, listWidth - 10, itemHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.guideItems[i].title, listX + 15, itemY + itemHeight / 2 + 5);
  }
  
  ctx.restore();
  
  // 우측 내용 영역
  const contentX = listX + listWidth + 20;
  const contentY = listY;
  const contentWidth = modalWidth - listWidth - 60;
  const contentHeight = listHeight;
  
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(contentX, contentY, contentWidth, contentHeight);
  ctx.strokeStyle = '#555555';
  ctx.strokeRect(contentX, contentY, contentWidth, contentHeight);
  
  // 선택된 항목 내용
  const selectedItem = t.guideItems[menuState.selectedGuideIndex];
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(selectedItem.title, contentX + 20, contentY + 20);
  
  // 내용 텍스트 (줄바꿈 처리)
  ctx.font = '18px Arial';
  const lines = selectedItem.content.split('\n');
  let lineY = contentY + 60;
  lines.forEach(line => {
    ctx.fillText(line, contentX + 20, lineY);
    lineY += 28;
  });
}

function handleMenuClick(event) {
  if (!menuState.isShowingMenu) return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME_WIDTH / rect.width;
  const scaleY = GAME_HEIGHT / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;
  
  const t = translations[currentLanguage];
  
  // 모달이 열려있을 때
  if (menuState.showingLanguageModal) {
    handleLanguageModalClick(clickX, clickY);
    return;
  }
  
  if (menuState.showingGuideModal) {
    handleGuideModalClick(clickX, clickY, t);
    return;
  }
  
  // 화면별 클릭 처리
  if (menuState.currentScreen === 'title') {
    handleTitleScreenClick(clickX, clickY, t);
  } else if (menuState.currentScreen === 'mapSelect') {
    handleMapSelectClick(clickX, clickY);
  } else if (menuState.currentScreen === 'characterSelect') {
    handleCharacterSelectClick(clickX, clickY);
  }
}

function handleLanguageModalClick(clickX, clickY) {
  const modalWidth = 400;
  const modalHeight = 300;
  const modalX = GAME_WIDTH / 2 - modalWidth / 2;
  const modalY = GAME_HEIGHT / 2 - modalHeight / 2;
  
  // X 버튼 클릭
  if (clickX >= modalX + modalWidth - 40 && clickX <= modalX + modalWidth - 10 &&
      clickY >= modalY + 10 && clickY <= modalY + 40) {
    menuState.showingLanguageModal = false;
    showTitleButtons();
    return;
  }
  
  // KR 버튼
  const langButtonY = modalY + 130;
  if (clickX >= modalX + 70 && clickX <= modalX + 190 &&
      clickY >= langButtonY && clickY <= langButtonY + 50) {
    currentLanguage = 'KR';
    menuState.showingLanguageModal = false;
    showTitleButtons();
    return;
  }
  
  // EN 버튼
  if (clickX >= modalX + 210 && clickX <= modalX + 330 &&
      clickY >= langButtonY && clickY <= langButtonY + 50) {
    currentLanguage = 'EN';
    menuState.showingLanguageModal = false;
    showTitleButtons();
    return;
  }
}

function handleGuideModalClick(clickX, clickY, t) {
  const modalWidth = 900;
  const modalHeight = 550;
  const modalX = GAME_WIDTH / 2 - modalWidth / 2;
  const modalY = GAME_HEIGHT / 2 - modalHeight / 2;
  
  // X 버튼 클릭
  if (clickX >= modalX + modalWidth - 40 && clickX <= modalX + modalWidth - 10 &&
      clickY >= modalY + 10 && clickY <= modalY + 40) {
    menuState.showingGuideModal = false;
    showTitleButtons();
    return;
  }
  
  // 리스트 아이템 클릭
  const listX = modalX + 20;
  const listY = modalY + 80;
  const listWidth = 280;
  const listHeight = modalHeight - 100;
  const itemHeight = 40;
  const itemPadding = 5;
  
  // 리스트 영역 내 클릭인지 확인
  if (clickX >= listX && clickX <= listX + listWidth &&
      clickY >= listY && clickY <= listY + listHeight) {
    for (let i = 0; i < t.guideItems.length; i++) {
      const itemY = listY + i * (itemHeight + itemPadding) - menuState.guideScrollOffset;
      if (clickX >= listX + 5 && clickX <= listX + listWidth - 5 &&
          clickY >= itemY + 5 && clickY <= itemY + itemHeight + 5) {
        menuState.selectedGuideIndex = i;
        return;
      }
    }
  }
}

function handleTitleScreenClick(clickX, clickY, t) {
  // 타이틀 화면의 클릭은 이제 DOM 버튼 이벤트로 처리됨
  // Canvas 클릭은 비활성화 (모달이 없을 때)
}

function handleMapSelectClick(clickX, clickY) {
  // 뒤로가기 버튼
  const backX = GAME_WIDTH - 80;
  const backY = 30;
  const backSize = 40;
  
  if (clickX >= backX && clickX <= backX + backSize &&
      clickY >= backY && clickY <= backY + backSize) {
    menuState.currentScreen = 'title';
    showTitleButtons();
    return;
  }
  
  // 맵 카드 클릭
  const cardWidth = 300;
  const cardHeight = 350;
  const cardSpacing = 80;
  const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
  const startX = (GAME_WIDTH - totalWidth) / 2;
  const cardY = 200;
  
  for (let i = 0; i < maps.length; i++) {
    const x = startX + i * (cardWidth + cardSpacing);
    
    if (clickX >= x && clickX <= x + cardWidth &&
        clickY >= cardY && clickY <= cardY + cardHeight) {
      menuState.selectedMap = maps[i];
      menuState.currentScreen = 'characterSelect';
      return;
    }
  }
}

function handleCharacterSelectClick(clickX, clickY) {
  // 뒤로가기 버튼
  const backX = GAME_WIDTH - 80;
  const backY = 30;
  const backSize = 40;
  
  if (clickX >= backX && clickX <= backX + backSize &&
      clickY >= backY && clickY <= backY + backSize) {
    menuState.currentScreen = 'mapSelect';
    return;
  }
  
  // 캐릭터 카드 클릭
  const cardWidth = 320;
  const cardHeight = 450;
  const cardSpacing = 40;
  const startX = 150;
  const cardY = 150;
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const x = startX + i * (cardWidth + cardSpacing) - menuState.characterScrollOffset;
    
    // 선택 버튼 영역
    const btnWidth = 200;
    const btnHeight = 40;
    const btnX = x + (cardWidth - btnWidth) / 2;
    const btnY = cardY + cardHeight - 60;
    
    if (clickX >= btnX && clickX <= btnX + btnWidth &&
        clickY >= btnY && clickY <= btnY + btnHeight) {
      menuState.selectedCharacter = char;
      startGameWithCharacter(char);
      return;
    }
  }
}

function startGameWithCharacter(character) {
  // 게임 상태 초기화
  game.time = 0;
  game.spawnTimer = 0;
  game.bossTimer = 0;
  game.bossKillCount = 0;
  game.isCleared = false;
  game.bossAlive = false;
  game.bossWarning = false;
  game.bossWarningTimer = 0;
  game.nextBossTime = 60;
  game.lastSurroundTime = 0;
  
  // 선택된 맵 적용
  if (menuState.selectedMap) {
    game.currentMap = menuState.selectedMap.id;
  }
  
  // 플레이어 위치 초기화
  player.x = MAP_SIZE / 2;
  player.y = MAP_SIZE / 2;
  player.health = 100;
  player.level = 1;
  player.exp = 0;
  
  // 기존 증강 초기화
  player.augments = [{ id: character.weapon, level: 1 }];
  
  // 스탯 보너스 초기화 및 캐릭터 특화 적용
  player.statBonuses = {
    attackSpeedMult: 1,
    attackPowerMult: 1,
    attackRangeMult: 1,
    moveSpeedMult: 1,
    maxHealthBonus: 0,
    pickupRangeMult: 1,
    projectileSpeedMult: 1,
    cooldownMult: 1,
    durationMult: 1,
  };
  Object.assign(player.statBonuses, character.bonuses);
  
  // 캐릭터 색상 및 이미지 적용
  player.color = character.color;
  player.image = character.image;
  
  // 캐릭터 이미지 로드
  if (character.image) {
    player.imageObj = new Image();
    player.imageObj.src = character.image;
  }
  
  // 선택된 맵 적용
  if (menuState.selectedMap) {
    currentMap = menuState.selectedMap;
  }
  
  // 게임 오브젝트 초기화
  enemies.length = 0;
  projectiles.length = 0;
  enemyProjectiles.length = 0;
  expOrbs.length = 0;
  dropItems.length = 0;
  mines.length = 0;
  firePatches.length = 0;
  fireParticles.length = 0;
  drones.length = 0;
  pheromones.length = 0;
  lightnings.length = 0;
  disks.length = 0;
  poisonClouds.length = 0;
  shockwaves.length = 0;
  
  // 무기 타이머 초기화
  Object.keys(weaponTimers).forEach(key => {
    weaponTimers[key] = 0;
  });
  
  // 증강 슬롯 초기화
  const slots = document.querySelectorAll('.augment-slot');
  slots.forEach(slot => {
    slot.classList.remove('active');
    slot.innerHTML = '';
    slot.style.borderColor = '';
    slot.style.boxShadow = '';
  });
  
  // DOM 버튼 숨기기
  hideTitleButtons();
  hideBackButton();
  hideCharacterButtons();
  
  // 게임 시작
  menuState.isShowingMenu = false;
  game.isPaused = false;
  
  // UI 표시 및 초기 업데이트
  const gameUI = document.getElementById('gameUI');
  if (gameUI) gameUI.style.display = 'block';
  
  // 초기 UI 업데이트
  setTimeout(() => {
    updateUI();
  }, 0);
  
  console.log(`게임 시작! 캐릭터: ${character.nameKR}, 맵: ${menuState.selectedMap?.nameKR}`);
}

// 드래그 스크롤 처리
let isDragging = false;
let dragStartX = 0;
let dragStartOffset = 0;

function initMenuEvents() {
  if (typeof canvas === 'undefined') {
    console.error('Canvas not found for menu events');
    return;
  }
  
  canvas.addEventListener('mousedown', handleMenuMouseDown);
  canvas.addEventListener('mousemove', handleMenuMouseMove);
  canvas.addEventListener('mouseup', handleMenuMouseUp);
  canvas.addEventListener('mouseleave', handleMenuMouseUp);
  canvas.addEventListener('click', handleMenuClick);
  canvas.addEventListener('wheel', handleMenuWheel, { passive: false });
}

function handleMenuMouseDown(e) {
  if (!menuState.isShowingMenu || menuState.currentScreen !== 'characterSelect') return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME_WIDTH / rect.width;
  dragStartX = (e.clientX - rect.left) * scaleX;
  dragStartOffset = menuState.characterScrollOffset;
  isDragging = true;
  e.preventDefault();
}

function handleMenuMouseMove(e) {
  if (!isDragging) return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME_WIDTH / rect.width;
  const currentX = (e.clientX - rect.left) * scaleX;
  const deltaX = dragStartX - currentX;
  
  menuState.characterScrollOffset = Math.max(0, dragStartOffset + deltaX);
  e.preventDefault();
}

function handleMenuMouseUp() {
  isDragging = false;
}

function handleMenuWheel(e) {
  if (!menuState.showingGuideModal) return;
  
  const t = translations[currentLanguage];
  const modalHeight = 550;
  const itemHeight = 40;
  const itemPadding = 5;
  const listHeight = modalHeight - 100;
  const totalItemsHeight = t.guideItems.length * (itemHeight + itemPadding);
  const maxScroll = Math.max(0, totalItemsHeight - listHeight);
  
  // 휠 방향에 따라 스크롤
  menuState.guideScrollOffset += e.deltaY * 0.5;
  menuState.guideScrollOffset = Math.max(0, Math.min(maxScroll, menuState.guideScrollOffset));
  
  e.preventDefault();
}

// 현재 맵 설정 (전역)
let currentMap = maps[0];

// ========================================
// DOM 버튼 관리
// ========================================

function showTitleButtons() {
  const titleButtons = document.getElementById('titleMenuButtons');
  if (titleButtons && menuState.currentScreen === 'title' && !menuState.showingLanguageModal && !menuState.showingGuideModal) {
    titleButtons.style.display = 'flex';
  }
}

function hideTitleButtons() {
  const titleButtons = document.getElementById('titleMenuButtons');
  if (titleButtons) {
    titleButtons.style.display = 'none';
  }
}

function initTitleButtons() {
  const startBtn = document.getElementById('startGameBtn');
  const langBtn = document.getElementById('languageBtn');
  const guideBtn = document.getElementById('guideBtn');
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      hideTitleButtons();
      menuState.currentScreen = 'mapSelect';
    });
  }
  
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      hideTitleButtons();
      menuState.showingLanguageModal = true;
    });
  }
  
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      hideTitleButtons();
      menuState.showingGuideModal = true;
    });
  }
}

function initBackButton() {
  const backBtn = document.getElementById('backButton');
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (menuState.currentScreen === 'mapSelect') {
        hideBackButton();
        menuState.currentScreen = 'title';
        showTitleButtons();
      } else if (menuState.currentScreen === 'characterSelect') {
        hideCharacterButtons();
        menuState.currentScreen = 'mapSelect';
      }
    });
  }
}

function initCharacterButtons() {
  const characterBtns = [
    { id: 'characterBtn1', character: characters[0] },
    { id: 'characterBtn2', character: characters[1] },
    { id: 'characterBtn3', character: characters[2] }
  ];
  
  characterBtns.forEach(({ id, character }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        hideCharacterButtons();
        hideBackButton();
        startGameWithCharacter(character);
      });
    }
  });
}

// 페이지 로드 시 이벤트 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMenuEvents();
    initTitleButtons();
    initBackButton();
    initCharacterButtons();
  });
} else {
  initMenuEvents();
  initTitleButtons();
  initBackButton();
  initCharacterButtons();
}
