import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else if (mimetype.startsWith("text/")) {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}
