// Audio elements
const bgMusic = document.getElementById('bgMusic');
const personalAudio = document.getElementById('personalAudio');
const musicToggle = document.getElementById('musicToggle');
const audioPlayBtn = document.getElementById('audioPlayBtn');
const vinylRecord = document.getElementById('vinylRecord');

let isBgMusicPlaying = false;
let isPersonalAudioPlaying = false;

// ADJUSTABLE SETTINGS: Background music volume levels
const NORMAL_BG_VOLUME = 0.7;  // Normal volume (0.0 to 1.0) - Change this!
const LOWERED_BG_VOLUME = 0.2; // Volume when voice note plays - Change this!

// Set initial volume
bgMusic.volume = NORMAL_BG_VOLUME;

// Background music control (MP3 File)
function toggleBackgroundMusic() {
    if (isBgMusicPlaying) {
        bgMusic.pause();
        musicToggle.innerHTML = '🔇';
        musicToggle.classList.add('muted');
        isBgMusicPlaying = false;
        console.log('Background music paused');
    } else {
        bgMusic.play().catch(e => {
            console.log('Background music play failed:', e);
        });
        musicToggle.innerHTML = '🎵';
        musicToggle.classList.remove('muted');
        isBgMusicPlaying = true;
        console.log('Background music playing');
    }
}

// Auto-start background music
function tryAutoplayMusic() {
    bgMusic.play().then(() => {
        console.log('Background music auto-started successfully');
        musicToggle.innerHTML = '🎵';
        musicToggle.classList.remove('muted');
        isBgMusicPlaying = true;
    }).catch(e => {
        console.log('Autoplay failed, waiting for user interaction:', e);
        // Show a subtle notification that music can be enabled
        showMusicPrompt();
    });
}

function showMusicPrompt() {
    // Create a subtle notification
    const prompt = document.createElement('div');
    prompt.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(135deg, #4299e1, #3182ce);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1001;
        font-size: 14px;
        cursor: pointer;
        animation: slideIn 0.5s ease;
    `;
    prompt.innerHTML = '🎵 Click here to enable background music!';
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    prompt.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Force enable music
        if (!isBgMusicPlaying) {
            bgMusic.play().then(() => {
                musicToggle.innerHTML = '🎵';
                musicToggle.classList.remove('muted');
                isBgMusicPlaying = true;
                console.log('Background music started from prompt');
            }).catch(err => {
                console.log('Still failed:', err);
            });
        }
        prompt.remove();
        style.remove();
    };
    
    document.body.appendChild(prompt);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (prompt.parentNode) {
            prompt.remove();
            style.remove();
        }
    }, 8000);
}

// Personal audio control
function togglePersonalAudio() {
    if (isPersonalAudioPlaying) {
        personalAudio.pause();
        personalAudio.currentTime = 0;
        audioPlayBtn.innerHTML = '▶️';
        audioPlayBtn.classList.remove('playing');
        vinylRecord.classList.remove('playing');
        isPersonalAudioPlaying = false;
        
        console.log('Personal audio stopped');
        console.log('BG Music playing?', isBgMusicPlaying);
        
        // Restore background music to normal volume
        if (isBgMusicPlaying) {
            console.log('Fading BG music back to normal volume:', NORMAL_BG_VOLUME);
            fadeVolume(bgMusic, bgMusic.volume, NORMAL_BG_VOLUME, 500);
        }
    } else {
        console.log('Starting personal audio');
        console.log('BG Music currently playing?', isBgMusicPlaying);
        console.log('BG Music current volume:', bgMusic.volume);
        
        // Lower background music volume when personal audio plays
        // KEEP IT PLAYING - just lower the volume
        if (isBgMusicPlaying) {
            console.log('Fading BG music to low volume:', LOWERED_BG_VOLUME);
            fadeVolume(bgMusic, bgMusic.volume, LOWERED_BG_VOLUME, 500);
            // Make sure it's still playing
            if (bgMusic.paused) {
                console.log('BG music was paused, resuming...');
                bgMusic.play();
            }
        }
        
        personalAudio.play().catch(e => {
            console.log('Personal audio play failed:', e);
            alert('Audio file not found! Please add your voice message to assets folder.');
        });
        audioPlayBtn.innerHTML = '⏸️';
        audioPlayBtn.classList.add('playing');
        vinylRecord.classList.add('playing');
        isPersonalAudioPlaying = true;
    }
}

// Smooth volume fade function
function fadeVolume(audioElement, startVol, endVol, duration) {
    console.log(`Fading volume from ${startVol} to ${endVol} over ${duration}ms`);
    
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (endVol - startVol) / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = startVol + (volumeStep * currentStep);
        audioElement.volume = Math.max(0, Math.min(1, newVolume));
        
        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            audioElement.volume = endVol;
            console.log('Fade complete. Final volume:', audioElement.volume);
        }
    }, stepTime);
}

// Handle personal audio end
personalAudio.addEventListener('ended', function() {
    audioPlayBtn.innerHTML = '▶️';
    audioPlayBtn.classList.remove('playing');
    vinylRecord.classList.remove('playing');
    isPersonalAudioPlaying = false;
    
    console.log('Personal audio ended, restoring BG music volume');
    
    // Restore background music to normal volume
    if (isBgMusicPlaying) {
        fadeVolume(bgMusic, bgMusic.volume, NORMAL_BG_VOLUME, 500);
        // Make sure it's still playing
        if (bgMusic.paused) {
            console.log('BG music was paused, resuming...');
            bgMusic.play();
        }
    }
});

// Gallery functionality - AUTOMATIC SLIDESHOW
const photos = [
    'assets/photo1.jpeg',
    'assets/photo2.jpeg',
    'assets/photo3.jpeg', 
    'assets/photo4.jpeg',
    'assets/photo5.jpeg'
];
let currentPhotoIndex = 0;
let galleryInitialized = false;
let slideshowInterval = null;

// CHANGEABLE SETTING: Change slideshow speed here (in milliseconds)
const SLIDESHOW_SPEED = 3000; // 3000ms = 3 seconds

function updatePhotoDisplay() {
    const photoDisplay = document.getElementById('photoDisplay');
    const photoCounter = document.getElementById('photoCounter');
    
    if (!photoDisplay || !photoCounter) {
        console.log('Gallery elements not found');
        return;
    }
    
    console.log('Showing photo:', currentPhotoIndex + 1, '/', photos.length);
    
    // Update counter
    photoCounter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
    
    // Show loading state
    photoDisplay.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #4299e1;">
            <div style="font-size: 3rem;">⏳</div>
        </div>
    `;
    
    // Create new image
    const img = new Image();
    
    img.onload = function() {
        console.log('✓ Image loaded');
        photoDisplay.innerHTML = '';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 15px;
            animation: fadeIn 0.5s ease;
        `;
        photoDisplay.appendChild(img);
    };
    
    img.onerror = function() {
        console.log('✗ Image failed to load');
        photoDisplay.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
                <div style="font-size: 3rem;">📷</div>
                <div style="font-size: 0.8rem; margin-top: 10px;">Image not found</div>
            </div>
        `;
    };
    
    // Start loading
    img.src = photos[currentPhotoIndex];
}

function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updatePhotoDisplay();
}

function previousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    updatePhotoDisplay();
}

function startSlideshow() {
    console.log('Starting automatic slideshow, speed:', SLIDESHOW_SPEED + 'ms');
    
    // Clear any existing interval
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    
    // Start new interval
    slideshowInterval = setInterval(function() {
        nextPhoto();
    }, SLIDESHOW_SPEED);
}

function stopSlideshow() {
    console.log('Stopping slideshow');
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

// Initialize gallery when DOM is ready
function initializeGallery() {
    if (galleryInitialized) {
        console.log('Gallery already initialized');
        return;
    }
    
    console.log('Initializing gallery...');
    
    const photoDisplay = document.getElementById('photoDisplay');
    const photoCounter = document.getElementById('photoCounter');
    
    if (photoDisplay && photoCounter) {
        console.log('Gallery elements found, starting slideshow');
        updatePhotoDisplay();
        startSlideshow();
        galleryInitialized = true;
        console.log('✓ Gallery initialized with automatic slideshow');
    } else {
        console.log('Gallery elements not ready yet, retrying...');
        setTimeout(initializeGallery, 100);
    }
}

// Create floating hearts
function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '💙';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 3 + 3 + 's';
    document.getElementById('hearts').appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// Create hearts continuously
setInterval(createHeart, 300);

// Cake celebration
function celebrateCake() {
    const cake = document.querySelector('.birthday-cake');
    cake.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cake.style.transform = 'scale(1)';
    }, 200);
    
    // Create burst of hearts
    for(let i = 0; i < 10; i++) {
        setTimeout(createHeart, i * 50);
    }
}

// Affirmations carousel
let currentAffirmation = 0;
const affirmations = document.querySelectorAll('.affirmation');
const dots = document.querySelectorAll('.nav-dot');

function showAffirmation(index) {
    affirmations[currentAffirmation].classList.remove('active');
    dots[currentAffirmation].classList.remove('active');
    
    currentAffirmation = index;
    
    affirmations[currentAffirmation].classList.add('active');
    dots[currentAffirmation].classList.add('active');
}

// Auto-rotate affirmations
setInterval(() => {
    showAffirmation((currentAffirmation + 1) % affirmations.length);
}, 4000);

// Balloon pop
function popBalloon(balloon) {
    balloon.style.transform = 'scale(1.5)';
    balloon.style.opacity = '0';
    setTimeout(() => {
        balloon.style.transform = 'scale(1)';
        balloon.style.opacity = '1';
    }, 300);
}

// Hide scroll indicator after first scroll
window.addEventListener('scroll', function() {
    const indicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 100) {
        indicator.style.opacity = '0';
    }
});

// Enhanced scroll snap behavior - SIMPLIFIED (removed gallery protection)
let isScrolling = false;

window.addEventListener('wheel', function(e) {
    if (isScrolling) return;
    
    e.preventDefault();
    isScrolling = true;
    
    const sections = document.querySelectorAll('.section');
    const currentSection = Math.round(window.scrollY / window.innerHeight);
    
    if (e.deltaY > 0 && currentSection < sections.length - 1) {
        // Scroll down
        sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
    } else if (e.deltaY < 0 && currentSection > 0) {
        // Scroll up
        sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
    }
    
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
}, { passive: false });

// Handle touch scrolling for mobile
let touchStart = 0;
let touchEnd = 0;

window.addEventListener('touchstart', function(e) {
    touchStart = e.touches[0].clientY;
});

window.addEventListener('touchend', function(e) {
    if (isScrolling) return;
    
    touchEnd = e.changedTouches[0].clientY;
    const sections = document.querySelectorAll('.section');
    const currentSection = Math.round(window.scrollY / window.innerHeight);
    
    if (touchStart - touchEnd > 50 && currentSection < sections.length - 1) {
        // Swipe up (scroll down)
        isScrolling = true;
        sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 1000);
    } else if (touchEnd - touchStart > 50 && currentSection > 0) {
        // Swipe down (scroll up)
        isScrolling = true;
        sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 1000);
    }
});

// Smooth scrolling behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeGallery();
    
    // Try to autoplay background music after a short delay
    setTimeout(() => {
        tryAutoplayMusic();
    }, 500);
});

// Also try autoplay when page becomes visible (for mobile/tab switching)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !isBgMusicPlaying) {
        setTimeout(() => {
            tryAutoplayMusic();
        }, 100);
    }
});

// Fallback: Try to start music on ANY user interaction
let musicStarted = false;
function startMusicOnInteraction() {
    if (!musicStarted && !isBgMusicPlaying) {
        tryAutoplayMusic();
        musicStarted = true;
    }
}

// Listen for various user interactions
['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
    document.addEventListener(eventType, startMusicOnInteraction, { once: true, passive: true });
});