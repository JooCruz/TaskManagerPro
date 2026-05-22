/**
 * Configuracao central da API TaskManager.
 *
 * Ajusta estes valores para apontar a app mobile/web para o backend Node.js.
 */

export const CONFIG = {
  BACKEND_HOST: process.env.EXPO_PUBLIC_BACKEND_HOST || 'localhost',
  BACKEND_PORT: process.env.EXPO_PUBLIC_BACKEND_PORT || '8000',
  BACKEND_PROTOCOL: process.env.EXPO_PUBLIC_BACKEND_PROTOCOL || 'http',
};

export const API_BASE_URL = `${CONFIG.BACKEND_PROTOCOL}://${CONFIG.BACKEND_HOST}:${CONFIG.BACKEND_PORT}/taskmanager_api`;

/**
 * Uso: getApiUrl('login') => http://localhost:8000/taskmanager_api/login
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/${endpoint}`;
};

export const validateConfig = (): boolean => {
  if (!CONFIG.BACKEND_HOST) {
    console.error('ERRO: BACKEND_HOST nao esta configurado!');
    return false;
  }

  console.log(`Configuracao carregada: ${API_BASE_URL}`);
  return true;
};

export default CONFIG;
