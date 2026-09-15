import "./style.css";
import { slides } from "./slides.js";

const app = document.querySelector("#app");
let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace("#slide-", "")) - 1 || Number(localStorage.getItem("martha-slide")) || 0));
let readerMode = false;
let notesOpen = false;
let touchStartX = 0;

const icon = (name) => ({
  back: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>',
  expand: '<svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>',
  present: '<svg viewBox="0 0 24 24"><path d="M4 4h16v12H4zM8 21l4-5 4 5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>'
})[name];

function slideMarkup(slide, index, reader = false) {
  const lines = value => (value || "").split("\n").map(line => `<span>${line}</span>`).join("");
  let content = "";
  if (slide.type.includes("contrast")) content = `<h2>${slide.title}</h2><div class="contrast-grid"><article><small>${slide.leftLabel}</small><h3>${slide.leftTitle}</h3><p>${slide.leftBody}</p></article><article><small>${slide.rightLabel}</small><h3>${slide.rightTitle}</h3><p>${slide.rightBody}</p></article></div>`;
  else if (slide.type.includes("choice")) content = `<h2>${slide.title}</h2><div class="choice-row">${slide.choices.map((c, i) => `<div><span>0${i + 1}</span><strong>${c}</strong></div>`).join("")}</div>`;
  else if (slide.type.includes("steps")) content = `<h2>${slide.title}</h2><div class="steps">${slide.steps.map(s => `<div><span>${s[0]}</span><strong>${s[1]}</strong></div>`).join("")}</div>`;
  else if (slide.type.includes("question")) content = `<h2>${lines(slide.title)}</h2><p class="question">${lines(slide.question)}</p>`;
  else if (slide.type.includes("closing")) content = `<blockquote>${slide.quote}</blockquote><cite>${slide.reference}</cite><h2>${slide.title}</h2>`;
  else if (slide.type.includes("scripture")) content = `<blockquote>${lines(slide.quote)}</blockquote><cite>${slide.reference}</cite>`;
  else if (slide.type.includes("cover")) content = `<h1>${lines(slide.title)}</h1><div class="cover-verse"><q>${slide.quote}</q><cite>${slide.reference}</cite></div>`;
  else content = `${slide.number ? `<b class="big-number">${slide.number}</b>` : ""}<h2>${lines(slide.title)}</h2>${slide.body ? `<p class="body-copy">${lines(slide.body)}</p>` : ""}${slide.reference ? `<cite>${slide.reference}</cite>` : ""}`;
  return `<section class="slide ${slide.type} ${reader ? "reader-card" : ""}" aria-label="Slide ${index + 1} of ${slides.length}"><div class="wash"></div><div class="slide-inner"><div class="eyebrow">${slide.eyebrow}</div>${content}<div class="slide-index">${String(index + 1).padStart(2,"0")}</div></div></section>`;
}

function render() {
  document.body.classList.toggle("reader-mode", readerMode);
  if (readerMode) {
    app.innerHTML = `<header class="reader-header"><div><span>Chapter 9 · Part 1</span><strong>Martha’s Teachable Heart</strong></div><button class="action" data-action="present">${icon("present")} Present</button></header><div class="reader-list">${slides.map((s,i) => `${slideMarkup(s,i,true)}<aside class="reader-note"><span>Teacher note</span><p>${s.notes}</p></aside>`).join("")}</div>`;
  } else {
    const slide = slides[current];
    app.innerHTML = `<div class="presentation-shell"><div id="slide-stage" class="stage" tabindex="-1">${slideMarkup(slide,current)}<div class="progress"><span style="width:${((current+1)/slides.length)*100}%"></span></div></div><nav class="controls" aria-label="Presentation controls"><button data-action="prev" aria-label="Previous slide" ${current===0?"disabled":""}>${icon("back")}</button><span>${String(current+1).padStart(2,"0")} / ${slides.length}</span><button data-action="next" aria-label="Next slide" ${current===slides.length-1?"disabled":""}>${icon("next")}</button><i></i><button data-action="notes" aria-label="Toggle speaker notes">${icon("notes")}</button><button data-action="reader" aria-label="Open reading view">${icon("grid")}</button><button data-action="fullscreen" aria-label="Enter fullscreen">${icon("expand")}</button></nav>${notesOpen ? `<aside class="notes-panel"><button data-action="notes" aria-label="Close notes">${icon("close")}</button><span>Speaker notes · ${current+1}</span><p>${slide.notes}</p></aside>` : ""}<div class="swipe-hint">Swipe or use arrow keys</div></div>`;
    requestAnimationFrame(() => document.querySelector("#slide-stage")?.focus({preventScroll:true}));
  }
}

function go(delta) {
  const next = Math.max(0, Math.min(slides.length - 1, current + delta));
  if (next === current) return;
  current = next;
  localStorage.setItem("martha-slide", String(current));
  history.replaceState(null, "", `#slide-${current + 1}`);
  render();
}

document.addEventListener("click", e => {
  const button = e.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "next") go(1);
  if (action === "prev") go(-1);
  if (action === "notes") { notesOpen = !notesOpen; render(); }
  if (action === "reader") { readerMode = true; render(); scrollTo(0,0); }
  if (action === "present") { readerMode = false; render(); }
  if (action === "fullscreen") document.documentElement.requestFullscreen?.();
});

document.addEventListener("keydown", e => {
  if (readerMode) return;
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
  if (e.key === "Home") { current = 0; render(); }
  if (e.key === "End") { current = slides.length - 1; render(); }
  if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
  if (e.key.toLowerCase() === "n") { notesOpen = !notesOpen; render(); }
  if (e.key === "Escape" && notesOpen) { notesOpen = false; render(); }
});

document.addEventListener("touchstart", e => touchStartX = e.changedTouches[0].screenX, {passive:true});
document.addEventListener("touchend", e => {
  if (readerMode) return;
  const distance = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 55) go(distance < 0 ? 1 : -1);
}, {passive:true});

render();
