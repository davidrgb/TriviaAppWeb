export class Question {
    constructor(data) {
        this.answer = data.answer;
        this.info = data.info;
        this.category = data.category;
        this.fields = data.fields;
    }
}