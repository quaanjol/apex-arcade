public class GetYoutubeChannelInfoFromFlow {
    public class FlowInput {
        @InvocableVariable(required=true)
        public String channelHandle;
    }

    public class FlowOutput {
        @InvocableVariable(required=true)
        public String channelId;

        @InvocableVariable(required=true)
        public String channelName;

        @InvocableVariable(required=true)
        public String channelThumbnailUrl;

        @InvocableVariable(required=true)
        public String channelDescription;
    }

    @InvocableMethod(label='Get Youtube Channel Info')
    public static List<FlowOutput> getYoutubeChannelInfo(List<FlowInput> inputs) {
        List<FlowOutput> outputs = new List<FlowOutput>();
        String channelHandle;
        FlowOutput output;
        for (FlowInput input : inputs) {
            channelHandle = input.channelHandle;
            YoutubeChannelResponse channelResponse = YoutubeHelper.getYoutubeChannelByHandle(channelHandle);
            output = new FlowOutput();
            if(channelResponse != null && channelResponse.items.size() > 0) {                
                output.channelId = channelResponse.items[0].id;
                output.channelName = channelResponse.items[0].snippet.title;
                output.channelThumbnailUrl = channelResponse.items[0].snippet.thumbnails.thumbnails_default.url;
                output.channelDescription = channelResponse.items[0].snippet.description;                
            } else {
                output.channelId = 'Not found';
                output.channelName = 'Not found';
                output.channelThumbnailUrl = 'Not found';
                output.channelDescription = 'Not found';
            }
            outputs.add(output);
        }
        return outputs;
    }
}
