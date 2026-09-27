export function egp(value: number) {
  return `${Number(value).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`;
}

export function effectivePrice(price: number, discount?: number | null) {
  return discount && discount > 0 && discount < price ? discount : price;
}
