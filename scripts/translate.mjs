import { translate } from "google-translate-api-x";
import fs from "fs/promises";
import path from "path";

const LOCALES_DIR = "./locales";
const SOURCE = "en.json";
const TARGETS = [
  { file: "fr.json", lang: "fr" },
  { file: "ar.json", lang: "ar" },
];

async function translateObject(obj, targetLang) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (
        !value.trim() ||
        value.length < 2 ||
        value.includes("@") ||
        value.includes("©") ||
        value.includes("2026")
      ) {
        console.log(`  ⏭️ Skipping "${value}" (preserving as-is)`);
        result[key] = value;
        continue;
      }

      try {
        const res = await translate(value, { to: targetLang });
        result[key] = res.text;
        console.log(
          `  ✅ "${value.substring(0, 40)}" → "${res.text.substring(0, 40)}"`,
        );
      } catch (err) {
        console.warn(`  ⚠️ Failed to translate "${value}", keeping original`);
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      console.log(`\n📁 Translating section: ${key}`);
      result[key] = await translateObject(value, targetLang);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function run() {
  const source = JSON.parse(
    await fs.readFile(path.join(LOCALES_DIR, SOURCE), "utf-8"),
  );

  for (const { file, lang } of TARGETS) {
    console.log(`\n🌍 Translating to ${lang}...`);
    const translated = await translateObject(source, lang);
    await fs.writeFile(
      path.join(LOCALES_DIR, file),
      JSON.stringify(translated, null, 2),
      "utf-8",
    );
    console.log(`\n✅ Done: ${file}`);
  }
}

run().catch(console.error);
