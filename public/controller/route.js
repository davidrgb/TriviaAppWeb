import * as Home from '../viewpage/home_page.js'
import * as Lobbies from '../viewpage/lobbies_page.js'
import * as Categories from '../viewpage/categories_page.js'
import * as Questions from '../viewpage/questions_page.js'

export const routePathname = {
    HOME: '/',
    LOBBIES: '/lobbies',
    CATEGORIES: '/categories',
    QUESTIONS: '/questions',
}

export const routes = [
    {pathname: routePathname.HOME, page: Home.home_page},
    {pathname: routePathname.LOBBIES, page: User.lobbies_page},
    {pathname: routePathname.CATEGORIES, page: Purchase.categories_page},
    {pathname: routePathname.QUESTIONS, page: Cart.questions_page},
];

export function routing(pathname, hash) {
    /*if (Auth.currentUser) {
        if (Auth.isAdmin()) Auth.showAdminControls();
        else Auth.showUserControls();
    }*/
    const route = routes.find(r => r.pathname == pathname);
    if (route) {
        if (hash && hash.length > 1) {
            route.page(hash.substring(1));
        } else {
            route.page();
        }
    }
    else routes[0].page();
}