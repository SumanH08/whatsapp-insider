var getEmojiRegex = function() {
  return /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
}

var senderCount = function(chatArr) {
  var messageCount = {}, imageCount = {}, wordCount = {}, emojiCount = {}, wordsObj = {}, emojiObj = {}, latency = {};
  var imageRegex = /image omitted/g;
  var mediaRegex = /<Media omitted>/g;
  var emojiRegex = getEmojiRegex();

  var prevSender = chatArr[0].sender;
  var prevTime = moment(chatArr[0].dateTime, "DD/MM/YYYY hh:mm:ss a");

  chatArr.forEach(function(chatObj) {
    // images
    if(!chatObj) return
    var imageMatches = chatObj.message.match(imageRegex) || chatObj.message.match(mediaRegex);
    if(imageMatches) {
      imageCount[chatObj.sender] = imageCount[chatObj.sender] ? imageCount[chatObj.sender] + 1 : 1;
    }

    // emoji
    var emojiMatches = chatObj.message.match(emojiRegex);
    if(emojiMatches) {
      emojiCount[chatObj.sender] = emojiCount[chatObj.sender] ? emojiCount[chatObj.sender] + emojiMatches.length : emojiMatches.length;
      emojiMatches.forEach(function(emoji) {
        emojiObj[emoji] = emojiObj[emoji] ? emojiObj[emoji] + 1 : 1;
      });
    }

    // messages
    messageCount[chatObj.sender] = messageCount[chatObj.sender] ? messageCount[chatObj.sender] + 1 : 1;

    // individual words
    var words = chatObj.message.replace(/image omitted/g, '').toLowerCase().match(/[a-zA-Z'"]+/g) || [];
    words.forEach(function(word) {
      wordsObj[word] = wordsObj[word] ? wordsObj[word] + 1: 1;
    });


    // words
    var wordLength = words.length;
    wordCount[chatObj.sender] = wordCount[chatObj.sender] ? wordCount[chatObj.sender] + wordLength : wordLength;

    // time latency
    if(chatObj.sender != prevSender) {
      var currentTime = moment(chatObj.dateTime, "DD/MM/YYYY hh:mm:ss a");
      var timeDiff = currentTime.diff(prevTime, 'seconds');

      if(timeDiff < 12 * 60 * 60) {
        if(latency[chatObj.sender] != undefined) {
          latency[chatObj.sender].push(timeDiff);
        } else {
          latency[chatObj.sender] = [timeDiff];
        }
      }
      prevSender = chatObj.sender;
      prevTime = currentTime;
    }
  })

  // convert obj to array, sort by desc, splice to only form an array of first 10 words
  var wordsArr = Object.keys(wordsObj).map(function(key) {
    return [key, wordsObj[key]]
  }).sort(function(a, b) {
    return b[1] - a[1]
  }).splice(0, 10);


  var emojiArr = Object.keys(emojiObj).map(function(key) {
    return [key, emojiObj[key]]
  }).sort(function(a, b) {
    return b[1] - a[1]
  }).splice(0, 10)

  Object.keys(latency).forEach(function(sender) {
    var timeDiff = latency[sender];
    var avgTimeDiff = timeDiff.reduce(function(a, b) { return a + b; }, 0) / timeDiff.length;
    latency[sender] = Math.ceil(avgTimeDiff);
  });

  return {
    messageCount: messageCount,
    imageCount: imageCount,
    wordCount: wordCount,
    emojiCount: emojiCount,
    topWords: wordsArr,
    topEmoji: emojiArr,
    latency: latency
  };
}

var colors = ['rgba(244, 67, 54, 0.5)', 'rgba(48, 79, 254, 0.5)'];

var firstMessengerData = function(chatArr) {
  var currentDate = null, graphObj = {};
  chatArr.forEach(function(chatObj) {
    if(!chatObj) return
    var nowDate = moment(chatObj.dateTime, "DD/MM/YYYY hh:mm:ss a");

    if(nowDate.hour() > 6) {
      nowDate = nowDate.format("DD/MM/YYYY");

      if(nowDate != currentDate) {
        graphObj[chatObj.sender] = graphObj[chatObj.sender] || [];
        graphObj[chatObj.sender].push(moment(nowDate, "DD/MM/YYYY").valueOf());
        currentDate = nowDate;
      }
    }
  });


  return Object.keys(graphObj).map(function(key, index) {
    return {
      name: key,
      color: colors[index],
      data: graphObj[key].map(function(date) {
        return [date, 0]
      })
    }
  })
}

var messagesOverDaysData = function(chatArr) {
  var graphObj = {};
  chatArr.forEach(function(chatObj) {
    if(!chatObj) return
    var nowDate = moment(chatObj.dateTime, "DD/MM/YYYY hh:mm:ss a").startOf('day').valueOf();
    graphObj[chatObj.sender] = graphObj[chatObj.sender] || {};
    graphObj[chatObj.sender][nowDate] = graphObj[chatObj.sender][nowDate] || 0;
    graphObj[chatObj.sender][nowDate] = graphObj[chatObj.sender][nowDate] + 1;
  })

  return Object.keys(graphObj).map(function(key, index) {
    var dateArr = Object.keys(graphObj[key]).map(function(date) {
      return [parseInt(date), graphObj[key][date]]
    });

    dateArr = dateArr.sort(function(a, b) {
      return a[0] - b[0]
    })

    return {
      name: key,
      color: colors[index],
      data: dateArr
    }
  })
}

var primeHoursData = function(chatArr) {
  xCat = Array.apply(null, Array(24)).map(function (_, i) {return i;});
  yCat = Array.apply(null, Array(7)).map(function (_, i) {return i;});

  var array2D = [];

  xCat.forEach(function() {
    var arr = [];
    yCat.forEach(function() {
      arr.push(0);
    })
    array2D.push(arr);
  })

  chatArr.forEach(function(chatObj) {
    if(!chatObj) return
    var nowDate = moment(chatObj.dateTime, "DD/MM/YYYY hh:mm:ss a");
    var hour = nowDate.hour();
    var day = nowDate.day();
    array2D[hour][day] += 1;
  })

  var returnArr = [];

  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[0].length; j++) {
       returnArr.push([i, j, array2D[i][j]]);
    }
  }

  return returnArr;
}
