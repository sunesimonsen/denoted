const days = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wen",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const frontmatter = (note) => {
  const { year, month, day, hours, minutes, seconds } = note.date;
  const date = new Date(year, month, day, hours, minutes, seconds);
  const dayName = days[date.getDay()];
  const dateString = `[${year}-${month}-${day} ${dayName} ${hours}:${minutes}]`;

  const properties = {
    title: note.title,
    date: dateString,
    filetags: ":" + note.tags.join(":") + ":",
    identifier: note.timestamp,
  };

  for (const key of Object.keys(note.properties)) {
    if (!properties[key]) {
      properties[key] = note.properties[key];
    }
  }

  const longestKey = Object.keys(properties).reduce(
    (result, key) => Math.max(result, key.length),
    0,
  );

  return Object.entries(properties)
    .map(([key, value]) => `#+${(key + ":").padEnd(longestKey + 1)} ${value}`)
    .join("\n");
};
