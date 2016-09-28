/*
Lib for doing file system stuff on a slightly higher level than fs.
 */
'use strict';

exports.ensureDirCreated = ensureDirCreated;

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
