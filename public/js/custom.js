$(document).on("click", ".feeds button", function() {
  var myfeedId = $(this).data('id');
  $("#subscribeModal #feedId").val(myFeedId);
});
