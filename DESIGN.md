# CounterStroke — editorial research dashboard

Visual system for the static GitHub Pages app. Implemented as Tailwind tokens in `src/index.css`. This document is the Figma-equivalent spec.

## Kind of design

Editorial scientific explainer + results workbench. Not a SaaS landing page, not Streamlit, not dark cyberpunk.

## Frames

| Frame | Size | Contents |
| --- | --- | --- |
| 00 Cover | — | Brand notes |
| 01 Foundations | — | Colour, type, 8px grid, logo clear-space |
| 02 Components | — | Nav, footer lockup, chips, stat tiles, filmstrip, slider, charts |
| 03 Desktop | 1440 | Home, Method, Metrics, Explore, Sample, Blank, Paper |
| 04 Sample workspace | 1440 | Left factual / centre filmstrip+overlay / right population |
| 05 Mobile | 390 | Stacked pages; sample as a sheet |
| 06 Motion | — | 280ms ease-out, 40ms stagger, reduced-motion |

## Tokens

- Canvas paper `#F7F6F2`
- White wells `#FFFFFF`
- Ink `#1C1C1A`
- Muted `#5C5A56`
- BDS teal `#0E6B5C` (interactive)
- UL Green `#005335` (primary)
- UL Modern Green `#00B140` (success)
- UL Heritage `#003726` (footer ink)
- Hairline `1px` at ink 10%
- Radius `12px`
- Type: Inter (UI), Cormorant Garamond (Home H1 only), ui-monospace (phenotypes)

## Logo lockup

Header: CounterStroke wordmark left, BDS mark right.
Footer (white): BDS · UL · Lero · CRT-AI, equal optical height ~36px.

## Motion

200–400ms ease-out. Overlay crossfade. Count-up stats. `prefers-reduced-motion: reduce` disables all of the above.
