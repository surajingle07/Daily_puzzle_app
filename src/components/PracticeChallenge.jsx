import { useState } from 'react';
import LogicGrid from './puzzles/LogicGrid';
import PatternSequence from './puzzles/PatternSequence';
import AptitudeQuestion from './puzzles/AptitudeQuestion';
import Timer from './Timer';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyRandom } from '../lib/puzzleEngine';

export default function PracticeChallenge() {
  const [stage, setStage] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [randomSeed, setRandomSeed] = useState(() => Math.random().toString());

  const startChallenge = async () => {
    const s = Math.random().toString();
    setRandomSeed(s);

    // Generate new full sequence for practice
    const seq = [];
    for (let i = 0; i < 10; i++) {
      const r = await getDailyRandom(s, `puzzle-type-${i}`);
      if (r < 0.33) seq.push('logic');else
      if (r < 0.66) seq.push('pattern');else
      seq.push('aptitude');
    }
    setSequence(seq);

    setStage(1);
    setIsTimerRunning(true);
    setTimeMs(0);
    setHintsUsed(0);
  };

  const useGlobalHint = () => setHintsUsed((prev) => prev + 1);

  const handleLevelComplete = () => {
    if (stage < 10) {
      setStage((s) => s + 1);
    } else {
      setIsTimerRunning(false);
      setStage(11);
    }
  };

  const playAgain = () => {
    setStage(0);
  };

  if (stage === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-[2rem] text-center bg-gradient-to-br from-slate-50 to-slate-100">
        
        <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <RefreshCw size={28} />
        </div>
        <h2 className="text-xl font-black mb-2 text-slate-800">Practice Mode</h2>
        <p className="text-slate-500 font-medium mb-6 leading-relaxed text-sm">Play unlimited random 10-question sequences. This won't affect your daily streak or score.</p>
        <button onClick={startChallenge} className="bg-white border-2 border-slate-200 text-slate-700 font-bold text-base py-3 px-6 rounded-2xl w-full hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]">
          Play Random Game
        </button>
      </motion.div>);

  }

  if (stage === 11) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-[2rem] text-center flex flex-col items-center relative overflow-hidden">
        
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-bluestock-500 mb-4 mt-2 drop-shadow-sm">
          
          <CheckCircle size={64} strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-2xl font-black mb-2 text-slate-800">Practice Complete!</h2>
        
        <div className="flex gap-4 w-full mt-4 mb-6">
          <div className="flex-1 bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 flex flex-col justify-center items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Time</p>
            <p className="text-xl font-black font-mono text-slate-700">
              {Math.floor(timeMs / 60000)}:{(Math.floor(timeMs / 1000) % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="flex-1 bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 flex flex-col justify-center items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hints</p>
            <p className="text-xl font-black font-mono text-slate-700">
              {hintsUsed}
            </p>
          </div>
        </div>
        
        <button onClick={playAgain} className="bg-slate-900 text-white font-bold text-md py-3 px-6 rounded-2xl w-full hover:bg-black transition-all shadow-md active:scale-[0.98]">
          Play Another
        </button>
      </motion.div>);

  }

  const currentType = sequence[stage - 1];
  const currentSeed = `${randomSeed}-stage-${stage - 1}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="glass-panel p-6 rounded-[2rem] flex flex-col min-h-[440px] relative border-2 border-slate-200 shadow-lg">
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full uppercase">
        Practice Mode
      </div>
      
      <div className="flex justify-between items-center w-full mb-8 z-10 mt-6 gap-4">
        <div className="flex flex-1 gap-1 flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
          {sequence.map((_, i) =>
          <div
            key={i}
            className={`h-2 flex-1 rounded-[4px] transition-all min-w-[6px] ${
            stage > i + 1 ? 'bg-slate-400 shadow-sm' :
            stage === i + 1 ? 'bg-slate-400/80 scale-110 shadow-sm ring-2 ring-white' :
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
      
      <button onClick={() => setStage(0)} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 hover:text-slate-600">
        Quit Practice
      </button>
    </motion.div>);

}