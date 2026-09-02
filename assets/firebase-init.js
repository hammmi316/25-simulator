(function(){
  "use strict";
  var firebaseConfig = {
    apiKey: "AIzaSyDDeMHb14H5gssnJIOwPxmEpoQJZ_xvJD0",
    authDomain: "simulator-2e38a.firebaseapp.com",
    projectId: "simulator-2e38a",
    storageBucket: "simulator-2e38a.firebasestorage.app",
    messagingSenderId: "590791345723",
    appId: "1:590791345723:web:c074c9faf3526d996dfe1e"
  };
  firebase.initializeApp(firebaseConfig);
  window.JGB_DB = firebase.firestore();
})();
