export async function syncDailyScore(payload) {
  const syncQueueStr = localStorage.getItem('syncQueue') || '[]';
  const syncQueue = JSON.parse(syncQueueStr);


  if (!syncQueue.some((item) => item.date === payload.date)) {
    syncQueue.push(payload);
  }

  if (navigator.onLine) {
    console.log('[Sync] Device online, attempting mock sync...');
    await attemptSync(syncQueue);
  } else {
    console.log('[Sync] Device offline. Score queued for background sync.');
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  }


  if (typeof window !== 'undefined' && !window.syncListenerAttached) {
    window.addEventListener('online', async () => {
      const q = JSON.parse(localStorage.getItem('syncQueue') || '[]');
      if (q.length > 0) {
        console.log('[Sync] Network connection restored. Flushing queue...');
        await attemptSync(q);
      }
    });
    window.syncListenerAttached = true;
  }
}

export async function attemptSync(queue) {
  try {
    for (const item of queue) {
      console.log(`[Sync] POST /sync/daily-scores ->`, item);
      await new Promise((r) => setTimeout(r, 600)); // fake network delay
    }
    console.log('[Sync] Successfully synced all items!');
    localStorage.removeItem('syncQueue');
  } catch (error) {
    console.error('[Sync] Sync failed due to network error, keeping in queue', error);
    localStorage.setItem('syncQueue', JSON.stringify(queue));
  }
}