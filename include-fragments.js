// include-fragments.js — carga header.html y footer.html en las páginas
(function () {
    'use strict';
    async function load(url) {
        try {
            var res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) return null;
            return await res.text();
        } catch (e) {
            return null;
        }
    }

    async function insert() {
        var headerTarget = document.getElementById('site-header');
        var footerTarget = document.getElementById('site-footer');
        var promises = [];
        if (headerTarget) promises.push(load('header.html').then(function (html) { if (html) headerTarget.innerHTML = html; }));
        if (footerTarget) promises.push(load('footer.html').then(function (html) { if (html) footerTarget.innerHTML = html; }));
        await Promise.all(promises);
        // notify other scripts that fragments are present
        document.dispatchEvent(new Event('fragmentsLoaded'));
    }

    // Run asap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insert);
    } else {
        insert();
    }

})();
