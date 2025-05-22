import { LightningElement, api } from 'lwc';
import getRecordsCustom from "@salesforce/apex/GetRecordsCustom.getRecords";

export default class GameBoyContainer extends LightningElement {
  limit = 10;
  page = 1;
  @api games = [];
  @api gamesLoaded = false;
  @api showLoadMore = false;
  loadingText = 'Load more';
  loadingGames = false;
  @api chosenGame;

  handleLoadMoreGames(e) {
    e.preventDefault();
    this.page++;
    this.gamesLoaded = false;
    this.getGames();
  }

  handleOpenGame(e) {
    e.preventDefault();
    let gameId = e.target.dataset.id || e.target.closest('div.game-grid').dataset.id;
    let thisGame = this.games.find(item => item.Id == gameId);
    if (thisGame) {
      this.chosenGame = thisGame;
    } else {
      this.chosenGame = null;
    }
  }

  handleCloseGame(e) {
    this.chosenGame = null;
  }

  getGames() {
    if (this.gamesLoaded) {
      return;
    }
    this.gamesLoaded = true;
    this.loadingGames = true;
    this.loadingText = 'Loading...';
    getRecordsCustom(
      {
        selectParam: "Id, Name, Description__c, Image__c, Status__c, Slug__c, lwc__c",
        fromParam: "Game__c",
        limitParam: this.limit,
        offsetParam: this.limit * (this.page - 1),
      }
    ).then(result => {
      if (result.length && result.length == this.limit) {
        this.showLoadMore = true;
      } else {
        this.showLoadMore = false;
      }
      let gamesReturned = JSON.parse(JSON.stringify(result));
      gamesReturned = gamesReturned.map(item => {
        item.Image = '/resource/' + item.Image__c;
        return item;
      });
      this.games = this.games.concat([...gamesReturned]);
      console.log('games', this.games);
    }).catch(error => {
      console.error('error getting games', error);
    }).finally(() => {
      this.loadingGames = false;
      this.loadingText = 'Load more';
    });
  }

  renderedCallback() {
    this.getGames();
  }
}