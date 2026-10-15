// Kido page: makes the screenshot strips easy to browse (arrows, dots and
// "portrait" detection) without changing the markup that is already there.
(function () {
    var LABELS = {
        en: ['Previous screenshot', 'Next screenshot', 'Go to screenshot'],
        es: ['Captura anterior', 'Captura siguiente', 'Ir a la captura'],
        uk: ['Попередній скриншот', 'Наступний скриншот', 'Перейти до скриншота']
    };
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var T = LABELS[lang] || LABELS.en;

    function enhance(strip) {
        if (strip.dataset.ready) return;
        strip.dataset.ready = '1';
        var imgs = Array.prototype.slice.call(strip.querySelectorAll('img'));
        if (imgs.length < 2) return;

        var wrap = document.createElement('div');
        wrap.className = 'kido-shots';
        strip.parentNode.insertBefore(wrap, strip);
        wrap.appendChild(strip);

        function button(cls, icon, label) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'kido-shots-btn ' + cls;
            b.setAttribute('aria-label', label);
            b.innerHTML = '<i class="fas ' + icon + '"></i>';
            return b;
        }
        var prev = button('kido-shots-prev', 'fa-chevron-left', T[0]);
        var next = button('kido-shots-next', 'fa-chevron-right', T[1]);
        var dots = document.createElement('div');
        dots.className = 'kido-shots-dots';
        var dotEls = imgs.map(function (img, i) {
            var d = document.createElement('button');
            d.type = 'button';
            d.className = 'kido-dot';
            d.setAttribute('aria-label', T[2] + ' ' + (i + 1));
            d.addEventListener('click', function () { go(i); });
            dots.appendChild(d);
            return d;
        });
        wrap.appendChild(prev);
        wrap.appendChild(next);
        wrap.appendChild(dots);

        function offsetFor(i) {
            var img = imgs[i];
            return img.offsetLeft - (strip.clientWidth - img.offsetWidth) / 2;
        }
        function current() {
            var mid = strip.scrollLeft + strip.clientWidth / 2, best = 0, bestD = Infinity;
            imgs.forEach(function (img, i) {
                var d = Math.abs(img.offsetLeft + img.offsetWidth / 2 - mid);
                if (d < bestD) { bestD = d; best = i; }
            });
            return best;
        }
        function go(i) {
            i = Math.max(0, Math.min(imgs.length - 1, i));
            strip.scrollTo({ left: offsetFor(i), behavior: 'smooth' });
        }
        function update() {
            var i = current();
            var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
            if (atEnd) i = imgs.length - 1;
            dotEls.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
            prev.hidden = strip.scrollLeft <= 2;
            next.hidden = atEnd;
        }
        prev.addEventListener('click', function () { go(current() - 1); });
        next.addEventListener('click', function () { go(current() + 1); });

        var timer = 0;
        strip.addEventListener('scroll', function () {
            if (timer) return;
            timer = setTimeout(function () { timer = 0; update(); }, 40);
        }, { passive: true });
        window.addEventListener('resize', update);

        // Portrait screenshots (phones) get a taller strip on small screens.
        function portrait() {
            var first = imgs[0];
            if (first.naturalWidth && first.naturalHeight) {
                strip.classList.toggle('kido-portrait', first.naturalHeight > first.naturalWidth);
            }
            update();
        }
        imgs.forEach(function (img) {
            if (img.complete) portrait(); else img.addEventListener('load', portrait);
        });
        update();
    }

    function init() {
        Array.prototype.forEach.call(document.querySelectorAll('.kido-card-shots'), enhance);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
