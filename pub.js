const fs = require('fs');
const path = require('path');
const postDir = './posts';

publish();

function publish() {
    let posts = getPosts((posts) => {
        console.log(posts);
    });
}

function errorAndExit(err) {
    console.log(err);
    process.exit();
}

function pugPosts(){
	// TODO... how to markdown with pug?
}

function getPosts(callback) {
    fs.readdir(postDir, (err, fileNames) => {
        if (err) errorAndExit(err);

        let posts = [];
        // Extract date and title from post filename and store paths.
        fileNames.forEach((fileName) => {
            let post = {};
            post.filePath = path.join(postDir, fileName);
            let info = path.parse(post.filePath);
            post.file = info;
            let div = info.name.indexOf('_');
            post.date = Date.parse(info.name.slice(0, div - 1));
            post.title = info.name.slice(div + 1);
            // Urls are not fun with spaces.
            post.urlName = info.name.replace(/\s/g, '-') + '.html';
            posts.push(post);
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
            callback(posts);
        }).catch((err) => {
            errorAndExit(err);
        });
    });
}
