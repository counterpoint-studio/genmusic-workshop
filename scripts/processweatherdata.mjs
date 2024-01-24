import fs from "fs";
import path from "path";

const FILES = {
  precipitation: [
    "precipitation-jan2023-data-20240123T154415Z-ced02f8f-70e9-4151-88e0-2ba7aadc4f10.json",
    "precipitation-feb2023-20240123T164135Z-35b3351b-6643-4333-b793-97c32beeb387.json",
    "precipitation-march2023-data-20240123T170338Z-05a1941f-3699-46eb-b4b8-1104e97c9a94.json",
    "precipitation-april2023-data-20240123T173340Z-d60738ad-ad6b-4f76-8676-bf7a8601a01c.json",
    "precipitation-may2023-data-20240124T074141Z-7fca5112-d9ac-4914-9a45-0c8d4014efe5.json",
    "precipitation-june2023-data-20240124T081642Z-3a49b01b-9a17-4839-ada8-85dd9bf7db1d.json",
    "precipitation-july2023-data-20240124T084007Z-dfe8be89-7da1-41be-bbfa-ac51da2394e3.json",
    "precipitation-august2023-data-20240124T093007Z-3ee01bf2-e762-4fcf-9e4d-8c5abcd6b389.json",
    "precipitation-september2023-data-20240124T094921Z-115efea4-dcf9-415f-8890-52b518799ae2.json",
    "precipitation-october2023-data-20240124T100348Z-6b88b74b-12fc-4fa0-a43b-78bc7f843150.json",
    "precipitation-november2023-data-20240124T112201Z-6dddbaa3-313a-4439-b01f-58b817b1d2bd.json",
    "precipitation-december2023-data-20240124T122941Z-111eb4fa-5de7-4425-97ea-c674eca9eb20.json",
  ],
  temperature: [
    "temperature-jan2023-data-20240123T160524Z-c31776b4-7de4-4194-9351-48de1753b630.json",
    "temperature-feb2023-data-20240123T165149Z-7aa84a49-5c3e-4722-9aac-e6163322b6e6.json",
    "temperature-march2023-data-20240123T171107Z-46655f23-ef6d-4bd6-aa45-7a0c4b318405.json",
    "temperature-april2023-data-20240123T172825Z-b1f58c90-d469-434a-848b-a83ebfd13780.json",
    "temperature-may2023-data-20240124T073701Z-dfbbe5a8-ae4c-4880-ba83-97fe86eb5514.json",
    "temperature-june2023-data-20240124T081233Z-a6924664-ad22-4d17-9484-3d22c620a4b9.json",
    "temperature-july2023-data-20240124T083532Z-a6b37e7d-7bbb-4321-b79e-1dd2021393ba.json",
    "temperature-august2023-data-20240124T092532Z-796400e9-11ba-4ca8-a4db-30e519164895.json",
    "temperature-september2023-data-20240124T094448Z-cb6494e4-f486-453e-8dad-a8aa55d96dbf.json",
    "temperature-october2023-data-20240124T095912Z-8db842b0-e563-4789-adb5-3511c527cd7c.json",
    "temperature-november2023-data-20240124T111726Z-bdfdfdf9-0782-4883-914f-bfececf943fe.json",
    "temperature-december2023-data-20240124T113351Z-8d19d77d-98bb-4cff-81b0-c72da60b5165.json",
  ],
  windspeed: [
    "windspeed-jan2023-1of2-data-20240123T161724Z-98dc3d9c-6d8a-41cb-bff4-6a2ca0a47340.json",
    "windspeed-jan2023-2of2-data-20240123T162116Z-13734e13-acdd-49c8-ae4a-6e4f18ffe71f.json",
    "wind-speed-feb2023-data-20240123T165704Z-5104db68-2167-4cde-a5a1-c14b0ab2ffa1.json",
    "wind-speed-march2023-data-20240123T170900Z-cbc1f50e-f50a-488f-b6a3-29cc45fdee8c.json",
    "wind-speed-april2023-data-20240123T172241Z-ce43a56e-9462-411a-b967-81a7933642ef.json",
    "wind-speed-may2023-data-20240124T073128Z-ba76a0f2-10c6-4138-a118-61882b49ca8b.json",
    "wind-speed-june2023-data-20240124T080743Z-a4d05a19-9b80-490d-b784-535216ec37d1.json",
    "wins-speed-july2023-data-20240124T083016Z-daa30d03-66b0-4509-9f2b-0fb91c2fe9cb.json",
    "wind-speed-august2023-data-20240124T092012Z-3810fe36-eb49-4c0b-9c98-8d2893a566fa.json",
    "wind-speed-september2023-data-20240124T093935Z-6ce7c12b-94cd-4741-89cd-acdf241e715f.json",
    "wind-speed-october2023-data-20240124T095350Z-f62a5032-f907-4615-8882-c508f3a6e859.json",
    "wind-speed-november2023-data-20240124T111207Z-0f6c44dd-507e-4048-a48c-64c2139f066a.json",
    "wind-speed-december2023-data-20240124T112826Z-21f69bed-5279-4c30-8809-e900935038a2.json",
  ],
  humidity: [
    "humidity-jan2023-data-20240123T163101Z-3d6f5581-0092-4b7e-92d4-edc3d2ac141c.json",
    "humidity-feb2023-data-20240123T165841Z-70553379-3c90-4902-bcd6-2a5e83608488.json",
    "humidity-march2023-data-20240123T171548Z-530385c2-189d-4b1c-b30e-aae979f9ae6a.json",
    "humidity-april2023-data-20240123T172506Z-9d0c98c1-e03c-4361-80df-3f6297a2a529.json",
    "humidity-may2023-data-20240124T073329Z-0973e114-019b-4921-bd38-4751e454ad45.json",
    "humidity-june2023-data-20240124T080930Z-f30301da-d511-48f0-9138-5775bccd226b.json",
    "humidity-july2023-data-20240124T083215Z-ef1f706d-7263-4fdc-94c9-2fe33bc49f23.json",
    "humidity-august2023-data-20240124T092212Z-9ca929d0-a46b-42dc-abf6-98153775147c.json",
    "humidity-september2023-data-20240124T094137Z-c3b834b5-a555-44a8-9d77-07037dc6354d.json",
    "humidity-october2023-data-20240124T095551Z-8af184fc-9bf3-4a37-8e58-a78ef150b21e.json",
    "humidity-november2023-data-20240124T111406Z-755ccf16-4630-45bd-9a4a-f44daf602ac8.json",
    "humidity-december2023-data-20240124T113028Z-82065458-9aa9-4cbc-90c5-f39841dddee4.json",
  ],
};

const STATION = "Milano v.Brera";

let baseDir = process.argv[2];
let targetFile = process.argv[3];

function leftPad(str, len, ch) {
  str = `${str}`;
  while (str.length < len) {
    str = ch + str;
  }
  return str;
}

function aggregateSum(vals) {
  return vals.reduce((acc, val) => acc + val, 0);
}
function aggregateMax(vals) {
  return vals.reduce((acc, val) => Math.max(acc, val), -Infinity);
}

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

async function aggregateData(files, dataVar, aggregator) {
  let dataVals = new Map();
  for (let filename of files) {
    let data = await fs.promises.readFile(
      path.join(baseDir, filename),
      "utf-8"
    );
    let lastLineIdx = 0;
    while (data.indexOf("\n", lastLineIdx) !== -1) {
      let nextLineIdx = data.indexOf("\n", lastLineIdx);
      let line = data.substring(lastLineIdx, nextLineIdx);
      let obj = JSON.parse(line);
      if (obj.value !== null) {
        let vars = obj.data[0].vars;
        let dataVars = obj.data[1].vars;
        let station = vars["B01019"].v;
        if (station === STATION) {
          let year = vars["B04001"].v;
          let month = vars["B04002"].v;
          let day = vars["B04003"].v;
          let key = `${year}-${leftPad(month, 2, "0")}-${leftPad(day, 2, "0")}`;
          let precipitation = dataVars[dataVar].v;
          if (dataVals.has(key)) {
            dataVals.get(key).push(precipitation);
          } else {
            dataVals.set(key, [precipitation]);
          }
        }
      }
      lastLineIdx = nextLineIdx + 1;
    }
  }

  let results = [];
  dataVals.forEach((vals, key) => {
    let value = aggregator(vals);
    results.push({ time: key, value });
  });
  results = results.sort((a, b) => a.time.localeCompare(b.time));

  return results;
}

async function run() {
  let precipitationData = await aggregateData(
    FILES.precipitation,
    "B13011",
    aggregateSum
  );
  let temperatureData = await aggregateData(
    FILES.temperature,
    "B12101",
    (vals) => aggregateMax(vals.map(kelvinToCelsius))
  );
  let windspeedData = await aggregateData(
    FILES.windspeed,
    "B11002",
    aggregateMax
  );
  let humidityData = await aggregateData(
    FILES.humidity,
    "B13003",
    aggregateMax
  );
  let fullResults = {
    source: "https://meteohub.mistralportal.it/",
    license: "CCBY4.0",
    precipitation: precipitationData,
    temperature: temperatureData,
    windspeed: windspeedData,
    humidity: humidityData,
  };
  await fs.promises.writeFile(targetFile, JSON.stringify(fullResults, null, 2));
}

run();
