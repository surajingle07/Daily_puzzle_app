import React, { createContext, useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getStreak } from '../db';





















const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('puzzleActiveUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeDate, setActiveDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [streak, setStreak] = useState(0);

  // Initialize mock DB
  useEffect(() => {
    const db = localStorage.getItem('puzzleUsersDB');
    if (!db) {
      localStorage.setItem('puzzleUsersDB', JSON.stringify([
      { id: '1', name: 'Demo User', email: 'demo@bluestock.in', password: 'password123', isGuest: false }]
      ));
    }
  }, []);

  const login = (email, password, isGuest = false) => {
    if (isGuest) {
      const u = { id: 'guest-' + Date.now(), name: 'Guest', email: '', isGuest: true };
      setUser(u);
      localStorage.setItem('puzzleActiveUser', JSON.stringify(u));
      return true;
    }

    const db = JSON.parse(localStorage.getItem('puzzleUsersDB') || '[]');
    const found = db.find((u) => u.email === email && u.password === password);

    if (found) {
      const u = { id: found.id, name: found.name, email: found.email, isGuest: false };
      setUser(u);
      localStorage.setItem('puzzleActiveUser', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const register = (name, email, password) => {
    const db = JSON.parse(localStorage.getItem('puzzleUsersDB') || '[]');
    if (db.some((u) => u.email === email)) return false;

    const newUser = { id: Date.now().toString(), name, email, password, isGuest: false };
    db.push(newUser);
    localStorage.setItem('puzzleUsersDB', JSON.stringify(db));
    login(email, password, false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('puzzleActiveUser');
  };

  const refreshStreak = async () => {
    if (!user) {
      setStreak(0);
      return;
    }
    const s = await getStreak(user.id, activeDate);
    setStreak(s);
  };

  useEffect(() => {
    refreshStreak();
  }, [activeDate, user]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (!next) setActiveDate(dayjs().format('YYYY-MM-DD'));
      return next;
    });
  };

  const nextDay = () => {
    if (isDemoMode) {
      setActiveDate((prev) => dayjs(prev).add(1, 'day').format('YYYY-MM-DD'));
    }
  };

  return (
    <AppContext.Provider value={{ user, login, register, logout, activeDate, isDemoMode, toggleDemoMode, streak, refreshStreak, nextDay }}>
      {children}
    </AppContext.Provider>);

}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}