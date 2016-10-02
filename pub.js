'use strict';

const path = require('path');
const md = require('./md');
const pug = require('pug');
const less = require('less');
const effess = require('./effess');

publish(...configure());

/**
 * Manually edit config here. Anything that was a global is now in here.
 * @return {*[]} Config that can be spread for publish call params.
 */
function configure() {
    // Default config, modified by args after.
    let debug = false;
    let outputDir = './t3hmun.github.io';
    let test = false;

    const site = {
        title: 't3hmun',
        description: 't3hmun\'s web log',
        baseUrl: 'https://t3hmun.github.io',
        nav: [
            {url: 'index.html', text: 'Home'},
            {url: 'info.html', text: 'Info'}
        ]
    };

    if (process.argv.length > 2) {
        console.log('Config:');
        if (process.argv.find((e) => e == 'debug')) {
            debug = true;
            debug && console.log(' Debug-mode on.');
        }
        if (process.argv.find((e) => e == 'test')) {
            test = true;
            // Fully resolved path allows testing without server.
            site.baseUrl = path.resolve('./test');
            outputDir = path.resolve('./test');
            debug && console.log('test outputDir=' + outputDir);
            console.log(' Test mode activated.');
        }
        console.log('');
    }

    return [site, outputDir, debug, test];
}

/**
 * Fires a load of promises that result in a static site.
 * @param {{}} site - site config, used by pug templates.
 * @param {string} outputDir - Where the complete site will be written.
 * @param {boolean} debug - True to enable debug output.
 * @param {boolean} test - True to avoid minifying.
 * @returns {void}
 */
function publish(site, outputDir, debug, test) {
    // TODO: Move remaining string literals from here to configure().
    let cssOutputDir = path.join(outputDir, 'css');
    let postOutputDir = path.join(outputDir, 'posts'); // Must be relative for url generation.

    // Read files from disk and perform any processing that doesn't rely on other files.
    let templatesLoaded = loadTemplates('./templates', debug);
    let postsLoaded = loadPosts('./posts', postOutputDir, debug);
    let mainCssRendered = renderLessToCss('./css/main.less', !test, debug);

    // Create output directories.
    let postDirCreated = effess.ensureDirCreated(postOutputDir);
    let cssDirCreated = effess.ensureDirCreated(cssOutputDir);

    // Creation tasks that rely on previously loaded files.
    let postTemplateApplied = Promise.all([postsLoaded, templatesLoaded]).then((tasksResults)=> {
        return applyPostTemplates(...tasksResults, site, test, debug);
    });

    // Render and write pages - they require posts for generating the indexes.
    // postsLoaded.then((posts)=> {
    //     return renderPugPages('./pages', site, posts, test, debug).then((pages)=> {
    //         return effess.writeMany(pages, (page)=> {
    //             return ['./', page.fileName, page.html];
    //         });
    //     });
    // }).catch((err)=> {
    //     errorAndExit(err);
    // });

    // Write files.
    let writePosts = Promise.all([postTemplateApplied, postDirCreated]).then((taskResults)=> {
        let [posts] = taskResults;
        return effess.writeMany(posts, (post)=> {
            return [postOutputDir, post.urlName, post.html];
        });
    }).catch((err)=> {
        errorAndExit(err);
    });

    let writeCSS = Promise.all([mainCssRendered, cssDirCreated]).then((results)=> {
        let [lessOutput] = results;
        return effess.write(cssOutputDir, 'main.css', lessOutput.css);
    }).catch((err)=> {
        errorAndExit(err);
    });

    Promise.all([writePosts, writeCSS]).then(()=>{
        console.log('Publish complete.');
    });
}

/**
 * Renders the non-post pages of the website from Pug.
 * @param {string} pageDir - Folder containing pug pages.
 * @param {{}} site - Site vars.
 * @param {{}[]} posts - All the posts, used for index generating.
 * @param {boolean} test - True enables test mode, makes the HTML pretty.
 * @param {boolean} debug - True enables debug output.
 * @return {Promise.<{}[]>} - List of {html, fileName}.
 */
function renderPugPages(pageDir, site, posts, test, debug) {
    debug && console.log('Rendering pug pages ...');
    return effess.readFilesInDir(pageDir, (fileName)=>fileName.endsWith('.pug')).then((files)=> {
        let options = {
            site: site,
            posts: posts,
            pretty: test
        };

        let renders = [];
        files.forEach((file)=> {
            renders.push(new Promise((resolve)=> {
                options.filename = file.path;
                let html = pug.render(file.data, options);
                resolve(html);
            }));
        });
        debug && console.log('... rendered pug pages.');
        return Promise.all(renders);
    });
}

/**
 * Apply templates to posts.
 * @param {[]} posts - Posts with all their information.
 * @param {[]} templates - Name and compiled pug function {name, func}.
 * @param {{}} site - Lots of site info (see pug templates).
 * @param {boolean} test - True enables test mode, avoid minifying anything.
 * @param {boolean} debug - True enables debug output.
 * @return {Promise<[]>} - The posts, each with a .html property representing the final file data.
 */
function applyPostTemplates(posts, templates, site, test, debug) {
    debug && console.log('Applying post templates ...');
    return new Promise((resolve, reject)=> {
        let postTemplate = templates.find((e) => e.name == 'post');
        try {
            posts.forEach((post)=> {
                // The post template is just the contents of the main tag of the article page.
                post.html = postTemplate.func({
                    site: site,
                    page: post,
                    content: post.html,
                    pretty: test // neat output for test mode.
                });
            });
        } catch (err) {
            reject(err);
            return;
        }
        resolve(posts);
        debug && console.log('... applied post templates.');
    });
}

/**
 * Renders a LESS file to CSS, returning it as a string. Assumes all imports are in-lined so single file output.
 * @param {string} filePath - Less file path.
 * @param {boolean} compress - True to minify output.
 * @param {boolean} debug - True for debug output mode.
 * @return {Promise<string>} - Promise of the final CSS file contents.
 */
function renderLessToCss(filePath, compress, debug) {
    debug && console.log('Rendering CSS from LESS...');
    return effess.read(filePath).then((data)=> {
        let lessOptions = {
            filename: path.resolve(filePath),
            paths: path.parse(filePath).dir,
            compress: compress
        };
        // Is a promise that returns the CSS.
        debug && console.log('... rendered CSS from LESS.');
        return less.render(data, lessOptions);
    });
}


/**
 * Quickly display error and crash. Fatal errors only.
 * @param  {Error} err - The error.
 * @returns {void} - Never (exits).
 */
function errorAndExit(err) {
    console.log(err);
    process.exit();
}


/**
 * Loads all pug templates from specified dir.
 * @param {string} dir - Path of the dir containing templates, not recursive.
 * @param {boolean} debug - Enable debug output (default false).
 * @returns {Promise.<{}[]>} - List of {name, compiledPugFunction} in a promise.
 */
function loadTemplates(dir, debug) {
    debug && console.log('Loading templates ...');
    let filter = (fileName)=>fileName.endsWith('.pug');
    return effess.readFilesInDir(dir, filter).then((files)=> {
        let templates = [];
        try {
            files.forEach((file)=> {
                let options = {filename: file.name}; // Only needed to add detail to errors.
                let template = pug.compile(file.data, options);
                templates.push({
                    name: path.parse(file.path).name, //removes ext
                    func: template
                });
            });
        } catch (err) {
            return Promise.reject(err);
        }
        debug && console.log('... templates loaded.');
        return Promise.resolve(templates);
    });
}

/**
 * Loads posts from dir, reads info and converts md.
 * @param {string} dir - Dir to load posts from, not recursive.
 * @param {string} outputDir - Needed for generating the url.
 * @param {boolean} debug - Enable debug output (default false).
 * @return {Promise.<{}[]>} - List of {html, filePath, fileName, title, date, url, urlName}, the urls have spaces
 * replaced.
 */
function loadPosts(dir, outputDir, debug) {
    debug && console.log('Loading posts ...');
    let filter = (fileName) => fileName.endsWith('.md');
    return effess.readFilesInDir(dir, filter).then((files)=> {
        let posts = [];
        files.forEach((file)=> {
            // TODO: This'll be the place to read in any front matter.
            let html = md.convert(file.data);
            let post = {
                filePath: file.path,
                fileName: file.name,
                html: html,
            };
            setPostDateTitleInfo(post);
            post.url = path.join(outputDir, post.urlName);
            posts.push(post);
        });
        debug && console.log('... posts loaded.');
        return posts;
    });
}

/**
 * Extracts title and date from filename, makes filename url friendly.
 * @param {{}} post - The post that will have properties added.
 * @returns {void}
 */
function setPostDateTitleInfo(post) {
    let info = path.parse(post.filePath);
    post.file = info;
    let div = info.name.indexOf('_');
    let dateStr = info.name.slice(0, div);
    post.date = new Date(dateStr);
    post.title = info.name.slice(div + 1);
    // Urls are not fun with spaces.
    post.urlName = info.name.replace(/\s/g, '-') + '.html';
}


