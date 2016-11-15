{ "description": "Usage guide for the site generator that I wrote for this web-log." }

## Structure

`pub.js`:
This is the main publishing code and entry point.

`md.js`:
A wrapper for a markdown library.

`effess.js`:
A promise based wrapper for common file IO functions used by `pub.js`.
 
`pages/`:
Contains unique pages of the website written using Pug.

`templates/`:
Pug templates used by pages and posts
The `universal.pug` template should be used by all pages and posts.

`css/`:
CSS and LESS files, compiled by the `main.less` file. The intent is to output a single `main.css` file.

`posts/`:
Markdown files that represent posts to the web-log.

## Configuration

The basic site configuration should be tweaked for your site.
It can be found in the `site` constant inside the `configure()` function at the beginning of `pub
.js`.
 
`site.baseUrl` is used to generate canonical urls for all pages.

`site.nav` is a list of pages that should be part of the main nav that appears on all pages.

## Site Output Folder

The site output is folder is configured via the `outputDir` variable in `configure()` in `pub.js`.

For my site that folder is configured as a git submodule that points to the master branch of my Github pages repo.
The `master` branch only contains the site that is shown via Github pages, 
the `source` branch contains all this site generation code and unprocessed site data.

> Configuring the output folder as a Git submodule is a convenience hack.
It allows allows everything to be kept in a single repository while separating the output and development.
If you don't like this hack put the code and site data in a different repo.


## Generating the Site

The `test` and `debug` flags are optional, may be a good idea on first try.

Test mode outputs the site to `test/` with resolved file urls so that links work when the files are opened without a 
server.
This is the quickest way of testing the output.

The debug flag spams some extra information, may be a bit of a mess.

```bash
$ node pub test debug
```

Run `pub.js` without the test flag to get proper site output with correct relative urls.
This output can then be published to a Github pages repo master branch or any other server.


## Errors

The code is meant to be fail-fast, will abort on any error, via the `errorAndExit()` function.
It prints the error to the console and then kills the process.
Explicitly killing the process is necessary because the code is very asynchronous.
As a result there may be partial output after an error.