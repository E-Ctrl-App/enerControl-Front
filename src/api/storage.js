import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'ecocampus.accessToken';
const USER_KEY = 'ecocampus.user';

export async function saveSession({accessToken, user}) {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, accessToken),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function getStoredSession() {
  const [accessToken, userJson] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!accessToken || !userJson) {
    return null;
  }

  return {
    accessToken,
    user: JSON.parse(userJson),
  };
}

export async function clearSession() {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}
