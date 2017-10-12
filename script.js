// var fileDisplayArea = document.getElementById('fileDisplayArea');
// function readTextFile(file)
// {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, false);
//     rawFile.onreadystatechange = function ()
//     {
//         if(rawFile.readyState === 4)
//         {
//             if(rawFile.status === 200 || rawFile.status == 0)
//             {
//                 var allText = rawFile.responseText;
//                 fileDisplayArea.innerText = allText
//             }
//         }
//     }
//     rawFile.send(null);
// }
//
// readTextFile("file://Users/Suman_Hiremath/Documents/GitHub/practice_JS2/_chat.txt");


window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('fileDisplayArea');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;
    console.log(file);

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

    if (/am: /.test(message)) {
      dateIndexValue = message.indexOf("am: ");
    } else {
      dateIndexValue = message.indexOf("pm: ");
    }
    chatObj.Dates = message.substring(0, dateIndexValue + 2);

    var senderIndexValue = message.indexOf(": ", dateIndexValue + 3);
    chatObj.Sender = message.substring(dateIndexValue + 4, senderIndexValue);

    chatObj.Text = message.substring(senderIndexValue+2);

    return chatObj;
  })

  console.log(chatArr);

  //Calculate most messages exchanged by what sender

  var messageKing = 0, messageQueen = 0;
  var EBMessage, SumanMessage;
  var EBMessageLength = 0, SumanMessageLength = 0;
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;


  var emojiObj = {};

  var numberOfEmojisByEB = 0, numberOfEmojisBySuman = 0;

  chatArr.forEach(function(obj, i){

    if(obj["Sender"].indexOf("EB") >= 0){
      messageKing ++;
    }
    else if(obj["Sender"].indexOf("Suman Hiremath ") >= 0){
      messageQueen ++;
    }


    //Calculate average word length

    if(obj["Sender"].indexOf("EB") >= 0){
       EBMessage = obj["Text"].split(" ");
       EBMessageLength += EBMessage.length;
    }
    else if(obj["Sender"].indexOf("Suman Hiremath ") >= 0){
      SumanMessage = obj["Text"].split(" ");
      SumanMessageLength += SumanMessage.length;
    }

    //calculate emojis used by each Sender

    if((regex.test(obj["Text"])) && (obj["Sender"].indexOf("EB") >= 0)){
      emojiObj[obj.Sender] = numberOfEmojisByEB++;
      console.log(obj.Text);
    }
    else if((regex.test(obj["Text"])) && (obj["Sender"].indexOf("Suman Hiremath ") >= 0 )){
      emojiObj[obj.Sender] = numberOfEmojisBySuman++;
      console.log("Sumans emojis:"+(obj.Text));
    }

  })
    console.log("This is the person who sent most messages -> " + (messageKing > messageQueen ? "EB: "+messageKing : "Suman: "+messageQueen));

    console.log("EB's total word length:" +(EBMessageLength));
    console.log("Suman's total word length:" +(SumanMessageLength));

    console.log("EB's average word length per message:" +(Math.ceil(EBMessageLength/messageKing)));

    console.log("Suman's average word length per message:" +(Math.ceil(SumanMessageLength/messageQueen)));

    console.log(emojiObj);


}
