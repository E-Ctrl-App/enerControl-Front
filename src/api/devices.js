import {apiRequest} from './client';

export function toggleDevice(deviceId) {
  return apiRequest(`/devices/${deviceId}/toggle`, {
    method: 'PATCH',
  });
}

