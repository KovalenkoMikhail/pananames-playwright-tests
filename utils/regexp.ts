export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function urlEndsWith(path: string): RegExp {
  return new RegExp(`${escapeRegExp(path)}/?$`);
}
