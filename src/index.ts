#!/usr/bin/env node
import typings = require("commander");
import path = require("path");
import fs = require("fs");
import { generateLoadingFile } from "./generateLoadingFile";
const dotenv = require("dotenv")
const program = new typings.Command();

program
  .version("0.0.1")
  .description("Automatically generate a loading screen for every page.tsx")
  .option('-d, --dir <path>', 'Root directory to scan', 'app')
  .option('-e, --env <path>', 'Path to .env file', '.env')
  .action((options) => {
    dotenv.config({ path: options.env })
    console.log({options})
    const fullPath = path.join(process.cwd(), options.dir)
    // print all files in the directory
    const files = fs.readdirSync(fullPath)
    const pageName = path.join(process.cwd(), options.dir, "page.tsx")
    generateLoadingFile(pageName)
  })

program.parse(process.argv);