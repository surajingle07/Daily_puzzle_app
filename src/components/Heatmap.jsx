import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { getAllActivities } from '../db';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Activity } from 'lucide-react';

export default function Heatmap() {
  const [activities, setActivities] = useState([]);
  const { user, isDemoMode, activeDate } = useAppContext();
  const [viewMode, setViewMode] = useState('monthly');
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    if (user) {
      getAllActivities(user.id).then(setActivities);
    } else {
      setActivities([]);
    }
  }, [isDemoMode, activeDate, user]);

  const activityMap = useMemo(() => {
    const map = new Map();
    activities.forEach((a) => map.set(a.date, a));
    return map;
  }, [activities]);

  // Yearly data
  const yearlyDays = useMemo(() => {
    const today = dayjs(activeDate);
    const d = [];
    for (let i = 0; i < 365; i++) {
      d.push(today.subtract(364 - i, 'day').format('YYYY-MM-DD'));
    }
    return d;
  }, [activeDate]);

  // Monthly data
  const monthlyData = useMemo(() => {
    const displayMonth = dayjs(activeDate).add(monthOffset, 'month');
    const daysInMonth = displayMonth.daysInMonth();
    const startDayOfWeek = displayMonth.startOf('month').day(); // 0 is Sunday

    const d = [];
    for (let i = 0; i < startDayOfWeek; i++) d.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      d.push(displayMonth.date(i).format('YYYY-MM-DD'));
    }
    return {
      title: displayMonth.format('MMMM YYYY'),
      days: d
    };
  }, [activeDate, monthOffset]);

  const getDayInfo = (date) => {
    if (!date) return { level: -1, title: '', act: null };
    const act = activityMap.get(date);
    if (!act) return { level: 0, title: 'No Activity', act: null };

    let level = 1;
    if (act.score === 1000) level = 4;else
    if (act.score >= 800) level = 3;else
    if (act.score >= 400) level = 2;

    return { level, act };
  };

  const intensityMap = {
    [-1]: "opacity-0 pointer-events-none", // empty slot
    0: "bg-slate-100/60 border border-slate-200/50",
    1: "bg-bluestock-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]",
    2: "bg-bluestock-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]",
    3: "bg-bluestock-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]",
    4: "bg-bluestock-800 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"
  };

  const yearlyWeeks = [];
  for (let i = 0; i < yearlyDays.length; i += 7) {
    yearlyWeeks.push(yearlyDays.slice(i, i + 7));
  }

  // Common Tooltip function
  const renderTooltip = (day, level, act) => {
    if (!day) return null;
    return (
      <div className="absolute opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none z-50 bottom-[120%] left-1/2 -translate-x-1/2 w-max bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-medium p-3 rounded-xl shadow-2xl !whitespace-nowrap border border-slate-700/50">
        <p className="font-black text-bluestock-300 mb-1.5 text-xs">{dayjs(day).format('MMM D, YYYY')}</p>
        {act ?
        <div className="flex flex-col gap-1">
             <div className="flex justify-between gap-4">
                <span className="text-slate-400">Score</span>
                <span className="text-white font-mono font-bold">{act.score}</span>
             </div>
             <div className="flex justify-between gap-4">
                <span className="text-slate-400">Time</span>
                <span className="text-white font-mono font-bold">{(act.timeSpentMs / 1000).toFixed(1)}s</span>
             </div>
             <div className="flex justify-between gap-4">
                <span className="text-slate-400">Intensity</span>
                <span className={`font-bold ${level === 4 ? 'text-amber-400' : 'text-bluestock-200'}`}>
                  {level === 4 ? 'Perfect' : level === 3 ? 'Hard' : level === 2 ? 'Medium' : 'Easy'}
                </span>
             </div>
          </div> :

        <span className="text-slate-400 font-bold">Incomplete</span>
        }
      </div>);

  };

  return (
    <div className="glass-panel p-5 rounded-[2rem] relative w-full flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-bluestock-600' : 'text-slate-500 hover:text-slate-700'}`}>
            
            <CalendarIcon size={14} /> Monthly
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'yearly' ? 'bg-white shadow-sm text-bluestock-600' : 'text-slate-500 hover:text-slate-700'}`}>
            
            <Activity size={14} /> Yearly
          </button>
        </div>

        {viewMode === 'monthly' &&
        <div className="flex items-center gap-3">
            <button onClick={() => setMonthOffset((p) => p - 1)} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm border border-slate-200">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold w-32 text-center text-slate-700">{monthlyData.title}</span>
            <button onClick={() => setMonthOffset((p) => p + 1)} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm border border-slate-200">
              <ChevronRight size={16} />
            </button>
          </div>
        }
      </div>

      {/* Grid Content */}
      {viewMode === 'yearly' ?
      <div className="overflow-x-auto relative w-full scrollbar-hide py-2">
          <div className="flex gap-1.5 min-w-[max-content] justify-end snap-x">
            {yearlyWeeks.map((week, wi) =>
          <div key={wi} className="flex flex-col gap-1.5 snap-end">
                {week.map((day) => {
              const { level, act } = getDayInfo(day);
              return (
                <div key={day} className="group relative">
                      <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-all hover:scale-[1.3] hover:ring-2 hover:ring-slate-400 hover:z-20 cursor-crosshair ${intensityMap[level]}`} />
                      {renderTooltip(day, level, act)}
                    </div>);

            })}
              </div>
          )}
          </div>
        </div> :

      <div className="w-full py-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 w-full max-w-sm mx-auto">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) =>
          <div key={i} className="text-center text-[10px] font-bold text-slate-400 mb-1">{day}</div>
          )}
            {monthlyData.days.map((day, i) => {
            const { level, act } = getDayInfo(day);
            // Calculate day of month
            const dayNum = day ? dayjs(day).date() : null;

            return (
              <div key={i} className="group relative aspect-square flex items-center justify-center">
                  <div className={`w-full h-full rounded-xl transition-all hover:scale-[1.1] hover:ring-2 hover:ring-slate-400 hover:z-20 cursor-crosshair flex items-center justify-center ${intensityMap[level]} ${!day ? '' : level === 0 ? 'bg-slate-50 hover:bg-slate-100' : ''}`}>
                    {dayNum &&
                  <span className={`text-xs sm:text-sm font-bold ${level > 0 ? 'text-white drop-shadow-md' : 'text-slate-400'}`}>
                        {dayNum}
                      </span>
                  }
                  </div>
                  {day && renderTooltip(day, level, act)}
                </div>);

          })}
          </div>
        </div>
      }
      
      {/* Legend */}
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-100 text-[10px] sm:text-xs text-slate-500 font-bold">
        <span>{viewMode === 'monthly' ? 'Monthly Performance' : '365-Day History'}</span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span>Less</span>
          <div className={`w-3 h-3 rounded-[3px] ${intensityMap[0]}`}></div>
          <div className={`w-3 h-3 rounded-[3px] ${intensityMap[1]}`}></div>
          <div className={`w-3 h-3 rounded-[3px] ${intensityMap[2]}`}></div>
          <div className={`w-3 h-3 rounded-[3px] ${intensityMap[3]}`}></div>
          <div className={`w-3 h-3 rounded-[3px] ${intensityMap[4]}`}></div>
          <span>More</span>
        </div>
      </div>
    </div>);

}