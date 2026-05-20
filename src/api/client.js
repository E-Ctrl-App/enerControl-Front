import {API_BASE_URL} from './config';

let accessToken;

export function setAccessToken(token) {
  accessToken = token;
}

function getErrorMessage(status, body) {
  if (body?.message) {
    return Array.isArray(body.message) ? body.message.join(', ') : body.message;
  }

  if (status === 401) {
    return 'Tu sesión expiró o las credenciales no son válidas.';
  }

  if (status === 404) {
    return 'No se encontró el recurso solicitado.';
  }

  if (status >= 500) {
    return 'El backend no está disponible en este momento.';
  }

  return 'No pudimos completar la solicitud.';
}

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? {'Content-Type': 'application/json'} : {}),
    ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch (error) {
    throw new Error(
      `No se pudo conectar con ${API_BASE_URL}. Revisa que el backend esté corriendo.`,
    );
  }

  const rawText = await response.text();
  let body = null;

  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch (error) {
    body = {message: rawText};
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, body));
  }

  return body;
}
