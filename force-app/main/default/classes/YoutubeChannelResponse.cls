public class YoutubeChannelResponse {
    public class PageInfo {
		@AuraEnabled
        public Integer totalResults;
		@AuraEnabled
        public Integer resultsPerPage;
    }

	public class Item {
		@AuraEnabled
		public String kind;
		@AuraEnabled
		public String etag;
		@AuraEnabled
		public String id;
		@AuraEnabled
		public Snippet snippet;
	}

	public class Snippet {
		@AuraEnabled
		public String title;
		@AuraEnabled
		public String description;
		@AuraEnabled
		public String customUrl;
		@AuraEnabled
		public String publishedAt;
		@AuraEnabled
		public String channelId;
		@AuraEnabled
		public Thumbnails thumbnails;
		@AuraEnabled
		public String channelTitle;
		@AuraEnabled
		public String liveBroadcastContent;
		@AuraEnabled
		public String publishTime;
	}

	public class Thumbnails {
		@AuraEnabled
		public Thumbnails_Default thumbnails_default;
		@AuraEnabled
		public Medium medium;
		@AuraEnabled
		public High high;
	}

	public class Thumbnails_Default {
		@AuraEnabled
		public String url;
		@AuraEnabled
		public Integer width;
		@AuraEnabled
		public Integer height;
	}

	public class Medium {
		@AuraEnabled
		public String url;
		@AuraEnabled
		public Integer width;
		@AuraEnabled
		public Integer height;
	}

	public class High {
		@AuraEnabled
		public String url;
		@AuraEnabled
		public Integer width;
		@AuraEnabled
		public Integer height;
	}

	public class Localized {
		@AuraEnabled
		public String title;
		@AuraEnabled
		public String description;
	}

    @AuraEnabled
    public String kind;
    @AuraEnabled
    public String etag;
    @AuraEnabled
    public PageInfo pageInfo;
    @AuraEnabled
    public List<Item> items;
}
