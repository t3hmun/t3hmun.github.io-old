const fs = require('fs');
const path = require('path');
const md = require('./md');
const pug = require('pug');

const postDir = './posts';
const templateDir = './templates';
const site = {
    title: 't3hmun',
    description: "t3hmun's web log",
    baseUrl: 'http://t3hmun.github.io',
    nav: [
        { url: 'index.html', text: 'Home' },
        { url: 'info.html', text: 'Info' }
    ]
};

let outputDir = './t3hmun.github.io';

if (process.argv.length > 2 && process.argv[2] == 'test') {
    site.baseUrl = '.';
    outputDir = './preview';
}

publish();

function publish() {
    loadTemplates().then(templates => {
        return getPosts().then(posts => {
            posts.forEach((post) => {
                let article = md.convert(post.data);
                let postTemp = templates.find(e => e.name == 'post');
                let univTemp = templates.find(e => e.name == 'universal');
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
            return posts
        }).then((posts) => {
            return ensureDirCreated(path.join(outputDir, postDir)).then(() => {
                let writes = [];
                posts.forEach(post => {
                    writes.push(writePost(post));
                });
                return Promise.all(writes);
            });
        }).catch(err => {
            errorAndExit(err);
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
        fs.writeFile(writePath, post.data, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function loadTemplates() {
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
                resolve(templates);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function getPosts() {
    return new Promise((resolve, reject) => {
        fs.readdir(postDir, (err, fileNames) => {
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

function ensureDirCreated(dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, (err) => {
            if (err) {
                if (err.code == 'ENOENT') {
                    let dirAbove = path.join(dirPath, '../');
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
