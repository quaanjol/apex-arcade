public class YoutubeChannelTriggerHandler {
    public static void beforeInsert(List<Youtube_Channel__c> youtubeChannels) {
        encodeYoutubeHandle(youtubeChannels);
    }
    
    public static void beforeUpdate(
        List<Youtube_Channel__c> youtubeChannels, 
        Map<Id,Youtube_Channel__c> oldMap, 
        Map<Id, Youtube_Channel__c> newMap
    ) {
        encodeYoutubeHandle(youtubeChannels);
    }
    
    public static void encodeYoutubeHandle(List<Youtube_Channel__c> channels) {
        for(Youtube_Channel__c channel: channels) {
            if(channel.Handle__c != null) {
                channel.Handle_Encoded__c = EncodingUtil.urlEncode(channel.Handle__c, 'UTF-8');
            }
        }
    }
}