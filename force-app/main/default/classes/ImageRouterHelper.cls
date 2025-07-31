public class ImageRouterHelper {
	public static final String IMAGE_ROUTER_BASEURL = 'https://ir-api.myqa.cc';
	public static final String IMAGE_ROUTER_IMAGE_GEN_ENDPOINT = '/v1/openai/images/generations';
	public static final String IMAGE_ROUTER_TOKEN = 'f2094995b86ddb1f0385834145b81bb1b3d1c351373a4e22587b83d6bbcee668';
	public static final String IMAGE_ROUTER_DEFAULT_MODEL = 'black-forest-labs/FLUX-1-schnell:free';
	public static final String IMAGE_ROUTER_DEFAULT_QUALITY = 'auto';

	public class GenericResponse {
		@AuraEnabled
		public Boolean success;
		@AuraEnabled
		public String message;
		@AuraEnabled
		public Object data;

		public GenericResponse(Boolean success, String message, Object data) {
			this.success = success;
			this.message = message;
			this.data = data;
		}
	}
	
	public static GenericResponse generateImage(String prompt) {
		try {
			HttpRequest request = new HttpRequest();
			request.setEndpoint(IMAGE_ROUTER_BASEURL + IMAGE_ROUTER_IMAGE_GEN_ENDPOINT);
			request.setMethod('POST');
			request.setHeader('Content-Type', 'application/json');
			request.setHeader('Authorization', 'Bearer ' + IMAGE_ROUTER_TOKEN);
			
			ImageRouterRequest imageRouterRequest = new ImageRouterRequest();
			imageRouterRequest.prompt = prompt;
			imageRouterRequest.model = IMAGE_ROUTER_DEFAULT_MODEL;
			imageRouterRequest.quality = IMAGE_ROUTER_DEFAULT_QUALITY;
			request.setBody(JSON.serialize(imageRouterRequest));

			Http http = new Http();
			HttpResponse response = http.send(request);
			ImageRouterResponse imageRouterResponse = (ImageRouterResponse) JSON.deserialize(response.getBody(), ImageRouterResponse.class);
			return new GenericResponse(true, 'Image generated successfully', imageRouterResponse);
		} catch (Exception e) {
			return new GenericResponse(false, e.getMessage() + '\nTrace: ' + e.getStackTraceString(), null);
		}
	}
}