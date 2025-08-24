import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// ----------- Load static metadata -------------
const metadataPath = path.join(process.cwd(), "metadata", "_metadata.json");
const allMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

// ----------- Load XP/Level JSON db ------------
const xpDataPath = path.join(process.cwd(), "xpData.json");
let xpData = {};
if (fs.existsSync(xpDataPath)) {
  xpData = JSON.parse(fs.readFileSync(xpDataPath, "utf-8"));
}

// ----------- Routes ---------------------------

// root
app.get("/", (req, res) => {
  res.send("✅ Boboz Metadata API is running!");
});

// get metadata by tokenId
app.get("/metadata/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  let nft = allMetadata.find((m) => m.edition === id);
  if (!nft) {
    return res.status(404).json({ error: "Token not found" });
  }

  // make a copy (to avoid overwriting)
  const baseMeta = JSON.parse(JSON.stringify(nft));

  // attach dynamic XP/Level if exists
  if (xpData[id]) {
    baseMeta.attributes = [
      ...baseMeta.attributes.filter(
        (attr) => attr.trait_type !== "XP" && attr.trait_type !== "Level"
      ),
      { trait_type: "Level", value: xpData[id].level },
      { trait_type: "XP", value: xpData[id].xp },
    ];
  }

  res.json(baseMeta);
});

// simple endpoint to add XP (for testing)
app.get("/addxp/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!xpData[id]) xpData[id] = { xp: 0, level: 0 };

  xpData[id].xp += 10;
  if (xpData[id].xp >= 100) {
    xpData[id].level++;
    xpData[id].xp = 0;
  }

  fs.writeFileSync(xpDataPath, JSON.stringify(xpData, null, 2));
  res.json(xpData[id]);
});

// ----------------------------------------------

app.listen(PORT, () => {
  console.log(`✅ Metadata API running at http://localhost:${PORT}`);
});
