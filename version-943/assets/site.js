(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var button = qs("[data-menu-button]");
    var panel = qs("[data-menu-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa(".hero-dot", slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var container = panel.nextElementSibling;
      var cards = container ? qsa("[data-title]", container) : [];
      var input = qs("[data-filter-input]", panel);
      var region = qs("[data-filter-region]", panel);
      var type = qs("[data-filter-type]", panel);
      var year = qs("[data-filter-year]", panel);
      var empty = container ? qs(".no-match", container.parentElement) : null;

      function run() {
        var keyword = norm(input && input.value);
        var regionValue = norm(region && region.value);
        var typeValue = norm(type && type.value);
        var yearValue = norm(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = norm([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && norm(card.dataset.region).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (typeValue && norm(card.dataset.type).indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && norm(card.dataset.year) !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", run);
          node.addEventListener("change", run);
        }
      });
      run();
    });
  }

  function initPlayers() {
    qsa(".video-shell").forEach(function (shell) {
      var video = qs("video", shell);
      var cover = qs(".play-cover", shell);
      if (!video || !cover) {
        return;
      }
      var source = video.dataset.m3u8;
      var ready = false;
      var hlsInstance = null;

      function attach() {
        if (ready || !source) {
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        video.setAttribute("controls", "controls");
        shell.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function initSearch() {
    var root = qs("[data-search-root]");
    if (!root || typeof siteSearchItems === "undefined") {
      return;
    }

    var input = qs("[data-search-query]", root);
    var region = qs("[data-search-region]", root);
    var type = qs("[data-search-type]", root);
    var year = qs("[data-search-year]", root);
    var form = qs("[data-search-form]", root);
    var results = qs("[data-search-results]", root);
    var empty = qs("[data-search-empty]", root);
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    if (region && params.get("region")) {
      region.value = params.get("region");
    }
    if (type && params.get("type")) {
      type.value = params.get("type");
    }
    if (year && params.get("year")) {
      year.value = params.get("year");
    }

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"score\">" + escapeHtml(item.score) + "</span></a>" +
        "<div class=\"card-body\"><div class=\"meta-row\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span></div>" +
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.subtitle) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function run() {
      var keyword = norm(input && input.value);
      var regionValue = norm(region && region.value);
      var typeValue = norm(type && type.value);
      var yearValue = norm(year && year.value);
      var list = siteSearchItems.filter(function (item) {
        var haystack = norm([
          item.title,
          item.subtitle,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(" "),
          item.category
        ].join(" "));
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (regionValue && norm(item.region).indexOf(regionValue) === -1) {
          return false;
        }
        if (typeValue && norm(item.type).indexOf(typeValue) === -1) {
          return false;
        }
        if (yearValue && norm(item.year) !== yearValue) {
          return false;
        }
        return true;
      }).slice(0, 96);

      results.innerHTML = list.map(card).join("");
      empty.classList.toggle("is-visible", list.length === 0);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        run();
      });
    }
    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", run);
        node.addEventListener("change", run);
      }
    });
    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearch();
  });
})();
