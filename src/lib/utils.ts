import * as bcryt from 'bcrypt';
export function generateDefaultPassword(): string {
  const length = 8; // Length of the default password
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Character set for the password
  let defaultPassword = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    defaultPassword += charset.charAt(randomIndex);
  }

  return defaultPassword;
}

export function encodedPassword(rawPassword: string) {
  const SALT = bcryt.genSaltSync();
  return bcryt.hashSync(rawPassword, SALT);
}

export function comparePasswords(rawPassword: string, hash: string) {
  return bcryt.compareSync(rawPassword, hash);
}
