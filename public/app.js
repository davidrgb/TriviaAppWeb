import * as Route from './controller/route.js'
//import * as Auth from './controller/auth.js'
import * as Home from '../viewpage/home_page.js'
import * as Lobbies from '../viewpage/lobbies_page.js'
import * as Categories from '../viewpage/categories_page.js'
import * as Questions from '../viewpage/questions_page.js'

window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    Route.routing(pathname, hash);
}

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    Route.routing(pathname, hash);
})

//Auth.addEventListeners();
Lobbies.addEventListeners();
//Categories.addEventListeners();
//Questions.addEventListeners();
//Home.addAdminEventListeners();

/*if (Auth.currentUser) {
    if (Constant.adminEmails.includes(Auth.currentUser.email)) {
        Home.addAdminEventListeners();
    }
}*/