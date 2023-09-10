import fs from "fs";
import { log } from "./utils.js";
import Renamer from "./Renamer.js";

const renameFolders = (path: fs.PathLike): void => {
  const directory = fs.readdirSync(path);

  directory.forEach((file) => {
    const folder = `${path}/${file}`;

    fs.readdir(folder, async (error, files) => {
      if (error) {
        if (error.message.includes("not a directory")) {
          log.error(`Skipping ${file}`);
          return;
        }

        log.error(`Error reading files in folder ${file}}`);
        return;
      }

      const audioFile = files.find((file) => {
        return file.endsWith(".mp3") || file.endsWith(".flac");
      });

      if (!audioFile) {
        log.error(`No audio files found in ${folder}`);
        return;
      }

      const renamer = new Renamer();

      await renamer.renameFolders({
        path,
        folder,
        audioFile,
      });
    });
  });
};

export default renameFolders;
