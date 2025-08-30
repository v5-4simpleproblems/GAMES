/**
 * ban-enforcer.js (v4.3 - Fixed Initialization Crash)
 *
 * This version corrects a critical timing issue where the script tried to access the <body>
 * before it existed, causing a crash. The scroll lock is now correctly applied after the
 * DOM is ready, ensuring the script runs reliably.
 *
 * --- FLOW ---
 * 1.  An invisible, full-screen shield is immediately deployed.
 * 2.  The page structure loads, and THEN scrolling is locked.
 * 3.  Firebase checks the user's login state and proceeds with the ban check or redirect.
 */

console.log("Debug: ban-enforcer.js v4.3 (Fixed Initialization) has started.");

// --- 1. Immediately create an invisible shield. ---
// This part is safe because it only touches `documentElement` (the <html> tag), which always exists.
(function() {
    if (document.getElementById('auth-shield')) return;

    const shield = document.createElement('div');
    shield.id = 'auth-shield';
    Object.assign(shield.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '2147483646',
        backgroundColor: 'transparent',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease'
    });

    document.documentElement.appendChild(shield);
    console.log("Debug: Pre-emptive auth shield deployed.");
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

// --- 2. Wait for DOM to be ready, then lock scroll and check auth ---
document.addEventListener('DOMContentLoaded', () => {
    // NOW RUNS HERE: It is now safe to lock scrolling because the <body> exists.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    console.log("Debug: DOMContentLoaded fired. Page scrolling locked.");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("FATAL ERROR: Firebase is not loaded correctly. Check script order in HTML.");
        document.body.innerHTML = `<h1 style="font-family: Arial, sans-serif; color: white; text-align: center; margin-top: 40px;">Fatal Error: Page cannot be loaded.</h1>`;
        document.body.style.visibility = 'visible'; // Make body visible to show the error
        removeAuthShield(); // Remove the shield so the error is interactable if needed
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // --- USER IS LOGGED IN ---
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                if (doc.exists) {
                    // --- BANNED ---
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Activating ban screen.`);
                    showBanScreen(banData);
                } else {
                    // --- LOGGED IN AND NOT BANNED ---
                    console.log("Debug: User is logged in and not banned. Granting access.");
                    removeAuthShield();
                }
            }).catch(error => {
                console.error("Debug: An error occurred while checking ban status. Granting access as a failsafe.", error);
                removeAuthShield(); // Failsafe
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
 */
function showBanScreen(banData) {
    const shieldId = 'auth-shield';
    const homeButtonId = 'ban-enforcer-home-button';
    const messageBoxId = 'ban-enforcer-message';

    const enforceBanVisuals = () => {
        // This guard function ensures the ban screen cannot be removed by the user.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        const shield = document.getElementById(shieldId);
        if (shield) {
            shield.style.backgroundColor = 'rgba(10, 10, 10, 0.75)';
            shield.style.backdropFilter = 'blur(14px)';
            shield.style.webkitBackdropFilter = 'blur(14px)';
        } else {
            // If the shield is gone, re-create it immediately.
            console.warn("[Guard] Main auth shield was removed. Re-deploying...");
            const newShield = document.createElement('div');
            newShield.id = shieldId;
            Object.assign(newShield.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                zIndex: '2147483646', backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)'
            });
            document.documentElement.appendChild(newShield);
        }

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
