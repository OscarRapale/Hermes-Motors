# Prototype source

The canvas boards as source. They need the canvas runtime (`support.js`) to run, so they won't open in a browser on their own; read them for values.

- **Template** (inside `<x-dc>`): plain HTML with inline styles. `{{name}}` is a value from `renderVals()`; `<sc-for list="{{items}}" as="item">` repeats its content.
- **Logic** (`<script type="text/x-dc">`): `class Component` with `state`, lifecycle methods and `renderVals()`, which computes every value the template shows. Formulas (dial sweeps, chapter tweens, the lap model, the countdown) live there.
- **Props** (`data-props` on the script tag): the board's switches (`firstLight`, `chapter`, `won`, `page`…), with their defaults.
- Images point at `vendor/assets/…` (rewritten from the canvas's `/_blob/` ids; `vendor/assets/blob-map.json` lists them).

Two boards each cover a pair: `Landing-v2-BeforeDawn` is also board 10 (`firstLight: true`), and `Landing-Phone-BeforeDawn` is also board 23.

Don't port the structure (string-built styles, `setState` per animation frame); port the values and the behaviour, in the architecture's components.
