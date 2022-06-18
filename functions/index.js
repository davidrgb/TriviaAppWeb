const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require('./account_key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const Constant = require('./constant.js');

exports.cf_addDocument = functions.https.onCall(addDocument);
exports.cf_getFirstPage = functions.https.onCall(getFirstPage);
exports.cf_getNextPage = functions.https.onCall(getNextPage);
exports.cf_getPreviousPage = functions.https.onCall(getPreviousPage);
exports.cf_getPreviousPageLastId = functions.https.onCall(getPreviousPageLastId);
exports.cf_checkNextPage = functions.https.onCall(checkNextPage);
exports.cf_checkPreviousPage = functions.https.onCall(checkPreviousPage);
exports.cf_getCollection = functions.https.onCall(getCollection);
exports.cf_getDocument = functions.https.onCall(getDocument);
exports.cf_getDocumentByField = functions.https.onCall(getDocumentByField);
exports.cf_editDocument = functions.https.onCall(editDocument);
exports.cf_deleteDocument = functions.https.onCall(deleteDocument);

function isAdmin(email) {
    return Constant.adminEmails.includes(email);
}

async function addDocument(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let reference = await admin.firestore().collection(data.collection)
            .add(data.document);
        return reference.id;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'addDocument - ' + data.collection + ' - failed');
    }
}

async function getFirstPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let documents = [];
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const snapShot = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .limit(10)
            .get();
        snapShot.forEach(doc => {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                documents.push(d);
            }
        });
        return documents;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getFirstPage - ' + data.collection + ' - failed');
    }
}

async function checkNextPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const lastDocument = await admin.firestore().collection(data.collection)
            .doc(data.lastId)
            .get();
        const nextDocument = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .startAfter(lastDocument)
            .limit(1)
            .get();
        if (nextDocument.docs.length !== 0 && nextDocument.docs[0].exists) return true;
        else return false;
    } catch (e) {
        if (Constant.DEV) console.log('No more documents after this page');
        throw new functions.https.HttpsError('internal', 'checkNextPage - ' + data.collection + ' - failed');
    }
}

async function checkPreviousPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admins may invoke this function');
    }

    try {
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const firstDocument = await admin.firestore().collection(data.collection)
            .doc(data.firstId)
            .get();
        const prevDocument = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .endBefore(firstDocument)
            .limitToLast(1)
            .get();
        if (prevDocument.docs.length !== 0 && prevDocument.docs[0].exists) return true;
        else return false;
    } catch (e) {
        if (Constant.DEV) console.log('No more categories after this page');
        throw new functions.https.HttpsError('internal', 'checkPreviousPage - ' + data.collection + ' - failed');
    }
}

async function getNextPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let documents = [];
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const lastDocument = await admin.firestore().collection(data.collection)
            .doc(data.lastId)
            .get();
        const snapShot = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .startAfter(lastDocument)
            .limit(10)
            .get();
        snapShot.forEach(doc => {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                documents.push(d);
            }
        });
        return documents;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getNextPage - ' + data.collection + ' - failed');
    }
}

async function getPreviousPage(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let documents = [];
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const firstDocument = await admin.firestore().collection(data.collection)
            .doc(data.firstId)
            .get();
        const snapShot = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .endBefore(firstDocument)
            .limitToLast(10)
            .get();
        snapShot.forEach(doc => {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                documents.push(d);
            }
        });
        return documents;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getPreviousPage - ' + data.collection + ' - failed');
    }
}

async function getPreviousPageLastId(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let documents = [];
        let orderField;
        if (data.collection === Constant.collectionNames.LOBBIES) orderField = 'timestamp';
        else if (data.collection === Constant.collectionNames.CATEGORIES) orderField = 'name';
        else if (data.collection === Constant.collectionNames.QUESTIONS) orderField = 'answer';
        const firstDocument = await admin.firestore().collection(data.collection)
            .doc(data.firstId)
            .get();
        const snapShot = await admin.firestore().collection(data.collection)
            .orderBy(orderField)
            .endBefore(firstDocument)
            .limitToLast(1)
            .get();
        snapShot.forEach(doc => {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                documents.push(d);
            }
        });
        return documents;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getPreviousPageLastId - ' + data.collection + ' - failed');
    }
}

async function getCollection(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        let documents = [];
        const snapShot = await admin.firestore().collection(data.collection).get();
        snapShot.forEach(doc => {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                documents.push(d);
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                documents.push(d);
            }
        });
        return documents;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getCollection - ' + data.collection + ' - failed');
    }
}

async function getDocument(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        const doc = await admin.firestore().collection(data.collection).doc(data.docId).get();
        if (doc.exists) {
            if (data.collection === Constant.collectionNames.LOBBIES) {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                return d;
            }
            else if (data.collection === Constant.collectionNames.CATEGORIES) {
                const { name, fields, questions } = doc.data();
                const d = { name, fields, questions };
                d.docId = doc.id;
                return d;
            }
            else if (data.collection === Constant.collectionNames.QUESTIONS) {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                return d;
            }
        };
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getDocument - ' + data.collection + ' - failed');
    }
}

async function getDocumentByField(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        if (data.collection === Constant.collectionNames.LOBBIES) {
            const snapShot = await admin.firestore().collection(data.collection).where("id", "==", data.field).get();
            snapShot.forEach(doc => {
                const { id, name, host, timestamp, open, players, category, questions } = doc.data();
                const d = { id, name, host, timestamp, open, players, category, questions };
                d.docId = doc.id;
                return d;
            });
        }
        else if (data.collection === Constant.collectionNames.CATEGORIES) {
            const snapShot = await admin.firestore().collection(data.collection).where("name", "==", data.field).get();
            const { name, fields, questions } = snapShot.docs[0].data();
            const d = { name, fields, questions };
            d.docId = snapShot.docs[0].id;
            return d;
        }
        else if (data.collection === Constant.collectionNames.QUESTIONS) {
            const snapShot = await admin.firestore().collection(data.collection).where("answer", "==", data.field).get();
            snapShot.forEach(doc => {
                const { answer, info, category, fields } = doc.data();
                const d = { answer, info, category, fields };
                d.docId = doc.id;
                return d;
            });
        }
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'getDocumentById - ' + data.collection + ' - failed');
    }
}

async function editDocument(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    /*if (data.collection === Constant.collectionNames.CATEGORIES) {
        const category = await admin.firestore().collection(Constant.collectionNames.CATEGORIES).doc(data.docId).get();
        const questionSnapShot = await admin.firestore().collection(Constant.collectionNames.QUESTIONS).where('category', '==', category.name).get();
        for (let i = 0; i < questionSnapShot.docs.length; i++) {
            for (let j = 0; j < questionSnapShot.docs[i].data().fields.length; j++) {
                await admin.firestore().collection(Constant.collectionNames.FIELDS).doc(questionSnapShot.docs[i].data().fields[j]).delete();
            }
            await admin.firestore().collection(Constant.collectionNames.QUESTIONS).doc(questionSnapShot.docs[i].data().docId).delete();
        }
    }*/

    try {
        await admin.firestore().collection(data.collection)
            .doc(data.docId)
            .update(data.data);
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'editDocument - ' + data.collection + ' - failed');
    }
}

async function deleteDocument(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admin', context.auth.token.email);
        throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function');
    }

    try {
        if (data.collection === Constant.collectionNames.CATEGORIES) {
            const category = await admin.firestore().collection(Constant.collectionNames.CATEGORIES).doc(data.docId).get();
            const questionSnapShot = await admin.firestore().collection(Constant.collectionNames.QUESTIONS).where('category', '==', category.data().name).get();
            for (let i = 0; i < questionSnapShot.docs.length; i++) {
                const { fields } = questionSnapShot.docs[i].data();
                for (let j = 0; j < fields.length; j++) {
                    await admin.firestore().collection(Constant.collectionNames.FIELDS).doc(fields[j].data).delete();
                }
                await admin.firestore().collection(Constant.collectionNames.QUESTIONS).doc(questionSnapShot.docs[i].id).delete();
            }
        }
        else if (data.collection === Constant.collectionNames.QUESTIONS) {
            const question = await admin.firestore().collection(Constant.collectionNames.QUESTIONS).doc(data.docId).get();
            const categorySnapShot = await admin.firestore().collection(Constant.collectionNames.CATEGORIES).where('name', '==', question.data().category).get();
            for (let i = 0; i < categorySnapShot.docs.length; i++) {
                const { name, fields, questions } = categorySnapShot.docs[i].data();
                let updatedQuestions = [];
                for (let j = 0; j < questions.length; j++) {
                    if (data.docId !== questions[j].data) updatedQuestions.push({data: questions[j].data});
                }
                const update = { name: name, fields: fields, questions: updatedQuestions };
                await admin.firestore().collection(Constant.collectionNames.CATEGORIES).doc(categorySnapShot.docs[i].data().docId).update(update);
            }
            const { fields } = question.data();
            for (let i = 0; i < fields.length; i++) {
                await admin.firestore().collection(Constant.collectionNames.FIELDS).doc(fields[i].data).delete();
            }
        }
        await admin.firestore().collection(data.collection)
            .doc(data.docId)
            .delete();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', 'deleteDocument - ' + data.collection + ' - failed');
    }
}