const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require('./account_key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const Constant = require('./constant.js');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.cf_getLobbyList = functions.https.onCall(getLobbyList);
exports.cf_addLobby = functions.https.onCall(addLobby);
exports.cf_getFirstLobbyPage = functions.https.onCall(getFirstLobbyPage);
exports.cf_getLobbyPage = functions.https.onCall(getLobbyPage);
exports.cf_getNextLobbyPage = functions.https.onCall(getNextLobbyPage);
exports.cf_getPreviousLobbyPage = functions.https.onCall(getPreviousLobbyPage);
exports.cf_checkNextLobbyPage = functions.https.onCall(checkNextLobbyPage);
exports.cf_checkPreviousLobbyPage = functions.https.onCall(checkPreviousLobbyPage);

function isAdmin(email) {
    return Constant.adminEmails.includes(email);
}

async function getLobbyList(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let lobbies = [];
        const snapShot = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .get();
        snapShot.forEach(doc => {
            const { id, timestamp, open, players, category, questions } = doc.data();
            const l = { id, timestamp, open, players, category, questions };
            l.docId = doc.id;
            lobbies.push(l);
        });
        return lobbies;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getLobbyList failed');
    }

}

async function addLobby(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .add(data);
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'addLobby failed');
    }
}

async function getFirstLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let lobbies = [];
        const snapShot = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .limit(10)
            .get();
        snapShot.forEach(doc => {
            const { id, name, host, timestamp, open, players, category, questions } = doc.data();
            const l = { id, name, host, timestamp, open, players, category, questions };
            l.docId = doc.id;
            lobbies.push(l);
        });
        return lobbies;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getFirstLobbyPage failed');
    }
}

async function getLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let lobbies = [];
        let page = data.page - 1;
        const snapShot = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .startAt(page * 10)
            .limit(10)
            .get();
        snapShot.forEach(doc => {
            const { id, name, host, timestamp, open, players, category, questions } = doc.data();
            const l = { id, name, host, timestamp, open, players, category, questions };
            l.docId = doc.id;
            lobbies.push(l);
        });
        return lobbies;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getLobbyPage failed');
    }
}

async function checkNextLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        const lastLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .doc(data.lastLobbyId)
            .get();
        const nextLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .startAfter(lastLobby)
            .limit(1)
            .get();
        if (nextLobby.docs.length !== 0 && nextLobby.docs[0].exists) return true;
        else return false;
    } catch (e) {
        if (Constant.DEV) console.log('No more lobbies after this page');
        throw new functions.https.HttpsError('internal', 'checkNextLobbyPage failed');
    }
}

async function checkPreviousLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        const firstLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .doc(data.firstLobbyId)
            .get();
        const prevLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .endBefore(firstLobby)
            .limitToLast(1)
            .get();
        if (prevLobby.docs.length !== 0 && prevLobby.docs[0].exists) showPrev = true;
        else showPrev = false;
    } catch (e) {
        if (Constant.DEV) console.log('No more lobbies after this page');
        throw new functions.https.HttpsError('internal', 'checkPreviousLobbyPage failed');
    }
}

async function getNextLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let lobbies = [];
        lastLobbyId = data.lastLobbyId;
        console.log(lastLobbyId);
        const lastLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .doc(lastLobbyId)
            .get();
        const snapShot = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .startAfter(lastLobby)
            .limit(10)
            .get();
        snapShot.forEach(doc => {
            const { id, name, host, timestamp, open, players, category, questions } = doc.data();
            const l = { id, name, host, timestamp, open, players, category, questions };
            l.docId = doc.id;
            lobbies.push(l);
        });
        return lobbies;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getNextPage failed');
    }
}

async function getPreviousLobbyPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let lobbies = [];
        let firstLobbyId = data.firstLobbyId;
        const firstLobby = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .doc(firstLobbyId)
            .get();
        const snapShot = await admin.firestore().collection(Constant.collectionNames.LOBBIES)
            .orderBy('timestamp')
            .endBefore(firstLobby)
            .limitToLast(10)
            .get();
        snapShot.forEach(doc => {
            const { id, name, host, timestamp, open, players, category, questions } = doc.data();
            const l = { id, name, host, timestamp, open, players, category, questions };
            l.docId = doc.id;
            lobbies.push(l);
        });
        return lobbies;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getNextPage failed');
    }
}