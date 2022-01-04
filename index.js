const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const nearestColor = require("nearest-color");
const colorsList = require("color-name-list");

const PATH = process.cwd();
const REF = `${PATH}/references`; // Reference images folder
const LAYERS = `${PATH}/layers`; // Output layers folder

// Variations per reference image
const VARIATIONS = 5;

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
  const nearest = nearestColor.from(colors);

  return nearest(hex);
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
        const color = "#000000".replace(/0/g, function () {
          return (~~(Math.random() * 16)).toString(16);
        });

        // Get color name
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
    });
  });
};

generate();
