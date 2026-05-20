import {apiRequest} from './client';

export function scanQr(qrCode) {
  return apiRequest('/qr/scan', {
    method: 'POST',
    body: {qrCode},
  });
}

