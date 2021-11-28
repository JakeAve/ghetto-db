import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import Hood from './Hood';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class GhettoDB {
    dbRoot: string;
    constructor(rootPath = './ghetto-db-root') {
        this.dbRoot = rootPath;
        if (!fs.existsSync(rootPath)) {
            fs.mkdirSync(rootPath, { recursive: true });
        }
    }

    async destroyAllRecords() {
        const dirs = await readdir(this.dbRoot);
        const promises = dirs.map((file) =>
            unlink(path.join(this.dbRoot, file)),
        );
        await Promise.all(promises);
    }

    async destroyRecord(recordName: string) {
        const rp = this.getRecordPath(recordName);
        await unlink(rp);
    }

    getRecordPath(recordName: string) {
        return path.join(this.dbRoot, `/${recordName}.json`);
    }

    async getRecords() {
        const dirs = await readdir(this.dbRoot);
        return dirs.map((file) => file.replace(/\.json$/, ''));
    }

    Hood(recordName: string, ...entries: object[]) {
        return new Hood(this, recordName, entries);
    }

    async readRecord(recordName: string) {
        const rp = this.getRecordPath(recordName);
        const rawData = await readFile(rp);
        return JSON.parse(rawData.toString());
    }

    async storeRecord(recordName: string, data: any = '') {
        const rp = this.getRecordPath(recordName);
        await writeFile(rp, JSON.stringify(data));
        return data;
    }

    async updateRecord(recordName: string, callback: any) {
        const existingData = await this.readRecord(recordName);
        const data =
            typeof callback === 'function' ? callback(existingData) : callback;
        return await this.storeRecord(recordName, data);
    }

    waitForRoot(rp: string) {
        return new Promise((resolve) => {
            if (fs.existsSync(this.dbRoot)) {
                resolve(rp);
            } else {
                fs.watch(this.dbRoot, { persistent: false }, () => {
                    resolve(rp);
                });
            }
        });
    }
}
