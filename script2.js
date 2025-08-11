// Import GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
import { Draggable } from "https://cdn.skypack.dev/gsap/Draggable";
import gsap from "gsap";

const ctrl = new Tweakpane.Pane({
  title: 'Config',
  expanded: false,
});

// ONLY select the vertical list items inside .content
let items = gsap.utils.toArray('.content ul li');
let scrollerScrub, dimmerScrub, chromaEntry, chromaExit;

function update() {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.syncScrollbar = config.scroll;
  document.documentElement.dataset.animate = config.animate;
  document.documentElement.dataset.snap = config.snap;
  document.documentElement.dataset.debug = config.debug;
  document.documentElement.style.setProperty('--start', config.start);
  document.documentElement.style.setProperty('--hue', config.start);
  document.documentElement.style.setProperty('--end', config.end);

  if (!config.animate) {
    chromaEntry?.scrollTrigger.disable();
    chromaExit?.scrollTrigger.disable();
    dimmerScrub?.disable();
    scrollerScrub?.disable();
    gsap.set(items, { opacity: 1 });
    gsap.set(document.documentElement, { '--chroma': 0 });
  } else {
    gsap.set(items, { opacity: (i) => (i !== 0 ? 0.2 : 1) });
    dimmerScrub.enable();
    scrollerScrub.enable();
    chromaEntry.scrollTrigger.enable();
    chromaExit.scrollTrigger.enable();
  }
}

function sync(event) {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme'
  ) {
    return update();
  }
  document.startViewTransition(() => update());
}

ctrl.addBinding(config, 'animate', { label: 'Animate' });
ctrl.addBinding(config, 'snap', { label: 'Snap' });
ctrl.addBinding(config, 'start', { label: 'Hue Start', min: 0, max: 1000, step: 1 });
ctrl.addBinding(config, 'end', { label: 'Hue End', min: 0, max: 1000, step: 1 });
ctrl.addBinding(config, 'scroll', { label: 'Scrollbar' });
ctrl.addBinding(config, 'debug', { label: 'Debug' });
ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: { System: 'system', Light: 'light', Dark: 'dark' },
});
ctrl.on('change', sync);

// Fallback if CSS scroll animations not supported
if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
  const dimmer = gsap
    .timeline()
    .to(items.slice(1), { opacity: 1, stagger: 0.5 })
    .to(items.slice(0, items.length - 1), { opacity: 0.2, stagger: 0.5 }, 0);

  dimmerScrub = ScrollTrigger.create({
    trigger: '.content', // scoped
    start: 'top center',
    end: 'bottom center',
    animation: dimmer,
    scrub: 0.2,
  });

  const scroller = gsap.timeline().fromTo(
    document.documentElement,
    { '--hue': config.start },
    { '--hue': config.end, ease: 'none' }
  );

  scrollerScrub = ScrollTrigger.create({
    trigger: '.content', // scoped
    start: 'top center',
    end: 'bottom center',
    animation: scroller,
    scrub: 0.2,
  });

  chromaEntry = gsap.fromTo(
    document.documentElement,
    { '--chroma': 0 },
    {
      '--chroma': 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.content',
        scrub: 0.2,
        start: 'top+=40 center',
        end: 'top center',
      },
    }
  );

  chromaExit = gsap.fromTo(
    document.documentElement,
    { '--chroma': 0.3 },
    {
      '--chroma': 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.content',
        scrub: 0.2,
        start: 'bottom center',
        end: 'bottom-=40 center',
      },
    }
  );
}

update();

