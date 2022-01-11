const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const nearestColor = require("nearest-color");
const colorsList = require("color-name-list");
const tinycolor = require("tinycolor2");
const removeAccents = require("remove-accents");

const PATH = process.cwd();
const REF = `${PATH}/references`; // Reference images folder
const LAYERS = `${PATH}/layers`; // Output layers folder

// Variations per reference image
const VARIATIONS = 1000;

// Change to match your PNG dimensions
const SIZE = {
  width: 150,
  height: 150,
};

const canvas = createCanvas(SIZE.width, SIZE.height);
const context = canvas.getContext("2d");

// Get human-readable color name
const getReadableProps = (hex) => {
  const colors = colorsList.reduce(
    (o, { name, hex }) => Object.assign(o, { [name]: hex }),
    {}
  );
  const nearest = nearestColor.from(colors);

  return removeAccents(nearest(hex)?.name);
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

const paintPixels = (color) => {
  const rgb = tinycolor(color).toRgb();
  const image = context.getImageData(0, 0, SIZE.width, SIZE.height);
  const pixels = image?.data;

  for (let pixel = 0; pixel < pixels.length; pixel += 4) {
    // If pixel is not transparent, paint it with a given color
    if (pixels[pixel + 3] > 0) {
      pixels[pixel] = rgb.r;
      pixels[pixel + 1] = rgb.g;
      pixels[pixel + 2] = rgb.b;
      pixels[pixel + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
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

  // Get if reference image is "Face", which have a different behavior

  // Iterate references
  references.forEach((reference) => {
    // Get folder name and file extension based on reference file name
    const parts = reference.split(".");

    const folder = parts[0];
    const ext = parts[1];

    const isFace = folder === "Face";

    loadImage(`${REF}\\${reference}`).then((image) => {
      // Remove antialising
      context.imageSmoothingEnabled = false;

      // Draw image to canvas
      context.drawImage(image, 0, 0, SIZE.width, SIZE.height);

      // Set composition mode to source-in
      context.globalCompositeOperation = "source-in";

      const MAX = isFace ? skinColors.length - 1 : VARIATIONS;

      // Iterate variations
      for (let i = 0; i < MAX; i++) {
        // Generate random color
        const color = isFace ? skinColors?.[i] : randomPastelColor();

        const name = getReadableProps(color);

        console.log(`Generating layer "${folder}" with "${name}"`);

        // Paint image with random color
        paintPixels(color);

        // Generate new image file
        const buffer = canvas.toBuffer(`image/${ext}`);

        const LAYER_PATH = `${LAYERS}\\${folder}`;

        if (!fs.existsSync(LAYER_PATH)) {
          fs.mkdirSync(LAYER_PATH);
        }

        fs.writeFileSync(`${LAYER_PATH}\\${name}.${ext}`, buffer);
      }
    });
  });
};

generate();
