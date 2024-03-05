export const timestampFromDatetime = (datetime) => {
  const year = String(datetime.year).padStart(4, "0");
  const month = String(datetime.month).padStart(2, "0");
  const day = String(datetime.day).padStart(2, "0");
  const hours = String(datetime.hours).padStart(2, "0");
  const minutes = String(datetime.minutes).padStart(2, "0");
  const seconds = String(datetime.seconds).padStart(2, "0");

  const timestamp = `${year}${month}${day}T${hours}${minutes}${seconds}`;

  return timestamp;
};
