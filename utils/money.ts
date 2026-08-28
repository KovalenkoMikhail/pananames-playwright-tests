export function parsePrice(text: string): number {
  const matches = [...text.replace(/,/g, '').matchAll(/\$(\d+(?:\.\d+)?)/g)];
  const amount = matches.at(-1)?.[1];
  if (!amount) {
    throw new Error(`Cannot parse price from: ${text}`);
  }
  return Number(amount);
}

export function sumPrices(prices: number[]): number {
  const cents = prices.reduce((total, price) => total + Math.round(price * 100), 0);
  return cents / 100;
}
