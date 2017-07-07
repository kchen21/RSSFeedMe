$(function() {

  $(document).on("click", ".subscribe-btn", function(e) {
    e.preventDefault();
    var myFeedId = $(this).data('id');
    $("#subscribeModal #feedId").val(myFeedId);
  });

  $(document).on("click", ".delete-btn", function(e) {
    e.preventDefault();
    var myCollectionId = $(this).data('collectionid');
    var myCollectionTitle = $(this).data('collectiontitle');
    var myFeedId = $(this).data('feedid');
    var myFeedTitle = $(this).data('feedtitle');
    $("#deleteFeedModal #collectionId").val(myCollectionId);
    $("#deleteFeedModal #collectionTitle").val(myCollectionTitle);
    $("#deleteFeedModal #feedId").val(myFeedId);
    $("#deleteFeedModal #feedTitle").val(myFeedTitle);
  });

});
