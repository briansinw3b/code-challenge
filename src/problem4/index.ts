function sumToNA(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function sumToNB(n: number): number {
  if (n === 1) return 1;
  return sumToNB(n - 1) + n;
}

function sumToNC(n: number): number {
  return (n * (n + 1)) / 2;
}
