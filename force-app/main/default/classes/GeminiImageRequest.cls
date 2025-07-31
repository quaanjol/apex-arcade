public class GeminiImageRequest {
    public class InlineData {
        public String mime_type;
        public String data;
    }

    public class ImagePart {
        public InlineData inline_data;
    }

    public class TextPart {
        public String text;
    }

    public class Content {
        public List<Object> parts;
    }

    public List<Content> contents;

    public GeminiImageRequest(String mimeType, String base64Data, String promptText) {
        contents = new List<Content>();

        // Image Part
        InlineData inline = new InlineData();
        inline.mime_type = mimeType;
        inline.data = base64Data;

        ImagePart imagePart = new ImagePart();
        imagePart.inline_data = inline;

        // Text Part
        TextPart textPart = new TextPart();
        textPart.text = promptText;

        // Combine both into one Content block
        Content content = new Content();
        content.parts = new List<Object>{ imagePart, textPart };

        contents.add(content);
    }
}
