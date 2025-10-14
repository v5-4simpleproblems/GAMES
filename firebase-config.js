// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyAZBKAckVa4IMvJGjcyndZx6Y1XD52lgro",
  authDomain: "project-zirconium.firebaseapp.com",
  projectId: "project-zirconium",
  storageBucket: "project-zirconium.firebasestorage.app",
  messagingSenderId: "1096564243475",
  appId: "1:1096564243475:web:6d0956a70125eeea1ad3e6",
  measurementId: "G-1D4F692C1Q"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the authentication service
const auth = firebase.auth();

// Get a reference to the Firestore service
const db = firebase.firestore();
