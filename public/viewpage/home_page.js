import * as Route from '../controller/route.js'


export function addEventListeners() {
    Element.menuUsers.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.USERS)
        const label = Util.disableButton(Element.menuUsers);
        await users_page();
        Util.enableButton(Element.menuUsers, label);
    })
}

export async function home_page() {

    //if (!Auth.currentUser) return;

    let html = `
        <div class="card" style="width: 24rem;">
        <img src="/assets/img/bootstrap.svg" alt="Bootstrap" width="32" height="32">
        </div>
    `;
}