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
            const { id, timestamp, open, players, category, questions} = doc.data();
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