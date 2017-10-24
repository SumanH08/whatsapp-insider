window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('fileDisplayArea');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        fileDisplayArea.innerText = reader.result;
        parseData(reader.result);
      }
      reader.readAsText(file);

    } else {
      fileDisplayArea.innerText = "File not supported!"
    }
  });
}

function parseData(chatData) {

  var splitMessage = chatData.split("\n");

  var chatArr = splitMessage.map(function(message, i) {
    var chatObj = {};
    var dateIndexValue = 0;

    var year = message.slice(6, 10);
    year = parseInt(year) || 0;

    //check if valid date is present
    //year should be valid between index 6 and 10

    if (year > 2000) {
      //assigning appropriate strings to date, sender and text keys in the chatObj

      if (/am: /.test(message)) {
        dateIndexValue = message.indexOf("am: ");
      } else {
        dateIndexValue = message.indexOf("pm: ");
      }
      chatObj.Dates = message.substring(0, dateIndexValue + 2);

      var senderIndexValue = message.indexOf(": ", dateIndexValue + 3);
      chatObj.Sender = message.substring(dateIndexValue + 4, senderIndexValue).trim();

      chatObj.Text = message.substring(senderIndexValue + 2);
    } else {
      chatObj.Dates = "";
      chatObj.Sender = "";
      chatObj.Text = message;
    }

    return chatObj;
  })

  console.log("First Look below");
  console.log(chatArr);
  //find the current obj with null date and sender, append the object's text to previous valid obj and delete the current obj
  var prevObj = {};
  chatArr = chatArr.filter(function(message, i) {
    if (message.Dates == "" || message.Sender == "") {
      prevObj.Text = prevObj.Text.concat(message.Text);
      return false;
    } else {
      prevObj = message;
      return message;
    }
  })
  console.log("After parsing below");
  console.log(chatArr);

  //Replacing all double quotes with single quotes

  chatArr = chatArr.map(function(obj, i) {
    obj.Text = obj.Text.replace(/"/g, "");
    return obj;
  })
  console.log("After replacing below");
  console.log(chatArr);

  firstMessage(chatArr);
  //Calculate most messages exchanged by what sender

  var messageKing = 0,
    messageQueen = 0;
  var EBMessage, SumanMessage;
  var EBMessageLength = 0,
    SumanMessageLength = 0;
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;


  var emojiObj = {};

  var numberOfEmojisByEB = 0,
    numberOfEmojisBySuman = 0;

  chatArr.forEach(function(obj, i) {

    if (obj["Sender"].indexOf("EB") >= 0) {
      messageKing++;
    } else if (obj["Sender"].indexOf("Suman") >= 0) {
      messageQueen++;
    }


    //Calculate average word length

    if (obj["Sender"].indexOf("EB") >= 0) {
      EBMessage = obj["Text"].split(" ");
      EBMessageLength += EBMessage.length;
    } else if (obj["Sender"].indexOf("Suman") >= 0) {
      SumanMessage = obj["Text"].split(" ");
      SumanMessageLength += SumanMessage.length;
    }

    //calculate number of emojis used by each sender

    if (regex.test(obj["Text"])) {

      if (obj["Sender"].indexOf("EB") >= 0) {
        emojiObj[obj.Sender] = numberOfEmojisByEB++;
      } else if (obj["Sender"].indexOf("Suman") >= 0) {
        emojiObj[obj.Sender] = numberOfEmojisBySuman++;
      }
    }
  })

  var textArray = [];
  var imageObj = {};
  var EBimages = 0,
    SumanImages = 0;

  chatArr.forEach(function(obj, i) {
    textArray.push(obj.Text.split(" "));

    if (obj["Text"].indexOf("<‎image omitted>") >= 0) {
      if (obj["Sender"] == "EB") {
        imageObj[obj.Sender] = EBimages++;
      } else if (obj["Sender"] == "Suman Hiremath") {
        imageObj[obj.Sender] = SumanImages++;
      }
    }

  })


  textArray = _.flattenDeep(textArray);

  textArray = textArray.map(function(item) {
    return item.toLowerCase();
  })
  textArray.sort();

  //var result = _.countBy(textArray, _.identity);
  var result = mostUsedWords(textArray);
  //
  // console.log("This is the person who sent most messages -> " + (messageKing > messageQueen ? "EB: " + messageKing : "Suman: " + messageQueen));
  //
  // console.log("EB's total word length:" + (EBMessageLength));
  // console.log("Suman's total word length:" + (SumanMessageLength));
  //
  // console.log("EB's average word length per message:" + (EBMessageLength / messageKing).toFixed(4));
  //
  // console.log("Suman's average word length per message:" + (SumanMessageLength / messageQueen).toFixed(4));
  //
  // console.log("Emojis by each sender", emojiObj);
  //
  // console.log("Most used words now");
  // console.log(result);
  //
  // console.log("Images by each sender", imageObj);
}

//func that calculates most used words - yet to resolve the double quotes prob
function mostUsedWords(textArray) {

  var a = [],
    b = [],
    prev;
  var newObj = {};

  console.log("Sorted text array below");
  console.log(textArray);

  textArray.forEach(function(arr, i) {

    var key, value = 0;
    if (arr !== prev) {
      key = arr;
      value = 1;
      newObj[key] = value; //bracket notation since key here is a variable
    } else {
      key = prev;
      newObj[key] = newObj[key] + 1;
    }
    prev = arr;
  })
  return newObj;
}

//func that calculates the first sender of a message per day

// function firstMessage(obj){
//   var prev;
//   var uniqueObj = {}, cart=[];
//   obj.forEach(function(message, i){
//   if(message.Dates.indexOf(prev) < 0){
//     uniqueObj.Dates = message.Dates;
//     uniqueObj.Sender = message.Sender;
//     cart.push({uniqueObj: uniqueObj});
//   }
//   prev = message.Dates;
//
// })
//
// console.log(uniqueObj, cart);
// }

function firstMessage(obj) {
  var prev = "";
  var firsts = [];
  obj.forEach(function(message, i) {
    if (message.Dates.indexOf(prev) < 0) {
      firsts.push(message);
    }
    prev = message.Dates.slice(0, 9);
  })

  firsts = firsts.filter(function(message, i) {
    return moment(message.Dates).isValid();

  })

  //  console.log(firsts);
}


// var song_names = Object.keys(songs).map(function(key, i){
// 	return (songs[key].innerText)
//
// })
