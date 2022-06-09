import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Lobby } from '../model/Lobby.js';

let page = 1;
let lobbyList = [];

let showPrev;
let showNext;

export function addEventListeners() {
    Element.menuLobbies.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.LOBBIES)
        const label = Util.disableButton(Element.menuLobbies);
        await lobbies_page();
        Util.enableButton(Element.menuLobbies, label);
    })
}

export async function lobbies_page() {

    if (!Auth.currentUser) return;

    showSpinner();

    lobbyList = await FirebaseController.getFirstLobbyPage();
    page = 1;
    showPrev = false;
    showNext = await FirebaseController.getShowNext();

    await buildHTML();
}

async function buildHTML() {
    let html = `
        <h1 class="text-light">Lobbies</h1>
        <button class="btn btn-outline-light" id="add-button">Add Lobby</button>
    `;

    try {
        html += `
        <table class="table table-striped text-light">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Host</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Category</th>
                    <th scope="col">Player Count</th>
                    <th scope="col"></th>
                </tr>
            </thead>
        <tbody>
        `;
        for (let i = 0; i < lobbyList.length; i++) {
            html += buildLobbyRow(lobbyList[i]);
        }
        html += '</tbody></table>'
    } catch (e) {
        if (Constant.DEV) console.log(e);
    }

    if (lobbyList.length === 0) {
        html += `
            <h5 class="text-light">No lobbies to retrieve.</h5>
        `
    }

    html += `
    <nav class="d-flex justify-content-center align-items-center">
        <ul class="pagination text-center align-items-center">
    `;

    if (showPrev.data === true) {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="prev" style="width: 100px;">Previous</button></li>`;
    }
    else {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="prev" style="width: 100px;" disabled>Previous</button></li>`
    }
    html += `<li class="page-item text-center text-light">${page}</li>`;

    if (showNext.data === true) {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="next" style="width: 100px;">Next</button></li>`;
    }
    else {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="next" style="width: 100px;" disabled>Next</button></li>`;
    }
    
    html += `
            </ul>
        </nav>
    `;

    Element.root.innerHTML = html;

    const addButton = document.getElementById('add-button');
    addButton.addEventListener('click', async () => {
        const id = Auth.currentUser.uid;
        const name = "Test Lobby";
        const host = "Host Name";
        const timestamp = Date.now();
        const open = true;
        const players = [Auth.currentUser.uid];
        const category = "Test";
        const questions = [];
        const data = {id, name, host, timestamp, open, players, category, questions};
        const lobby = new Lobby(data);
        
        const label = Util.disableButton(addButton);

        try {
            await FirebaseController.addLobby(lobby);
        } catch (e) {
            if (Constant.DEV) console.log(e);
        }

        Util.enableButton(addButton, label);
        await lobbies_page();
    });

    const deleteForms = document.getElementsByClassName('form-delete-lobby');
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            if (!window.confirm("Press OK to confirm deletion.")) return;
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            showSpinner();
            lobbyList = await FirebaseController.deleteLobby(e.target.docId.value);
            showPrev = await FirebaseController.getShowPrevious();
            showNext = await FirebaseController.getShowNext();
            page = await FirebaseController.getPage();
            Util.enableButton(button, label);
            await buildHTML();
        })
    }

    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    prevButton.addEventListener('click', async () => {
        const label = Util.disableButton(prevButton);
        showSpinner();
        lobbyList = await FirebaseController.getPreviousLobbyPage();
        showPrev = await FirebaseController.getShowPrevious();
        showNext = true;
        page = await FirebaseController.getPage();
        Util.enableButton(prevButton, label);
        await buildHTML();
    });

    nextButton.addEventListener('click', async () => {
        const label = Util.disableButton(nextButton);
        showSpinner();
        lobbyList = await FirebaseController.getNextLobbyPage();
        showPrev= true;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        Util.enableButton(nextButton, label);
        await buildHTML();
    })

    Element.menu.style.display = "block";
}

function buildLobbyRow(lobby) {
    return `
        <tr class="text-light" id="lobby-row-${lobby.id}">
            <td>${lobby.name}</td>
            <td>${lobby.host}</td>
            <td>${new Date(lobby.timestamp).toString()}</td>
            <td>${lobby.category}</td>
            <td>${lobby.players.length}</td>
            <td>
                <form class="form-delete-lobby" method="post" style="display: inline-block;">
                    <input type="hidden" name="docId" value="${lobby.docId}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}

function showSpinner() {
    Element.root.innerHTML = `
        <div class="spinner-border text-light" role="status"></div>
    `
}