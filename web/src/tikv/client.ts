import Transaction from './transaction';

export default class Client {
    public begin(): Transaction {
        return new Transaction();
    }

    public get() {

    }

    public put() {

    }

    public delete() {

    }
}