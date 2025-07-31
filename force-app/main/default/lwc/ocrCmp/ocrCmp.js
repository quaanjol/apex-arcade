/* global Tesseract */
import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';

const TESSERACT_PATH = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.0/dist/tesseract.min.js';

export default class OcrCmp extends LightningElement {
  isProcessing = false;
  statusMessage = 'Select an image and click the button.';
  extractedText = '';

  imageFile;
  imageFilePreview;
  isTesseractInitialized = false;

  renderedCallback() {
    if (this.isTesseractInitialized) {
      return;
    }
    this.isTesseractInitialized = true;

    loadScript(this, TESSERACT_PATH)
      .then(() => {
        this.statusMessage = 'Tesseract.js loaded. Ready to process images.';
      })
      .catch(error => {
        this.statusMessage = 'Error loading Tesseract.js.';
        console.error('Error loading Tesseract.js', error);
      });
  }

  handleFileChange(event) {
    if (event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
      this.imageFilePreview = URL.createObjectURL(this.imageFile);
      this.statusMessage = `File selected: ${this.imageFile.name}`;
      this.extractedText = '';
    }
  }

  handleProcessClick() {
    if (!this.imageFile) {
      this.statusMessage = 'Error: Please select an image file first.';
      return;
    }

    this.isProcessing = true;
    this.extractedText = '';
    this.statusMessage = 'Processing image...';

    Tesseract.recognize(
      this.imageFile,
      'eng',
      {
        logger: m => {
          console.log(m);
          if (m.status === 'recognizing text') {
            this.statusMessage = `Recognizing Text: ${(m.progress * 100).toFixed(2)}%`;
          } else {
            this.statusMessage = `Status: ${m.status}`;
          }
        }
      }
    ).then(({ data: { text } }) => {
      this.extractedText = text;
      this.statusMessage = 'Extraction complete!';
    }).catch(err => {
      console.error('OCR Error:', err);
      this.statusMessage = 'An error occurred during OCR processing.';
    }).finally(() => {
      this.isProcessing = false;
    });
  }
}
