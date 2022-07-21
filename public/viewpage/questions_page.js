import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Question } from '../model/Question.js';
import { Field } from '../model/Field.js';

let page = 1;
let questionList = [];

let showPrev;
let showNext;

let categoryList = [];

let category;
let selected_question;
let docId;

export function addEventListeners() {
    Element.menuQuestions.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.QUESTIONS)
        const label = Util.disableButton(Element.menuQuestions);
        await questions_page();
        Util.enableButton(Element.menuQuestions, label);
    });

    Element.addQuestionButton.addEventListener('click', async () => {
        await addNewQuestion();
    })

    Element.editQuestionButton.addEventListener('click', async () => {
        await editQuestion();
    })
}

export async function questions_page() {

    if (!Auth.currentUser) return;

    showSpinner();

    categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
    questionList = await FirebaseController.getFirstPage(Constant.collectionNames.QUESTIONS);
    page = 1;
    showPrev = false;
    showNext = await FirebaseController.getShowNext();

    await buildHTML();
}

async function buildHTML() {
    let html = `
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
    
    Element.addQuestionCategoryDropdown.innerHTML = '';
    for (let i = 0; i < categoryList.length; i++) {
        Element.addQuestionCategoryDropdown.innerHTML += `
            <button class="dropdown-item add-question-category-dropdown-item" type="button">${categoryList[i].name}</button>
        `;
    }

    Element.editQuestionCategoryDropdown.innerHTML = '';
    for (let i = 0; i < categoryList.length; i++) {
        Element.editQuestionCategoryDropdown.innerHTML += `
            <button class="dropdown-item edit-question-category-dropdown-item" type="button">${categoryList[i].name}</button>
        `;
    }

    const addQuestionCategoryDropdownItems = document.getElementsByClassName('add-question-category-dropdown-item');
    for (let i = 0; i < addQuestionCategoryDropdownItems.length; i++) {
        addQuestionCategoryDropdownItems[i].addEventListener('click', () => {
            category = categoryList[i];
            Element.addQuestionCategoryDropdownButton.innerHTML = category.name;
            Element.addQuestionFieldsDiv.innerHTML = '';
            Element.addQuestionErrorCategory.innerHTML = '';
            buildFieldDiv();
        });
    }

    const editQuestionCategoryDropdownItems = document.getElementsByClassName('edit-question-category-dropdown-item');
    for (let i = 0; i < editQuestionCategoryDropdownItems.length; i++) {
        editQuestionCategoryDropdownItems[i].addEventListener('click', () => {
            category = categoryList[i];
            Element.editQuestionCategoryDropdownButton.innerHTML = category.name;
            Element.editQuestionFieldsDiv.innerHTML = '';
            Element.editQuestionErrorCategory.innerHTML = '';
            buildEditFieldDiv();
        });
    }

    const addButton = document.getElementById('add-button');
    addButton.addEventListener('click', async () => {
        resetModalAddQuestion();
        Element.modalAddQuestion.show();
    });

    const editForms = document.getElementsByClassName('form-edit-question');
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            resetModalEditQuestion();
            selected_question = await FirebaseController.getDocument(Constant.collectionNames.QUESTIONS, e.target.docId.value);
            Element.editQuestionAnswer.value = selected_question.answer;
            Element.editQuestionErrorAnswer.innerHTML = '';
            Element.editQuestionInfo.value = selected_question.info;
            Element.editQuestionErrorInfo.innerHTML = '';
            Element.editQuestionCategory.value = selected_question.category;
            Element.editQuestionErrorCategory.innerHTML = '';
            Element.editQuestionCategoryDropdownButton.innerHTML = selected_question.category;
            category = await FirebaseController.getDocumentByField(Constant.collectionNames.CATEGORIES, selected_question.category);
            buildEditFieldDiv();

            let selected_question_fields = [];
            for (let j = 0; j < selected_question.fields.length; j++) {
                selected_question_fields[j] = await FirebaseController.getDocument(Constant.collectionNames.FIELDS, selected_question.fields[j].data);
            }

            for (let j = 0; j < category.fields.length; j++) {
                const fieldDataDiv = document.getElementById(`edit-question-field-data-div-${category.fields[j]}`);
                for (let k = 0; k < selected_question_fields[j].data.length; k++) {
                    fieldDataDiv.innerHTML += `
                            <form class="edit-question-field-data-${category.fields[j]} p-1">
                                <div class="d-flex flew-row">
                                    <input class="bg-dark text-light" style="width: 80%;" type="text" name="data" value="${selected_question_fields[j].data[k]}" disabled>
                                    <input type="hidden" name="field" value="${category.fields[j]}">
                                    <div style="width: 10%;"></div>
                                    <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                                </div>
                            </form>
                        `;
                }
                addEditDataDeleteListeners();
            }
            

            Element.editQuestionErrorField.innerHTML = '';
            Element.modalEditQuestion.show();
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
            Util.display('Delete successful', 'Question has been deleted.');
            categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
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
        showPrev = true;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        Util.enableButton(nextButton, label);
        await buildHTML();
    })

    Element.menu.style.display = "block";
}

function showSpinner() {
    Element.root.innerHTML = `
        <div class="spinner-border text-light" role="status"></div>
    `
}

function buildQuestionRow(question) {
    return `
        <tr class="text-light" id="lobby-category-${question.docId}">
            <td>${question.answer}</td>
            <td>${question.info}</td>
            <td>${question.category}</td>
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

async function addNewQuestion() {
    if (!category) {
        Element.addQuestionErrorCategory.innerHTML = 'Question category is required.';
        return;
    }

    const answer = Element.addQuestionAnswer.value;
    const info = Element.addQuestionInfo.value;
    let fields = [];
    for (let i = 0; i < category.fields.length; i++) {
        let data = [];
        const fieldData = document.getElementsByClassName(`add-question-field-data-${category.fields[i]}`);
        if (fieldData.length < 1 || fieldData[0].data.value.trim() === '') {
            Element.addQuestionErrorField.innerHTML = 'Question field ' + category.fields[i] + ' cannot contain empty data.';
            return;
        }
        for (let j = 0; j < fieldData.length; j++) {
            data[j] = fieldData[j].data.value;
        }
        fields[i] = new Field({ name: category.fields[i], question: answer, data: data });
    }

    const label = Util.disableButton(Element.addQuestionButton);

    let fieldDocIds = [];
    try {
        for (let i = 0; i < fields.length; i++) {
            fieldDocIds[i] = await FirebaseController.addDocument(Constant.collectionNames.FIELDS, fields[i]);
        }
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
    } catch (e) {
        if (Constant.DEV) console.log(e);
        for (let i = 0; i < fieldDocIds.length; i++) {
            await FirebaseController.deleteDocument(Constant.collectionNames.FIELDS, fieldDocIds[i]);
        }
        Util.enableButton(Element.addQuestionButton, label);
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        resetModalAddQuestion();
        Util.display('Add failed', JSON.stringify(e));
    }
    

    const question = new Question({ answer: answer, info: info, category: category.name, fields: fieldDocIds });

    const errors = await question.validate();

    Element.addQuestionErrorAnswer.innerHTML = errors.answer ? errors.answer : '';
    Element.addQuestionErrorInfo.innerHTML = errors.info ? errors.info : '';
    Element.addQuestionErrorCategory.innerHTML = errors.category ? errors.category : '';
    Element.addQuestionErrorField.innerHTML = errors.fields ? errors.fields : '';

    if (Object.keys(errors).length != 0) {
        Util.enableButton(Element.addQuestionButton, label);
        return;
    }

    try {
        let questionId = await FirebaseController.addDocument(Constant.collectionNames.QUESTIONS, question);
        category.questions.push(questionId);
        await FirebaseController.editDocument(Constant.collectionNames.CATEGORIES, category.docId, category);
        Util.enableButton(Element.addQuestionButton, label);
        Element.modalAddQuestion.hide();
        resetModalAddQuestion();
        Util.display('Add successful', `${question.answer} has been added.`);
        showSpinner();
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        questionList = await FirebaseController.getFirstPage(Constant.collectionNames.QUESTIONS);
        showPrev = false;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        await buildHTML();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.enableButton(Element.addQuestionButton, label);
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        resetModalAddQuestion();
        Util.display('Add failed', JSON.stringify(e));
    }

}

async function editQuestion() {
    if (!category) {
        Element.editQuestionErrorCategory.innerHTML = 'Question category is required.';
        return;
    }

    const answer = Element.editQuestionAnswer.value;
    const info = Element.editQuestionInfo.value;
    let fields = [];
    for (let i = 0; i < category.fields.length; i++) {
        let data = [];
        const fieldData = document.getElementsByClassName(`edit-question-field-data-${category.fields[i]}`);
        if (fieldData.length < 1 || fieldData[0].data.value.trim() === '') {
            Element.editQuestionErrorField.innerHTML = 'Question field ' + category.fields[i] + ' cannot contain empty data.';
            return;
        }
        for (let j = 0; j < fieldData.length; j++) {
            data[j] = fieldData[j].data.value;
        }
        fields[i] = new Field({ name: category.fields[i], question: answer, data: data });
    }

    const label = Util.disableButton(Element.editQuestionButton);

    let categoryQuestionList = [];
    let fieldDocIds = [];

    let matchingFields = true;
    if (selected_question.fields.length !== category.fields.length) matchingFields = false;
    for (let i = 0; i < selected_question.fields.length && matchingFields; i++) {
        let field = await FirebaseController.getDocument(Constant.collectionNames.FIELDS, selected_question.fields[i].data);
        if (field.name !== category.fields[i]) matchingFields = false;
    }

    console.log(matchingFields);

    if (selected_question.category === category.name && matchingFields) {
        try {
            for (let i = 0; i < selected_question.fields.length; i++) {
                await FirebaseController.editDocument(Constant.collectionNames.FIELDS, selected_question.fields[i].data, fields[i]);
                fieldDocIds[i] = selected_question.fields[i];
            }
        } catch (e) {
            if (Constant.DEV) console.log(e);
            Util.enableButton(Element.editQuestionButton, label);
            categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
            resetModalEditQuestion();
            Util.display('Edit failed', JSON.stringify(e));
        }
    }  
    else {
        try {
            for (let i = 0; i < category.questions.length; i++) {
                if (category.questions[i].data !== selected_question.answer) categoryQuestionList.push(category.questions[i]);
            }
            category.questions = category.categoryQuestionList;

            console.log(selected_question);

            for (let i = 0; i < selected_question.fields.length; i++) {
                await FirebaseController.deleteField(selected_question.fields[i].data);
            }
            for (let i = 0; i < fields.length; i++) {
                fieldDocIds[i] = await FirebaseController.addDocument(Constant.collectionNames.FIELDS, fields[i]);
            }
            categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        } catch (e) {
            if (Constant.DEV) console.log(e);
            for (let i = 0; i < fieldDocIds.length; i++) {
                await FirebaseController.deleteDocument(Constant.collectionNames.FIELDS, fieldDocIds[i]);
            }
            Util.enableButton(Element.editQuestionButton, label);
            categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
            resetModalAddQuestion();
            Util.display('Edit failed', JSON.stringify(e));
        }
    }

    console.log(category);
    console.log(category.name);

    const question = new Question({ answer: answer, info: info, category: category.name, fields: fieldDocIds });

    const errors = await question.validate();

    Element.editQuestionErrorAnswer.innerHTML = errors.answer ? errors.answer : '';
    Element.editQuestionErrorInfo.innerHTML = errors.info ? errors.info : '';
    Element.editQuestionErrorCategory.innerHTML = errors.category ? errors.category : '';
    Element.editQuestionErrorField.innerHTML = errors.fields ? errors.fields : '';

    if (Object.keys(errors).length != 0) {
        Util.enableButton(Element.editQuestionButton, label);
        return;
    }

    try {
        await FirebaseController.editDocument(Constant.collectionNames.QUESTIONS, selected_question.docId, question);
        await FirebaseController.editDocument(Constant.collectionNames.CATEGORIES, category.docId, category);
        Util.enableButton(Element.editQuestionButton, label);
        Element.modalEditQuestion.hide();
        resetModalEditQuestion();
        Util.display('Edit successful', `${question.answer} has been edited.`);
        showSpinner();
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        questionList = await FirebaseController.getFirstPage(Constant.collectionNames.QUESTIONS);
        showPrev = false;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        await buildHTML();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.enableButton(Element.editQuestionButton, label);
        categoryList = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        resetModalAddQuestion();
        Util.display('Add failed', JSON.stringify(e));
    }

}

function buildFieldDiv() {
    for (let i = 0; i < category.fields.length; i++) {
        Element.addQuestionFieldsDiv.innerHTML += `
            <div class="add-question-field py-3" id="add-question-field-${category.fields[i]}">
                <h5 class="mb-0">${category.fields[i]}</h5>
                <div id="add-question-field-data-div-${category.fields[i]}"></div>
                <div class="d-flex flex-row p-1">
                    <input class="bg-dark text-light" style="width: 80%;" id="add-question-field-data-input-${category.fields[i]}" type="text"
                        name="data" placeholder="Data">
                    <div style="width: 10%;"></div>
                    <form method="post" class="add-question-field-data-button" style="width: 10%;">
                        <input type="hidden" name="field" value="${category.fields[i]}">
                        <button type="submit"
                            class="btn btn-outline-light" style="width: 100%; height: 100%">+</button>
                    </form>
                </div>
            </div>
        `;
    }

    const addFieldDataButtons = document.getElementsByClassName(`add-question-field-data-button`);
    for (let i = 0; i < addFieldDataButtons.length; i++) {
        addFieldDataButtons[i].addEventListener('submit', e => {
            e.preventDefault();
            const fieldDataInput = document.getElementById(`add-question-field-data-input-${e.target.field.value}`);
            if (!fieldDataInput.value || fieldDataInput.value.length < 1) {
                Element.addQuestionErrorField.innerHTML = 'Field data is too short.';
                return;
            }
            let data = [];
            const addFieldData = document.getElementsByClassName(`add-question-field-data-${e.target.field.value}`);
            for (let j = 0; j < addFieldData.length; j++) {
                data.push(addFieldData[j].data.value);
            }
            const addFieldDataInput = document.getElementById(`add-question-field-data-input-${e.target.field.value}`);
            for (let j = 0; j < data.length; j++) {
                if (data[j] === addFieldDataInput.value) {
                    Element.addQuestionErrorField.innerHTML = 'Duplicate data';
                    return;
                }
            }
            const fieldDataDiv = document.getElementById(`add-question-field-data-div-${e.target.field.value}`);
            fieldDataDiv.innerHTML = '';
            data.push(addFieldDataInput.value);
            addFieldDataInput.value = '';
            Element.addCategoryErrorField.innerHTML = '';
            for (let k = 0; k < data.length; k++) {
                fieldDataDiv.innerHTML += `
                        <form class="add-question-field-data-${e.target.field.value} p-1">
                            <div class="d-flex flew-row">
                                <input class="bg-dark text-light" style="width: 80%;" type="text" name="data" value="${data[k]}" disabled>
                                <input type="hidden" name="field" value="${e.target.field.value}">
                                <div style="width: 10%;"></div>
                                <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                            </div>
                        </form>
                    `;
            }
            addDataDeleteListeners();
            addFieldDataInput.focus();
        });
    }
}

function buildEditFieldDiv() {
    for (let i = 0; i < category.fields.length; i++) {
        Element.editQuestionFieldsDiv.innerHTML += `
            <div class="edit-question-field py-3" id="edit-question-field-${category.fields[i]}">
                <h5 class="mb-0">${category.fields[i]}</h5>
                <div id="edit-question-field-data-div-${category.fields[i]}"></div>
                <div class="d-flex flex-row p-1">
                    <input class="bg-dark text-light" style="width: 80%;" id="edit-question-field-data-input-${category.fields[i]}" type="text"
                        name="data" placeholder="Data">
                    <div style="width: 10%;"></div>
                    <form method="post" class="edit-question-field-data-button" style="width: 10%;">
                        <input type="hidden" name="field" value="${category.fields[i]}">
                        <button type="submit"
                            class="btn btn-outline-light" style="width: 100%; height: 100%">+</button>
                    </form>
                </div>
            </div>
        `;
    }

    const editFieldDataButtons = document.getElementsByClassName(`edit-question-field-data-button`);
    for (let i = 0; i < editFieldDataButtons.length; i++) {
        editFieldDataButtons[i].addEventListener('submit', e => {
            e.preventDefault();
            const fieldDataInput = document.getElementById(`edit-question-field-data-input-${e.target.field.value}`);
            if (!fieldDataInput.value || fieldDataInput.value.length < 1) {
                Element.editQuestionErrorField.innerHTML = 'Field data is too short.';
                return;
            }
            let data = [];
            const addFieldData = document.getElementsByClassName(`edit-question-field-data-${e.target.field.value}`);
            for (let j = 0; j < addFieldData.length; j++) {
                data.push(addFieldData[j].data.value);
            }
            const addFieldDataInput = document.getElementById(`edit-question-field-data-input-${e.target.field.value}`);
            for (let j = 0; j < data.length; j++) {
                if (data[j] === addFieldDataInput.value) {
                    Element.editQuestionErrorField.innerHTML = 'Duplicate data';
                    return;
                }
            }
            const fieldDataDiv = document.getElementById(`edit-question-field-data-div-${e.target.field.value}`);
            fieldDataDiv.innerHTML = '';
            data.push(addFieldDataInput.value);
            addFieldDataInput.value = '';
            Element.editCategoryErrorField.innerHTML = '';
            for (let k = 0; k < data.length; k++) {
                fieldDataDiv.innerHTML += `
                        <form class="edit-question-field-data-${e.target.field.value} p-1">
                            <div class="d-flex flew-row">
                                <input class="bg-dark text-light" style="width: 80%;" type="text" name="data" value="${data[k]}" disabled>
                                <input type="hidden" name="field" value="${e.target.field.value}">
                                <div style="width: 10%;"></div>
                                <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                            </div>
                        </form>
                    `;
            }
            addEditDataDeleteListeners();
            addFieldDataInput.focus();
        });
    }
}

function addDataDeleteListeners() {
    for (let i = 0; i < category.fields.length; i++) {
        const addFieldData = document.getElementsByClassName(`add-question-field-data-${category.fields[i]}`);
        for (let j = 0; j < addFieldData.length; j++) {
            addFieldData[j].addEventListener('submit', async e => {
                e.preventDefault();
                let data = [];
                for (let k = 0; k < addFieldData.length; k++) {
                    if (addFieldData[k].data.value !== e.target.data.value) data.push(addFieldData[k].data.value);
                }
                const fieldDataDiv = document.getElementById(`add-question-field-data-div-${e.target.field.value}`);
                fieldDataDiv.innerHTML = '';
                Element.addCategoryErrorField.innerHTML = '';
                for (let k = 0; k < data.length; k++) {
                    fieldDataDiv.innerHTML += `
                        <form class="add-question-field-data-${e.target.field.value} p-1">
                            <div class="d-flex flew-row">
                                <input class="bg-dark text-light" style="width: 80%;" type="text" name="data" value="${data[k]}" disabled>
                                <input type="hidden" name="field" value="${e.target.field.value}">
                                <div style="width: 10%;"></div>
                                <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                            </div>
                        </form>
                    `;
                }
                addDataDeleteListeners();
            });
        }
    }
}

function addEditDataDeleteListeners() {
    for (let i = 0; i < category.fields.length; i++) {
        const addFieldData = document.getElementsByClassName(`edit-question-field-data-${category.fields[i]}`);
        for (let j = 0; j < addFieldData.length; j++) {
            addFieldData[j].addEventListener('submit', async e => {
                e.preventDefault();
                let data = [];
                for (let k = 0; k < addFieldData.length; k++) {
                    if (addFieldData[k].data.value !== e.target.data.value) data.push(addFieldData[k].data.value);
                }
                const fieldDataDiv = document.getElementById(`edit-question-field-data-div-${e.target.field.value}`);
                fieldDataDiv.innerHTML = '';
                Element.editCategoryErrorField.innerHTML = '';
                for (let k = 0; k < data.length; k++) {
                    fieldDataDiv.innerHTML += `
                        <form class="edit-question-field-data-${e.target.field.value} p-1">
                            <div class="d-flex flew-row">
                                <input class="bg-dark text-light" style="width: 80%;" type="text" name="data" value="${data[k]}" disabled>
                                <input type="hidden" name="field" value="${e.target.field.value}">
                                <div style="width: 10%;"></div>
                                <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                            </div>
                        </form>
                    `;
                }
                addEditDataDeleteListeners();
            });
        }
    }
}

function resetModalAddQuestion() {
    Element.addQuestionAnswer.value = '';
    Element.addQuestionErrorAnswer.innerHTML = '';
    Element.addQuestionInfo.value = '';
    Element.addQuestionErrorInfo.innerHTML = '';
    Element.addQuestionCategory.value = '';
    Element.addQuestionErrorCategory.innerHTML = '';
    Element.addQuestionFieldsDiv.innerHTML = '';
    Element.addQuestionErrorField.innerHTML = '';

    category = null;
    selected_question = null;
}

function resetModalEditQuestion() {
    Element.editQuestionAnswer.value = '';
    Element.editQuestionErrorAnswer.innerHTML = '';
    Element.editQuestionInfo.value = '';
    Element.editQuestionErrorInfo.innerHTML = '';
    Element.editQuestionCategory.value = '';
    Element.editQuestionErrorCategory.value = '';
    Element.editQuestionFieldsDiv.innerHTML = '';
    Element.editQuestionErrorField.innerHTML = '';

    category = null;
    selected_question = null;
}