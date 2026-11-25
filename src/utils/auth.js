export const LOGIN_URL = `https://anilist.co/api/v2/oauth/authorize?client_id=${import.meta.env.VITE_ANILIST_CLIENT_ID}&response_type=token`;

export function redirectToLogin() {
  window.location.href = LOGIN_URL;
}
