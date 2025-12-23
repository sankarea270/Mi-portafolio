// scripts.js - animaciones: barra de progreso, canvas de fondo, navbar y typing
(function () {
    'use strict';

    // Barra de progreso de scroll
    function updateProgressBar() {
        var bar = document.getElementById('progressBar');
        if (!bar) return;
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var pct = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }

    // Toggle clase nav.scrolled
    function updateNav() {
        var nav = document.getElementById('navbar');
        if (!nav) return;
        if (window.scrollY > 60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    }

    // Smooth scroll for internal anchors
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var href = a.getAttribute('href');
                if (href === '#' || href === '') return;
                if (href.startsWith('#')) {
                    var el = document.querySelector(href);
                    if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // Simple typing effect for elements with .typing-effect
    function initTyping() {
        var els = document.querySelectorAll('.typing-effect');
        els.forEach(function (el) {
            var text = el.textContent || '';
            el.textContent = '';
            var i = 0;
            var forward = true;
            var delay = 40;
            function tick() {
                if (forward) {
                    i++;
                    el.textContent = text.slice(0, i);
                    if (i >= text.length) {
                        forward = false;
                        setTimeout(tick, 1200);
                        return;
                    }
                } else {
                    i--;
                    el.textContent = text.slice(0, i);
                    if (i <= 0) {
                        forward = true;
                        setTimeout(tick, 300);
                        return;
                    }
                }
                setTimeout(tick, delay);
            }
            tick();
        });
    }

    // Canvas background: subtle moving particles
    function initCanvas() {
        var canvas = document.getElementById('canvas-bg');
        if (!canvas || !canvas.getContext) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width = window.innerWidth;
        var h = canvas.height = window.innerHeight;

        var particles = [];
        // Ajuste de cantidad según tamaño de pantalla para mejorar rendimiento en móviles
        var baseArea = (w * h);
        var count = Math.floor(baseArea / 80000);
        if (w < 768) count = Math.max(6, Math.floor(baseArea / 160000));
        count = Math.max(6, count);

        function rand(min, max) { return Math.random() * (max - min) + min; }

        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(20, 120),
                vx: rand(-0.15, 0.15),
                vy: rand(-0.05, 0.05),
                hue: 200 + Math.random() * 120
            });
        }

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            // recalcular partículas cuando se redimensiona significativamente
            if (particles.length < 10 || particles.length > Math.max(6, Math.floor((w * h) / 80000) * 2)) {
                particles = [];
                var area = w * h;
                var newCount = Math.floor(area / 80000);
                if (w < 768) newCount = Math.max(6, Math.floor(area / 160000));
                newCount = Math.max(6, newCount);
                for (var i = 0; i < newCount; i++) addParticle();
            }
        }

        window.addEventListener('resize', resize);

        function draw() {
            ctx.clearRect(0, 0, w, h);
            // subtle dark overlay to keep contrast
            ctx.fillStyle = 'rgba(10,14,39,0.45)';
            ctx.fillRect(0, 0, w, h);

            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x > w + 200) p.x = -200;
                if (p.x < -200) p.x = w + 200;
                if (p.y > h + 200) p.y = -200;
                if (p.y < -200) p.y = h + 200;

                var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                grd.addColorStop(0, 'hsla(' + (p.hue) + ',90%,60%,0.18)');
                grd.addColorStop(0.5, 'hsla(' + (p.hue) + ',70%,50%,0.07)');
                grd.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);

        // permitir pausar animación en dispositivos muy lentos (reduce CPU)
        var reduce = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || /Mobi|Android/i.test(navigator.userAgent);
        if (reduce) {
            // reducir tamaño y velocidad
            particles.forEach(function (p) { p.vx *= 0.6; p.vy *= 0.6; p.r *= 0.9; });
        }
    }

    // Añadir función auxiliar para crear una partícula
    function addParticle() {
        var canvas = document.getElementById('canvas-bg');
        if (!canvas) return;
        var w = window.innerWidth;
        var h = window.innerHeight;
        function rand(min, max) { return Math.random() * (max - min) + min; }
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(20, 120),
            vx: rand(-0.15, 0.15),
            vy: rand(-0.05, 0.05),
            hue: 200 + Math.random() * 120
        };
    }

    // Marca enlace activo según sección visible o ruta
    function initActiveNav() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
        if (!links.length) return;

        // Primero: si estamos en páginas separadas (about.html, projects.html, contact.html)
        var rawPath = window.location.pathname.split('/').pop() || 'index.html';
        var path = rawPath.split('?')[0].split('#')[0];
        if (path && path !== '' && path !== 'index.html') {
            links.forEach(function (a) {
                var href = a.getAttribute('href') || '';
                try {
                    // normalizar la URL relativa
                    var linkUrl = new URL(href, window.location.origin + window.location.pathname);
                    var linkPath = linkUrl.pathname.split('/').pop() || '';
                    if (decodeURIComponent(linkPath) === decodeURIComponent(path)) {
                        a.classList.add('active');
                    } else {
                        a.classList.remove('active');
                    }
                } catch (e) {
                    // en caso de href inválido, fallback simple
                    if (href.replace('./', '') === path) {
                        a.classList.add('active');
                    } else {
                        a.classList.remove('active');
                    }
                }
            });
            return;
        }

        // Si estamos en la página principal (anchors), usar IntersectionObserver
        var sections = links.map(function (a) {
            var href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return null;
            var el = document.querySelector(href);
            return el;
        }).filter(Boolean);

        if ('IntersectionObserver' in window && sections.length) {
            var options = { root: null, rootMargin: '0px 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] };
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.target.id) return;
                    var selector = '.nav-links a[href="#' + entry.target.id + '"]';
                    var link = document.querySelector(selector);
                    if (entry.isIntersecting) {
                        links.forEach(function (a) { a.classList.remove('active'); });
                        if (link) link.classList.add('active');
                    }
                });
            }, options);
            sections.forEach(function (s) { observer.observe(s); });
        }
    }

    // Manejo del formulario de contacto (Formspree)
    function initContactForm() {
        var form = document.getElementById('contactForm') || document.querySelector('.contact-form');
        if (!form) return;
        var status = document.getElementById('form-status');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var action = form.getAttribute('action') || '';
            if (!action || action.indexOf('formspree.io') === -1) {
                if (status) {
                    status.className = 'form-status error';
                    status.textContent = 'El formulario no está configurado correctamente.';
                } else {
                    alert('El formulario no está configurado correctamente.');
                }
                return;
            }

            var data = new FormData(form);
            var submitButton = form.querySelector('button[type="submit"]');
            var originalText = submitButton ? submitButton.textContent : '';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
            }
            if (status) {
                status.className = 'form-status';
                status.textContent = '';
            }

            fetch(action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
                .then(function (resp) {
                    if (resp.ok) {
                        if (status) {
                            status.className = 'form-status success';
                            status.textContent = '¡Gracias! Tu mensaje ha sido enviado.';
                        } else {
                            alert('Mensaje enviado. Gracias!');
                        }
                        form.reset();
                    } else {
                        return resp.json().then(function (json) {
                            var msg = (json && json.error) ? json.error : 'Hubo un error al enviar el formulario.';
                            if (status) {
                                status.className = 'form-status error';
                                status.textContent = msg;
                            } else {
                                alert(msg);
                            }
                        }).catch(function () {
                            if (status) {
                                status.className = 'form-status error';
                                status.textContent = 'Hubo un error al enviar el formulario.';
                            } else {
                                alert('Hubo un error al enviar el formulario.');
                            }
                        });
                    }
                }).catch(function (err) {
                    if (status) {
                        status.className = 'form-status error';
                        status.textContent = 'Error de red. Intenta de nuevo más tarde.';
                    } else {
                        alert('Error de red. Intenta de nuevo más tarde.');
                    }
                }).finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }
                });
        });
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', function () {
        updateProgressBar();
        updateNav();
        initSmoothScroll();
        initTyping();
        initCanvas();
        // initActiveNav and contact form depend on header/footer fragments being present
        if (document.querySelector('.nav-links')) {
            initActiveNav();
            initContactForm();
        } else {
            document.addEventListener('fragmentsLoaded', function () {
                initSmoothScroll();
                initActiveNav();
                initContactForm();
            }, { once: true });
        }
    });

    window.addEventListener('scroll', function () {
        updateProgressBar();
        updateNav();
    }, { passive: true });

})();
