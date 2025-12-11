// ========================================
// Mushi Breaker - 렌더링 시스템
// ========================================

function drawMap() {
  // 검은색 배경 (맵 이미지 밖 영역)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // 맵 이미지 그리기
  if (typeof mapImage !== 'undefined' && mapImage.complete && mapImage.naturalWidth > 0) {
    const mapScreen = worldToScreen(0, 0);
    ctx.drawImage(mapImage, mapScreen.x, mapScreen.y, MAP_SIZE, MAP_SIZE);
  } else {
    // 이미지 로드 전 대체 색상
    const mapColor = (typeof currentMap !== 'undefined') ? currentMap.color : '#2a2a2a';
    const mapScreen = worldToScreen(0, 0);
    ctx.fillStyle = mapColor;
    ctx.fillRect(mapScreen.x, mapScreen.y, MAP_SIZE, MAP_SIZE);
  }
  
  // 보스 경고 효과
  if (game.bossWarning) {
    const warningProgress = game.bossWarningTimer / 5;
    const pulseSpeed = 4;
    const pulse = Math.sin(game.bossWarningTimer * pulseSpeed) * 0.5 + 0.5;
    
    // 화면 가장자리 빨간 테두리
    const thickness = 10 + pulse * 10;
    ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.3})`;
    ctx.fillRect(0, 0, GAME_WIDTH, thickness);
    ctx.fillRect(0, GAME_HEIGHT - thickness, GAME_WIDTH, thickness);
    ctx.fillRect(0, 0, thickness, GAME_HEIGHT);
    ctx.fillRect(GAME_WIDTH - thickness, 0, thickness, GAME_HEIGHT);
    
    // 중앙 경고 텍스트
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = '⚠️ BOSS WARNING ⚠️';
    const yOffset = -100 + Math.sin(game.bossWarningTimer * 2) * 10;
    
    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(text, GAME_WIDTH / 2 + 3, GAME_HEIGHT / 2 + yOffset + 3);
    
    // 메인 텍스트
    ctx.fillStyle = `rgba(255, ${100 - pulse * 100}, 0, ${0.8 + pulse * 0.2})`;
    ctx.fillText(text, GAME_WIDTH / 2, GAME_HEIGHT / 2 + yOffset);
    
    // 카운트다운
    ctx.font = 'bold 72px Arial';
    const countdown = Math.ceil(5 - game.bossWarningTimer);
    const scale = 1 + (1 - (game.bossWarningTimer % 1)) * 0.3;
    ctx.save();
    ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(countdown.toString(), 3, 3);
    ctx.fillStyle = `rgba(255, 50, 50, ${0.9 + pulse * 0.1})`;
    ctx.fillText(countdown.toString(), 0, 0);
    
    ctx.restore();
    ctx.restore();
  }
  
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
  
  const gridColor = (typeof currentMap !== 'undefined') ? currentMap.gridColor : '#333';
  ctx.strokeStyle = gridColor;
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

function drawWeaponEffects() {
  // 지뢰
  for (const mine of mines) {
    const screenPos = worldToScreen(mine.x, mine.y);
    
    if (mine instanceof ProximityMine) {
      mine.draw(ctx, screenPos);
    } else {
      // 레거시 지뢰 (연쇄 지뢰 등)
      const alpha = Math.max(0.3, 1 - mine.age / mine.lifetime);
      ctx.fillStyle = mine.isEvolved ? `rgba(255, 100, 0, ${alpha})` : `rgba(255, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, mine.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // 폭발 이펙트
  for (const explosion of explosions) {
    const screenPos = worldToScreen(explosion.x, explosion.y);
    explosion.draw(ctx, screenPos);
  }
  
  // 화염 파티클 (새로운 파티클 시스템)
  for (const particle of fireParticles) {
    const screenPos = worldToScreen(particle.x, particle.y);
    particle.draw(ctx, screenPos);
  }
  
  // 화염 장판 (FirePatch)
  for (const fire of firePatches) {
    if (fire instanceof FirePatch) {
      const screenPos = worldToScreen(fire.x, fire.y);
      fire.draw(ctx, screenPos);
    }
  }
  
  for (const drone of drones) {
    const screenPos = worldToScreen(drone.x, drone.y);
    
    if (drone instanceof BladeDrone) {
      drone.draw(ctx, screenPos);
    } else {
      // 레거시 드론 렌더링 (호환성 유지)
      ctx.fillStyle = drone.isEvolved ? '#ffd700' : '#00ffff';
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(drone.angle * 2);
      
      ctx.beginPath();
      ctx.moveTo(drone.size, 0);
      ctx.lineTo(0, drone.size * 0.5);
      ctx.lineTo(-drone.size, 0);
      ctx.lineTo(0, -drone.size * 0.5);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  for (const bomb of pheromones) {
    const screenPos = worldToScreen(bomb.x, bomb.y);
    
    if (bomb instanceof PheromoneBomb) {
      bomb.draw(ctx, screenPos);
    } else {
      // 레거시 폭탄 렌더링
      const pulseScale = 1 + Math.sin(bomb.age * 10) * 0.2;
      
      ctx.fillStyle = bomb.isEvolved ? 'rgba(255, 0, 255, 0.5)' : 'rgba(255, 255, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 10 * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, bomb.attractRadius * pulseScale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  for (const lightning of lightnings) {
    if (lightning instanceof ElectricChain || lightning instanceof LightningBolt) {
      lightning.draw(ctx, worldToScreen);
    }
  }
  
  for (const disk of disks) {
    const screenPos = worldToScreen(disk.x, disk.y);
    
    if (disk instanceof RicochetDisk) {
      disk.draw(ctx, screenPos);
    } else {
      // 레거시 디스크 렌더링
      ctx.fillStyle = disk.isEvolved ? '#ff00ff' : '#00ffff';
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(disk.age * 10);
      
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
  }
  
  for (const cloud of poisonClouds) {
    const screenPos = worldToScreen(cloud.x, cloud.y);
    
    if (cloud instanceof PoisonCloud) {
      cloud.draw(ctx, screenPos);
    } else {
      // 레거시 구름 렌더링 (피해 판정용, 보이지 않음)
      // 시각 효과는 PoisonCloud 인스턴스가 처리
    }
  }
  
  for (const wave of shockwaves) {
    const screenPos = worldToScreen(wave.x, wave.y);
    
    if (wave instanceof StompWave) {
      wave.draw(ctx, screenPos);
    } else {
      // 레거시 충격파 렌더링
      const alpha = 1 - wave.age / wave.lifetime;
      
      ctx.strokeStyle = wave.isEvolved ? `rgba(255, 100, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawPlayer() {
  const screenPos = worldToScreen(player.x, player.y);
  
  // 무적 시간 깜박임 효과 (0.1초마다 토글)
  if (player.invincibleTime > 0) {
    const blinkInterval = 0.1;
    const blinkCycle = Math.floor(player.invincibleTime / blinkInterval);
    if (blinkCycle % 2 === 0) {
      return; // 깜박임 효과로 안 그림
    }
  }
  
  // 캠릭터 이미지가 로드되었으면 이미지로 그리기
  if (player.imageObj && player.imageObj.complete) {
    const imageSize = player.size * 2; // 이미지 크기
    
    // 사냥꾼 캐릭터만 50도 추가 회전
    const extraRotation = player.image === 'img/player/hunter_Play.png' ? (50 * Math.PI / 180) : 0;
    
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(player.facingAngle - Math.PI / 2 + extraRotation); // 이미지 회전 (사냥꾼은 30도 추가)
    
    // 픽셀 아트가 흐려지지 않게
    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(
      player.imageObj,
      -imageSize / 2,
      -imageSize / 2,
      imageSize,
      imageSize
    );
    ctx.restore();
  } else {
    // 이미지가 없거나 로드 중일 때 기본 동그라미
    ctx.fillStyle = player.color || '#4080ff';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 방향 표시 화살표
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(
      screenPos.x + Math.cos(player.facingAngle) * player.size,
      screenPos.y + Math.sin(player.facingAngle) * player.size
    );
    ctx.stroke();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    const screenPos = worldToScreen(enemy.x, enemy.y);
    
    // 이미지가 있으면 이미지 렌더링 (회전 적용 + 90도 오프셋), 없으면 원으로 폴백
    if (enemy.type.image && enemy.imageObj && enemy.imageObj.complete) {
      const size = enemy.size;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate((enemy.angle || 0) + Math.PI / 2); // 90도(π/2) 오른쪽 회전
      ctx.drawImage(
        enemy.imageObj,
        -size / 2,
        -size / 2,
        size,
        size
      );
      ctx.restore();
    } else {
      // 이미지 로드 전 폴백 (원)
      ctx.fillStyle = enemy.type.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, enemy.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (enemy.isBoss) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 보스만 체력바 표시
      const healthPercent = enemy.health / enemy.maxHealth;
      const barWidth = enemy.size * 2;
      const barHeight = 6;
      const barY = screenPos.y - enemy.size / 2 - 12;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
      
      // 보스 체력 텍스트
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(enemy.health)}/${enemy.maxHealth}`, screenPos.x, barY - 4);
    }
  }
}

function drawProjectiles() {
  for (const proj of projectiles) {
    const screenPos = worldToScreen(proj.x, proj.y);
    
    // 기관총 탄환은 전용 렌더링 메서드 사용
    if (proj instanceof MachineGunBullet) {
      proj.draw(ctx, screenPos);
    } else {
      // 일반 투사체
      ctx.fillStyle = proj.color || '#ffff00';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (const proj of enemyProjectiles) {
    const screenPos = worldToScreen(proj.x, proj.y);
    
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, proj.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExpOrbs() {
  for (const orb of expOrbs) {
    const screenPos = worldToScreen(orb.x, orb.y);
    
    // 큰 보석은 다르게 표시
    if (orb.isBig) {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 3) * 0.2 + 1;
      const size = 12 * pulse;
      
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawDropItems() {
  const time = Date.now() / 1000;
  
  for (const item of dropItems) {
    const screenPos = worldToScreen(item.x, item.y);
    const pulse = Math.sin(time * 4) * 0.3 + 1; // 펄스 애니메이션
    const size = 16 * pulse;
    
    // 아이템 타입별 색상과 아이콘
    if (item.type === 'health') {
      // 빨간 하트
      ctx.fillStyle = '#ff0000';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPos.x - size * 0.25, screenPos.y - size * 0.15, size * 0.3, 0, Math.PI * 2);
      ctx.arc(screenPos.x + size * 0.25, screenPos.y - size * 0.15, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(screenPos.x - size * 0.5, screenPos.y - size * 0.1);
      ctx.lineTo(screenPos.x, screenPos.y + size * 0.4);
      ctx.lineTo(screenPos.x + size * 0.5, screenPos.y - size * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (item.type === 'magnet') {
      // 파란 자석
      ctx.fillStyle = '#0088ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillRect(screenPos.x - size * 0.4, screenPos.y - size * 0.4, size * 0.8, size * 0.3);
      ctx.strokeRect(screenPos.x - size * 0.4, screenPos.y - size * 0.4, size * 0.8, size * 0.3);
      ctx.fillRect(screenPos.x - size * 0.4, screenPos.y + size * 0.1, size * 0.25, size * 0.3);
      ctx.strokeRect(screenPos.x - size * 0.4, screenPos.y + size * 0.1, size * 0.25, size * 0.3);
      ctx.fillRect(screenPos.x + size * 0.15, screenPos.y + size * 0.1, size * 0.25, size * 0.3);
      ctx.strokeRect(screenPos.x + size * 0.15, screenPos.y + size * 0.1, size * 0.25, size * 0.3);
    } else if (item.type === 'levelup') {
      // 황금 별
      ctx.fillStyle = '#ffdd00';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size * 0.5 : size * 0.25;
        ctx.lineTo(screenPos.x + Math.cos(angle) * r, screenPos.y + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    // 수명 경고 (5초 미만일 때 깜빡임)
    if (item.lifetime < 5) {
      const blinkSpeed = item.lifetime < 2 ? 8 : 4;
      if (Math.floor(time * blinkSpeed) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  if (typeof menuState !== 'undefined' && menuState.isShowingMenu) {
    drawMenu();
    return;
  }
  
  drawMap();
  drawWeaponEffects();
  drawExpOrbs();
  drawDropItems();
  drawEnemies();
  drawProjectiles();
  drawPlayer();
  
  // 디버그 정보를 우측 상단에 표시
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(GAME_WIDTH - 200, 5, 195, 85);
  
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`FPS: ${currentFPS}`, GAME_WIDTH - 190, 25);
  ctx.fillText(`적: ${enemies.length}`, GAME_WIDTH - 190, 45);
  ctx.fillText(`시간: ${Math.floor(game.time)}초`, GAME_WIDTH - 190, 65);
  ctx.fillText(`좌표: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, GAME_WIDTH - 190, 85);
}
