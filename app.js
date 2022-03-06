const fs = require('fs')
const { convert } = require('html-to-text');
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
        if(convert(eachLine)!==''){
            fs.writeFileSync('./textc.txt',convert(eachLine).replaceAll('\n',' ')+'\r\n',{flag: 'a+'})
            incorrectLineNumberArray.push(lineNumber)
        }
    });
    let htmlTagTextArray = getArrayOfDataInFile('./textc.txt')
    // console.log(htmlTagTextArray);
    let incorrectWordist
    for(let i=0;i<htmlTagTextArray.length;++i){
        incorrectWordist = spell.check(htmlTagTextArray[i])
        // if(spell.check(htmlTagTextArray[i])!==[]){
            console.log(incorrectWordist+" : "+incorrectLineNumberArray[i])
        // }
    }
    delFile('./textc.txt')
    delFile('./writenByApp.txt')
}catch(err){
    console.log(err);
}