public class UserAvatarGenerateController {
    @AuraEnabled
    public static ImageRouterHelper.GenericResponse generateImage(String prompt) {
        return ImageRouterHelper.generateImage(prompt);
    }

    @AuraEnabled
    public static ImageRouterHelper.GenericResponse setAvatarImage(String base64Data, Boolean isUrl) {
        try {
            Blob fileContent;
            
            if (isUrl) {
                // Make HTTP request to fetch the image
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint(base64Data); // URL is passed in base64Data
                request.setMethod('GET');
                request.setTimeout(60000); // 60 seconds timeout
                
                HttpResponse response = http.send(request);
                
                if (response.getStatusCode() != 200) {
                    return new ImageRouterHelper.GenericResponse(false, 'Failed to fetch image: HTTP ' + response.getStatusCode(), null);
                }
                
                fileContent = response.getBodyAsBlob();
                // Convert the fetched image to base64 for consistency
                base64Data = EncodingUtil.base64Encode(fileContent);
            } else {
                // Original case: decode base64 string to Blob
                fileContent = EncodingUtil.base64Decode(base64Data);
            }

            String userName = UserInfo.getName();
            
            // Create a ContentVersion for the photo
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = 'User Avatar - ' + userName;
            contentVersion.PathOnClient = 'avatar-' + userName + '.jpg';
            contentVersion.VersionData = fileContent;
            contentVersion.IsMajorVersion = true;
            insert contentVersion;

            // Get the ContentDocumentId after insert
            contentVersion = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1];

            // Set the user’s profile photo
            ConnectApi.BinaryInput binaryInput = new ConnectApi.BinaryInput(fileContent, 'image/jpeg', 'avatar-' + userName + '.jpg');
            ConnectApi.UserProfiles.setPhoto(null, UserInfo.getUserId(), contentVersion.ContentDocumentId, null);
            return new ImageRouterHelper.GenericResponse(true, 'Avatar image set successfully', null);
        } catch (Exception e) {
            return new ImageRouterHelper.GenericResponse(false, 'Error setting avatar: ' + e.getMessage() + ', trace: ' + e.getStackTraceString(), null);
        }
    }
}