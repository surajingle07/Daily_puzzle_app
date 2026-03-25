import { useAppContext } from '../context/AppContext';
import { Flame, Settings2, CalendarDays, LogOut } from 'lucide-react';
import dayjs from 'dayjs';

export default function Header() {
  const { user, activeDate, isDemoMode, toggleDemoMode, streak, nextDay, logout } = useAppContext();

  // If no user, showing purely aesthetic thin header or nothing
  if (!user) return null;

  return (
    <header className="flex items-center justify-between px-5 py-4 glass-panel sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-bluestock-500 to-bluestock-600 p-2.5 rounded-xl text-white shadow-sm shadow-bluestock-500/20">
          <CalendarDays size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Daily Puzzle</h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            {dayjs(activeDate).format('MMM D, YYYY')}
            {isDemoMode && <span className="text-amber-500 ml-1.5">• DEMO</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {streak > 0 &&
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm bg-orange-50 text-orange-600 border border-orange-100/50 shadow-sm transition-transform active:scale-95 cursor-default hover:bg-orange-100 group">
            <Flame size={16} className="fill-orange-500 text-orange-500 group-hover:scale-110 transition-transform" />
            <span>{streak}</span>
          </div>
        }
        
        <button
          onClick={toggleDemoMode}
          className={`p-2.5 rounded-full transition-all active:scale-95 ${isDemoMode ? 'bg-bluestock-600 text-white shadow-md shadow-bluestock-500/30' : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50'}`}
          title="Toggle Demo Mode">
          
          <Settings2 size={18} strokeWidth={2.5} />
        </button>

        {isDemoMode &&
        <button
          onClick={nextDay}
          className="text-[10px] uppercase tracking-wider bg-slate-800 text-white px-2.5 py-1.5 rounded-lg font-bold hover:bg-slate-900 transition-colors shadow-sm active:scale-95">
          
            +1 Day
          </button>
        }
        
        {/* Profile Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3 pr-1 py-1 rounded-full shadow-sm ml-2">
           <div className="flex flex-col mr-2">
             <span className="text-xs font-bold text-slate-800 leading-none">{user.name}</span>
             {!user.isGuest && <span className="text-[9px] font-semibold text-slate-500 mt-0.5 truncate max-w-[80px]">{user.email}</span>}
             {user.isGuest && <span className="text-[9px] font-semibold text-amber-500 mt-0.5">Guest Account</span>}
           </div>
           <button
            onClick={logout}
            title="Logout"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors active:scale-95 shadow-sm">
            
              <LogOut size={14} strokeWidth={2.5} />
           </button>
        </div>
      </div>
    </header>);

}