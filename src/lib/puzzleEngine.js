
export async function getDailySeedHash(dateStr) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dateStr + "-daily-puzzle-salt-v1");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}


export async function getDailyRandom(dateStr, salt = "") {
  const hash = await getDailySeedHash(dateStr + salt);
  // Take first 8 chars of hex (32 bits) and make it an integer
  const intVal = parseInt(hash.slice(0, 8), 16);
  return intVal / 0xffffffff;
}

export async function shuffleArrayDeterministic(array, dateStr, salt = "") {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // use the changing index as part of the salt so every swap is pseudorandom
    const r = await getDailyRandom(dateStr, salt + "-shuffle-" + i);
    const j = Math.floor(r * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}