$(function() {

  $(document).on("click", ".subscribe-btn", function(e) {
    e.preventDefault();
    var myFeedId = $(this).data('id');
    $("#subscribeModal #feedId").val(myFeedId);
  });

});
