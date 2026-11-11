// Where the live 3D canvas sits so it lines up with the pre-rendered frames (03-specs: "the two must
// match"). The frames were cut from a render of `render` css px at `dpr`, by `box` (device px), then
// scaled to fill the car box; the canvas reproduces that render, scaled and offset the same way.

export type Crop = { box: readonly number[]; dpr: number; render: readonly number[] }

/** The canvas as % of the car box (left/top/width/height); the crop rectangle then fills the box. */
export function canvasPlacement(crop: Crop): { left: number; top: number; width: number; height: number } {
  const [x0, y0, x1, y1] = crop.box
  const [renderW, renderH] = crop.render
  const cropW = (x1 - x0) / crop.dpr
  const cropH = (y1 - y0) / crop.dpr
  return {
    left: (-100 * (x0 / crop.dpr)) / cropW,
    top: (-100 * (y0 / crop.dpr)) / cropH,
    width: (100 * renderW) / cropW,
    height: (100 * renderH) / cropH,
  }
}

/** Live when the device can: WebGL2, and the visitor hasn't asked to save data (ARCHITECTURE §6). */
export function canRunLiveCar(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return false
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}
