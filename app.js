const fs = require('fs')
var XRegExp = require("xregexp");
const spell = require('./spell-check/spell-check')
const gramma = require('gramma');
const { resolve } = require('path');
const { rejects } = require('assert');
const JSSoup = require('jssoup').default

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
    console.log('\n--------------> Spelling Errors <--------------\n');
    for(let i=0;i<htmlTagTextArray.length;++i){
        incorrectWordist = spell.check(htmlTagTextArray[i])
        if(incorrectWordist.length!==0){
            console.log(incorrectWordist+" : "+incorrectLineNumberArray[i])
        }
    }
    console.log('\n----------------------------------------------- ');
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
    let readHTML = fs.readFileSync('./testFile.html', 'utf-8')
    let jsSoup = new JSSoup(readHTML)
    let dataForP = jsSoup.getText('\n').split('\n');
    let lineNumberForP = 0
    let lineNumberForPArr = []
    const matchesArr= []
    var promises = []
    for(let i=0;i<dataForP.length;i++){
        if(dataForP[i]!==''){
            promises.push(gramma.check(dataForP[i]))
            lineNumberForP += 1
            lineNumberForPArr.push(i+1)
        }
    }
    let resolveAllPromises = Promise.all(promises).then(result=>{
            for(let results of result){
                matchesArr.push(results.matches)
            }
            return matchesArr
        })
    console.log('\n--------------> Grammar Errors <--------------\n');
    resolveAllPromises.then((resulta)=>{
        let count = 0
         for(let i=0;i<resulta.length;i++){
             if(resulta[i].length!==0){
                 count += 1
                getFormattedError(resulta[i],count)
                // console.log(`LineNumber : ${lineNumberForPArr[i]}`);
                // console.log('\n');
             }
         }
    console.log('-------------------------------------------------');
    })
     
    delFile('./textcForP.txt')
    delFile('./textc.txt')
    delFile('./writenByApp.txt')
}catch(err){
    console.log(err);
}

function getFormattedError(errArray,count){
     errArray.forEach(element => {
         console.log(`Error ${count} \n Message : ${element.message}`)
         console.log(` Sentence : ${element.sentence}`)
         console.log(` Word : ${element.word}`)
     });
}
