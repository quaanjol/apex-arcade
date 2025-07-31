import { LightningElement } from 'lwc';
import extractTextFromImage from '@salesforce/apex/GeminiImageOCR.extractTextFromImage';

export default class GeminiOcrCmp extends LightningElement {
  imagePreviewUrl;
  resultJson;
  errorMessage;
  isProcessing = false;
  imageBase64;

  imageFile;

  get disableButton() {
    return this.isProcessing || !this.imageFile;
  }

  handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageFile = file;
      this.resultJson = null;
      this.errorMessage = null;
      this.readFileAsBase64(file);
    } else {
      this.errorMessage = 'Please upload a valid image file.';
    }
  }

  async handleExtractText() {
    if (!this.imageFile) {
      this.errorMessage = 'No image selected.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;
    this.resultJson = null;

    try {
      const fileContent = this.imageBase64;
      if (!fileContent) {
        this.errorMessage = 'No image selected.';
        return;
      }
      const mimeType = this.imageFile.type;

      const result = await extractTextFromImage({ base64Image: fileContent, mimeType });

      if (result.success) {
        const text = result.data.text;
        const parsedJson = this.extractJsonFromMarkdown(text);

        if (parsedJson) {
          this.resultJson = JSON.stringify(parsedJson, null, 2);
        } else {
          this.resultJson = result;
        }
      } else {
        this.errorMessage = result.message || 'Unknown error from Gemini OCR.';
      }
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Client-side error: ' + err.message;
    } finally {
      this.isProcessing = false;
    }
  }

  readFileAsBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imagePreviewUrl = reader.result;
      this.imageBase64 = reader.result.split(',')[1];
      console.log('imageBase64 read successfully', this.imageBase64);
    };
    reader.onerror = (error) => {
      this.imageBase64 = '';
      console.error('Error reading file:', error);
    };
  }

  extractJsonFromMarkdown(text) {
    try {
      // Match code block content between triple backticks
      const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
      if (!match || match.length < 2) {
        console.warn('No JSON code block found in response text.');
        return null;
      }

      const rawJson = match[1].trim();
      return JSON.parse(rawJson);
    } catch (err) {
      console.error('Failed to parse JSON from Gemini response:', err);
      return null;
    }
  }

  handleCopyJson() {
    try {
      const el = document.createElement('textarea');
      el.value = this.resultJson;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      // Optionally show a toast or visual feedback here
      console.log('JSON copied to clipboard.');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }
}
