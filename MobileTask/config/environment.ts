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
 * Uso: getApiUrl('login') => http://localhost:8080/taskmanager_api/login
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

/**
 * Helper melhorado para fazer fetch com erro handling e logging
 */
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);
  console.log(`[API] ${options?.method || 'GET'} ${url}`);
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[API] Resposta inválida: ${text}`);
      throw new Error(`Servidor respondeu com: ${text}`);
    }

    console.log(`[API] Status ${res.status}:`, data);

    if (!res.ok) {
      throw new Error(data.mensagem || `Erro ${res.status}`);
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[API Error] ${message}`);
    throw error;
  }
};

export default CONFIG;
