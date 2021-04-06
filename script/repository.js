class DocumentRepository {
    constructor(storage, collectionName) {
        this.storage = storage;
        this.collectionName = collectionName;
        this.idsLocationName = `id_${this.collectionName}`;
        this.listeners = [];

        if (!this._isCollectionInitialized())
            this._initCollection();
    }

    get data() {
        return JSON.parse(this.storage[this.collectionName]);
    }

    set data(val) {
        this.storage[this.collectionName] = JSON.stringify(val);
    }

    get nextId() {
        return this.storage[this.idsLocationName] = parseInt(this.storage[this.idsLocationName]) + 1;
    }

    findAll() {
        return [...this.data];
    }

    findOne(id) {
        return this.data.find(document => document.id === id);
    }

    removeOne(id) {
        this.data = this.data.filter(document => document.id !== id);
        this._emitChange();
    }

    insertOne(entity) {
        const document = {id: this.nextId, ...entity};
        this.data = this.data.concat(document);
        this._emitChange();
    }

    subscribe(listener) {
        this.listeners.push(listener);

        listener([...this.data]);

        return () => {
            this.listeners.splice(this.listeners.indexOf(listener))
        };
    }

    _isCollectionInitialized() {
        return this.storage[this.collectionName] !== undefined;
    }

    _initCollection() {
        this.data = [];
        this.storage[this.idsLocationName] = 0;
    }

    _emitChange() {
        const changedData = [...this.data];
        this.listeners.forEach(listener => listener(changedData));
    }
}

class ScratchRepository extends DocumentRepository {
    constructor(storage) {
        super(storage, "scratches");
    }

    createOne(content) {
        const scratch = {content};
        this.insertOne(scratch);
    }
}

class DocRepository extends DocumentRepository {
    constructor(storage) {
        super(storage, "docs");
    }

    createOne(title) {
        const doc = {title, content: ""};
        this.insertOne(doc);
    }
}
