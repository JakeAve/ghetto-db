import assert from 'assert';
import fs from 'fs';
import GhettoDB from '../dist/index';

const fullTestPath = './db/test';
const testDir = './db';
const makeNewDB = () => new GhettoDB(fullTestPath);
const record1 = 'new-record';
const record2 = 'newer-record';
const obj1 = {
    testing: 'test string',
    number: 7777,
    object: { goingDeep: 'deep', deep: 'deeper' },
};
const obj2 = {
    testing: 'updated test string',
    number: 7778,
    object: { goingDeep: 'deep', deep: 'deepest' },
};
const arrayOfRecords = () => {
    const arr = [];
    for (let i = 0; i < 100; i++) arr.push('record-' + i);
    return arr;
};

describe('Ghetto DB', () => {
    it('DB should construct', () => {
        assert.ok(makeNewDB(), 'Constructed DB');
    });
    it('DB should store record', async () => {
        await assert.doesNotReject(
            makeNewDB().storeRecord(record1, { test: 123 }),
        );
    });
    it('DB should return value of stored record', async () => {
        const dbVal = await makeNewDB().storeRecord(record2, obj1);
        assert.deepStrictEqual(
            obj1,
            dbVal,
            'DB returns value or stored record',
        );
    });
    it('DB should read existing record', async () => {
        const dbVal = await makeNewDB().readRecord(record2);
        assert.deepStrictEqual(obj1, dbVal, 'DB reads existing record');
    });
    it('DB should update existing record', async () => {
        const dbVal = await makeNewDB().updateRecord(
            record2,
            ({ testing, number, object }) => ({
                testing: 'updated ' + testing,
                number: number + 1,
                object: {
                    ...object,
                    deep: 'deepest',
                },
            }),
        );
        assert.deepStrictEqual(obj2, dbVal, 'DB updates existing record');
    });
    it('DB should get records', async () => {
        const list = await makeNewDB().getRecords();
        assert.deepStrictEqual([record1, record2], list, 'DB gets records');
    });
    it('DB should delete records', async () => {
        const arr = [record1, record2];
        const db = makeNewDB();
        await Promise.all([db.destroyRecord(arr[0]), db.destroyRecord(arr[1])]);
        const list = await makeNewDB().getRecords();
        assert.deepStrictEqual([], list, 'DB deletes records');
    });
    it('DB should make 100 records', async () => {
        const db = makeNewDB();
        const promises = arrayOfRecords().map((record) =>
            db.storeRecord(record, obj1),
        );
        const results = Promise.all(promises);
        await assert.doesNotReject(results);
    });
    it('DB should destroy 100 records', async () => {
        const db = makeNewDB();
        const promises = arrayOfRecords().map((record) =>
            db.destroyRecord(record),
        );
        const results = Promise.all(promises);
        await assert.doesNotReject(results);
    });
    it('Test deletes test directory', () => {
        fs.rmSync(testDir, { recursive: true });
        assert.strictEqual(
            false,
            fs.existsSync(testDir),
            'Test deleted test directory',
        );
    });
});
