#!/usr/bin/env node
import typings = require("commander");
import path = require("path");
import fs = require("fs");
import { generateLoadingFile } from "./generateLoadingFile";
import { keyInYN } from "readline-sync"
import { startComment } from "./consts";
const dotenv = require("dotenv")
const program = new typings.Command();

program
  .version("0.0.1")
  .description("Automatically generate a loading screen for a page file")
  .option('-e, --env <path>', 'Path to .env file', '.env')
  .option('-f, --force', 'Force overwrite, even if loading file has been modified', false)
  .argument('<file>', 'Path to page.(js|ts|jsx|tsx) file')
  .action((file, options) => {
    // Load environment variables
    dotenv.config({ path: options.env })

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is required in your .env file')
      process.exit(1)
    }

    // Validate file extension
    const validExtensions = ['.js', '.ts', '.jsx', '.tsx']
    const fileExt = path.extname(file)
    const fileName = path.basename(file, fileExt)

    if (!validExtensions.includes(fileExt) || fileName !== 'page') {
      console.error('Error: Input file must be named page.(js|ts|jsx|tsx)')
      process.exit(1)
    }

    // Get full path to input file
    const fullPath = path.resolve(process.cwd(), file)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found: ${fullPath}`)
      process.exit(1)
    }

    // Determine loading file location
    const dir = path.dirname(fullPath)
    const loadingPath = path.join(dir, 'loading.tsx')

    // Check if loading file already exists
    if (fs.existsSync(loadingPath)) {
      const existingLoadingFile = fs.readFileSync(loadingPath, 'utf8')
      
      if (existingLoadingFile.startsWith(startComment)) {
        console.log("Found an existing loading file that's been autogenerated. Overwriting with the latest.")
      } else {
        // File has been modified by user - require force flag or user confirmation
        if (!options.force && 
            !keyInYN(`File ${loadingPath} has been modified by user. Overwrite?`)) {
          console.log('Operation cancelled')
          process.exit(0)
        }
      }
    }

    generateLoadingFile(fullPath)
  })

program.parse(process.argv);