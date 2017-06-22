$(function() {

  $(document).on("click", ".subscribe-btn", function(e) {
    e.preventDefault();
    var myFeedId = $(this).data('id');
    $("#subscribeModal #feedId").val(myFeedId);
  });

  function getArticles(url) {
    return ($.ajax({
      type: "GET",
      url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22" + encodeURIComponent(`${url}`) + "%22&format=json&diagnostics=true&callback=",
      dataType: 'json'
    }));
  }
});
