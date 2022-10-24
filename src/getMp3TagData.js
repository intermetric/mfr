import fs from "fs";
import MP3Tag from "mp3tag.js";

const getMp3TagData = (path) => {
  try {
    const buffer = fs.readFileSync(path);
    const mp3tag = new MP3Tag(buffer);
    mp3tag.read();

    const metadata = mp3tag.tags;
    const { v1, v2 } = metadata;

    if (v2.TPE1 && v2.TALB) {
      return {
        artist: v2.TPE1,
        title: v2.TALB,
        year: v2.TYER ?? "",
      };
    } else if (v1.artist && v1.album) {
      return {
        artist: v1.artist,
        title: v1.album,
        year: v1.year ?? "",
      };
    }

    return false;
  } catch {
    return false;
  }
};

export default getMp3TagData;
