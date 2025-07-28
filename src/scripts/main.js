// Import styles
import '../styles/main.scss';

// Global flag to track if animations have been initialized
let animationsInitialized = false;
let scrollTriggersCreated = new Set();

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
// FIXED Read more property info functionality
function initReadMore() {
    // Remove any existing event listeners first
    const existingReadMoreBtns = document.querySelectorAll('.read-more-property');
    existingReadMoreBtns.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Get fresh references
    const readMoreBtn = document.querySelector('.read-more-property');
    
    if (readMoreBtn) {
        console.log('Read More button found:', readMoreBtn);
        
        // Find the property-info container
        const propertyInfo = document.querySelector('.property-info');
        if (!propertyInfo) {
            console.log('Property info container not found');
            return;
        }
        
        // Only target paragraphs that are direct children of property-info (not in .details section)
        const directParagraphs = Array.from(propertyInfo.children).filter(child => 
            child.tagName === 'P' || (child.matches && child.matches('div') && child.innerHTML.includes('<p>'))
        );
        
        // If there's a div with content, get paragraphs from it
        let contentParagraphs = [];
        const contentDiv = propertyInfo.querySelector('div:not(.details)');
        if (contentDiv) {
            contentParagraphs = Array.from(contentDiv.querySelectorAll('p'));
        } else {
            // Fallback: get direct paragraph children
            contentParagraphs = Array.from(propertyInfo.children).filter(child => child.tagName === 'P');
        }
        
        console.log('Content paragraphs found:', contentParagraphs.length);
        
        // Get all paragraphs except the first one (only from content, not details)
        const hiddenParagraphs = contentParagraphs.slice(1);
        console.log('Hidden paragraphs found:', hiddenParagraphs.length);
        
        if (hiddenParagraphs.length === 0) {
            console.log('No hidden paragraphs found, hiding read more button');
            readMoreBtn.style.display = 'none';
            return;
        }
        
        // Set initial state - hide content paragraphs except the first
        hiddenParagraphs.forEach(p => {
            p.style.display = 'none';
            p.style.opacity = '0';
            p.style.transition = 'opacity 0.3s ease';
        });
        
        // Add event listener
        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Read More button clicked');
            
            // Check if paragraphs are currently hidden
            const isHidden = hiddenParagraphs[0].style.display === 'none';
            console.log('Currently hidden:', isHidden);
            
            if (isHidden) {
                // Show paragraphs
                hiddenParagraphs.forEach(p => {
                    p.style.display = 'block';
                    // Use setTimeout to ensure display change is applied before opacity
                    setTimeout(() => {
                        p.style.opacity = '1';
                    }, 10);
                });
                readMoreBtn.textContent = 'Read Less';
            } else {
                // Hide paragraphs
                hiddenParagraphs.forEach(p => {
                    p.style.opacity = '0';
                    setTimeout(() => {
                        p.style.display = 'none';
                    }, 300); // Match transition duration
                });
                readMoreBtn.textContent = 'Read More';
            }
        });
        
        console.log('Read More functionality initialized successfully');
    } else {
        console.log('Read More button not found');
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

// Video initialization and management
function initVideoHandling() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Force video properties for Safari
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        // Add event listeners for better control
        video.addEventListener('loadedmetadata', () => {
            // Ensure video can play
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Video autoplay failed:', error);
                    // Fallback: try to play when user interacts
                    document.addEventListener('click', () => {
                        video.play().catch(e => console.log('Manual play failed:', e));
                    }, { once: true });
                });
            }
        });

        // Handle video load errors
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
        });

        // Ensure video loops properly
        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.play().catch(e => console.log('Loop play failed:', e));
        });
    });
}

// Hero video specific handling
function initHeroVideo() {
    const heroVideo = document.querySelector('.hero-vid video');
    
    if (heroVideo) {
        console.log('Initializing hero video');
        
        // Reset video state
        heroVideo.currentTime = 0;
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.autoplay = true;
        heroVideo.loop = true;
        
        // Force load the video
        heroVideo.load();
        
        // Try to play when ready
        const attemptPlay = () => {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Hero video playing successfully');
                    })
                    .catch(error => {
                        console.log('Hero video autoplay failed, will try on interaction:', error);
                        
                        // Fallback: play on any user interaction
                        const playOnInteraction = () => {
                            heroVideo.play()
                                .then(() => {
                                    console.log('Hero video started on user interaction');
                                    document.removeEventListener('click', playOnInteraction);
                                    document.removeEventListener('touchstart', playOnInteraction);
                                })
                                .catch(e => console.log('Manual hero video play failed:', e));
                        };
                        
                        document.addEventListener('click', playOnInteraction, { once: true });
                        document.addEventListener('touchstart', playOnInteraction, { once: true });
                    });
            }
        };

        // Wait for video to be ready
        if (heroVideo.readyState >= 3) {
            // Video is ready
            attemptPlay();
        } else {
            // Wait for video to load
            heroVideo.addEventListener('canplay', attemptPlay, { once: true });
            heroVideo.addEventListener('loadeddata', attemptPlay, { once: true });
        }
    }
}

// Enhanced view transition handling
function handleViewTransitionVideos() {
    // Force reinitialize videos after view transition
    setTimeout(() => {
        initVideoHandling();
        initHeroVideo();
    }, 100);
    
    // Additional delay for Safari
    setTimeout(() => {
        const heroVideo = document.querySelector('.hero-vid video');
        if (heroVideo && heroVideo.paused) {
            console.log('Hero video still paused, attempting restart');
            heroVideo.currentTime = 0;
            heroVideo.play().catch(e => console.log('Delayed play attempt failed:', e));
        }
    }, 500);
}

// Page visibility handling (Safari specific)
function handlePageVisibility() {
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible again
            setTimeout(() => {
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    if (video.paused) {
                        video.play().catch(e => console.log('Visibility play failed:', e));
                    }
                });
            }, 200);
        }
    });
}

// Safari-specific fixes
function applySafariFixes() {
    // Check if Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
        console.log('Safari detected, applying video fixes');
        
        // Force video attributes in Safari
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.setAttribute('webkit-playsinline', 'true');
            video.setAttribute('playsinline', 'true');
            video.setAttribute('muted', 'true');
            video.setAttribute('autoplay', 'true');
            
            // Safari sometimes needs explicit width/height
            if (!video.style.width) {
                video.style.width = '100%';
                video.style.height = '100%';
            }
        });
    }
}

// Gallery modal functionality - FIXED VERSION with better debugging
// Gallery modal functionality - FIXED VERSION with Safari check
function initGalleryModal() {
    console.log('=== Starting initGalleryModal ===');
    
    // Skip if Safari browser (PropertyDetail handles Safari separately)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        console.log('Safari detected: Skipping main.js gallery modal initialization');
        return;
    }
    
    const modal = document.getElementById('galleryModal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const closeBtn = document.querySelector('.close');
    
    console.log('Modal found:', !!modal);
    console.log('Gallery items found:', galleryItems.length);
    console.log('Close button found:', !!closeBtn);
    
    // Exit if no modal found
    if (!modal) {
        console.log('❌ No modal found with ID galleryModal');
        return;
    }
    
    if (!galleryItems.length) {
        console.log('❌ No gallery items found');
        return;
    }
    
    console.log('✅ Found', galleryItems.length, 'gallery items');
    
    // DEBUG: Check current modal HTML structure before any changes
    const existingSlides = modal.querySelectorAll('.glide__slide');
    console.log('🔍 BEFORE CLEANUP - Existing slides in modal:', existingSlides.length);
    existingSlides.forEach((slide, index) => {
        console.log(`  Existing slide ${index}:`, slide.innerHTML.substring(0, 50) + '...');
    });
    
    // Clean up any existing modal slider FIRST
    if (window.modalGlide) {
        try {
            window.modalGlide.destroy();
            console.log('Destroyed existing modal slider');
        } catch (e) {
            console.log('Error destroying modal slider:', e);
        }
        window.modalGlide = null;
    }
    
    // IMPORTANT: Update modal slides for current page (needed for transition:persist)
    const modalSlidesContainer = modal.querySelector('.glide__slides');
    if (modalSlidesContainer) {
        console.log('🧹 Updating modal slides for current page...');
        modalSlidesContainer.innerHTML = '';
        
        // Rebuild slides from current page gallery items
        console.log('🔨 Rebuilding modal slides...');
        galleryItems.forEach((item, index) => {
            const slide = document.createElement('li');
            slide.className = 'glide__slide';
            
            if (item.tagName === 'IMG') {
                const img = document.createElement('img');
                img.className = 'modal-media';
                img.src = item.src;
                img.alt = item.alt || `Gallery image ${index + 1}`;
                img.style.maxWidth = '90vw';
                img.style.maxHeight = '90vh';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
                slide.appendChild(img);
            } else if (item.tagName === 'DIV' && item.querySelector('video')) {
                const video = item.querySelector('video');
                const modalVideo = document.createElement('video');
                modalVideo.className = 'modal-media';
                modalVideo.setAttribute('playsinline', '');
                modalVideo.setAttribute('controls', '');
                modalVideo.style.maxWidth = '90vw';
                modalVideo.style.maxHeight = '90vh';
                modalVideo.style.objectFit = 'contain';
                modalVideo.style.display = 'block';
                
                // Copy video sources
                const sources = video.querySelectorAll('source');
                sources.forEach(source => {
                    const newSource = document.createElement('source');
                    newSource.src = source.src;
                    newSource.type = source.type;
                    modalVideo.appendChild(newSource);
                });
                
                slide.appendChild(modalVideo);
            } else if (item.tagName === 'DIV' && item.querySelector('img')) {
                // Handle DIVs that contain images (Safari replacement case)
                const img = item.querySelector('img');
                const modalImg = document.createElement('img');
                modalImg.className = 'modal-media';
                modalImg.src = img.src;
                modalImg.alt = img.alt || `Gallery image ${index + 1}`;
                modalImg.style.maxWidth = '90vw';
                modalImg.style.maxHeight = '90vh';
                modalImg.style.objectFit = 'contain';
                modalImg.style.display = 'block';
                slide.appendChild(modalImg);
            }
            
            modalSlidesContainer.appendChild(slide);
            console.log(`  Created slide ${index} for ${item.tagName}`);
        });
        
        console.log(`✅ Rebuilt ${galleryItems.length} modal slides`);
        
        // Verify slides were created properly
        const newSlides = modal.querySelectorAll('.glide__slide');
        console.log(`🔍 Verification: ${newSlides.length} slides now in modal`);
    }
    
    // Log each gallery item's details
    galleryItems.forEach((item, index) => {
        console.log(`Gallery item ${index}:`, {
            tagName: item.tagName,
            classes: item.className,
            dataIndex: item.getAttribute('data-index'),
            src: item.src || (item.querySelector('video') ? 'video element' : 'no src')
        });
    });
    
    // Clean up any existing modal slider
    if (window.modalGlide) {
        try {
            window.modalGlide.destroy();
            console.log('Destroyed existing modal slider');
        } catch (e) {
            console.log('Error destroying modal slider:', e);
        }
        window.modalGlide = null;
    }
    
    // Remove any existing event listeners by cloning elements
    galleryItems.forEach((item, index) => {
        console.log(`Processing gallery item ${index}:`, item.tagName);
        
        // Clone the element to remove existing event listeners
        const newItem = item.cloneNode(true);
        const parent = item.parentNode;
        parent.replaceChild(newItem, item);
        
        console.log(`Adding click listener to gallery item ${index} (${newItem.tagName})`);
        
        // Add fresh click listener using addEventListener instead of direct assignment
        newItem.addEventListener('click', function (event) {
            console.log(`🖱️ Gallery item ${index} clicked! (${this.tagName})`);
            event.preventDefault();
            event.stopPropagation();
            
            const clickedIndex = parseInt(this.getAttribute('data-index')) || 0;
            console.log('Clicked gallery item index:', clickedIndex);
            console.log('Modal display before:', modal.style.display);
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            console.log('Modal display after:', modal.style.display);
            console.log('About to initialize modal slider...');
            
            // Initialize modal slider
            setTimeout(() => {
                initModalSlider(clickedIndex);
            }, 50);
        });
        
        // Verify the event listener was added
        console.log(`Event listener added to item ${index}:`, newItem._events || 'no _events property');
    });
    
    // Close modal function
    function closeModal() {
        console.log('Closing modal');
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
        console.log('Close button listener attached');
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
    
    console.log('✅ Gallery modal initialized successfully');
    console.log('=== End initGalleryModal ===');
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

// Initialize modal slider - FIXED VERSION with detailed debugging
function initModalSlider(startIndex = 0) {
    console.log('🎠 === MODAL SLIDER INITIALIZATION ===');
    console.log('Initializing modal slider at index:', startIndex);
    
    if (typeof Glide === 'undefined') {
        console.warn('❌ Glide not available for modal');
        return;
    }
    
    const modalSlider = document.querySelector('.glide-modal');
    if (!modalSlider) {
        console.warn('❌ Modal slider element not found');
        return;
    }
    
    console.log('✅ Modal slider element found:', modalSlider);
    
    // Count slides and examine their content
    const slides = modalSlider.querySelectorAll('.glide__slide');
    console.log(`📊 Found ${slides.length} slides in modal`);
    
    // Debug each slide
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        const video = slide.querySelector('video');
        console.log(`Slide ${index}:`, {
            element: slide,
            hasImg: !!img,
            hasVideo: !!video,
            imgSrc: img ? img.src : 'no img',
            videoSrc: video ? video.src : 'no video',
            slideVisible: slide.style.display !== 'none',
            slideOpacity: window.getComputedStyle(slide).opacity,
            slideHTML: slide.innerHTML.substring(0, 200) + '...'
        });
    });
    
    if (slides.length === 0) {
        console.warn('❌ No slides found in modal');
        return;
    }
    
    const validIndex = Math.max(0, Math.min(startIndex, slides.length - 1));
    
    console.log('🎯 Modal: Starting at slide', validIndex, 'of', slides.length);
    
    // Check modal container structure
    const track = modalSlider.querySelector('.glide__track');
    const slidesContainer = modalSlider.querySelector('.glide__slides');
    console.log('Modal structure check:', {
        hasTrack: !!track,
        hasSlidesContainer: !!slidesContainer,
        trackDisplay: track ? window.getComputedStyle(track).display : 'no track',
        slidesDisplay: slidesContainer ? window.getComputedStyle(slidesContainer).display : 'no slides container'
    });
    
    // Destroy any existing instance
    if (window.modalGlide) {
        try {
            window.modalGlide.destroy();
            console.log('🗑️ Destroyed existing modal Glide instance');
        } catch (e) {
            console.log('⚠️ Error destroying modal Glide:', e);
        }
        window.modalGlide = null;
    }
    
    try {
        console.log('🚀 Creating new Glide instance...');
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
        
        console.log('✅ Modal slider initialized successfully at index:', validIndex);
        
        // Debug the active slide after initialization
        setTimeout(() => {
            const activeSlide = modalSlider.querySelector('.glide__slide--active');
            const currentSlides = modalSlider.querySelectorAll('.glide__slide');
            console.log('🔍 After initialization:', {
                activeSlide: activeSlide,
                totalSlides: currentSlides.length,
                activeSlideIndex: activeSlide ? Array.from(currentSlides).indexOf(activeSlide) : 'none',
                activeSlideContent: activeSlide ? activeSlide.innerHTML.substring(0, 100) + '...' : 'none'
            });
            
            // Check if the modal is actually visible
            const modal = document.getElementById('galleryModal');
            const modalStyles = window.getComputedStyle(modal);
            console.log('👁️ Modal visibility check:', {
                display: modalStyles.display,
                visibility: modalStyles.visibility,
                opacity: modalStyles.opacity,
                zIndex: modalStyles.zIndex,
                position: modalStyles.position
            });
        }, 100);
        
    } catch (error) {
        console.error('❌ Modal slider initialization error:', error);
    }
    
    console.log('🎠 === END MODAL SLIDER INITIALIZATION ===');
}

// Handle images sidebar layout
function handleImagesSidebarLayout() {
    const imagesSidebars = document.querySelectorAll('.images-sidebar');

    imagesSidebars.forEach((sidebar) => {
        const directImages = sidebar.querySelectorAll(':scope > img');

        if (directImages.length < 3) {
            sidebar.style.gridTemplateColumns = 'none';
        } else {
            sidebar.style.gridTemplateColumns = ''; // Reset to CSS default
        }
    });
}

// Animated numbers functionality with single-fire protection
// Fixed CountUp class that preserves CSS pseudo-elements
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
                // Check if this number has already been animated
                if (entry.target.dataset.countupAnimated === 'true') {
                    return;
                }
                
                const end = parseFloat(entry.target.dataset.countupNumber.replace(/,/g, ""));
                const decimals = this.countDecimals(end);
                if (entry.isIntersecting) {
                    // Mark as animated to prevent re-animation
                    entry.target.dataset.countupAnimated = 'true';
                    this.iterateValue(entry.target, end, decimals);
                    
                    // Unobserve the element since we only want to animate once
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
    }

    init() {
        if (this.number.length > 0) {
            this.number.forEach((el) => {
                // Only observe elements that haven't been animated yet
                if (el.dataset.countupAnimated !== 'true') {
                    this.observer.observe(el);
                }
            });
        }
    }

    iterateValue(el, end, decimals) {
        const start = 0;
        const duration = 4500;
        let startTimestamp = null;

        // Store original content structure to preserve CSS styling
        const hasPrefix = el.classList.contains('mil'); // Has + prefix
        const hasSuffix = el.classList.contains('mil') || el.classList.contains('bil');

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsedPercent = (timestamp - startTimestamp) / duration;
            const easedProgress = Math.min(this.easeOutQuint(elapsedPercent), 1);
            let interimNumber = Math.abs(easedProgress * (end - start) + start);
            
            // Only update the text content, leave CSS pseudo-elements intact
            el.textContent = this.formatNumber(interimNumber, decimals);
            
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

    // Method to destroy the observer (for cleanup)
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Global storage for CountUp instances
let countUpInstances = [];

function initCountUp() {
    // Clean up existing instances first
    countUpInstances.forEach(instance => {
        if (instance && instance.destroy) {
            instance.destroy();
        }
    });
    countUpInstances = [];

    const dataModules = [...document.querySelectorAll('[data-module="countup"]')];
    dataModules.forEach((element) => {
        // Check if this module has already been initialized
        if (element.dataset.countupInitialized !== 'true') {
            const instance = new CountUp(element);
            countUpInstances.push(instance);
            element.dataset.countupInitialized = 'true';
        }
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

// Load GSAP and ScrollTrigger
function loadGSAP() {
    return new Promise((resolve, reject) => {
        if (typeof gsap !== 'undefined') {
            resolve();
            return;
        }

        // Load GSAP core
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        gsapScript.onload = () => {
            // Load ScrollTrigger plugin
            const scrollTriggerScript = document.createElement('script');
            scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
            scrollTriggerScript.onload = () => {
                gsap.registerPlugin(ScrollTrigger);
                resolve();
            };
            scrollTriggerScript.onerror = () => reject(new Error('Failed to load ScrollTrigger'));
            document.head.appendChild(scrollTriggerScript);
        };
        gsapScript.onerror = () => reject(new Error('Failed to load GSAP'));
        document.head.appendChild(gsapScript);
    });
}

// Initialize all homepage animations with single-fire protection
function initHomepageAnimations() {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping animations');
        return;
    }

    // Only run animations on homepage
    const isHomePage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    if (!isHomePage) return;

    // Prevent multiple initializations
    if (animationsInitialized) {
        console.log('Animations already initialized, skipping');
        return;
    }

    console.log('Initializing animations for the first time');

    // Clear any existing ScrollTriggers to prevent duplicates
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    scrollTriggersCreated.clear();

    // 1. Hero Section Animations
    animateHero();
    // 2. Heading Text Animation
    animateHeadingText();
    // 3. Stats Animation (with existing number counter)
    animateStats();
    // 4. Featured Properties Animation
    animateFeaturedProperties();
    // 5. Textbox Animations
    animateTextboxes();

    // Mark animations as initialized
    animationsInitialized = true;

    // Refresh ScrollTrigger after all animations are set up
    ScrollTrigger.refresh();
}

// Hero Section Animation with single-fire protection
function animateHero() {
    const heroContent = document.querySelector('.hero-content h1');
    const heroArrow = document.querySelector('.arrow');
    
    if (!heroContent) return;

    // Check if this element has already been animated
    if (heroContent.dataset.animated === 'true') {
        console.log('Hero already animated, skipping');
        return;
    }

    // Set initial states
    gsap.set(heroContent, {
        opacity: 0,
        y: 50,
        scale: 0.9,
    });
    
    if (heroArrow) {
        gsap.set(heroArrow, {
            opacity: 0,
            y: 30,
        });
    }

    // Create timeline for hero animations
    const heroTl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
            // Mark as animated to prevent re-animation
            heroContent.dataset.animated = 'true';
            if (heroArrow) heroArrow.dataset.animated = 'true';
        }
    });

    // Animate hero text
    heroTl.to(heroContent, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
    });

    // Animate arrow
    if (heroArrow) {
        heroTl.to(heroArrow, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.5');
    }
}

function animateHeadingText() {
    const headingText = document.querySelector('.heading-txt h2');
    
    if (!headingText) return;

    const triggerKey = 'heading-text';
    if (scrollTriggersCreated.has(triggerKey)) {
        console.log('Heading text ScrollTrigger already created, skipping');
        return;
    }

    gsap.set(headingText, {
        opacity: 0,
        y: 40,
    });

    gsap.to(headingText, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.heading-txt',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true,
            onToggle: self => {
                if (self.isActive) {
                    headingText.dataset.animated = 'true';
                }
            }
        },
    });

    scrollTriggersCreated.add(triggerKey);
}

function animateStats() {
    const statsContainer = document.querySelector('.stats');
    const statItems = document.querySelectorAll('.statistic');
    
    if (!statsContainer || !statItems.length) return;

    const triggerKey = 'stats-animation';
    if (scrollTriggersCreated.has(triggerKey)) {
        console.log('Stats ScrollTrigger already created, skipping');
        return;
    }

    if (statsContainer.dataset.animated === 'true') {
        console.log('Stats already animated, skipping');
        return;
    }

    statsContainer.dataset.animated = 'true';
    
    scrollTriggersCreated.add(triggerKey);
}

function animateFeaturedProperties() {
    const propertiesContainer = document.querySelector('.property-imgs');
    const propertyItems = document.querySelectorAll('.property-home');
    const propertyDivider = document.querySelector('.property-divider');
    
    if (!propertiesContainer || !propertyItems.length) return;

    const triggerKey = 'featured-properties';
    if (scrollTriggersCreated.has(triggerKey)) {
        console.log('Featured properties ScrollTrigger already created, skipping');
        return;
    }

    if (propertiesContainer.dataset.animated === 'true') {
        console.log('Featured properties already animated, skipping');
        return;
    }

    propertyItems.forEach((property, index) => {
        const img = property.querySelector('img');
        const text = property.querySelector('p');
        
        if (img) {
            gsap.set(img, {
                opacity: 0,
                scale: 1.1,
                y: 50,
            });
        }
        
        if (text) {
            gsap.set(text, {
                opacity: 0,
                y: 20,
            });
        }
    });

    if (propertyDivider) {
        gsap.set(propertyDivider, {
            opacity: 0,
            scaleY: 0,
        });
    }

    const propertiesTl = gsap.timeline({
        scrollTrigger: {
            trigger: propertiesContainer,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play none none none',
            once: true,
            onToggle: self => {
                if (self.isActive) {
                    propertiesContainer.dataset.animated = 'true';
                }
            }
        },
        onComplete: () => {
            propertiesContainer.dataset.animated = 'true';
        }
    });

    const firstProperty = propertyItems[0];
    if (firstProperty) {
        const firstImg = firstProperty.querySelector('img');
        const firstText = firstProperty.querySelector('p');
        
        if (firstImg) {
            propertiesTl.to(firstImg, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
            });
        }
        
        if (firstText) {
            propertiesTl.to(firstText, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.3');
        }
    }

    if (propertyDivider) {
        propertiesTl.to(propertyDivider, {
            opacity: 1,
            scaleY: 1,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.4');
    }

    const secondProperty = propertyItems[1];
    if (secondProperty) {
        const secondImg = secondProperty.querySelector('img');
        const secondText = secondProperty.querySelector('p');
        
        if (secondImg) {
            propertiesTl.to(secondImg, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
            }, '-=0.6');
        }
        
        if (secondText) {
            propertiesTl.to(secondText, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.3');
        }
    }

    scrollTriggersCreated.add(triggerKey);
}

// Textbox Animations with single-fire protection
function animateTextboxes() {
    const textboxes = document.querySelectorAll('.textbox');
    
    if (!textboxes.length) return;

    textboxes.forEach((textbox, index) => {
        const heading = textbox.querySelector('h3');
        const content = textbox.querySelector('.textbox-content');
        
        if (!heading || !content) return;

        const triggerKey = `textbox-${index}`;
        if (scrollTriggersCreated.has(triggerKey)) {
            console.log(`Textbox ${index} ScrollTrigger already created, skipping`);
            return;
        }

        // Check if already animated
        if (textbox.dataset.animated === 'true') {
            console.log(`Textbox ${index} already animated, skipping`);
            return;
        }

        // Set initial states
        gsap.set(heading, {
            opacity: 0,
            x: -50,
            y: 30,
        });
        
        gsap.set(content, {
            opacity: 0,
            x: 50,
            y: 30,
        });

        // Create timeline for each textbox
        const textboxTl = gsap.timeline({
            scrollTrigger: {
                trigger: textbox,
                start: 'top 75%',
                end: 'bottom 25%',
                toggleActions: 'play none none none',
                once: true, // Single fire
                onToggle: self => {
                    if (self.isActive) {
                        textbox.dataset.animated = 'true';
                    }
                }
            },
            onComplete: () => {
                textbox.dataset.animated = 'true';
            }
        });

        // Animate heading
        textboxTl.to(heading, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
        });

        // Animate content
        textboxTl.to(content, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.4');

        // Add subtle animation to content paragraphs
        const paragraphs = content.querySelectorAll('p, h4, ul');
        if (paragraphs.length) {
            gsap.set(paragraphs, {
                opacity: 0,
                y: 20,
            });
            
            textboxTl.to(paragraphs, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
            }, '-=0.2');
        }

        scrollTriggersCreated.add(triggerKey);
    });
}

// Reset animations function (for page transitions)
function resetAnimationsForNewPage() {
    
    // Reset global flag
    animationsInitialized = false;
    
    // Clear ScrollTrigger tracking
    scrollTriggersCreated.clear();
    
    // Kill all existing ScrollTriggers
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
    
    // Clean up CountUp instances
    countUpInstances.forEach(instance => {
        if (instance && instance.destroy) {
            instance.destroy();
        }
    });
    countUpInstances = [];
    
    // Remove animation data attributes
    const animatedElements = document.querySelectorAll('[data-animated="true"]');
    animatedElements.forEach(el => {
        el.removeAttribute('data-animated');
    });
    
    // Remove countup data attributes
    const countupElements = document.querySelectorAll('[data-countup-animated="true"]');
    countupElements.forEach(el => {
        el.removeAttribute('data-countup-animated');
    });
    
    const countupModules = document.querySelectorAll('[data-countup-initialized="true"]');
    countupModules.forEach(el => {
        el.removeAttribute('data-countup-initialized');
    });
}

// Function to reinitialize animations after page transitions
function reinitializeAnimations() {
    // Reset everything first
    resetAnimationsForNewPage();
    
    // Then reinitialize after a short delay
    setTimeout(() => {
        initHomepageAnimations();
    }, 100);
}

// Enhanced ready function that includes GSAP initialization with single-fire protection
async function initializeWithAnimations() {
    try {
        // Load GSAP first
        await loadGSAP();
        
        // Initialize animations only once
        initHomepageAnimations();
        
        console.log('GSAP animations initialized successfully');
    } catch (error) {
        console.error('Error loading GSAP:', error);
        console.log('Continuing without animations');
    }
}

// Updated reinitializeAfterTransition function with video handling and gallery modal fix
function reinitializeAfterTransition() {
    console.log('🔄 === REINITIALIZING AFTER TRANSITION ===');
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    initMobileMenu();
    initShowArticles();
    initHeroScrollEffects();
    initReadMore();
    initHidePress();
    initCountUp();
    initSmoothScroll();
    initNewsletterForm();
    initContactForm();
    
    // Video handling
    handleViewTransitionVideos();
    applySafariFixes();
    
    // Reset and reinitialize animations
    reinitializeAnimations();
    
    // Force a delay to ensure DOM is fully ready after transition
    setTimeout(() => {
        console.log('🕐 Running delayed initialization (300ms delay)...');
        
        // Check DOM state before initialization
        const modal = document.getElementById('galleryModal');
        const galleryItems = document.querySelectorAll('.gallery-item');
        const imagesSidebar = document.querySelector('.images-sidebar');
        
        console.log('DOM Check:', {
            modal: !!modal,
            galleryItems: galleryItems.length,
            imagesSidebar: !!imagesSidebar,
            modalClasses: modal ? modal.className : 'no modal',
            sidebarClasses: imagesSidebar ? imagesSidebar.className : 'no sidebar'
        });
        
        // Initialize gallery modal with extra delay
        console.log('🖼️ About to initialize gallery modal...');
        initGalleryModal();
        
        // Initialize sliders
        console.log('🎠 About to initialize sliders...');
        initGlideSliders();
        
        // Also call the images sidebar layout function
        console.log('📐 About to handle images sidebar layout...');
        handleImagesSidebarLayout();
        
        // Double-check gallery modal is working
        setTimeout(() => {
            const galleryItemsAfter = document.querySelectorAll('.gallery-item');
            console.log('🔍 Final check - Gallery items found:', galleryItemsAfter.length);
            if (galleryItemsAfter.length > 0) {
                console.log('First gallery item details:', {
                    tagName: galleryItemsAfter[0].tagName,
                    dataIndex: galleryItemsAfter[0].getAttribute('data-index'),
                    hasClickListener: galleryItemsAfter[0].onclick !== null,
                    classes: galleryItemsAfter[0].className
                });
                
                // DON'T test programmatic click - this was causing the modal to open automatically
                console.log('🔍 Gallery items are ready for manual clicking');
            }
            console.log('🔄 === REINITIALIZATION COMPLETE ===');
        }, 100);
        
    }, 300); // Increased delay
}

// Initialize all functionality when DOM is ready
ready(async () => {
    try {
        // Load Glide.js first
        await loadGlide();
        
        // Initialize all existing functionality
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
        
        // Initialize video handling
        initVideoHandling();
        initHeroVideo();
        applySafariFixes();
        handlePageVisibility();
        
        // Initialize gallery modal and images sidebar layout
        setTimeout(() => {
            initGalleryModal();
            handleImagesSidebarLayout();
        }, 100);
        
        // Initialize GSAP animations
        await initializeWithAnimations();
        
        // Listen for view transitions with enhanced video handling
        document.addEventListener('astro:after-swap', () => {
            console.log('🔄 astro:after-swap event fired');
            reinitializeAfterTransition();
        });
        
        // Additional Safari-specific event listeners
        document.addEventListener('astro:before-preparation', () => {
            console.log('🔄 astro:before-preparation event fired');
            // Pause videos before transition to avoid conflicts
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
            });
        });
        
        // Add more Astro lifecycle listeners for debugging
        document.addEventListener('astro:page-load', () => {
            console.log('🔄 astro:page-load event fired');
        });
        
        document.addEventListener('astro:before-swap', () => {
            console.log('🔄 astro:before-swap event fired');
        });
        
    } catch (error) {
        console.error('Error initializing application:', error);
        // Initialize everything except sliders and animations if libraries fail
        initMobileMenu();
        initShowArticles();
        initHeroScrollEffects();
        initReadMore();
        initHidePress();
        initCountUp();
        initSmoothScroll();
        initNewsletterForm();
        initContactForm();
        initVideoHandling();
        initHeroVideo();
        initGalleryModal();
        handleImagesSidebarLayout();
    }
});

// re init functions 
window.reinitializeSliders = initGlideSliders;
window.reinitializeGallery = initGalleryModal;
window.reinitializeAnimations = reinitializeAnimations;
window.initHomepageAnimations = initHomepageAnimations;
window.initVideoHandling = initVideoHandling;
window.initHeroVideo = initHeroVideo;
window.resetAnimationsForNewPage = resetAnimationsForNewPage;
window.handleImagesSidebarLayout = handleImagesSidebarLayout;