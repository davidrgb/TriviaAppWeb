import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Lobby } from '../model/Lobby.js';

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

    let html = `
        <h1 class="text-light">Lobbies</h1>
        <button class="btn btn-outline-light" id="add-button">Add Lobby</button>
    `;

    let lobbyList;
    try {
        lobbyList = await FirebaseController.getFirstLobbyPage();
        console.log(lobbyList);
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
    });

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
                    <input type="hidden" name="uid" value="${lobby.id}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}