export const root = document.getElementById('root');

export const menu = document.getElementById('navbar');
export const menuLobbies = document.getElementById('menu-lobbies');
export const menuCategories = document.getElementById('menu-categories');
export const menuQuestions = document.getElementById('menu-questions');
export const menuError = document.getElementById('menu-error');
export const menuSignOut = document.getElementById('menu-signout');

export const modalAddCategory = new bootstrap.Modal(document.getElementById('modal-add-category'), {backdrop: 'static'});

export const addCategoryName = document.getElementById('add-category-name');
export const addCategoryFieldsDiv = document.getElementById('add-category-fields-div');
export const addCategoryFields = document.getElementsByClassName('add-category-field');
export const addCategoryFieldInput = document.getElementById('add-category-field-input');
export const addCategoryFieldButton = document.getElementById('add-category-field-button');
export const addCategoryErrorName = document.getElementById('add-category-error-name');
export const addCategoryErrorField = document.getElementById('add-category-error-field');
export const addCategoryButton = document.getElementById('add-category-button');
