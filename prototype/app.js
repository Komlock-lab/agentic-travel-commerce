(function () {
  "use strict";

  const DURATION = 90;
  const sceneMeta = [
    ["problem", "THE PROBLEM", "CONCEPT"],
    ["mandate", "CONTROLLED DELEGATION", "CONCEPT UI"],
    ["chat", "NATURAL REQUEST", "CONCEPT UI"],
    ["itinerary", "BOOKABLE ITINERARY", "CONCEPT UI"],
    ["payment", "POLICY + PAYMENT", "CONCEPT UI"],
    ["approval", "HUMAN APPROVAL", "CONCEPT UI"],
    ["stop", "SAFE STOP", "CONCEPT UI"],
    ["audit", "AUDIT TRAIL", "CONCEPT UI"],
    ["final", "AGENTIC COMMERCE", "CONCEPT"],
  ];

  const scenes = [...document.querySelectorAll(".scene")];
  const stage = document.getElementById("stage");
  const timelineFill = document.getElementById("timelineFill");
  const timelineDot = document.getElementById("timelineDot");
  const timecode = document.getElementById("timecode");
  const sceneIndex = document.getElementById("sceneIndex");
  const sceneTitle = document.getElementById("sceneTitle");
  const realityLabel = document.getElementById("realityLabel");
  const playButton = document.getElementById("playButton");
  const restartButton = document.getElementById("restartButton");
  const scrubber = document.getElementById("scrubber");

  const params = new URLSearchParams(location.search);
  if (params.has("render")) document.body.classList.add("render-mode");

  let currentTime = Math.max(0, Math.min(DURATION, Number(params.get("t") || 0)));
  let playing = false;
  let lastFrame = performance.now();

  function clamp01(value) { return Math.max(0, Math.min(1, value)); }
  function smoothstep(value) { const x = clamp01(value); return x * x * (3 - 2 * x); }
  function progressBetween(value, start, end) { return smoothstep((value - start) / Math.max(0.0001, end - start)); }

  function setReveal(element, localProgress) {
    const values = element.dataset.reveal.split(",").map(Number);
    const start = values[0] || 0;
    const end = values[1] || start + 0.15;
    const p = progressBetween(localProgress, start, end);
    const y = (1 - p) * 22;
    element.style.opacity = p.toFixed(4);
    element.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${(0.985 + p * 0.015).toFixed(4)})`;
  }

  function setSceneSpecific(name, p) {
    if (name === "problem") {
      const stack = document.querySelector(".window-stack");
      stack.style.transform = `translate3d(${((1 - smoothstep(p)) * 35).toFixed(2)}px,0,0)`;
    }

    if (name === "payment") {
      const checks = [...document.querySelectorAll(".check-row")];
      checks.forEach((row) => row.classList.toggle("checked", p >= Number(row.dataset.check)));
      const passed = p >= 0.58;
      const status = document.getElementById("policyStatus");
      status.textContent = passed ? "PASSED" : "EVALUATING";
      status.classList.toggle("passed", passed);
      const flow = document.querySelector(".flow-line i");
      const flowP = progressBetween(p, 0.56, 0.72);
      flow.style.width = `${flowP * 100}%`;
      document.querySelector(".flow-line span").style.opacity = flowP > 0.5 ? "1" : "0";
      const receipt = document.getElementById("receiptCard");
      const receiptP = progressBetween(p, 0.68, 0.86);
      receipt.style.opacity = String(0.08 + receiptP * 0.92);
      receipt.style.transform = `translateX(${(-18 + receiptP * 18).toFixed(2)}px) scale(${(0.96 + receiptP * 0.04).toFixed(4)})`;
    }

    if (name === "stop") {
      const price = document.querySelector(".price-change strong");
      const priceP = progressBetween(p, 0.18, 0.45);
      const value = Math.round(64000 + priceP * 5000);
      price.textContent = `¥${value.toLocaleString("ja-JP")}`;
    }
  }

  function sceneOpacity(time, start, end, name) {
    const fade = name === "final" ? 0.7 : 0.55;
    const inP = start === 0 ? 1 : progressBetween(time, start, start + fade);
    const outP = end >= DURATION ? 1 : 1 - progressBetween(time, end - fade, end);
    return clamp01(inP * outP);
  }

  function render(time) {
    currentTime = clamp01(time / DURATION) * DURATION;
    let activeIndex = 0;

    scenes.forEach((scene, index) => {
      const start = Number(scene.dataset.start);
      const end = Number(scene.dataset.end);
      const name = scene.dataset.scene;
      const isInRange = currentTime >= start && currentTime < end + 0.001;
      if (isInRange) activeIndex = index;
      const opacity = sceneOpacity(currentTime, start, end, name);
      const local = clamp01((currentTime - start) / Math.max(0.001, end - start));
      scene.style.opacity = opacity.toFixed(4);
      scene.style.transform = `scale(${(0.992 + opacity * 0.008).toFixed(4)})`;
      scene.style.visibility = opacity > 0.001 ? "visible" : "hidden";
      scene.querySelectorAll("[data-reveal]").forEach((el) => setReveal(el, local));
      setSceneSpecific(name, local);
    });

    const ratio = currentTime / DURATION;
    timelineFill.style.width = `${ratio * 100}%`;
    timelineDot.style.left = `${ratio * 100}%`;
    scrubber.value = String(currentTime);
    sceneIndex.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(sceneMeta.length).padStart(2, "0")}`;
    sceneTitle.textContent = sceneMeta[activeIndex][1];
    realityLabel.textContent = sceneMeta[activeIndex][2];
    timecode.textContent = `00:${String(Math.floor(currentTime)).padStart(2, "0")}`;
    stage.classList.toggle("final-active", activeIndex === sceneMeta.length - 1);
  }

  function tick(now) {
    if (playing) {
      currentTime += (now - lastFrame) / 1000;
      if (currentTime >= DURATION) {
        currentTime = DURATION;
        playing = false;
        playButton.textContent = "▶";
      }
      render(currentTime);
    }
    lastFrame = now;
    requestAnimationFrame(tick);
  }

  playButton.addEventListener("click", () => {
    if (currentTime >= DURATION) currentTime = 0;
    playing = !playing;
    playButton.textContent = playing ? "❚❚" : "▶";
  });
  restartButton.addEventListener("click", () => { currentTime = 0; render(0); });
  scrubber.addEventListener("input", () => { playing = false; playButton.textContent = "▶"; render(Number(scrubber.value)); });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") { event.preventDefault(); playButton.click(); }
    if (event.code === "ArrowRight") render(Math.min(DURATION, currentTime + 1));
    if (event.code === "ArrowLeft") render(Math.max(0, currentTime - 1));
  });

  window.setDemoTime = (seconds) => render(Number(seconds));
  window.getDemoDuration = () => DURATION;
  render(currentTime);
  requestAnimationFrame(tick);
})();
