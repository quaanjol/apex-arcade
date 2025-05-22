public without sharing class GameController {
	@AuraEnabled
    public static ShinHelper.ShinGenericResponse getGameBySlug(String slug) {
        List<Game__c> games = [select Id, Name, Status__c, Slug__c from Game__c where Slug__c = :slug limit 1];
        Object res = games.size() > 0 ? games[0] : null;
        return new ShinHelper.ShinGenericResponse(true, 'success', res);
    }
    
    @AuraEnabled
    public static ShinHelper.ShinGenericResponse saveGamePoint(String gameId, String playerName, String points) {
        try {
            Game_Point__c gp = new Game_Point__c();
            gp.Game__c = gameId;
            gp.Player_Name__c = playerName;
            gp.Points__c = Decimal.valueOf(points);
            insert gp;
            ShinHelper.ShinGenericResponse res = new ShinHelper.ShinGenericResponse(true, 'success', (Object) gp);
            return res;
        } catch(Exception e) {
            ShinHelper.notifyError(e);
            ShinHelper.ShinGenericResponse res = new ShinHelper.ShinGenericResponse(false, 'failed', e);
            return res;
        }
    }
}
