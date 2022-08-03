const { readFileSync, writeFileSync, readdirSync, rmSync } = require("fs");
const sharp = require("sharp");

const template = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24">
<!-- bg -->
<!-- head -->
<!-- hair -->
<!-- eyes -->
<!-- nose -->
<!-- mouth -->
<!-- beard -->
</svg> 
`;

const takenNames = {};
const takenFaces = {};

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
  const adjectives = "";
  const names = "";

  const randAdj = randElement(adjectives);
  const randName = randElement(names);
  const name = `${randAdj}-${randName}`;

  if (takenNames[name] || !name) {
    return getRandomName();
  } else {
    takenNames[name] = name;
    return name;
  }
}

function getLayer(name, skip = 0.0) {
  const svg = readFileSync(`./layers/${name}.svg`, "utf-8");
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
}

async function svgToPng(name) {
  const src = `./out/${name}.svg`;
  const dest = `./out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}

function createImage() {
  const bg = randomInt(5);
  const hair = randomInt(7);
  const eyes = randomInt(9);
  const nose = randomInt(4);
  const mouth = randomInt(5);
  const beard = randomInt(3);
  // 18,900 combinations

  const face = [hair, eyes, nose, mouth, beard].join(" ");

  if (face[takenFaces]) {
    createImage();
  } else {
    const name = getRandomName();
    console.log(name);
    face[takenFaces] = name;

    const final = template
      .replace("<!-- bg -->", getLayer(`bg${bg}`))
      .replace("<!-- head -->", getLayer(`head0`))
      .replace("<!-- hair -->", getLayer(`hair${hair}`))
      .replace("<!-- eyes -->", getLayer(`eyes${eyes}`))
      .replace("<!-- nose -->", getLayer(`nose${nose}`))
      .replace("<!-- mouth -->", getLayer(`mouth${mouth}`))
      .replace("<!-- beard -->", getLayer(`beard${beard}`, 0.5));

    const meta = {
      name,
      description: `A drawing of ${name.split("-").join(" ")}`,
      image: "ipfs://YOUR_ASSET_CID",
      attributes: [
        {
          beard: "",
          rarity: 0.5,
        },
      ],
    };
    writeFileSync(`./out/${name}.json`, JSON.stringify(meta));
    writeFileSync(`./out/${name}.svg`, final);
    svgToPng(name);
  }
}

var idx = 1;

do {
  createImage(idx);
  idx--;
} while (idx > 0);
