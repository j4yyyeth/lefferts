// Import styles
import '../styles/main.scss';

// DOM ready utility
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function initMobileMenu() {
    const hamburger = document.querySelector(".hamburger");
    const mobileItems = document.querySelector(".mobile-items");
    
    if (hamburger && mobileItems) {
        hamburger.addEventListener("click", function () {
            const isActive = hamburger.classList.contains("is-active");
            
            if (isActive) {
                // Closing the menu
                mobileItems.classList.add("closing");
                
                // Remove the closing class after animation completes
                setTimeout(() => {
                    hamburger.classList.remove("is-active");
                    mobileItems.classList.remove("closing");
                }, 350); // Adjust timing to match CSS animation
                
            } else {
                // Opening the menu
                hamburger.classList.add("is-active");
                mobileItems.classList.remove("closing");
            }
        });
    }
}

// Show more articles functionality
function initShowArticles() {
    const show = document.querySelector(".show-articles");
    const imgs = document.querySelectorAll(".press-post");
    
    if (show) {
        show.addEventListener("click", () => {
            for (let i = 0; i < imgs.length; i++) {
                imgs[i].classList.add("show");
            }
            show.classList.add("hide");
        });
    }
}

// Hero scroll effects (works on navigation back to homepage)
function initHeroScrollEffects() {
    const hero = document.querySelector(".hero-section");
    const mainMenu = document.querySelector(".home-menu");
    
    if (!hero || !mainMenu) return;
    
    // Check if we're on homepage
    function isHomePage() {
        return window.location.pathname === "/" || window.location.pathname === "/index.html";
    }
    
    // Remove any existing scroll listener to prevent duplicates
    if (window.heroScrollHandler) {
        window.removeEventListener("scroll", window.heroScrollHandler);
        window.heroScrollHandler = null;
    }
    
    if (isHomePage()) {
        const scrollThreshold = 100;
        
        function checkScrollPosition() {
            if (window.scrollY > scrollThreshold) {
                hero.classList.add("z-index-hero");
                mainMenu.classList.add("white-bg");
            } else {
                hero.classList.remove("z-index-hero");
                mainMenu.classList.remove("white-bg");
            }
        }
        
        // Store the handler globally so we can remove it later
        window.heroScrollHandler = checkScrollPosition;
        
        // Add the scroll listener
        window.addEventListener("scroll", window.heroScrollHandler);
        
        // Also check initial position in case user is already scrolled
        checkScrollPosition();
    } else {
        // If not on homepage, make sure classes are removed
        hero.classList.remove("z-index-hero");
        mainMenu.classList.remove("white-bg");
    }
}

// Read more property info functionality
function initReadMore() {
    const readMoreBtn = document.querySelector(".read-more-property");
    
    if (readMoreBtn) {
        const paragraphs = document.querySelectorAll(".property-info p:not(:first-of-type)");
        
        readMoreBtn.addEventListener("click", function () {
            const isHidden = paragraphs[0].style.display === "none" || paragraphs[0].style.display === "";
            
            paragraphs.forEach((p) => {
                if (isHidden) {
                    p.style.display = "block";
                    setTimeout(() => {
                        p.style.opacity = "1";
                    }, 10);
                } else {
                    p.style.opacity = "0";
                    setTimeout(() => {
                        p.style.display = "none";
                    }, 150);
                }
            });
            
            readMoreBtn.textContent = isHidden ? "Read Less" : "Read More";
        });
    }
}

// Hide press posts functionality
function initHidePress() {
    const showLimit = 8;
    const pressPosts = document.querySelectorAll(".press-post");
    
    for (let i = showLimit; i < pressPosts.length; i++) {
        pressPosts[i].classList.add("press-post-hidden");
    }
    
    const loadMoreBtn = document.querySelector(".show-articles");
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            const hiddenPosts = document.querySelectorAll(".press-post-hidden");
            for (let i = 0; i < hiddenPosts.length; i++) {
                hiddenPosts[i].classList.remove("press-post-hidden");
            }
            if (document.querySelectorAll(".press-post-hidden").length === 0) {
                loadMoreBtn.classList.add("hide");
            }
        });
    }
}

// Gallery modal functionality - CLEAN VERSION
function initGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const closeBtn = document.querySelector('.close');
    
    // Exit if no modal found
    if (!modal || !galleryItems.length) return;
    
    console.log('Found', galleryItems.length, 'gallery items');
    
    // Clean up any existing modal slider
    if (window.modalGlide) {
        try {
            window.modalGlide.destroy();
        } catch (e) {
            console.log('Cleaned up previous modal slider');
        }
        window.modalGlide = null;
    }
    
    // Remove any existing event listeners by cloning elements
    galleryItems.forEach((item, index) => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Add fresh click listener
        newItem.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            const clickedIndex = parseInt(this.getAttribute('data-index')) || 0;
            console.log('Clicked gallery item index:', clickedIndex);
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Initialize modal slider
            setTimeout(() => {
                initModalSlider(clickedIndex);
            }, 150);
        });
    });
    
    // Close modal function
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        if (window.modalGlide) {
            try {
                window.modalGlide.destroy();
            } catch (e) {}
            window.modalGlide = null;
        }
    }
    
    // Close button listener
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    // Close on outside click
    modal.onclick = function (event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Close on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Initialize Glide sliders
function initGlideSliders() {
    // Check if Glide is available
    if (typeof Glide === 'undefined') {
        console.warn('Glide.js is not loaded. Sliders will not work.');
        return;
    }

    // Initialize gallery slider (mobile)
    const gallerySlider = document.querySelector('.glide-gallery');
    if (gallerySlider) {
        try {
            new Glide('.glide-gallery', {
                type: 'carousel',
                startAt: 0,
                perView: 1,
                gap: 0,
                autoplay: false,
                hoverpause: true,
                keyboard: true,
                swipeThreshold: 80,
                dragThreshold: 120
            }).mount();
        } catch (error) {
            console.error('Error initializing gallery slider:', error);
        }
    }

    // Initialize additional projects slider
    const projectsSlider = document.querySelector('.glide-posts');
    if (projectsSlider) {
        try {
            new Glide('.glide-posts', {
                type: 'carousel',
                startAt: 0,
                perView: 4,
                gap: 30,
                autoplay: false,
                hoverpause: true,
                keyboard: true,
                swipeThreshold: 80,
                dragThreshold: 120,
                breakpoints: {
                    1200: {
                        perView: 3
                    },
                    768: {
                        perView: 2
                    },
                    480: {
                        perView: 1
                    }
                }
            }).mount();
        } catch (error) {
            console.error('Error initializing projects slider:', error);
        }
    }
}

// Initialize modal slider - CLEAN VERSION
function initModalSlider(startIndex = 0) {
    if (typeof Glide === 'undefined') {
        console.warn('Glide not available for modal');
        return;
    }
    
    const modalSlider = document.querySelector('.glide-modal');
    if (!modalSlider) {
        console.warn('Modal slider element not found');
        return;
    }
    
    // Count slides
    const slides = modalSlider.querySelectorAll('.glide__slide');
    const validIndex = Math.max(0, Math.min(startIndex, slides.length - 1));
    
    console.log('Modal: Starting at slide', validIndex, 'of', slides.length);
    
    // Destroy any existing instance
    if (window.modalGlide) {
        try {
            window.modalGlide.destroy();
        } catch (e) {}
        window.modalGlide = null;
    }
    
    try {
        window.modalGlide = new Glide('.glide-modal', {
            type: 'carousel',
            startAt: validIndex,
            perView: 1,
            gap: 0,
            autoplay: false,
            keyboard: true,
            rewind: true,
            animationDuration: 300
        }).mount();
        
        console.log('Modal slider initialized successfully at index:', validIndex);
    } catch (error) {
        console.error('Modal slider initialization error:', error);
    }
}

// Animated numbers functionality
class CountUp {
    constructor(el) {
        this.el = el;
        this.setVars();
        this.init();
    }

    setVars() {
        this.number = this.el.querySelectorAll("[data-countup-number]");
        this.observerOptions = {
            root: null,
            rootMargin: "0px 0px",
            threshold: 0,
        };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const end = parseFloat(entry.target.dataset.countupNumber.replace(/,/g, ""));
                const decimals = this.countDecimals(end);
                if (entry.isIntersecting) {
                    this.iterateValue(entry.target, end, decimals);
                }
            });
        }, this.observerOptions);
    }

    init() {
        if (this.number.length > 0) {
            this.number.forEach((el) => {
                this.observer.observe(el);
            });
        }
    }

    iterateValue(el, end, decimals) {
        const start = 0;
        const duration = 4500;
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsedPercent = (timestamp - startTimestamp) / duration;
            const easedProgress = Math.min(this.easeOutQuint(elapsedPercent), 1);
            let interimNumber = Math.abs(easedProgress * (end - start) + start);
            el.innerHTML = this.formatNumber(interimNumber, decimals);
            if (easedProgress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    easeOutQuad(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    easeOutQuint(x) {
        return 1 - Math.pow(1 - x, 5);
    }

    countDecimals(val) {
        if (Math.floor(val) === val) return 0;
        return val.toString().split(".")[1].length || 0;
    }

    formatNumber(val, decimals) {
        return val.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    }
}

function initCountUp() {
    const dataModules = [...document.querySelectorAll('[data-module="countup"]')];
    dataModules.forEach((element) => {
        new CountUp(element);
    });
}

// Smooth scroll for arrow
function initSmoothScroll() {
    const arrowAnchor = document.querySelector(".arrow .down-arrow");
    
    if (arrowAnchor) {
        arrowAnchor.addEventListener("click", function (event) {
            event.preventDefault();
            const targetId = arrowAnchor.getAttribute("href")?.substring(1);
            const targetElement = targetId ? document.getElementById(targetId) : null;
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth",
                });
            }
        });
    }
}

// Newsletter form functionality
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            
            // Here you would typically send the email to your backend
            console.log('Newsletter signup:', email);
            
            // Show success message
            alert('Thank you for subscribing!');
            form.reset();
        });
    }
}

// Contact form functionality
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            // Here you would typically send the data to your backend
            console.log('Contact form submission:', data);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        });
    }
}

// Load Glide.js dynamically if not already loaded
function loadGlide() {
    return new Promise((resolve, reject) => {
        if (typeof Glide !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@glidejs/glide@3.6.0/dist/glide.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Glide.js'));
        document.head.appendChild(script);

        // Also load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@glidejs/glide@3.6.0/dist/css/glide.core.min.css';
        document.head.appendChild(link);
    });
}

// Re-initialize functionality after view transitions - FIXED TO INCLUDE HERO
function reinitializeAfterTransition() {
    initMobileMenu();
    initShowArticles();
    initHeroScrollEffects(); // ← THIS WAS MISSING!
    initReadMore();
    initHidePress();
    initCountUp();
    initSmoothScroll();
    initNewsletterForm();
    initContactForm();
    
    // Re-initialize sliders and gallery modal after a delay
    setTimeout(() => {
        initGlideSliders();
        initGalleryModal();
    }, 200);
}

// Initialize all functionality when DOM is ready
ready(async () => {
    try {
        // Load Glide.js first
        await loadGlide();
        
        // Initialize all functionality
        initMobileMenu();
        initShowArticles();
        initHeroScrollEffects();
        initReadMore();
        initHidePress();
        initCountUp();
        initSmoothScroll();
        initNewsletterForm();
        initContactForm();
        initGlideSliders();
        
        // Initialize gallery modal last
        setTimeout(() => {
            initGalleryModal();
        }, 100);
        
        // Listen for view transitions (if using Astro view transitions)
        document.addEventListener('astro:after-swap', reinitializeAfterTransition);
        
    } catch (error) {
        console.error('Error initializing application:', error);
        // Initialize everything except sliders if Glide fails to load
        initMobileMenu();
        initShowArticles();
        initHeroScrollEffects();
        initReadMore();
        initHidePress();
        initCountUp();
        initSmoothScroll();
        initNewsletterForm();
        initContactForm();
    }
});

// Make functions globally available for manual re-initialization
window.reinitializeSliders = initGlideSliders;
window.reinitializeGallery = initGalleryModal;