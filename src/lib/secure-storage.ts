import * as SecureStore from 'expo-secure-store';

// ponytail: SecureStore ma limit ~2048B/klucz, sesja Supabase (JWT+refresh+user) bywa większa.
// Dzielimy na chunki pod tym samym prefiksem. Gdy dane urosną dużo bardziej (np. cache profilu),
// przenieś je do zwykłego storage i trzymaj w SecureStore tylko klucz szyfrujący.
const CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}_${index}`;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const chunks: string[] = [];
    for (let i = 0; ; i++) {
      const chunk = await SecureStore.getItemAsync(chunkKey(key, i));
      if (chunk === null) break;
      chunks.push(chunk);
    }
    return chunks.length > 0 ? chunks.join('') : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    await secureStorage.removeItem(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(chunkKey(key, i), chunk))
    );
  },

  async removeItem(key: string): Promise<void> {
    for (let i = 0; ; i++) {
      const existing = await SecureStore.getItemAsync(chunkKey(key, i));
      if (existing === null) break;
      await SecureStore.deleteItemAsync(chunkKey(key, i));
    }
  },
};
