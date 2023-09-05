import Path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import MP3Tag from "mp3tag.js";
import { findReleaseInDiscogs } from "./providers/Discogs.js";
import { log } from "./utils.js";

type Release = {
  artist: string | undefined;
  title: string | undefined;
  year: string | undefined;
};

export default class Renamer {
  private release: Release = {
    artist: "",
    title: "",
    year: "",
  };

  public async renameFolders({
    path,
    filePath,
    folder,
    audioFile,
  }: {
    path: fs.PathLike;
    filePath: string;
    folder: string;
    audioFile: string;
  }) {
    this.getMp3TagMetadata(filePath);

    await this.validateMetadata(filePath);

    const { newName } = this.formatFolderName({
      folder,
      audioFile,
    });

    this.rename({
      prevName: folder,
      newName: `${path}/${newName}`,
    });
  }

  private async validateMetadata(filePath: string) {
    if (!this.release || !this.release.artist || !this.release.title) {
      await this.getMusicMetadata(filePath);
    }

    if (!this.release.artist) {
      return log.error(`No artist found for ${filePath}`);
    }
    if (!this.release.title) {
      return log.error(`No title found for ${filePath}`);
    }

    if (this.release.artist && this.release.title && !this.release.year) {
      const release = await findReleaseInDiscogs({
        artist: this.release.artist,
        title: this.release.title,
      });

      if (release && release.year) {
        this.release.year = release.year;
      }
    }
  }

  private getMp3TagMetadata(filePath: string): void {
    try {
      const buffer = fs.readFileSync(filePath);

      const mp3tag = new MP3Tag(buffer);

      mp3tag.read();

      if (Object.keys(mp3tag.tags).length) {
        const { v1, v2 } = mp3tag.tags;

        this.release.artist = v2.TPE1 ?? v1.artist;
        this.release.title = v2.TALB ?? v1.album;
        this.release.year = v2.TYER ?? v1.year;
      }
    } catch (error: any) {
      log.error(`Something went wrong getting Mp3Tag metadata: ${error}`);
    }
  }

  private async getMusicMetadata(filePath: string): Promise<void> {
    try {
      const musicMetadata = await parseFile(filePath);

      this.release.artist = musicMetadata.common.artist;
      this.release.title = musicMetadata.common.album;
      this.release.year = musicMetadata.common.year?.toString();
    } catch {
      log.error("Something went wrong getting Music Metadata data");
    }
  }

  private formatFolderName({
    folder,
    audioFile,
  }: {
    folder: string;
    audioFile: string;
  }) {
    let fileFormat = "";

    if (Path.extname(audioFile).endsWith(".flac")) {
      fileFormat = "[FLAC]";
    }

    const year = this.release.year ? this.release.year.substring(0, 4) : "";
    const formattedName = `${this.release.artist} - ${this.release.title} (${year}) ${fileFormat}`;

    const previousName = folder.substring(folder.lastIndexOf("/") + 1);

    const newName = formattedName
      .replace(/[/\\?%*:|"<>]/g, "")
      .replace(/ +(?= )/g, "")
      .trim();

    return {
      previousName,
      newName,
    };
  }

  private rename({
    prevName,
    newName,
  }: {
    prevName: string;
    newName: string;
  }): void {
    fs.rename(prevName, newName, (error: unknown) => {
      if (error) {
        log.error(`Something went wrong renaming to '${newName}'`);
        return;
      }
      log.success(`Successfully renamed to '${newName}'`);
    });
  }
}
