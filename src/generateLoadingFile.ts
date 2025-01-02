import { parse } from "@babel/parser";
import traverse from "@babel/traverse"
import OpenAI from "openai";
import fs = require("fs");
import path from "path";
import { startComment } from "./consts";
import { glob } from "glob";


export async function generateLoadingFile(fullPath: string) {
  const relativePath = path.relative(process.cwd(), fullPath)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  // read file to string
  const fileContent = fs.readFileSync(fullPath, 'utf8');

  // go up the file tree, up to the root of the project, and find layout.tsx files
  const layoutFiles = []
  let currentPath = path.dirname(fullPath)
  while (currentPath !== process.cwd()) {
    const layoutFile = path.join(currentPath, "layout.tsx")
    if (fs.existsSync(layoutFile)) {
      layoutFiles.push(layoutFile)
      break; // only take the first one
    }
    currentPath = path.dirname(currentPath)
  }
  const layoutFileContents = layoutFiles.map(layoutFile => fs.readFileSync(layoutFile, 'utf8'))

  const cssFiles = []
  const pattern = '**/app/**/*.*css'
  const foundCssFiles = glob.sync(pattern, { 
    cwd: process.cwd(),
    dot: true,
    nodir: true,
    ignore: [
      '**/.next/**',
      '**/node_modules/**',
    ]
  })
  cssFiles.push(...foundCssFiles)
  const cssFileContents = cssFiles.map(cssFile => fs.readFileSync(cssFile, 'utf8'))
  // console.log({ cssFileContents })
  const tailwindPattern = 'tailwind.config.{js,ts}'
  const tailwindFile = glob.sync(tailwindPattern, { 
    cwd: process.cwd(),
    dot: true,
    nodir: true,
    ignore: [
      '**/.next/**',
      '**/node_modules/**',
    ]
  })
  const tailwindFileContents = tailwindFile[0] ? fs.readFileSync(tailwindFile[0], 'utf8') : ""
  // console.log({ tailwindFileContents })
  // parse file into an AST so you can check for local imports
  const ast = parse(fileContent, {
    sourceType: "module",
    plugins: ["typescript", "jsx" ],
  });
  const localImports: string[] = [];
  // check if the default export is an async function
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration.type === "FunctionDeclaration") {
        const isAsync = declaration.async;
      }
    },
    ImportDeclaration(path) {
      const source = path.node.source.value;
      //console.log({ source })
      // check if the import is a local import
      // of a react component
      localImports.push(source);
    },
  });


  // ask the AI to generate a loading screen based on 
  // the file content
  console.log(`${relativePath}: Creating loading screen`)
  const response = await openai.chat.completions.create({
    model: 'chatgpt-4o-latest',
    messages: [
      { 
        role: "system", 
        content: "You are a helpful coding assistent that generates fully functional, totally static, self-contained, server-rendered React + Typescript components for use in a Next.js project with the app router. As input, you are passed a `page.tsx` file, which is async and fetches some dynamic content before rendering it. In response, you give the react component for a corresponding `loading.tsx` file that matches the look-and-feel of the dynamic `page.tsx` file. Since these are loading components, they're totally static and server rendered -- making no use of useEffect, data fetching, or <style jsx>...</style> or anything like that. Just a nice loading skeleton shimmer. For the shimmer animation, define the keyframes in a template literal and render a <style>...</style> tag. Do all styling with inline CSS, relying mostly on the inline `style` prop, and generally including a light shimmer with keyframes, so that your output file is self-contained. Pay special attention to preserving the layout of the page, putting shimmering skeletons in place of text, images, cards, and the like, being mindful not to leave unstyled traces behind with tags like <li>. There is no need to include specific text or content that will appear on the eventual page.tsx file. The goal is to reduce visual layout shift or jitter when the eventual contents load -- centering content is generally a safe bet, though you should let the project files dictate the output. Output the contents of `loading.tsx` with no other exposition, since your response will be written directly to `loading.tsx` verbatim. Include comments in the code for rough readability for the developer to get oriented at-a-glance. What follows is `page.tsx` and its corresponding `layout.tsx` file, css files if present, and tailwind config if present, defined in the project:" 
      },
      { 
        role: "user", 
        content: `
        <page.tsx>
        ${fileContent}
        </page.tsx>

        <layout.tsx>
        ${layoutFileContents.join("\n\n")}
        </layout.tsx>

        <css>
        ${cssFileContents.join("\n\n")}
        </css>

        <tailwind.config.ts>
        ${tailwindFileContents}
        </tailwind.config.ts>
        `},
    ],
  })


  const fileOutputAi = response.choices[0]?.message.content ?? ""
  const fileOutput = fileOutputAi.replace(/```tsx/g, "").replace(/```/g, "")

  // TODO ensure it is valid react code and retry or bail otherwise

  const prefix = startComment+
`// This file will stay up-to-date when you make changes to your \`page.tsx\` file
// and run \`generate-next-loading\` again.
// You can edit this file. To prevent future overwrites, delete the comment line.
`

  // write it to the corresponding loading.tsx in the same directory as page.tsx
  // use the same file suffix as the page.(tsx | jsx | ts | js)
  const loadingFileLocation = path.join(path.dirname(fullPath), "loading"+path.extname(fullPath))
  const relativeLoadingLocation = path.relative(process.cwd(), loadingFileLocation)
  
  fs.writeFileSync(loadingFileLocation, prefix + fileOutput)
  console.log(`${relativePath}: Wrote loading screen to ${relativeLoadingLocation}`)
}