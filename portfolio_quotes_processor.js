import fs from "node:fs";

if (process.argv.length != 4) throw Error("Incorrect arguments.");

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

const inputStream = fs.createReadStream(inputFilePath, {
  encoding: "utf8",
  highWaterMark: 1024 * 1024,
});
const outputStream = fs.createWriteStream(outputFilePath);

const ONE_BYTE = 2 ** 8;
let currentQuote = "",
  quoteIndex = 0;
for await (const line of inputStream) {
  for (const char of line) {
    if (char == "\n") {
      const quoteLength = currentQuote.length;
      quoteIndex += quoteLength;

      let quoteIndexParts = [],
        quoteIndexCopy = quoteIndex;
      while (quoteIndexCopy > 0) {
        quoteIndexParts.unshift(quoteIndexCopy % ONE_BYTE);
        quoteIndexCopy = Math.floor(quoteIndexCopy / ONE_BYTE);
      }

      while (quoteIndexParts.length < 3) {
        quoteIndexParts.unshift(0);
      }

      if (quoteIndexParts.length > 3)
        throw Error(`Quote index ${quoteIndex} exceeded 2 ** 24.`);

      outputStream.write(new Uint8Array(quoteIndexParts));

      currentQuote = "";
    } else {
      currentQuote += char;
    }
  }
}
