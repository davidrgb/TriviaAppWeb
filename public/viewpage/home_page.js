import * as Route from '../controller/route.js';
import * as Lobbies from './lobbies_page.js';
import * as Util from './util.js';
import * as Element from './element.js';

export async function home_page() {

    //if (!Auth.currentUser) return;

    Element.menu.style.display = "none";

    let html = `
        <div class="d-flex justify-content-center pb-5" style="width: 100%;">
            <h3 class="text-light">Admin Portal</h1>
        </div>
        <div class="d-flex flex-row justify-content-between">
            <div class="card text-center bg-dark border border-light" style="width: 24rem;">
                <div class="card-img-top p-3">
                    <img src="../svg/house.svg" alt="Lobby" style="filter: invert(100%); width: 75%; height: 75%;">
                </div>
                <div class="card-body">
                    <button class="btn btn-lg btn-block btn-outline-light" id="home-lobbies">Go to Lobby Management</button>
                </div>
            </div>

            <div class="card text-center bg-dark border border-light" style="width: 24rem;">
                <div class="card-img-top p-3">
                    <img src="../svg/tags.svg" alt="Lobby" style="filter: invert(100%); width: 75%; height: 75%;">
                </div>
                <div class="card-body">
                    <button class="btn btn-lg btn-block btn-outline-light" id="home-categories">Go to Category Management</button>
                </div>
            </div>

            <div class="card text-center bg-dark border border-light" style="width: 24rem;">
                <div class="card-img-top p-3">
                    <img src="../svg/question-circle.svg" alt="Lobby" style="filter: invert(100%); width: 75%; height: 75%;">
                </div>
                <div class="card-body">
                    <button class="btn btn-lg btn-block btn-outline-light" id="home-questions">Go to Question Management</button>
                </div>
            </div>
        </div>
    `;

    Element.root.innerHTML = html;

    const homeLobbies = document.getElementById('home-lobbies');
    homeLobbies.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.LOBBIES);
        const label = Util.disableButton(homeLobbies);
        await Lobbies.lobbies_page();
        Util.enableButton(homeLobbies, label);
    });
}