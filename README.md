# CounterStroke site (GitHub Pages)

Static explorer for **CounterStroke**. No GPU at view time. This folder is meant to be its **own GitHub repository** (separate from the GracoImage experiment code).

Work from the BDS group, Department of Computer Science and Information Systems, University of Limerick, with support from Lero and CRT-AI.

## Create the GitHub repo

1. On GitHub, create an empty public repo (for example `counterstroke-pages`). Do not add a README on GitHub if you will push this folder as the first commit.
2. This `site/` directory **is** the repository root: `package.json`, `public/`, `src/`, and `.github/workflows/pages.yml` sit at the top level.
3. From this folder:

```bash
git init
git add .
git commit -m "CounterStroke Pages site"
git branch -M main
git remote add origin git@github.com:<USER>/<REPO>.git
git push -u origin main
```

4. GitHub → **Settings → Pages → Source = GitHub Actions**.
5. GitHub Actions installs npm **on the runner** (you do not need Node on your laptop). The first green workflow publishes:

```text
https://<USER>.github.io/<REPO>/
```

`vite.config.ts` uses `base: './'` and HashRouter (`#/explore/...`), so project pages work without renaming the repo.

### User site instead

Name the repo `<USER>.github.io`. Same workflow. URL: `https://<USER>.github.io/`.

## Drop in the data bundle (from the code / GPU repo)

In the **GracoImage** repository, on the GPU node:

```bash
python analyse_final_population/harvest_static_bundle.py \
  --out ./_site_export \
  --zip ./counterstroke_pages_data.zip \
  --datasets mnist,cifar10,imagenet100 \
  --pop-gallery 12 \
  --max-renders 200 \
  --webp-quality 82 \
  --heat-png
```

Download the zip, then extract **into `public/data/`** of this site repo:

```text
public/data/index.json
public/data/metrics/
public/data/factual/
public/data/blank/
public/data/evolution/
```

Commit the extracted files (many small WebP/JSON). Do **not** commit the zip as one blob — GitHub rejects files over 100MB.

Laptop preview of metrics + synthetic thumbnails (from GracoImage, no GPU):

```bash
python analyse_final_population/harvest_static_bundle.py \
  --out path/to/site/public/data \
  --metrics-only \
  --write-fixture
```

If the image/metrics harvest already ran, export **only** the 30-run evolution JSON (does not rewrite factual/metrics):

```bash
python analyse_final_population/harvest_static_bundle.py \
  --out path/to/site/public/data \
  --evolution-only \
  --datasets mnist,cifar10,imagenet100
```

Point `--evolution-root` at `GracoImage/evolution_experiment` if traces live elsewhere. Add `--write-fixture` only when traces are missing and you want a preview cloud. If `--out` is not already `public/data`, copy the written `evolution/` folder into that bundle.

## Optional: preview on a machine that has Node

Not required for hosting. GitHub Actions runs `npm install` and `npm run build`.

```bash
npm install
npm run dev
```

## If something is blank

| Symptom | Fix |
| --- | --- |
| Empty page, no CSS | Keep `base: './'` in `vite.config.ts`. Hard-refresh. |
| Home loads, no images | `public/data/` was not unzipped or not committed. Need `data/index.json`. |
| 404 on refresh | Pages source must be **GitHub Actions**. Hash routes (`#/explore`) do not 404. |
| File too large to push | Commit extracted files, not the zip. |
| Workflow cannot find `package.json` | The site folder must be the **repository root**, not nested under GracoImage. |

## Optional custom domain

Add `public/CNAME` containing `results.example.org`, then set the same host under **Settings → Pages → Custom domain**, and enable HTTPS.

## Design

See [`DESIGN.md`](DESIGN.md) for the editorial-research visual system (tokens, frames, logo lockup).
