/**
 * ban-enforcer.js (v3.3 - UI Adjustments & Faster Interval)
 *
 * This script enforces website bans using a "check-first, block-later" approach.
 * If a user is confirmed to be banned, it deploys a persistent, full-screen
 * overlay with an optimized guard that instantly rebuilds the UI if tampered with.
 *
 * Visuals:
 * - Full-screen blur shield, updated every 100ms.
 * - Home button fixed to the top-right, linking to the login page.
 * - Ban message fixed to the top-left.
 *
 * IMPORTANT:
 * 1. This script must be placed AFTER the Firebase SDK scripts in your HTML.
 * 2. It should be included on EVERY page you want to protect.
 */

console.log("Debug: ban-enforcer.js v3.3 (UI Adjustments) has started.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("Debug: DOMContentLoaded event fired. Ban enforcer is running.");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("FATAL ERROR: Firebase is not loaded correctly. Check the script order. Ban enforcement is disabled.");
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                if (doc.exists) {
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Reason: ${banData.reason}. Deploying ban screen.`);
                    showBanScreen(banData);
                } else {
                    console.log("Debug: User is not banned. Page operation is normal.");
                }
            }).catch(error => {
                console.error("Debug: An error occurred while checking ban status. Allowing page access as a failsafe.", error);
            });
        } else {
            console.log("Debug: No user is logged in. Page operation is normal.");
        }
    });
});

/**
 * Manages the creation and persistent enforcement of the ban screen UI.
 * @param {object} banData - The data from the user's document in the 'bans' collection.
 */
function showBanScreen(banData) {
    const containerId = 'ban-enforcer-container';

    // This function runs on an interval to ensure the ban screen cannot be removed.
    const enforceBanVisuals = () => {
        // First, always ensure scrolling is locked.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Check if the main container exists. If not, the UI has been tampered with.
        if (!document.getElementById(containerId)) {
            console.warn("[Guard] Ban UI not found. Rebuilding now.");

            // Create the main container that will hold all UI elements.
            const banContainer = document.createElement('div');
            banContainer.id = containerId;

            // --- 1. Create the Shield (background blur) ---
            const shield = document.createElement('div');
            Object.assign(shield.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)',
                webkitBackdropFilter: 'blur(14px)',
                zIndex: '2147483646'
            });
            
            // --- 2. Create the Home Button (top-right) ---
            const homeButton = document.createElement('a');
            // MODIFIED: Updated the href to the login page.
            homeButton.href = 'https://4simpleproblems.github.io/login.html';
            homeButton.innerHTML = `<i class="fa-solid fa-house"></i>`;
            Object.assign(homeButton.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                webkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'background-color 0.3s ease',
                zIndex: '2147483647'
            });
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };

            // --- 3. Create the Message Box (top-left) ---
            const reason = banData.reason ? String(banData.reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No reason provided.';
            const banDate = banData.bannedAt && banData.bannedAt.toDate ? `on ${banData.bannedAt.toDate().toLocaleDateString()}` : '';
            
            const messageBox = document.createElement('div');
            messageBox.innerHTML = `
                <h1 style="font-size: 2.3em; color: #fc0324; margin: 0 0 10px 0; font-weight: bold;">Access Denied</h1>
                <p style="font-size: 1.1em; margin: 0 0 15px 0; line-height: 1.4; color: #e0e0e0;">Your account has been suspended from this service.</p>
                <p style="font-size: 1em; margin: 0 0 20px 0; color: #bdbdbd;"><strong>Reason:</strong> ${reason}</p>
                <p style="font-size: 0.8em; color: #9e9e9e;">This action was taken ${banDate}. If you believe this is an error, please contact 4simpleproblems+support@gmail.com</p>
            `;
            // MODIFIED: Updated styles for top-left positioning.
            Object.assign(messageBox.style, {
                position: 'fixed',
                top: '40px',
                left: '40px',
                maxWidth: '600px',
                width: 'auto',
                textAlign: 'left', // Text is aligned to the left
                color: '#ffffff',
                fontFamily: "'PrimaryFont', Arial, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                zIndex: '2147483647'
            });

            // Append all elements to the container, then the container to the body
            banContainer.appendChild(shield);
            banContainer.appendChild(homeButton);
            banContainer.appendChild(messageBox);
            document.body.appendChild(banContainer);
        }
    };

    // --- Inject Stylesheets (only needs to be done once) ---
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        document.head.appendChild(faLink);
    }
    if (!document.querySelector('style[data-font="primary"]')) {
        const fontStyle = document.createElement('style');
        fontStyle.setAttribute('data-font', 'primary');
        fontStyle.textContent = `
            @font-face {
                font-family: 'PrimaryFont';
                src: url('../fonts/primary.woff') format('woff');
                font-weight: normal;
                font-style: normal;
            }
        `;
        document.head.appendChild(fontStyle);
    }

    // Run the enforcement function once immediately, then start the interval guard.
    enforceBanVisuals();
    // MODIFIED: Updated the interval to 100ms for faster updates.
    setInterval(enforceBanVisuals, 10);
}
