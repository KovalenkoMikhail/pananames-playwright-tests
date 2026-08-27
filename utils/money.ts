export function parsePrice(text: string): number {
  const matches = [...text.replace(/,/g, '').matchAll(/\$(\d+(?:\.\d+)?)/g)];
  if (matches.length === 0) {
    throw new Error(`Cannot parse price from: ${text}`);
  }
  return Number(matches[matches.length - 1][1]);
}

export function sumPrices(prices: number[]): number {
  const cents = prices.reduce((total, price) => total + Math.round(price * 100), 0);
  return cents / 100;
}
