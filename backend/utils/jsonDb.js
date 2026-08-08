import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

export const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`Error reading ${collection}.json:`, error);
    return [];
  }
};

export const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${collection}.json:`, error);
    return false;
  }
};

export const jsonDb = {
  find: (collection, filterFn = () => true) => {
    return readData(collection).filter(filterFn);
  },

  findOne: (collection, filterFn) => {
    return readData(collection).find(filterFn);
  },

  findById: (collection, id) => {
    return readData(collection).find(item => item._id === id);
  },

  create: (collection, doc) => {
    const data = readData(collection);
    const newDoc = {
      _id: doc._id || Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    writeData(collection, data);
    return newDoc;
  },

  findByIdAndUpdate: (collection, id, updates) => {
    const data = readData(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeData(collection, data);
    return data[index];
  },

  findByIdAndDelete: (collection, id) => {
    const data = readData(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const deleted = data.splice(index, 1);
    writeData(collection, data);
    return deleted[0];
  },

  insertMany: (collection, docs) => {
    const data = readData(collection);
    const newDocs = docs.map(doc => ({
      _id: doc._id || Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    }));
    data.push(...newDocs);
    writeData(collection, data);
    return newDocs;
  }
};
