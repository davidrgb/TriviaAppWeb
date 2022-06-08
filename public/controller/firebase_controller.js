import { Lobby } from "../model/Lobby.js";

export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
    await firebase.auth().signOut();
}

const cf_addLobby = firebase.functions().httpsCallable('cf_addLobby');
export async function addLobby(lobby) {
    await cf_addLobby(lobby);
}

const cf_getLobbyList = firebase.functions().httpsCallable('cf_getLobbyList');
export async function getLobbyList() {
    const lobbies = [];
    const result = await cf_getLobbyList();
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    return lobbies;
}

const cf_getFirstLobbyPage = firebase.functions().httpsCallable('cf_getFirstLobbyPage');
export async function getFirstLobbyPage() {
    const lobbies = [];
    const result = await cf_getFirstLobbyPage();
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    return lobbies;
}