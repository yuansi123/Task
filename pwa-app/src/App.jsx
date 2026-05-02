import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, Calendar as CalendarIcon, ListTodo, Trash2, Sparkles, X, ChevronLeft, ChevronRight, Trophy, BookHeart, Save } from 'lucide-react';

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

const PET_GREETINGS = [
  '嗨～今天過得好嗎？',
  '見到你最開心了 💕',
  '哈囉哈囉～想你了！',
  '你來啦～最棒的一天～',
  '嘿嘿～又見面了 ✨',
];

const PET_ENCOURAGEMENTS = [
  '你今天好努力，我都看到了喔！',
  '一步一步來，沒關係的～',
  '不管做不做得到，你都很可愛 💗',
  '記得要好好吃飯睡覺～',
  '今天的你也是最棒的！',
  '累了就休息一下，世界不會因為你慢一點就崩塌',
  '你已經比昨天的自己更厲害了',
  '我永遠站在你這邊喔 🌸',
  '小小的進步也是進步！',
  '愛你愛你～記得也要愛自己',
  '深呼吸～一切都會慢慢好起來',
  '你值得世界上所有的溫柔',
  '不需要完美，做你自己就好',
  '今天能起床就已經很厲害了！',
  '把難過的事情交給我，我來幫你裝著～',
  '記得喝水水！我也要喝～',
  '再撐一下下，你超級棒的',
  '失敗也沒關係，我還是最喜歡你',
  '你笑起來最可愛了 ☺️',
  '謝謝你今天也來看我 💖',
];

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
  const [petStats, setPetStats] = useState({ feed: 0, water: 0, date: '' });
  const [showPetMenu, setShowPetMenu] = useState(false);
  const [petBubble, setPetBubble] = useState(null);
  const [petAnimKey, setPetAnimKey] = useState(0);
  const [petHearts, setPetHearts] = useState(0);

  const audioCtxRef = useRef(null);

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const t = storage.get('tasks');
    if (t) setTasks(t);
    const h = storage.get('history');
    if (h) setHistory(h);
    const d = storage.get('diaries');
    if (d) setDiaries(d);
    const p = storage.get('pet');
    if (p) {
      setPet(p);
    } else {
      setShowNamePrompt(true);
    }
    const ps = storage.get('petStats');
    const today = todayKey();
    if (ps && ps.date === today) {
      setPetStats(ps);
    } else {
      setPetStats({ feed: 0, water: 0, date: today });
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (!loading) storage.set('tasks', tasks); }, [tasks, loading]);
  useEffect(() => { if (!loading) storage.set('history', history); }, [history, loading]);
  useEffect(() => { if (!loading) storage.set('diaries', diaries); }, [diaries, loading]);
  useEffect(() => { if (!loading && pet) storage.set('pet', pet); }, [pet, loading]);
  useEffect(() => { if (!loading) storage.set('petStats', petStats); }, [petStats, loading]);

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

  const playPopSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.start(now); osc1.stop(now + 0.1);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1000, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(500, now + 0.2);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(now + 0.12); osc2.stop(now + 0.22);
    } catch (e) {}
  };

  const playDingSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1320, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.start(now); osc1.stop(now + 0.25);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1056, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(now + 0.1); osc2.stop(now + 0.4);
    } catch (e) {}
  };

  const playNomSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      [0, 0.08, 0.16].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 - i * 50, now + delay);
        osc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.06);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.08);
      });
    } catch (e) {}
  };

  const playWaterSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.2);
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
    }
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const emojis = ['🌸', '🍓', '🍡', '🧁', '🍭', '🌈', '⭐', '💖', '🎀', '🍬', '🦄', '☁️'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    setTasks(prev => [...prev, { id: Date.now().toString(), name: newTaskName.trim(), emoji }]);
    setNewTaskName('');
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getDiary = (key) => {
    return diaries[key] || { moods: [], moodsCustom: [], body: [], bodyCustom: [], text: '' };
  };

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
    updateDiary(today, d => ({
      ...d,
      moods: wasSelected ? d.moods.filter(m => m !== moodId) : [...d.moods, moodId]
    }));
    if (!wasSelected) playDingSound();
  };

  const toggleBody = (bodyId) => {
    const today = todayKey();
    const diary = getDiary(today);
    const wasSelected = diary.body.includes(bodyId);
    updateDiary(today, d => ({
      ...d,
      body: wasSelected ? d.body.filter(b => b !== bodyId) : [...d.body, bodyId]
    }));
    if (!wasSelected) playDingSound();
  };

  const confirmPetName = () => {
    const name = petNameInput.trim() || '小幽';
    setPet({ name, createdAt: new Date().toISOString() });
    setShowNamePrompt(false);
    setPetNameInput('');
    showBubble(`嗨～我是 ${name}！很高興認識你 💗`, 'greet');
  };

  const showBubble = (text, type = 'normal') => {
    setPetBubble({ text, type });
    setPetAnimKey(k => k + 1);
    setTimeout(() => setPetBubble(null), 4500);
  };

  const feedPet = () => {
    if (petStats.feed >= 5) {
      showBubble('我吃飽飽了～謝謝你 🥰', 'full');
      return;
    }
    const newFeed = Math.min(5, petStats.feed + 1);
    setPetStats(s => ({ ...s, feed: newFeed }));
    playNomSound();
    setPetAnimKey(k => k + 1);
    setPetHearts(h => h + 1);
    setTimeout(() => setPetHearts(h => Math.max(0, h - 1)), 2000);
    if (newFeed === 5) {
      showBubble('哇～吃得好飽！謝謝你照顧我 💕', 'full');
    } else {
      const msgs = ['好好吃喔～', '嗯～愛你 💗', '嚼嚼嚼...', '再來一口～', '好幸福 ✨'];
      showBubble(msgs[Math.floor(Math.random() * msgs.length)], 'eat');
    }
    setShowPetMenu(false);
  };

  const giveWater = () => {
    if (petStats.water >= 5) {
      showBubble('我喝飽水水了～你也記得喝喔！💧', 'full');
      return;
    }
    const newWater = Math.min(5, petStats.water + 1);
    setPetStats(s => ({ ...s, water: newWater }));
    playWaterSound();
    setPetAnimKey(k => k + 1);
    setPetHearts(h => h + 1);
    setTimeout(() => setPetHearts(h => Math.max(0, h - 1)), 2000);
    if (newWater === 5) {
      showBubble('水水滿滿～你也要記得補水喔！💦', 'full');
    } else {
      const msgs = ['咕嚕咕嚕～', '好涼快～', '水水最棒了！', '謝謝你 💧', '舒服～'];
      showBubble(msgs[Math.floor(Math.random() * msgs.length)], 'drink');
    }
    setShowPetMenu(false);
  };

  const chatWithPet = () => {
    const all = [...PET_GREETINGS, ...PET_ENCOURAGEMENTS, ...PET_ENCOURAGEMENTS];
    const msg = all[Math.floor(Math.random() * all.length)];
    showBubble(msg, 'chat');
    playDingSound();
    setShowPetMenu(false);
  };

  const renamePet = () => {
    setPetNameInput(pet?.name || '');
    setShowNamePrompt(true);
    setShowPetMenu(false);
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Quicksand", -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>👻</div>
      </div>
    );
  }

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
        @keyframes petFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.02)} }
        @keyframes petBounce {
          0%{transform:scale(1)} 25%{transform:scale(1.15) translateY(-12px)}
          50%{transform:scale(0.95) translateY(0)} 75%{transform:scale(1.05) translateY(-4px)}
          100%{transform:scale(1) translateY(0)}
        }
        @keyframes heartFloat {
          0%{opacity:1; transform:translateY(0) scale(0.5)}
          50%{opacity:1; transform:translateY(-30px) scale(1.2)}
          100%{opacity:0; transform:translateY(-60px) scale(0.8)}
        }
        @keyframes bubbleIn { 0%{opacity:0; transform:translateY(10px) scale(0.8)} 100%{opacity:1; transform:translateY(0) scale(1)} }
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
              position: 'absolute',
              fontSize: '1.5rem',
              left: `${(i - 4) * 30}px`,
              animation: `confetti 1.2s ease-out forwards`,
              animationDelay: `${i * 0.05}s`
            }}>{e}</div>
          ))}
        </div>
      )}

      <div style={{ padding: '24px 20px 16px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: '"Fredoka", sans-serif',
          fontSize: '2rem',
          margin: 0,
          background: 'linear-gradient(90deg, #ff6b9d, #c44dff, #6bb5ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700,
          letterSpacing: '-0.02em'
        }}>
          🐻 每日任務
        </h1>
        <p style={{ margin: '4px 0 0', color: '#a06b8a', fontSize: '0.85rem', fontWeight: 500 }}>
          {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {isBedtime && view === 'today' && (
        <div style={{
          margin: '0 20px 16px',
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #fff4e6, #ffe0ec)',
          border: '2px dashed #ff9ec7',
          borderRadius: '20px',
          fontSize: '0.9rem',
          color: '#a04060',
          textAlign: 'center',
          animation: 'wiggle 2s ease-in-out infinite',
          position: 'relative',
          zIndex: 2
        }}>
          🌙 睡前提醒～還有任務沒打勾喔！
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {view === 'today' && (
          <>
            <TodayView
              tasks={tasks}
              todayChecks={todayChecks}
              completedToday={completedToday}
              allDoneToday={allDoneToday}
              toggleTask={toggleTask}
            />
            {pet && (
              <PetSection
                pet={pet}
                petStats={petStats}
                showPetMenu={showPetMenu}
                setShowPetMenu={setShowPetMenu}
                petBubble={petBubble}
                petAnimKey={petAnimKey}
                petHearts={petHearts}
                feedPet={feedPet}
                giveWater={giveWater}
                chatWithPet={chatWithPet}
                renamePet={renamePet}
              />
            )}
          </>
        )}

        {view === 'diary' && (
          <DiaryView
            diary={getDiary(todayKey())}
            toggleMood={toggleMood}
            toggleBody={toggleBody}
            updateDiary={updateDiary}
            todayKey={todayKey}
            playDingSound={playDingSound}
          />
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            history={history}
            diaries={diaries}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateKey={dateKey}
          />
        )}

        {view === 'manage' && (
          <ManageView
            tasks={tasks}
            newTaskName={newTaskName}
            setNewTaskName={setNewTaskName}
            addTask={addTask}
            deleteTask={deleteTask}
          />
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(255, 209, 220, 0.5)',
        padding: '8px 8px calc(16px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50
      }}>
        {[
          { id: 'today', icon: ListTodo, label: '今日' },
          { id: 'diary', icon: BookHeart, label: '日記' },
          { id: 'calendar', icon: CalendarIcon, label: '日曆' },
          { id: 'manage', icon: Sparkles, label: '管理' }
        ].map(item => (
          <button
            key={item.id}
            className="candy-btn"
            onClick={() => setView(item.id)}
            style={{
              border: 'none',
              background: view === item.id ? 'linear-gradient(135deg, #ff9ec7, #c4a3ff)' : 'transparent',
              color: view === item.id ? 'white' : '#a06b8a',
              padding: '8px 12px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.72rem',
              boxShadow: view === item.id ? '0 4px 12px rgba(255, 158, 199, 0.4)' : 'none'
            }}
          >
            <item.icon size={20} strokeWidth={2.5} />
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
            borderRadius: '28px',
            padding: '32px 24px 24px',
            maxWidth: '340px', width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <PetSVG size={100} animKey={0} />
            </div>
            <h2 style={{
              margin: '0 0 8px',
              fontFamily: '"Fredoka", sans-serif',
              color: '#7a4a6b',
              fontSize: '1.3rem'
            }}>
              {pet ? '幫我換個名字～' : '你好呀！'}
            </h2>
            <p style={{
              margin: '0 0 20px',
              color: '#a06b8a',
              fontSize: '0.92rem',
              whiteSpace: 'pre-line'
            }}>
              {pet ? '你想叫我什麼呢？' : '我是一隻軟軟的小幽靈～\n你想叫我什麼名字呢？'}
            </p>
            <input
              type="text"
              value={petNameInput}
              onChange={e => setPetNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmPetName()}
              placeholder="幫我取個可愛的名字..."
              maxLength={10}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '2px solid #ffd1dc',
                background: 'white',
                fontSize: '1rem',
                fontFamily: 'inherit',
                color: '#5a3a4a',
                textAlign: 'center',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {pet && (
                <button
                  onClick={() => { setShowNamePrompt(false); setPetNameInput(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(255, 209, 220, 0.4)',
                    color: '#a06b8a',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem'
                  }}
                >取消</button>
              )}
              <button
                onClick={confirmPetName}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              >{pet ? '改好了！' : '就叫這個！'}</button>
            </div>
          </div>
        </div>
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
            borderRadius: '28px',
            padding: '28px 24px',
            maxWidth: '360px', width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowWeeklySummary(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                width: '32px', height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} color="#a06b8a" />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Trophy size={36} color="#ff9ec7" style={{ marginBottom: '4px' }} />
              <h2 style={{
                margin: 0,
                fontFamily: '"Fredoka", sans-serif',
                background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>這週的總結 ✨</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weeklyData.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.8)',
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

function PetSVG({ size = 120, animKey = 0 }) {
  return (
    <div
      key={animKey}
      style={{
        width: size,
        height: size,
        animation: animKey > 0 ? 'petBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'petFloat 3s ease-in-out infinite',
        display: 'inline-block'
      }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
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
          fill="url(#petBody)"
          filter="url(#petShadow)"
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

function PetSection({ pet, petStats, showPetMenu, setShowPetMenu, petBubble, petAnimKey, petHearts, feedPet, giveWater, chatWithPet, renamePet }) {
  const feedPct = (petStats.feed / 5) * 100;
  const waterPct = (petStats.water / 5) * 100;

  return (
    <div style={{ padding: '24px 20px 0', position: 'relative' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9), rgba(252, 228, 255, 0.85))',
        backdropFilter: 'blur(10px)',
        borderRadius: '28px',
        padding: '20px 16px 24px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', justifyContent: 'center' }}>
          <div style={{ flex: 1, maxWidth: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#a06b8a' }}>
              <span>🍓 飽飽</span>
              <span>{petStats.feed}/5</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 209, 220, 0.4)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${feedPct}%`,
                background: 'linear-gradient(90deg, #ff9ec7, #ff6b9d)',
                borderRadius: '999px',
                transition: 'width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }} />
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#a06b8a' }}>
              <span>💧 水水</span>
              <span>{petStats.water}/5</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(196, 224, 255, 0.4)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${waterPct}%`,
                background: 'linear-gradient(90deg, #a3c9ff, #6bb5ff)',
                borderRadius: '999px',
                transition: 'width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }} />
            </div>
          </div>
        </div>

        {petBubble && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '10px 16px',
            borderRadius: '20px',
            border: '2px solid #ffd1dc',
            boxShadow: '0 4px 16px rgba(255, 158, 199, 0.3)',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#5a3a4a',
            maxWidth: '85%',
            zIndex: 10,
            animation: 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            {petBubble.text}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white'
            }} />
          </div>
        )}

        {petHearts > 0 && (
          <div style={{
            position: 'absolute',
            top: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 5
          }}>
            {[...Array(petHearts)].map((_, i) => (
              <div key={`${petHearts}-${i}`} style={{
                position: 'absolute',
                fontSize: '1.5rem',
                left: `${(i - petHearts / 2) * 20}px`,
                animation: 'heartFloat 2s ease-out forwards',
                animationDelay: `${i * 0.1}s`
              }}>💗</div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowPetMenu(s => !s)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginTop: petBubble ? '50px' : '20px',
            transition: 'margin 0.3s'
          }}
        >
          <PetSVG size={120} animKey={petAnimKey} />
        </button>

        <div style={{
          marginTop: '8px',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#7a4a6b',
          fontFamily: '"Fredoka", sans-serif'
        }}>
          {pet.name} <button onClick={renamePet} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.7rem', color: '#c089a3', marginLeft: '4px',
            fontFamily: 'inherit'
          }}>(改名)</button>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#a06b8a', marginTop: '2px' }}>
          點我互動 💕
        </div>

        {showPetMenu && (
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginTop: '14px',
            flexWrap: 'wrap',
            animation: 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            <button
              onClick={feedPet}
              className="candy-btn"
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                background: petStats.feed >= 5 ? 'rgba(255, 209, 220, 0.5)' : 'linear-gradient(135deg, #ffb3d9, #ff9ec7)',
                color: petStats.feed >= 5 ? '#a06b8a' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: petStats.feed >= 5 ? 'none' : '0 4px 12px rgba(255, 158, 199, 0.4)',
                fontFamily: 'inherit'
              }}
            >
              🍓 餵食
            </button>
            <button
              onClick={giveWater}
              className="candy-btn"
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                background: petStats.water >= 5 ? 'rgba(196, 224, 255, 0.5)' : 'linear-gradient(135deg, #a3c9ff, #6bb5ff)',
                color: petStats.water >= 5 ? '#6b8ba6' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: petStats.water >= 5 ? 'none' : '0 4px 12px rgba(107, 181, 255, 0.4)',
                fontFamily: 'inherit'
              }}
            >
              💧 喝水
            </button>
            <button
              onClick={chatWithPet}
              className="candy-btn"
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #d4b3ff, #c4a3ff)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(196, 163, 255, 0.4)',
                fontFamily: 'inherit'
              }}
            >
              💬 聊天
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TodayView({ tasks, todayChecks, completedToday, allDoneToday, toggleTask }) {
  return (
    <div style={{ padding: '0 20px' }}>
      {tasks.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px 24px',
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
            borderRadius: '24px',
            padding: '20px',
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map(task => {
              const checked = !!todayChecks[task.id];
              return (
                <div
                  key={task.id}
                  className="task-card"
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: checked ? 'linear-gradient(135deg, #ff9ec7, #c4a3ff)' : 'rgba(255, 255, 255, 0.9)',
                    border: checked ? 'none' : '2.5px solid #ffc1d6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    boxShadow: checked ? '0 2px 8px rgba(255, 158, 199, 0.4)' : 'none'
                  }}>
                    {checked && <Check size={18} color="white" strokeWidth={3} style={{ animation: 'pop 0.4s' }} />}
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>{task.emoji}</span>
                  <span style={{
                    flex: 1,
                    fontSize: '1.05rem',
                    fontWeight: 600,
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
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, #fff4e6, #ffe0f0, #f0e0ff)',
              borderRadius: '24px',
              textAlign: 'center',
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
      ...d,
      moodsCustom: d.moodsCustom.includes(val) ? d.moodsCustom : [...d.moodsCustom, val]
    }));
    setMoodInput('');
    playDingSound();
    flashSaved('mood');
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
      ...d,
      bodyCustom: d.bodyCustom.includes(val) ? d.bodyCustom : [...d.bodyCustom, val]
    }));
    setBodyInput('');
    playDingSound();
    flashSaved('body');
  };

  const removeBodyCustom = (val) => {
    const today = todayKey();
    updateDiary(today, d => ({ ...d, bodyCustom: d.bodyCustom.filter(b => b !== val) }));
  };

  const saveText = () => {
    const today = todayKey();
    updateDiary(today, d => ({ ...d, text: textDraft }));
    setTextSaved(true);
    playDingSound();
    flashSaved('text');
  };

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '16px',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
  };
  const sectionTitle = {
    margin: '0 0 14px',
    color: '#7a4a6b',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1.1rem'
  };

  const SaveBtn = ({ onClick, savedFlash }) => (
    <button
      onClick={onClick}
      className="candy-btn"
      style={{
        padding: '10px 16px',
        borderRadius: '14px',
        border: 'none',
        background: savedFlash ? 'linear-gradient(135deg, #a3e0a3, #7fcc7f)' : 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
        color: 'white',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
        fontSize: '0.85rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
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
              <button
                key={m.id}
                className="chip"
                onClick={() => toggleMood(m.id)}
                style={{
                  border: selected ? `2.5px solid ${m.color}` : '2px solid rgba(255, 209, 220, 0.5)',
                  background: selected ? `${m.color}30` : 'white',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#5a3a4a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selected ? `0 2px 8px ${m.color}50` : 'none',
                  fontFamily: 'inherit'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
          {diary.moodsCustom.map((c, i) => (
            <button
              key={`custom-${i}`}
              className="chip"
              onClick={() => removeMoodCustom(c)}
              style={{
                border: '2.5px solid #ff9ec7',
                background: '#ff9ec730',
                padding: '8px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#5a3a4a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit'
              }}
              title="點擊移除"
            >
              ✨ {c} <X size={12} style={{ marginLeft: '2px' }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={moodInput}
            onChange={e => setMoodInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveMoodCustom()}
            placeholder="自己加一個心情..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '14px',
              border: '2px solid #ffd1dc',
              background: 'white',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              color: '#5a3a4a'
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
              <button
                key={b.id}
                className="chip"
                onClick={() => toggleBody(b.id)}
                style={{
                  border: selected ? `2.5px solid ${b.color}` : '2px solid rgba(255, 209, 220, 0.5)',
                  background: selected ? `${b.color}30` : 'white',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#5a3a4a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selected ? `0 2px 8px ${b.color}50` : 'none',
                  fontFamily: 'inherit'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{b.emoji}</span>
                {b.label}
              </button>
            );
          })}
          {diary.bodyCustom.map((c, i) => (
            <button
              key={`bcustom-${i}`}
              className="chip"
              onClick={() => removeBodyCustom(c)}
              style={{
                border: '2.5px solid #c4a3ff',
                background: '#c4a3ff30',
                padding: '8px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#5a3a4a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit'
              }}
              title="點擊移除"
            >
              💫 {c} <X size={12} style={{ marginLeft: '2px' }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={bodyInput}
            onChange={e => setBodyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveBodyCustom()}
            placeholder="自己加一個身體狀況..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '14px',
              border: '2px solid #ffd1dc',
              background: 'white',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              color: '#5a3a4a'
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
            width: '100%',
            minHeight: '160px',
            padding: '14px',
            borderRadius: '16px',
            border: '2px solid #ffd1dc',
            background: 'white',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: '#5a3a4a',
            lineHeight: '1.6',
            resize: 'vertical'
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
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '16px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif' }}>✨ 新增任務</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="例如：喝水、運動..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '16px',
              border: '2px solid #ffd1dc',
              background: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit',
              color: '#5a3a4a'
            }}
          />
          <button
            className="candy-btn"
            onClick={addTask}
            style={{
              padding: '0 18px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff9ec7, #c4a3ff)',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 158, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '18px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(255, 158, 199, 0.1)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>{task.emoji}</span>
            <span style={{ flex: 1, fontWeight: 600, color: '#5a3a4a' }}>{task.name}</span>
            <button
              className="candy-btn"
              onClick={() => deleteTask(task.id)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 200, 220, 0.5)',
                color: '#d4587a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trash2 size={16} />
            </button>
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
    return (d.moods && d.moods.length > 0) || (d.body && d.body.length > 0) ||
           (d.moodsCustom && d.moodsCustom.length > 0) || (d.bodyCustom && d.bodyCustom.length > 0) ||
           (d.text && d.text.trim().length > 0);
  };

  const moodById = (id) => MOOD_OPTIONS.find(m => m.id === id);
  const bodyById = (id) => BODY_OPTIONS.find(b => b.id === id);

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '16px',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(255, 158, 199, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            className="candy-btn"
            onClick={() => setMonth(new Date(year, m - 1, 1))}
            style={{
              background: 'rgba(255, 209, 220, 0.4)',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={18} color="#a06b8a" />
          </button>
          <h3 style={{ margin: 0, color: '#7a4a6b', fontFamily: '"Fredoka", sans-serif' }}>{year} {monthNames[m]}</h3>
          <button
            className="candy-btn"
            onClick={() => setMonth(new Date(year, m + 1, 1))}
            style={{
              background: 'rgba(255, 209, 220, 0.4)',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={18} color="#a06b8a" />
          </button>
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
              <button
                key={i}
                onClick={() => setSelectedDate(cellDate)}
                style={{
                  aspectRatio: '1',
                  border: isToday ? '2.5px solid #ff6b9d' : isSelected ? '2.5px solid #c44dff' : 'none',
                  background: bg,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: ratio === 1 ? 'white' : '#5a3a4a',
                  padding: 0,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {d}
                {tasks.length > 0 && completed > 0 && (
                  <div style={{ fontSize: '0.6rem', marginTop: '1px', opacity: 0.8 }}>
                    {completed}/{tasks.length}
                  </div>
                )}
                {hasDiary && (
                  <div style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '4px',
                    fontSize: '0.5rem'
                  }}>📖</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '20px',
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: done ? 'rgba(255, 209, 220, 0.4)' : 'rgba(240, 240, 240, 0.5)',
                      borderRadius: '14px',
                      opacity: done ? 1 : 0.6
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{task.emoji}</span>
                      <span style={{ flex: 1, color: '#5a3a4a', fontWeight: 500, fontSize: '0.95rem' }}>{task.name}</span>
                      {done ? (
                        <Check size={16} color="#ff6b9d" strokeWidth={3} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#c089a3' }}>未完成</span>
                      )}
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
                  return (
                    <span key={id} style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: `${m.color}30`,
                      border: `2px solid ${m.color}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5a3a4a'
                    }}>{m.emoji} {m.label}</span>
                  );
                })}
                {selectedDiary.moodsCustom?.map((c, i) => (
                  <span key={`mc${i}`} style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: '#ff9ec730',
                    border: '2px solid #ff9ec7',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#5a3a4a'
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
                  return (
                    <span key={id} style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: `${b.color}30`,
                      border: `2px solid ${b.color}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5a3a4a'
                    }}>{b.emoji} {b.label}</span>
                  );
                })}
                {selectedDiary.bodyCustom?.map((c, i) => (
                  <span key={`bc${i}`} style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: '#c4a3ff30',
                    border: '2px solid #c4a3ff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#5a3a4a'
                  }}>💫 {c}</span>
                ))}
              </div>
            </>
          )}

          {selectedDiary && selectedDiary.text && selectedDiary.text.trim() && (
            <>
              <div style={{ fontSize: '0.85rem', color: '#a06b8a', fontWeight: 700, marginBottom: '8px' }}>📝 日記</div>
              <div style={{
                padding: '14px',
                background: 'rgba(255, 240, 245, 0.5)',
                borderRadius: '14px',
                fontSize: '0.92rem',
                color: '#5a3a4a',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedDiary.text}
              </div>
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
