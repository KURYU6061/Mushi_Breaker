// ========================================
// Mushi Breaker - Translation Helper
// ========================================

// 번역 헬퍼 함수
function t(key) {
  if (typeof translations === 'undefined' || typeof currentLanguage === 'undefined') {
    return key;
  }
  return translations[currentLanguage][key] || key;
}

// 증강 이름 번역
function getAugmentName(augmentId) {
  const aug = AUGMENT_TYPES[augmentId];
  if (!aug) return augmentId;
  return aug.name; // AUGMENT_TYPES는 이미 한국어 이름이므로 영어 번역 추가 필요
}

// 스탯 타입 번역
function translateStatType(statType) {
  const statMap = {
    attackSpeed: { KR: '공격속도', EN: 'Attack Speed' },
    attackPower: { KR: '공격력', EN: 'Attack Power' },
    attackRange: { KR: '공격범위', EN: 'Attack Range' },
    moveSpeed: { KR: '이동속도', EN: 'Move Speed' },
    maxHealth: { KR: '최대체력', EN: 'Max Health' },
    pickupRange: { KR: '획득범위', EN: 'Pickup Range' },
    projectileSpeed: { KR: '투사체속도', EN: 'Projectile Speed' },
    cooldown: { KR: '쿨타임', EN: 'Cooldown' },
    duration: { KR: '지속시간', EN: 'Duration' }
  };
  
  const lang = typeof currentLanguage !== 'undefined' ? currentLanguage : 'KR';
  return statMap[statType] ? statMap[statType][lang] : statType;
}
