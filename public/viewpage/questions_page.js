import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Question } from '../model/Question.js';

let page = 1;
let questionList = [];

let showPrev;
let showNext;

export function addEventListeners() {
    Element.menuQuestions.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.QUESTIONS)
        const label = Util.disableButton(Element.menuQuestions);
        await questions_page();
        Util.enableButton(Element.menuQuestions, label);
    })
}

export async function questions_page() {

    if (!Auth.currentUser) return;

    showSpinner();

    questionList = await FirebaseController.getFirstPage(Constant.collectionNames.QUESTIONS);
    page = 1;
    showPrev = false;
    showNext = await FirebaseController.getShowNext();

    await buildHTML();
}

async function buildHTML() {
    let html = `
        <h1 class="text-light">Questions</h1>
        <button class="btn btn-outline-light" id="add-button">Add Question</button>
    `;

    try {
        html += `
        <table class="table table-striped text-light">
            <thead>
                <tr>
                    <th scope="col">Answer</th>
                    <th scope="col">Info</th>
                    <th scope="col">Category</th>
                    <th scope="col">Fields</th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                </tr>
            </thead>
        <tbody>
        `;
        for (let i = 0; i < questionList.length; i++) {
            html += buildQuestionRow(questionList[i]);
        }
        html += '</tbody></table>'
    } catch (e) {
        if (Constant.DEV) console.log(e);
    }

    if (questionList.length === 0) {
        html += `
            <h5 class="text-light">No questions to retrieve.</h5>
        `
    }

    html += `
    <nav class="d-flex justify-content-center align-items-center">
        <ul class="pagination text-center align-items-center">
    `;

    if (showPrev === true) {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="prev" style="width: 100px;">Previous</button></li>`;
    }
    else {
        html += `<li class="page-item"><button class="btn btn-outline-light" id="prev" style="width: 100px;" disabled>Previous</button></li>`
    }
    html += `<li class="page-item text-center text-light">${page}</li>`;

    if (showNext === true) {
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
        const answer = "Test Question " + Math.floor((Math.random() * 1000));
        const info = "Test Info " + Math.floor((Math.random() * 1000));
        const category = "Test Category " + Math.floor((Math.random() * 1000));
        let fields = [];
        let fieldNumber = Math.floor((Math.random() * 5)) + 1;
        for (let i = 0; i < fieldNumber; i++) {
            fields[i] = "Field Name " + (i + 1);
        }

        const data = { answer, info, category, fields };
        const question = new Question(data);

        const label = Util.disableButton(addButton);
        try {
            await FirebaseController.addDocument(Constant.collectionNames.QUESTIONS, question);
        } catch (e) {
            if (Constant.DEV) console.log(e);
        }

        Util.enableButton(addButton, label);
        await questions_page();

        // Open add modal
    });

    const editForms = document.getElementsByClassName('form-edit-question');
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            // show edit modal
            Util.enableButton(button, label);
        });
    }

    const deleteForms = document.getElementsByClassName('form-delete-question');
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            if (!window.confirm("Press OK to confirm deletion.")) return;
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            showSpinner();
            questionList = await FirebaseController.deleteDocument(Constant.collectionNames.QUESTIONS, e.target.docId.value);
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
        questionList = await FirebaseController.getPreviousPage(Constant.collectionNames.QUESTIONS);
        showPrev = await FirebaseController.getShowPrevious();
        showNext = true;
        page = await FirebaseController.getPage();
        Util.enableButton(prevButton, label);
        await buildHTML();
    });

    nextButton.addEventListener('click', async () => {
        const label = Util.disableButton(nextButton);
        showSpinner();
        questionList = await FirebaseController.getNextPage(Constant.collectionNames.QUESTIONS);
        showPrev= true;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        Util.enableButton(nextButton, label);
        await buildHTML();
    })

    Element.menu.style.display = "block";
}

function buildQuestionRow(question) {
    let fieldString = '';
    question.fields.forEach(field => {
        if (fieldString !== '') fieldString += ', ';
        fieldString += field;
    })
    return `
        <tr class="text-light" id="lobby-category-${question.docId}">
            <td>${question.answer}</td>
            <td>${question.info}</td>
            <td>${question.category}</td>
            <td>${fieldString}</td>
            <td>
                <form class="form-edit-question" method="post" style="display: inline-block;">
                    <input type="hidden" name="docId" value="${question.docId}">
                    <button type="submit" class="btn btn-outline-warning">Edit</button>
                </form>
            </td>
            <td>
                <form class="form-delete-question" method="post" style="display: inline-block;">
                    <input type="hidden" name="docId" value="${question.docId}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}

function showSpinner() {
    Element.root.innerHTML = `
        <div class="spinner-border text-light" role="status"></div>
    `
}