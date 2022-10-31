import fs from "fs";
import MP3Tag from "mp3tag.js";

const getMp3TagData = (path) => {
  try {
    const buffer = fs.readFileSync(path);
    
    const mp3tag = new MP3Tag(buffer);
    mp3tag.read();

    const { v1, v2 } = mp3tag.tags;

    return {
      artist: v2.TPE1 || v1.artist,
      title: v2.TALB || v1.album,
      year: v2.TYER || v1.year,
    };
  } catch {
    return false;
  }
};

export default getMp3TagData;
