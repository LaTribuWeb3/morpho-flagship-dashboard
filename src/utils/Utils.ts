export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function roundTo(num: number, dec: number): number {
  const pow = Math.pow(10, dec);
  return Math.round((num + Number.EPSILON) * pow) / pow;
}

export function FriendlyFormatNumber(num: number): string {
  if (num == 0) {
    return '0';
  }

  if (num > 1e9) {
    return `${roundTo(num / 1e9, 2)}B`;
  } else if (num > 1e6) {
    return `${roundTo(num / 1e6, 2)}M`;
  } else if (num > 1e3) {
    return `${roundTo(num / 1e3, 2)}K`;
  } else if (num < 1 / 1e3) {
    return num.toExponential();
  } else {
    return `${roundTo(num, 4).toString()}`;
  }
}

export function PercentageFormatter(num: number): string {
  return `${roundTo(num * 100, 2)}%`;
}
