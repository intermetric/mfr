import Path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import MP3Tag from "mp3tag.js";
import { findReleaseInDiscogs } from "./providers/Discogs.js";
import { log } from "./utils.js";

type FolderData = {
  path: fs.PathLike;
  folder: string;
  audioFile: string;
};

type RenameData = {
  previousName: string;
  newName: string;
};

export type Release = {
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

  private fileFormat: string = "";

  public async renameFolders({
    path,
    folder,
    audioFile,
  }: FolderData): Promise<void> {
    const filePath = `${folder}/${audioFile}`;

    this.getMp3TagMetadata(filePath);

    await this.validateMetadata(filePath);

    if (this.release.artist && this.release.title && this.release.year) {
      if (Path.extname(audioFile).endsWith(".flac")) {
        this.fileFormat = "[FLAC]";
      }

      const newName = this.formatFolderName();

      this.rename({
        previousName: folder,
        newName: `${path}/${newName}`,
      });
    }
  }

  private async validateMetadata(filePath: string): Promise<void> {
    const { artist, title, year } = this.release;

    if (!this.release || !artist || !title) {
      await this.getMusicMetadata(filePath);
    }

    if (!artist) {
      log.error(`No artist found for ${filePath}`);
      return;
    }

    if (!title) {
      log.error(`No title found for ${filePath}`);
      return;
    }

    if (artist && title && !year) {
      const discogsRelease = await findReleaseInDiscogs({
        artist,
        title,
      });

      if (discogsRelease?.year) {
        this.release.year = discogsRelease.year;
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
    } catch {
      log.error("Something went wrong getting Mp3Tag metadata @", filePath);
    }
  }

  private async getMusicMetadata(filePath: string): Promise<void> {
    try {
      const musicMetadata = await parseFile(filePath);

      this.release.artist = musicMetadata.common.artist;
      this.release.title = musicMetadata.common.album;
      this.release.year = musicMetadata.common.year?.toString();
    } catch {
      log.error("Something went wrong getting Music Metadata data @", filePath);
    }
  }

  private formatFolderName(): string {
    const year = this.release.year ? this.release.year.substring(0, 4) : "";

    const formattedName = `${this.release.artist} - ${this.release.title} (${year}) ${this.fileFormat}`;
    const newName = formattedName
      .replace(/[/\\?%*:|"<>]/g, "")
      .replace(/ +(?= )/g, "")
      .trim();

    return newName;
  }

  private rename({ previousName, newName }: RenameData): void {
    fs.rename(previousName, newName, (error: unknown) => {
      if (error) {
        log.error(`Something went wrong renaming to '${newName}'`);
        return;
      }

      log.success(`Successfully renamed to '${newName}'`);
    });
  }
}
