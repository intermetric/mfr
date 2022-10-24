import fs from "fs";
import Path from "path";
import chalk from "chalk";
import { log } from "./utils.js";

const renameFolder = ({ path, original, audioFile, release }) => {
  const fileFormat = Path.extname(audioFile).endsWith(".mp3") ? "" : "[FLAC]";
  const folderName = `${release.artist} - ${release.title} ${
    release.year && `(${release.year.substring(0, 4)})`
  } ${fileFormat}`;

  const fileNameRegex = /[/\\?%*:|"<>]/g;
  const parsedName = folderName
    .replace(fileNameRegex, "")
    .replace(/ +(?= )/g, "")
    .trim();

  fs.rename(original, `${path}/${parsedName}`, (error) => {
    const previousName = original.substring(original.lastIndexOf("/") + 1);
    if (error) {
      log(
        chalk.red(`Something went wrong renaming folder ${previousName}`, error)
      );
    } else {
      log(
        chalk.green(`Successfully renamed '${previousName}' to '${folderName}'`)
      );
    }
  });
};

export default renameFolder;
