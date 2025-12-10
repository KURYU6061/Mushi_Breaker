// ========================================
// Mushi Breaker - 증강 시스템 UI
// ========================================

function getAugmentChoices() {
  const choices = [];
  const weaponChance = 0.6;
  const selectedIds = new Set();
  
  // 플레이어가 가진 무기 5개 이상인지 체크
  const hasMaxWeapons = player.augments.length >= 5;
  // 플레이어가 선택한 스텟 5개 이상인지 체크
  const hasMaxStats = player.selectedStats.length >= 5;
  
  for (let i = 0; i < 5; i++) {
    const isWeapon = Math.random() < weaponChance;
    let attempts = 0;
    let selected = null;
    
    while (!selected && attempts < 50) {
      attempts++;
      
      if (isWeapon) {
        let availableWeapons;
        
        if (hasMaxWeapons) {
          // 5개 찬 경우: 기존 무기만 선택 가능
          availableWeapons = Object.values(AUGMENT_TYPES).filter(aug => {
            const playerAug = player.augments.find(a => a.id === aug.id);
            if (!playerAug) return false;
            return playerAug.level < aug.maxLevel && !selectedIds.has(aug.id);
          });
        } else {
          // 5개 미만: 모든 무기 선택 가능
          availableWeapons = Object.values(AUGMENT_TYPES).filter(aug => {
            const playerAug = player.augments.find(a => a.id === aug.id);
            const level = playerAug ? playerAug.level : 0;
            return level < aug.maxLevel && !selectedIds.has(aug.id);
          });
        }
        
        if (availableWeapons.length > 0) {
          const weights = availableWeapons.map(aug => {
            let baseWeight = 1.0;
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
          continue;
        }
      } else {
        let statAugments;
        
        if (hasMaxStats) {
          // 5개 찬 경우: 선택된 스텟만 나타남
          statAugments = Object.entries(STAT_AUGMENTS).filter(([key]) => 
            player.selectedStats.includes(key) && !selectedIds.has(key)
          );
        } else {
          // 5개 미만: 모든 스텟 선택 가능
          statAugments = Object.entries(STAT_AUGMENTS).filter(([key]) => !selectedIds.has(key));
        }
        
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
  
  // 보유 무기의 statType들 수집
  const ownedWeaponStatTypes = new Set();
  player.augments.forEach(aug => {
    const augData = AUGMENT_TYPES[aug.id];
    if (augData && augData.statType) {
      ownedWeaponStatTypes.add(augData.statType);
    }
  });
  
  augmentChoices.forEach(choice => {
    const div = document.createElement('div');
    div.className = 'augment-choice';
    
    if (choice.type === 'weapon') {
      const aug = choice.augment;
      const playerAug = player.augments.find(a => a.id === aug.id);
      const currentLevel = playerAug ? playerAug.level : 0;
      const nextLevel = currentLevel + 1;
      
      // 보유 무기인 경우 강조
      if (playerAug) {
        div.classList.add('owned-weapon');
      }
      
      // 진화 조건 체크: 무기 레벨 + 해당 스텟 레벨
      const statLevel = player.statLevels[aug.statType] || 0;
      const canEvolve = nextLevel >= aug.evolveLevel && statLevel >= aug.evolveStatRequirement;
      const isEvolved = playerAug && playerAug.level >= aug.evolveLevel && canEvolve;
      const isMaxed = nextLevel >= aug.maxLevel;
      
      const displayName = isEvolved ? aug.evolvedName : aug.name;
      const displayDesc = isEvolved ? aug.evolvedDesc : aug.desc;
      
      let evolutionStatus = '';
      if (!isEvolved && nextLevel >= aug.evolveLevel) {
        if (statLevel < aug.evolveStatRequirement) {
          evolutionStatus = `<p class="evolution-requirement">⚠️ 진화 대기: ${getStatTypeName(aug.statType)} ${statLevel}/${aug.evolveStatRequirement}</p>`;
        } else {
          evolutionStatus = `<p class="evolution-ready">✨ 다음 레벨에 진화!</p>`;
        }
      }
      
      div.innerHTML = `
        <div class="augment-icon">${aug.icon}</div>
        <h3>${displayName}</h3>
        <p class="augment-level">레벨 ${currentLevel} → ${nextLevel}${isMaxed ? ' (MAX)' : ''}</p>
        ${evolutionStatus}
        <p>${displayDesc}</p>
      `;
      
      div.onclick = () => selectAugment(choice);
    } else {
      const aug = choice.augment;
      
      // 보유 무기와 연관된 스탯인지 체크
      if (ownedWeaponStatTypes.has(aug.statType)) {
        div.classList.add('related-stat');
      }
      
      div.innerHTML = `
        <div class="augment-icon">📊</div>
        <h3>${aug.name}</h3>
        <p>능력치 강화</p>
      `;
      
      div.onclick = () => selectAugment(choice);
    }
    
    choices.appendChild(div);
  });
  
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
    
    if (!player.statPreference[aug.statType]) {
      player.statPreference[aug.statType] = 0;
    }
    player.statPreference[aug.statType] += 0.2;
    
  } else {
    const aug = choice.augment;
    const statKey = choice.key;
    const effect = aug.effect();
    
    // 선택된 스텟에 추가 (중복 방지)
    if (!player.selectedStats.includes(statKey)) {
      player.selectedStats.push(statKey);
    }
    
    // 스텟 타입별 레벨 증가
    if (!player.statLevels[aug.statType]) {
      player.statLevels[aug.statType] = 0;
    }
    player.statLevels[aug.statType]++;
    
    Object.entries(effect).forEach(([key, value]) => {
      if (key.endsWith('Mult')) {
        player.statBonuses[key] *= value;
      } else {
        player.statBonuses[key] = (player.statBonuses[key] || 0) + value;
      }
    });
    
    if (effect.maxHealthBonus) {
      player.health += effect.maxHealthBonus;
    }
    
    if (!player.statPreference[aug.statType]) {
      player.statPreference[aug.statType] = 0;
    }
    player.statPreference[aug.statType] += 0.2;
  }
  
  document.getElementById('levelUpScreen').classList.add('hidden');
  game.isPaused = false;
}

// 스텟 타입 이름 반환
function getStatTypeName(statType) {
  const names = {
    attackSpeed: '공격속도',
    attackPower: '공격력',
    attackRange: '공격범위',
    moveSpeed: '이동속도',
    maxHealth: '최대체력',
    pickupRange: '획등범위',
    projectileSpeed: '투사체속도',
    cooldown: '쾴타임',
    duration: '지속시간'
  };
  return names[statType] || statType;
}

function updateUI() {
  // 메뉴 화면에서는 UI 숨기기
  const gameUI = document.getElementById('gameUI');
  if (typeof menuState !== 'undefined' && menuState.isShowingMenu) {
    if (gameUI) gameUI.style.display = 'none';
    return;
  }
  if (gameUI) gameUI.style.display = 'block';
  
  const healthPercent = (player.health / (player.maxHealth + player.statBonuses.maxHealthBonus)) * 100;
  document.getElementById('healthFill').style.width = `${healthPercent}%`;
  document.getElementById('healthText').textContent = `${Math.floor(player.health)}/${player.maxHealth + player.statBonuses.maxHealthBonus}`;
  
  const expPercent = (player.exp / player.expToNextLevel) * 100;
  document.getElementById('expFill').style.width = `${expPercent}%`;
  document.getElementById('levelText').textContent = `레벨 ${player.level}`;
  
  const augmentSlots = document.querySelectorAll('.augment-slot');
  const statSlots = document.querySelectorAll('.stat-slot');
  
  // 먼저 모든 슬롯 초기화
  augmentSlots.forEach(slot => {
    slot.classList.remove('active');
    slot.innerHTML = '';
    slot.style.borderColor = '';
    slot.style.boxShadow = '';
  });
  
  statSlots.forEach(slot => {
    slot.classList.remove('active');
    slot.innerHTML = '';
    slot.style.borderColor = '';
    slot.style.boxShadow = '';
  });
  
  // 증강 슬롯 업데이트
  player.augments.forEach((aug, index) => {
    if (index < 5 && augmentSlots[index]) {
      const augmentData = AUGMENT_TYPES[aug.id];
      if (!augmentData) {
        console.warn(`Unknown augment ID: ${aug.id}`);
        return;
      }
      
      const isEvolved = aug.level >= augmentData.evolveLevel;
      const isMaxed = aug.level >= augmentData.maxLevel;
      
      augmentSlots[index].classList.add('active');
      augmentSlots[index].innerHTML = `
        <div style="font-size: clamp(28px, 3.5vw, 42px);">${augmentData.icon}</div>
        <div style="font-size: clamp(12px, 1.5vw, 16px); margin-top: 4px; font-weight: bold;">${aug.level}${isMaxed ? '★' : ''}</div>
      `;
      
      if (isEvolved) {
        augmentSlots[index].style.borderColor = '#ffd700';
        augmentSlots[index].style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.7)';
      }
    }
  });
  
  // 스탯 슬롯 업데이트
  const statIcons = {
    ATTACK_SPEED: '⚡',
    ATTACK_POWER: '💥',
    ATTACK_RANGE: '🎯',
    MOVE_SPEED: '👟',
    MAX_HEALTH: '❤️',
    PICKUP_RANGE: '🧲',
    PROJECTILE_SPEED: '🚀',
    COOLDOWN: '⏱️',
    DURATION: '⏳'
  };
  
  player.selectedStats.forEach((statKey, index) => {
    if (index < 5 && statSlots[index]) {
      const statAug = STAT_AUGMENTS[statKey];
      if (!statAug) return;
      
      // 해당 스탯을 몇 번 선택했는지 계산
      const level = Math.floor((player.statPreference[statAug.statType] || 0) / 0.2);
      
      statSlots[index].classList.add('active');
      statSlots[index].innerHTML = `
        <div style="font-size: clamp(24px, 3vw, 36px);">${statIcons[statKey] || '📊'}</div>
        <div style="font-size: clamp(12px, 1.5vw, 16px); margin-top: 4px; font-weight: bold;">${level}</div>
      `;
    }
  });
  
  if (player.exp >= player.expToNextLevel) {
    levelUp();
  }
}

// 승리 화면 표시
function showVictoryScreen() {
  canvasOverlay.style.display = 'flex';
  canvasOverlay.innerHTML = '';
  
  const container = document.createElement('div');
  container.style.cssText = `
    width: clamp(600px, 75vw, 900px);
    background: linear-gradient(135deg, rgba(30, 20, 10, 0.98) 0%, rgba(50, 35, 15, 0.98) 100%);
    border: 5px solid #ffd700;
    border-radius: 20px;
    padding: clamp(20px, 3vw, 40px);
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
  `;
  
  // 제목
  const title = document.createElement('div');
  title.style.cssText = `
    font-size: clamp(48px, 6vw, 72px);
    font-weight: bold;
    text-align: center;
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.5);
    margin-bottom: clamp(20px, 3vw, 30px);
    animation: pulse 2s infinite;
  `;
  title.textContent = '🎉 게임 클리어! 🎉';
  container.appendChild(title);
  
  // 플레이 시간
  const minutes = Math.floor(game.time / 60);
  const seconds = Math.floor(game.time % 60);
  const timeText = document.createElement('div');
  timeText.style.cssText = `
    font-size: clamp(24px, 3vw, 36px);
    text-align: center;
    color: #fff;
    margin-bottom: clamp(20px, 3vw, 30px);
  `;
  timeText.textContent = `클리어 타임: ${minutes}분 ${seconds}초`;
  container.appendChild(timeText);
  
  // 획득한 증강 표시
  const augmentsTitle = document.createElement('div');
  augmentsTitle.style.cssText = `
    font-size: clamp(24px, 3vw, 36px);
    font-weight: bold;
    text-align: center;
    color: #ffd700;
    margin-bottom: clamp(15px, 2vw, 20px);
  `;
  augmentsTitle.textContent = '획득한 증강';
  container.appendChild(augmentsTitle);
  
  // 무기 증강
  const weaponsContainer = document.createElement('div');
  weaponsContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: clamp(10px, 1.5vw, 15px);
    margin-bottom: clamp(20px, 3vw, 30px);
  `;
  
  player.selectedAugments.forEach(aug => {
    const augmentData = WEAPON_AUGMENTS[aug.id];
    if (!augmentData) return;
    
    const isEvolved = aug.level >= augmentData.evolveLevel;
    const augDiv = document.createElement('div');
    augDiv.style.cssText = `
      background: rgba(50, 35, 15, 0.8);
      border: 3px solid ${isEvolved ? '#ffd700' : '#8b7355'};
      border-radius: 10px;
      padding: clamp(10px, 1.5vw, 15px);
      text-align: center;
      box-shadow: ${isEvolved ? '0 0 15px rgba(255, 215, 0, 0.7)' : 'none'};
    `;
    augDiv.innerHTML = `
      <div style="font-size: clamp(36px, 4vw, 48px);">${augmentData.icon}</div>
      <div style="font-size: clamp(14px, 1.8vw, 18px); color: #fff; margin-top: 5px;">${augmentData.name}</div>
      <div style="font-size: clamp(12px, 1.5vw, 16px); color: #ffd700; margin-top: 3px;">Lv.${aug.level}</div>
    `;
    weaponsContainer.appendChild(augDiv);
  });
  container.appendChild(weaponsContainer);
  
  // 스탯 증강
  const statsTitle = document.createElement('div');
  statsTitle.style.cssText = `
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: bold;
    text-align: center;
    color: #ffd700;
    margin-bottom: clamp(15px, 2vw, 20px);
  `;
  statsTitle.textContent = '스탯 증강';
  container.appendChild(statsTitle);
  
  const statIcons = {
    ATTACK_SPEED: '⚡ 공격속도',
    ATTACK_POWER: '💥 공격력',
    ATTACK_RANGE: '🎯 공격범위',
    MOVE_SPEED: '👟 이동속도',
    MAX_HEALTH: '❤️ 최대체력',
    PICKUP_RANGE: '🧲 획득범위',
    PROJECTILE_SPEED: '🚀 투사체속도',
    COOLDOWN: '⏱️ 재사용대기시간',
    DURATION: '⏳ 지속시간'
  };
  
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: clamp(8px, 1vw, 12px);
    margin-bottom: clamp(20px, 3vw, 30px);
  `;
  
  player.selectedStats.forEach(statKey => {
    const statAug = STAT_AUGMENTS[statKey];
    if (!statAug) return;
    
    const level = Math.floor((player.statPreference[statAug.statType] || 0) / 0.2);
    const statDiv = document.createElement('div');
    statDiv.style.cssText = `
      background: rgba(50, 35, 15, 0.6);
      border: 2px solid #8b7355;
      border-radius: 8px;
      padding: clamp(8px, 1vw, 12px);
      text-align: center;
    `;
    statDiv.innerHTML = `
      <div style="font-size: clamp(14px, 1.8vw, 18px); color: #fff;">${statIcons[statKey]}</div>
      <div style="font-size: clamp(12px, 1.5vw, 16px); color: #ffd700; margin-top: 3px;">+${level * 20}%</div>
    `;
    statsContainer.appendChild(statDiv);
  });
  container.appendChild(statsContainer);
  
  // 버튼 컨테이너
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    gap: clamp(10px, 1.5vw, 15px);
    justify-content: center;
    margin-top: clamp(20px, 3vw, 30px);
  `;
  
  // 버튼 생성 함수
  const createButton = (text, color) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      padding: clamp(12px, 1.5vw, 18px) clamp(24px, 3vw, 36px);
      font-size: clamp(16px, 2vw, 24px);
      font-weight: bold;
      color: #fff;
      background: ${color};
      border: 3px solid #fff;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    btn.onmouseover = () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.5)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    };
    return btn;
  };
  
  // 맵 선택 버튼
  const mapSelectBtn = createButton('맵 선택', '#4a90e2');
  mapSelectBtn.onclick = () => {
    canvasOverlay.style.display = 'none';
    if (typeof menuState !== 'undefined') {
      menuState.isShowingMenu = true;
      menuState.currentScreen = 'mapSelect';
    }
  };
  buttonsContainer.appendChild(mapSelectBtn);
  
  // 재시도 버튼
  const retryBtn = createButton('재시도', '#e67e22');
  retryBtn.onclick = () => {
    canvasOverlay.style.display = 'none';
    location.reload(); // 게임 재시작
  };
  buttonsContainer.appendChild(retryBtn);
  
  // 메인 화면 버튼
  const mainBtn = createButton('메인 화면', '#e74c3c');
  mainBtn.onclick = () => {
    canvasOverlay.style.display = 'none';
    if (typeof menuState !== 'undefined') {
      menuState.isShowingMenu = true;
      menuState.currentScreen = 'title';
    } else {
      location.reload();
    }
  };
  buttonsContainer.appendChild(mainBtn);
  
  container.appendChild(buttonsContainer);
  canvasOverlay.appendChild(container);
  
  // 펄스 애니메이션 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

