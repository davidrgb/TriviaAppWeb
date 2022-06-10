import * as Constant from '../model/constant.js';
import { Lobby } from "../model/Lobby.js";
import { Category } from '../model/Category.js';
import { Question } from '../model/Question.js';
import { Field } from '../model/Field.js';

export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
    await firebase.auth().signOut();
}

let page = 1;

let firstId;
let secondId;
let lastId;
let previouslastId;

let showPrev;
let showNext;

const cf_addDocument = firebase.functions().httpsCallable('cf_addDocument');
export async function addDocument(collection, document) {
    await cf_addDocument({collection, document});
}

const cf_checkNextPage = firebase.functions().httpsCallable('cf_checkNextPage');
const cf_checkPreviousPage = firebase.functions().httpsCallable('cf_checkPreviousPage');

export async function getShowPrevious() {
    return showPrev;
}

export async function getShowNext() {
    return showNext;
}

const cf_getFirstPage = firebase.functions().httpsCallable('cf_getFirstPage');
export async function getFirstPage(collection) {
    page = 1;
    const documents = [];
    const result = await cf_getFirstPage({collection});
    result.data.forEach(data => {
        if (collection === Constant.collectionNames.LOBBIES) {
            const d = new Lobby(data);
            d.docId = data.docId;
            documents.push(d);
        }
        else if (collection === Constant.collectionNames.CATEGORIES) {
            const d = new Category(data);
            d.docId = data.docId;
            documents.push(d);
        }
        else if (collection === Constant.collectionNames.QUESTIONS) {
            const d = new Question(data);
            d.docId = data.docId;
            documents.push(d);
        }
    });
    if (result.data.length > 0) {
        firstId = result.data[0].docId;
        lastId = result.data[result.data.length - 1].docId;
        if (result.data.length > 1) secondId = result.data[1].docId;
        else secondId = -1;
        showPrev = false;
        const cf_showNext = await cf_checkNextPage({lastId, collection});
        showNext = cf_showNext.data;
    }
    else {
        showPrev = false;
        showNext = false;
    }
    return documents;
}

const cf_getNextPage = firebase.functions().httpsCallable('cf_getNextPage');
export async function getNextPage(collection) {
    page++;
    const documents = [];
    const result = await cf_getNextPage({lastId, collection});
    result.data.forEach(data => {
        if (collection === Constant.collectionNames.LOBBIES) {
            const d = new Lobby(data);
            d.docId = data.docId;
            documents.push(d);
        }
        else if (collection === Constant.collectionNames.CATEGORIES) {
            const d = new Category(data);
            d.docId = data.docId;
            documents.push(d);
        }
        if (collection === Constant.collectionNames.QUESTIONS) {
            const d = new Question(data);
            d.docId = data.docId;
            documents.push(d);
        }
    });
    firstId = result.data[0].docId;
    lastId = result.data[result.data.length - 1].docId;
    await getPreviousPageLastId(collection);
    if (result.data.length > 1) secondId = result.data[1].docId;
    else secondId = -1;
    showPrev = true;
    const cf_showNext = await cf_checkNextPage({lastId, collection});
    showNext = cf_showNext.data;
    return documents;
}

const cf_getPreviousPage = firebase.functions().httpsCallable('cf_getPreviousPage');
export async function getPreviousPage(collection) {
    page--;
    const documents = [];
    const result = await cf_getPreviousPage({firstId, collection});
    result.data.forEach(data => {
        if (collection === Constant.collectionNames.LOBBIES) {
            const d = new Lobby(data);
            d.docId = data.docId;
            documents.push(d);
        }
        else if (collection === Constant.collectionNames.CATEGORIES) {
            const d = new Category(data);
            d.docId = data.docId;
            documents.push(d);
        }
        if (collection === Constant.collectionNames.QUESTIONS) {
            const d = new Question(data);
            d.docId = data.docId;
            documents.push(d);
        }
    });
    firstId = result.data[0].docId;
    lastId = result.data[result.data.length - 1].docId;
    await getPreviousPageLastId(collection);
    if (result.data.length > 1) secondId = result.data[0].docId;
    else secondId = -1;
    const cf_showPrev = await cf_checkPreviousPage({firstId, collection});
    showPrev = cf_showPrev.data;
    showNext = true;
    return documents;
}

const cf_getPreviousPageLastId = firebase.functions().httpsCallable('cf_getPreviousPageLastId');
export async function getPreviousPageLastId(collection) {
    const result = await cf_getPreviousPageLastId({firstId, collection});
    result.data.forEach(data => {
        previouslastId = data.docId;
    });
}

const cf_editDocument = firebase.functions().httpsCallable('cf_editDocument');
export async function editDocument(collection, docId, data) {
    await cf_editDocument({collection, docId, data});
}

const cf_deleteDocument = firebase.functions().httpsCallable('cf_deleteDocument');
export async function deleteDocument(collection, docId) {
    let documents = [];
    if (secondId === -1 && page !== 1) {
        documents = await getPreviousPage(collection);
        showNext = false;
        await cf_deleteDocument({collection, docId});
        return documents;
    }
    await cf_deleteDocument({collection, docId});
    if (secondId !== -1 && page !== 1) {
        lastId = previouslastId;
        documents = await getNextPage(collection);
        page--;
        await cf_deleteDocument({docId, collection});
        return documents;
    }
    else {
        documents = await getFirstPage(collection);
        await cf_deleteDocument({docId, collection});
        return documents;
    }
}

export async function getPage() {
    return page;
}