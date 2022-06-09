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

let lastLobbyId;
let firstLobbyId;

let showPrev;
let showNext;

const cf_checkNextLobbyPage = firebase.functions().httpsCallable('cf_checkNextLobbyPage');
const cf_checkPreviousLobbyPage = firebase.functions().httpsCallable('cf_checkPreviousLobbyPage');

export async function getShowPrevious() {
    return showPrev;
}

export async function getShowNext() {
    return showNext;
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
    if (result.data.length > 0) {
        firstLobbyId = result.data[0].docId;
        lastLobbyId = result.data[result.data.length - 1].docId;
    }
    showPrev = false;
    const cf_showNext = await cf_checkNextLobbyPage({lastLobbyId});
    showNext = cf_showNext;
    return lobbies;
}

const cf_getLobbyPage = firebase.functions().httpsCallable('cf_getLobbyPage');
export async function getLobbyPage(page) {
    const lobbies = [];
    const result = await cf_getLobbyPage({page});
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    firstLobbyId = result.data[0].docId;
    lastLobbyId = result.data[result.data.length - 1].docId;
    const cf_showPrev = await cf_checkPreviousLobbyPage();
    showPrev = cf_showPrev;
    const cf_showNext = await cf_checkNextLobbyPage({lastLobbyId});
    showNext = cf_showNext;
    return lobbies;
}

const cf_getNextLobbyPage = firebase.functions().httpsCallable('cf_getNextLobbyPage');
export async function getNextLobbyPage() {
    const lobbies = [];
    const result = await cf_getNextLobbyPage({lastLobbyId});
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    firstLobbyId = result.data[0].docId;
    lastLobbyId = result.data[result.data.length - 1].docId;
    showPrev = true;
    const cf_showNext = await cf_checkNextLobbyPage({lastLobbyId});
    showNext = cf_showNext.data;
    return lobbies;
}

const cf_getPreviousLobbyPage = firebase.functions().httpsCallable('cf_getPreviousLobbyPage');
export async function getPreviousLobbyPage() {
    const lobbies = [];
    const result = await cf_getPreviousLobbyPage({firstLobbyId});
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    firstLobbyId = result.data[0].docId;
    lastLobbyId = result.data[result.data.length - 1].docId;
    const cf_showPrev = await cf_checkPreviousLobbyPage({firstLobbyId});
    showPrev = cf_showPrev;
    showNext = true;
    return lobbies;
}