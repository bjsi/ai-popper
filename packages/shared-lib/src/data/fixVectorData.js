const fs = require("fs/promises");

(async () => {
  // read vectorData.json
  const json = await fs.readFile('vectorData.json', "utf-8");
  // parse it
  const parsed =
    JSON.parse(json);
  const updated = parsed.map((x) => ({
    ...x,
    data: {
      ...x.data,
      start: x.data.start <= 10_000 ? 0 : Math.floor(x.data.start / 1000),
      end: Math.ceil(x.data.end / 1000),
    },
  }));
  // write it back
  await fs.writeFile('vectorData.json', JSON.stringify(updated));
})();
