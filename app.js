const fs = require('fs')
const { convert } = require('html-to-text');
const spell = require('spell-checker-js')
spell.load('en')

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

let a
try{
    let allLines = getArrayOfDataInFile('./testFile.html')
    allLines.forEach(eachOne => {
        fs.writeFileSync('./writenByApp.txt',eachOne+'\r\n',{ flag: 'a+' })
    });
    let newData = getArrayOfDataInFile('./writenByApp.txt')
    newData.forEach(eachLine => {
        if(convert(eachLine)!==''){
            fs.writeFileSync('./textc.txt',convert(eachLine).replaceAll('\n',' ')+'\r\n',{flag: 'a+'})
        }
    });
    let htmlTagTextArray = getArrayOfDataInFile('./textc.txt')
    let incorrectWordist
    htmlTagTextArray.forEach(eachTagText => {
        incorrectWordist = spell.check(eachTagText)
        console.log(incorrectWordist)
    });
}catch(err){
    console.log(err);
}