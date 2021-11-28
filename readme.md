# Ghetto DB

Interface to store and read JSON files directly on the local machine. The databse will have a root directory and store each record as an individual JSON file at the top level of that directory.

-   ghetto-db-root
    -   record1.json
    -   record2.json
    -   record3.json

## Setup

```
npm i ghetto-db
```

## Initialize

```javascript
import { GhettoDB } from 'ghetto-db';
// const { GhettoDB } = require('ghetto-db') // Also supports CJS

const db = new GhettoDB('./db/dev'); // The path to the directory that will contain all the JSON files for this database
```

## Constructor

The constructor takes in a path as a parameter, which will serve as the root for all records. The path will be relative to where the process is running. By default the path will be set to `'./ghetto-db-root'`

```javascript
new GhettoDB('./path');
```

## Methods

### `Hood(recordName[,...entries])`

-   `recordName` {String} name of the record and the file ending in .json
-   `entries` {Object} add entries to database using separate arguments
-   Returns: {HoodInstance} an interface to interact with a single array stored in a json file

Creates an interface to interact with a single record (json file).

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
const brooklyn = db.Hood('brooklyn', { foo: 'bar' });
```

#### `Hood.add(...entries)`

-   `entries` {Object} add entries to database using separate arguments
-   Returns: {Promise} Fulfills with all entries in the record.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
const bronx = db.Hood('bronx');
const entries = await bronx.add({foo: 'bar'}, {foo2, 'bar2'});
// [ {idx: 0, foo: 'bar'}, {idx: 1, foo2: 'bar2'} ]
```

#### `Hood.read(filter[,method])`

-   `filter` {Function|Object} argument in function is the entry as it appears in the database and should return a boolean where true returns the entry. Objects will match where keys and values correspond to keys and values of entries in the database.
-   `method` {string} **Default** `'filter'`
-   Returns: {Promise} Fulfills with an array of entries if method is set to 'filter' or a single entry if method is set to 'find'.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
const soHo = db.Hood('soHo');
await soHo.add({foo: 'bar'}, {foo2, 'bar2'}, {foo: 'bar'});

const entries = await soHo.read()
// [ {idx: 0, foo: 'bar'}, {idx: 1, foo2: 'bar2'}, {idx: 2, foo: 'bar'} ]

const entriesWhereFooIsBar = await soHo.read(({foo}) => foo === 'bar');
// // [ {idx: 0, foo: 'bar'}, {idx: 2, foo: 'bar'} ]

const entriesWhereFooIsBar2 = await soHo.read({foo: 'bar'});
// // [ {idx: 0, foo: 'bar'}, {idx: 2, foo: 'bar'} ]
```

#### `Hood.readOne(filter)`

-   `filter` {Function|Object} see `Hood.read`
-   Returns: {Promise} fulfills with a single entry

#### `Hood.readIdx(idx)`

-   `idx` {Number}
-   Returns: {Promise} fulfills with a single entry

#### `Hood.update(filter, updater)`

-   `filter` {Function|Object} argument in function is the entry as it appears in the database and should return a boolean where true returns the entry. Objects will match where keys and values correspond to keys and values of entries in the database.
-   `updater` {Function} takes in an entry from the database and returns the updated entry. Modifications of `idx` are ignored.
-   Returns: {Promise} Fulfills with an array of entries that are updated.

Updates entries in the record.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
const soHo = db.Hood('soHo');
await soHo.add({foo: 'bar'}, {foo2, 'bar2'}, {foo: 'bar'});

const updatedEntries = await soHo.update({foo: 'bar'}, ({foo}) => ({bar: foo}))
// [ {idx: 0, bar: 'bar'}, {idx: 2, bar: 'bar'} ]

const allEntries = await soHo.read();
// [ {idx: 0, bar: 'bar'}, {idx: 1, foo2: 'bar2'}, {idx: 2, bar: 'bar'} ]
```

#### `Hood.updateOne(filter, updater)`

-   `filter` {Function|Object} see `Hood.update`
-   `updater` {Function} see `Hood.update`
-   Returns: {Promise} fulfills with the single updated entry or `null` if nothing matched

#### `Hood.updateIdx(idx, updater)`

-   `idx` {Number} the corresponding `idx`
-   `updater` {Function} see `Hood.update`
-   Returns: {Promise} fulfills with the single updated entry or `null` if nothing matched

#### `Hood.delete(filter)`

-   `filter` {Function|Object} argument in function is the entry as it appears in the database and should return a boolean where true returns the entry. Objects will match where keys and values correspond to keys and values of entries in the database.
-   Returns: {Promise} Fulfills with an array of now deleted entries.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
const queens = db.Hood('queens');
await queens.add({foo: 'bar'}, {foo2, 'bar2'}, {foo: 'bar'});

const deletedEntries = await queens.delete({foo: 'bar'})
// [ {idx: 0, foo: 'bar'}, {idx: 2, foo: 'bar'} ]

const remainingEntries = await queens.read()
// [ {idx: 1, foo2: 'bar2'} ]
```

#### `Hood.deleteOne(filter)`

-   `filter` {Function|Object} see `Hood.delete`
-   Returns: {Promise} fulfills with the single deleted entry or `null` if nothing matched

#### `Hood.deleteIdx(idx)`

-   `idx` {Number} the corresponding `idx`
-   Returns: {Promise} fulfills with the single deleted entry or `null` if nothing matched

### `storeRecord(recordName, data)`

Creates a JSON file using the `recordName` (string) and `data` (any primitive type). If successful, returns the parsed data stored in the record.

This method will override any existing data in the record. To update a record and have access to the existing data see `updateRecord`.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
db.storeRecord('users', []).then(() => console.log('created users record'));
```

### `readRecord(recordName)`

Returns parsed data from a JSON file using the `recordName` (string).

```javascript
const { GhettoDB }  = require('ghetto-db');

const db = new GhettoDB('./db/dev');
db.readRecord('users').then(() => );
```

### `updateRecord(recordName, callback || data)`

Updates a record using the `recordName` (string) and either a `callback` (function) or `data` (any primitive type). The callback function takes in the existing data as a parameter. If successful, returns the data stored in the record. This method will throw an error if the record does not already exist.

```javascript
const { GhettoDB }  = require('ghetto-db');

const db = new GhettoDB('./db/dev');

    // assume 'users' record is an empty array
  db.updateRecord('users', (users) => users.push('John Doe'))
    .then((data) => {
        console.log(data),
        // will console.log [ "John Doe" ]
    });

```

### `destroyRecord(recordName)`

Destroys a record by deleting the JSON file using the `recordName` (string). Returns undefined.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
db.destroyRecord('users').then(() => console.log('Record was deleted'));
```

### `getRecords()`

Returns an array of all the record names.

```javascript
import { GhettoDB } from 'ghetto-db';

const db = new GhettoDB('./db/dev');
db.getRecords().then((recordNames) => console.log(recordNames));
```
