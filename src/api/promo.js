import promoCodes from '../data/promoCodes.json';
import { USE_MOCK, createResponse, httpRequest, simulateLatency } from './client';

export async function validatePromo(code) {
  if (!USE_MOCK) {
    return httpRequest('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  await simulateLatency(300, 450);

  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    throw new Error('Please enter a promo code.');
  }

  const found = promoCodes.find((p) => p.code.toUpperCase() === normalized);
  if (!found) {
    throw new Error(`Code "${normalized}" is not valid. Try SABLE10, WELCOME15, or FREESHIP.`);
  }

  return createResponse(found);
}
