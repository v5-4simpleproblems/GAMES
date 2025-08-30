/**
 * ban-enforcer.js (v4.0 - Block-First Authentication Model)
 *
 * This script enforces website bans and login requirements using a "block-first" model.
 * It immediately deploys an invisible shield to block all page interaction and scrolling.
 * It then checks the user's Firebase authentication and ban status to determine the outcome.
 *
 * --- FLOW ---
 * 1.  An invisible, full-screen shield is immediately deployed, and scrolling is locked.
 * 2.  Firebase checks the user's login state.
 * 3a. If LOGGED OUT -> User is immediately redirected to the login page.
 * 3b. If LOGGED IN -> Script checks the 'bans' collection in Firestore.
 * 4a. If BANNED -> The shield becomes the visible ban screen overlay.
 * 4b. If NOT BANNED -> The shield is removed, and page access is granted.
 *
 * IMPORTANT:
 * - This script must be placed AFTER the Firebase SDK scripts in your HTML.
 * - It should be included on EVERY page you want to protect.
 */

console.log("Debug: ban-enforcer.js v4.0 (Block-First Model) has started.");

// --- 1. Immediately create an invisible shield and lock scrolling ---
(function() {
    // Check if the shield already exists to prevent duplication.
    if (document.getElementById('auth-shield')) return;

    // Create the shield element
    const shield = document.createElement('div');
    shield.id = 'auth-shield';
    // Style the shield to be a full-screen, transparent overlay that blocks clicks.
    shield.style.position = 'fixed';
    shield.style.top = '0';
    shield.style.left = '0';
    shield.style.width = '100vw';
    shield.style.height = '100vh';
    shield.style.zIndex = '2147483646'; // High z-index to cover everything.
    shield.style.backgroundColor = 'transparent'; // Invisible by default.
    shield.style.transition = 'background-color 0.3s ease, backdrop-filter 0.3s ease'; // For smooth transition to ban screen

    // Append to the root <html> element to ensure it loads before the body is interactive.
    document.documentElement.appendChild(shield);

    // Immediately disable scrolling on the entire page.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    console.log("Debug: Pre-emptive auth shield deployed and page scrolling locked.");
})();

/**
 * Helper function to remove the shield and restore scrolling for authorized users.
 */
function removeAuthShield() {
    const shield = document.getElementById('auth-shield');
    if (shield) {
        shield.remove();
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    console.log("Debug: Auth shield removed and page unlocked for authorized user.");
}

// --- 2. Wait for DOM content to be loaded, then check authentication ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Debug: DOMContentLoaded event fired. Checking authentication and ban status.");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("FATAL ERROR: Firebase is not loaded correctly. Page will remain locked.");
        // We don't remove the shield here, as something is fundamentally broken.
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // --- USER IS LOGGED IN ---
            // Now, check if they are banned.
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                if (doc.exists) {
                    // --- BANNED ---
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Reason: ${banData.reason}. Activating ban screen.`);
                    showBanScreen(banData);
                } else {
                    // --- LOGGED IN AND NOT BANNED ---
                    console.log("Debug: User is logged in and not banned. Granting access.");
                    removeAuthShield();
                }
            }).catch(error => {
                console.error("Debug: An error occurred while checking ban status. Granting access as a failsafe.", error);
                removeAuthShield(); // Failsafe to prevent locking out users due to a DB error.
            });

        } else {
            // --- USER IS LOGGED OUT ---
            console.log("Debug: No user is logged in. Redirecting to login page.");
            window.location.href = 'https://4simpleproblems.github.io/login.html';
        }
    });
});

/**
 * Activates the ban screen UI and starts the persistence guard.
 * This function MODIFIES the existing auth-shield to become the visible ban screen.
 * @param {object} banData - The data from the user's document in the 'bans' collection.
 */
function showBanScreen(banData) {
    const shieldId = 'auth-shield'; // We are targeting the existing shield
    const homeButtonId = 'ban-enforcer-home-button';
    const messageBoxId = 'ban-enforcer-message';

    // This function runs on an interval to ensure the ban screen cannot be removed.
    const enforceBanVisuals = () => {
        // Ensure scrolling remains locked.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Find the main shield and make it visible.
        const shield = document.getElementById(shieldId);
        if (shield) {
            shield.style.backgroundColor = 'rgba(10, 10, 10, 0.75)';
            shield.style.backdropFilter = 'blur(14px)';
            shield.style.webkitBackdropFilter = 'blur(14px)';
        } else {
            // If the main shield is gone, something is very wrong. Re-run the IIFE logic.
            console.warn("[Guard] Main auth shield was removed. Re-deploying...");
            (function() { // Re-create the shield if it was forcefully removed
                if (document.getElementById('auth-shield')) return;
                const newShield = document.createElement('div');
                newShield.id = 'auth-shield';
                Object.assign(newShield.style, {
                    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                    zIndex: '2147483646', backgroundColor: 'rgba(10, 10, 10, 0.75)',
                    backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)'
                });
                document.documentElement.appendChild(newShield);
            })();
        }

        // Check for and create the Home Button if missing.
        if (!document.getElementById(homeButtonId)) {
            const homeButton = document.createElement('a');
            homeButton.id = homeButtonId;
            homeButton.href = '../index.html';
            homeButton.innerHTML = `<i class="fa-solid fa-house"></i>`;
            Object.assign(homeButton.style, {
                position: 'fixed', top: '20px', right: '20px', width: '45px', height: '45px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                color: 'white', textDecoration: 'none', backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'background-color 0.3s ease', zIndex: '2147483647'
            });
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };
            document.body.appendChild(homeButton);
        }

        // Check for and create the Message Box if missing.
        if (!document.getElementById(messageBoxId)) {
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
                position: 'fixed', top: '40px', left: '40px', maxWidth: '600px', width: 'auto',
                textAlign: 'left', color: '#ffffff', fontFamily: "'PrimaryFont', Arial, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.7)', zIndex: '2147483647'
            });
            document.body.appendChild(messageBox);
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
