"use strict";

const markdownItOptions = {
    highlight: function (str, lang) {
        if (lang && highlightJs.getLanguage(lang)) {
            try {
                return highlightJs.highlight(lang, str).value;
            }
            catch (__) {
            }
        }
        return ''; // use external default escaping
    }
};

const highlightJs = require('highlight.js');
const markdownIt = require('markdown-it')(markdownItOptions);

module.exports.convert = function(data){
    return markdownIt.render(data);
}