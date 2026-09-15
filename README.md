# Martha's Teachable Heart

A responsive web presentation rebuilt from the original teaching PDF. It includes presentation and reading modes, speaker notes, fullscreen support, keyboard navigation, touch gestures, progress persistence, and print styles.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Import this repository into Vercel. The framework preset should detect Vite automatically. Use `npm run build` as the build command and `dist` as the output directory.

## Controls

- Right arrow, Space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home / End: first or last slide
- F: fullscreen
- N: speaker notes
- Swipe left or right on touch devices

Speaker notes are included in the static site and should not contain confidential information.
