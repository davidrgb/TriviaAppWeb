import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Category } from '../model/Category.js';
import { Lobby } from '../model/Lobby.js';

let page = 1;
let categoryList = [];

let showPrev;
let showNext;

export function addEventListeners() {
    Element.menuCategories.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.CATEGORIES)
        const label = Util.disableButton(Element.menuCategories);
        await categories_page();
        Util.enableButton(Element.menuCategories, label);
    })
}

export async function categories_page() {

    if (!Auth.currentUser) return;

    showSpinner();

    categoryList = await FirebaseController.getFirstCategoryPage();
    page = 1;
    showPrev = false;
    showNext = await FirebaseController.getShowNext();

    await buildHTML();
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
        <h1 class="text-light">Categories</h1>
        <button class="btn btn-outline-light" id="add-button">Add Category</button>
    `;

    try {
        html += `
        <table class="table table-striped text-light">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Fields</th>
                    <th scope="col">Question Count</th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                </tr>
            </thead>
        <tbody>
        `;
        for (let i = 0; i < categoryList.length; i++) {
            html += buildCategoryRow(categoryList[i]);
        }
        html += '</tbody></table>'
    } catch (e) {
        if (Constant.DEV) console.log(e);
    }

    if (categoryList.length === 0) {
        html += `
            <h5 class="text-light">No categories to retrieve.</h5>
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
        /*const id = Auth.currentUser.uid;
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
        await lobbies_page();*/
        // Open add modal
    });

    const editForms = document.getElementById('form-edit-category');
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            // show edit modal
            Util.enableButton(button, label);
        });
    }

    const deleteForms = document.getElementsByClassName('form-delete-category');
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            if (!window.confirm("Press OK to confirm deletion.")) return;
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            showSpinner();
            lobbyList = await FirebaseController.deletCategory(e.target.docId.value);
            showPrev = await FirebaseController.getShowPrevious();
            showNext = await FirebaseController.getShowNext();
            page = await FirebaseController.getPage();
            Util.enableButton(button, label);
            await buildHTML();
        });
    }

    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    prevButton.addEventListener('click', async () => {
        const label = Util.disableButton(prevButton);
        showSpinner();
        lobbyList = await FirebaseController.getPreviousCategoryPage();
        showPrev = await FirebaseController.getShowPrevious();
        showNext = true;
        page = await FirebaseController.getPage();
        Util.enableButton(prevButton, label);
        await buildHTML();
    });

    nextButton.addEventListener('click', async () => {
        const label = Util.disableButton(nextButton);
        showSpinner();
        lobbyList = await FirebaseController.getNexCategoryPage();
        showPrev= true;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        Util.enableButton(nextButton, label);
        await buildHTML();
    })

    Element.menu.style.display = "block";
}

function buildCategoryRow(category) {
    let fieldString = '';
    category.fields.forEach(field => {
        if (fieldString !== '') fieldString += ', ';
        fieldString += field;
    })
    return `
        <tr id="lobby-category-${category.docId}">
            <td>${category.name}</td>
            <td>${fieldString}</td>
            <td>${category.questions.length}</td>
            <td>
                <form class="form-edit-category" method="post" style="display: inline-block;">
                    <input type="hidden" name="uid" value="${category.docId}">
                    <button type="submit" class="btn btn-outline-warning">Edit</button>
                </form>
            </td>
            <td>
                <form class="form-delete-category" method="post" style="display: inline-block;">
                    <input type="hidden" name="uid" value="${category.docId}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}