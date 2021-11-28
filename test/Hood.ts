import assert from 'assert';
import fs from 'fs';
import { GhettoDB } from '../dist/index';

const fullTestPath = './HoodDB/test';
const testDir = './HoodDB';
const makeNewDB = () => new GhettoDB(fullTestPath);

describe('Hood', () => {
    it('Hood should add entries', async () => {
        const db = makeNewDB();
        const brooklyn = db.Hood('brooklyn', { test: 'test0' });
        const data = await brooklyn.add({ test: 'test1' }, { test: 'test2' });
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'test0' },
            { idx: 1, test: 'test1' },
            { idx: 2, test: 'test2' },
        ]);
    });
    it('Hood should write when reading file for first time', async () => {
        const db = makeNewDB();
        const queens = db.Hood('queens', { test: 'test0' }, { test: 'test1' });
        const data = await queens.read();
        const data2 = await queens.read();
        assert.deepStrictEqual(data, data2);
    });
    it('Hood should read single entry', async () => {
        const db = makeNewDB();
        const bronx = db.Hood(
            'bronx',
            { test: 'test0' },
            { test: 'test1' },
            { test: 'test2' },
        );
        const data = await bronx.readOne({ test: 'test2' });
        assert.deepStrictEqual(data, { idx: 2, test: 'test2' });
    });
    it('Hood should read single entry by index', async () => {
        const db = makeNewDB();
        const stattenIsland = db.Hood(
            'stattenIsland',
            { test: 'test0' },
            { test: 'test1' },
            { test: 'test2' },
        );
        const data = await stattenIsland.readIdx(2);
        assert.deepStrictEqual(data, { idx: 2, test: 'test2' });
    });
    it('Hood should read entries', async () => {
        const db = makeNewDB();
        const manhattan = db.Hood(
            'manhattan',
            { test: 'test' },
            { test: 'test' },
            { test: 'test' },
        );
        const data = await manhattan.read({ test: 'test' });
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'test' },
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test' },
        ]);
    });
    it('Hood should delete entries with function', async () => {
        const db = makeNewDB();
        const statenIsland = db.Hood(
            'statenIsland',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const deleted = await statenIsland.delete(
            ({ test }) => test === 'test',
        );
        assert.deepStrictEqual(deleted, [
            { idx: 0, test: 'test' },
            { idx: 1, test: 'test' },
        ]);
        const data = await statenIsland.read();
        assert.deepStrictEqual(data, [{ idx: 2, test: 'test1' }]);
    });
    it('Hood should delete entries with object', async () => {
        const db = makeNewDB();
        const midTown = db.Hood(
            'midTown',
            { test: 'test', test2: 'test2' },
            { test: 'test' },
            { test: 'test1' },
        );
        const deleted = await midTown.delete({ test: 'test', test2: 'test2' });
        assert.deepStrictEqual(deleted, [
            { idx: 0, test: 'test', test2: 'test2' },
        ]);
        const data = await midTown.read();

        assert.deepStrictEqual(data, [
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should delete single entry with function', async () => {
        const db = makeNewDB();
        const downtown = db.Hood(
            'downtown',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const deleted = await downtown.deleteOne(({ test }) => test === 'test');
        assert.deepStrictEqual(deleted, { idx: 0, test: 'test' });
        const data = await downtown.read();

        assert.deepStrictEqual(data, [
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should delete single entry with object', async () => {
        const db = makeNewDB();
        const harlem = db.Hood(
            'harlem',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const deleted = await harlem.deleteOne({ test: 'test' });
        assert.deepStrictEqual(deleted, { idx: 0, test: 'test' });
        const data = await harlem.read();

        assert.deepStrictEqual(data, [
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should delete single entry with index', async () => {
        const db = makeNewDB();
        const washingtonHeights = db.Hood(
            'washingtonHeights',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const deleted = await washingtonHeights.deleteIdx(2);
        assert.deepStrictEqual(deleted, { idx: 2, test: 'test1' });
        const data = await washingtonHeights.read();

        assert.deepStrictEqual(data, [
            { idx: 0, test: 'test' },
            { idx: 1, test: 'test' },
        ]);
    });
    it('Hood should update many entries with function', async () => {
        const db = makeNewDB();
        const soHo = db.Hood(
            'soHo',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const updated = await soHo.update(
            ({ test }) => test === 'test',
            () => ({
                test: 'updatedTest',
            }),
        );
        assert.deepStrictEqual(updated, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'updatedTest' },
        ]);
        const data = await soHo.read();
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'updatedTest' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should update many entries with object', async () => {
        const db = makeNewDB();
        const jamaica = db.Hood(
            'jamaica',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const updated = await jamaica.update({ test: 'test' }, () => ({
            test: 'updatedTest',
        }));
        assert.deepStrictEqual(updated, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'updatedTest' },
        ]);
        const data = await jamaica.read();
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'updatedTest' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should update single entry with function', async () => {
        const db = makeNewDB();
        const chinaTown = db.Hood(
            'chinaTown',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const updated = await chinaTown.updateOne(
            ({ test }) => test === 'test',
            () => ({
                test: 'updatedTest',
            }),
        );
        assert.deepStrictEqual(updated, { idx: 0, test: 'updatedTest' });
        const data = await chinaTown.read();
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should update single entry with object', async () => {
        const db = makeNewDB();
        const hellsKitchen = db.Hood(
            'hellsKitchen',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const updated = await hellsKitchen.updateOne({ test: 'test' }, () => ({
            test: 'updatedTest',
        }));
        assert.deepStrictEqual(updated, { idx: 0, test: 'updatedTest' });
        const data = await hellsKitchen.read();
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'updatedTest' },
            { idx: 1, test: 'test' },
            { idx: 2, test: 'test1' },
        ]);
    });
    it('Hood should update single entry with index', async () => {
        const db = makeNewDB();
        const greenwich = db.Hood(
            'greenwich',
            { test: 'test' },
            { test: 'test' },
            { test: 'test1' },
        );
        const updated = await greenwich.updateIdx(1, () => ({
            test: 'updatedTest',
        }));
        assert.deepStrictEqual(updated, { idx: 1, test: 'updatedTest' });
        const data = await greenwich.read();
        assert.deepStrictEqual(data, [
            { idx: 0, test: 'test' },
            { idx: 1, test: 'updatedTest' },
            { idx: 2, test: 'test1' },
        ]);
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
