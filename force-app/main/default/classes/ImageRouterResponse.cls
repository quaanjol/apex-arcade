public class ImageRouterResponse {
    public class DataItem {
		@AuraEnabled
		public String b64_json;
		@AuraEnabled
		public String url;
	}

	public class Error {
		@AuraEnabled
		public String message;
		@AuraEnabled
		public String type;
	}

	@AuraEnabled
	public List<DataItem> data;
	@AuraEnabled
	public Error error;
}