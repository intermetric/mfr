import dotenv from "dotenv";
dotenv.config();

import renameFolders from "./renameFolders.js";

const path = process.env.FILEPATH;
renameFolders(path);
