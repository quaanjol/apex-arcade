public class YoutubeHelper {
	public static final String POST_METHOD = 'POST';
    public static final String GET_METHOD = 'GET';

	public static String getApiUrl() {
		return Google_Setting__mdt.getInstance('API_base_api_url').Value__c;
	}

	public static String getYoutubeApiChannelsEndpoint() {
		return Google_Setting__mdt.getInstance('Youtube_API_v3_channels_endpoint').Value__c;
	}

	public static String getYoutubeApiSearchEndpoint() {
		return Google_Setting__mdt.getInstance('Youtube_API_v3_search_endpoint').Value__c;
	}

	public static String getYoutubeApiCommentThreadEndpoint() {
		return Google_Setting__mdt.getInstance('Youtube_API_v3_comment_thread_endpoint').Value__c;
	}

	public static HttpRequest generateRequest(String endpoint, String method, Map<String, String> params) {
        HttpRequest request = new HttpRequest();
		if(params == null) {
			params = new Map<String, String>();
		}
		params.put('key', Google_Setting__mdt.getInstance('API_token').Value__c);
		List<String> queryString = new List<String>();
		for(String key: params.keySet()) {
			queryString.add(key + '=' + params.get(key));
		}
		request.setEndpoint(endpoint + '?' + String.join(queryString, '&'));
        request.setMethod(method);	
        return request;
    }

	public static HttpRequest generateRequestWithoutKey(Youtube_Channel__c channel, String endpoint, String method, Map<String, String> params) {
        HttpRequest request = new HttpRequest();		
		if(params != null) {			
			List<String> queryString = new List<String>();
			for(String key: params.keySet()) {
				queryString.add(key + '=' + params.get(key));
			}
			request.setEndpoint(endpoint + '?' + String.join(queryString, '&'));
		} else {
			request.setEndpoint(endpoint);
		}
        request.setMethod(method);	
		request.setHeader('Authorization', 'Bearer ' + channel.Token__c);
		request.setHeader('Content-Type', 'application/json');
        return request;
    }

	@AuraEnabled(cacheable=true)
	public static String getMyChannelHandle() {
		return Google_Setting__mdt.getInstance('My_Youtube_Channel_Handle').Value__c;
	}

	// get youtube channel by channel handle
	@AuraEnabled(cacheable=true)
	public static YoutubeChannelResponse getYoutubeChannelByHandle(String handle) {
		try {
			YoutubeChannelResponse result;
			HttpRequest request = generateRequest(getApiUrl() + getYoutubeApiChannelsEndpoint(), GET_METHOD, new Map<String, String>{
				'part' => 'snippet',
				'forHandle' => handle
			});
			Http http = new Http();
			HttpResponse response = http.send(request);
			result = (YoutubeChannelResponse) JSON.deserialize(response.getBody().replace('default', 'thumbnails_default'), YoutubeChannelResponse.class);
			return result;
		} catch (Exception e) {
			System.debug('Error getting Youtube channel by handle: ' + e.getMessage());
            return null;
		}
	}
}