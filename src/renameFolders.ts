import fs from "fs";
import { log } from "./utils.js";
import Renamer from "./Renamer.js";

const renameFolders = async (path: fs.PathLike) => {
  const directory = fs.readdirSync(path);

  directory.forEach((file) => {
    const folder = `${path}/${file}`;

    fs.readdir(folder, async (error, files) => {
      if (error) {
        if (error.message.includes("not a directory")) {
          log.error(`Skipping ${file}`);
          return;
        }
        log.error(`Error reading files in folder ${file}`);
      }

      const audioFile = files.find((file) => {
        return file.endsWith(".mp3") || file.endsWith(".flac");
      });

      if (audioFile) {
        const filePath = `${folder}/${audioFile}`;

        const renamer = new Renamer();

        await renamer.renameFolders({
          path,
          filePath,
          folder,
          audioFile,
        });
      } else {
        log.error(`No audio files found in ${folder}`);
      }
    });
  });
};

export default renameFolders;
