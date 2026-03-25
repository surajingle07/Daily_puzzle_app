import React from 'react';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export default function Layout({ children }) {
  const { user } = useAppContext();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#f8fafc] text-slate-900 mx-auto w-full max-w-5xl shadow-2xl xl:border-x border-slate-200/60 relative overflow-hidden">
      {/* Decorative background blobs - reduced opacity for elegance */}
      <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[30%] rounded-full bg-bluestock-300/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      
      <Header />
      <main className="flex-1 p-5 pb-8 flex flex-col gap-6 relative z-10 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={user ? 'auth' : 'guest'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col gap-6 h-full">
            
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>);

}