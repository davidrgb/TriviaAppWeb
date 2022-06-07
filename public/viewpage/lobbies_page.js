import * as Auth from '../controller/auth.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';

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

    Element.menu.style.display = "block";

    let html = `
        <h1 class="text-light">Lobbies</h1>
    `;

    /*let lobbyList;
    try {
        lobbyList = await FirebaseController.getLobbyList();
        html += `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Host</th>
                    <th scope="col">Uptime</th>
                    <th scope="col">Player Count</th>
                    <th scope="col"></th>
                </tr>
            </thead>
        <tbody>
        `;
        for (let i = 0; i < userList.length; i++) {
            html += buildLobbyRow(lobbyList[i]);
        }
        html += '</tbody></table>'
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.info('Error getLobbyList', JSON.stringify(e));
    }*/

    Element.root.innerHTML = html;

    /*const deleteForms = document.getElementsByClassName('form-delete-lobby');
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            if (!window.confirm('Are you sure to delete the user?')) return;

            const button = e.target.getElementsByTagName('button')[0];
            Util.disableButton(button);

            const uid = e.target.uid.value;
            try {
                await FirebaseController.deleteUser(uid);
                document.getElementById(`user-row-${uid}`).remove();
                Util.info('Deleted!', `User deleted: uid=${uid}`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.info('Delete User in Error', JSON.stringify(e));
            }
        })
    }

    const toggleReviewForms = document.getElementsByClassName('form-toggle-review');
    for (let i = 0; i < toggleReviewForms.length; i++) {
        toggleReviewForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);

            const uid = e.target.uid.value;
            const status = e.target.status.value;
            const update = {
                status: status == 'true' ? false : true,
            }
            try {
                await FirebaseController.updateUserReviewStatus(uid, update);
                e.target.status.value = `${update.status}`;
                document.getElementById(`user-review-${uid}`).innerHTML
                    = `${update.status ? 'Active' : 'Disabled'}`
                Util.info('Status toggled', `Reviews enabled: ${update.status}`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.info('Toggle user status in error', JSON.stringify(e));
            }

            Util.enableButton(button, label);
        })
    }*/
}

function buildLobbyRow(lobby) {
    return `
        <tr id="lobby-row-${lobby.host}">
            <td>${lobby.name}</td>
            <td>${lobby.host}</td>
            <td>${lobby.uptime}</td>
            <td>${lobby.player_count}</td>
            <td>
                <form class="form-delete-lobby" method="post" style="display: inline-block;">
                    <input type="hidden" name="uid" value="${lobby.host}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}