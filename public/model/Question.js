export class Question {
    constructor(data) {
        this.answer = data.answer;
        this.info = data.info;
        this.category = data.collection;
        this.fields = data.fields;
    }
}