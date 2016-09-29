/*
 Lib for doing file system stuff on a slightly higher level than fs.
 */
'use strict';

exports.ensureDirCreated = ensureDirCreated;
exports.readFilesInDir = readFilesInDir;
exports.write = write;
exports.writeMany = writeMany;

const fs = require('fs');
const path = require('path');

/**
 * Checks if a dir and its parent dirs exists and creates them if they don't exist.
 * @param {string} dirPath - The path of the dir.
 * @returns {Promise} - Error or void on success.
 */
function ensureDirCreated(dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, (err) => {
            if (err) {
                if (err.code == 'ENOENT') {
                    let dirAbove = path.join(dirPath, '../');
                    // Make sure the super-dir exists.
                    ensureDirCreated(dirAbove).then(() => {
                        fs.mkdir(dirPath, 666, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });
}

/**
 * Reads all the files in specified dir that match the filter. Not recursive.
 * @param {string} dirPath - Read files in this dir.
 * @param {function(string):boolean=} filterFunc - Returns true on file-names that should be included. Default
 * always true.
 * @param {string=} encoding - Defaults to 'utf-8'.
 * @returns {Promise} - An array of objects with string properties {name, path, dir, data}.
 */
function readFilesInDir(dirPath, filterFunc, encoding) {
    filterFunc = filterFunc || (()=>true);
    encoding = encoding || 'utf-8';
    return new Promise((resolve, reject)=> {
        fs.readdir(dirPath, encoding, (err, files)=> {
            if (err) {
                reject(err);
                return;
            }
            let reads = [];
            let failed = false;
            // In theory this sets the computer readings all the files in parallel.
            // Disks generally don't like being asked to do things in parallel.
            // However I think I'll trust node and the OS to deal with that detail, life is short.
            files.forEach((file)=> {
                let filePath = path.join(dirPath, file);
                reads.push(new Promise((resolve, reject)=> {
                    // Don't try to read anymore files if one has failed.
                    if (failed) return;
                    // Skip files that don't match the filter.
                    if (!filterFunc(file)) return;
                    fs.readFile(filePath, encoding, (err, data)=> {
                        if (err) {
                            failed = true;
                            reject(err);
                            return;
                        }
                        resolve({
                            name: file,
                            path: filePath,
                            dir: dirPath,
                            data: data
                        });
                    });
                }));
            });
            Promise.all(reads).then((loadedFiles)=> {
                resolve(loadedFiles);
            }).catch((err)=> {
                reject(err);
            });
        });
    });
}


/**
 * Writes data from each item.
 * @param {[]} items
 * @param {function({}):{}} func - Function that returns the {dir, fileName, data} for each item.
 * @return {Promise} - void.
 */
function writeMany(items, func) {
    //console.log(items);
    let writes = [];
    items.forEach((item)=> {
        let [dir, fileName, data] = func(item);
        writes.push(write(dir, fileName, data));
    });
    return Promise.all(writes);
}

/**
 * Writes a single file, promise wrapper for fs.writeFile.
 * @param {string} dir
 * @param {string} fileName
 * @param {string} data
 * @return {Promise} - void.
 */
function write(dir, fileName, data) {
    let writePath = path.join(dir, fileName);
    return new Promise((resolve, reject) => {
        fs.writeFile(writePath, data, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}