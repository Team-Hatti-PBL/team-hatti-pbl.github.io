/**
 * Team Hatti — Presentation carousel
 *
 * Auto-detects slide images in the `slides/` folder. It looks for
 * slides/slide-1.(png|jpg|jpeg), slide-2.(…), … and stops at the first
 * index that has no matching image. Just drop your exported Canva slides
 * into the slides/ folder named slide-1.png, slide-2.png, … and they
 * will appear here automatically — no code changes needed.
 */
(function () {
  "use strict";

  var EXTENSIONS = ["png", "jpg", "jpeg", "PNG", "JPG"];
  var MAX_SLIDES = 200; // safety cap

  var track = document.getElementById("carouselTrack");
  var dotsWrap = document.getElementById("carouselDots");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");
  var carousel = document.getElementById("carousel");
  var emptyMsg = document.getElementById("carouselEmpty");

  var slides = [];
  var current = 0;

  // Try to load a single image, resolving with its src if it exists.
  function tryLoad(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        resolve(img.naturalWidth > 0 ? src : null);
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = src;
    });
  }

  // Find the image for a given slide index, trying each extension in turn.
  function findSlide(index) {
    var attempts = EXTENSIONS.map(function (ext) {
      return "slides/slide-" + index + "." + ext;
    });

    return attempts.reduce(function (chain, src) {
      return chain.then(function (found) {
        return found ? found : tryLoad(src);
      });
    }, Promise.resolve(null));
  }

  // Walk slide-1, slide-2, … until one is missing.
  function discoverSlides() {
    var found = [];

    function next(index) {
      if (index > MAX_SLIDES) return Promise.resolve(found);
      return findSlide(index).then(function (src) {
        if (!src) return found;
        found.push(src);
        return next(index + 1);
      });
    }

    return next(1);
  }

  // With many slides, dots wrap into messy rows — use a counter instead.
  var useDots = false;

  function render() {
    track.innerHTML = "";
    dotsWrap.innerHTML = "";
    useDots = slides.length <= 12;

    slides.forEach(function (src, i) {
      var slide = document.createElement("div");
      slide.className = "carousel-slide";
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Presentation slide " + (i + 1);
      img.loading = i === 0 ? "eager" : "lazy";
      slide.appendChild(img);
      track.appendChild(slide);

      if (useDots) {
        var dot = document.createElement("button");
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function () {
          goTo(i);
        });
        dotsWrap.appendChild(dot);
      }
    });

    if (!useDots) {
      var counter = document.createElement("span");
      counter.className = "carousel-counter";
      counter.id = "carouselCounter";
      dotsWrap.appendChild(counter);
    }

    update();
  }

  function update() {
    track.style.transform = "translateX(" + -current * 100 + "%)";
    if (useDots) {
      var dots = dotsWrap.querySelectorAll(".carousel-dot");
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === current);
      });
    } else {
      var counter = document.getElementById("carouselCounter");
      if (counter) counter.textContent = current + 1 + " / " + slides.length;
    }
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(i, slides.length - 1));
    update();
  }

  function init() {
    discoverSlides().then(function (found) {
      slides = found;

      if (!slides.length) {
        if (emptyMsg) emptyMsg.hidden = false;
        prevBtn.hidden = true;
        nextBtn.hidden = true;
        return;
      }

      render();

      prevBtn.addEventListener("click", function () {
        goTo(current - 1);
      });
      nextBtn.addEventListener("click", function () {
        goTo(current + 1);
      });

      // Keyboard navigation when the carousel is in view/focused.
      document.addEventListener("keydown", function (e) {
        var rect = carousel.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === "ArrowLeft") goTo(current - 1);
        if (e.key === "ArrowRight") goTo(current + 1);
      });

      // Basic touch/swipe support.
      var startX = null;
      track.addEventListener(
        "touchstart",
        function (e) {
          startX = e.touches[0].clientX;
        },
        { passive: true }
      );
      track.addEventListener(
        "touchend",
        function (e) {
          if (startX === null) return;
          var dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
          startX = null;
        },
        { passive: true }
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
