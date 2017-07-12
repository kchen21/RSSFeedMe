$(function() {

  $(document).on("click", ".subscribe-btn", function(e) {
    e.preventDefault();
    var myFeedId = $(this).data('id');
    $("#subscribeModal #feedId").val(myFeedId);
  });

  $(document).on("click", ".feed-delete-btn", function(e) {
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

  $(document).on("click", ".collection-delete-btn", function(e) {
    e.preventDefault();
    var myCollectionId = $(this).data('collectionid');
    var myCollectionTitle = $(this).data('collectiontitle');
    $("#deleteCollectionModal #collectionId").val(myCollectionId);
    $("#deleteCollectionModal #collectionTitle").val(myCollectionTitle);
  });

  $(document).on("click", ".bookmark-delete-btn", function(e) {
    e.preventDefault();
    var myBookmarkId = $(this).data('bookmarkid');
    var myBookmarkTitle = $(this).data('bookmarktitle');
    $("#deleteBookmarkModal #bookmarkId").val(myBookmarkId);
    $("#deleteBookmarkModal #bookmarkTitle").val(myBookmarkTitle);
  });

});
