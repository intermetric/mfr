import fs from "fs";
import { parseFile } from "music-metadata";
import chalk from "chalk";
import { log } from "./utils.js";
import getMp3TagData from "./getMp3TagData.js";
import findReleaseYearInDiscogs from "./findReleaseYearInDiscogs.js";
import renameFolder from "./renameFolder.js";

const renameFolders = async (path) => {
  const directory = fs.readdirSync(path);

  directory.forEach((file) => {
    const folder = `${path}/${file}`;

    fs.readdir(folder, async (error, files) => {
      if (error) {
        if (error.message.includes("not a directory")) {
          return log(chalk.yellow(`Skipping ${file}`));
        }
        log(chalk.red(`Error reading files in folder ${file}`));
      } else {
        const audioFile = files.find(
          (file) => file.endsWith(".mp3") || file.endsWith(".flac")
        );

        if (audioFile) {
          let release;

          const filePath = `${folder}/${audioFile}`;

          const mp3TagMetadata = getMp3TagData(filePath);
          const musicMetadata = await parseFile(filePath);

          if (mp3TagMetadata) {
            release = mp3TagMetadata;
          } else {
            release = {
              artist: musicMetadata.common.artist,
              title: musicMetadata.common.album,
              year: musicMetadata.common.year?.toString(),
            };
          }

          if (!release.artist) {
            return log(chalk.red("No artist found for", file));
          } else if (!release.title) {
            return log(chalk.red("No title found for", file));
          } else if (!release.year) {
            const year = await findReleaseYearInDiscogs({
              artist: release.artist,
              title: release.title,
            });
            release = { ...release, year };
          }

          renameFolder({
            path,
            original: folder,
            audioFile,
            release,
          });
        } else {
          log(chalk.red("No audio files found in", file));
        }
      }
    });
  });
};

export default renameFolders;
