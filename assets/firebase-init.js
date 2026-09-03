import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getFirestore, collection, doc, documentId, getDoc, setDoc, getDocs,
  query, where, orderBy, limit, endBefore, getCountFromServer
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

var firebaseConfig = {
  apiKey: "AIzaSyDDeMHb14H5gssnJIOwPxmEpoQJZ_xvJD0",
  authDomain: "simulator-2e38a.firebaseapp.com",
  projectId: "simulator-2e38a",
  storageBucket: "simulator-2e38a.firebasestorage.app",
  messagingSenderId: "590791345723",
  appId: "1:590791345723:web:c074c9faf3526d996dfe1e"
};

var app = initializeApp(firebaseConfig);

window.JGB_DB = {
  db: getFirestore(app),
  collection: collection, doc: doc, documentId: documentId, getDoc: getDoc, setDoc: setDoc, getDocs: getDocs,
  query: query, where: where, orderBy: orderBy, limit: limit, endBefore: endBefore,
  getCountFromServer: getCountFromServer
};
