# Catherine G. Bencito — Portfolio

Personal portfolio of a full-stack developer. Hand-coded static site: no framework, no build step.

## Features
- **Live PDTS demo:** a working slice of the PUP OUS Document Tracking System (sample data) in the hero
- **Case studies** in accessible `<dialog>` modals, with architecture diagrams
- **Live GitHub feed** from the GitHub REST API, with a graceful fallback
- **Light/dark theme** that follows the system setting and remembers your choice
- **Print as résumé:** a print stylesheet turns the page into a clean CV
- Accessible: semantic HTML, skip link, keyboard focus, `prefers-reduced-motion`, ARIA live regions
- SEO: meta and Open Graph tags, JSON-LD `Person` schema

## Structure
```
index.html            page content
assets/css/styles.css design tokens, layout, components, print styles
assets/js/main.js     theme, tracking demo, dialogs, GitHub feed
```

## Run locally
Open `index.html` in a browser, or run `npx serve .`

Live: https://iamgravz.github.io/myPortfolio/

## Deploy on GitHub Pages
1. Create a public repo named `iamgravz.github.io`.
2. Upload `index.html`, `README.md` and the `assets` folder to the root, then commit.
3. Settings → Pages → Deploy from a branch → `main` / `(root)`.
4. Live at `https://iamgravz.github.io`.

## Deploy on Vercel
1. Push the folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset **Other**, no build command → Deploy.
