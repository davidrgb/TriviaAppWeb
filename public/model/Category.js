import * as FirebaseController from '../controller/firebase_controller.js';
import * as Constant from './constant.js';

export class Category {
    constructor(data) {
        this.name = data.name;
        this.fields = data.fields;
        this.questions = data.questions;
    }

    async validate(docId) {
        const errors = {};
        if (!this.name || this.name.length < 3)
            errors.name = 'Category name is too short. Min 3 chars.';
        const categories = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        for (let i = 0; i < categories.length; i++) {
            if (this.name === categories[i].name) {
                if (!docId || docId !== categories[i].docId) {
                    errors.name = 'Category name is already taken.';
                    i = categories.length;
                }
            }
        }
        if (!this.fields || this.fields.length < 1)
            errors.field = 'Category must have at least one field.';
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].length < 3)
                errors.field += 'Field ' + field + ' is too short. Min 3 chars.';
        }

        return errors;
    }
}