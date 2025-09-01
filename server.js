import express from "express";
import fs from "fs";
import path from "path";

// express app
const app = express();

// مسیر فایل‌ها
const metadataPath = path.join(process.cwd(), "metadata", "_metadata.json");
const allMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

const xpDataPath = path.join(process.cwd(), "xpData.json");
let xpData = {};
if (fs.existsSync(xpDataPath)) {
  xpData = JSON.parse(fs.readFileSync(xpDataPath, "utf-8"));
}

// روت متادیتا
app.get("/metadata/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  let nft = allMetadata.find((m) => m.edition === id + 1); // 👈 تغییر اینجا

  if (!nft) {
    return res.status(404).json({ error: "Token not found" });
  }

  // آپدیت داینامیک XP/Level
  if (xpData[id]) {
    nft = {
      ...nft,
      attributes: [
        ...nft.attributes.filter(
          (attr) => attr.trait_type !== "XP" && attr.trait_type !== "Level"
        ),
        { trait_type: "Level", value: xpData[id].level },
        { trait_type: "XP", value: xpData[id].xp }
      ]
    };
  }

  res.json(nft);
});

// استاتیک (مثلا بخوای بعداً چیزی بذاری)
app.use("/static", express.static(path.join(process.cwd(), "public")));

// 🚀 خروجی برای Vercel
export default app;
