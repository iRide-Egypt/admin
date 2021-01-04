import firebase from 'firebase';
import {firebaseConfig} from 'Constants/defaultValues'

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const db = firebase.firestore();

export {
    auth,
    database,
    db
};
