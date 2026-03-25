import { useState, useEffect, useRef } from 'react';
import { getDailyRandom } from '../../lib/puzzleEngine';
import { useAppContext } from '../../context/AppContext';
import { Lightbulb } from 'lucide-react';

export default function PatternSequence({ onComplete, useHint, seedOverride }) {
  const { activeDate } = useAppContext();
  const seed = seedOverride || activeDate;
  const [sequence, setSequence] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);
  const [hintsAvailable, setHintsAvailable] = useState(1);
  const [hintMessage, setHintMessage] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      const r = await getDailyRandom(seed, 'seq-type');
      let seq = [];
      let ans = 0;

      const start = Math.floor((await getDailyRandom(seed, 'seq-start')) * 10) + 1;
      const step = Math.floor((await getDailyRandom(seed, 'seq-step')) * 5) + 2;

      if (r < 0.33) {
        seq = [start, start + step, start + step * 2, start + step * 3];
        ans = start + step * 4;
      } else if (r < 0.66) {
        seq = [start, start * step, start * step * step, start * step * step * step];
        ans = start * step * step * step * step;
      } else {
        seq = [start, step, start + step, start + step * 2];
        seq[2] = seq[0] + seq[1];
        seq[3] = seq[1] + seq[2];
        ans = seq[2] + seq[3];
      }

      if (!isCancelled) {
        setSequence(seq);
        setAnswer(ans);
        setInputVal('');
        setError(false);
        setHintMessage(null);
        setHintsAvailable(1);
      }
    };
    generate();
    return () => {isCancelled = true;};
  }, [seed]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (parseInt(inputVal) === answer) {
      setError(false);
      onComplete();
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  };

  const handleHint = async () => {
    if (hintsAvailable <= 0) return;
    useHint();
    setHintsAvailable(0);

    const r = await getDailyRandom(seed, 'seq-type');
    if (r < 0.33) {
      setHintMessage("Look for a constant addition between the numbers.");
    } else if (r < 0.66) {
      setHintMessage("Each number is multiplied by a constant factor.");
    } else {
      setHintMessage("Add the previous two numbers together to get the next one.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">Sequence</h3>
        <p className="text-sm mt-1.5 text-slate-500 font-semibold">What comes next?</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 text-xl font-mono font-black w-full my-2">
        {sequence.map((n, i) =>
        <div key={i} className="bg-slate-50/80 px-4 py-3.5 rounded-2xl border border-slate-200/60 text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-sm">{n}</div>
        )}
        <div className="bg-gradient-to-br from-bluestock-400 to-bluestock-600 border border-bluestock-500/50 text-white px-4 py-3.5 rounded-2xl shadow-lg shadow-bluestock-500/30">?</div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full relative">
        <input
          ref={inputRef}
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className={`flex-1 min-w-0 p-4 pl-6 font-black text-2xl rounded-2xl outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${error ? 'border-2 border-red-400 bg-red-50 text-red-700' : 'border-2 border-slate-200 focus:border-bluestock-500 focus:bg-white focus:ring-4 ring-bluestock-500/20 text-slate-800 bg-slate-50/50'}`}
          placeholder="..."
          autoFocus />
        
        <button type="submit" className="bg-slate-900 text-white font-bold px-6 rounded-2xl hover:bg-black transition-all shadow-md active:scale-95 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1">
          Go
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={handleHint}
          disabled={hintsAvailable <= 0}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          
          <Lightbulb size={16} className={hintsAvailable > 0 ? "text-amber-400" : ""} />
          <span>Hint ({hintsAvailable} left) -250pts</span>
        </button>
        {hintMessage &&
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100/50 font-bold text-center w-full shadow-inner animate-[fadeIn_0.3s_ease-out]">
             {hintMessage}
          </p>
        }
      </div>
    </div>);

}