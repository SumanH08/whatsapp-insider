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
  // var prev_message = "";

  var chatArr = splitMessage.map(function(message, i) {
    var chatObj = {};
    var dateIndexValue = 0;

    var in_date = message.slice(0, 8);
    //the nested moment formats the string into a date string and then the outer moment will format it into the format provided

    var dateFormat = "DD/MM/YY";
    // var checkValidDate = moment(in_date, dateFormat).isValid();
    // if(checkValidDate){
      var out_date = moment(moment(in_date, "DD/MM/YY")).format('DD/MM/YYYY');
      //This solutions works too
      //console.log(moment(message.slice(0, 8), "DD/MM/YY").format("DD/MM/YYYY"));

      // console.log("Out dates now");
      // console.log(out_date);
      // console.log(message);
      var formatted_chat = message.replace(message.slice(0, 8), out_date);
    // }
    // else {
    //   prev_message = prev_message.concat(message);
    //   return message;
    // }

    // prev_message = message;
    // var prevObj = {};
    // chatArr = chatArr.filter(function(message, i) {
    //   if (message.Dates == "" || message.Sender == "") {
    //     prevObj.Text = prevObj.Text.concat(message.Text);
    //     return false;
    //   } else {
    //     prevObj = message;
    //     return message;
    //   }
    // })


    var year = formatted_chat.slice(6, 10);
    year = parseInt(year) || 0;

    //check if valid date is present
    //year should be valid between index 6 and 10


      // convert if any AM, PM to am and pm - to lower case
      //   if (/AM: /.test(formatted_chat)){
      //
      //   }
      //

      if (year > 2000) {

        //assigning appropriate strings to date, sender and text keys in the chatObj

      if (/am: /.test(formatted_chat) || /AM: /.test(formatted_chat)) {
        dateIndexValue = formatted_chat.indexOf("am: ") > 0 ? formatted_chat.indexOf("am: ") : formatted_chat.indexOf("AM: ");
        // dateIndexValue = formatted_chat.indexOf("am: ")|| formatted_chat.indexOf("AM: ");
      } else {
        dateIndexValue = formatted_chat.indexOf("pm: ") > 0 ? formatted_chat.indexOf("pm: ") : formatted_chat.indexOf("PM: ");
      }
      chatObj.Dates = formatted_chat.substring(0, dateIndexValue + 2);

      var senderIndexValue = formatted_chat.indexOf(": ", dateIndexValue + 3);
      chatObj.Sender = formatted_chat.substring(dateIndexValue + 4, senderIndexValue).trim();

      chatObj.Text = formatted_chat.substring(senderIndexValue + 2);
    } else {
      chatObj.Dates = "";
      chatObj.Sender = "";
      chatObj.Text = formatted_chat;
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

  //get the sender names
  // var senders = _.(chatArr).map(_.keys).flatten().unique().value();
  // console.log("These are my senders:")
  // console.log(senders);

  var prev = "";
  chatArr.forEach(function(message, i){
    if(message.Sender.indexOf(prev) < 0 || prev == ""){
      senders.push(message.Sender);
    }
    prev = message.Sender;
  })

    console.log("Senders now");
    console.log(_.uniq(senders));

    senders = senders.slice(0, 2)

  //Replacing all double quotes with single quotes

  // chatArr = chatArr.map(function(obj, i) {
  //   obj.Text = obj.Text.replace(/"/g, "");
  //   return obj;
  // })
  // console.log("After replacing below");
  // console.log(chatArr);
  solutions(chatArr);
}

function solutions(chatArr) {
  firstMessage(chatArr);
  countMessagesOverDays(chatArr);
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

    if (obj["Sender"].indexOf(senders[0]) >= 0) {
      messageKing++;
    } else if (obj["Sender"].indexOf(senders[1]) >= 0) {
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


  //Images sent by each sender
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
    item = item.trim();
    return item.toLowerCase();
  })
  textArray.sort();

  //var result = _.countBy(textArray, _.identity);
  var result = mostUsedWords(textArray);
  console.log(result);

  // Object.keys(obj) – returns an array of keys.
  // Object.values(obj) – returns an array of values.
  // Object.entries(obj) – returns an array of [key, value] pairs

  let entries = Object.entries(result);
  let sorted = entries.sort((a, b) => b[1] - a[1]);
  console.log(sorted);

  var sorted_moreThan3 = sorted.filter(function(item, i){
    if(item[0].length > 3)
    return true;
  })
  sorted_moreThan3 = sorted_moreThan3.slice(0, 10);

  var messenger = (messageKing > messageQueen ? senders[0]+": " + messageKing : senders[1]+": " + messageQueen)

  $("#most-msgs").html(`<p>The person who sent the most messsages ->${messenger}</p>`);


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
  // console.log("10 most used words now");
  // console.log(sorted_moreThan3);

  //
  // console.log("Images by each sender", imageObj);

  var firstMessageArr = firstMessage(chatArr);
  var EBDayArr = [],
    SumanDayArr = [];

  // EBDayArr = [[Date.UTC(2017, 00, 02), 10], [Date.UTC(2017, 00, 03), 8]];

  firstMessageArr.forEach(function(message, i) {
    var dateStr = message.Dates.slice(0, 10);
    var dateArray = dateStr.split("/");
    var dateObj = Date.UTC(dateArray[2], dateArray[1] - 1, dateArray[0]);

    var timeStr = message.Dates.slice(12, 23);
    var timeArray = timeStr.split(":");
    if (timeStr.indexOf("pm") >= 0 && parseInt(timeArray[0]) >= 1) {
      timeArray[0] = parseInt(timeArray[0]) + 12
    }

    timeArray[1] = parseInt(timeArray[1]) / 60;
    timeArray[0] = parseInt(timeArray[0]) + parseFloat(timeArray[1].toFixed(2));

    if (message.Sender == "EB") {
      EBDayArr.push([dateObj, timeArray[0]]);
    } else {
      SumanDayArr.push([dateObj, timeArray[0]]);
    }
  })


  Highcharts.chart('container', {
    chart: {
      type: 'column'
    },
    colors: ['#F00', '#00F'],
    title: {
      text: 'First message'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Days'
      }
    },
    yAxis: {
      min: 6,
      max: 24,
      labels: {
        rotation: 30
      },
      title: {
        text: 'Time in 24 hr format'
      }

    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
        name: 'EB',
        data: EBDayArr
      },
      {
        name: 'Suman',
        data: SumanDayArr
      }
    ]
  });
  //---------------------------------------------------------------------------
  //calling countMessagesOverDays function to display graph using Highcharts
  var cumulativeMessages = countMessagesOverDays(chatArr)
  // console.log("cumulativeMessages here");
  // console.log(cumulativeMessages);


  Highcharts.chart('container1', {
    chart: {
      type: 'column'
    },
    colors: ['#F0F', '#08F'],
    title: {
      text: 'Total messages over days'
    },
    tooltip: {
      useHTML: true,
      formatter: function() {
        return `<div>
          <div>Sent by EB: ${this.y}</div>
          <div>Sent by Suman: ${this.total - this.y}</div>
          <div>Total messages: ${this.total}</div>
          </div>`
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Days'
      }
    },
    yAxis: {
      min: 0,
      // max: 400,
      labels: {
        rotation: 30
      },
      title: {
        text: 'messages exchanged'
      }

    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
        name: 'EB',
        data: cumulativeMessages.eb
      },
      {
        name: 'Suman',
        data: cumulativeMessages.suman
      }
    ]
  });

  //Calculate and display a graph for prime time, i.e hour when most messages were exchanged

  var prime = primeTime(chatArr);
  var prime_24;
  var primeHour_messages = [];
  primeHour_messages = Object.keys(prime).map(function(key, i) {
    if (key.indexOf("pm") >= 0 && parseInt(key.slice(0, 2)) >= 1 && parseInt(key.slice(0, 2)) < 12) {
      prime_24 = prime[key];
      key = parseInt(key.slice(0, 2)) + 12 + ":pm";
      return [key, prime_24];
    } else {
      return [key, prime[key]];
    }
  })

  var primeArr = primeHour_messages.map(function(item, i) {
    if (item[0] == "12 am") {
      item[0] = "24 am";
    }
    return [Date.UTC(2017, 9, 1, parseInt(item[0])), item[1]];
  })

  // console.log("Printing final input");
  // console.log(primeArr);

  Highcharts.chart('container2', {
    chart: {
      type: 'column'
    },
    colors: ['#09F'],
    title: {
      text: 'Prime Hours'
    },
    tooltip: {
      useHTML: true,
      formatter: function() {
        return `<div>
      <div>Messages exchanged: ${this.y}</div>
      </div>`
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time in 24 hr format'
      }
    },
    yAxis: {
      min: 0,
      // max: 400,
      labels: {
        rotation: 30
      },
      title: {
        text: 'messages exchanged'
      }

    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
        name: 'EB',
        data: primeArr
      }
    ]
  });

var percentObj = percentageOfMessages(chatArr);
var morningPercent = ((percentObj["morningMessages"] / (percentObj["morningMessages"] + percentObj["eveningMessages"]))*100).toFixed(2);
var eveningPercent = ((percentObj["eveningMessages"] / (percentObj["morningMessages"] + percentObj["eveningMessages"]))*100).toFixed(2);
console.log(morningPercent, eveningPercent);

Highcharts.chart('container3', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Percentage of messages exchanged in the morning vs night'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Messages',
        colorByPoint: true,
        data: [{
            name: 'Morning messages',
            y: 19
        }, {
            name: 'Night messages',
            y: 81,
            sliced: true,
            selected: true
        }]
    }]
});


}

//func that calculates the first sender of a message per day

function firstMessage(obj) {
  var prev = "";
  var firsts = [];
  var format = 'hh:mm:ss A';
  var time = moment('06:00:00', format);
  var currTime;

  //filters messages sent after 6 am, resulting in an obj consisting of messages exchanged only after 6 am each day
  obj = obj.filter(function(message, i) {
    currTime = moment(message.Dates.slice(12, 23), format);
    if (currTime > time) {
      return true;
    }
  })
  //determines the first message exchanged each day
  obj.forEach(function(message, i) {
    if (message.Dates.indexOf(prev) < 0 || prev == "") {
      firsts.push(message);
    }
    prev = message.Dates.slice(0, 9);
  })
  return firsts;
  // console.log("First messages of the day");
  // console.log(firsts);
}

//count messages over days

function countMessagesOverDays(obj) {
  var countMessages = {};
  var prev = "";
  var uniqueDateArray = [];
  obj.forEach(function(message, i) {
    if (message.Dates.indexOf(prev) < 0 || prev == "") {
      uniqueDateArray.push(message.Dates.slice(0, 10));
    }
    prev = message.Dates.slice(0, 10);
  })

  uniqueDateArray.forEach(function(dateItem, index) {
    var EBcount = 0,
      SHCount = 0;

    obj.forEach(function(message, i) {
      if (message.Dates.slice(0, 10).indexOf(dateItem) >= 0) {
        if (message.Sender == "EB") {
          EBcount++;
          countMessages[dateItem] = {
            "EB": EBcount,
            "Suman": SHCount
          }
        } else {
          SHCount++;
          countMessages[dateItem] = {
            "EB": EBcount,
            "Suman": SHCount
          }
        }
      }
    })
  })

  var EBArr = Object.keys(countMessages).map(function(date, i) {
    var dateSplit = date.split("/");
    return [Date.UTC(dateSplit[2], dateSplit[1] - 1, dateSplit[0]), countMessages[date]["EB"]]
  })

  var sumanArr = Object.keys(countMessages).map(function(date, i) {
    var dateSplit = date.split("/");
    return [Date.UTC(dateSplit[2], dateSplit[1] - 1, dateSplit[0]), countMessages[date]["Suman"]]
  })

  return {
    eb: EBArr,
    suman: sumanArr
  };

}

//When do we talk the most (by hour)

function primeTime(chatArr) {
  var primeHour = {};
  var hours, am_pm, hotHours;
  chatArr.forEach(function(message, i) {
    hours = message.Dates.slice(12, 14);
    am_pm = message.Dates.slice(20, 23);
    hotHours = hours + am_pm;
    if (primeHour[hotHours] == undefined) {
      primeHour[hotHours] = 1;
    } else {
      primeHour[hotHours] = primeHour[hotHours] + 1;
    }
  })
  console.log(primeHour);
  return primeHour;
}

//calculate percentage of messages sent in the morning vs night

function percentageOfMessages(messages){
  var morn = 0, eve = 0;
  var format = 'hh:mm:ss A';
  var atMorning = moment('06:00:00', format);
  var atNoon = moment('12:00:00', format);
  var currTime;
  var messageObj = {};

  //calculates messages sent between 6 am to 12 pm in one bucket and those sent later in another bucket as eveningMessages
  messages.forEach(function(message, i) {
    currTime = moment(message.Dates.slice(12, 23), format);
    if (currTime > atMorning && currTime <= atNoon) {
       messageObj["morningMessages"] = morn++;
    }
    else {
      messageObj["eveningMessages"] = eve++;
    }
  })
  console.log(messageObj);
  return messageObj;
}
