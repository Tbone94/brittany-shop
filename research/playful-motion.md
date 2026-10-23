# Playful motion for a bead shop: UX + performance

Two beats (bead-on-daisy, bead-in-necklace). Verdict: keep both, make each one-shot, trigger on view, and never tie them to scroll position.

## 1. UX rules

- **Purpose and tone.** NN/g: microinteractions should serve a purpose, be brief, and fit brand tone. Apple HIG: "Add motion purposefully... Don't add motion for the sake of adding motion." A handmade-bead brand is a legitimate use ("brand benefits from a distinct touch"). Commerce-UI frames the test as "does it help the customer decide, or is it just for its own sake?"
- **Trigger on view, once.** Start when the moment is about 50% visible (IntersectionObserver), then play once. NN/g animation article: repeated animation turns into an obstacle ("the third is downright annoying"). Also, anything that starts automatically is "auto-start" under WCAG 2.2.2, including on scroll-into-view. Motion under 5 seconds is exempt, so keep each moment short.
- **Replay on tap.** Make the daisy and the necklace tappable or focusable (real `<button>` with an aria-label like "Drop a bead again"). Replay is user-initiated, so it can't annoy. Apple: don't make people wait; let them cancel. Ignore taps mid-animation or restart cleanly.
- **Duration and easing.**
  - Material scale: short 50-200 ms, medium 250-400, long 450-600, extra-long 700-1000.
  - NN/g: feedback to a user action must start within 0.1 s.
  - A bead drop needs gravity feel, so total sequence of about 0.8-1.4 s is fine. Individual beats (squish, bounce) of 150-400 ms.
  - Easing: accelerate on the fall (ease-in), decelerate on the bounce-out (ease-out). Material pairs decelerate with entering, accelerate with exiting. Avoid linear.
  - Squish with a small overshoot, not a long wobble.
- **How many.** Two on a long page is the ceiling. Don't add a third without removing one. Space them a full screen or more apart so only one is ever in view.
- **Stay out of the way.** Keep moments in dead space, away from CTAs, prices, forms and text. Never move content the reader is reading (NN/g). Reserve the illustration's box up front so there's no layout shift. The rolling bead must stay inside its container (`overflow: hidden` or clipped) and must never cover a button. Not clickable-looking unless it is.
- **Motion is a bonus, not information.** Apple: don't use motion as the only way to convey something. The page must read fine with the final frame only.
- **Mobile.** No hover dependence. Tap = replay. Auto-playing and moving content distresses mobile users (Baymard on carousels), so keep it short and non-looping. Tap targets at least 24x24 CSS px (WCAG 2.5.8), preferably 44+. Test on a mid-range Android.
- **prefers-reduced-motion.** Show the end state (bead already in the necklace, flower upright) or a short fade. Check it in JS as well as CSS, because WAAPI and JS motion do not respond automatically. Keep tap-replay as a gentle fade at most.
- **Test, don't assume.** No source offered conversion data for these. Compare with and without in an A/B test or at least watch scroll depth and add-to-cart.

## 2. Performance rules

**Do**
- Fire once from `IntersectionObserver` with `threshold: 0.5`, then `unobserve()`. MDN: observers avoid main-thread `getBoundingClientRect()` loops.
- Animate only `transform` and `opacity` (translate, rotate, scale). web.dev: they skip layout and paint. Rolling = translateX + rotate.
- Use CSS `@keyframes`/transitions or `element.animate()` (WAAPI). Both can run on the compositor, staying smooth under main-thread load (web.dev, Mozilla Hacks). Use WAAPI to chain beats via `animation.finished` and for cancel/replay.
- Promote with `will-change: transform` only on the few moving parts and only during play (add before, remove after). Layers cost memory (web.dev).
- Use inline SVG shapes or small images for the beads and daisy.
- Check DevTools Performance and Lighthouse "non-composited animations".

**Don't**
- Don't drive position from scroll events. It was your jitter. If you ever need scroll-linked motion, use CSS `animation-timeline: view()` and expect uneven browser support.
- Don't read layout (`getBoundingClientRect`, `offsetHeight`) after writing styles or inside scroll handlers. web.dev: forced reflow. Batch reads first, writes in `requestAnimationFrame`.
- Don't use rAF to move things unless you need physics. Main-thread jank hits it directly.
- Don't animate `top/left/width/height/box-shadow/filter`. web.dev's demo: about 50% dropped frames versus about 1% with transform.
- Don't leave infinite CSS animations running offscreen. Pause or remove them after play.
- Don't put `mix-blend-mode` or `backdrop-filter` on or over the animated area, or full-width layers that sit over scrolling content. MDN confirms blend modes create stacking contexts and backdrop-filter has backdrop-root quirks; the "expensive" part (blending/blur read the pixels behind) is my engineering judgement plus a 2013 W3C thread, not benchmarked here. Profile before keeping them.
- Don't redraw a large `<canvas>` per scroll frame. Prefer SVG/DOM with transforms. (General practice, no source opened.)
- Don't run long JS on the main thread near the trigger. Tasks over 50 ms hurt INP (web.dev).

## 3. Examples (as described by the cited articles; I did not open the live sites)

- **Threadless**: cart character reacts on add-to-cart. Playful, short, tied to a user action.
- **Mailchimp**: monkey-paw high-five easter egg. Hidden, opt-in delight that never blocks the task.
- **Johnny Cupcakes**: playful loading page, memorable, not in the way.
- **Zielinski & Rozen**: hand-drawn cursor and menu hovers reinforce an artisanal identity.
- **Mondo / Rollie / Axel Arigato**: motion reveals info (price, quick add, colors) on hover, so it earns its place.
- **Pa'lante Packs**: deliberately minimal. A reminder that restraint is a valid brand choice.

## Sources (opened)

- https://www.nngroup.com/articles/microinteractions/
- https://www.nngroup.com/articles/animation-usability/
- https://www.nngroup.com/articles/response-times-3-important-limits/
- https://baymard.com/blog/homepage-carousel
- https://developer.apple.com/design/human-interface-guidelines/motion.md
- https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- https://web.dev/articles/animations-guide
- https://web.dev/articles/animations-and-performance
- https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
- https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
- https://web.dev/articles/debounce-your-input-handlers
- https://web.dev/articles/optimize-long-tasks
- https://web.dev/articles/prefers-reduced-motion
- https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations
- https://hacks.mozilla.org/2016/08/animating-like-you-just-dont-care-with-element-animate/
- https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
- https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
- https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://commerce-ui.com/insights/motion-in-ecommerce-part-1-microinteractions
- https://clickz.com/18-delightful-examples-of-micro-ux/106919/
- https://swankyagency.com/web-design-for-ecommerce-using-micro-interactions-successfully/
- (Search-result only, not opened: W3C 2013 www-style thread on backdrop filter cost.)
