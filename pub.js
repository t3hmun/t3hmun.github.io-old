'use strict';

const fs = require('fs');
const path = require('path');
const md = require('./md');
const pug = require('pug');
const less = require('less');

const templateDir = './templates';
const site = {
    title: 't3hmun',
    description: 't3hmun\'s web log',
    baseUrl: 'http://t3hmun.github.io',
    nav: [
        { url: 'index.html', text: 'Home' },
        { url: 'info.html', text: 'Info' }
    ]
};

let debug = false;
const postDir = './posts';
let outputDir = './t3hmun.github.io';
let compressCSS = true;

if (process.argv.length > 2) {
    console.log('Config:');
    if (process.argv.find((e) => e == 'debug')) {
        debug = true;
        debug && console.log(' Debug-mode on.');
    }
    if (process.argv.find((e) => e == 'test')) {
        // Fully resolved path allows testing without server.
        site.baseUrl = path.resolve('./test');
        outputDir = path.resolve('./test');
        debug && console.log('test outputDir=' + outputDir);
        compressCSS = false;
        console.log(' Test mode activated.');
    }
    console.log('');
}

publish();

function publish() {
    // render functions are async, they may overlap.
    renderPosts();
    renderCSS();
}

function renderCSS() {
    let lessPath = './css/main.less';
    let fullLessPath = path.resolve(lessPath);
    debug && console.log(fullLessPath);
    fs.readFile(lessPath, 'utf-8', (err, data) => {
        if (err) errorAndExit(err);
        let lessOptions = {
            filename: lessPath,
            compress: !compressCSS
        };

        less.render(data, lessOptions).then((lessOutput) => {
            debug && console.log(' imports: ' + lessOutput.imports);
            debug && console.log(' maps: ' + lessOutput.maps);
            return lessOutput.css;
        }).then((css) => {

            let cssDir = path.join(outputDir, 'css');
            let cssPath = path.join(cssDir, 'main.css');
            ensureDirCreated(cssDir).then(() => {
                fs.writeFile(cssPath, css, 'utf-8', (err) => {
                    if (err) errorAndExit(err);
                    console.log('> CSS done.');
                });
            }).catch((err) => {
                errorAndExit(err);
            });
        }).catch((err) => {
            errorAndExit(err);
        });
    });
}

function renderPosts() {
    loadTemplates().then((templates) => {
        return getPosts().then((posts) => {
            posts.forEach((post) => {
                let article = md.convert(post.data);
                let postTemp = templates.find((e) => e.name == 'post');
                let univTemp = templates.find((e) => e.name == 'universal');
                let postTemplatedData = postTemp.func({
                    site: site,
                    page: post,
                    content: article,
                    pretty: true
                });

                let finalData = univTemp.func({
                    site: site,
                    page: post,
                    content: postTemplatedData,
                    pretty: true
                });

                post.data = finalData;
            });
            return posts;
        }).then((posts) => {
            let postBaseUrl = path.join(outputDir, postDir);
            console.log(postBaseUrl);
            return ensureDirCreated(postBaseUrl).then(() => {
                let writes = [];
                posts.forEach((post) => {
                    writes.push(writePost(post));
                });
                return Promise.all(writes);
            });
        }).catch((err) => {
            errorAndExit(err);
        }).then(() => {
            console.log('> Posts done.');
        });
    });
}

/**
 * Quickly display error and crash. Fatal errors only.
 * @param  {Error} err The error.
 */
function errorAndExit(err) {
    console.log(err);
    process.exit();
}

function writePost(post) {
    let writePath = path.join(outputDir, post.url);
    return new Promise((resolve, reject) => {
        fs.writeFile(writePath, post.data, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function loadTemplates() {
    console.log('Loading templates...');
    return new Promise((resolve, reject) => {
        fs.readdir(templateDir, (err, fileNames) => {
            if (err) errorAndExit(err);

            let promises = [];
            fileNames.forEach((fileName) => {
                let filePath = path.join(templateDir, fileName);
                let name = path.parse(fileName).name;
                promises.push(new Promise((resolve, reject) => {
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        let template = pug.compile(data, {
                            filename: name
                        });

                        resolve({
                            func: template,
                            name: name
                        });
                    });
                }));
            });

            Promise.all(promises).then((templates) => {
                console.log('...templates loaded.');
                resolve(templates);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function getPosts() {
    console.log('Loading posts...');
    return new Promise((resolve, reject) => {
        fs.readdir(postDir, (err, fileNames) => {
            debug && console.log(fileNames);
            if (err) errorAndExit(err);

            let posts = [];
            // Extract date and title from post filename and store paths.
            fileNames.forEach((fileName) => {
                posts.push(ProcessPostFileName(fileName));
            });

            let promises = [];
            posts.forEach((post) => {
                promises.push(new Promise((resolve, reject) => {
                    fs.readFile(post.filePath, 'utf-8', (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        post.data = data;
                        resolve();
                    });
                }));
            });

            Promise.all(promises).then(() => {
                console.log('...loaded posts.');
                resolve(posts);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function ProcessPostFileName(fileName) {
    let post = {};
    post.filePath = path.join(postDir, fileName);
    let info = path.parse(post.filePath);
    post.file = info;
    let div = info.name.indexOf('_');
    let dateStr = info.name.slice(0, div);
    post.date = new Date(dateStr);
    post.title = info.name.slice(div + 1);
    // Urls are not fun with spaces.
    let urlName = info.name.replace(/\s/g, '-') + '.html';
    // Url relative to baseUrl.
    post.url = 'posts/' + urlName;
    return post;
}


