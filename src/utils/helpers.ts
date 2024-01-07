import * as bcrypt from 'bcryptjs';

export async function hashPassword(rawPassword: string) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(rawPassword, salt);
}

export function comparePassword(rawPassword: string, encrypted: string) {
  return bcrypt.compare(rawPassword, encrypted);
}
