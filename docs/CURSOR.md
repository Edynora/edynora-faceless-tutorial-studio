# Cursor overlay guide

The cursor is an SVG pointer in a fixed browser DOM overlay. It is recorded as page content and does not move the actual Windows pointer. Native menus, operating-system mouse events and browser chrome are outside the viewport. It cannot demonstrate desktop dragging or system dialogs.

Settings under `cursor`: `enabled`, `size` (12–80px), `speed` (50–5000 CSS px/s), `trail`, `clickAnimation`, and `reducedMotion`. Reduced motion disables interpolated movement, trails and click animation. Disabling the visual cursor leaves metadata available. Effects use `pointer-events:none` and `aria-hidden` so they do not receive clicks or appear in the accessibility tree.

The pointer starts at viewport coordinate (24,24). Target centers are measured after scrolling them into view. Coordinates use the viewport top-left as (0,0), x right, y down, in CSS pixels at device scale 1. Cursor movements are clamped inside the viewport. Highlight rectangles use the measured element box and can extend outside the viewport for partially visible large elements. Overlay movement and highlight events are logged with recording-relative milliseconds and action IDs.

Clicks wait for Playwright actionability before movement. The visual click ring is triggered by an actual trusted `pointerdown` event, rather than a planned click. Click metadata is appended only after a successful locator click; its host timestamp can lag dispatch during navigation, so it is approximate. The ring lasts 500ms. Navigation installs a fresh overlay; fullscreen/top-layer DOM, canvas content or hostile page scripts can interfere. This is not a tamper-proof screen annotation layer.

Use explicit labels to add a high-contrast bottom-left step card. Use a final pause to give viewers time to understand the result. The default synthetic demo provides a reference screenshot and video. Keyboard-only action scripting is not implemented; overlay elements themselves do not enter keyboard focus order.
