import { useState, useEffect } from 'react';
import LogicGrid from './puzzles/LogicGrid';
import PatternSequence from './puzzles/PatternSequence';
import AptitudeQuestion from './puzzles/AptitudeQuestion';
import Timer from './Timer';
import { useAppContext } from '../context/AppContext';
import { getDailyActivity, saveDailyActivity } from '../db';
import { CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { syncDailyScore } from '../lib/sync';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyRandom } from '../lib/puzzleEngine';

export default function DailyChallenge() {
  const { user, activeDate, refreshStreak } = useAppContext();
  const [stage, setStage] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    let mounted = true;

    const genSeq = async () => {
      const seq = [];
      for (let i = 0; i < 10; i++) {
        const r = await getDailyRandom(activeDate, `puzzle-type-${i}`);
        if (r < 0.20) seq.push('logic');else
        if (r < 0.40) seq.push('pattern');else
        seq.push('aptitude');
      }
      return seq;
    };

    Promise.all([getDailyActivity(user?.id || '', activeDate), genSeq()]).then(([act, seq]) => {
      if (!mounted) return;
      setSequence(seq);

      if (act && act.completedPuzzles.length >= 10) {
        setStage(11);
        setTimeMs(act.timeSpentMs);
        setHintsUsed(0); 
      } else {
        setStage(0);
        setTimeMs(0);
        setHintsUsed(0);
      }
    });

    return () => {mounted = false;};
  }, [activeDate, user]);

  const startChallenge = () => {
    setStage(1);
    setIsTimerRunning(true);
  };

  const useGlobalHint = () => setHintsUsed((prev) => prev + 1);

  const handleLevelComplete = async () => {
    if (stage < 10) {
      setStage((s) => s + 1);
    } else {
      setIsTimerRunning(false);


      let finalScore = 1500 - Math.floor(timeMs / 1000) * 8 - hintsUsed * 100;
      finalScore = Math.max(finalScore, 100);
      finalScore = Math.min(finalScore, 1000);

      await saveDailyActivity(user?.id || '', {
        date: activeDate,
        completedPuzzles: sequence,
        score: finalScore,
        timeSpentMs: timeMs
      });

      syncDailyScore({ date: activeDate, score: finalScore });
      await refreshStreak();

      setStage(11); // complete stage

      setTimeout(() => {
        setShowMilestone(true); // Always pop badge for demo
      }, 800);
    }
  };

  if (stage === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-[2rem] text-center">
        
        <div className="w-16 h-16 bg-gradient-to-br from-bluestock-400 to-bluestock-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-bluestock-500/30">
          <Trophy size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-slate-800">Today's Sequence</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">Complete logic, patterns, and aptitude as fast as possible to keep your streak alive. 10 questions await. Hints reduce your final score!</p>
        <button onClick={startChallenge} className="bg-slate-900 text-white font-bold text-lg py-4 px-6 rounded-2xl w-full hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]">
          Start Challenge
        </button>
      </motion.div>);

  }

  if (stage === 11) {
    let finalScore = Math.min(Math.max(1500 - Math.floor(timeMs / 1000) * 8 - hintsUsed * 100, 100), 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-[2rem] text-center flex flex-col items-center relative overflow-hidden">
        
        {showMilestone &&
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 bg-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-orange-200 shadow-sm">
          
             <Sparkles size={14} className="text-orange-500" /> +1 Day Added
          </motion.div>
        }
        
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-green-500 mb-5 mt-6 drop-shadow-sm">
          
          <CheckCircle size={72} strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-3xl font-black mb-2 text-slate-800">Challenge Complete!</h2>
        <p className="text-slate-500 font-medium pb-6 pt-1">You solved all 10 problems.</p>
        
        <div className="flex gap-4 w-full mt-2">
          <div className="flex-1 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 flex flex-col justify-center items-center backdrop-blur-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Time</p>
            <p className="text-2xl font-black font-mono text-slate-700">
              {Math.floor(timeMs / 60000)}:{(Math.floor(timeMs / 1000) % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-bluestock-50 to-bluestock-100 rounded-2xl p-4 border border-bluestock-200/50 flex flex-col justify-center items-center shadow-inner">
            <p className="text-[10px] text-bluestock-600 font-bold uppercase tracking-widest mb-1.5">Score</p>
            <p className="text-3xl font-black text-bluestock-700 drop-shadow-sm">
              {finalScore}
            </p>
          </div>
        </div>
      </motion.div>);

  }

  const currentType = sequence[stage - 1];
  const currentSeed = `${activeDate}-stage-${stage - 1}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="glass-panel p-6 rounded-[2rem] flex flex-col min-h-[440px] relative">
      
      <div className="flex justify-between items-center w-full mb-8 z-10 gap-4">
        <div className="flex flex-1 gap-1 flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
          {sequence.map((_, i) =>
          <div
            key={i}
            className={`h-2 flex-1 rounded-[4px] transition-all min-w-[6px] ${
            stage > i + 1 ? 'bg-bluestock-500 shadow-sm' :
            stage === i + 1 ? 'bg-bluestock-400/80 scale-110 shadow-sm ring-2 ring-white' :
            'bg-white border border-slate-200/60'}`
            } />

          )}
        </div>
        <Timer isRunning={isTimerRunning} onTimeUpdate={setTimeMs} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <AnimatePresence mode="wait">
          {stage >= 1 && stage <= 10 &&
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center">
            
              {currentType === 'logic' && <LogicGrid onComplete={handleLevelComplete} useHint={useGlobalHint} seedOverride={currentSeed} />}
              {currentType === 'pattern' && <PatternSequence onComplete={handleLevelComplete} useHint={useGlobalHint} seedOverride={currentSeed} />}
              {currentType === 'aptitude' && <AptitudeQuestion onComplete={handleLevelComplete} useHint={useGlobalHint} seedOverride={currentSeed} />}
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </motion.div>);

}