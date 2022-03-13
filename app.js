const fs = require('fs')
var XRegExp = require("xregexp");
const spell = require('./spell-check/spell-check')
var writeGood = require('write-good');
const gramma = require('gramma');
const { resolve } = require('path');
const { rejects } = require('assert');

spell.load('en')

// get filtered html data without newlines and return char.
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
        });
}

// extract text between tags from html data.
function html2text(htmlString){
    let removeTags = XRegExp('(<([^>]+)>)','g') //remove all tags with/without attributes. Ex - <html></html>, <div></div>, <a href="www">,
    let removeSpecialChar = XRegExp('[^a-zA-Z ]','g') //remove special characters and numbers. Ex - , . @ # etc
    let removeWhitespaces = XRegExp(' +','g') //remove extra whitespaces
    return htmlString.replace(removeTags,' ').replace(removeSpecialChar,' ').replace(removeWhitespaces,' ')
}


function html2textWithPunctuation(htmlString){
    let removeTags = XRegExp('(<([^>]+)>)','g') //remove all tags with/without attributes. Ex - <html></html>, <div></div>, <a href="www">,
    let removeWhitespaces = XRegExp(' {2,}','g') //select extra whitespaces
    return htmlString.replace(removeTags,' ').replace(removeWhitespaces,' ')
}

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
    let readForGrammar = getArrayOfDataInFile('./writenByApp.txt')
    // let lineNumberForP = 0
    incorrectLineNumberArray = []
    readForGrammar.forEach(eachLine => {
        // lineNumberForP += 1
        // if(html2text(eachLine)!==''){
            fs.writeFileSync('./textcForP.txt',html2textWithPunctuation(eachLine)+'\r\n',{flag: 'a+'})
            incorrectLineNumberArray.push(lineNumber)
        // }
    });
    let dataForP = getArrayOfDataInFile('./textcForP.txt');
    let lineNumberForP = 0
    let lineNumberForPArr = []
    const matchesArr= []
    for(let i=0;i<dataForP.length;i++){
        if(dataForP[i]!==''){
            allErrors = gramma.check(dataForP[i]).then((result) => {
                lineNumberForP += 1
                matchesArr.push(result.matches)
                lineNumberForPArr.push(i+1)
                return matchesArr
            })

        }
    }
    const printAllErrors = ()=>{
        allErrors.then((errorsWeGot)=>{
            console.log(errorsWeGot);
            console.log(lineNumberForPArr);
        })
    }
    printAllErrors()
    console.log(lineNumberForPArr)
    function getGrammaErrors(dataForP,i,lineNumberForP){
        
        return new Promise((resolve, rejects)=>{
            gramma.check(dataForP[i]).then((result)=>{
                hehe[lineNumberForP] = result
                lineNumberForPArr.push(lineNumberForP)
            })
            const error = false
            if(!error){
                resolve()
            }else{
                rejects()
            }
        })
    }
    
    delFile('./textcForP.txt')
    delFile('./textc.txt')
    delFile('./writenByApp.txt')
}catch(err){
    console.log(err);
}

