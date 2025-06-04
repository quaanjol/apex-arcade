trigger YoutubeChannelTrigger on Youtube_Channel__c (before insert, after insert, before update, after update) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            YoutubeChannelTriggerHandler.beforeInsert(Trigger.new);
        }
        if(Trigger.isUpdate) {
            YoutubeChannelTriggerHandler.beforeUpdate(Trigger.new, Trigger.oldMap, Trigger.newMap);
        }
    }
}