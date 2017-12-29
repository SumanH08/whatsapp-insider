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
    var regexiOS = /^([0-9]{1,2})[/|-]([0-9]{1,2})[/|-]([0-9]{2,4}), ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}) (AM|am|PM|pm): ([^:]*): (.*)/
    var regexAndroid = /^([0-9]{1,2})[/|-]([0-9]{1,2})[/|-]([0-9]{2,4}), ([0-9]{1,2}):([0-9]{1,2}) (AM|am|PM|pm) - ([^:]*): (.*)/
    var matchiOS = messageStr.match(regexiOS);
    var matchAndroid = messageStr.match(regexAndroid);

    if(matchiOS) {
      var date    = matchiOS[1].length == 2 ? matchiOS[1] : "0"+matchiOS[1];
      var month   = matchiOS[2].length == 2 ? matchiOS[2] : "0"+matchiOS[2];
      var year    = matchiOS[3].length == 2 ? matchiOS[3] : "20"+matchiOS[3];
      var hour    = matchiOS[4].length == 2 ? matchiOS[4] : "0"+matchiOS[4];
      var min     = matchiOS[5].length == 2 ? matchiOS[5] : "0"+matchiOS[5];
      var sec     = matchiOS[6].length == 2 ? matchiOS[6] : "0"+matchiOS[6];
      var ampm    = matchiOS[7].toLowerCase();
      chatObj.dt = date+"/"+month+"/"+year+" "+hour+":"+min+":"+sec+" "+ampm;
      chatObj.sender = matchiOS[8];
      chatObj.msg = matchiOS[9].trim();
      chatArr.push(chatObj);
    } else if (matchAndroid) {
      var month   = matchAndroid[1].length == 2 ? matchAndroid[1] : "0"+matchAndroid[1];
      var date    = matchAndroid[2].length == 2 ? matchAndroid[2] : "0"+matchAndroid[2];
      var year    = matchAndroid[3].length == 2 ? matchAndroid[3] : "20"+matchAndroid[3];
      var hour    = matchAndroid[4].length == 2 ? matchAndroid[4] : "0"+matchAndroid[4];
      var min     = matchAndroid[5].length == 2 ? matchAndroid[5] : "0"+matchAndroid[5];
      var ampm    = matchAndroid[6].toLowerCase();
      chatObj.dt = date+"/"+month+"/"+year+" "+hour+":"+min+":00"+" "+ampm;
      chatObj.sender = matchAndroid[7];
      chatObj.msg = matchAndroid[8].trim();
      chatArr.push(chatObj);
    } else {
        if(chatArr.length > 0)
          chatArr[chatArr.length - 1].msg = chatArr[chatArr.length - 1].msg + " " + messageStr.trim();
    }
  });

  var senderCountRes = senderCount(chatArr);
  console.log(senderCountRes);
}
