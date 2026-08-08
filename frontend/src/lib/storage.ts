const ACCESS_KEY = "touribook.access_token";

/**
 * Stratégie :
 *  - access token  → mémoire + localStorage (courte durée, ~15 min)
 *  - refresh token → cookie httpOnly posé par le backend (jamais lisible en JS)
 * Si ton backend renvoie le refresh dans le body, stocke-le ici aussi,
 * mais le cookie httpOnly reste la solution la plus sûre contre le XSS.
 */
let accessTokenInMemory: string | null = null;

export const tokenStorage = {
  get: () => accessTokenInMemory ?? localStorage.getItem(ACCESS_KEY),
  set: (token: string) => {
    accessTokenInMemory = token;
    localStorage.setItem(ACCESS_KEY, token);
  },
  clear: () => {
    accessTokenInMemory = null;
    localStorage.removeItem(ACCESS_KEY);
  },
};