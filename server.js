import express from "express";
import fs from "fs";
import path from "path";

const app = express();

// مسیر فایل متادیتا
const metadataPath = path.join(process.cwd(), "metadata", "_metadata.json");
const allMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

// مسیر فایل XP/Level
const xpDataPath = path.join(process.cwd(), "xpData.json");
let xpData = {};
if (fs.existsSync(xpDataPath)) {
  xpData = JSON.parse(fs.readFileSync(xpDataPath, "utf-8"));
}

// روت برای گرفتن یک NFT با id
app.get("/metadata/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  // پیدا کردن NFT براساس edition
  let nft = allMetadata.find((m) => m.id === id);

  if (!nft) {
    return res.status(404).json({ error: "Token not found" });
  }

  // اضافه کردن XP و Level اگر موجود باشه
  if (xpData[id]) {
    nft = {
      ...nft,
      attributes: [
        ...nft.attributes.filter(
          (attr) => attr.trait_type !== "XP" && attr.trait_type !== "Level"
        ),
        { trait_type: "Level", value: xpData[id].level },
        { trait_type: "XP", value: xpData[id].xp },
      ],
    };
  }

  // حتماً JSON استاندارد برگردان
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(nft);
});

// اگر بخوای همه متادیتاها رو هم داشته باشی
app.get("/metadata/all", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(allMetadata);
});

// استاتیک (مثلاً برای public)
app.use("/static", express.static(path.join(process.cwd(), "public")));

export default app;