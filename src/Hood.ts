import fs from 'fs';
import { promisify } from 'util';
import { GhettoDB } from '.';
const writeFile = promisify(fs.writeFile);

type Filter = ((entry?: any) => boolean) | object;

interface Entry {
    idx: number;
    any: any;
}

export default class Hood {
    db: GhettoDB;
    name: string;
    data: any;
    path: string;
    doesFileExist: boolean;
    constructor(db, recordName: string, entries: object[]) {
        this.db = db;
        this.name = recordName;
        this.data = entries.map((entry, i) => ({ idx: i, ...entry }));
        this.path = this.db.getRecordPath(this.name);
        this.doesFileExist = fs.existsSync(this.path);
    }

    async add(...entries: object[]) {
        await this.createFileIfDoesNotExist();
        return this.db.updateRecord(this.name, (d) => {
            let i = d.length;
            for (let entry of entries) {
                d.push({ idx: i, ...entry });
                i++;
            }
            return d;
        });
    }

    private createFile() {
        return writeFile(this.path, JSON.stringify(this.data));
    }

    private async createFileIfDoesNotExist() {
        if (!this.doesFileExist) {
            await this.createFile();
            this.doesFileExist = true;
        }
    }

    async delete(filter: Filter = () => true) {
        await this.createFileIfDoesNotExist();
        const arr = await this.db.readRecord(this.name);
        let result = arr;
        let deleted = [];
        if (typeof filter === 'function') {
            deleted = arr.filter(filter);
            result = arr.filter((entry) => !filter(entry));
        } else {
            deleted = arr.filter((entry) => {
                for (let key in filter as object)
                    if (entry[key] !== filter[key]) return false;
                return true;
            });
            result = arr.filter((entry) => {
                for (let key in filter as object)
                    if (entry[key] !== filter[key]) return true;
                return false;
            });
        }
        await this.db.updateRecord(this.name, result);
        return deleted;
    }

    async deleteIdx(idx: number) {
        return this.deleteOne({ idx });
    }

    async deleteOne(filter: Filter) {
        await this.createFileIfDoesNotExist();
        const arr = await this.db.readRecord(this.name);
        let result = arr;
        let deletedIndex = -1;
        if (typeof filter === 'function') deletedIndex = arr.findIndex(filter);
        else
            deletedIndex = arr.findIndex((entry) => {
                for (let key in filter as object)
                    if (entry[key] !== filter[key]) return false;
                return true;
            });

        result = arr.slice(0, deletedIndex).concat(arr.slice(deletedIndex + 1));
        await this.db.updateRecord(this.name, result);
        return arr[deletedIndex] || null;
    }

    async read(
        filter: Filter = () => true,
        method: 'filter' | 'find' = 'filter',
    ): Promise<object[]> {
        await this.createFileIfDoesNotExist();
        const arr = await this.db.readRecord(this.name);
        if (typeof filter === 'function') return arr[method](filter);
        return arr[method]((entry) => {
            for (let key in filter as object)
                if (entry[key] !== filter[key]) return false;
            return true;
        });
    }

    readIdx(idx: number) {
        return this.readOne({ idx });
    }

    readOne(filter: ((entry?: any) => boolean) | object = () => true) {
        return this.read(filter, 'find');
    }

    async update(filter: Filter, updater: (entry: object) => object) {
        const arr = await this.read();
        const updateds = [];
        const result = arr.map((entry) => {
            let filtered = false;
            if (typeof filter === 'function') {
                filtered = filter(entry);
            } else {
                filtered = true;
                for (let key in filter as object)
                    if (entry[key] !== filter[key]) filtered = false;
            }

            if (!filtered) return entry;
            const idx = (entry as Entry).idx;
            const updated = { ...updater(entry), idx };
            updateds.push(updated);
            return updated;
        });
        await this.db.updateRecord(this.name, result);
        return updateds;
    }

    async updateIdx(idx: number, updater: (entry: object) => object) {
        return this.updateOne({ idx }, updater);
    }

    async updateOne(filter: Filter, updater: (entry: object) => object) {
        await this.createFileIfDoesNotExist();
        const arr = await this.db.readRecord(this.name);
        let index = -1;
        if (typeof filter === 'function') index = arr.findIndex(filter);
        else
            index = arr.findIndex((entry) => {
                for (let key in filter as object)
                    if (entry[key] !== filter[key]) return false;
                return true;
            });

        if (index === -1) return null;
        const idx = (arr[index] as Entry).idx;
        arr[index] = { ...updater(arr[index]), idx };
        await this.db.updateRecord(this.name, arr);
        return arr[index];
    }
}
