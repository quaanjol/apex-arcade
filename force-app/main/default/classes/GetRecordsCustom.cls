public without sharing class GetRecordsCustom {
	@AuraEnabled
    public static List<sObject> getRecords(String selectParam, String fromParam, String whereParam, String limitParam, String offsetParam, String orderbyParam) {
        try {
            String query = 'SELECT ' + selectParam + ' FROM ' + fromParam;
            if(whereParam != null && whereParam != '') {
                query = query + ' WHERE ' + whereParam;
            }
            if(orderbyParam != null && orderbyParam != '') {
                query = query + ' ORDER BY ' + orderbyParam;
            }
            if(limitParam != null && limitParam != '') {
                query = query + ' LIMIT ' + limitParam;
            }
            if(offsetParam != null && offsetParam != '') {
                query = query + ' OFFSET ' + offsetParam;
            }
    
            List<sObject> sobjList = Database.query(query);
            return sobjList;
        } catch(Exception e) {
            return null;
        }
    }

    @AuraEnabled
    public static ShinHelper.ShinGenericResponse insertRecords(List<Map<String, String>> recordsMap) {
        ShinHelper.ShinGenericResponse res;
        try {
            List<String> objectNames = new List<String>();
            String recordsJson;
            String objectName;
            for(Map<String, String> rMap: recordsMap) {
                recordsJson = rMap.get('recordsJson');
                objectName = rMap.get('objectName');
                switch on objectName {
                    when 'Game_Point__c' {
                        List<Game_Point__c> gps = (List<Game_Point__c>) JSON.deserialize(recordsJson, List<Game_Point__c>.class);
                        upsert gps;
                    }
                    // TO DO: add new when condition if use
                }
            }
            res = new ShinHelper.ShinGenericResponse(true, 'points inserted', null);
        } catch(Exception e) {
            res = new ShinHelper.ShinGenericResponse(false, 'error: ' + e.getMessage(), null);
        }
        return res;
    }
}