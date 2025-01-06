# intelligent-loading-shimmer
Generate nice loading shimmers for ANY (every!) page in your nextjs app using AI with one command.

![example generated loading shimmer for instagram UI](https://github.com/jrfrantz/intelligent-loading-shimmer/blob/main/post-shimmer.gif?raw=true)

Loading screens appear instantly to make your site feel faster, give the users the confidence to stick around, and buy developers time to fetch whatever data.

`intelligent-loading-shimmer` automatically generates a `loading.tsx` to go along with each server component's `page.tsx` **that uses AI to match the general layout of the page**.

`intelligent-loading-shimmer` makes your site feel faster to users while letting you stay focused on building your actual product:
- Automatically stays up-to-date when you make changes to your pages
- Mimics the layout of your pages, including locally imported components
- Components live in your repo, can be customized freely, and work with your version control
- Works with or without tailwind

## How to use
```bash
npx intelligent-loading-shimmer
# ✅ generated loading pages for 3 files
```
or add it to your project:
```bash
npm i --save-dev intelligent-loading-shimmer
```
In package.json:
```js
//package.json
{
  "scripts": {
    // add it to your prebuild to automatically keep up with changes
    "prebuild": "intelligent-loading-shimmer",
    // or just make a custom command for it that matches your preferences
    "generate-loading": "intelligent-loading-shimmer",
  },
}
```
That's it! You need an env variable for `OPENAI_API_KEY`. By defualt, looks in `.env` in your project.

Command-line options:
- `-e, --env <path>`: Path to an env file with an `OPENAI_API_KEY=your_key` defined
- `-f, --force`: Force an overwrite of existing loading files

To learn more about next.js's `loading` convention, see [nextjs documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

Thanks to shadcn/ui for the Skeleton component that forms the visual basis of these shimmers
