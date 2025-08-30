/**
 * ban-enforcer.js (v4.5 - Foolproof Stacking Context Fix)
 *
 * This version uses a new architecture to definitively solve the layering issue where
 * text and buttons would appear behind the blurred background. It now builds the entire
 * ban screen inside a single, top-level container, guaranteeing correct visual stacking.
 *
 * --- FLOW ---
 * 1.  A simple, invisible shield is immediately deployed to block interaction.
 * 2.  The page structure loads, and scrolling is locked.
 * 3.  Firebase checks the user's login state.
 * 4a. If BANNED -> The simple shield is removed and replaced by the permanent, multi-layer ban screen.
 * 4b. If NOT BANNED -> The simple shield is removed, granting access.
 * 4c. If LOGGED OUT -> The user is redirected.
 */

console.log("Debug: ban-enforcer.js v4.5 (Foolproof Stacking) has started.");

// --- 1. Immediately create a SIMPLE, invisible shield. ---
// Its only job is to block clicks until the auth check is complete.
(function() {
    if (document.getElementById('auth-shield-temporary')) return;

    const shield = document.createElement('div');
    shield.id = 'auth-shield-temporary';
    Object.assign(shield.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '2147483647',
        backgroundColor: 'transparent'
    });

    document.documentElement.appendChild(shield);
    console.log("Debug: Temporary auth shield deployed.");
})();

/**
 * Helper function to remove the temporary shield and restore scrolling.
 */
function removeTemporaryAuthShield() {
    const shield = document.getElementById('auth-shield-temporary');
    if (shield) {
        shield.remove();
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    console.log("Debug: Temporary auth shield removed.");
}

// --- 2. Wait for DOM to be ready, then lock scroll and check auth ---
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    console.log("Debug: DOMContentLoaded fired. Page scrolling locked.");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("FATAL ERROR: Firebase is not loaded correctly. Check script order in HTML.");
        document.body.innerHTML = `<h1 style="font-family: Arial, sans-serif; color: white; text-align: center; margin-top: 40px;">Fatal Error: Page cannot be loaded.</h1>`;
        document.body.style.visibility = 'visible';
        removeTemporaryAuthShield();
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                removeTemporaryAuthShield(); // Remove the simple shield in all logged-in cases
                if (doc.exists) {
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Activating permanent ban screen.`);
                    showBanScreen(banData); // Build the permanent, visible ban screen
                } else {
                    console.log("Debug: User is logged in and not banned. Granting access.");
                    // The shield is already removed, so we just need to unlock scrolling
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                }
            }).catch(error => {
                console.error("Debug: An error occurred while checking ban status. Granting access as a failsafe.", error);
                removeTemporaryAuthShield();
            });

        } else {
            console.log("Debug: No user is logged in. Redirecting to login page.");
            window.location.href = 'https://4simpleproblems.github.io/login.html';
        }
    });
});

/**
 * Creates the permanent, multi-layer ban screen and starts the persistence guard.
 */
function showBanScreen(banData) {
    const banContainerId = 'ban-enforcer-container';

    const enforceBanVisuals = () => {
        // This guard function ensures the complete ban screen cannot be removed by the user.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        if (!document.getElementById(banContainerId)) {
            console.warn("[Guard] Ban container not found. Rebuilding UI.");

            // --- 1. Create the Main Container ---
            // This holds all ban UI and sits on top of everything.
            const banContainer = document.createElement('div');
            banContainer.id = banContainerId;
            Object.assign(banContainer.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '2147483647'
            });

            // --- 2. Create the Shield (background) INSIDE the container ---
            const shield = document.createElement('div');
            Object.assign(shield.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)',
                webkitBackdropFilter: 'blur(14px)'
            });
            banContainer.appendChild(shield); // Appended first, so it's the bottom layer within the container

            // --- 3. Create the Home Button INSIDE the container ---
            const homeButton = document.createElement('a');
            homeButton.href = '../index.html';
            homeButton.innerHTML = `<i class="fa-solid fa-house"></i>`;
            Object.assign(homeButton.style, {
                position: 'absolute', // Positioned relative to the container
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
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'background-color 0.3s ease'
            });
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };
            banContainer.appendChild(homeButton); // Appended after shield, so it's on top

            // --- 4. Create the Message Box INSIDE the container ---
            const reason = banData.reason ? String(banData.reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No reason provided.';
            const banDate = banData.bannedAt && banData.bannedAt.toDate ? `on ${banData.bannedAt.toDate().toLocaleDateString()}` : '';
            const messageBox = document.createElement('div');
            messageBox.innerHTML = `
                <h1 style="font-size: 2.3em; color: #fc0324; margin: 0 0 10px 0; font-weight: bold;">Access Denied</h1>
                <p style="font-size: 1.1em; margin: 0 0 15px 0; line-height: 1.4; color: #e0e0e0;">Your account has been suspended from this service.</p>
                <p style="font-size: 1em; margin: 0 0 20px 0; color: #bdbdbd;"><strong>Reason:</strong> ${reason}</p>
                <p style="font-size: 0.8em; color: #9e9e9e;">This action was taken ${banDate}. If you believe this is an error, please contact 4simpleproblems+support@gmail.com</p>
            `;
            Object.assign(messageBox.style, {
                position: 'absolute', // Positioned relative to the container
                top: '40px',
                left: '40px',
                maxWidth: '600px',
                width: 'auto',
                textAlign: 'left',
                color: '#ffffff',
                fontFamily: "'PrimaryFont', Arial, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.7)'
            });
            banContainer.appendChild(messageBox); // Appended last, also on top

            // Finally, append the master container to the body
            document.body.appendChild(banContainer);
        }
    };

    // Inject stylesheets (only done once)
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

    enforceBanVisuals();
    setInterval(enforceBanVisuals, 100);
}
