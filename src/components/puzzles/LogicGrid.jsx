import { useState, useEffect } from 'react';
import { getDailyRandom } from '../../lib/puzzleEngine';
import { useAppContext } from '../../context/AppContext';
import { Lightbulb } from 'lucide-react';

export default function LogicGrid({ onComplete, useHint, seedOverride }) {
  const { activeDate } = useAppContext();
  const seed = seedOverride || activeDate;
  const [targetGrid, setTargetGrid] = useState(Array(9).fill(false));
  const [userGrid, setUserGrid] = useState(Array(9).fill(false));
  const [isRevealing, setIsRevealing] = useState(true);
  const [hintsAvailable, setHintsAvailable] = useState(2);

  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      const newGrid = Array(9).fill(false);
      let count = 0;
      for (let i = 0; i < 9; i++) {
        const r = await getDailyRandom(seed, `logic-${i}`);
        if (r > 0.5 && count < 5) {
          newGrid[i] = true;
          count++;
        }
      }
      if (count < 3) {
        newGrid[0] = true;newGrid[4] = true;newGrid[8] = true;
      }
      if (!isCancelled) {
        setTargetGrid(newGrid);
        setUserGrid(Array(9).fill(false));
        setIsRevealing(true);
        setTimeout(() => {
          if (!isCancelled) setIsRevealing(false);
        }, 2000);
      }
    };
    generate();
    return () => {isCancelled = true;};
  }, [seed]);

  const toggleTile = (index) => {
    if (isRevealing) return;
    const newGrid = [...userGrid];
    newGrid[index] = !newGrid[index];
    setUserGrid(newGrid);

    if (newGrid.every((val, i) => val === targetGrid[i])) {
      setTimeout(onComplete, 400);
    }
  };

  const handleHint = () => {
    if (hintsAvailable <= 0 || isRevealing) return;
    useHint();
    setHintsAvailable((prev) => prev - 1);

    // Auto-fill one missing correct tile
    const newGrid = [...userGrid];
    const missingIndices = targetGrid.map((val, i) => val && !userGrid[i] ? i : -1).filter((i) => i !== -1);

    if (missingIndices.length > 0) {
      // Pick first missing
      newGrid[missingIndices[0]] = true;
      setUserGrid(newGrid);
      if (newGrid.every((val, i) => val === targetGrid[i])) {
        setTimeout(onComplete, 400);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">Memory Grid</h3>
        <p className={`text-sm mt-1.5 transition-colors font-semibold ${isRevealing ? 'text-bluestock-500' : 'text-slate-500'}`}>
          {isRevealing ? "Memorize the pattern..." : "Recreate the pattern!"}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2.5 bg-slate-100/80 p-3.5 rounded-3xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-slate-200/50">
        {userGrid.map((val, i) =>
        <button
          key={i}
          onClick={() => toggleTile(i)}
          disabled={isRevealing}
          className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl transition-all duration-300 ${
          isRevealing ?
          targetGrid[i] ?
          'bg-bluestock-500 shadow-xl shadow-bluestock-500/40 scale-[1.03]' :
          'bg-white shadow-sm' :
          val ?
          'bg-bluestock-500 shadow-lg shadow-bluestock-500/30 ring-1 ring-bluestock-400/50' :
          'bg-white shadow-md border-b-2 border-slate-200/80 hover:bg-slate-50 hover:-translate-y-0.5'}`
          } />

        )}
      </div>

      <button
        onClick={handleHint}
        disabled={hintsAvailable <= 0 || isRevealing}
        className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        
        <Lightbulb size={16} className={hintsAvailable > 0 ? "text-amber-400" : ""} />
        <span>Hint ({hintsAvailable} left) -250pts</span>
      </button>
    </div>);

}