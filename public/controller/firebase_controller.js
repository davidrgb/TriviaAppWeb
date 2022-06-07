export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
    await firebase.auth().signOut();
}