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

  // go through each message and convert to {dateTime: , sender: , message: }
  var chatArr = [];
  splitMessage.forEach(function(messageStr, index) {
    var chatObj = { dt: null, sender: null, msg: "" };

    // generic data regex and extract
    var regex = /^([0-9]{1,2})[/|-]([0-9]{1,2})[/|-]([0-9]{2,4}), ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}) (AM|am|PM|pm): ([^:]*): (.*)/
    var matches = messageStr.match(regex);
    if(matches) {
        var date    = matches[1].length == 2 ? matches[1] : "0"+matches[1];
        var month   = matches[2].length == 2 ? matches[2] : "0"+matches[2];
        var year    = matches[3].length == 2 ? matches[3] : "20"+matches[3];
        var hour    = matches[4].length == 2 ? matches[4] : "0"+matches[4];
        var min     = matches[5].length == 2 ? matches[5] : "0"+matches[5];
        var sec     = matches[6].length == 2 ? matches[6] : "0"+matches[6];
        var ampm    = matches[7].toLowerCase();
        chatObj.dt = date+"/"+month+"/"+year+" "+hour+":"+min+":"+sec+" "+ampm;
        chatObj.sender = matches[8];
        chatObj.msg = matches[9].trim();
        chatArr.push(chatObj);
    } else {
        if(chatArr.length > 0)
          chatArr[chatArr.length - 1].msg = chatArr[chatArr.length - 1].msg + " " + messageStr.trim();
    }
  });

  var senderCountRes = senderCount(chatArr);
  console.log(senderCountRes);
}
