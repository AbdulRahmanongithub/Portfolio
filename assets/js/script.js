document.addEventListener('DOMContentLoaded', () => {
    // Scroll progress bar + nav shadow
    const scrollProgress = document.getElementById('scroll-progress');
    const siteNav = document.getElementById('site-nav');
    const backToTop = document.getElementById('back-to-top');

    function onScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (scrollProgress) scrollProgress.style.width = pct + '%';
        if (siteNav) siteNav.classList.toggle('scrolled', scrollTop > 10);
        if (backToTop) backToTop.classList.toggle('visible', scrollTop > 500);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll-spy: highlight the nav link for the section in view
    const navAnchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const spySections = Array.from(navAnchorLinks)
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (spySections.length) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchorLinks.forEach(link => {
                        link.classList.toggle('active-link', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        spySections.forEach(section => spyObserver.observe(section));
    }

    // Hero role rotator
    const roleEl = document.getElementById('role-rotator');
    if (roleEl) {
        const roles = [
            'enterprise-grade web apps',
            'IoT-connected smart home platforms',
            'scalable APIs & backends',
            'clean, modern user interfaces'
        ];
        let roleIndex = 0;
        setInterval(() => {
            roleIndex = (roleIndex + 1) % roles.length;
            roleEl.textContent = roles[roleIndex];
        }, 3200);
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Staggered reveal for grid/list children
    const staggerGroups = document.querySelectorAll('.skills-grid, .projects-grid, .timeline');
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    staggerGroups.forEach(group => {
        Array.from(group.children).forEach((child, index) => {
            child.style.setProperty('--stagger-index', index);
            staggerObserver.observe(child);
        });
    });

    // 3D tilt on project cards, following the cursor
    if (canHover && !reduceMotion) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotateX = ((e.clientY - rect.top - cy) / cy) * -5;
                const rotateY = ((e.clientX - rect.left - cx) / cx) * 5;
                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Magnetic pull for buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // Contact form submission via EmailJS
    const contactForm = document.getElementById('contact-form');
    const contactFeedback = document.getElementById('contact-feedback');

    if (contactForm) {

        // Ensure EmailJS SDK is loaded and initialized before attempting to send
        function ensureEmailJSInit(done) {
            const PUBLIC_KEY = 'uKjnqqnm-5XjVA8Wc';
            const CDNS = [
                'https://cdn.emailjs.com/sdk/3.2.0/email.min.js',
                'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js',
                'https://unpkg.com/emailjs-com@3/dist/email.min.js'
            ];
            const perAttemptTimeout = 8000; // ms
            const attemptsPerCdn = 2;

            // If SDK already present, initialize and continue
            if (window.emailjs && typeof emailjs.init === 'function') {
                if (!window._emailjs_initialized) {
                    try { emailjs.init(PUBLIC_KEY); } catch (err) { console.warn('EmailJS init warning:', err); }
                    window._emailjs_initialized = true;
                }
                done();
                return;
            }

            let cdnIndex = 0;
            let attempt = 0;

            function showLoadError(msg) {
                console.error(msg);
                if (contactFeedback) {
                    contactFeedback.style.display = 'block';
                    contactFeedback.style.color = 'red';
                    contactFeedback.textContent = msg + ' (Try disabling adblock/privacy extensions or check network.)';
                }
            }

            function tryLoadCurrentCdn() {
                const url = CDNS[cdnIndex];
                attempt++;

                const script = document.createElement('script');
                script.src = url;
                script.async = true;

                let timeoutHandle = setTimeout(() => {
                    script.onerror = null;
                    script.onload = null;
                    script.remove();
                    if (attempt < attemptsPerCdn) {
                        // retry same CDN
                        tryLoadCurrentCdn();
                        return;
                    }
                    // move to next CDN
                    cdnIndex++;
                    attempt = 0;
                    if (cdnIndex < CDNS.length) {
                        tryLoadCurrentCdn();
                        return;
                    }
                    // all CDNs exhausted
                    showLoadError('EmailJS SDK did not load (timeout).');
                }, perAttemptTimeout);

                script.onload = () => {
                    clearTimeout(timeoutHandle);
                    try {
                        if (typeof emailjs !== 'undefined' && typeof emailjs.init === 'function') {
                            emailjs.init(PUBLIC_KEY);
                            window._emailjs_initialized = true;
                        }
                    } catch (err) {
                        console.warn('EmailJS init after load failed:', err);
                    }

                    if (window.emailjs && typeof emailjs.init === 'function') {
                        done();
                    } else {
                        // If SDK loaded but emailjs not ready, treat as an error and continue retrying
                        script.remove();
                        if (attempt < attemptsPerCdn) {
                            tryLoadCurrentCdn();
                        } else {
                            cdnIndex++;
                            attempt = 0;
                            if (cdnIndex < CDNS.length) tryLoadCurrentCdn();
                            else showLoadError('EmailJS SDK loaded but did not initialize correctly.');
                        }
                    }
                };

                script.onerror = () => {
                    clearTimeout(timeoutHandle);
                    script.remove();
                    if (attempt < attemptsPerCdn) {
                        tryLoadCurrentCdn();
                    } else {
                        cdnIndex++;
                        attempt = 0;
                        if (cdnIndex < CDNS.length) tryLoadCurrentCdn();
                        else showLoadError('Failed to load EmailJS SDK from all CDNs.');
                    }
                };

                document.head.appendChild(script);
            }

            // Start attempts
            tryLoadCurrentCdn();
        }

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (contactFeedback) {
                contactFeedback.style.display = 'block';
                contactFeedback.style.color = '#0d6efd';
                contactFeedback.textContent = 'Sending...';
            }

            ensureEmailJSInit(() => {
                if (!window.emailjs) {
                    console.error('EmailJS still not available after init.');
                    if (contactFeedback) {
                        contactFeedback.style.display = 'block';
                        contactFeedback.style.color = 'red';
                        contactFeedback.textContent = 'Email service not available.';
                    }
                    return;
                }

                // Send the form using your EmailJS service and template (using the form element)
                emailjs.sendForm('service_o8bz2ep', 'template_aguzylc', this)
                    .then(function () {
                        if (contactFeedback) {
                            contactFeedback.style.display = 'none';
                        }
                        contactForm.reset();
                        showModal('Message sent — thank you!');
                    }, function (error) {
                        if (contactFeedback) {
                            contactFeedback.style.color = 'red';
                            contactFeedback.textContent = 'Send failed. Please try again later.';
                        }
                        console.error('EmailJS error:', error);
                    });
            });
        });



        // Modal helper functions and event handlers
        const successModal = document.getElementById('success-modal');
        const modalClose = document.getElementById('modal-close');
        const modalOk = document.getElementById('modal-ok');
        const modalMsg = document.getElementById('modal-msg');

        function showModal(msg) {
            if (modalMsg) modalMsg.textContent = msg || 'Message sent — thank you!';
            if (successModal) {
                successModal.style.display = 'flex';
                successModal.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
            }
        }

        function hideModal() {
            if (successModal) {
                successModal.style.display = 'none';
                successModal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
            }
        }

        if (modalClose) modalClose.addEventListener('click', hideModal);
        if (modalOk) modalOk.addEventListener('click', hideModal);

        // Close modal when clicking outside content
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) hideModal();
            });
        }

        // Close modal on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideModal();
        });
    }
});