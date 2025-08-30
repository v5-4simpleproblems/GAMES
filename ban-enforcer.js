/**
 * ban-enforcer.js (v3.4 - Fixed Fullscreen Overlay & Direct Appending)
 *
 * This script enforces website bans using a "check-first, block-later" approach.
 * If a user is confirmed to be banned, it deploys a persistent, full-screen
 * overlay that correctly covers the entire viewport and instantly rebuilds if tampered with.
 *
 * Visuals:
 * - Guaranteed full-screen blur shield, updated every 100ms.
 * - Home button fixed to the top-right, linking to the index page.
 * - Ban message fixed to the top-left.
 *
 * IMPORTANT:
 * 1. This script must be placed AFTER the Firebase SDK scripts in your HTML.
 * 2. It should be included on EVERY page you want to protect.
 */

console.log("Debug: ban-enforcer.js v3.4 (Fixed Fullscreen Overlay) has started.");

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
    const shieldId = 'ban-enforcer-shield';
    const homeButtonId = 'ban-enforcer-home-button';
    const messageBoxId = 'ban-enforcer-message';

    // This function runs on an interval to ensure the ban screen cannot be removed.
    const enforceBanVisuals = () => {
        // Ensure scrolling is locked, always.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Check for existence of each element. If any are missing, rebuild all of them.
        if (!document.getElementById(shieldId) || !document.getElementById(homeButtonId) || !document.getElementById(messageBoxId)) {
            console.warn("[Guard] Ban UI element(s) not found. Rebuilding all UI.");

            // Remove any existing fragments to ensure a clean rebuild
            [shieldId, homeButtonId, messageBoxId].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });

            // --- 1. Create the Shield (background blur) ---
            const shield = document.createElement('div');
            shield.id = shieldId;
            Object.assign(shield.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)',
                webkitBackdropFilter: 'blur(14px)',
                zIndex: '2147483646' // Just below message/button
            });
            document.body.appendChild(shield); // Append directly to body

            // --- 2. Create the Home Button (top-right) ---
            const homeButton = document.createElement('a');
            homeButton.id = homeButtonId;
            homeButton.href = '../index.html'; // MODIFIED: Changed link to index.html
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
                zIndex: '2147483647' // On top
            });
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };
            document.body.appendChild(homeButton); // Append directly to body

            // --- 3. Create the Message Box (top-left) ---
            const reason = banData.reason ? String(banData.reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No reason provided.';
            const banDate = banData.bannedAt && banData.bannedAt.toDate ? `on ${banData.bannedAt.toDate().toLocaleDateString()}` : '';
            
            const messageBox = document.createElement('div');
            messageBox.id = messageBoxId;
            messageBox.innerHTML = `
                <h1 style="font-size: 2.3em; color: #fc0324; margin: 0 0 10px 0; font-weight: bold;">Access Denied</h1>
                <p style="font-size: 1.1em; margin: 0 0 15px 0; line-height: 1.4; color: #e0e0e0;">Your account has been suspended from this service.</p>
                <p style="font-size: 1em; margin: 0 0 20px 0; color: #bdbdbd;"><strong>Reason:</strong> ${reason}</p>
                <p style="font-size: 0.8em; color: #9e9e9e;">This action was taken ${banDate}. If you believe this is an error, please contact 4simpleproblems+support@gmail.com</p>
            `;
            Object.assign(messageBox.style, {
                position: 'fixed',
                top: '40px',
                left: '40px',
                maxWidth: '600px',
                width: 'auto',
                textAlign: 'left',
                color: '#ffffff',
                fontFamily: "'PrimaryFont', Arial, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                zIndex: '2147483647' // On top
            });
            document.body.appendChild(messageBox); // Append directly to body
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
    setInterval(enforceBanVisuals, 100);
}
