/**
 * ban-enforcer.js (v3.1 - Corrected Overlay & Optimized Logic)
 *
 * This script enforces website bans using a "check-first, block-later" approach to avoid
 * disrupting the user experience for non-banned users. If a user is confirmed to be banned,
 * it deploys a persistent, full-screen overlay with corrected layering and positioning.
 *
 * IMPORTANT:
 * 1. This script must be placed AFTER the Firebase SDK scripts in your HTML.
 * 2. It should be included on EVERY page you want to protect.
 */

console.log("Debug: ban-enforcer.js v3.1 (Optimized) has started.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("Debug: DOMContentLoaded event fired. Ban enforcer is running.");

    // Check for the Firebase library, which is a critical dependency.
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("FATAL ERROR: Firebase is not loaded correctly. Check the script order. Ban enforcement is disabled.");
        return;
    }

    // firebase.auth().onAuthStateChanged is the entry point.
    firebase.auth().onAuthStateChanged(user => {
        // If a user is logged in, check their ban status. Otherwise, do nothing.
        if (user) {
            console.log("Debug: User is logged in. Checking ban status for UID:", user.uid);
            const db = firebase.firestore();
            const banDocRef = db.collection('bans').doc(user.uid);

            banDocRef.get().then(doc => {
                // The ONLY time we take action is if the user's document exists in the 'bans' collection.
                if (doc.exists) {
                    const banData = doc.data();
                    console.warn(`User ${user.uid} is BANNED. Reason: ${banData.reason}. Deploying ban screen.`);
                    // Call the function to create the shield and display the ban message.
                    showBanScreen(banData);
                } else {
                    // User is logged in but not banned. Do nothing.
                    console.log("Debug: User is not banned. Page operation is normal.");
                }
            }).catch(error => {
                // If there's an error, we fail open (do nothing) to avoid locking out legitimate users.
                console.error("Debug: An error occurred while checking ban status. Allowing page access as a failsafe.", error);
            });
        } else {
            // No user is logged in. Do nothing.
            console.log("Debug: No user is logged in. Page operation is normal.");
        }
    });
});

/**
 * Creates and displays the ban screen, then starts the persistence guard.
 * This function is ONLY called for confirmed banned users.
 * @param {object} banData - The data from the user's document in the 'bans' collection.
 */
function showBanScreen(banData) {
    // Lock scrolling immediately, as we now know the user is banned.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const containerId = 'ban-enforcer-container';
    
    // This function contains the logic to create/update all visual ban elements.
    const enforceBanVisuals = () => {
        // Find or create the main container that will hold all ban UI.
        let banContainer = document.getElementById(containerId);
        if (!banContainer) {
            banContainer = document.createElement('div');
            banContainer.id = containerId;
            document.body.appendChild(banContainer);
        }

        // --- Sanitize data once to prevent potential HTML injection ---
        const reason = banData.reason ? String(banData.reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No reason provided.';
        const banDate = banData.bannedAt && banData.bannedAt.toDate ? `on ${banData.bannedAt.toDate().toLocaleDateString()}` : '';

        // FIX: The entire UI is now built inside the container to solve positioning issues.
        // The innerHTML is set here, creating a shield, message box, and home button as siblings.
        banContainer.innerHTML = `
            <div id="ban-enforcer-shield" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(10, 10, 10, 0.75); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); z-index: 2147483646;"></div>

            <a id="ban-enforcer-home-button" href="../index.html" style="position: fixed; top: 20px; right: 20px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; text-decoration: none; background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.2); transition: background-color 0.3s ease; z-index: 2147483647;">
                <i class="fa-solid fa-house"></i>
            </a>

            <div id="ban-enforcer-message" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 600px; width: 90%; text-align: center; color: #ffffff; font-family: 'PrimaryFont', Arial, sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.7); z-index: 2147483647;">
                <h1 style="font-size: 2.3em; color: #fc0324; margin: 0 0 10px 0; font-weight: bold;">Access Denied</h1>
                <p style="font-size: 1.1em; margin: 0 0 15px 0; line-height: 1.4; color: #e0e0e0;">Your account has been suspended from this service.</p>
                <p style="font-size: 1em; margin: 0 0 20px 0; color: #bdbdbd;"><strong>Reason:</strong> ${reason}</p>
                <p style="font-size: 0.8em; color: #9e9e9e;">This action was taken ${banDate}. If you believe this is an error, please contact 4simpleproblems+support@gmail.com</p>
            </div>
        `;

        // Add hover effects for the home button dynamically
        const homeButton = document.getElementById('ban-enforcer-home-button');
        if (homeButton) {
            homeButton.onmouseover = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; };
            homeButton.onmouseout = () => { homeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; };
        }
        
        // --- Ensure scrolling remains locked ---
        if (document.documentElement.style.overflow !== 'hidden') {
            document.documentElement.style.overflow = 'hidden';
            console.warn("Debug [Guard]: User tried to re-enable scrolling. Re-locking.");
        }
        if (document.body.style.overflow !== 'hidden') {
            document.body.style.overflow = 'hidden';
        }
    };

    // --- Inject Font Awesome for the home button icon ---
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        document.head.appendChild(faLink);
    }
    
    // --- Inject the custom font (if not already loaded globally) ---
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
    
    // Run the enforcement function for the first time.
    enforceBanVisuals();

    // Start the persistence guard interval to prevent tampering.
    setInterval(enforceBanVisuals, 250);
}
