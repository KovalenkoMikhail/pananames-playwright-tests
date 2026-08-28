export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is missing. Copy .env.example to .env and fill in the values.`);
  }
  return value;
}
