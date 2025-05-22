import { LightningElement, api } from 'lwc';

const IN_DEVELOPMENT = 'In development';
const ACTIVE = 'Active';
const INACTIVE = 'Inactive';

export default class GamePreview extends LightningElement {
  @api game;
  @api enterGame = false;

  get isInDEvelopment() {
    return this.game?.Status__c == IN_DEVELOPMENT;
  }

  get isActive() {
    return this.game?.Status__c == ACTIVE;
  }

  get isInactive() {
    return this.game?.Status__c == INACTIVE;
  }

  get canStartGame() {
    return this.game?.Status__c == ACTIVE;
  }

  get cannotStartGame() {
    return this.game?.Status__c != ACTIVE;
  }

  handleCloseGame(e) {
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('closegame'));
  }

  handleStartGame(e) {
    e.preventDefault();
    window.location.href = '/?page=games&game=' + e.target.dataset.slug;
  }
}