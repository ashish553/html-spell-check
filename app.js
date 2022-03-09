const fs = require('fs')
var XRegExp = require("xregexp");
const spell = require('./spell-check/spell-check')
spell.load('en')

// get filtered html data without newlines nd return char.
function getArrayOfDataInFile(filename){
    let allLinesArr = []
    let data = fs.readFileSync(filename, 'utf-8')
    const dataSplit = data.split('\r')
    dataSplit.forEach(line => {
        // if(line!==''){
            allLinesArr.push(line.trim('\n'))
        // }
    });
    return allLinesArr
}

// delete the file that has been created by fs module for filtering the html data.
function delFile(filename){
    fs.unlink(filename, (err) => {
            if (err) throw err;
            // console.log(`${filename} was deleted`);
        });
}

// extract text between tags from html data.
function html2text(htmlString){
    let removeTags = XRegExp('(<([^>]+)>)','g') //remove all tags with/without attributes. Ex - <html></html>, <div></div>, <a href="www">,
    let removeSpecialChar = XRegExp('[^a-zA-Z ]','g') //remove special characters and numbers. Ex - , . @ # etc
    let removeWhitespaces = XRegExp(' +','g') //remove extra whitespaces
    return htmlString.replace(removeTags,' ').replace(removeSpecialChar,' ').replace(removeWhitespaces,' ')
}

let a
try{
    let allLines = getArrayOfDataInFile('./testFile.html')
    allLines.forEach(eachOne => {
        fs.writeFileSync('./writenByApp.txt',eachOne+'\r\n',{ flag: 'a+' })
    });
    let newData = getArrayOfDataInFile('./writenByApp.txt')
    let lineNumber = 0, incorrectLineNumberArray = []
    newData.forEach(eachLine => {
        lineNumber += 1
        // if(html2text(eachLine)!==''){
            fs.writeFileSync('./textc.txt',html2text(eachLine)+'\r\n',{flag: 'a+'})
            incorrectLineNumberArray.push(lineNumber)
        // }
    });
    let htmlTagTextArray = getArrayOfDataInFile('./textc.txt')
    let incorrectWordist
    for(let i=0;i<htmlTagTextArray.length;++i){
        incorrectWordist = spell.check(htmlTagTextArray[i])
        if(incorrectWordist.length!==0){
            console.log(incorrectWordist+" : "+incorrectLineNumberArray[i])
        }
    }
    delFile('./textc.txt')
    delFile('./writenByApp.txt')
}catch(err){
    console.log(err);
}