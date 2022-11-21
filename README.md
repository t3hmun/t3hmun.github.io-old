# t3hmun's web-log

## 2022-10-31 Updated publish instructions

```bash
git clone https://github.com/t3hmun/t3h-static-site-generator
git clone https://github.com/t3hmun/t3hmun.github.io-old
cd https://github.com/t3hmun/t3h-static-site-generator
npm i
cd ..
cd https://github.com/t3hmun/t3hmun.github.io-old
git checkout source
code config.json
```
- Now update the url in config.json to get the appropriate URLs for the publishing
  - When `t3hmun.github.io` is mapped to `www.t3hmun.com` then this site's URL becomes `http://www.t3hmun.com/t3hmun.github.io-old`
- Return to the terminal in this project's folder

```bash
node ../t3h-static-site-generator/src/publish.js
git checkout master
```

- Copy the contents of pages to top dir
- Commit

## Old Readme

This is the source for my web-log.

It is generated using my static site generator.

The easiest way to install it is to install it globally via npm (requires NodeJs 6+):

```bash
$ npm install -g t3h-static-site-generator
```

That links a single command `t3hpub`.

```bash
$ t3hpub
```

With that single commant the site is generated:

* Web-log posts generated from markdown, with syntax highlighting.
* Pages and templates generated using Pug.
* CSS themes generated from using Less.

For more information see the actual project: https://github.com/t3hmun/t3h-static-site-generator