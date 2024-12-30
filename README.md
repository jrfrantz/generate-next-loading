# generate-next-loading
Automatically generate a good-enough `loading.ts` file for your server components.

Loading screens appear instantly to make your site feel faster, give the users the confidence to stick around, and buy developers time to fetch whatever data.

`generate-next-loading` is a CLI tool that automatically generates a `loading.tsx` to go along with each server component's `page.tsx` **that uses intelligence to match the general layout of the page**.

`generate-next-loading` lets you stay focused on building your actual product.
- Automatically stays up-to-date when you make changes to your pages
- Mimics the layout of your pages, including nested components.
- Compatible with whatever version control
- Components live in your repo

## How to use
```bash
npx generate-next-loading@latest path/to/page.tsx
# ... generated path/to/loading.tsx
```
or add it to your project:
```bash
npm i --save-dev generate-next-loading
```
In package.json:
```json
{
  "scripts": {
    ...
    "loading": "generate-next-loading"
  },
}
```
That's it! You need an env variable for `OPENAI_API_KEY`. By defualt, looks in `.env` in your project.

We can all look at a website or app, and generally have an idea of what the loading screen should look like for it: a shimmer that grays out the main content but shows movement so it's clear that something is happening. We automate this 

To learn more about next.js's `loading` convention, see [nextjs documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
