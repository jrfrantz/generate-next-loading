import { parse } from "@babel/parser";
import traverse from "@babel/traverse"
import OpenAI from "openai";
import fs = require("fs");
import path from "path";
import { startComment } from "./consts";


export async function generateLoadingFile(fullPath: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  // read file to string
  const fileContent = fs.readFileSync(fullPath, 'utf8');

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
        if (isAsync) {
          console.log("default export is async function %s", declaration.id?.name);
        }
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
  console.log(`Creating loading screen for ${fullPath}`)
  const response = await openai.chat.completions.create({
    model: 'chatgpt-4o-latest',
    messages: [
      { 
        role: "system", 
        content: "You are a helpful coding assistent that generates fully functional, totally static, self-contained, server-rendered React + Typescript components for use in a Next.js project with the app router. As input, you are passed a `page.tsx` file, which is async and fetches some dynamic content before rendering it. In response, you give the react component for a corresponding `loading.tsx` file that matches the look-and-feel of the dynamic `page.tsx` file. Since these are loading components, they're totally static and server rendered -- making no use of useEffect, data fetching, or <style jsx>...</style> or anything like that. Just a nice loading skeleton shimmer. For the shimmer animation, define the keyframes in a template literal and render a <style>...</style> tag. Do all styling with inline CSS, relying mostly on the inline `style` prop, and generally including a light shimmer with keyframes, so that your output file is self-contained. Output the contents of `loading.tsx` with no other exposition, since your response will be written directly to `loading.tsx` verbatim. Include comments in the code for rough readability for the developer to get oriented at-a-glance. What follows is `page.tsx`:" 
      },
      { 
        role: "user", 
        content: `${fileContent}`},
    ],
  })
  console.log(`Generated loading screen for ${fullPath}`)


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
  
  fs.writeFileSync(loadingFileLocation, prefix + fileOutput)
  console.log(`Wrote loading screen to ${loadingFileLocation}`)
}