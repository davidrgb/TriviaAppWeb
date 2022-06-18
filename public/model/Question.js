export class Question {
    constructor(data) {
        this.answer = data.answer;
        this.info = data.info;
        this.category = data.category;
        this.fields = data.fields;
    }

    async validate() {
        console.log
        const errors = {};
        if (!this.answer)
            errors.answer = 'Question answer is required.';
        if (!this.info)
            errors.info = 'Question info is required.';
        if (!this.category)
            errors.category = 'Question category is required.';
        if (!this.fields || this.fields.length < 1)
            errors.fields = 'Question field required.';
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].data.length < 1)
                errors.fields = 'Question field ' + this.fields[i].name + ' must have data.';
        }
        return errors;
    }
}