import { TextEncoder } from 'util';

export const getJwtSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'spinstorey-fallback-secret-at-least-32-chars'
  );