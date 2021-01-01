import firebase from 'firebase';
import {firebaseConfig} from 'Constants/defaultValues'

firebase.initializeApp(firebaseConfig);
// firebase.initializeApp(firebaseConfig);
console.log(firebaseConfig)
const auth = firebase.auth();
const database = firebase.database();

export {
    auth,
    database
};
