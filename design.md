# Tictic Tokn: Design Specification

Source of truth: `Tictic_Tokn_UI.html` (latest design, canvas 1120 × 840). Values below were read from that file. Items marked **Open** are not designed yet or need a decision.

## 1. Design principles

1. **Glanceable.** One big number, one meter, one status line. Nothing else by default.
2. **Honest.** Every number says exact or est.; every state says whether the count is live.
3. **Quiet.** A dark floating card that stays out of the way; never steals focus.
4. **Not colour alone.** State is shown by icon, label and fill pattern as well as colour.

## 2. Colour tokens

### Floating card (dark)

| Token | Value | Use | Contrast on card |
| --- | --- | --- | --- |
| `--card-bg` | `#16171A` | Card and pill background | n/a |
| `--text` | `#F3F1EC` | Number, emphasised values | 15.9:1 |
| `--text-muted` | `#B9B6AE` | Labels, units, footer, status text | 8.8:1 |
| `--state-ok` | `#7BD88F` | Healthy meter, Tracking dot | 10.3:1 |
| `--state-warn` | `#F2B84B` | Near limit, Paused icon | 10.0:1 |
| `--state-danger` | `#F26B5B` | Over limit | 6.0:1 |
| `--state-idle` | `#8C897F` | Not tracking ring, dimmed meter fill | 5.1:1 |
| `--chip-bg` | `rgba(255,255,255,.09)` | Model chip | n/a |
| `--divider` | `rgba(255,255,255,.10)` | Lines above status line and compare rows | n/a |
| `--card-edge` | `rgba(255,255,255,.08)` | 1 px inner outline | n/a |
| `--meter-track` | `rgba(255,255,255,.16)` | Unfilled meter ticks | decorative |

### Presentation surface (design file only)

| Token | Value | Use |
| --- | --- | --- |
| `--surface` | `#E8E3D8` | Page behind the cards |
| `--surface-text` | `#2B2820` | Body text (11.5:1) |
| `--surface-label` | `#5A5547` | Uppercase section labels (5.8:1) |

## 3. Typography

| Role | Font | Size / weight | Notes |
| --- | --- | --- | --- |
| Token count | Space Grotesk | 46 px / 600, line-height 1 | Tabular numerals, letter-spacing -0.02em |
| Pill count | Space Grotesk | 18 px / 600 | Tabular numerals |
| Compare row value | Space Grotesk | 18 px / 600 | Tabular numerals |
| UI text (labels, footer, status) | Inter | 12 px / 400, emphasis 500 | |
| Compare row name | Inter | 13 px / 400 | |
| Section label | Inter | 12 px / 500, uppercase, letter-spacing .08em | Presentation only |

Both families are open source (SIL Open Font License). Bundle the fonts with the extension and keep the licence notice with them. Always set `font-variant-numeric: tabular-nums` on numbers so the card does not jitter while counting.

## 4. Shape, spacing and elevation

| Item | Value |
| --- | --- |
| Card width | 320 px |
| Card padding | 16 px (vertical), 18 px (horizontal) |
| Card radius | 22 px |
| Card shadow | `0 18px 40px rgba(20,18,12,.28)` plus `inset 0 0 0 1px rgba(255,255,255,.08)` |
| Pill height / radius | 44 px / fully round |
| Pill padding | 0 18 px 0 14 px; dot 10 px |
| Pill shadow | `0 10px 24px rgba(20,18,12,.25)` |
| Chip padding / radius | 3 px 9 px / fully round |
| Gaps | number top margin 10 px; meter top margin 12 px; footer top margin 10 px; status line top margin 12 px with 10 px top padding |

## 5. Components

### 5.1 Floating card

Top to bottom: header, number, unit line, meter, footer, status line.

- **Header:** model chip on the left (for example "GPT-4o · exact", "Claude Sonnet · est."); pause or resume button on the right.
- **Pause button:** 44 × 44 px hit area (visually small, negative margin keeps the header tight); label "Pause capture" or "Resume capture" for assistive tech.
- **Number:** current token count, thousands separators.
- **Unit line:** "tokens in your prompt" by default; the near-limit state replaces it with a trim hint; non-live states replace it with "last count · not live".
- **Meter:** segmented bar, 18 px tall; segments are 2 px wide on a 5 px pitch. Filled segments use the state colour, unfilled ones use `--meter-track`.
- **Footer:** left "$0.062 input" (or "est." for estimated models), right "19% of 128k". Values in `--text`, labels in `--text-muted`.
- **Status line:** icon plus "State · source".

### 5.2 Collapsed pill

Dot in the state colour plus the token count. Three examples in the design: green 24,860, amber 94,700, red 118,200. **Open:** the control that collapses the card into this pill is not drawn yet.

### 5.3 Compare row

Used for "Compare models · same prompt". Three columns, each with model name and exact/est. tag, a count in Space Grotesk, and an 8 px meter showing share of that model's own context window. Rows are separated by `--divider`.

### 5.4 Status line

| State | Icon | Label example | Counting? |
| --- | --- | --- | --- |
| Tracking | 8 px filled dot, `--state-ok` | Tracking · Claude.ai prompt box | Live |
| Paused | Pause glyph, `--state-warn` | Paused · capture is off | No |
| Not tracking | 8 px hollow ring, `--state-idle` | Not tracking · focus is outside allowed sites | No |
| Ignoring | 12 px padlock outline | Ignoring · password or payment field | No |

State word in `--text` at weight 500, the rest in `--text-muted`.

## 6. States

| State | Number | Meter | Unit line | Footer |
| --- | --- | --- | --- | --- |
| Default, healthy | `--text` | `--state-ok` | "tokens in your prompt" | Full strength |
| Nearing the limit | `--state-warn` | `--state-warn` | Trim hint (see note) | Full strength |
| Over the limit | `--state-danger` | `--state-danger` | Over-limit hint | Full strength |
| Paused, Not tracking, Ignoring | 40% opacity | 40% opacity, fill `--state-idle` | "last count · not live" (full strength) | See accessibility note |

**Thresholds (defaults, adjustable):** green below 70% of the context window, amber from 70%, red from 90%.

**Trim hint copy:** the design currently reads "trim ~12k to stay under 80%" next to a 74% reading, which is contradictory. Write hints from the real target, for example "trim ~12k to get under 65%".

## 7. Content rules

- Every model chip says **exact** or **est.**
- Costs read "$0.062 input" for exact counts and "$0.284 est." for estimates, and the cost tooltip says "API-equivalent estimate, excludes hidden thinking and system prompt".
- Status wording stays in the four-state vocabulary above; do not invent new state names.
- Use sentence case, no exclamation marks, no emoji.

## 8. Accessibility

- All text on the card meets 4.5:1 at full strength (lowest: danger colour at 6.0:1).
- **Fix needed:** dimming the footer to 40% drops muted text to about 2.5:1 and emphasised text to about 3.5:1. Dim only the number and the meter; keep the footer at full strength.
- **Fix needed:** the pause and play icons are text glyphs (❚❚, ▶), and the amber one in the status line is 9 px. Replace them with inline SVG icons of consistent size.
- The pause button meets the 44 px target. Make all other interactive parts at least 32 px, and 44 px on touch devices if the widget ever appears there.
- State is never colour alone: dot, pause icon, ring and padlock differ in shape, and the meter changes fill as well as colour.
- Use real `<button>` elements with accessible names; announce state changes in the status line politely (`aria-live="polite"`), not on every keystroke.
- Respect reduced motion: the count change animation should be a fade or none.

## 9. Motion

Subtle number change (short fade or tick); meter fill eases between values. No bounce, no attention-seeking animation. Disable under reduced-motion settings.

## 10. Reference CSS tokens

```css
:root {
  --card-bg: #16171A;
  --text: #F3F1EC;
  --text-muted: #B9B6AE;
  --state-ok: #7BD88F;
  --state-warn: #F2B84B;
  --state-danger: #F26B5B;
  --state-idle: #8C897F;
  --chip-bg: rgba(255,255,255,.09);
  --divider: rgba(255,255,255,.10);
  --card-edge: rgba(255,255,255,.08);
  --meter-track: rgba(255,255,255,.16);

  --radius-card: 22px;
  --radius-pill: 999px;
  --card-width: 320px;

  --font-ui: Inter, sans-serif;
  --font-num: 'Space Grotesk', sans-serif;
}
```

## 11. Open design items

- Collapse control and the card-to-pill transition.
- Model picker (dropdown on the model chip) and the "Model not detected" state.
- Settings: allow-list, price table, hotkeys, optional API keys.
- Empty and first-run states (0 tokens, nothing captured yet).
- Full-card red state (only the red pill exists today).
- Clipboard or hotkey source label for Phase 2 (for example "Clipboard · 2s ago").
- Thinking-token display ("thinking: at least ~N tokens, est.", with a timer).
- Light theme, click-through indicator and tray icon.
- Very large numbers (for example 1,000,000-token windows) and narrow widths.
