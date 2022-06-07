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
}

export function isAdmin() {
    return Constant.adminEmails.includes(currentUser.email);
}