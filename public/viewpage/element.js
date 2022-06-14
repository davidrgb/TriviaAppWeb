export const root = document.getElementById('root');

export const menu = document.getElementById('navbar');
export const menuLobbies = document.getElementById('menu-lobbies');
export const menuCategories = document.getElementById('menu-categories');
export const menuQuestions = document.getElementById('menu-questions');
export const menuError = document.getElementById('menu-error');
export const menuSignOut = document.getElementById('menu-signout');

export const formAddCategory = {
    form: document.getElementById('form-add-category'),
    errorName: document.getElementById('form-add-category-error-name'),
    errorField: document.getElementById('form-add-category-error-field'),
    addFieldButton: document.getElementById('form-add-category-field-button'),
}

export const formAddCategoryFields = {
    fieldsDiv: document.getElementById('form-add-category-fields-div'),
    fields: document.getElementsByClassName('form-add-category-fields'),
}

export const modalAddCategory = new bootstrap.Modal(document.getElementById('modal-add-category'), {backdrop: 'static'});
