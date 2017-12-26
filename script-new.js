var senders = [];

window.onload = function() {
  var fileInput = document.getElementById('fileInput');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        parseData(reader.result);
      }
      reader.readAsText(file);
    } else {
      alert("File type not supported.")
    }
  });
}

function parseData(chatData) {

  var splitMessage = chatData.split("\n");
  var prev_message = "";

  // determine whats the date format in the file
  var firstMessage = splitMessage[0];
  var dateString = firstMessage.split(",")[0];

  var dateFormat = "DD/MM/YYYY", dateTimeEndIndex = 0;

  var dateReg1 = /^\d{2}[./-]\d{2}[./-]\d{4}$/  // DD-MM-YYYY
  var dateReg2 = /^\d{2}[./-]\d{2}[./-]\d{2}$/  // DD-MM-YY

  if(dateReg1.test(dateString)) {
    dateFormat = "DD/MM/YYYY"
  } else if (dateReg2.test(dateString)) {
    dateFormat = "DD/MM/YY"
  }

  if(dateString.indexOf("-") > 0) {
    dateFormat.replace(/\//g, "-")
  }

  var dateLen = dateString.length;

  // go through each message
  // convert to {dateTime: , sender: , message: }
  var chatArr = splitMessage.map(function(messageStr, i) {
    var chatObj = {
      dateTime: null,
      sender: null,
      message: ""
    };

    // fill dateTime
    var dateEndIndex = messageStr.indexOf(" ");
    // check if indexOf dateLength + 12 or 13 is a colon
    if(messageStr[dateLen + 12] == ":") {
      dateEndIndex = dateLen + 12;
    } else if (messageStr[dateLen + 13] == ":") {
      dateEndIndex = dateLen + 13;
    } else {
      return {
        dateTime: null,
        sender: null,
        message: messageStr.trim()
      }
    }

    chatObj.dateTime = messageStr.substring(0, dateEndIndex).toLowerCase();

    // fill sender & message
    var senderIndex = messageStr.indexOf(": ", dateEndIndex+2) > 0 ? messageStr.indexOf(": ", dateEndIndex+2) : 0;

    //if there is no sender, i.e. missed voice call/missed video call won't have sender recorded, then assign a null string to sender
    if (senderIndex > 0) {
      chatObj.sender = messageStr.substring(dateEndIndex+2, senderIndex).trim();
      chatObj.message = messageStr.substring(senderIndex+2).trim();
    } else {
      chatObj.sender = null;
      chatObj.message = messageStr.substring(dateEndIndex).trim();
    }
    
    return chatObj;
  });
}
