export class Category {
    constructor(data) {
        this.name = data.name;
        this.fields = data.fields;
        this.questions = data.questions;
    }

    validate() {
        const errors = {};
        if (!this.name || this.name.length < 3)
            errors.name = 'Category name is too short. Min 3 chars.';
        if (!this.fields || this.fields.length < 1)
            errors.field = 'Category must have at least one field';
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].length < 3)
                errors.field += 'Field ' + field + ' is too short. Min 3 chars.';
        }

        return errors;
    }
}