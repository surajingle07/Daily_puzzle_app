import { openDB } from 'idb';
import dayjs from 'dayjs';
let dbPromise;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('PuzzleAppDB', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2 && db.objectStoreNames.contains('dailyActivity')) {
          db.deleteObjectStore('dailyActivity');
        }
        if (!db.objectStoreNames.contains('dailyActivity')) {
          const store = db.createObjectStore('dailyActivity', { keyPath: ['userId', 'date'] });
          store.createIndex('by_user', 'userId');
        }
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState');
        }
      }
    });
  }
  return dbPromise;
}

export async function getDailyActivity(userId, date) {
  if (!userId) return undefined;
  const db = await getDB();
  return db.get('dailyActivity', [userId, date]);
}

export async function saveDailyActivity(userId, activity) {
  if (!userId) return;
  const db = await getDB();
  const tx = db.transaction('dailyActivity', 'readwrite');
  await tx.objectStore('dailyActivity').put({ ...activity, userId });
  await tx.done;
}

export async function getStreak(userId, todayStr = dayjs().format('YYYY-MM-DD')) {
  if (!userId) return 0;
  const db = await getDB();
  const userActivities = await db.getAllFromIndex('dailyActivity', 'by_user', userId);

  if (userActivities.length === 0) return 0;

  const sortedDates = userActivities.map((a) => a.date).sort((a, b) => dayjs(b).diff(dayjs(a))); // Descending

  let currentStreak = 0;
  let referenceDate = dayjs(todayStr);

  for (let i = 0; i < sortedDates.length; i++) {
    const activityDate = dayjs(sortedDates[i]);
    const diffDays = referenceDate.diff(activityDate, 'day');

    // Check if the difference is 0 (did it today) or 1 (did it yesterday but haven't yet today)
    if (diffDays === currentStreak || diffDays === currentStreak + 1) {
      if (diffDays === currentStreak + 1) {
        currentStreak++;
      } else if (diffDays === 0 && currentStreak === 0) {
        currentStreak = 1;
      }
    } else {
      break;
    }
  }

  return currentStreak;
}

export async function getAllActivities(userId) {
  if (!userId) return [];
  const db = await getDB();
  return db.getAllFromIndex('dailyActivity', 'by_user', userId);
}