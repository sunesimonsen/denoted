export const newDatetime = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  return { year, month, day, hours, minutes, seconds };
};
