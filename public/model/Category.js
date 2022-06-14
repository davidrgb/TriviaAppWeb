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
        if (!this.fields.length < 0)
            errors.field = 'Category must have at least one field';
        this.fields.forEach(field => {
            if (field.length < 3)
                errors.field += 'Field ' + field + ' is too short. Min 3 chars.';
        });

        return errors;
    }
}