# TerraD2I website

A lightweight, responsive research-group website built for GitHub Pages with plain HTML, CSS, and JavaScript.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). A local server is required because browsers do not allow `fetch()` to read data files directly from a `file://` URL.

## Edit content

Most content lives in `data/`:

- `slider.yml` — homepage carousel
- `news.yml` — scrolling homepage news
- `people.yml` — PI and group profiles
- `projects.yml` — project cards and filters
- `resources.yml` — teaching and resource cards
- `publications.bib` — searchable publications

The `.yml` files use JSON syntax, which is valid YAML. Keep the existing punctuation and use any JSON validator before committing large edits.

Images live under `assets/`. Use web-friendly JPG, PNG, or WebP files, then refer to them with paths such as `assets/projects/example.jpg`.

## Publish with GitHub Pages

1. Create a GitHub repository and push this folder to its default branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the default branch and `/ (root)`, then save.
5. GitHub will show the public `github.io` URL after deployment finishes.

No build command or dependencies are required. The `.nojekyll` file tells GitHub Pages to publish the files exactly as they are.

## Structure

```text
assets/                 Images and logo
css/styles.css          Shared visual system and responsive layout
data/                   Editable content
js/main.js              Data loading, carousel, news, filters, and search
index.html              Home
people.html             People
projects.html           Projects
publications.html       Publications
teaching-resources.html Teaching & Resources
```

## Accessibility

The site includes semantic landmarks, keyboard-operable navigation and carousel controls, visible focus states, alt text, reduced-motion support, and responsive layouts. Add meaningful `alt` values whenever you add an image.
