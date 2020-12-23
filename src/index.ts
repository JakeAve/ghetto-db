import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export default class GhettoDB {
    dbRoot: string;
    constructor(rootPath = './ghetto-db-root') {
        this.dbRoot = rootPath;
        if (!fs.existsSync(rootPath)) {
            fs.mkdirSync(rootPath, { recursive: true });
        }
    }

    recordPath(record: string) {
        return path.join(this.dbRoot, `/${record}.json`);
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

    async storeRecord(record: string, data: any) {
        try {
            const rp = this.recordPath(record);
            await writeFile(rp, JSON.stringify(data));
            return data;
        } catch (e) {
            throw e;
        }
    }

    async readRecord(record: string) {
        try {
            const rp = this.recordPath(record);
            const rawData = await readFile(rp);
            return JSON.parse(rawData.toString());
        } catch (e) {
            throw e;
        }
    }

    async updateRecord(record: string, callback: any) {
        try {
            const existingData = await this.readRecord(record);
            const data =
                typeof callback === 'function'
                    ? callback(existingData)
                    : callback;
            return await this.storeRecord(record, data);
        } catch (e) {
            throw e;
        }
    }

    async destroyRecord(record: string) {
        try {
            const rp = this.recordPath(record);
            await unlink(rp);
        } catch (e) {
            throw e;
        }
    }

    async getRecords() {
        try {
            const dirs = await readdir(this.dbRoot);
            return dirs.map((file) => file.replace(/\.json$/, ''));
        } catch (e) {
            throw e;
        }
    }
}
