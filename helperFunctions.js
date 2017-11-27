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

    if (obj["Sender"].indexOf(senders[0]) >= 0) {
      EBMessage = obj["Text"].split(" ");
      EBMessageLength += EBMessage.length;
    } else if (obj["Sender"].indexOf(senders[1]) >= 0) {
      SumanMessage = obj["Text"].split(" ");
      SumanMessageLength += SumanMessage.length;
    }

    //calculate number of emojis used by each sender

    if (regex.test(obj["Text"])) {

      if (obj["Sender"].indexOf(senders[0]) >= 0) {
        emojiObj[obj.Sender] = numberOfEmojisByEB++;
      } else if (obj["Sender"].indexOf(senders[1]) >= 0) {
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
      if (obj["Sender"] == senders[0]) {
        imageObj[obj.Sender] = EBimages++;
      } else if (obj["Sender"] == senders[1]) {
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

  //sorting most used words below??
  let entries = Object.entries(result);
  let sorted = entries.sort((a, b) => b[1] - a[1]);
  console.log(sorted);

  var sorted_moreThan3 = sorted.filter(function(item, i) {
    if (item[0].length > 3)
      return true;
  })
  sorted_moreThan3 = sorted_moreThan3.slice(0, 10);

  //result adjustments to display insights
  var most = messageKing > messageQueen ? senders[0] : senders[1]
  var messenger = (messageKing > messageQueen ? senders[0] + ": " + messageKing : senders[1] + ": " + messageQueen);
  var maxWordLength = EBMessageLength > SumanMessageLength ? senders[0] : senders[1]
  var minWordLength = EBMessageLength < SumanMessageLength ? senders[0] : senders[1]
  var wordDiff = Math.abs(EBMessageLength - SumanMessageLength);

  var avg_word_length_0 = (EBMessageLength / messageKing).toFixed(4);
  var avg_word_length_1 = (SumanMessageLength / messageQueen).toFixed(4);

  var max_words_user = avg_word_length_0 > avg_word_length_1 ? senders[0]:senders[1];
  var min_words_user = avg_word_length_0 < avg_word_length_1 ? senders[0]:senders[1];

  var max_avg_word_length = Math.abs(avg_word_length_0 - avg_word_length_1).toFixed(2);

  var firstMessageArr = firstMessage(chatArr);
  var initiator_arr = firstMessageArr.map(function(firstMessage, i){
    return firstMessage.Sender;
  })
  var initiator = [];
  initiator = _.countBy(initiator_arr, _.identity);
  console.log("initiator");
  console.log(initiator);

  var initiator_king = initiator[senders[0]] > initiator[senders[1]] ? senders[0] : senders[1]

  $("h3").css("color", "black");


  $("#most-msgs").html(`<p>a. ${most} sent the most messsages among the two of you - ${senders[0]}: ${messageKing}, ${senders[1]}: ${messageQueen} <br><br>
    b. ${maxWordLength} has used ${wordDiff} words more than ${minWordLength}<br><br>
    c. ${max_words_user}, on average, uses ${max_avg_word_length} more words/sentence than ${min_words_user} <br><br>
    d. ${initiator_king} initiates the conversation on most days<br><br>
    e. Emojis by each sender, ${senders[0]}: ${emojiObj[senders[0]]}<br>${senders[1]}: ${emojiObj[senders[1]]}<br><br> f. Ten most used words in the conversation:<br>
    1. ${sorted_moreThan3[0][0]}: ${sorted_moreThan3[0][1]}<br>
    2. ${sorted_moreThan3[1][0]}: ${sorted_moreThan3[1][1]}<br>
    3. ${sorted_moreThan3[2][0]}: ${sorted_moreThan3[2][1]}<br>
    4. ${sorted_moreThan3[3][0]}: ${sorted_moreThan3[3][1]}<br>
    5. ${sorted_moreThan3[4][0]}: ${sorted_moreThan3[4][1]}<br>
    6. ${sorted_moreThan3[5][0]}: ${sorted_moreThan3[5][1]}<br>
    7. ${sorted_moreThan3[6][0]}: ${sorted_moreThan3[6][1]}<br>
    8. ${sorted_moreThan3[7][0]}: ${sorted_moreThan3[7][1]}<br>
    9. ${sorted_moreThan3[8][0]}: ${sorted_moreThan3[8][1]}<br>
    10. ${sorted_moreThan3[9][0]}: ${sorted_moreThan3[9][1]}<br><br>
    g. Images sent by ${senders[0]}: ${imageObj[senders[0]]}<br>
    Images sent by ${senders[1]} : ${imageObj[senders[1]]}</p>`)

  //
  // console.log("This is the person who sent most messages -> " + (messageKing > messageQueen ? "EB: " + messageKing : "Suman: " + messageQueen));
  //
  // console.log("EB's total word length:" + (EBMessageLength));
  // console.log("Suman's total word length:" + (SumanMessageLength));
  //
  // console.log("EB's average word length per message:" + (EBMessageLength / messageKing).toFixed(4));
  //
  // console.log("Suman's average word length per message:" + (SumanMessageLength / messageQueen).toFixed(4));
  // //
  // console.log("Emojis by each sender", emojiObj);
  // //
  // console.log("10 most used words now");
  // console.log(sorted_moreThan3);
  //
  //
  // console.log("Images by each sender", imageObj);

  var EBDayArr = [],
    SumanDayArr = [];

  // EBDayArr = [[Date.UTC(2017, 00, 02), 10], [Date.UTC(2017, 00, 03), 8]];

  firstMessageArr.forEach(function(message, i) {
    var dateStr = message.Dates.slice(0, 10);
    var dateArray = dateStr.split("/");
    var dateObj = Date.UTC(dateArray[2], dateArray[1] - 1, dateArray[0]);

    var timeStr = message.Dates.slice(12, 23);
    var timeArray = timeStr.split(":");
    if ((timeStr.indexOf("pm") >= 0 || timeStr.indexOf("PM") >= 0) && parseInt(timeArray[0]) >= 1) {
      timeArray[0] = parseInt(timeArray[0]) + 12
    }

    timeArray[1] = parseInt(timeArray[1]) / 60;
    timeArray[0] = parseInt(timeArray[0]) + parseFloat(timeArray[1].toFixed(2));

    if (message.Sender == senders[0]) {
      EBDayArr.push([dateObj, timeArray[0]]);
    } else {
      SumanDayArr.push([dateObj, timeArray[0]]);
    }
  })

  Highcharts.stockChart('container', {
    chart: {
      type: 'column'
    },
    colors: ['#F00', '#00F'],
    title: {
      text: 'First message'
    },
    rangeSelector:{
              enabled:true
            },
    xAxis: {
      min: Date.UTC(2017, 1, 1),
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
        name: senders[0],
        data: EBDayArr
      },
      {
        name: senders[1],
        data: SumanDayArr
      }
    ]
  });
  //---------------------------------------------------------------------------
  //calling countMessagesOverDays function to display graph using Highcharts
  var cumulativeMessages = countMessagesOverDays(chatArr)
  console.log("Messages over days");
  console.log(cumulativeMessages);

  Highcharts.stockChart('container1', {

      colors: ['#F00', '#00F'],
      title: {
          text: 'Total messages over days'
      },
      rangeSelector:{
                enabled:true
              },
      subtitle: {
          text: 'Source: whatsapp.com'
      },

      xAxis: {
        type: 'datetime',
        title: {
          text: 'Days'
        }
      },
      yAxis: {
        min: 0,
        //  max: 400,
        labels: {
          rotation: 30
        },
        title: {
          text: 'messages exchanged'
        }
      },
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
      },

      plotOptions: {
          series: {
              label: {
                  connectorAllowed: false
              },
              pointStart: 2010
          }
      },

      series: [{
          name: senders[0],
          data: cumulativeMessages[senders[0]]
      }, {
          name: senders[1],
          data: cumulativeMessages[senders[1]]
      }],

      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  legend: {
                      layout: 'horizontal',
                      align: 'center',
                      verticalAlign: 'bottom'
                  }
              }
          }]
      }

  });

  //Calculate and display a graph for prime time, i.e hour when most messages were exchanged

  var prime = primeTime(chatArr);
  var prime_24;
  var primeHour_messages = [];
  primeHour_messages = Object.keys(prime).map(function(key, i) {

//converting times into 24hr format; returning the time and the value(# of messages)
    if ((key.indexOf("pm") >= 0 || key.indexOf("PM") >= 0) && parseInt(key.slice(0, 2)) >= 1 && parseInt(key.slice(0, 2)) < 12) {
      prime_24 = prime[key];
      key = parseInt(key.slice(0, 2)) + 12 + ":pm";
      return [key, prime_24];
    } else {
      return [key, prime[key]];
    }
  })
//converting 12am to 24am since the previous code logic doesn't solve this issue
  var primeArr = primeHour_messages.map(function(item, i) {
    if (item[0] == "12 am" || item[0] == "12 AM") {
      item[0] = "24 am";
    }
    return [Date.UTC(2017, 9, 1, parseInt(item[0])), item[1]];
  })

  Highcharts.chart('container2', {
    chart: {
      type: 'column'
    },
    colors: ['#00F'],
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
      name: '# of messages exchanged',
      data: primeArr
    }]
  });

  var percentObj = percentageOfMessages(chatArr);
  var morningPercent = ((percentObj["morningMessages"] / (percentObj["morningMessages"] + percentObj["noonMessages"] + percentObj["nightMessages"] )) * 100).toFixed(2);

  var noonPercent = ((percentObj["noonMessages"] / (percentObj["morningMessages"] + percentObj["noonMessages"] + percentObj["nightMessages"] )) * 100).toFixed(2);

  var nightPercent = ((percentObj["nightMessages"] / (percentObj["morningMessages"] + percentObj["noonMessages"] + percentObj["nightMessages"] )) * 100).toFixed(2);

  console.log("Printing morning percent and evening percent now");
  console.log(morningPercent, noonPercent, nightPercent);

  Highcharts.chart('container3', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    colors: ['#F00', '#00F', '#FFA000'],
    title: {
      text: 'Percentage of messages exchanged in the morning vs noon vs night'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.2f} %',
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
        y: parseFloat(morningPercent)
      },
      {
        name: 'Noon messages',
        y: parseFloat(noonPercent)
      },
      {
        name: 'Night messages',
        y: parseFloat(nightPercent),
        sliced: true,
        selected: true
      }]
    }]
  });

}

function mostUsedWords(textArray) {
  var a = [], b = [], prev;
  var newObj = {};

  console.log("Sorted text array below");
  console.log(textArray);

  textArray.forEach(function(arr, i) {
    // var key, value = 0;

    newObj[arr] = newObj[arr] ? newObj[arr] + 1 : 1;
    //
    // if (arr !== prev) {
    //   key = arr;
    //   value = 1;
    //   newObj[key] = value; //bracket notation since key here is a variable
    // } else {
    //   key = prev;
    //   newObj[key] = newObj[key] + 1;
    // }
    // prev = arr;
  })
  return newObj;
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
  var key1 = senders[0];
  var key2 = senders[1];
  //uniqueDateArray will now contain all the unique dates in the conversation
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
        if (message.Sender == senders[0]) {
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

  console.log("MEssages over days");
  console.log(countMessages);

  var EBArr = Object.keys(countMessages).map(function(date, i) {
    var dateSplit = date.split("/");
    return [Date.UTC(dateSplit[2], dateSplit[1] - 1, dateSplit[0]), countMessages[date]["EB"]]
  })

  var sumanArr = Object.keys(countMessages).map(function(date, i) {
    var dateSplit = date.split("/");
    return [Date.UTC(dateSplit[2], dateSplit[1] - 1, dateSplit[0]), countMessages[date]["Suman"]]
  })

  return {
    [key1]: EBArr,
    [key2]: sumanArr
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
  console.log("Prime hour now");
  console.log(primeHour);
  return primeHour;
}

//calculate percentage of messages sent in the morning vs night

function percentageOfMessages(messages){
  var morn = 0, nooning = 0, nighting = 0;
  var format = 'hh:mm:ss A';
  var atMorning = moment('06:00:00', format);
  var atNoon = moment('12:00:00', format);
  var atNight = moment('18:00:00', format);
  var currTime;
  var messageObj = {};
  var morning = [],  noon = [], night = [];

  //calculates messages sent between 6 am to 12 pm in one bucket and those sent later in another bucket as eveningMessages
  messages.forEach(function(message, i) {
    currTime = moment(message.Dates.slice(12, 23), format);
    if (currTime >= atMorning && currTime <= atNoon) {
       messageObj["morningMessages"] = morn++;
       morning.push(message);
    }
    else if(currTime >= atNoon && currTime <= atNight){
      messageObj["noonMessages"] = nooning++;
      noon.push(message);
    }
    else {
      messageObj["nightMessages"] = nighting++;
      night.push(message);
    }
  })
  console.log(messageObj);
  console.log("Morning and evening messages");
  console.log(morning);
  console.log(noon);
  console.log(night);
  return messageObj;
}
