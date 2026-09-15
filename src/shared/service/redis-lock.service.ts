import crypto from "crypto";
import { redis } from "../../config/upstash"; 

const PAYMENT_LOCK_TTL = 120;

const releaseLockScript = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end
`;

export const acquirePaymentLock = async (
  bookingId: string,
) => {
  const key = `payment:create:${bookingId}`;
  const value = crypto.randomUUID();

  const acquired = await redis.set(key, value, {
    nx: true,
    ex: PAYMENT_LOCK_TTL,
  });

  if (!acquired) {
    return null;
  }

  return {
    key,
    value,
  };
};

export const releasePaymentLock = async (
  key: string,
  value: string,
) => {
  await redis.eval(
    releaseLockScript,
    [key],
    [value],
  );
};