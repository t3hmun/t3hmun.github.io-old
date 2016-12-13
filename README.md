# t3hmun's web-log

This is a static site generator, written in Node.js 6 as a learning exercise.

It powers my site.

Some things are done the long way, without using existing libs because it is good for learning.


## Design

Ideas that guide the design:

* Looks OK without CSS
    * Partly ideological.
    * If it works without CSS, then its more likely to be accessible (enforces good use of HTML).
* Clear and readable on all screen sizes
    * Uses word wrap technology to re-flow to smaller screens (fixed width is a bane on mobile).
    * Max width changes depending on the type on content (narrow for prose, wider for other).
* Works well without any JavaScript.
    * A simple site should not be burdened with JS libraries - speed and reliability.


## Status

Basic site generating works:

* Generates posts from Markdown files.
* Templates post layout and other pages using Pug.
* Automatic listing of posts on home page
* Syntax highlighting of code blocks in md.


### Todo

See [issues](https://github.com/t3hmun/t3hmun.github.io).


## Usage:

See the [web log post](https://t3hmun.github.io/posts/2016-11-15_Web-Log-Generator-Usage.html) on usage.
