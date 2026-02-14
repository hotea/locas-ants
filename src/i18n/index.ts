export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Control Panel
    speed: '速度',
    ants: '蚂蚁',
    showPheromones: '显示信息素',
    language: '语言',
    randomScene: '随机场景',

    // Tool Panel
    pan: '拖动',
    block: '障碍',
    grass: '草地',
    cave: '蚁巢',
    food: '食物',
    portal: '传送门',
    remove: '删除',

    // Stats
    fps: 'FPS',
    antCount: '蚂蚁数量',
    deposited: '收集食物',
  },
  en: {
    // Control Panel
    speed: 'Speed',
    ants: 'Ants',
    showPheromones: 'Pheromones',
    language: 'Lang',
    randomScene: 'Random',

    // Tool Panel
    pan: 'Pan',
    block: 'Block',
    grass: 'Grass',
    cave: 'Cave',
    food: 'Food',
    portal: 'Portal',
    remove: 'Remove',

    // Stats
    fps: 'FPS',
    antCount: 'Ants',
    deposited: 'Deposited',
  },
};

let currentLanguage: Language = 'zh';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: keyof typeof translations.zh): string {
  return translations[currentLanguage][key] || key;
}
