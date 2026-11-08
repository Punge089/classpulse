import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const keyLength = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(plain, salt, keyLength) as Buffer;
  return salt.toString("hex") + ":" + key.toString("hex");
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!/^[0-9a-f]{32}:[0-9a-f]{128}$/.test(hash)) return false;
  const [salt, stored] = hash.split(":");
  const key = await deriveKey(plain, Buffer.from(salt, "hex"), keyLength) as Buffer;
  return timingSafeEqual(key, Buffer.from(stored, "hex"));
}
