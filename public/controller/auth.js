import * as FirebaseController from './firebase_controller.js';
import * as Element from '../viewpage/element.js';
import * as Util from '../viewpage/util.js';
import * as Route from './route.js';

export let currentUser;

export function addEventListeners() {
    firebase.auth().onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;

            let elements = document.getElementsByClassName('pre-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            elements = document.getElementsByClassName('post-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'

            const pathname = window.location.pathname;
            const hash = window.location.hash;
            Route.routing(pathname, hash);
        } else {
            currentUser = null;
            let elements = document.getElementsByClassName('pre-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'
            elements = document.getElementsByClassName('post-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'


            history.pushState(null, null, Route.routePathname.HOME);
            Route.routing(window.location.pathname, window.location.hash);
        }
    })

    Element.menuSignOut.addEventListener('click', async () => {
        try {
            Element.menuError.style.display = 'none';
            await FirebaseController.signOut();
        } catch (e) {
            if (Constant.DEV) console.log(e);
            Element.menuError.innerHTML = 'Error: Please Try Again';
            Element.menuError.style.display = 'block';
        }
    })
}

export function isAdmin() {
    return Constant.adminEmails.includes(currentUser.email);
}