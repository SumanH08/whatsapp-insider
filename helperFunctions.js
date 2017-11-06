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

[{"how": 10, "are": 1}]
