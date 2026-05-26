(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-control'));
  var active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var noResult = document.querySelector('[data-no-result]');
  var currentType = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(filterInput ? filterInput.value : '');
    var shown = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.getAttribute('data-tags'));
      var type = normalize(card.getAttribute('data-type'));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedType = currentType === 'all' || type.indexOf(currentType) !== -1 || haystack.indexOf(currentType) !== -1;
      var visible = matchedKeyword && matchedType;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    if (noResult) {
      noResult.style.display = shown ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      currentType = normalize(chip.getAttribute('data-filter-chip'));
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilter();
    });
  });
})();
