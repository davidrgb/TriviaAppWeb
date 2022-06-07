import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Constant from '../model/constant.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Lobbies from './lobbies_page.js';
import * as Categories from './categories_page.js';
import * as Questions from './questions_page.js';

export async function home_page() {

    Element.menu.style.display = "none";

    let html;

    if (!Auth.currentUser) {
        html = `
            <div class="d-flex justify-content-center pre-auth" style="width: 100%;">
                <h3 class="text-light">Admin Portal</h1>
            </div>
            <div class="d-flex justify-content-center pre-auth" style="width: 100%;">
                <form id="form-signin" method="post">
                    <div class="d-flex justify-content-center" style="width: 100%;">
                        <h5 class="text-danger" id="form-signin-error" style="display: none;">Error: admins only</h5>
                    </div>
                    <div>
                        <input class="bg-dark text-light" type="email" name="email" placeholder="Email Address">
                    </div>
                    <div>
                        <input class="bg-dark text-light" type="password" name="password" placeholder="Password">
                    </div>
                    <div class="d-flex justify-content-center pt-3" style="width: 100%;">
                        <button type="submit" class="btn btn-block btn-outline-light">Sign In</button>
                    </div>
                </form>
            </div>
        `;

        Element.root.innerHTML = html;

        const formSignIn = document.getElementById('form-signin');
        const formSignInError = document.getElementById('form-signin-error');
        formSignIn.addEventListener('submit', async e => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);

            formSignInError.style.display = 'none';
    
            if (!Constant.adminEmails.includes(email)) {
                formSignInError.innerHTML = 'Error: admins only';
                formSignInError.style.display = 'block';
                Util.enableButton(button, label);
                return;
            }
    
            try {
                await FirebaseController.signIn(email, password);
                console.log(Auth.currentUser);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                formSignInError.innerHTML = 'Error: invalid credentials';
                formSignInError.style.display = 'block';
            }
            Util.enableButton(button, label);
        })
    }

    else {
        html = `
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

        const homeCategories = document.getElementById('home-categories');
        homeCategories.addEventListener('click', async () => {
            history.pushState(null, null, Route.routePathname.CATEGORIES);
            const label = Util.disableButton(homeCategories);
            await Categories.categories_page();
            Util.enableButton(homeCategories, label);
        });

        const homeQuestions = document.getElementById('home-questions');
        homeQuestions.addEventListener('click', async () => {
            history.pushState(null, null, Route.routePathname.QUESTIONS);
            const label = Util.disableButton(homeQuestions);
            await Questions.questions_page();
            Util.enableButton(homeQuestions, label);
        });
    }
}