public class GeminiImageOCR {
	private static final String API_KEY = Google_Setting__mdt.getInstance('GoogleGenerativeLanguageAPIToken').Value__c;
	private static final String ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY;

	// Response wrapper
	public class GeminiOCRResult {
		@AuraEnabled
		public Boolean success;
		@AuraEnabled
		public String message;
		@AuraEnabled
		public Object data;

		public GeminiOCRResult(Boolean success, String message, Object data) {
			this.success = success;
			this.message = message;
			this.data = data;
		}
	}

	// Main method
	@AuraEnabled
	public static GeminiOCRResult extractTextFromImage(String base64Image, String mimeType) {
		if (base64Image == null || String.isBlank(mimeType)) {
			return new GeminiOCRResult(false, 'Invalid input image or MIME type.', null);
		}

		try {
			// Build Gemini API payload
			GeminiImageRequest payload = new GeminiImageRequest(
				mimeType,
				base64Image,
				'Extract all readable text from this image and return the result in JSON format. If no text is found, return an empty JSON object.'
			);

			HttpRequest req = new HttpRequest();
			req.setEndpoint(ENDPOINT);
			req.setMethod('POST');
			req.setHeader('Content-Type', 'application/json');
			req.setBody(JSON.serialize(payload));

			Http http = new Http();
			HttpResponse res = http.send(req);

			if (res.getStatusCode() == 200) {
				// Parse AI response
				Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

				List<Object> candidates = (List<Object>) parsed.get('candidates');
				if (candidates != null && !candidates.isEmpty()) {
					Map<String, Object> first = (Map<String, Object>) candidates[0];
					Map<String, Object> content = (Map<String, Object>) first.get('content');
					List<Object> parts = (List<Object>) content.get('parts');

					if (parts != null && !parts.isEmpty()) {
						Map<String, Object> part = (Map<String, Object>) parts[0];
						String text = (String) part.get('text');

						if (!String.isBlank(text)) {
							return new GeminiOCRResult(true, 'OCR success.', new Map<String, Object>{ 'text' => text });
						}
					}
				}
				return new GeminiOCRResult(true, 'No text found in image.', new Map<String, Object>());
			} else {
				return new GeminiOCRResult(false, 'Gemini API error: ' + res.getBody() + '\nPlayload: ' + JSON.serialize(payload), null);
			}

		} catch (Exception e) {
			return new GeminiOCRResult(false, 'Exception occurred: ' + e.getMessage() + '\nTrace: ' + e.getStackTraceString(), null);
		}
	}
}
