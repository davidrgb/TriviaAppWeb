import * as Auth from '../controller/auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Route from '../controller/route.js';
import * as Util from './util.js';
import * as Element from './element.js';
import * as Constant from '../model/constant.js';
import { Category } from '../model/Category.js';

let page = 1;
let categoryList = [];

let showPrev;
let showNext;

let docId;

export function addEventListeners() {
    Element.menuCategories.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathname.CATEGORIES)
        const label = Util.disableButton(Element.menuCategories);
        await categories_page();
        Util.enableButton(Element.menuCategories, label);
    });

    Element.addCategoryFieldButton.addEventListener('click', () => {
        if (!Element.addCategoryFieldInput.value || Element.addCategoryFieldInput.value.length < 3) {
            Element.addCategoryErrorField.innerHTML = 'Field is too short. Min 3 chars.';
            return;
        }
        let fields = [];
        for (let i = 0; i < Element.addCategoryFields.length; i++) {
            fields.push(Element.addCategoryFields[i].field.value);
        }
        for (let i = 0; i < fields.length; i++) {
            if (fields[i] === Element.addCategoryFieldInput.value) {
                Element.addCategoryErrorField.innerHTML = 'Duplicate field.';
                return;
            }
        }
        Element.addCategoryErrorField.innerHTML = '';
        Element.addCategoryFieldsDiv.innerHTML = '';
        fields.push(Element.addCategoryFieldInput.value);
        Element.addCategoryFieldInput.value = '';
        for (let i = 0; i < fields.length; i++) {
            Element.addCategoryFieldsDiv.innerHTML += `
                <form class="add-category-field p-1">
                    <div class="d-flex flex-row">
                        <input class="bg-dark text-light" style="width: 80%;" type="text" name="field" value="${fields[i]}" disabled>
                        <div style="width: 10%;"></div>
                        <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                    </div>
                </form>
            `;
        }
        addFieldDeleteListeners();
        Element.addCategoryFieldInput.focus();
    });

    Element.addCategoryButton.addEventListener('click', async () => {
        await addNewCategory();
    });

    Element.editCategoryFieldButton.addEventListener('click', () => {
        if (!Element.editCategoryFieldInput.value || Element.editCategoryFieldInput.value.length < 3) {
            Element.editCategoryErrorField.innerHTML = 'Field is too short. Min 3 chars.';
            return;
        }
        let fields = [];
        for (let i = 0; i < Element.editCategoryFields.length; i++) {
            fields.push(Element.editCategoryFields[i].field.value);
        }
        for (let i = 0; i < fields.length; i++) {
            if (fields[i] === Element.editCategoryFieldInput.value) {
                Element.editCategoryErrorField.innerHTML = 'Duplicate field.';
                return;
            }
        }
        Element.editCategoryErrorField.innerHTML = '';
        Element.editCategoryFieldsDiv.innerHTML = '';
        fields.push(Element.editCategoryFieldInput.value);
        Element.editCategoryFieldInput.value = '';
        for (let i = 0; i < fields.length; i++) {
            Element.editCategoryFieldsDiv.innerHTML += `
                <form class="edit-category-field p-1">
                    <div class="d-flex flex-row">
                        <input class="bg-dark text-light" style="width: 80%;" type="text" name="field" value="${fields[i]}" disabled>
                        <div style="width: 10%;"></div>
                        <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                    </div>
                </form>
            `;
        }
        editFieldDeleteListeners();
    });

    Element.editCategoryButton.addEventListener('click', async () => {
        await editCategory();
    });
}

export async function categories_page() {

    if (!Auth.currentUser) return;

    showSpinner();

    categoryList = await FirebaseController.getFirstPage(Constant.collectionNames.CATEGORIES);
    page = 1;
    showPrev = false;
    showNext = await FirebaseController.getShowNext();

    await buildHTML();
}

async function buildHTML() {    
    let html = `
        <div class="py-3">
            <button class="btn btn-outline-light" id="add-button">Add Category</button>
        </div>
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
    addButton.addEventListener('click', () => {
        resetModalAddCategory();
        Element.modalAddCategory.show();
    });

    const editForms = document.getElementsByClassName('form-edit-category');
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            const category = await FirebaseController.getDocument(Constant.collectionNames.CATEGORIES, e.target.docId.value);
            Element.editCategoryName.value = category.name;
            Element.editCategoryErrorName.innerHTML = '';
            Element.editCategoryFieldsDiv.innerHTML = '';
            for (let i = 0; i < category.fields.length; i++) {
                Element.editCategoryFieldsDiv.innerHTML += `
                    <form class="edit-category-field p-1">
                        <div class="d-flex flex-row">
                            <input class="bg-dark text-light" style="width: 80%;" type="text" name="field" value="${category.fields[i]}" disabled>
                            <div style="width: 10%;"></div>
                            <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                        </div>
                    </form>
                `;
            }
            Element.editCategoryFieldInput.value = '';
            Element.editCategoryErrorField.innerHTML = '';
            editFieldDeleteListeners();
            docId = e.target.docId.value;
            Element.modalEditCategory.show();
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
            categoryList = await FirebaseController.deleteDocument(Constant.collectionNames.CATEGORIES, e.target.docId.value);
            Util.display('Delete successful', 'Category has been deleted.');
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
        categoryList = await FirebaseController.getPreviousPage(Constant.collectionNames.CATEGORIES);
        showPrev = await FirebaseController.getShowPrevious();
        showNext = true;
        page = await FirebaseController.getPage();
        Util.enableButton(prevButton, label);
        await buildHTML();
    });

    nextButton.addEventListener('click', async () => {
        const label = Util.disableButton(nextButton);
        showSpinner();
        categoryList = await FirebaseController.getNextPage(Constant.collectionNames.CATEGORIES);
        showPrev= true;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        Util.enableButton(nextButton, label);
        await buildHTML();
    });

    Element.menu.style.display = "block";
}

function showSpinner() {
    Element.root.innerHTML = `
        <div class="spinner-border text-light" role="status"></div>
    `
}

function buildCategoryRow(category) {
    let fieldString = '';
    category.fields.forEach(field => {
        if (fieldString !== '') fieldString += ', ';
        fieldString += field;
    })
    return `
        <tr class="text-light" id="lobby-category-${category.docId}">
            <td>${category.name}</td>
            <td>${fieldString}</td>
            <td>${category.questions.length}</td>
            <td>
                <form class="form-edit-category" method="post" style="display: inline-block;">
                    <input type="hidden" name="docId" value="${category.docId}">
                    <button type="submit" class="btn btn-outline-warning">Edit</button>
                </form>
            </td>
            <td>
                <form class="form-delete-category" method="post" style="display: inline-block;">
                    <input type="hidden" name="docId" value="${category.docId}">
                    <button type="submit" class="btn btn-outline-danger">Delete</button>
                </form>
            </td>
        </tr>
    `;
}

async function addNewCategory() {
    const label = Util.disableButton(Element.addCategoryButton);
    const name = Element.addCategoryName.value;
    let fields = [];
    for (let i = 0; i < Element.addCategoryFields.length; i++) {
        fields[i] = Element.addCategoryFields[i].field.value;
    }
    const questions = [];

    const category = new Category({ name, fields, questions });

    const errors = await category.validate();

    Element.addCategoryErrorName.innerHTML = errors.name ? errors.name : '';
    Element.addCategoryErrorField.innerHTML = errors.field ? errors.field : '';

    if (Object.keys(errors).length != 0) {
        Util.enableButton(Element.addCategoryButton, label);
        return;
    }

    try {
        await FirebaseController.addDocument(Constant.collectionNames.CATEGORIES, category);
        Util.enableButton(Element.addCategoryButton, label);
        Element.modalAddCategory.hide();
        resetModalAddCategory();
        Util.display('Add successful', `${category.name} has been added.`);
        showSpinner();
        categoryList = await FirebaseController.getFirstPage(Constant.collectionNames.CATEGORIES);
        showPrev = false;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        await buildHTML();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.enableButton(Element.addCategoryButton, label);
        Element.modalAddCategory.hide();
        resetModalAddCategory();
        Util.display('Add failed', JSON.stringify(e));
    }
}

function addFieldDeleteListeners() {
    for (let i = 0; i < Element.addCategoryFields.length; i++) {
        Element.addCategoryFields[i].addEventListener('submit', async e => {
            e.preventDefault();
            let fields = [];
            for (let i = 0; i < Element.addCategoryFields.length; i++) {
                if (Element.addCategoryFields[i].field.value !== e.target.field.value) fields.push(Element.addCategoryFields[i].field.value);
            }
            Element.addCategoryFieldsDiv.innerHTML = '';
            Element.addCategoryErrorField.innerHTML = '';
            for (let i = 0; i < fields.length; i++) {
                Element.addCategoryFieldsDiv.innerHTML += `
                    <form class="add-category-field p-1">
                        <div class="d-flex flex-row">
                            <input class="bg-dark text-light" style="width: 80%;" type="text" name="field" value="${fields[i]}" disabled>
                            <div style="width: 10%;"></div>
                            <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                        </div>
                    </form>
                `;
            }
            addFieldDeleteListeners();
        });
    }
}

function resetModalAddCategory() {
    Element.addCategoryName.value = '';
    Element.addCategoryErrorName.innerHTML = '';
    Element.addCategoryFieldsDiv.innerHTML = '';
    Element.addCategoryFieldInput.value = '';
    Element.addCategoryErrorField.innerHTML = '';
}

async function editCategory() {
    const label = Util.disableButton(Element.editCategoryButton);
    const name = Element.editCategoryName.value;
    let fields = [];
    for (let i = 0; i < Element.editCategoryFields.length; i++) {
        fields[i] = Element.editCategoryFields[i].field.value;
    }
    const questions = [];

    const category = new Category({ name, fields, questions });

    const errors = await category.validate(docId);

    Element.editCategoryErrorName.innerHTML = errors.name ? errors.name : '';
    Element.editCategoryErrorField.innerHTML = errors.field ? errors.field : '';

    if (Object.keys(errors).length != 0) {
        Util.enableButton(Element.editCategoryButton, label);
        return;
    }

    try {
        await FirebaseController.editDocument(Constant.collectionNames.CATEGORIES, docId, category);
        docId = '';
        Util.enableButton(Element.editCategoryButton, label);
        Element.modalEditCategory.hide();
        Util.display('Edit successful', `${category.name} has been edited.`);
        showSpinner();
        categoryList = await FirebaseController.getFirstPage(Constant.collectionNames.CATEGORIES);
        showPrev = false;
        showNext = await FirebaseController.getShowNext();
        page = await FirebaseController.getPage();
        await buildHTML();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        docId = '';
        Util.enableButton(Element.editCategoryButton, label);
        Element.modalEditCategory.hide();
        Util.display('Edit failed', JSON.stringify(e));
    }
}

function editFieldDeleteListeners() {
    for (let i = 0; i < Element.editCategoryFields.length; i++) {
        Element.editCategoryFields[i].addEventListener('submit', async e => {
            e.preventDefault();
            let fields = [];
            for (let i = 0; i < Element.editCategoryFields.length; i++) {
                if (Element.editCategoryFields[i].field.value !== e.target.field.value) fields.push(Element.editCategoryFields[i].field.value);
            }
            Element.editCategoryFieldsDiv.innerHTML = '';
            Element.editCategoryErrorField.innerHTML = '';
            for (let i = 0; i < fields.length; i++) {
                Element.editCategoryFieldsDiv.innerHTML += `
                    <form class="edit-category-field p-1">
                        <div class="d-flex flex-row">
                            <input class="bg-dark text-light" style="width: 80%;" type="text" name="field" value="${fields[i]}" disabled>
                            <div style="width: 10%;"></div>
                            <button style="width: 10%;" type="submit" class="btn btn-outline-danger">-</button>
                        </div>
                    </form>
                `;
            }
            editFieldDeleteListeners();
        });
    }
}
