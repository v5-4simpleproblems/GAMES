/**
 * ban-enforcer.js (v4.4 - Fixed Z-Index Layering for Text/Button over Blur)
 *
 * This version specifically addresses the issue where the text and home button were
 * appearing behind the blur. It introduces a dedicated content container with a higher
 * z-index to ensure all interactive and informational elements are always on top
 * of the full-screen blurred background.
 *
 * --- FLOW ---
 * 1.  An invisible, full-screen shield is immediately deployed.
 * 2.  The page structure loads, and THEN scrolling is locked.
 * 3.  Firebase checks the user's login state and proceeds with the ban check or redirect.
 * 4.  If banned, a content container is placed over the blur for text and button.
 */

console.log("Debug: ban-enforcer.js v4.4 (Fixed Z-Index Layering) has started.");

// --- 1. Immediately create an invisible shield. ---
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
        zIndex: '2147483646', // High, but below where content will be
        backgroundColor: 'transparent',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease'
    });

    document.documentElement.appendChild(shield);
    console.log("Debug: Pre-emptive auth shield deployed.");
})();

/**
 * Helper function to remove the shield and restore scrolling for authorized users.
 * Also removes any ban content container if it was created.
 */
function removeAuthShield() {
    const shield = document.getElementById('auth-shield');
    if (shield) {
        shield.remove();
    }
    const contentContainer = document.getElementById('ban-content-container');
    if (contentContainer) {
        contentContainer.remove();
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    console.log("Debug: Auth shield and ban content removed. Page unlocked.");
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
        removeAuthShield(); // Attempt to remove the transparent shield so error is visible
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                if (doc.exists) {
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Activating ban screen.`);
                    showBanScreen(banData);
                } else {
                    console.log("Debug: User is logged in and not banned. Granting access.");
                    removeAuthShield();
                }
            }).catch(error => {
                console.error("Debug: An error occurred while checking ban status. Granting access as a failsafe.", error);
                removeAuthShield();
            });

        } else {
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
    const contentContainerId = 'ban-content-container'; // New ID for content container
    const homeButtonId = 'ban-enforcer-home-button';
    const messageBoxId = 'ban-enforcer-message';

    const enforceBanVisuals = () => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // --- 1. Ensure the main blur shield is present and visible ---
        let shield = document.getElementById(shieldId);
        if (shield) {
            Object.assign(shield.style, {
                backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)',
                webkitBackdropFilter: 'blur(14px)'
            });
        } else {
            // Re-create the main shield if it was removed
            console.warn("[Guard] Main auth shield was removed. Re-deploying...");
            shield = document.createElement('div');
            shield.id = shieldId;
            Object.assign(shield.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                zIndex: '2147483646', backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)'
            });
            document.documentElement.appendChild(shield);
        }

        // --- 2. Create/Re-create the content container that sits OVER the blur ---
        let contentContainer = document.getElementById(contentContainerId);
        if (!contentContainer) {
            console.warn("[Guard] Ban content container was missing. Re-creating...");
            contentContainer = document.createElement('div');
            contentContainer.id = contentContainerId;
            Object.assign(contentContainer.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '2147483647', // This is the highest z-index, ensuring content is on top
                pointerEvents: 'none' // Allow clicks to pass through if no specific elements handle them
            });
            document.body.appendChild(contentContainer);
        }

        // --- 3. Create/Re-create the Home Button inside the content container ---
        if (!document.getElementById(homeButtonId)) {
            const homeButton = document.createElement('a');
            homeButton.id = homeButtonId;
            homeButton.href = '../index.html';
            homeButton.innerHTML = `<i class="fa-solid fa-house"></i>`;
            Object.assign(homeButton.style, {
                position: 'absolute', // Positioned relative to contentContainer
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
                pointerEvents: 'auto' // Re-enable pointer events for the button itself
            });
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };
            contentContainer.appendChild(homeButton);
        }

        // --- 4. Create/Re-create the Message Box inside the content container ---
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
                position: 'absolute', // Positioned relative to contentContainer
                top: '40px',
                left: '40px',
                maxWidth: '600px',
                width: 'auto',
                textAlign: 'left',
                color: '#ffffff',
                fontFamily: "'PrimaryFont', Arial, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                pointerEvents: 'auto' // Re-enable pointer events for the message box itself
            });
            contentContainer.appendChild(messageBox);
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

    enforceBanVisuals();
    setInterval(enforceBanVisuals, 100);
}
