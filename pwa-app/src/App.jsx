import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, Calendar as CalendarIcon, ListTodo, Trash2, Sparkles, X, ChevronLeft, ChevronRight, Trophy, BookHeart, Save, Home, Gift, ShoppingBag } from 'lucide-react';

const storage = {
  get: (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊', label: '開心', color: '#ffd700' },
  { id: 'love', emoji: '🥰', label: '幸福', color: '#ff9ec7' },
  { id: 'calm', emoji: '😌', label: '平靜', color: '#a3e0d0' },
  { id: 'excited', emoji: '🤩', label: '興奮', color: '#ffb347' },
  { id: 'tired', emoji: '😪', label: '疲憊', color: '#b0a8d4' },
  { id: 'sad', emoji: '😢', label: '難過', color: '#a0c4e0' },
  { id: 'angry', emoji: '😠', label: '憤怒', color: '#ff8080' },
  { id: 'anxious', emoji: '😰', label: '焦慮', color: '#d4a3d4' },
  { id: 'depressed', emoji: '😔', label: '憂鬱', color: '#8a9bb4' },
  { id: 'bored', emoji: '😑', label: '無聊', color: '#c4c4c4' },
  { id: 'grateful', emoji: '🙏', label: '感恩', color: '#f4c2a1' },
  { id: 'lonely', emoji: '🥺', label: '孤單', color: '#b8b3d4' },
];

const BODY_OPTIONS = [
  { id: 'period', emoji: '🩸', label: '月經', color: '#ff8a9b' },
  { id: 'headache', emoji: '🤕', label: '頭痛', color: '#d4a3a3' },
  { id: 'stomachache', emoji: '😣', label: '肚子痛', color: '#e8b8a0' },
  { id: 'nausea', emoji: '🤢', label: '想吐', color: '#a8d4a3' },
  { id: 'fever', emoji: '🤒', label: '發燒', color: '#ff9999' },
  { id: 'cold', emoji: '🤧', label: '感冒', color: '#a3c4e0' },
  { id: 'tired_body', emoji: '😴', label: '很累', color: '#b8b3d4' },
  { id: 'energetic', emoji: '💪', label: '有活力', color: '#ffb347' },
  { id: 'sleepy', emoji: '🥱', label: '想睡', color: '#c4b3d4' },
  { id: 'sore', emoji: '😖', label: '痠痛', color: '#d4a3b8' },
  { id: 'good', emoji: '✨', label: '狀態好', color: '#a3e0d0' },
];

const FRUITS = [
  { id: 'strawberry', emoji: '🍓', name: '草莓', weight: 35 },
  { id: 'apple', emoji: '🍎', name: '蘋果', weight: 30 },
  { id: 'grape', emoji: '🍇', name: '葡萄', weight: 20 },
  { id: 'peach', emoji: '🍑', name: '水蜜桃', weight: 10 },
  { id: 'cherry', emoji: '🍒', name: '櫻桃', weight: 5 },
];

const DAILY_FRUIT_CAP = 5;

// Pearl drop config: every 3-5 hours randomly
const PEARL_MIN_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours
const PEARL_MAX_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 hours
const PEARL_VISIBLE_MS = 30 * 1000; // 30 seconds before disappearing if not collected

function xpForLevel(lv) {
  if (lv <= 0) return 0;
  if (lv <= 5) return 2 + (lv - 1);
  if (lv <= 15) return 6 + (lv - 5);
  if (lv <= 30) return 16 + (lv - 15);
  if (lv <= 50) return 31 + (lv - 30) * 2;
  if (lv <= 75) return 71 + (lv - 50) * 3;
  return 146 + (lv - 75) * 5;
}

const PET_GREETINGS = [
  '嗨～今天過得好嗎？', '見到你最開心了 💕', '哈囉哈囉～想你了！',
  '你來啦～最棒的一天～', '嘿嘿～又見面了 ✨',
];

const PET_ENCOURAGEMENTS = [
  '你今天好努力，我都看到了喔！', '一步一步來，沒關係的～',
  '不管做不做得到，你都很可愛 💗', '記得要好好吃飯睡覺～',
  '今天的你也是最棒的！', '累了就休息一下，世界不會因為你慢一點就崩塌',
  '你已經比昨天的自己更厲害了', '我永遠站在你這邊喔 🌸',
  '小小的進步也是進步！', '愛你愛你～記得也要愛自己',
  '深呼吸～一切都會慢慢好起來', '你值得世界上所有的溫柔',
  '不需要完美，做你自己就好', '今天能起床就已經很厲害了！',
  '把難過的事情交給我，我來幫你裝著～', '記得喝水水！我也要喝～',
  '再撐一下下，你超級棒的', '失敗也沒關係，我還是最喜歡你',
  '你笑起來最可愛了 ☺️', '謝謝你今天也來看我 💖',
];

// Furniture catalog with shop prices (in pearls)
const FURNITURE = [
  { id: 'sofa', emoji: '🛋️', name: '小沙發', unlockAge: 1, pearlCost: 8 },
  { id: 'lamp', emoji: '💡', name: '小檯燈', unlockAge: 1, pearlCost: 8 },
  { id: 'plant', emoji: '🪴', name: '盆栽', unlockAge: 1, pearlCost: 3 },
  { id: 'teddy', emoji: '🧸', name: '泰迪熊', unlockAge: 1, pearlCost: 8 },
  { id: 'cake', emoji: '🎂', name: '生日蛋糕', unlockAge: 1, pearlCost: 5 },
  { id: 'balloon', emoji: '🎈', name: '氣球', unlockAge: 1, pearlCost: 3 },
  { id: 'candle', emoji: '🕯️', name: '蠟燭', unlockAge: 1, pearlCost: 3 },
  { id: 'bed', emoji: '🛏️', name: '小床', unlockAge: 3, pearlCost: 20 },
  { id: 'tv', emoji: '📺', name: '電視', unlockAge: 3, pearlCost: 20 },
  { id: 'cactus', emoji: '🌵', name: '仙人掌', unlockAge: 3, pearlCost: 5 },
  { id: 'mirror', emoji: '🪞', name: '小鏡子', unlockAge: 3, pearlCost: 8 },
  { id: 'clock', emoji: '⏰', name: '鬧鐘', unlockAge: 3, pearlCost: 8 },
  { id: 'flowers', emoji: '💐', name: '花束', unlockAge: 3, pearlCost: 5 },
  { id: 'piano', emoji: '🎹', name: '鋼琴', unlockAge: 5, pearlCost: 30 },
  { id: 'guitar', emoji: '🎸', name: '吉他', unlockAge: 5, pearlCost: 20 },
  { id: 'cat', emoji: '🐱', name: '小貓朋友', unlockAge: 5, pearlCost: 30 },
  { id: 'rabbit', emoji: '🐰', name: '兔兔朋友', unlockAge: 5, pearlCost: 30 },
  { id: 'icecream', emoji: '🍦', name: '冰淇淋車', unlockAge: 5, pearlCost: 20 },
  { id: 'rainbow', emoji: '🌈', name: '小彩虹', unlockAge: 5, pearlCost: 20 },
  { id: 'unicorn', emoji: '🦄', name: '獨角獸', unlockAge: 10, pearlCost: 50 },
  { id: 'crown', emoji: '👑', name: '皇冠', unlockAge: 10, pearlCost: 50 },
  { id: 'star', emoji: '⭐', name: '星星', unlockAge: 10, pearlCost: 30 },
  { id: 'rocket', emoji: '🚀', name: '小火箭', unlockAge: 10, pearlCost: 50 },
  { id: 'dragon', emoji: '🐉', name: '小龍', unlockAge: 10, pearlCost: 50 },
  { id: 'castle', emoji: '🏰', name: '城堡', unlockAge: 10, pearlCost: 50 },
];

const BACKGROUNDS = [
  { id: 'pink', name: '粉粉樂園', gradient: 'linear-gradient(180deg, #fff0f5 0%, #ffe4ec 100%)', unlockAge: 0 },
  { id: 'sky', name: '天空之城', gradient: 'linear-gradient(180deg, #c4e9ff 0%, #fff0f5 100%)', unlockAge: 1 },
  { id: 'mint', name: '薄荷花園', gradient: 'linear-gradient(180deg, #e0f5ee 0%, #fff5e6 100%)', unlockAge: 3 },
  { id: 'lavender', name: '薰衣草夢', gradient: 'linear-gradient(180deg, #e0d4f5 0%, #ffe4f0 100%)', unlockAge: 5 },
  { id: 'sunset', name: '黃昏星空', gradient: 'linear-gradient(180deg, #f5d4e8 0%, #d4a3ff 50%, #6b8be0 100%)', unlockAge: 10 },
];

const REWARD_AGES = [1, 3, 5, 10];

function pickFruit() {
  const total = FRUITS.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FRUITS) {
    r -= f.weight;
    if (r <= 0) return f.id;
  }
  return FRUITS[0].id;
}

function getPetAgeYears(createdAt) {
  if (!createdAt) return 0;
  const ms = Date.now() - new Date(createdAt).getTime();
  const humanYears = ms / (365.25 * 24 * 60 * 60 * 1000);
  return humanYears * 3;
}

function getPetStage(ageYears) {
  if (ageYears < 0.5) return { name: '寶寶', emoji: '🍼' };
  if (ageYears < 1.5) return { name: '幼年', emoji: '🌱' };
  if (ageYears < 3) return { name: '少年', emoji: '✨' };
  return { name: '成年', emoji: '🌸' };
}

function pickRewardChoices(age, owned) {
  const available = [
    ...FURNITURE.filter(f => f.unlockAge === age && !owned.furniture.includes(f.id)).map(f => ({ type: 'furniture', ...f })),
    ...BACKGROUNDS.filter(b => b.unlockAge === age && !owned.backgrounds.includes(b.id)).map(b => ({ type: 'background', ...b })),
  ];
  if (available.length === 0) return [];
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, available.length));
}

export default function App() {
  const [view, setView] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState({});
  const [diaries, setDiaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const [pet, setPet] = useState(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [petNameInput, setPetNameInput] = useState('');
  const [showPetMenu, setShowPetMenu] = useState(false);
  const [showFruitPicker, setShowFruitPicker] = useState(false);
  const [petBubble, setPetBubble] = useState(null);
  const [petAnimKey, setPetAnimKey] = useState(0);
  const [petHearts, setPetHearts] = useState(0);
  const [showFruitGain, setShowFruitGain] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);

  // Pearl state - active pearl on screen
  const [activePearl, setActivePearl] = useState(null); // { x, y, expiresAt }
  const [showPearlGain, setShowPearlGain] = useState(null);

  // Shop state
  const [showShop, setShowShop] = useState(false);
  const [shopFlash, setShopFlash] = useState(null); // { id }
  const [shopError, setShopError] = useState(null);

  const [petX, setPetX] = useState(50);
  const [petDir, setPetDir] = useState(1);
  const walkRef = useRef(null);

  const [editingRoom, setEditingRoom] = useState(false);
  const [draggingItem, setDraggingItem] = useState(null);

  const audioCtxRef = useRef(null);

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const t = storage.get('tasks'); if (t) setTasks(t);
    const h = storage.get('history'); if (h) setHistory(h);
    const d = storage.get('diaries'); if (d) setDiaries(d);
    const p = storage.get('pet');
    if (p) {
      setPet({
        name: p.name,
        createdAt: p.createdAt,
        level: p.level || 0,
        xp: p.xp || 0,
        fruits: p.fruits || { strawberry: 0, apple: 0, grape: 0, peach: 0, cherry: 0 },
        owned: p.owned || { furniture: [], backgrounds: ['pink'] },
        currentBg: p.currentBg || 'pink',
        roomItems: p.roomItems || [],
        claimedRewards: p.claimedRewards || [],
        dailyFruits: p.dailyFruits || { date: '', count: 0 },
        pearls: p.pearls || 0,
        nextPearlAt: p.nextPearlAt || (Date.now() + PEARL_MIN_INTERVAL_MS + Math.random() * (PEARL_MAX_INTERVAL_MS - PEARL_MIN_INTERVAL_MS)),
      });
    } else {
      setShowNamePrompt(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (!loading) storage.set('tasks', tasks); }, [tasks, loading]);
  useEffect(() => { if (!loading) storage.set('history', history); }, [history, loading]);
  useEffect(() => { if (!loading) storage.set('diaries', diaries); }, [diaries, loading]);
  useEffect(() => { if (!loading && pet) storage.set('pet', pet); }, [pet, loading]);

  useEffect(() => {
    if (!pet) return;
    const tick = () => {
      setPetX(x => {
        const next = x + petDir * (0.4 + Math.random() * 0.6);
        if (next > 80) { setPetDir(-1); return 80; }
        if (next < 20) { setPetDir(1); return 20; }
        return next;
      });
    };
    walkRef.current = setInterval(tick, 200);
    return () => clearInterval(walkRef.current);
  }, [pet, petDir]);

  useEffect(() => {
    if (!pet) return;
    const i = setInterval(() => {
      if (Math.random() < 0.25) setPetDir(d => -d);
    }, 6000);
    return () => clearInterval(i);
  }, [pet]);

  // Pearl drop check - runs every 30 seconds
  useEffect(() => {
    if (!pet) return;
    const checkPearl = () => {
      const now = Date.now();
      // Generate pearl if time has come and no active pearl
      if (now >= pet.nextPearlAt && !activePearl) {
        // Place near pet (randomly close)
        const px = Math.max(15, Math.min(85, petX + (Math.random() * 20 - 10)));
        const py = 30 + Math.random() * 40; // somewhere mid-area
        setActivePearl({
          x: px,
          y: py,
          expiresAt: now + PEARL_VISIBLE_MS,
          key: now
        });
        playPearlAppearSound();
        // Schedule next pearl
        const nextDelay = PEARL_MIN_INTERVAL_MS + Math.random() * (PEARL_MAX_INTERVAL_MS - PEARL_MIN_INTERVAL_MS);
        setPet(p => ({ ...p, nextPearlAt: now + nextDelay }));
      }
      // Auto-remove expired pearl
      if (activePearl && now >= activePearl.expiresAt) {
        setActivePearl(null);
      }
    };
    const interval = setInterval(checkPearl, 5000); // check every 5s
    checkPearl(); // also check immediately
    return () => clearInterval(interval);
  }, [pet, activePearl, petX]);

  // Age-based rewards
  useEffect(() => {
    if (!pet) return;
    const age = Math.floor(getPetAgeYears(pet.createdAt));
    for (const rewardAge of REWARD_AGES) {
      if (age >= rewardAge && !pet.claimedRewards.includes(rewardAge)) {
        const choices = pickRewardChoices(rewardAge, pet.owned);
        if (choices.length > 0) {
          setPendingReward({ age: rewardAge, choices });
          break;
        } else {
          setPet(p => ({ ...p, claimedRewards: [...p.claimedRewards, rewardAge] }));
        }
      }
    }
  }, [pet]);

  useEffect(() => {
    if (loading) return;
    const checkWeekly = () => {
      const now = new Date();
      const isSundayEvening = now.getDay() === 0 && now.getHours() >= 20;
      if (!isSundayEvening) return;
      const lastShown = storage.get('lastWeeklySummary');
      const thisWeekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
      if (lastShown === thisWeekKey) return;
      const stats = calculateWeekStats();
      if (stats.length > 0) {
        setWeeklyData(stats);
        setShowWeeklySummary(true);
        storage.set('lastWeeklySummary', thisWeekKey);
      }
    };
    checkWeekly();
  }, [loading, history, tasks]);

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  };

  const calculateWeekStats = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return tasks.map(task => {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const k = dateKey(d);
        if (history[k] && history[k][task.id]) count++;
      }
      return { name: task.name, emoji: task.emoji, count };
    });
  };

  const initAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  };
  const playPopSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [{ f1: 800, f2: 400, t: 0 }, { f1: 1000, f2: 500, t: 0.12 }].forEach(({ f1, f2, t }) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f1, now + t); o.frequency.exponentialRampToValueAtTime(f2, now + t + 0.08);
        g.gain.setValueAtTime(0.3, now + t); g.gain.exponentialRampToValueAtTime(0.01, now + t + 0.1);
        o.connect(g); g.connect(ctx.destination); o.start(now + t); o.stop(now + t + 0.1);
      });
    } catch (e) {}
  };
  const playDingSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [{ f: 1320, t: 0 }, { f: 1056, t: 0.1 }].forEach(({ f, t }) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f, now + t);
        g.gain.setValueAtTime(0.25, now + t); g.gain.exponentialRampToValueAtTime(0.01, now + t + 0.3);
        o.connect(g); g.connect(ctx.destination); o.start(now + t); o.stop(now + t + 0.3);
      });
    } catch (e) {}
  };
  const playNomSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [0, 0.08, 0.16].forEach((delay, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(600 - i * 50, now + delay); o.frequency.exponentialRampToValueAtTime(300, now + delay + 0.06);
        g.gain.setValueAtTime(0.2, now + delay); g.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);
        o.connect(g); g.connect(ctx.destination); o.start(now + delay); o.stop(now + delay + 0.08);
      });
    } catch (e) {}
  };
  const playFruitGainSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [{ f: 880, t: 0 }, { f: 1320, t: 0.07 }, { f: 1760, t: 0.14 }].forEach(({ f, t }) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, now + t);
        g.gain.setValueAtTime(0.2, now + t); g.gain.exponentialRampToValueAtTime(0.01, now + t + 0.12);
        o.connect(g); g.connect(ctx.destination); o.start(now + t); o.stop(now + t + 0.12);
      });
    } catch (e) {}
  };
  const playLevelUpSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.25, now + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}
  };
  const playRewardSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, now + i * 0.08);
        g.gain.setValueAtTime(0.3, now + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.5);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.5);
      });
    } catch (e) {}
  };
  // Twinkly sound for pearl appearing
  const playPearlAppearSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [1568, 2093, 2637].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.06);
        g.gain.setValueAtTime(0.18, now + i * 0.06); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.3);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.3);
      });
    } catch (e) {}
  };
  // Glittery collect sound
  const playPearlCollectSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [1047, 1319, 1568, 2093, 2637].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.04);
        g.gain.setValueAtTime(0.22, now + i * 0.04); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.4);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.4);
      });
    } catch (e) {}
  };
  // Cash register-ish chime for purchase
  const playPurchaseSound = () => {
    try {
      const ctx = initAudio(); const now = ctx.currentTime;
      [659, 988, 1318].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, now + i * 0.08);
        g.gain.setValueAtTime(0.25, now + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.35);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.35);
      });
    } catch (e) {}
  };

  const toggleTask = (taskId) => {
    const today = todayKey();
    const wasChecked = history[today]?.[taskId];
    setHistory(prev => {
      const day = { ...(prev[today] || {}) };
      if (day[taskId]) delete day[taskId];
      else day[taskId] = true;
      return { ...prev, [today]: day };
    });
    if (!wasChecked) {
      playPopSound();
      setConfettiKey(k => k + 1);
      if (pet) {
        const todayCount = pet.dailyFruits.date === today ? pet.dailyFruits.count : 0;
        if (todayCount < DAILY_FRUIT_CAP) {
          const fruitId = pickFruit();
          const fruit = FRUITS.find(f => f.id === fruitId);
          setPet(p => ({
            ...p,
            fruits: { ...p.fruits, [fruitId]: (p.fruits[fruitId] || 0) + 1 },
            dailyFruits: { date: today, count: todayCount + 1 }
          }));
          setTimeout(() => {
            playFruitGainSound();
            setShowFruitGain({ emoji: fruit.emoji, name: fruit.name, key: Date.now(), capped: false });
            setTimeout(() => setShowFruitGain(null), 2500);
          }, 600);
        } else {
          setTimeout(() => {
            setShowFruitGain({ emoji: '🌙', name: '今日水果已滿', key: Date.now(), capped: true });
            setTimeout(() => setShowFruitGain(null), 2500);
          }, 600);
        }
      }
    }
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const emojis = ['🌸', '🍓', '🍡', '🧁', '🍭', '🌈', '⭐', '💖', '🎀', '🍬', '🦄', '☁️'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    setTasks(prev => [...prev, { id: Date.now().toString(), name: newTaskName.trim(), emoji }]);
    setNewTaskName('');
  };
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const getDiary = (key) => diaries[key] || { moods: [], moodsCustom: [], body: [], bodyCustom: [], text: '' };
  const updateDiary = (key, updater) => {
    setDiaries(prev => {
      const current = prev[key] || { moods: [], moodsCustom: [], body: [], bodyCustom: [], text: '' };
      return { ...prev, [key]: updater(current) };
    });
  };
  const toggleMood = (moodId) => {
    const today = todayKey();
    const diary = getDiary(today);
    const wasSelected = diary.moods.includes(moodId);
    updateDiary(today, d => ({ ...d, moods: wasSelected ? d.moods.filter(m => m !== moodId) : [...d.moods, moodId] }));
    if (!wasSelected) playDingSound();
  };
  const toggleBody = (bodyId) => {
    const today = todayKey();
    const diary = getDiary(today);
    const wasSelected = diary.body.includes(bodyId);
    updateDiary(today, d => ({ ...d, body: wasSelected ? d.body.filter(b => b !== bodyId) : [...d.body, bodyId] }));
    if (!wasSelected) playDingSound();
  };

  const confirmPetName = () => {
    const name = petNameInput.trim() || '小幽';
    if (pet) {
      setPet(p => ({ ...p, name }));
    } else {
      setPet({
        name,
        createdAt: new Date().toISOString(),
        level: 0, xp: 0,
        fruits: { strawberry: 0, apple: 0, grape: 0, peach: 0, cherry: 0 },
        owned: { furniture: [], backgrounds: ['pink'] },
        currentBg: 'pink',
        roomItems: [],
        claimedRewards: [],
        dailyFruits: { date: '', count: 0 },
        pearls: 0,
        nextPearlAt: Date.now() + PEARL_MIN_INTERVAL_MS,
      });
    }
    setShowNamePrompt(false);
    setPetNameInput('');
    showBubble(`嗨～我是 ${name}！很高興認識你 💗`);
  };

  const showBubble = (text) => {
    setPetBubble({ text });
    setPetAnimKey(k => k + 1);
    setTimeout(() => setPetBubble(null), 4500);
  };

  const collectPearl = () => {
    if (!activePearl || !pet) return;
    setPet(p => ({ ...p, pearls: (p.pearls || 0) + 1 }));
    setActivePearl(null);
    playPearlCollectSound();
    setShowPearlGain({ key: Date.now() });
    setTimeout(() => setShowPearlGain(null), 2500);
    showBubble('哇～珍珠！謝謝你撿起來 ✨');
  };

  const buyFurniture = (furnitureId) => {
    if (!pet) return;
    const furn = FURNITURE.find(f => f.id === furnitureId);
    if (!furn) return;
    const ageYears = getPetAgeYears(pet.createdAt);
    if (ageYears < furn.unlockAge) {
      setShopError(`要等 ${pet.name} ${furn.unlockAge} 歲才能解鎖喔～`);
      setTimeout(() => setShopError(null), 2500);
      return;
    }
    if (pet.owned.furniture.includes(furnitureId)) {
      setShopError('已經擁有這個家具囉！');
      setTimeout(() => setShopError(null), 2500);
      return;
    }
    if (pet.pearls < furn.pearlCost) {
      setShopError(`珍珠不夠～還差 ${furn.pearlCost - pet.pearls} 顆`);
      setTimeout(() => setShopError(null), 2500);
      return;
    }
    setPet(p => ({
      ...p,
      pearls: p.pearls - furn.pearlCost,
      owned: { ...p.owned, furniture: [...p.owned.furniture, furnitureId] }
    }));
    playPurchaseSound();
    setShopFlash({ id: furnitureId, key: Date.now() });
    setTimeout(() => setShopFlash(null), 1500);
  };

  const feedFruit = (fruitId) => {
    if (!pet || (pet.fruits[fruitId] || 0) <= 0) return;
    const fruit = FRUITS.find(f => f.id === fruitId);
    setPet(p => {
      const newFruits = { ...p.fruits, [fruitId]: p.fruits[fruitId] - 1 };
      let newXp = p.xp + 1;
      let newLevel = p.level;
      let leveledUp = false;
      while (newLevel < 100 && newXp >= xpForLevel(newLevel + 1)) {
        newXp -= xpForLevel(newLevel + 1);
        newLevel += 1;
        leveledUp = true;
      }
      if (leveledUp) {
        setTimeout(() => {
          playLevelUpSound();
          setShowLevelUp({ level: newLevel, key: Date.now() });
          setTimeout(() => setShowLevelUp(null), 3000);
        }, 400);
      }
      return { ...p, fruits: newFruits, xp: newXp, level: newLevel };
    });
    playNomSound();
    setPetAnimKey(k => k + 1);
    setPetHearts(h => h + 1);
    setTimeout(() => setPetHearts(h => Math.max(0, h - 1)), 2000);
    const eatMsgs = ['好好吃喔～', `${fruit.name}最棒了！`, '嚼嚼嚼...', '謝謝你 💗', '好幸福 ✨'];
    showBubble(eatMsgs[Math.floor(Math.random() * eatMsgs.length)]);
    setShowFruitPicker(false);
    setShowPetMenu(false);
  };

  const chatWithPet = () => {
    const all = [...PET_GREETINGS, ...PET_ENCOURAGEMENTS, ...PET_ENCOURAGEMENTS];
    showBubble(all[Math.floor(Math.random() * all.length)]);
    playDingSound();
    setShowPetMenu(false);
  };

  const renamePet = () => {
    setPetNameInput(pet?.name || '');
    setShowNamePrompt(true);
    setShowPetMenu(false);
  };

  const claimReward = (choice) => {
    playRewardSound();
    setPet(p => {
      const owned = { ...p.owned };
      if (choice.type === 'furniture') owned.furniture = [...owned.furniture, choice.id];
      else owned.backgrounds = [...owned.backgrounds, choice.id];
      return { ...p, owned, claimedRewards: [...p.claimedRewards, pendingReward.age] };
    });
    setPendingReward(null);
  };

  const addRoomItem = (furnitureId) => {
    const item = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      furnitureId,
      x: 30 + Math.random() * 40,
      y: 50 + Math.random() * 30,
    };
    setPet(p => ({ ...p, roomItems: [...p.roomItems, item] }));
  };
  const removeRoomItem = (itemId) => {
    setPet(p => ({ ...p, roomItems: p.roomItems.filter(i => i.id !== itemId) }));
  };
  const moveRoomItem = (itemId, x, y) => {
    setPet(p => ({ ...p, roomItems: p.roomItems.map(i => i.id === itemId ? { ...i, x, y } : i) }));
  };
  const setBackground = (bgId) => {
    setPet(p => ({ ...p, currentBg: bgId }));
  };

  const todayChecks = history[todayKey()] || {};
  const completedToday = tasks.filter(t => todayChecks[t.id]).length;
  const allDoneToday = tasks.length > 0 && completedToday === tasks.length;

  const now = new Date();
  const isBedtime = ((now.getHours() === 23 && now.getMinutes() >= 30) || now.getHours() === 0) && !allDoneToday && tasks.length > 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffd1dc 0%, #ffe4e1 50%, #e0bbe4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Quicksand", -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>👻</div>
      </div>
    );
  }

  const totalFruits = pet ? Object.values(pet.fruits).reduce((s, v) => s + v, 0) : 0;
  const todayFruitCount = pet && pet.dailyFruits.date === todayKey() ? pet.dailyFruits.count : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffd1dc 0%, #fff0f5 30%, #e0bbe4 70%, #c4e9ff 100%)',
      fontFamily: '"Quicksand", "Nunito", -apple-system, sans-serif',
      paddingBottom: '100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; }
        @keyframes bounce { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(5deg)} }
        @keyframes pop { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-20px) rotate(10deg)} }
        @keyframes confetti { 0%{transform:translateY(0) rotate(0); opacity:1} 100%{transform:translateY(-300px) rotate(720deg); opacity:0} }
        @keyframes wiggle { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes petWalk { 0%,100%{transform:translateY(0) scaleY(1)} 25%{transform:translateY(-2px) scaleY(0.99)} 75%{transform:translateY(-1px) scaleY(1.01)} }
        @keyframes petBounce { 0%{transform:scale(1)} 25%{transform:scale(1.15) translateY(-12px)} 50%{transform:scale(0.95) translateY(0)} 75%{transform:scale(1.05) translateY(-4px)} 100%{transform:scale(1) translateY(0)} }
        @keyframes heartFloat { 0%{opacity:1; transform:translateY(0) scale(0.5)} 50%{opacity:1; transform:translateY(-30px) scale(1.2)} 100%{opacity:0; transform:translateY(-60px) scale(0.8)} }
        @keyframes bubbleIn { 0%{opacity:0; transform:translate(-50%,10px) scale(0.8)} 100%{opacity:1; transform:translate(-50%,0) scale(1)} }
        @keyframes fruitGain { 0%{opacity:0; transform:translateX(-50%) translateY(20px) scale(0.5)} 20%{opacity:1; transform:translateX(-50%) translateY(0) scale(1.2)} 80%{opacity:1; transform:translateX(-50%) translateY(-10px) scale(1)} 100%{opacity:0; transform:translateX(-50%) translateY(-40px) scale(0.9)} }
        @keyframes levelUpRing { 0%{transform:translate(-50%,-50%) scale(0); opacity:1} 100%{transform:translate(-50%,-50%) scale(3); opacity:0} }
        @keyframes levelUpText { 0%{opacity:0; transform:translate(-50%,-50%) scale(0.5)} 30%{opacity:1; transform:translate(-50%,-50%) scale(1.2)} 70%{opacity:1; transform:translate(-50%,-50%) scale(1)} 100%{opacity:0; transform:translate(-50%,-100%) scale(0.9)} }
        @keyframes giftBounce { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-15px) rotate(-5deg)} }
        @keyframes sparkleSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pearlPulse { 0%,100%{transform:translate(-50%,-50%) scale(1); filter:drop-shadow(0 0 8px rgba(255,255,255,0.9))} 50%{transform:translate(-50%,-50%) scale(1.15); filter:drop-shadow(0 0 16px rgba(255,200,230,1))} }
        @keyframes pearlAppear { 0%{transform:translate(-50%,-50%) scale(0) rotate(0); opacity:0} 50%{opacity:1} 100%{transform:translate(-50%,-50%) scale(1) rotate(360deg); opacity:1} }
        @keyframes pearlCollect { 0%{transform:translate(-50%,-50%) scale(1); opacity:1} 100%{transform:translate(-50%,-50%) scale(2.5); opacity:0} }
        @keyframes shopFlash { 0%,100%{background-color:white} 50%{background-color:#a3e0a3} }
        .candy-btn { transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .candy-btn:active { transform: scale(0.95); }
        .task-card { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .task-card:active { transform: scale(0.97); }
        .floating-deco { position: absolute; opacity: 0.4; pointer-events: none; }
        input:focus, textarea:focus { outline: none; }
        .chip { transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .chip:active { transform: scale(0.92); }
      `}</style>

      <div className="floating-deco" style={{ top: '10%', left: '5%', fontSize: '2rem', animation: 'float 6s ease-in-out infinite' }}>☁️</div>
      <div className="floating-deco" style={{ top: '20%', right: '8%', fontSize: '1.5rem', animation: 'float 7s ease-in-out infinite 1s' }}>✨</div>
      <div className="floating-deco" style={{ top: '60%', left: '3%', fontSize: '1.8rem', animation: 'float 8s ease-in-out infinite 2s' }}>🌸</div>
      <div className="floating-deco" style={{ top: '75%', right: '5%', fontSize: '1.6rem', animation: 'float 6.5s ease-in-out infinite 0.5s' }}>💖</div>

      {confettiKey > 0 && (
        <div key={confettiKey} style={{ position: 'fixed', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 100 }}>
          {['🌸', '⭐', '💖', '🍭', '✨', '🎀', '🌈', '💫'].map((e, i) => (
            <div key={i} style={{
              position: 'absolute', fontSize: '1.5rem',
              left: `${(i - 4) * 30}px`,
              animation: `confetti 1.2s ease-out forwards`,
              animationDelay: `${i * 0.05}s`
            }}>{e}</div>
          ))}
        </div>
      )}

      {showFruitGain && (
        <div key={showFruitGain.key} style={{
          position: 'fixed', top: '120px', left: '50%',
          background: showFruitGain.capped ? 'linear-gradient(135deg, #e8e0f5, #d4c4ff)' : 'linear-gradient(135deg, #fff4e6, #ffe0f0)',
          border: showFruitGain.capped ? '2px solid #b8a3d4' : '2px solid #ffb3d9',
          borderRadius: '20px', padding: '12px 20px',
          fontWeight: 700, color: showFruitGain.capped ? '#7a6b8a' : '#a04060',
          fontSize: '0.9rem', zIndex: 150,
          boxShadow: '0 8px 24px rgba(255, 158, 199, 0.4)',
          animation: 'fruitGain 2.5s ease-out forwards',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{showFruitGain.emoji}</span>
          {showFruitGain.capped ? '今日水果已收滿，明天再來～' : `獲得 ${showFruitGain.name} +1！`}
        </div>
      )}

      {showPearlGain && (
        <div key={showPearlGain.key} style={{
          position: 'fixed', top: '120px', left: '50%',
          background: 'linear-gradient(135deg, #f0f4ff, #fce4ff)',
          border: '2px solid #c4a3ff',
          borderRadius: '20px', padding: '12px 20px',
          fontWeight: 700, color: '#6b4a7a',
          fontSize: '0.9rem', zIndex: 150,
          boxShadow: '0 8px 24px rgba(196, 163, 255, 0.5)',
          animation: 'fruitGain 2.5s ease-out forwards',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🦪</span>
          收集到一顆珍珠！
        </div>
      )}

      {showLevelUp && (
        <div key={showLevelUp.key} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 180 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '200px', height: '200px', borderRadius: '50%',
            border: '4px solid #ff6b9d',
            animation: 'levelUpRing 1s ease-out forwards'
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            background: 'linear-gradient(135deg, #fff0f5, #fce4ff)',
            padding: '20px 32px', borderRadius: '24px',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.4)',
            textAlign: 'center',
            animation: 'levelUpText 3s ease-out forwards'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🎉✨</div>
            <div style={{
              fontFamily: '"Fredoka", sans-serif', fontSize: '1.3rem', fontWeight: 700,
              background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>升級到 LV {showLevelUp.level}！</div>
          </div>
        </div>
      )}

      <div style={{ padding: '24px 20px 16px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: '"Fredoka", sans-serif',
          fontSize: '2rem', margin: 0,
          background: 'linear-gradient(90deg, #ff6b9d, #c44dff, #6bb5ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', fontWeight: 700, letterSpacing: '-0.02em'
        }}>🎀 每日任務</h1>
        <p style={{ margin: '4px 0 0', color: '#a06b8a', fontSize: '0.85rem', fontWeight: 500 }}>
          {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {isBedtime && view === 'today' && (
        <div style={{
          margin: '0 20px 16px', padding: '14px 16px',
          background: 'linear-gradient(135deg, #fff4e6, #ffe0ec)',
          border: '2px dashed #ff9ec7', borderRadius: '20px',
          fontSize: '0.9rem', color: '#a04060', textAlign: 'center',
          animation: 'wiggle 2s ease-in-out infinite',
          position: 'relative', zIndex: 2
        }}>🌙 睡前提醒～還有任務沒打勾喔！</div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {view === 'today' && (
          <>
            <TodayView
              tasks={tasks} todayChecks={todayChecks}
              completedToday={completedToday} allDoneToday={allDoneToday}
              toggleTask={toggleTask} todayFruitCount={todayFruitCount}
            />
            {pet && (
              <PetSection
                pet={pet} petX={petX} petDir={petDir}
                showPetMenu={showPetMenu} setShowPetMenu={setShowPetMenu}
                showFruitPicker={showFruitPicker} setShowFruitPicker={setShowFruitPicker}
                petBubble={petBubble} petAnimKey={petAnimKey} petHearts={petHearts}
                feedFruit={feedFruit} chatWithPet={chatWithPet}
                renamePet={renamePet} totalFruits={totalFruits}
                activePearl={activePearl} collectPearl={collectPearl}
              />
            )}
          </>
        )}

        {view === 'room' && pet && (
          <RoomView
            pet={pet} setBackground={setBackground}
            addRoomItem={addRoomItem} removeRoomItem={removeRoomItem}
            moveRoomItem={moveRoomItem}
            editingRoom={editingRoom} setEditingRoom={setEditingRoom}
            draggingItem={draggingItem} setDraggingItem={setDraggingItem}
            setShowShop={setShowShop}
          />
        )}

        {view === 'diary' && (
          <DiaryView
            diary={getDiary(todayKey())}
            toggleMood={toggleMood} toggleBody={toggleBody}
            updateDiary={updateDiary} todayKey={todayKey}
            playDingSound={playDingSound}
          />
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks} history={history} diaries={diaries}
            month={calendarMonth} setMonth={setCalendarMonth}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            dateKey={dateKey}
          />
        )}

        {view === 'manage' && (
          <ManageView
            tasks={tasks} newTaskName={newTaskName}
            setNewTaskName={setNewTaskName}
            addTask={addTask} deleteTask={deleteTask}
          />
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(255, 209, 220, 0.5)',
        padding: '6px 4px calc(14px + env(safe-area-inset-bottom))',
        display: 'flex', justifyContent: 'space-around',
        zIndex: 50
      }}>
        {[
          { id: 'today', icon: ListTodo, label: '今日' },
          { id: 'diary', icon: BookHeart, label: '日記' },
          { id: 'room', icon: Home, label: '小窩' },
          { id: 'calendar', icon: CalendarIcon, label: '日曆' },
          { id: 'manage', icon: Sparkles, label: '管理' }
        ].map(item => (
          <button
            key={item.id} className="candy-btn"
            onClick={() => setView(item.id)}
            style={{
              border: 'none',
              background: view === item.id ? 'linear-gradient(135deg, #ff9ec7, #c4a3ff)' : 'transparent',
              color: view === item.id ? 'white' : '#a06b8a',
              padding: '8px 8px', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem',
              boxShadow: view === item.id ? '0 4px 12px rgba(255, 158, 199, 0.4)' : 'none'
            }}
          >
            <item.icon size={18} strokeWidth={2.5} />
            {item.label}
          </button>
        ))}
      </div>

      {showNamePrompt && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(122, 74, 107, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 200
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff0f5, #fce4ff)',
            borderRadius: '28px', padding: '32px 24px 24px',
            maxWidth: '340px', width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <PetSVG size={100} animKey={0} ageYears={0} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontFamily: '"Fredoka", sans-serif', color: '#7a4a6b', fontSize: '1.3rem' }}>
              {pet ? '幫我換個名字～' : '你好呀！'}
            </h2>
            <p style={{ margin: '0 0 20px', color: '#a06b8a', fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
              {pet ? '你想叫我什麼呢？' : '我是一隻軟軟的小幽靈～\n你想叫我什麼名字呢？'}
            </p>
            <input
              type="text" value={petNameInput}
              onChange={e => setPetNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmPetName()}
              placeholder="幫我取個可愛的名字..."
              maxLength={10} autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '16px',
                border: '2px solid #ffd1dc', background: 'white',
                fontSize: '1rem', fontFamily: 'inherit', color: '#5a3a4a',
                textAlign: 'center', marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {pet && (
                <button
                  onClick={() => { setShowNamePrompt(false); setPetNameInput(''); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '16px', border: 'none',
                    background: 'rgba(255, 209, 220, 0.4)', color: '#a06b8a',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem'
                  }}
                >取消</button>
              )}
              <button
                onClick={confirmPetName}
                style={{
                  flex: 2, padding: '12px', borderRadius: '16px', border: 'none',
                  background: 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
                  fontFamily: 'inherit', fontSize: '0.95rem'
                }}
              >{pet ? '改好了！' : '就叫這個！'}</button>
            </div>
          </div>
        </div>
      )}

      {pendingReward && pet && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(122, 74, 107, 0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 250
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff0f5, #fce4ff, #fff4e6)',
            borderRadius: '28px', padding: '24px 20px',
            maxWidth: '380px', width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.4)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-8px', left: '20%', fontSize: '1.5rem', animation: 'sparkleSpin 4s linear infinite' }}>✨</div>
            <div style={{ position: 'absolute', top: '-12px', right: '15%', fontSize: '1.3rem', animation: 'sparkleSpin 3s linear infinite reverse' }}>🌟</div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem', animation: 'giftBounce 1s ease-in-out infinite' }}>🎁</div>
              <h2 style={{
                margin: '8px 0 4px', fontFamily: '"Fredoka", sans-serif',
                fontSize: '1.4rem',
                background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{pet.name} {pendingReward.age} 歲了！🎉</h2>
              <p style={{ margin: 0, color: '#a06b8a', fontSize: '0.85rem' }}>選一個禮物吧～</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingReward.choices.map((choice, i) => (
                <button
                  key={i} onClick={() => claimReward(choice)} className="candy-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '2px solid #ffd1dc', borderRadius: '18px',
                    cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '12px',
                    background: choice.type === 'background' ? choice.gradient : 'linear-gradient(135deg, #fff0f5, #fce4ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', flexShrink: 0
                  }}>
                    {choice.type === 'furniture' ? choice.emoji : '🖼️'}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#5a3a4a', fontSize: '0.95rem' }}>
                      {choice.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#a06b8a' }}>
                      {choice.type === 'furniture' ? '小家具' : '房間背景'}
                    </div>
                  </div>
                  <Gift size={18} color="#ff6b9d" />
                </button>
              ))}
            </div>
            <p style={{
              textAlign: 'center', margin: '14px 0 0',
              fontSize: '0.72rem', color: '#a06b8a'
            }}>到「小窩」頁面布置 {pet.name} 的家吧 🏠</p>
          </div>
        </div>
      )}

      {showShop && pet && (
        <ShopModal
          pet={pet}
          buyFurniture={buyFurniture}
          shopFlash={shopFlash}
          shopError={shopError}
          onClose={() => setShowShop(false)}
        />
      )}

      {showWeeklySummary && weeklyData && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(122, 74, 107, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 200
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff0f5, #fce4ff, #e0f0ff)',
            borderRadius: '28px', padding: '28px 24px',
            maxWidth: '360px', width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowWeeklySummary(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'rgba(255, 255, 255, 0.7)', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            ><X size={18} color="#a06b8a" /></button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Trophy size={36} color="#ff9ec7" style={{ marginBottom: '4px' }} />
              <h2 style={{
                margin: 0, fontFamily: '"Fredoka", sans-serif',
                background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>這週的總結 ✨</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weeklyData.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '16px'
                }}>
                  <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 600, color: '#5a3a4a' }}>{s.name}</span>
                  <span style={{
                    fontWeight: 700,
                    color: s.count >= 5 ? '#6bb56b' : s.count >= 3 ? '#d4a050' : '#d4587a',
                    fontSize: '0.95rem'
                  }}>{s.count}/7 天</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '18px', marginBottom: 0, color: '#7a4a6b', fontSize: '0.85rem' }}>下週繼續加油！💪🌸</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopModal({ pet, buyFurniture, shopFlash, shopError, onClose }) {
  const ageYears = getPetAgeYears(pet.createdAt);
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(122, 74, 107, 0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', zIndex: 220
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5, #fce4ff, #f0e0ff)',
        borderRadius: '24px', padding: '20px 16px 16px',
        maxWidth: '420px', width: '100%',
        maxHeight: '85vh',
        border: '3px solid white',
        boxShadow: '0 20px 60px rgba(196, 77, 255, 0.4)',
        position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255, 255, 255, 0.8)', border: 'none',
            width: '30px', height: '30px', borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5
          }}
        ><X size={16} color="#a06b8a" /></button>

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '1.8rem' }}>🛍️</div>
          <h2 style={{
            margin: '4px 0 4px',
            fontFamily: '"Fredoka", sans-serif',
            fontSize: '1.2rem',
            background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>珍珠商店</h2>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem', fontWeight: 700, color: '#7a4a6b'
          }}>
            🦪 你有 {pet.pearls || 0} 顆珍珠
          </div>
        </div>

        {shopError && (
          <div style={{
            padding: '8px 14px', marginBottom: '10px',
            background: 'rgba(255, 200, 200, 0.7)',
            border: '2px solid #ff9999',
            borderRadius: '14px',
            fontSize: '0.82rem', color: '#a04060',
            textAlign: 'center', fontWeight: 600
          }}>{shopError}</div>
        )}

        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          padding: '4px'
        }}>
          {FURNITURE.map(f => {
            const owned = pet.owned.furniture.includes(f.id);
            const ageLocked = ageYears < f.unlockAge;
            const canAfford = pet.pearls >= f.pearlCost;
            const flashing = shopFlash?.id === f.id;
            return (
              <button
                key={f.id}
                onClick={() => !owned && !ageLocked && buyFurniture(f.id)}
                disabled={owned}
                style={{
                  padding: '10px 8px',
                  borderRadius: '14px',
                  border: '2px solid',
                  borderColor: owned ? '#a3e0a3' : ageLocked ? 'rgba(200, 200, 200, 0.5)' : '#ffd1dc',
                  background: owned ? 'rgba(220, 245, 220, 0.6)' : ageLocked ? 'rgba(240, 240, 240, 0.5)' : 'white',
                  cursor: owned || ageLocked ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '4px',
                  opacity: ageLocked ? 0.5 : 1,
                  fontFamily: 'inherit',
                  position: 'relative',
                  animation: flashing ? 'shopFlash 1.5s ease' : 'none',
                  transition: 'transform 0.2s'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{ageLocked ? '🔒' : f.emoji}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5a3a4a' }}>
                  {f.name}
                </span>
                {owned ? (
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, color: '#5a8a5a',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}>
                    <Check size={10} strokeWidth={3} /> 已擁有
                  </div>
                ) : ageLocked ? (
                  <div style={{ fontSize: '0.65rem', color: '#a06b8a', fontWeight: 600 }}>
                    {f.unlockAge} 歲解鎖
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: canAfford ? '#7a4a6b' : '#c089a3',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}>
                    🦪 {f.pearlCost}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p style={{
          margin: '10px 0 0',
          fontSize: '0.7rem', color: '#a06b8a',
          textAlign: 'center'
        }}>到「小窩」頁面布置買到的家具～</p>
      </div>
    </div>
  );
}

function PetSVG({ size = 120, animKey = 0, ageYears = 0, facing = 1 }) {
  const sizeMultiplier = ageYears < 0.5 ? 0.7 : ageYears < 1.5 ? 0.85 : ageYears < 3 ? 0.95 : 1;
  const finalSize = size * sizeMultiplier;
  return (
    <div
      key={animKey}
      style={{
        width: finalSize, height: finalSize,
        animation: animKey > 0 ? 'petBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'petWalk 1.5s ease-in-out infinite',
        display: 'inline-block',
        transform: `scaleX(${facing})`,
        transition: 'transform 0.3s'
      }}
    >
      <svg viewBox="0 0 120 120" width={finalSize} height={finalSize}>
        <defs>
          <radialGradient id="petBody" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ffe0eb" />
            <stop offset="60%" stopColor="#ffb3d1" />
            <stop offset="100%" stopColor="#ff8ab8" />
          </radialGradient>
          <radialGradient id="petCheek" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0" />
          </radialGradient>
          <filter id="petShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path
          d="M 60 15 C 35 15, 22 35, 22 55 L 22 92
             C 22 96, 26 98, 30 95 C 33 92, 37 92, 40 95
             C 43 98, 47 98, 50 95 C 53 92, 57 92, 60 95
             C 63 98, 67 98, 70 95 C 73 92, 77 92, 80 95
             C 83 98, 87 98, 90 95 C 94 98, 98 96, 98 92
             L 98 55 C 98 35, 85 15, 60 15 Z"
          fill="url(#petBody)" filter="url(#petShadow)"
        />
        <ellipse cx="38" cy="62" rx="9" ry="6" fill="url(#petCheek)" />
        <ellipse cx="82" cy="62" rx="9" ry="6" fill="url(#petCheek)" />
        <circle cx="46" cy="52" r="4" fill="#3d2933" />
        <circle cx="74" cy="52" r="4" fill="#3d2933" />
        <circle cx="44.5" cy="50.5" r="1.4" fill="white" />
        <circle cx="72.5" cy="50.5" r="1.4" fill="white" />
        <path d="M 53 65 Q 60 70, 67 65" stroke="#3d2933" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="48" cy="28" rx="8" ry="5" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}

function PetSection({ pet, petX, petDir, showPetMenu, setShowPetMenu, showFruitPicker, setShowFruitPicker, petBubble, petAnimKey, petHearts, feedFruit, chatWithPet, renamePet, totalFruits, activePearl, collectPearl }) {
  const ageYears = getPetAgeYears(pet.createdAt);
  const stage = getPetStage(ageYears);
  const ageDisplay = ageYears < 1 ? `${Math.floor(ageYears * 12)}個月` : `${ageYears.toFixed(1)} 歲`;
  const xpNeeded = pet.level >= 100 ? 0 : xpForLevel(pet.level + 1);
  const xpPct = pet.level >= 100 ? 100 : (pet.xp / xpNeeded) * 100;

  return (
    <div style={{ padding: '24px 20px 0', position: 'relative' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9), rgba(252, 228, 255, 0.85))',
        backdropFilter: 'blur(10px)',
        borderRadius: '28px',
        padding: '16px 16px 20px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.2)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '10px', padding: '0 4px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: '#7a4a6b', fontSize: '1rem', fontFamily: '"Fredoka", sans-serif' }}>
              {pet.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#a06b8a' }}>
              {stage.emoji} {stage.name} · {ageDisplay}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontWeight: 700, fontSize: '1.1rem',
              fontFamily: '"Fredoka", sans-serif',
              background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>LV {pet.level}</div>
            <div style={{ fontSize: '0.7rem', color: '#a06b8a' }}>
              🍓 {totalFruits} · 🦪 {pet.pearls || 0}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '12px', padding: '0 4px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.7rem', color: '#a06b8a', marginBottom: '3px', fontWeight: 600
          }}>
            <span>經驗值</span>
            <span>{pet.level >= 100 ? 'MAX' : `${pet.xp}/${xpNeeded}`}</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(255, 209, 220, 0.4)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${xpPct}%`,
              background: 'linear-gradient(90deg, #ff9ec7, #ffb3d9, #c4a3ff)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
              borderRadius: '999px',
              transition: 'width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }} />
          </div>
        </div>

        <div style={{
          position: 'relative', height: '160px',
          background: 'linear-gradient(180deg, rgba(255, 240, 245, 0.5), rgba(255, 230, 245, 0.7))',
          borderRadius: '20px',
          border: '2px dashed rgba(255, 158, 199, 0.4)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: '8px', left: '12%', fontSize: '0.9rem', opacity: 0.5 }}>🌸</div>
          <div style={{ position: 'absolute', bottom: '12px', right: '15%', fontSize: '0.8rem', opacity: 0.5 }}>🌷</div>
          <div style={{ position: 'absolute', top: '8px', left: '20%', fontSize: '0.7rem', opacity: 0.4 }}>✨</div>
          <div style={{ position: 'absolute', top: '12px', right: '25%', fontSize: '0.8rem', opacity: 0.4 }}>☁️</div>

          {petBubble && (
            <div style={{
              position: 'absolute', top: '8px',
              left: `${petX}%`, transform: 'translateX(-50%)',
              background: 'white', padding: '6px 12px',
              borderRadius: '14px', border: '2px solid #ffd1dc',
              boxShadow: '0 4px 12px rgba(255, 158, 199, 0.3)',
              fontSize: '0.78rem', fontWeight: 600, color: '#5a3a4a',
              whiteSpace: 'nowrap', maxWidth: '180px',
              overflow: 'hidden', textOverflow: 'ellipsis',
              zIndex: 10,
              animation: 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}>{petBubble.text}</div>
          )}

          {petHearts > 0 && (
            <div style={{
              position: 'absolute', bottom: '60px',
              left: `${petX}%`, transform: 'translateX(-50%)',
              pointerEvents: 'none', zIndex: 5
            }}>
              {[...Array(petHearts)].map((_, i) => (
                <div key={`${petHearts}-${i}`} style={{
                  position: 'absolute', fontSize: '1.2rem',
                  left: `${(i - petHearts / 2) * 16}px`,
                  animation: 'heartFloat 2s ease-out forwards',
                  animationDelay: `${i * 0.1}s`
                }}>💗</div>
              ))}
            </div>
          )}

          {/* Active pearl on screen */}
          {activePearl && (
            <button
              key={activePearl.key}
              onClick={collectPearl}
              style={{
                position: 'absolute',
                left: `${activePearl.x}%`,
                top: `${activePearl.y}%`,
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 0,
                fontSize: '1.8rem', zIndex: 8,
                animation: 'pearlAppear 0.5s ease-out, pearlPulse 1.5s ease-in-out 0.5s infinite'
              }}
              aria-label="撿起珍珠"
            >🦪</button>
          )}

          <button
            onClick={() => setShowPetMenu(s => !s)}
            style={{
              position: 'absolute', bottom: '8px',
              left: `${petX}%`, transform: 'translateX(-50%)',
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 0,
              transition: 'left 1s linear'
            }}
          >
            <PetSVG size={90} animKey={petAnimKey} ageYears={ageYears} facing={petDir} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#a06b8a' }}>
          {activePearl ? '✨ 有珍珠！點 🦪 撿起來' : `點 ${pet.name} 互動 💕`}
          <button onClick={renamePet} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.7rem', color: '#c089a3', fontFamily: 'inherit',
            marginLeft: '6px'
          }}>(改名)</button>
        </div>

        {showPetMenu && !showFruitPicker && (
          <div style={{
            display: 'flex', gap: '8px', justifyContent: 'center',
            marginTop: '12px', flexWrap: 'wrap',
            animation: 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            <button
              onClick={() => setShowFruitPicker(true)}
              className="candy-btn" disabled={totalFruits === 0}
              style={{
                padding: '10px 18px', borderRadius: '999px', border: 'none',
                background: totalFruits === 0 ? 'rgba(255, 209, 220, 0.5)' : 'linear-gradient(135deg, #ffb3d9, #ff9ec7)',
                color: totalFruits === 0 ? '#a06b8a' : 'white',
                fontWeight: 700, cursor: totalFruits === 0 ? 'default' : 'pointer',
                fontSize: '0.85rem',
                boxShadow: totalFruits === 0 ? 'none' : '0 4px 12px rgba(255, 158, 199, 0.4)',
                fontFamily: 'inherit'
              }}
            >🍓 餵食 ({totalFruits})</button>
            <button
              onClick={chatWithPet} className="candy-btn"
              style={{
                padding: '10px 18px', borderRadius: '999px', border: 'none',
                background: 'linear-gradient(135deg, #d4b3ff, #c4a3ff)',
                color: 'white', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(196, 163, 255, 0.4)',
                fontFamily: 'inherit'
              }}
            >💬 聊天</button>
          </div>
        )}

        {showFruitPicker && (
          <div style={{
            marginTop: '12px', padding: '14px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '18px',
            animation: 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontWeight: 700, color: '#7a4a6b', fontSize: '0.9rem' }}>
                選一顆水果餵 {pet.name}
              </span>
              <button
                onClick={() => setShowFruitPicker(false)}
                style={{
                  background: 'rgba(255, 209, 220, 0.4)',
                  border: 'none', width: '24px', height: '24px',
                  borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              ><X size={14} color="#a06b8a" /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {FRUITS.map(f => {
                const count = pet.fruits[f.id] || 0;
                const disabled = count === 0;
                return (
                  <button
                    key={f.id}
                    onClick={() => !disabled && feedFruit(f.id)}
                    disabled={disabled} className="candy-btn"
                    style={{
                      padding: '8px 14px', borderRadius: '14px', border: '2px solid',
                      borderColor: disabled ? 'rgba(255, 209, 220, 0.3)' : '#ffb3d9',
                      background: disabled ? 'rgba(255, 240, 245, 0.4)' : 'white',
                      cursor: disabled ? 'default' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{f.emoji}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#5a3a4a' }}>×{count}</span>
                  </button>
                );
              })}
            </div>
            <p style={{
              fontSize: '0.7rem', color: '#a06b8a',
              textAlign: 'center', marginTop: '10px', marginBottom: 0
            }}>每顆水果 +1 經驗值 ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RoomView({ pet, setBackground, addRoomItem, removeRoomItem, moveRoomItem, editingRoom, setEditingRoom, draggingItem, setDraggingItem, setShowShop }) {
  const ageYears = getPetAgeYears(pet.createdAt);
  const currentBg = BACKGROUNDS.find(b => b.id === pet.currentBg) || BACKGROUNDS[0];
  const ownedFurniture = FURNITURE.filter(f => pet.owned.furniture.includes(f.id));
  const ownedBackgrounds = BACKGROUNDS.filter(b => pet.owned.backgrounds.includes(b.id));
  const roomRef = useRef(null);

  const handleRoomTouch = (e) => {
    if (!editingRoom || !draggingItem) return;
    e.preventDefault();
    const rect = roomRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    moveRoomItem(draggingItem, Math.max(5, Math.min(90, x)), Math.max(5, Math.min(85, y)));
  };
  const handleRoomEnd = () => setDraggingItem(null);

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', padding: '0 4px'
      }}>
        <h3 style={{
          margin: 0, fontFamily: '"Fredoka", sans-serif', color: '#7a4a6b',
          fontSize: '1.1rem'
        }}>🏠 {pet.name} 的小窩</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setShowShop(true)}
            className="candy-btn"
            style={{
              padding: '8px 12px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #c4e9ff, #a3c9ff)',
              color: 'white', fontWeight: 700, cursor: 'pointer',
              fontSize: '0.8rem', fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(107, 181, 255, 0.3)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <ShoppingBag size={14} strokeWidth={2.5} /> 商店 🦪{pet.pearls || 0}
          </button>
          <button
            onClick={() => setEditingRoom(e => !e)}
            className="candy-btn"
            style={{
              padding: '8px 12px', borderRadius: '14px', border: 'none',
              background: editingRoom ? 'linear-gradient(135deg, #a3e0a3, #7fcc7f)' : 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
              color: 'white', fontWeight: 700, cursor: 'pointer',
              fontSize: '0.8rem', fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(255, 158, 199, 0.3)'
            }}
          >{editingRoom ? '完成 ✓' : '布置 ✏️'}</button>
        </div>
      </div>

      <div
        ref={roomRef}
        onTouchMove={handleRoomTouch}
        onTouchEnd={handleRoomEnd}
        onMouseMove={editingRoom && draggingItem ? handleRoomTouch : undefined}
        onMouseUp={handleRoomEnd}
        style={{
          position: 'relative',
          height: '320px',
          background: currentBg.gradient,
          borderRadius: '24px',
          border: '3px solid white',
          boxShadow: '0 8px 24px rgba(255, 158, 199, 0.2)',
          overflow: 'hidden',
          marginBottom: '16px',
          touchAction: 'none'
        }}
      >
        <div style={{
          position: 'absolute', bottom: '60px', left: 0, right: 0,
          height: '2px', background: 'rgba(255, 255, 255, 0.5)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15px', left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <PetSVG size={80} animKey={0} ageYears={ageYears} facing={1} />
        </div>
        {pet.roomItems.map(item => {
          const furn = FURNITURE.find(f => f.id === item.furnitureId);
          if (!furn) return null;
          const isDragging = draggingItem === item.id;
          return (
            <div
              key={item.id}
              onTouchStart={editingRoom ? (e) => { e.stopPropagation(); setDraggingItem(item.id); } : undefined}
              onMouseDown={editingRoom ? (e) => { e.stopPropagation(); setDraggingItem(item.id); } : undefined}
              style={{
                position: 'absolute',
                left: `${item.x}%`, top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '2.4rem',
                cursor: editingRoom ? 'move' : 'default',
                userSelect: 'none',
                filter: isDragging ? 'drop-shadow(0 4px 8px rgba(255, 107, 157, 0.6))' : 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15))',
                transition: isDragging ? 'none' : 'filter 0.2s',
                touchAction: 'none'
              }}
            >
              {furn.emoji}
              {editingRoom && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeRoomItem(item.id); }}
                  onTouchEnd={(e) => { e.stopPropagation(); }}
                  style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    width: '20px', height: '20px',
                    borderRadius: '50%', border: 'none',
                    background: '#ff6b9d', color: 'white',
                    fontSize: '0.7rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                ><X size={12} strokeWidth={3} /></button>
              )}
            </div>
          );
        })}
        {pet.roomItems.length === 0 && !editingRoom && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(122, 74, 107, 0.5)',
            fontSize: '0.85rem', textAlign: 'center', fontWeight: 600
          }}>
            點「布置」開始裝飾 ✨<br/>或到「商店」買新家具 🛍️
          </div>
        )}
      </div>

      {editingRoom && (
        <>
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '18px', padding: '14px',
            marginBottom: '12px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(255, 158, 199, 0.15)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#7a4a6b', fontWeight: 700, marginBottom: '8px' }}>
              🖼️ 背景 ({ownedBackgrounds.length}/{BACKGROUNDS.length})
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {BACKGROUNDS.map(b => {
                const owned = pet.owned.backgrounds.includes(b.id);
                const active = pet.currentBg === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => owned && setBackground(b.id)}
                    disabled={!owned} className="candy-btn"
                    style={{
                      flex: '0 0 auto',
                      width: '72px', height: '50px',
                      borderRadius: '12px',
                      border: active ? '3px solid #ff6b9d' : '2px solid rgba(255, 209, 220, 0.5)',
                      background: owned ? b.gradient : 'rgba(200, 200, 200, 0.3)',
                      cursor: owned ? 'pointer' : 'default',
                      opacity: owned ? 1 : 0.4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700,
                      color: '#5a3a4a', position: 'relative', padding: '4px'
                    }}
                  >
                    {!owned && <span style={{ fontSize: '0.9rem' }}>🔒 {b.unlockAge}歲</span>}
                    {owned && b.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '18px', padding: '14px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(255, 158, 199, 0.15)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#7a4a6b', fontWeight: 700, marginBottom: '8px' }}>
              🪑 家具 ({ownedFurniture.length}/{FURNITURE.length}) — 點一下放進房間
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
              gap: '8px'
            }}>
              {FURNITURE.map(f => {
                const owned = pet.owned.furniture.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => owned && addRoomItem(f.id)}
                    disabled={!owned} className="candy-btn"
                    style={{
                      aspectRatio: '1',
                      borderRadius: '14px',
                      border: '2px solid',
                      borderColor: owned ? '#ffd1dc' : 'rgba(200, 200, 200, 0.3)',
                      background: owned ? 'white' : 'rgba(240, 240, 240, 0.4)',
                      cursor: owned ? 'pointer' : 'default',
                      opacity: owned ? 1 : 0.4,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '2px', padding: '4px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{owned ? f.emoji : '🔒'}</span>
                    <span style={{ fontSize: '0.55rem', color: '#7a4a6b', fontWeight: 600 }}>
                      {owned ? f.name : `${f.unlockAge}歲`}
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{
              fontSize: '0.7rem', color: '#a06b8a',
              textAlign: 'center', marginTop: '10px', marginBottom: 0
            }}>長按家具拖移位置 · 點 ❌ 移除</p>
          </div>
        </>
      )}

      {!editingRoom && pet.roomItems.length > 0 && (
        <div style={{
          textAlign: 'center', fontSize: '0.78rem',
          color: '#a06b8a', padding: '8px'
        }}>
          已放置 {pet.roomItems.length} 個小東西 ✨
        </div>
      )}
    </div>
  );
}

function TodayView({ tasks, todayChecks, completedToday, allDoneToday, toggleTask, todayFruitCount }) {
  return (
    <div style={{ padding: '0 20px' }}>
      {tasks.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px', padding: '40px 24px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(255, 158, 199, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌷</div>
          <p style={{ color: '#a06b8a', margin: 0, fontWeight: 600 }}>還沒有任務呢！</p>
          <p style={{ color: '#c089a3', margin: '4px 0 0', fontSize: '0.85rem' }}>到「管理」頁面新增吧～</p>
        </div>
      ) : (
        <>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.9))',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px', padding: '20px',
            marginBottom: '16px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: '#7a4a6b' }}>今日進度 {completedToday}/{tasks.length}</span>
              {allDoneToday && <span style={{ fontSize: '1.2rem' }}>🎉</span>}
            </div>
            <div style={{ height: '12px', background: 'rgba(255, 209, 220, 0.4)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${tasks.length ? (completedToday / tasks.length) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #ff9ec7, #ffb3d9, #c4a3ff, #a3c9ff)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite',
                borderRadius: '999px',
                transition: 'width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: '#a06b8a', textAlign: 'center' }}>
              🍓 今日水果 {todayFruitCount}/{DAILY_FRUIT_CAP} 顆 {todayFruitCount >= DAILY_FRUIT_CAP ? '· 已收滿' : ''}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map(task => {
              const checked = !!todayChecks[task.id];
              return (
                <div
                  key={task.id} className="task-card"
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 18px',
                    background: checked
                      ? 'linear-gradient(135deg, rgba(255, 209, 220, 0.95), rgba(196, 169, 255, 0.85))'
                      : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: checked ? '0 4px 16px rgba(255, 158, 199, 0.3)' : '0 4px 12px rgba(255, 158, 199, 0.1)',
                    cursor: 'pointer',
                    opacity: checked ? 0.85 : 1
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: checked ? 'linear-gradient(135deg, #ff9ec7, #c4a3ff)' : 'rgba(255, 255, 255, 0.9)',
                    border: checked ? 'none' : '2.5px solid #ffc1d6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    boxShadow: checked ? '0 2px 8px rgba(255, 158, 199, 0.4)' : 'none'
                  }}>
                    {checked && <Check size={18} color="white" strokeWidth={3} style={{ animation: 'pop 0.4s' }} />}
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>{task.emoji}</span>
                  <span style={{
                    flex: 1, fontSize: '1.05rem', fontWeight: 600,
                    color: checked ? '#8b5a7a' : '#5a3a4a',
                    textDecoration: checked ? 'line-through' : 'none',
                    textDecorationColor: '#ff9ec7',
                    textDecorationThickness: '2px'
                  }}>{task.name}</span>
                </div>
              );
            })}
          </div>

          {allDoneToday && (
            <div style={{
              marginTop: '20px', padding: '20px',
              background: 'linear-gradient(135deg, #fff4e6, #ffe0f0, #f0e0ff)',
              borderRadius: '24px', textAlign: 'center',
              border: '2px dashed #ffb3d9',
              animation: 'wiggle 2s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🌟✨🎀</div>
              <p style={{ margin: 0, color: '#a04060', fontWeight: 700 }}>今天全部完成啦！好棒～</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DiaryView({ diary, toggleMood, toggleBody, updateDiary, todayKey, playDingSound }) {
  const [moodInput, setMoodInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [textDraft, setTextDraft] = useState(diary.text || '');
  const [textSaved, setTextSaved] = useState(true);
  const [showSavedFlash, setShowSavedFlash] = useState(null);

  useEffect(() => {
    setTextDraft(diary.text || '');
    setTextSaved(true);
  }, [diary.text]);

  const flashSaved = (which) => {
    setShowSavedFlash(which);
    setTimeout(() => setShowSavedFlash(null), 1500);
  };

  const saveMoodCustom = () => {
    if (!moodInput.trim()) return;
    const val = moodInput.trim();
    const today = todayKey();
    updateDiary(today, d => ({
      ...d, moodsCustom: d.moodsCustom.includes(val) ? d.moodsCustom : [...d.moodsCustom, val]
    }));
    setMoodInput(''); playDingSound(); flashSaved('mood');
  };
  const removeMoodCustom = (val) => {
    const today = todayKey();
    updateDiary(today, d => ({ ...d, moodsCustom: d.moodsCustom.filter(m => m !== val) }));
  };
  const saveBodyCustom = () => {
    if (!bodyInput.trim()) return;
    const val = bodyInput.trim();
    const today = todayKey();
    updateDiary(today, d => ({
      ...d, bodyCustom: d.bodyCustom.includes(val) ? d.bodyCustom : [...d.bodyCustom, val]
    }));
    setBodyInput(''); playDingSound(); flashSaved('body');
  };
  const removeBodyCustom = (val) => {
    const today = todayKey();
    updateDiary(today, d => ({ ...d, bodyCustom: d.bodyCustom.filter(b => b !== val) }));
  };
  const saveText = () => {
    const today = todayKey();
    updateDiary(today, d => ({ ...d, text: textDraft }));
    setTextSaved(true); playDingSound(); flashSaved('text');
  };

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px', padding: '20px', marginBottom: '16px',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
  };
  const sectionTitle = { margin: '0 0 14px', color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif', fontSize: '1.1rem' };

  const SaveBtn = ({ onClick, savedFlash }) => (
    <button
      onClick={onClick} className="candy-btn"
      style={{
        padding: '10px 16px', borderRadius: '14px', border: 'none',
        background: savedFlash ? 'linear-gradient(135deg, #a3e0a3, #7fcc7f)' : 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
        color: 'white', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
        display: 'flex', alignItems: 'center', gap: '4px',
        fontFamily: 'inherit', fontSize: '0.85rem',
        transition: 'all 0.2s', whiteSpace: 'nowrap'
      }}
    >
      {savedFlash ? <><Check size={14} strokeWidth={3} /> 已存</> : <><Save size={14} strokeWidth={3} /> 儲存</>}
    </button>
  );

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>💭 今天心情如何？</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {MOOD_OPTIONS.map(m => {
            const selected = diary.moods.includes(m.id);
            return (
              <button key={m.id} className="chip" onClick={() => toggleMood(m.id)} style={{
                border: selected ? `2.5px solid ${m.color}` : '2px solid rgba(255, 209, 220, 0.5)',
                background: selected ? `${m.color}30` : 'white',
                padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, color: '#5a3a4a',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: selected ? `0 2px 8px ${m.color}50` : 'none', fontFamily: 'inherit'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{m.emoji}</span>{m.label}
              </button>
            );
          })}
          {diary.moodsCustom.map((c, i) => (
            <button key={`custom-${i}`} className="chip" onClick={() => removeMoodCustom(c)} style={{
              border: '2.5px solid #ff9ec7', background: '#ff9ec730',
              padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600, color: '#5a3a4a',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit'
            }} title="點擊移除">✨ {c} <X size={12} /></button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text" value={moodInput}
            onChange={e => setMoodInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveMoodCustom()}
            placeholder="自己加一個心情..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '14px',
              border: '2px solid #ffd1dc', background: 'white',
              fontSize: '0.9rem', fontFamily: 'inherit', color: '#5a3a4a'
            }}
          />
          <SaveBtn onClick={saveMoodCustom} savedFlash={showSavedFlash === 'mood'} />
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>🌿 身體狀況</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {BODY_OPTIONS.map(b => {
            const selected = diary.body.includes(b.id);
            return (
              <button key={b.id} className="chip" onClick={() => toggleBody(b.id)} style={{
                border: selected ? `2.5px solid ${b.color}` : '2px solid rgba(255, 209, 220, 0.5)',
                background: selected ? `${b.color}30` : 'white',
                padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, color: '#5a3a4a',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: selected ? `0 2px 8px ${b.color}50` : 'none', fontFamily: 'inherit'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{b.emoji}</span>{b.label}
              </button>
            );
          })}
          {diary.bodyCustom.map((c, i) => (
            <button key={`bcustom-${i}`} className="chip" onClick={() => removeBodyCustom(c)} style={{
              border: '2.5px solid #c4a3ff', background: '#c4a3ff30',
              padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600, color: '#5a3a4a',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit'
            }} title="點擊移除">💫 {c} <X size={12} /></button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text" value={bodyInput}
            onChange={e => setBodyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveBodyCustom()}
            placeholder="自己加一個身體狀況..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '14px',
              border: '2px solid #ffd1dc', background: 'white',
              fontSize: '0.9rem', fontFamily: 'inherit', color: '#5a3a4a'
            }}
          />
          <SaveBtn onClick={saveBodyCustom} savedFlash={showSavedFlash === 'body'} />
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>📝 今天的日記</h3>
        <textarea
          value={textDraft}
          onChange={e => { setTextDraft(e.target.value); setTextSaved(false); }}
          placeholder="今天發生了什麼事呢？"
          style={{
            width: '100%', minHeight: '160px', padding: '14px',
            borderRadius: '16px', border: '2px solid #ffd1dc',
            background: 'white', fontSize: '0.95rem',
            fontFamily: 'inherit', color: '#5a3a4a',
            lineHeight: '1.6', resize: 'vertical'
          }}
        />
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: textSaved ? '#a3c4a3' : '#d4a050' }}>
            {textDraft.length} 字 {textSaved ? '· 已儲存' : '· 尚未儲存'}
          </span>
          <SaveBtn onClick={saveText} savedFlash={showSavedFlash === 'text'} />
        </div>
      </div>
    </div>
  );
}

function ManageView({ tasks, newTaskName, setNewTaskName, addTask, deleteTask }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px', padding: '20px',
        marginBottom: '16px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif' }}>✨ 新增任務</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text" value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="例如：喝水、運動..."
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '16px',
              border: '2px solid #ffd1dc', background: 'white',
              fontSize: '1rem', fontFamily: 'inherit', color: '#5a3a4a'
            }}
          />
          <button
            className="candy-btn" onClick={addTask}
            style={{
              padding: '0 18px', borderRadius: '16px', border: 'none',
              background: 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
              color: 'white', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          ><Plus size={18} strokeWidth={3} /></button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: '#a06b8a', textAlign: 'center' }}>
          💡 完成任務可獲得水果（每天最多 5 顆）
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)', borderRadius: '18px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(255, 158, 199, 0.1)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>{task.emoji}</span>
            <span style={{ flex: 1, fontWeight: 600, color: '#5a3a4a' }}>{task.name}</span>
            <button
              className="candy-btn"
              onClick={() => deleteTask(task.id)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                background: 'rgba(255, 200, 220, 0.5)', color: '#d4587a',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            ><Trash2 size={16} /></button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#c089a3', padding: '20px' }}>還沒有任務，新增一個吧 🌸</p>
        )}
      </div>
    </div>
  );
}

function CalendarView({ tasks, history, diaries, month, setMonth, selectedDate, setSelectedDate, dateKey }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = dateKey(new Date());
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedChecks = selectedKey ? (history[selectedKey] || {}) : {};
  const selectedDiary = selectedKey ? (diaries[selectedKey] || null) : null;

  const hasDiaryEntry = (k) => {
    const d = diaries[k];
    if (!d) return false;
    return (d.moods?.length > 0) || (d.body?.length > 0) ||
           (d.moodsCustom?.length > 0) || (d.bodyCustom?.length > 0) ||
           (d.text?.trim().length > 0);
  };
  const moodById = (id) => MOOD_OPTIONS.find(m => m.id === id);
  const bodyById = (id) => BODY_OPTIONS.find(b => b.id === id);

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
        borderRadius: '24px', padding: '20px', marginBottom: '16px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button className="candy-btn" onClick={() => setMonth(new Date(year, m - 1, 1))} style={{
            background: 'rgba(255, 209, 220, 0.4)', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><ChevronLeft size={18} color="#a06b8a" /></button>
          <h3 style={{ margin: 0, color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif' }}>{year} {monthNames[m]}</h3>
          <button className="candy-btn" onClick={() => setMonth(new Date(year, m + 1, 1))} style={{
            background: 'rgba(255, 209, 220, 0.4)', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><ChevronRight size={18} color="#a06b8a" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {weekDays.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: '#c089a3', fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const cellDate = new Date(year, m, d);
            const k = dateKey(cellDate);
            const checks = history[k] || {};
            const completed = tasks.filter(t => checks[t.id]).length;
            const ratio = tasks.length ? completed / tasks.length : 0;
            const isToday = k === todayStr;
            const isSelected = k === selectedKey;
            const hasDiary = hasDiaryEntry(k);
            let bg = 'transparent';
            if (ratio === 1 && tasks.length > 0) bg = 'linear-gradient(135deg, #ff9ec7, #c4a3ff)';
            else if (ratio >= 0.5) bg = 'linear-gradient(135deg, #ffd1dc, #d4b3ff)';
            else if (ratio > 0) bg = 'rgba(255, 209, 220, 0.5)';
            return (
              <button key={i} onClick={() => setSelectedDate(cellDate)} style={{
                aspectRatio: '1',
                border: isToday ? '2.5px solid #ff6b9d' : isSelected ? '2.5px solid #c44dff' : 'none',
                background: bg, borderRadius: '12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 600,
                color: ratio === 1 ? 'white' : '#5a3a4a',
                padding: 0, transition: 'all 0.2s', position: 'relative'
              }}>
                {d}
                {tasks.length > 0 && completed > 0 && (
                  <div style={{ fontSize: '0.6rem', marginTop: '1px', opacity: 0.8 }}>{completed}/{tasks.length}</div>
                )}
                {hasDiary && (
                  <div style={{ position: 'absolute', bottom: '3px', right: '4px', fontSize: '0.5rem' }}>📖</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
          borderRadius: '24px', padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif' }}>
            {selectedDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
          </h4>
          {tasks.length > 0 && (
            <>
              <div style={{ fontSize: '0.85rem', color: '#a06b8a', fontWeight: 700, marginBottom: '8px' }}>✓ 任務</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {tasks.map(task => {
                  const done = !!selectedChecks[task.id];
                  return (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px',
                      background: done ? 'rgba(255, 209, 220, 0.4)' : 'rgba(240, 240, 240, 0.5)',
                      borderRadius: '14px', opacity: done ? 1 : 0.6
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{task.emoji}</span>
                      <span style={{ flex: 1, color: '#5a3a4a', fontWeight: 500, fontSize: '0.95rem' }}>{task.name}</span>
                      {done ? <Check size={16} color="#ff6b9d" strokeWidth={3} /> : <span style={{ fontSize: '0.75rem', color: '#c089a3' }}>未完成</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {selectedDiary && (selectedDiary.moods?.length > 0 || selectedDiary.moodsCustom?.length > 0) && (
            <>
              <div style={{ fontSize: '0.85rem', color: '#a06b8a', fontWeight: 700, marginBottom: '8px' }}>💭 心情</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {selectedDiary.moods?.map(id => {
                  const m = moodById(id);
                  if (!m) return null;
                  return (<span key={id} style={{
                    padding: '6px 12px', borderRadius: '999px',
                    background: `${m.color}30`, border: `2px solid ${m.color}`,
                    fontSize: '0.85rem', fontWeight: 600, color: '#5a3a4a'
                  }}>{m.emoji} {m.label}</span>);
                })}
                {selectedDiary.moodsCustom?.map((c, i) => (
                  <span key={`mc${i}`} style={{
                    padding: '6px 12px', borderRadius: '999px',
                    background: '#ff9ec730', border: '2px solid #ff9ec7',
                    fontSize: '0.85rem', fontWeight: 600, color: '#5a3a4a'
                  }}>✨ {c}</span>
                ))}
              </div>
            </>
          )}
          {selectedDiary && (selectedDiary.body?.length > 0 || selectedDiary.bodyCustom?.length > 0) && (
            <>
              <div style={{ fontSize: '0.85rem', color: '#a06b8a', fontWeight: 700, marginBottom: '8px' }}>🌿 身體</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {selectedDiary.body?.map(id => {
                  const b = bodyById(id);
                  if (!b) return null;
                  return (<span key={id} style={{
                    padding: '6px 12px', borderRadius: '999px',
                    background: `${b.color}30`, border: `2px solid ${b.color}`,
                    fontSize: '0.85rem', fontWeight: 600, color: '#5a3a4a'
                  }}>{b.emoji} {b.label}</span>);
                })}
                {selectedDiary.bodyCustom?.map((c, i) => (
                  <span key={`bc${i}`} style={{
                    padding: '6px 12px', borderRadius: '999px',
                    background: '#c4a3ff30', border: '2px solid #c4a3ff',
                    fontSize: '0.85rem', fontWeight: 600, color: '#5a3a4a'
                  }}>💫 {c}</span>
                ))}
              </div>
            </>
          )}
          {selectedDiary && selectedDiary.text && selectedDiary.text.trim() && (
            <>
              <div style={{ fontSize: '0.85rem', color: '#a06b8a', fontWeight: 700, marginBottom: '8px' }}>📝 日記</div>
              <div style={{
                padding: '14px', background: 'rgba(255, 240, 245, 0.5)',
                borderRadius: '14px', fontSize: '0.92rem',
                color: '#5a3a4a', lineHeight: '1.6', whiteSpace: 'pre-wrap'
              }}>{selectedDiary.text}</div>
            </>
          )}
          {tasks.length === 0 && !selectedDiary && (
            <p style={{ color: '#c089a3', margin: 0 }}>那天沒有紀錄 ☁️</p>
          )}
        </div>
      )}
    </div>
  );
}
