import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LoginScreen() {
  const { login, register } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (isLogin) {
      if (!login(email, password, false)) {
        setErrorMsg('Invalid credentials. Try the demo account.');
      }
    } else {
      if (!name || !email || !password) {
        setErrorMsg('All fields are required.');
        return;
      }
      if (!register(name, email, password)) {
        setErrorMsg('Email already exists. Please login.');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen relative w-full overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-bluestock-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel w-full max-w-[26rem] rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl relative overflow-hidden z-10">
        
        <div className="w-16 h-16 bg-gradient-to-br from-bluestock-500 to-bluestock-700 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-bluestock-500/30">
          <Puzzle size={32} className="stroke-[2.5]" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Daily Puzzle</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium text-center">Challenge your mind every day.</p>

        {isLogin &&
        <div className="w-full bg-bluestock-50 border border-bluestock-200 rounded-xl p-3 mb-6 flex flex-col items-center">
            <p className="text-xs font-bold text-bluestock-800 uppercase tracking-widest mb-2">Demo Credentials</p>
            <p className="text-sm font-mono text-slate-700 font-bold bg-white px-3 py-1 rounded shadow-sm">demo@bluestock.in</p>
            <p className="text-sm font-mono text-slate-700 font-bold bg-white px-3 py-1 rounded shadow-sm mt-1">password123</p>
          </div>
        }

        {errorMsg &&
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-red-50 text-red-600 text-sm font-bold text-center px-4 py-2 rounded-xl border border-red-200 mb-4">
            {errorMsg}
          </motion.div>
        }

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {!isLogin &&
            <motion.input
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-slate-50/80 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-bluestock-500 focus:bg-white focus:ring-4 ring-bluestock-500/20 transition-all font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400" />

            }
          </AnimatePresence>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-slate-50/80 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-bluestock-500 focus:bg-white focus:ring-4 ring-bluestock-500/20 transition-all font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
            required />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-slate-50/80 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-bluestock-500 focus:bg-white focus:ring-4 ring-bluestock-500/20 transition-all font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
            required />
          
          
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3.5 mt-2 rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2">
            
            {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="w-full flex justify-between items-center mt-6 text-sm font-bold text-slate-500">
          <button
            type="button"
            onClick={() => {setIsLogin(!isLogin);setErrorMsg('');setEmail('');setPassword('');}}
            className="hover:text-bluestock-600 transition-colors">
            
            {isLogin ? "Need an account?" : "Already have an account?"}
          </button>
          <button
            onClick={() => login('', '', true)}
            className="text-bluestock-600 hover:text-bluestock-700 flex items-center gap-1 group">
            
            Guest <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>);

}