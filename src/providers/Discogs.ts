import axios from "axios";
import { DISCOGS_TOKEN } from "../config.js";
import { log, mode } from "../utils.js";
import { Release } from "../Renamer.js";

export async function findReleaseInDiscogs({
  artist,
  title,
}: {
  artist: string;
  title: string;
}): Promise<Release | void> {
  const { data } = await axios("https://api.discogs.com/database/search", {
    params: {
      artist,
      release_title: title,
      token: DISCOGS_TOKEN,
    },
  });

  if (!data?.results?.length) {
    log.error(`No Discogs results for ${artist} - ${title}`);
    return;
  }

  log.info(`Additional data acquired from Discogs for ${artist} - ${title}`);

  const years = data.results
    .map((result: any) => result.year)
    .filter((year: any) => year);

  return { artist, title, year: mode(years) };
}
