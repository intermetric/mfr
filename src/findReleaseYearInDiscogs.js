import chalk from "chalk";
import { log, mode } from "./utils.js";

const findReleaseYearInDiscogs = async ({ artist, title }) => {
  const token = process.env.DISCOGS_TOKEN;
  const baseURL = "https://api.discogs.com/database/search?";
  const queryParameters = new URLSearchParams({
    artist,
    release_title: title,
    token,
  });
  const response = await fetch(`${baseURL}${queryParameters}`);
  const json = await response.json();

  if (json.results && json.results.length) {
    log(
      chalk.blue(
        `Additional data acquired from Discogs for ${artist} - ${title}`
      )
    );

    const years = json.results
      .map((result) => result.year)
      .filter((year) => year);
    return mode(years);
  } else {
    log(chalk.red(`No Discogs results for ${artist} - ${title}`));
  }
};

export default findReleaseYearInDiscogs;
