(function () {
    'use strict';

    function init() {
        var root = document.querySelector('.carousel');
        if (!root) { return; }

        var deck = root.querySelector('.deck');
        var panels = Array.prototype.slice.call(root.querySelectorAll('.panel'));
        var tabs = Array.prototype.slice.call(root.querySelectorAll('.deck-tab'));
        var pauseButton = root.querySelector('.deck-pause');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        var order = panels.map(function (_panel, index) { return index; });
        var paused = reduceMotion.matches;

        tabs.forEach(function (tab) {
            var bar = document.createElement('span');
            bar.className = 'deck-progress';
            bar.setAttribute('aria-hidden', 'true');
            tab.appendChild(bar);
        });

        function render() {
            panels.forEach(function (panel, index) {
                var position = order.indexOf(index);
                var front = position === 0;
                panel.setAttribute('data-pos', String(position));
                if (front) {
                    panel.removeAttribute('aria-hidden');
                } else {
                    panel.setAttribute('aria-hidden', 'true');
                    panel.style.removeProperty('--rx');
                    panel.style.removeProperty('--ry');
                }
                Array.prototype.forEach.call(panel.querySelectorAll('a'), function (link) {
                    if (front) { link.removeAttribute('tabindex'); } else { link.setAttribute('tabindex', '-1'); }
                });
            });

            root.setAttribute('data-active', panels[order[0]].getAttribute('data-brand'));
            tabs.forEach(function (tab) {
                tab.setAttribute('aria-pressed', Number(tab.getAttribute('data-index')) === order[0] ? 'true' : 'false');
            });
            restartProgress();
        }

        function restartProgress() {
            root.classList.remove('is-running');
            if (paused) { return; }
            void root.offsetWidth;
            root.classList.add('is-running');
        }

        function show(index) {
            if (order[0] === index) { return; }
            order = [index].concat(order.filter(function (item) { return item !== index; }));
            render();
        }

        function next() {
            order = order.slice(1).concat(order[0]);
            render();
        }

        function setPaused(value) {
            paused = value;
            root.classList.toggle('is-paused', paused);
            deck.setAttribute('aria-live', paused ? 'polite' : 'off');
            pauseButton.setAttribute('aria-label', paused ? 'Start automatic rotation' : 'Pause automatic rotation');
            restartProgress();
        }

        tabs.forEach(function (tab, tabIndex) {
            tab.addEventListener('click', function () {
                setPaused(true);
                show(Number(tab.getAttribute('data-index')));
            });
            tab.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') { return; }
                event.preventDefault();
                var step = event.key === 'ArrowRight' ? 1 : tabs.length - 1;
                var target = tabs[(tabIndex + step) % tabs.length];
                target.focus();
                target.click();
            });
            tab.querySelector('.deck-progress').addEventListener('animationend', function () {
                if (!paused && tab.getAttribute('aria-pressed') === 'true') { next(); }
            });
        });

        panels.forEach(function (panel, index) {
            panel.addEventListener('click', function (event) {
                if (panel.getAttribute('data-pos') === '0') { return; }
                event.preventDefault();
                setPaused(true);
                show(index);
            });
        });

        pauseButton.addEventListener('click', function () {
            setPaused(!paused);
        });

        root.addEventListener('mouseenter', function () { root.classList.add('is-holding'); });
        root.addEventListener('mouseleave', function () { root.classList.remove('is-holding'); });
        root.addEventListener('focusin', function () { root.classList.add('is-holding'); });
        root.addEventListener('focusout', function (event) {
            if (!root.contains(event.relatedTarget)) { root.classList.remove('is-holding'); }
        });

        deck.addEventListener('pointermove', function (event) {
            if (reduceMotion.matches || !finePointer.matches) { return; }
            var front = panels[order[0]];
            var box = front.getBoundingClientRect();
            var x = (event.clientX - box.left) / box.width - 0.5;
            var y = (event.clientY - box.top) / box.height - 0.5;
            if (Math.abs(x) > 0.6 || Math.abs(y) > 0.6) { return; }
            front.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
            front.style.setProperty('--rx', (y * -6).toFixed(2) + 'deg');
        });
        deck.addEventListener('pointerleave', function () {
            var front = panels[order[0]];
            front.style.removeProperty('--rx');
            front.style.removeProperty('--ry');
        });

        root.classList.add('is-ready');
        setPaused(paused);
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
