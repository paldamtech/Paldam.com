(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    function each(selector, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
    }

    function spotlight() {
        each('.product', function (card) {
            card.addEventListener('pointermove', function (event) {
                if (!finePointer.matches) { return; }
                var box = card.getBoundingClientRect();
                var x = (event.clientX - box.left) / box.width;
                var y = (event.clientY - box.top) / box.height;
                card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
                card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
                if (reduceMotion.matches) { return; }
                card.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');
                card.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
            });
            card.addEventListener('pointerleave', function () {
                card.style.removeProperty('--rx');
                card.style.removeProperty('--ry');
            });
        });
    }

    function linkBadges() {
        function badgesFor(cell) {
            return document.querySelectorAll('.badge[href="#' + cell.id + '"]');
        }

        function mark(nodes, on) {
            Array.prototype.forEach.call(nodes, function (node) { node.classList.toggle('is-linked', on); });
        }

        each('.badge', function (badge) {
            var cell = document.getElementById(badge.getAttribute('href').slice(1));
            if (!cell) { return; }
            ['mouseenter', 'focus'].forEach(function (type) {
                badge.addEventListener(type, function () { cell.classList.add('is-linked'); });
            });
            ['mouseleave', 'blur'].forEach(function (type) {
                badge.addEventListener(type, function () { cell.classList.remove('is-linked'); });
            });
        });

        each('.sec-cell[id]', function (cell) {
            cell.addEventListener('mouseenter', function () { mark(badgesFor(cell), true); });
            cell.addEventListener('mouseleave', function () { mark(badgesFor(cell), false); });
        });
    }

    function reveal() {
        if (reduceMotion.matches || !('IntersectionObserver' in window)) { return; }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                entry.target.classList.remove('is-waiting');
                entry.target.classList.add('is-in');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        each('[data-reveal]', function (group) {
            Array.prototype.forEach.call(group.children, function (child, index) {
                child.style.setProperty('--i', String(index));
            });
            if (group.getBoundingClientRect().top < window.innerHeight) { return; }
            group.classList.add('is-waiting');
            observer.observe(group);
        });
    }

    function init() {
        spotlight();
        linkBadges();
        reveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
