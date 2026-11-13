// The keyboard drawn on the controls sheet: a tenkeyless US layout (function row, main block, arrows), in
// key units. Keys are KeyboardEvent.code values, the same the game reads (lib/drive/keys.ts).

export type Keycap = { code: string; x: number; y: number; w: number }

/** Width and height of the drawing, in key units */
export const KEYBOARD_W = 18.5
export const KEYBOARD_H = 6.5

function row(y: number, x0: number, keys: [code: string, w: number][]): Keycap[] {
  let x = x0
  return keys.map(([code, w]) => {
    const k = { code, x, y, w }
    x += w
    return k
  })
}

const ones = (codes: string[]): [string, number][] => codes.map((c) => [c, 1])
const letters = (s: string) => [...s].map((c) => `Key${c}`)
const fn = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `F${from + i}`)

export const KEYBOARD: readonly Keycap[] = [
  ...row(0, 0, [['Escape', 1]]),
  ...row(0, 2, ones(fn(1, 4))),
  ...row(0, 6.5, ones(fn(5, 8))),
  ...row(0, 11, ones(fn(9, 12))),
  ...row(1.5, 0, [
    ...ones(['Backquote', ...Array.from({ length: 10 }, (_, i) => `Digit${(i + 1) % 10}`), 'Minus', 'Equal']),
    ['Backspace', 2],
  ]),
  ...row(2.5, 0, [['Tab', 1.5], ...ones([...letters('QWERTYUIOP'), 'BracketLeft', 'BracketRight']), ['Backslash', 1.5]]),
  ...row(3.5, 0, [['CapsLock', 1.75], ...ones([...letters('ASDFGHJKL'), 'Semicolon', 'Quote']), ['Enter', 2.25]]),
  ...row(4.5, 0, [['ShiftLeft', 2.25], ...ones([...letters('ZXCVBNM'), 'Comma', 'Period', 'Slash']), ['ShiftRight', 2.75]]),
  ...row(5.5, 0, [
    ['ControlLeft', 1.25],
    ['MetaLeft', 1.25],
    ['AltLeft', 1.25],
    ['Space', 6.25],
    ['AltRight', 1.25],
    ['MetaRight', 1.25],
    ['ContextMenu', 1.25],
    ['ControlRight', 1.25],
  ]),
  ...row(4.5, 16.5, [['ArrowUp', 1]]),
  ...row(5.5, 15.5, ones(['ArrowLeft', 'ArrowDown', 'ArrowRight'])),
]
