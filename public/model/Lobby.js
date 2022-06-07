export class Lobby {
    constructor(data) {
        this.id = data.id;
        this.timestamp = data.timestamp;
        this.open = data.open;
        this.players = data.players;
        this.category = data.category;
        this.questions = data.questions;
    }

    serialize() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            open: this.open,
            players: this.players,
            category: this.category,
            questions: this.questions,
        }
    }

    serializeForUpdate() {
        const l = {};
        if (this.id) l.id = this.id;
        if (this.timestamp) l.timestamp = this.timestamp;
        if (this.open) l.open = this.open;
        if (this.players) l.players = this.players;
        if (this.category) l.category = this.category;
        if (this.questions) l.questions = this.questions;
    }

    static deserialize(data) {
        const l = new Lobby(data);
        l.players = data.players;
        l.questions = data.questions;
        return l;
    }
}