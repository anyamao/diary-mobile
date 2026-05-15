const getApiUrl = (): string => {
  return "https://api.vibenote.ru";
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 30000,
  withCredentials: true,
};
