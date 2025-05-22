public class ShinHelper {
    public class ShinGenericResponse {
        @AuraEnabled
        public boolean status;
        @AuraEnabled
        public String message;
        @AuraEnabled
        public Object data;
        
        public ShinGenericResponse() {}
        
        public ShinGenericResponse(boolean status, String message, Object data) {
            this.status = status;
            this.message = message;
            this.data = data;
        }
    }

    public static void notifyEmail(String subject, String message) {
        try {
            List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String>{'sf.apex.arcade@gmail.com'});
            email.setSubject(subject);
            email.setPlainTextBody(message);
            emails.add(email);
            Messaging.sendEmail(emails);
        } catch(Exception e) {
            System.debug('Error sending email: ' + e.getMessage());
        }
    }

    public static void notifyError(Exception e) {
        String errorMessage = 'Error: ' + e.getMessage() + '\n' + 'Stack Trace: ' + e.getStackTraceString();
        notifyEmail('Error in Apex Arcade', errorMessage);
    }
}
