var randomizeCards = true;
var randomizeItems = true;
var useTimer = true;
var wordCount;
var cardSet;


var classHide = 'hide';
var classRight = 'right';
var classWrong = 'wrong';

var output = document.querySelector('#output');


function spotIt(words,cardSets){
    wordCount = words.length;
    document.querySelector('.wordsProvided').innerHTML = wordCount;
    var randomNums;
    var cards = [];
    // console.log("word count", wordCount);
    // based on the wordCount, use a different cardSet
    if(wordCount >= 57) {
        cardSet = cardSets.words57;
    } else if (wordCount >= 31){
        cardSet = cardSets.words31;
    } else if (wordCount >= 13){
        cardSet = cardSets.words13;
    } else if (wordCount >= 7){
        cardSet = cardSets.words7;
    } else if (wordCount >= 3){
        cardSet = cardSets.words3;
    }
    if(cardSet){
        // show game trigger
        document.querySelector('.playgamewrapper').classList.remove(classHide);
        
        // show details about what we did with word list
        document.querySelector('#details').classList.remove(classHide);
        // console.log('CardSet allows for '+cardSet.wordcount+' and you provided '+wordCount);
        if(wordCount > cardSet.wordcount){
            // console.log('Truncating the last ' + (wordCount - cardSet.wordcount));
            words = words.slice(0,cardSet.wordcount);
            wordCount = words.length;
            // console.log("new wordCount is:"+ wordCount);
        }
        document.querySelector('.wordsUsed').innerHTML = wordCount;
        document.querySelector('.numCards').innerHTML = cardSet.totalcards;

        // console.log("Have enought words");
        // console.log(cardSet);
        
        // optionally randomize the cards
        if(randomizeCards){
            // because cards are an object and not an array, we can't really randomize it.  But we can make a new array with the right number of numbers and then randomize that.
            randomNums = [];
            for(var x = 1; x < (wordCount+1); x++){
                randomNums.push(x);
            }
            // console.log("Randomnums before randomization", randomNums);
            randomNums = shuffle(randomNums);
            // console.log("Randomnums before randomization", randomNums);
        }
        cards = createCards(words, wordCount, randomNums);
    } else {
        console.log("You need at least 3 words for this to work");
        document.querySelector('.playgamewrapper').classList.add(classHide);
        document.querySelector('#details').classList.add(classHide);
        
    }
    // return cards;
    
    output.innerHTML = cards.join(' ');
}

function createCards(words, wordCount, randomNums){
    console.debug("createCards");
    var cards = [];
    for(var y = 1; y < (wordCount+1); y++){
        var cardNum = typeof randomNums === "object"?randomNums[y-1]:y;
        var curCard = cardSet.cards["card"+cardNum];
        
        cards.push(createCard(cardNum, curCard, words));
    }
    return cards;
}
function createCard(cardNum, curCard, words){
    console.debug("createCard",curCard);
    var cardCode = '<div class="card" data-card="'+cardNum+'" title="Card '+cardNum+'">';
    // cardCode += '<span class="card__num">Card '+cardNum+'</span>';
    // console.log("Card "+y, curCard);
    
    // optionally randomize the items in the card
    if(randomizeItems){
        curCard = shuffle(curCard);
    }
    cardCode += createItems(curCard, words);
    // console.log("end card");
    cardCode += '</div>';
    
    return cardCode;
}

function createItems(curCard, words){
    console.debug("createItems",curCard);
    var items = "";
    curCard.forEach(function(wordNum){
        items += createItem(words, wordNum);
    });
    return items;
}
function createItem(words, wordNum){
    var content = words[wordNum];
    console.debug("createItem",content);
    var regex = /\.(jpg|png|gif|svg)$/;
    if(content.indexOf('http') === 0 && regex.test(content)){ // is a URL, so is an image
        // console.debug("image");
        // console.debug("wordNum",wordNum);
        content = '<img src="'+words[wordNum]+'"/>';
    }
    return '<span class="card__item" data-item="'+wordNum+'" title="Item '+wordNum+'">'+content+'</span>';
}

// stolen from some random stack overflow article that I forgot to write down
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// stuff for entering in the data to be used
var itemEntry = document.querySelector("#itemEntry");
function loadItems(){
    newWords = parseEntry();
    spotIt(newWords,cardSets);
}

function parseEntry(){
    var newWords = itemEntry.value;
    console.log("newWords",newWords,newWords.split("\n"));
    return newWords.split("\n");
}

itemEntry.addEventListener("blur",loadItems);

function demoData(){
    [].forEach.call(document.querySelectorAll('[data-demo]'),function(elem){
        // console.log(elem);
        elem.addEventListener('click',function(event){
            event.preventDefault();
            var demo = elem.getAttribute('data-demo');
            itemEntry.value = window[demo].join('\n');
            loadItems();
        });
    });
}
demoData();

// stuff for saving data to localstorage
function saveData(){
    var name = window.prompt("What should we name this set of data?");
    // var name = "test";
    var curData = {};
    curData[name] = parseEntry();
    console.debug(curData);
    var storage = localStorage.getItem("spot-it");
    storage = JSON.parse(storage);
    console.log("storage",storage);
    var result={};
    for(var key in storage) result[key]=storage[key];
    for(var key in curData) result[key]=curData[key];
    console.log("result",result);
    localStorage.setItem("spot-it",JSON.stringify(result));
    readStorage();
}

function readStorage(){
    var storage = localStorage.getItem("spot-it");
    // console.debug(storage);
    storage = JSON.parse(storage);
    // console.debug(storage,storage.length);
    var saves = document.querySelector(".saves");
    saves.innerHTML = "";
    for(var key in storage) {
        console.debug(key,storage[key]);
        saves.innerHTML += '<li><a href="#d" data-saved="'+key+'" data-data="'+storage[key]+'">'+key+'</a> <a href="#d" class="save-remove" data-key="'+key+'">(delete)</a></li>';
    }
    
    [].forEach.call(document.querySelectorAll('[data-saved]'),function(elem){
        // console.log(elem);
        elem.addEventListener('click',function(event){
            event.preventDefault();
            var data = elem.getAttribute('data-data');
            itemEntry.value = data.replace(/,/g,'\n');
            loadItems();
        });
    });
    [].forEach.call(document.querySelectorAll('.save-remove'),function(elem){
        // console.log(elem);
        elem.addEventListener('click',function(event){
            event.preventDefault();
            var keyToKill = elem.getAttribute('data-key');
            
            var storage = localStorage.getItem("spot-it");
            console.debug(storage);
            storage = JSON.parse(storage);
            var result={};
            for(var key in storage) {
                if(key !== keyToKill){
                    result[key]=storage[key];
                }
            }
            localStorage.setItem("spot-it",JSON.stringify(result));
            readStorage();
        });
    });
}
readStorage();

document.querySelector('.save-it').addEventListener('click',function(event){
    event.preventDefault();
    saveData();
});