window.onload = function() {
  var fileInput = document.getElementById('fileInput');

  fileInput.addEventListener('change', function(e) {
    document.getElementById('sender-info').innerHTML = '<h5 class="animated">Loading...</h5>';
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
      var reader = new FileReader();
      reader.onload = function(e) {
        parseData(reader.result);
      }
      reader.readAsText(file);
    } else {
      document.getElementById('sender-info').innerHTML = '';
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

  var senders = Object.keys(senderCountRes.messageCount);

  var messageCount = senderCountRes.messageCount;
  messageCount = Object.keys(messageCount).map(function(key) {
    return [key, messageCount[key]]
  }).sort(function(a, b) { return b[1] - a[1] })

  var imageCount = senderCountRes.imageCount;
  imageCount = Object.keys(imageCount).map(function(key) {
    return [key, imageCount[key]]
  }).sort(function(a, b) { return b[1] - a[1] })

  var emojiCount = senderCountRes.emojiCount;
  emojiCount = Object.keys(emojiCount).map(function(key) {
    return [key, emojiCount[key]]
  }).sort(function(a, b) { return b[1] - a[1] })

  var wordCount = senderCountRes.wordCount;
  wordCount = Object.keys(wordCount).map(function(key) {
    return [key, wordCount[key]]
  }).sort(function(a, b) { return b[1] - a[1] })

  var latency = senderCountRes.latency;
  latency = Object.keys(latency).map(function(key) {
    return [key, latency[key]]
  }).sort(function(a, b) { return b[1] - a[1] })

  var topWords = senderCountRes.topWords.map(function(word) {
    return word[0]+" ("+word[1]+")"
  }).join(", ");

  var topEmoji = senderCountRes.topEmoji.map(function(emoji) {
    return emoji[0]+" ("+emoji[1]+")"
  }).join(", ");

  $('#insights').html(`
    <div>
      <p>Who sent the most texts? <b>${messageCount[0][0]} (${messageCount[0][1]}) / ${messageCount[1][0]} (${messageCount[1][1]})</b></p>
      <p>Who sent the most photos? <b>${imageCount[0][0]} (${imageCount[0][1]}) / ${imageCount[1][0]} (${imageCount[1][1]})</b></p>
      <p>Who sent the most emojis? <b>${emojiCount[0][0]} (${emojiCount[0][1]}) / ${emojiCount[1][0]} (${emojiCount[1][1]})</b></p>
      <p>Who sent the most words? <b>${wordCount[0][0]} (${wordCount[0][1]}) / ${wordCount[1][0]} (${wordCount[1][1]})</b></p>
      <p>Who replies late? <b>${latency[0][0]} (${(latency[0][1]/60).toFixed(1)}min) / ${latency[1][0]} (${(latency[1][1]/60).toFixed(1)}min)</b></p>
      --
      <p>Top words: <b>${topWords}</b></p>
      <p>Top emojis: <b>${topEmoji}</b></p>
    </div>
    `);

  drawFirstMessengerGraph(firstMessengerData(chatArr));
  drawMessagesOverDays(messagesOverDaysData(chatArr));
  drawPrimeHours(primeHoursData(chatArr));

  $('#sender-info').html(`<h1>${senders[0]}&nbsp;&&nbsp;${senders[1]}</h1>`);
  $('.card-title').toggleClass("card-title-black");
}

function drawFirstMessengerGraph(seriesData) {
  Highcharts.chart('graph-first-messenger', {
    chart: { type: 'scatter', zoomType: 'xy', height: 120 },
    title: { text: null },
    subtitle: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { type: 'datetime', title: { enabled: false }, },
    yAxis: { title: { text: 'Person to text first (after 6am)' } },
    plotOptions: {
        scatter: {
            marker: {
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: { hover: { marker: { enabled: false } } }
        }
    },
    series: seriesData
  });
}

function drawMessagesOverDays(seriesData) {
  Highcharts.chart('graph-messages-over-days', {
    chart: { type: 'area', zoomType: 'x' },
    title: { text: null },
    subtitle: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { type: 'datetime', title: { enabled: false }, },
    yAxis: { title: { text: 'Text count' } },
    tooltip: { split: true },
    plotOptions: {
        area: {
            stacking: 'normal',
            lineColor: 'rgba(0, 0, 0, 0.3)',
            lineWidth: 0,
            marker: { enabled: false }
        }
    },
    series: seriesData
  });
}

function drawPrimeHours(seriesData) {
  Highcharts.chart('graph-prime-hours', {
    chart: { type: 'heatmap' },
    title: { text: null },
    subtitle: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
        categories: ['Midnight', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', 'Noon', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM']
    },
    yAxis: {
        categories: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    colorAxis: { min: 0, minColor: '#FFFFFF', maxColor: '#673AB7' },
    tooltip: {
        formatter: function () {
            return '<b>' + this.series.xAxis.categories[this.point.x] + '</b><br><b>' +
                this.point.value + '</b> texts exchanged <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
        }
    },
    series: [{
        name: 'Sales per employee',
        borderWidth: 0,
        data: seriesData,
        dataLabels: { enabled: true, color: '#000000'}
    }]
  });
}
