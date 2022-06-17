import * as FirebaseController from '../controller/firebase_controller.js';
import * as Constant from './constant.js';

export class Question {
    constructor(data) {
        this.answer = data.answer;
        this.info = data.info;
        this.category = data.category;
        this.fields = data.fields;
    }

    async validate() {
        const errors = {};
        if (!this.answer)
            errors.answer = 'Question answer is required.';
        if (!this.info)
            errors.info = 'Question info is required.';
        if (!this.category)
            errors.category = 'Question category is required.';
        const categories = await FirebaseController.getCollection(Constant.collectionNames.CATEGORIES);
        for (let i = 0; i < categories.length; i++) {
            let categoryFound = false;
            if (this.category === categories[i].name) {
                categoryFound = true;
                i = categories.length;
            }
            else if (i === categories.length - 1 && !categoryFound) {
                errors.category = 'Question category not found.';
            }
        }
        if (!this.fields || this.fields.length < 1)
            errors.fields = 'Question field required.';
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].data.length < 1)
                errors.fields = 'Question field ' + this.fields[i].name + ' must have data.';
        }
        return errors;
    }
}