import * as Element from './element.js'

export async function categories_page() {

    //if (!Auth.currentUser) return;

    let html = `
        <div class="d-flex flex-row justify-content-between">
            <div class="card" style="width: 24rem;">
                <img src="../svg/house.svg" alt="Lobby" width="32" height="32" class="card-img-top">
                <div class="card-body">
                    <a href="#" class=btn btn-light" id="menu-lobbies">Go to Lobby Management</a>
                </div>
            </div>

            <div class="card" style="width: 24rem;">
                <img src="../svg/tags.svg" alt="Category" width="32" height="32" class="card-img-top">
                <div class="card-body">
                    <a href="#" class=btn btn-light">Go to Category Management</a>
                </div>
            </div>

            <div class="card" style="width: 24rem;">
                <img src="../svg/question-circle.svg" alt="Question" width="32" height="32" class="card-img-top">
                <div class="card-body">
                    <a href="#" class=btn btn-light">Go to Question Management</a>
                </div>
            </div>
        </div>
    `;

    Element.root.innerHTML = html;
}