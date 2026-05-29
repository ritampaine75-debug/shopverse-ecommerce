const firebaseConfig = {
  apiKey: "AIzaSyCdOTC7i5OkYN9NbX96EZq9uvI6gNYxv1s",
  authDomain: "quiz-bro-d087d.firebaseapp.com",
  databaseURL: "https://quiz-bro-d087d-default-rtdb.firebaseio.com",
  projectId: "quiz-bro-d087d",
  storageBucket: "quiz-bro-d087d.firebasestorage.app",
  messagingSenderId: "79601755297",
  appId: "1:79601755297:web:65db46b5412852a1c4fce0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();
