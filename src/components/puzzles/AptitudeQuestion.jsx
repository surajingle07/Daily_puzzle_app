import { useState, useEffect, useRef } from 'react';
import { getDailyRandom } from '../../lib/puzzleEngine';
import { useAppContext } from '../../context/AppContext';
import { Lightbulb } from 'lucide-react';

export default function AptitudeQuestion({ onComplete, useHint, seedOverride }) {
  const { activeDate } = useAppContext();
  const seed = seedOverride || activeDate;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);

  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);
  const [hintsAvailable, setHintsAvailable] = useState(1);
  const [hintMessage, setHintMessage] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      const typeRand = await getDailyRandom(seed, 'apt-type');
      let q = '';
      let a = 0;

      if (typeRand < 0.20) {
        // Addition / Subtraction
        const num1 = Math.floor((await getDailyRandom(seed, 'n1')) * 50) + 15;
        const num2 = Math.floor((await getDailyRandom(seed, 'n2')) * 50) + 15;
        if (num1 > num2) {
          q = `${num1} - ${num2} = ?`;
          a = num1 - num2;
        } else {
          q = `${num1} + ${num2} = ?`;
          a = num1 + num2;
        }
      } else if (typeRand < 0.40) {
        // Multiplication
        const num1 = Math.floor((await getDailyRandom(seed, 'm1')) * 11) + 3; // 3 to 13
        const num2 = Math.floor((await getDailyRandom(seed, 'm2')) * 11) + 3; // 3 to 13
        q = `${num1} × ${num2} = ?`;
        a = num1 * num2;
      } else if (typeRand < 0.60) {
        // Division
        const div1 = Math.floor((await getDailyRandom(seed, 'd1')) * 9) + 2; // 2 to 10
        const result = Math.floor((await getDailyRandom(seed, 'd2')) * 10) + 2; // 2 to 11
        const dividend = div1 * result;
        q = `${dividend} ÷ ${div1} = ?`;
        a = result;
      } else if (typeRand < 0.80) {
        // Percentages
        const percent = (Math.floor((await getDailyRandom(seed, 'p1')) * 19) + 1) * 5; // 5 to 95
        const base = (Math.floor((await getDailyRandom(seed, 'p2')) * 10) + 1) * 20; // 20 to 200
        q = `What is ${percent}% of ${base}?`;
        a = (percent * base) / 100;
      } else {
        // Simple Algebra: ax + b = c
        const aVal = Math.floor((await getDailyRandom(seed, 'a1')) * 5) + 2; // 2 to 6
        const xVal = Math.floor((await getDailyRandom(seed, 'x1')) * 10) + 2; // 2 to 11
        const bVal = Math.floor((await getDailyRandom(seed, 'b1')) * 20) + 1; // 1 to 20
        const cVal = aVal * xVal + bVal;

        q = `If ${aVal}x + ${bVal} = ${cVal}, what is x?`;
        a = xVal;
      }

      if (!isCancelled) {
        setQuestion(q);
        setAnswer(a);
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
    if (hintsAvailable <= 0 || answer === null) return;
    useHint();
    setHintsAvailable(0);

    const typeRand = await getDailyRandom(seed, 'apt-type');
    if (typeRand < 0.40) {
      setHintMessage(`The last digit of the answer is ${answer % 10}`);
    } else if (typeRand < 0.60) {
      const div1 = Math.floor((await getDailyRandom(seed, 'd1')) * 9) + 2;
      setHintMessage(`Multiplication is the reverse of division: ? × ${div1} = dividend.`);
    } else if (typeRand < 0.80) {
      const base = (Math.floor((await getDailyRandom(seed, 'p2')) * 10) + 1) * 20;
      setHintMessage(`10% of the number is ${base / 10}, use that to find the total.`);
    } else {
      const aVal = Math.floor((await getDailyRandom(seed, 'a1')) * 5) + 2;
      const bVal = Math.floor((await getDailyRandom(seed, 'b1')) * 20) + 1;
      setHintMessage(`Subtract ${bVal} from both sides, then divide by ${aVal}.`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">Aptitude</h3>
        <p className="text-sm mt-1.5 text-slate-500 font-semibold">Solve the problem</p>
      </div>
      
      <div className="flex justify-center items-center bg-slate-50/80 px-4 py-8 rounded-3xl border border-slate-200/60 text-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-sm w-full min-h-[100px]">
        <p className="text-2xl font-black font-mono tracking-wide">{question}</p>
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