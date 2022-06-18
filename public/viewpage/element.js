export const root = document.getElementById('root');

export const menu = document.getElementById('navbar');
export const menuLobbies = document.getElementById('menu-lobbies');
export const menuCategories = document.getElementById('menu-categories');
export const menuQuestions = document.getElementById('menu-questions');
export const menuError = document.getElementById('menu-error');
export const menuSignOut = document.getElementById('menu-signout');

export const modalDisplay = new bootstrap.Modal(document.getElementById('modal-display'), {backdrop: 'static'});
export const modalDisplayTitle = document.getElementById('modal-display-title');
export const modalDisplayBody = document.getElementById('modal-display-body');

export const modalAddCategory = new bootstrap.Modal(document.getElementById('modal-add-category'), {backdrop: 'static'});
export const modalEditCategory = new bootstrap.Modal(document.getElementById('modal-edit-category'), {backdrop: 'static'});

export const modalAddQuestion = new bootstrap.Modal(document.getElementById('modal-add-question'), {backdrop: 'static'});

export const addCategoryName = document.getElementById('add-category-name');
export const addCategoryFieldsDiv = document.getElementById('add-category-fields-div');
export const addCategoryFields = document.getElementsByClassName('add-category-field');
export const addCategoryFieldInput = document.getElementById('add-category-field-input');
export const addCategoryFieldButton = document.getElementById('add-category-field-button');
export const addCategoryErrorName = document.getElementById('add-category-error-name');
export const addCategoryErrorField = document.getElementById('add-category-error-field');
export const addCategoryButton = document.getElementById('add-category-button');

export const editCategoryName = document.getElementById('edit-category-name');
export const editCategoryFieldsDiv = document.getElementById('edit-category-fields-div');
export const editCategoryFields = document.getElementsByClassName('edit-category-field');
export const editCategoryFieldInput = document.getElementById('edit-category-field-input');
export const editCategoryFieldButton = document.getElementById('edit-category-field-button');
export const editCategoryErrorName = document.getElementById('edit-category-error-name');
export const editCategoryErrorField = document.getElementById('edit-category-error-field');
export const editCategoryButton = document.getElementById('edit-category-button');

export const addQuestionAnswer = document.getElementById('add-question-answer');
export const addQuestionInfo = document.getElementById('add-question-info');
export const addQuestionCategory = document.getElementById('add-question-category');
export const addQuestionCategoryDropdown = document.getElementById('add-question-category-dropdown');
export const addQuestionCategoryDropdownButton = document.getElementById('add-question-category-dropdown-button');
export const addQuestionFieldsDiv = document.getElementById('add-question-fields-div');
export const addQuestionErrorAnswer = document.getElementById('add-question-error-answer');
export const addQuestionErrorInfo = document.getElementById('add-question-error-info');
export const addQuestionErrorCategory = document.getElementById('add-question-error-category');
export const addQuestionErrorField = document.getElementById('add-question-error-field');
export const addQuestionButton = document.getElementById('add-question-button');
