public class GoogleTokenController {
    public static String code {get; set;}
    public static String redirect {get; set;}
    public static String channelId {get; set;}
    public static String message {get; set;}
    public static String clientId;
    public static String clientSecret;
    public static String redirectUri;
    public static String grantType = 'authorization_code';
    public static String tokenUrl;
    public static String authUrl;
    public static String scopes;
    public static String finalAuthUrl {get; set;}

    public static List<Google_Setting__mdt> googleSettings;
    
    public GoogleTokenController() {
        code = apexpages.currentpage().getparameters().get('code');
        redirect = apexpages.currentpage().getparameters().get('redirect');
        channelId = apexpages.currentpage().getparameters().get('channelId');
        message = 'Getting token from Google...';
        clientId = Google_Setting__mdt.getInstance('Client_ID').Value__c;
        clientSecret = Google_Setting__mdt.getInstance('Client_Secret').Value__c;
        redirectUri = Google_Setting__mdt.getInstance('Redirect_URI').Value__c;
        tokenUrl = Google_Setting__mdt.getInstance('Token_URL').Value__c;
        authUrl = Google_Setting__mdt.getInstance('Auth_Url').Value__c;
        scopes = Google_Setting__mdt.getInstance('Google_Scopes').Value__c;
        finalAuthUrl = getAuthUrl();
    }
    
    public static String getAuthUrl() {
        String key = EncodingUtil.urlEncode(clientId,'UTF-8');
        String uri = EncodingUtil.urlEncode(redirectUri,'UTF-8');
        String authuri = '';
        authuri = authUrl + '?' +
            'client_id=' + key +
            '&response_type=code' +
            '&scope=' + scopes +
            '&redirect_uri=' + redirectUri +
            '&access_type=offline' + '&prompt=consent';
        return authuri;
    }
    
    public static String getFinalTokenUrl() {
        String res = tokenUrl + '?' +
            'client_id=' + clientId +
            '&client_secret=' + clientSecret +
            '&redirect_uri=' + redirectUri +
            '&grant_type=' + grantType;
        return res;
    }
    
    public static void saveGoogleToken(String refreshToken, String accessToken, String response) {
        List<Youtube_Channel__c> channels = [select Token__c, Refresh_Token__c, Token_Refreshed_At__c 
                                             from Youtube_Channel__c 
                                             where Id = :channelId];
        
        Youtube_Channel__c channel;
        if(channels.size() > 0) {
            channel = channels[0];
            channel.Token__c = accessToken;
            channel.Refresh_Token__c = refreshToken;
            channel.Token_Refreshed_At__c = Datetime.now();
        }
        
        try {
            if(channel != null) {
                update channel;
                message = 'New Google Token has been inistialised. Please go back and try again.' + '\n' + response;   
            } else {
             	message = 'Channel not found in Salesforce';
            }	        
        } catch(Exception err) {
            message = 'Error happened while saving Google Token: ' + err.getMessage() + ', trace: ' + err.getStackTraceString();
        }
    }
    
    @future (callout=true)
    public static void sendGoogleData() {
        if(code == null || channelId == null) {
            return;
        }
        try {
            HttpRequest request = new HttpRequest();
            HttpResponse response = new HttpResponse();
            Http http = new Http();
            
            request.setEndpoint(getFinalTokenUrl());
            request.setMethod('POST');            
            request.setHeader('Content-Type','application/x-www-form-urlencoded');
            
            String payload = 'code=' + EncodingUtil.urlEncode(code,'UTF-8') 
                + '&client_id=' + EncodingUtil.urlEncode(clientId,'UTF-8') + '&client_secret=' + EncodingUtil.urlEncode(clientSecret,'UTF-8')  
                + '&redirect_uri=' + EncodingUtil.urlEncode(redirectUri,'UTF-8') + '&grant_type=' + EncodingUtil.urlEncode(grantType,'UTF-8');
            
            request.setBody(payload);
            response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                GoogleTokenResponse tokenReponse = (GoogleTokenResponse) System.JSON.deserialize(response.getBody(), GoogleTokenResponse.class);
                saveGoogleToken(tokenReponse.refresh_token, tokenReponse.access_token, response.getBody());
            } else {
            	System.debug('Google Token Callout Error: status code is not 200');
	            message = response.getBody();
            }
        } catch(Exception e) {
            String msg = 'Callout Error-' + e.getMessage() + ', trace: ' + e.getStackTraceString();
            message = msg;
        }
    }
}