# matheusfeijoo.github.io

Personal research website of Matheus Puime Pedra, served by GitHub Pages at <https://matheusfeijoo.github.io/>.
GitHub Pages builds it with Jekyll on every push to `main`. There is nothing to install: you can edit the files directly on github.com.

## Updating the content

| To change… | Edit |
|---|---|
| Papers (`/publications.html`; the 3 newest show on the homepage) | `_data/publications.yml` |
| Research topics timeline (`/research/`; the first 3 are the focus areas on the homepage) | `_data/research.yml` |
| Projects (`/projects/`; the first 3 show on the homepage) | `_data/projects.yml` |
| Experience list next to the globe (`/experience/`) | `_data/experience.yml` |
| Articles & talks (on `/news/`) | `_data/writing.yml` |
| Email, profile links, site description | `_config.yml` |
| Photo | `images/avatar.jpg` |

### Add a paper
Copy one block in `_data/publications.yml`, paste it at the top, and edit it:

```yaml
- year: 2026
  theme: resilience        # resilience | fair | applied
  type: journal            # journal | chapter | conference | poster
  featured: true           # also show it on the homepage
  title: "Paper title"
  authors: "**Matheus Puime Pedra**, Co-author & Co-author"
  venue: Journal name
  link: "https://doi.org/..."
  summary: One line shown under the title on the homepage (optional; the venue is shown if left out)
```

Keep the list newest first. Put quotes around any text that contains a colon (`:`).

### Add a project
Copy one block in `_data/projects.yml`, paste it at the top, and edit it. Projects can be GitHub repositories, dashboards, datasets or anything else:

```yaml
- name: Project name
  year: "2026"             # or a range: 2022 → 2024
  kind: Data pipeline      # short label shown on the card
  text: >-
    One or two sentences on what it does.
  tags: [Python, open data]
  links:                   # optional, any number
    - label: code
      url: https://github.com/MatheusFeijoo/...
```

### Post news
Create a file in `_posts/` named `YYYY-MM-DD-short-title.md`:

```markdown
---
title: "Headline of the post"
tag: New paper
icon: flood          # a file from images/icons/, without .svg
link: https://doi.org/...
link_label: read the paper
---
The text of the post.
```

Available icons: flood, news-data, fire, satellite, dna, health-data. To add one, put a 48×48 SVG in `images/icons/`.
The 3 newest posts appear on the homepage. Every post also gets its own page and is listed at `/news/`.

### Add a place to the globe
Add the place to `PLACES` in `assets/js/globe.js` (name, latitude, longitude), then use its key as `place:` in `_data/experience.yml`.

## Files

- `_layouts/` page templates (shared header, footer and search-engine tags)
- `index.html` the homepage: same-colour boxes (intro, Publications, Projects, News, Research). Each box lists the 3 newest entries of its page, read from the same data files, so it updates by itself.
- `research.html`, `publications.html`, `projects.html`, `news.html`, `experience.html`, `contact.html` the inner pages
- `assets/css/`, `assets/js/` styles and scripts (no libraries)
- `assets/js/land-dots.js` land points for the globe, from Natural Earth (world-atlas 110m)
