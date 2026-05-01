import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, Calendar as CalendarIcon, ListTodo, Trash2, Sparkles, X, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

// localStorage helpers
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

export default function App() {
  const [view, setView] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);
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
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    storage.set('tasks', tasks);
  }, [tasks, loading]);

  useEffect(() => {
    if (loading) return;
    storage.set('history', history);
  }, [history, loading]);

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
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1000, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(500, now + 0.2);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.22);
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
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      emoji
    }]);
    setNewTaskName('');
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
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
        <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🍭</div>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-300px) rotate(720deg); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .candy-btn { transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .candy-btn:active { transform: scale(0.95); }
        .task-card { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .task-card:active { transform: scale(0.97); }
        .floating-deco { position: absolute; opacity: 0.4; pointer-events: none; }
        input:focus { outline: none; }
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
          🍭 每日小確幸
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
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            history={history}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateKey={dateKey}
          />
        )}

        {view === 'manage' && (
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
        padding: '10px 20px calc(20px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50
      }}>
        {[
          { id: 'today', icon: ListTodo, label: '今日' },
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
              padding: '10px 18px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem',
              boxShadow: view === item.id ? '0 4px 12px rgba(255, 158, 199, 0.4)' : 'none'
            }}
          >
            <item.icon size={20} strokeWidth={2.5} />
            {item.label}
          </button>
        ))}
      </div>

      {showWeeklySummary && weeklyData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(122, 74, 107, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 200
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff0f5, #fce4ff, #e0f0ff)',
            borderRadius: '28px',
            padding: '28px 24px',
            maxWidth: '360px',
            width: '100%',
            border: '3px solid white',
            boxShadow: '0 20px 60px rgba(196, 77, 255, 0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowWeeklySummary(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
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

function CalendarView({ tasks, history, month, setMonth, selectedDate, setSelectedDate, dateKey }) {
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
                  transition: 'all 0.2s'
                }}
              >
                {d}
                {tasks.length > 0 && completed > 0 && (
                  <div style={{ fontSize: '0.6rem', marginTop: '1px', opacity: 0.8 }}>{completed}/{tasks.length}</div>
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
          {tasks.length === 0 ? (
            <p style={{ color: '#c089a3', margin: 0 }}>那天沒有任務 ☁️</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          )}
        </div>
      )}
    </div>
  );
}
