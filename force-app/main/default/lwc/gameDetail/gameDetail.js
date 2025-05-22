import { LightningElement, api } from 'lwc';
import getGameBySlugAction from '@salesforce/apex/GameController.getGameBySlug';

const SNAKE_GAME = 'snake-game';
const ACTIVE = 'Active';

export default class gameDetail extends LightningElement {
  game;
  slug;
  firstLoad = false;

  get isGameReady() {
    return this.game && this.game.Status__c == ACTIVE;
  }

  get isSnakeGame() {
    return this.game && this.game.Slug__c == SNAKE_GAME;
  }

  getGame() {
    this.handleShowSpinner();
    let getGameBySlugParams = {
      slug: this.slug,
    }
    
    getGameBySlugAction(getGameBySlugParams).then(result => {
      if (result.status) {
        this.game = { ...result.data };
      } else {
        alert(`Cannot find game ${this.slug}`);
      }
    }).catch(err => {
      console.log('getGameBySlugAction err', err);
    }).finally(() => {
      this.handleHideSpinner();
    });
  }

  handleToggleSpinner(e) {
    if (e.detail.show) {
      this.handleShowSpinner();
    } else {
      this.handleHideSpinner();
    }
  }

  handleShowSpinner() {
    this.dispatchEvent(new CustomEvent('togglehomespinner', {
      detail: {
        show: true,
      }
    }));
  }

  handleHideSpinner() {
    this.dispatchEvent(new CustomEvent('togglehomespinner', {
      detail: {
        show: false,
      }
    }));
  }

  connectedCallback() {
    if (!this.firstLoad) {
      this.firstLoad = true;
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      this.slug = params.get('game');
      this.getGame();
    }
  }
}