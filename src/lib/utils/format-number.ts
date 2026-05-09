export const formatNumber = (num: number | string) => {
  return Number(num).toLocaleString("en-US");
};

export const formatWater = (ml: number | string) => {
  return (Number(ml) / 1000).toFixed(1);
};
