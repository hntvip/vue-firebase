import firebase from "firebase";
import "firebase/firestore";

// firebase init goes here
const firebaseConfig = {
  apiKey: "AIzaSyAd3vezIWpXk6eM9i30Pt9yOkaitpghCVc",
  authDomain: "test1-aed2d.firebaseapp.com",
  databaseURL: "https://test1-aed2d.firebaseio.com",
  projectId: "test1-aed2d",
  storageBucket: "test1-aed2d.appspot.com",
  messagingSenderId: "509005339919",
  appId: "1:509005339919:web:9f9070f73097010c36327a"
};
firebase.initializeApp(firebaseConfig);

// firebase utils
const db = firebase.firestore();
const auth = firebase.auth();
const currentUser = auth.currentUser;

// date issue fix according to firebase

// firebase collections
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");
const commentsCollection = db.collection("comments");
const likesCollection = db.collection("likes");

export {
  db,
  auth,
  currentUser,
  usersCollection,
  postsCollection,
  commentsCollection,
  likesCollection
};
