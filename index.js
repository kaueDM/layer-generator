const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const nearestColor = require("nearest-color");
const colorsList = require("color-name-list");
const tinycolor = require("tinycolor2");

const PATH = process.cwd();
const REF = `${PATH}/references`; // Reference images folder
const LAYERS = `${PATH}/layers`; // Output layers folder

// Variations per reference image
const VARIATIONS = 100;

// Change to match your PNG dimensions
const SIZE = {
  width: 32,
  height: 32,
};

const canvas = createCanvas(SIZE.width, SIZE.height);
const context = canvas.getContext("2d");

// Get human-readable color name
const getReadableProps = (hex) => {
  const colors = colorsList.reduce(
    (o, { name, hex }) => Object.assign(o, { [name]: hex }),
    {}
  );
  const nearest = nearestColor
    ?.from(colors)
    ?.normalize("NFD")
    ?.replace(/\p{Diacritic}/gu, "");

  return nearest(hex);
};

// Colors generated from https://www.researchgate.net/publication/310443424_Improvement_of_Haar_Feature_Based_Face_Detection_in_OpenCV_Incorporating_Human_Skin_Color_Characteristic
// and improved by Github Copilot

const skinColors = [
  "#2d221e",
  "#3c2e28",
  "#4b3932",
  "#5a453c",
  "#695046",
  "#785c50",
  "#87675a",
  "#967264",
  "#a57e6e",
  "#b48a78",
  "#c39582",
  "#d2a18c",
  "#e1ad96",
  "#f0b99f",
  "#ffc5a9",
  "#ffd2b3",
  "#ffdfbd",
  "#ffe6c7",
  "#fff0d1",
  "#fff7db",
  "#ffffe5",
];

const randomPastelColor = () => {
  const hsla = `hsla(${~~(360 * Math.random())}, 70%, 80%, 1)`;

  return tinycolor(hsla).toHexString();
};

const generate = () => {
  // Remove old ~layers~ folder
  if (fs.existsSync(LAYERS)) {
    fs.rmSync(LAYERS, { recursive: true });
  }

  // Create new ~layers~ folder
  fs.mkdirSync(LAYERS);

  // Get reference images
  const references = fs.readdirSync(REF);

  // Iterate references
  references.forEach((reference) => {
    // Get folder name and file extension based on reference file name
    const parts = reference.split(".");

    const folder = parts[0];
    const ext = parts[1];

    loadImage(`${REF}\\${reference}`).then((image) => {
      // Draw image to canvas
      context.drawImage(image, 0, 0, SIZE.width, SIZE.height);

      // Set composite operation to source-in
      context.globalCompositeOperation = "source-in";

      // Iterate variations
      for (let i = 0; i < VARIATIONS; i++) {
        // Generate random color
        const color = folder === "Face" ? skinColors?.[i] : randomPastelColor();

        if (folder === "Face" && i <= skinColors.length - 1) {
          const { name } = getReadableProps(color);

          // Paint image with random color
          context.fillStyle = color;
          context.fillRect(0, 0, SIZE.width, SIZE.height);

          console.log(`Generating layer "${folder}" with "${name}"`);

          const buffer = canvas.toBuffer(`image/${ext}`);

          const LAYER_PATH = `${LAYERS}\\${folder}`;

          if (!fs.existsSync(LAYER_PATH)) {
            fs.mkdirSync(LAYER_PATH);
          }

          fs.writeFileSync(`${LAYER_PATH}\\${name}.${ext}`, buffer);
        }

        if (folder !== "Face") {
          const { name } = getReadableProps(color);

          // Paint image with random color
          context.fillStyle = color;
          context.fillRect(0, 0, SIZE.width, SIZE.height);

          console.log(`Generating layer "${folder}" with "${name}"`);

          const buffer = canvas.toBuffer(`image/${ext}`);

          const LAYER_PATH = `${LAYERS}\\${folder}`;

          if (!fs.existsSync(LAYER_PATH)) {
            fs.mkdirSync(LAYER_PATH);
          }

          fs.writeFileSync(`${LAYER_PATH}\\${name}.${ext}`, buffer);
        }
      }
    });
  });
};

generate();
