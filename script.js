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

function parseWhatsAppChat(chat) {
  const regex = /\[(\d{1,2}\/\d{1,2}\/\d{1,2}), (\d{1,2}:\d{1,2}:\d{1,2} [AP]M)\] ([^:]+): (.+)/g;
  const messages = [];
  let match;
  while ((match = regex.exec(chat)) !== null) {
    const [_, date, time, sender, message] = match;
    messages.push({
      dateTime: date + " " + time,
      date,
      time,
      sender,
      message,
    });
  }
  return messages;
}


function parseData(chatData) {
  var splitMessage = chatData.split("\n");

  // go through each message and convert to {dateTime: , sender: , message: }
  var chatArr = [];
  splitMessage.forEach(function(messageStr, index) {
    var obj = parseWhatsAppChat(messageStr)
    chatArr.push(obj[0]);
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

  var [sender1="", count1=0] = messageCount[0]
  var [sender2="", count2=0] = messageCount[1]

  var [imageSender1="", imageCount1=0] = imageCount[0]
  var [imageSender2="", imageCount2=0] = imageCount[1]

  var [emojiSender1="", emojiCount1=0] = emojiCount[0]
  var [emojiSender2="", emojiCount2=0] = emojiCount[1]

  var [wordSender1="", wordCount1=0] = wordCount[0]
  var [wordSender2="", wordCount2=0] = wordCount[1]

  var [latency1="", latencyCount1=0] = latency[0]
  var [latency2="", latencyCount2=0] = latency[1]

  $('#insights').html(`
    <div>
      <p>Who sent the most texts? <b>${sender1} (${count1}) / ${sender2} (${count2})</b></p>
      <p>Who sent the most photos? <b>${imageSender1} (${imageCount1}) / ${imageSender2} (${imageCount2})</b></p>
      <p>Who sent the most emojis? <b>${emojiSender1} (${emojiCount1}) / ${emojiSender2} (${emojiCount2})</b></p>
      <p>Who sent the most words? <b>${wordSender1} (${wordCount1}) / ${wordSender2} (${wordCount2})</b></p>
      <p>Who replies late? <b>${latency1} (${(latencyCount1/60).toFixed(1)}min)/${latency2} (${(latencyCount2/60).toFixed(1)}min) </b></p>
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
  Highcharts.chart("graph-first-messenger", {
    chart: { type: "scatter", zoomType: "xy", height: 224 },
    title: { text: null },
    subtitle: { text: null },
    legend: {
      enabled: true,
      itemStyle: {
        color: "#000000",
        fontWeight: "bold",
        fontSize: "15px",
      },
    },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      type: "datetime",
      title: { enabled: false },
      labels: {
        style: {
          fontSize: "15px",
        },
      },
    },
    yAxis: {
      title: { text: "Person to text first (after 6am)", style: {
        fontSize: "15px",
      }, },
      labels: {
        style: {
          fontSize: "15px",
        },
      },
    },
    tooltip: {
      style: {
        fontSize: "15px",
      },
      formatter: function () {
        return 'The first message for ' + moment(this.x).format("DD MMM YYYY");
      }
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: "rgb(100,100,100)",
            },
          },
        },
        states: { hover: { marker: { enabled: false } } },
      },
    },
    series: seriesData,
  });
}

function drawMessagesOverDays(seriesData) {
  Highcharts.chart('graph-messages-over-days', {
    chart: { type: 'area', zoomType: 'x' },
    title: { text: null },
    subtitle: { text: null },
    legend: {
      enabled: true,
      itemStyle: {
        color: "#000000",
        fontWeight: "bold",
        fontSize: "15px",
      },
    },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { type: 'datetime', title: { enabled: false }, },
    yAxis: { title: { text: 'Text count' } },
    tooltip: { split: true, style: {
      fontSize: "15px",
    }, },
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
      style: {
        fontSize: "15px",
      },
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
