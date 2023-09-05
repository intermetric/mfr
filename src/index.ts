import dotenv from "dotenv";
dotenv.config();

import { Command } from "commander";

import renameFolders from "./renameFolders.js";

const program = new Command();

program
  .name("Rename folders")
  .description("Renames folders based on the audio files inside them")
  .version("0.0.1")
  .command("rename")
  .argument("[location]", "Folder location")
  .action(async (location) => {
    await renameFolders(location.replaceAll("^", ""));
  });

program.parse();
