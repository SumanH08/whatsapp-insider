var senders = [];

window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('fileDisplayArea');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        //fileDisplayArea.innerText = reader.result;
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
  var prev_message = "";

  var chatArr = splitMessage.map(function(message, i) {
    var chatObj = {};
    var dateIndexValue = 0;

    //gives the index of the point where the date ends
    var dateEndIndex = message.indexOf(" ");
    var in_date = message.slice(0, dateEndIndex - 1);
    var dateFormat = "DD/MM/YY";
    var checkValidDate = moment(in_date, dateFormat).isValid();

    //date regex for DD/MM/YY and DD/MM/YYYY formats
    var dateReg = /^\d{2}[./-]\d{2}[./-]\d{4}$/
    var dateReg2 = /^\d{2}[./-]\d{2}[./-]\d{2}$/
    //check if the date is a valid string, not null and in a valid format with slashes"/"
    if (checkValidDate && (in_date.length >= 6) && (dateReg.test(in_date) || dateReg2.test(in_date))) {
      //the nested moment formats the string into a date string and then the outer moment will format it into the format provided
      var out_date = moment(in_date, "DD/MM/YYYY").format("DD/MM/YYYY")
      //This solutions works too
      // var out_date = moment(moment(in_date, "DD/MM/YY")).format('DD/MM/YYYY');

      var formatted_chat = message.replace(message.slice(0, dateEndIndex - 1), out_date);
    } else {
      var formatted_chat = message;
    }
    var year = formatted_chat.slice(6, 10);
    year = parseInt(year) || 0;

    //check if valid date is present
    //year should be valid between index 6 and 10
    if (year > 2000) {
      //assigning appropriate strings to date, sender and text keys in the chatObj
      if (/am: /.test(formatted_chat) || /AM: /.test(formatted_chat)) {
        dateIndexValue = formatted_chat.indexOf("am: ") > 0 ? formatted_chat.indexOf("am: ") : formatted_chat.indexOf("AM: ");
      } else {
        dateIndexValue = formatted_chat.indexOf("pm: ") > 0 ? formatted_chat.indexOf("pm: ") : formatted_chat.indexOf("PM: ");
      }

      chatObj.Dates = formatted_chat.substring(0, dateIndexValue + 2);

      var senderIndexValue = formatted_chat.indexOf(": ", dateIndexValue + 3) > 0 ? formatted_chat.indexOf(": ", dateIndexValue + 3) : 0;

      //if there is no sender, i.e. missed voice call/missed video call won't have sender recorded, then assign a null string to sender
      if (senderIndexValue > 0) {
        chatObj.Sender = formatted_chat.substring(dateIndexValue + 4, senderIndexValue).trim();
        chatObj.Text = formatted_chat.substring(senderIndexValue + 2).trim();
      } else {
        chatObj.Sender = "";
        chatObj.Text = formatted_chat.substring(dateIndexValue + 3).trim();
      }
    } else {

        //??
      chatObj.Dates = "";
      chatObj.Sender = "";
      chatObj.Text = formatted_chat.trim();
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

  //delete all the missed voice calls from the chatArr

  chatArr = chatArr.filter(function(message, i) {
    if (message.Text.indexOf("Missed Voice Call") >= 0 || message.Text.indexOf("Missed Video Call") >= 0) {
      return false;
    } else {
      return true;
    }
  })
  console.log("Printing messages after filtering extras");
  console.log(chatArr);

  //get the sender names
  // var senders = _.(chatArr).map(_.keys).flatten().unique().value();
  // console.log("These are my senders:")
  // console.log(senders);
  var prev = "";
  chatArr.forEach(function(message, i) {
    if (message.Sender.indexOf(prev) < 0 || prev == "") {
      senders.push(message.Sender);
    }
    prev = message.Sender;
  })

  console.log("Senders now");
  console.log(_.uniq(senders));

  $('#sender-info').html(`<p><b>${senders[0]} & ${senders[1]}</b><br>Timeline</p>`)

  solutions(chatArr);
}
