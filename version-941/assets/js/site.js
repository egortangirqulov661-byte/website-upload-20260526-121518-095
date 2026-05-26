(function () {
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    document.addEventListener('DOMContentLoaded', function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        qsa('[data-hero]').forEach(function (hero) {
            var slides = qsa('[data-hero-slide]', hero);
            var dots = qsa('[data-hero-dot]', hero);
            var index = 0;
            var timer = null;
            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }
            function start() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
            });
            show(0);
            start();
        });

        qsa('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.parentElement;
            var search = panel.querySelector('[data-search-input]');
            var year = panel.querySelector('[data-year-filter]');
            var type = panel.querySelector('[data-type-filter]');
            var cards = qsa('.movie-card, .rank-row', scope);
            function apply() {
                var keyword = (search && search.value || '').trim().toLowerCase();
                var yearValue = year && year.value || '';
                var typeValue = type && type.value || '';
                cards.forEach(function (card) {
                    var hay = [
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (keyword && hay.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (yearValue && (card.dataset.year || '').indexOf(yearValue) === -1) {
                        ok = false;
                    }
                    if (typeValue && (card.dataset.type || '').indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    card.classList.toggle('is-filtered-out', !ok);
                });
            }
            [search, year, type].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
        });
    });

    window.setupMoviePlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var ready = false;
        function attach() {
            if (ready || !video) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    };
})();
