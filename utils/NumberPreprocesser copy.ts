export const NumberPreprocesser = (number: number | string): string => {
  const str = number.toString();
  const result = str.replace(/\d(?=(\d{3})+(?!\d))/g, "$&,");
  return result;
};
