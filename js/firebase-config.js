// Firebase 설정 및 초기화

const firebaseConfig = {
    apiKey: "AIzaSyAj90_ggXV-t--fw_JqBhEtGxprBWft0Og",
    authDomain: "mind-map-9a6e6.firebaseapp.com",
    projectId: "mind-map-9a6e6",
    storageBucket: "mind-map-9a6e6.firebasestorage.app",
    messagingSenderId: "104722996265",
    appId: "1:104722996265:web:837ead441ae283919f1038",
    measurementId: "G-ZG85V8P099"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
