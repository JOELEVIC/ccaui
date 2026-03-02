/**
 * Optional: fetch landing images from Unsplash into public/images/.
 * Run from repo root: node scripts/fetch-landing-images.js
 * Requires network. Creates public/images if missing.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "images");

const IMAGES = [
  {
    filename: "hero.jpg",
    url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1920&q=80",
  },
  {
    filename: "cameroon-chess.jpg",
    url: "https://images.unsplash.com/photo-1611195974228-a849e70f17e9?w=1200&q=80",
  },
  {
    filename: "gallery-1.jpg",
    url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=75",
  },
  {
    filename: "gallery-2.jpg",
    url: "https://images.unsplash.com/photo-1611195974228-a849e70f17e9?w=800&q=75",
  },
  {
    filename: "gallery-3.jpg",
    url: "https://images.unsplash.com/photo-1551817958-d9d9fb6e2d6e?w=800&q=75",
  },
  {
    filename: "gallery-4.jpg",
    url: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=75",
  },
];

function fetchToFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchToFile(res.headers.location, filepath).then(resolve).catch(reject);
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  for (const { filename, url } of IMAGES) {
    const filepath = path.join(OUT_DIR, filename);
    try {
      await fetchToFile(url, filepath);
      console.log("OK", filename);
    } catch (e) {
      console.error("Failed", filename, e.message);
    }
  }
}

main();
