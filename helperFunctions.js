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
  console.log("Prime hour now");
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
