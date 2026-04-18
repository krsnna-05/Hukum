import { promises as fs } from "fs";
import path from "path";
import { Router } from "express";

const router = Router();
const CARDS_DIR = path.resolve(__dirname, "../../assets/cards");
const SVG_FILE_NAME_PATTERN = /^[A-Za-z0-9_]+\.svg$/;

router.get("/", async (_req, res) => {
  try {
    const entries = await fs.readdir(CARDS_DIR, { withFileTypes: true });
    const cards = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    res.status(200).json({ cards });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list cards.";
    res.status(500).json({ error: message });
  }
});

router.get("/:cardFile", async (req, res) => {
  const cardFile = path.basename(req.params.cardFile);

  if (!SVG_FILE_NAME_PATTERN.test(cardFile)) {
    res.status(400).json({ error: "Invalid card file requested." });
    return;
  }

  const filePath = path.join(CARDS_DIR, cardFile);

  try {
    await fs.access(filePath);
    res.type("image/svg+xml");
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ error: "Card SVG not found." });
  }
});

export default router;
