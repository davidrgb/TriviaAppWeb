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

let page = 1;

let firstLobbyId;
let secondLobbyId;
let lastLobbyId;
let previousLastLobbyId;

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

const cf_getFirstLobbyPage = firebase.functions().httpsCallable('cf_getFirstLobbyPage');
export async function getFirstLobbyPage() {
    page = 1;
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
        if (result.data.length > 1) secondLobbyId = result.data[1].docId;
        else secondLobbyId = -1;
        showPrev = false;
        const cf_showNext = await cf_checkNextLobbyPage({lastLobbyId});
        showNext = cf_showNext;
    }
    else {
        showPrev = false;
        showNext = false;
    }
    return lobbies;
}

const cf_getNextLobbyPage = firebase.functions().httpsCallable('cf_getNextLobbyPage');
export async function getNextLobbyPage() {
    page++;
    const lobbies = [];
    const result = await cf_getNextLobbyPage({lastLobbyId});
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    firstLobbyId = result.data[0].docId;
    lastLobbyId = result.data[result.data.length - 1].docId;
    await getPreviousLobbyLastId();
    if (result.data.length > 1) secondLobbyId = result.data[1].docId;
    else secondLobbyId = -1;
    showPrev = true;
    const cf_showNext = await cf_checkNextLobbyPage({lastLobbyId});
    showNext = cf_showNext.data;
    return lobbies;
}

const cf_getPreviousLobbyPage = firebase.functions().httpsCallable('cf_getPreviousLobbyPage');
export async function getPreviousLobbyPage() {
    page--;
    const lobbies = [];
    const result = await cf_getPreviousLobbyPage({firstLobbyId});
    result.data.forEach(data => {
        const l = new Lobby(data);
        l.docId = data.docId;
        lobbies.push(l);
    });
    firstLobbyId = result.data[0].docId;
    lastLobbyId = result.data[result.data.length - 1].docId;
    await getPreviousLobbyLastId();
    if (result.data.length > 1) secondLobbyId = result.data[0].docId;
    else secondLobbyId = -1;
    const cf_showPrev = await cf_checkPreviousLobbyPage({firstLobbyId});
    showPrev = cf_showPrev;
    showNext = true;
    return lobbies;
}

const cf_getPreviousLobbyLastId = firebase.functions().httpsCallable('cf_getPreviousLobbyLastId');
export async function getPreviousLobbyLastId() {
    const lobbies = [];
    const result = await cf_getPreviousLobbyLastId({firstLobbyId});
    result.data.forEach(data => {
        previousLastLobbyId = data.docId;
    });
}

const cf_deleteLobby = firebase.functions().httpsCallable('cf_deleteLobby');
export async function deleteLobby(docId) {
    let lobbies = [];
    if (secondLobbyId === -1 && page !== 1) {
        lobbies = await getPreviousLobbyPage();
        showNext = false;
        await cf_deleteLobby({docId});
        return lobbies;
    }
    await cf_deleteLobby({docId});
    if (secondLobbyId !== -1 && page !== 1) {
        lastLobbyId = previousLastLobbyId;
        lobbies = await getNextLobbyPage();
        page--;
        await cf_deleteLobby({docId});
        return lobbies;
    }
    else {
        lobbies = await getFirstLobbyPage();
        await cf_deleteLobby({docId});
        return lobbies;
    }
}

export async function getPage() {
    return page;
}