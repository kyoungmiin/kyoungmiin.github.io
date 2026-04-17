# Personal Page Template

This is a static personal website template (no build tool required) designed for research/portfolio style pages.

## Features

- Single-page layout with sections: About, Experience, Projects, Publications, Talks, Contact
- Data-driven content via `assets/data/content.json`
- Responsive layout for desktop and mobile
- Sticky section navigation with active section highlight
- Simple reveal animations with reduced-motion support
- GitHub Pages deployment via GitHub Actions

## Project Structure

- `index.html`: semantic structure and section anchors
- `assets/css/styles.css`: full visual system and responsive styles
- `assets/js/main.js`: content loader and UI behaviors
- `assets/data/content.json`: all editable profile content
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow

## Edit Your Content

1. Open `assets/data/content.json`.
2. Replace placeholder values in:
   - `profile`
   - `about`
   - `experience`
   - `projects`
   - `publications`
   - `talks`
   - `contact`
3. Replace `profile.image` URL with your own photo URL.

## Run Locally

Because the page fetches JSON data, use a local server (not `file://`).

```bash
cd /Users/kyoungmin/Desktop/Personal\ Page
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In repository settings, open **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` branch.
5. The workflow in `.github/workflows/pages.yml` publishes the site automatically.

## Notes

- Keep links in JSON valid (`https://...`).
- If you want to add a section, add the HTML container and a matching renderer in `assets/js/main.js`.
