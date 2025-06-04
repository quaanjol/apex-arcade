public class YoutubeChannelRefreshTokenFromFlow {
	public class FlowInput {
		@InvocableVariable(required=true)
		public String recordId;
	}
	
	@InvocableMethod(label='Refresh Youtube Channel Token')
	public static void refreshYoutubeChannelToken(List<FlowInput> inputs) {
		for (FlowInput input : inputs) {
			if(input.recordId != null) {
				GoogleRefreshToken.refreshToken(input.recordId);
			}
		}
	}
}
