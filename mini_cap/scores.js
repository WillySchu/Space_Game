var scoreData = new Firebase('blazing-heat-3256.firebaseIO.com');
var topScores = {
  top10: [],
  findScores: function(scores) {
    if (this.top10.length < 10) {
      this.top10.push(scores);
      this.top10.sort(this.sortScores);
    } else {
      this.top10.push(scores);
      this.top10.sort(this.sortScores);
      this.top10.pop();
    }
    return this.top10;
  },
  sortScores: function(a, b) {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    return 0;
  },
  appendScores: function(scores) {
    var $ol = $('ol');
    $ol.empty();
    for (var i = 0; i < scores.length; i++) {
      var $li = $('<li>' + scores[i].name + ' - ' + scores[i].score + '</li>');
      $ol.append($li);
    }
  }
};

scoreData.on('child_added', function(data) {
  var top10 = topScores.findScores(data.val());
  console.log(top10);
  topScores.appendScores(top10);
});
