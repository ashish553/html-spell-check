var fs = require("fs");
var path_1 = require("path");
var iconv = require("iconv-lite");
var XRegExp = require("xregexp");
var SpellCheck = (function () {
    function SpellChecker() {
        this.BUFFER = {
            WORDS: new Set(),
            SIZE: 0,
        };
        this.dictionaries = {
            en: {
                src: path_1.resolve(__dirname, './dictionaries/en/english.txt'),
                charset: 'windows-1252'
            },
        };
    }
    SpellChecker.prototype.load = function (inputOrProps, charsetOption) {
        var _this = this;
        var options = this.parseParams(inputOrProps, charsetOption);
        if (!options.async) {
            var dictionary = this.readDictionarySync(options.input, options.charset, this.BUFFER.WORDS);
            this.BUFFER.WORDS = dictionary.words;
            this.BUFFER.SIZE += dictionary.size;
            return dictionary.size;
        }
        else {
            var dictPromise_1 = this.readDictionaryAsync(options.input, options.charset || 'utf8', this.BUFFER.WORDS);
            return new Promise(function (resolve) {
                dictPromise_1.then(function (resp) {
                    _this.BUFFER.WORDS = resp.words;
                    _this.BUFFER.SIZE += resp.size;
                    resolve(resp.size);
                });
            });
        }
    };
    SpellChecker.prototype.clear = function () {
        this.BUFFER.WORDS.clear();
        this.BUFFER.SIZE = 0;
    };
    SpellChecker.prototype.check = function (text) {
        if (this.BUFFER.SIZE === 0) {
            console.error('ERROR! Dictionaries are not loaded');
            return;
        }
        var regex = XRegExp('[^\\p{N}\\p{L}-_]', 'g');
        var textArr = text
            .replace(regex, ' ')
            .split(' ')
            .filter(function (item) { return item; });
        var outObj = {};
        for (var i = 0; i < textArr.length; i++) {
            var checked = this.checkWord(textArr[i]);
            var checkedList = Array.isArray(checked)
                ? checked
                : [checked];
            for (var j = 0; j < checkedList.length; j++) {
                if (checkedList[j] == null) {
                    outObj[textArr[i]] = true;
                }
            }
        }
        return Object.keys(outObj);
    };
    Object.defineProperty(SpellChecker.prototype, "words", {
        get: function () {
            return this.BUFFER.WORDS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpellChecker.prototype, "size", {
        get: function () {
            return this.BUFFER.SIZE;
        },
        enumerable: true,
        configurable: true
    });
    SpellChecker.prototype.parseParams = function (inputOrProps, charsetOption) {
        if (typeof inputOrProps !== 'string') {
            return {
                input: inputOrProps.input,
                charset: inputOrProps.charset || 'utf8',
                async: inputOrProps.async,
            };
        }
        return {
            input: inputOrProps,
            charset: charsetOption || 'utf8',
            async: false,
        };
    };
    SpellChecker.prototype.checkWord = function (wordProp, recblock) {
        var _this = this;
        if (wordProp == null || wordProp === '' || !isNaN(Number(wordProp))) {
            return;
        }
        var word = wordProp.replace(/^#/, '');
        if (this.BUFFER.WORDS.has(word)) {
            return true;
        }
        if (this.BUFFER.WORDS.has(word.toLowerCase())) {
            return true;
        }
        var esymb = '-/\'';
        for (var i = 0; i < esymb.length; i++) {
            if (recblock || word.indexOf(esymb[i]) === -1) {
                continue;
            }
            var retArray = word
                .split(esymb[i])
                .map(function (item, i) {
                if (i === 0) {
                    return _this.checkWord(item, true);
                }
                else {
                    var res = _this.checkWord(item, true);
                    return res || _this.checkWord(esymb[i] + item, true);
                }
            });
            return retArray;
        }
    };
    SpellChecker.prototype.getWordsList = function (fileBuff, charset, words) {
        var text = iconv.decode(fileBuff, charset);
        var list = text.split('\n');
        var len = list.length;
        if (list[len - 1] === '') {
            len--;
        }
        var i = 0;
        while (i < len) {
            words.add(list[i]);
            i++;
        }
        words.delete('');
        return {
            words: words,
            size: len
        };
    };
    SpellChecker.prototype.readDictionarySync = function (input, charset, words) {
        if (this.dictionaries[input] != null) {
            charset = this.dictionaries[input].charset;
            input = this.dictionaries[input].src;
        }
        if (!fs.existsSync(input)) {
            console.error("ERROR! File \"" + input + "\" does not exist");
            return { words: words, size: 0 };
        }
        if (!fs.existsSync(input)) {
            console.error("ERROR! File \"" + input + "\" does not exist");
            return {
                words: words,
                size: 0
            };
        }
        var buff = fs.readFileSync(input);
        return this.getWordsList(buff, charset, words);
    };
    SpellChecker.prototype.readDictionaryAsync = function (input, charset, words) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, fileBuff, wordsList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.dictionaries[input] != null) {
                            charset = this.dictionaries[input].charset;
                            input = this.dictionaries[input].src;
                        }
                        if (!fs.existsSync(input)) {
                            console.error("ERROR! File \"" + input + "\" does not exist");
                            return [2, { words: words, size: 0 }];
                        }
                        filePath = input;
                        return [4, this.readFile(filePath)];
                    case 1:
                        fileBuff = _a.sent();
                        wordsList = this.getWordsList(fileBuff, charset, words);
                        return [2, wordsList];
                }
            });
        });
    };
    SpellChecker.prototype.readFile = function (filePath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, function (error, buffer) {
                if (error) {
                    reject(error);
                }
                resolve(buffer);
            });
        });
    };
    return SpellChecker;
}());
module.exports = new SpellCheck();
//# sourceMappingURL=index.js.map