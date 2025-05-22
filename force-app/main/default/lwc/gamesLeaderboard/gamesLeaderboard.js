import { LightningElement, api } from 'lwc';
import getRecords from "@salesforce/apex/GetRecordsCustom.getRecords";

export default class GamesLeaderboard extends LightningElement {
  @api games = [];
  @api game = null;
  @api points = null;
  @api limit = 10;
  @api page = 1;
  @api showLoadMore = false;
  loadingText = 'Load more';
  loadingPoints = false;

  handleLoadMorePoints(e) {
    e.preventDefault();
    this.page++;
    this.loadingPoints = false;
    this.populateLeaderboard(this.game);
  }

  get showPoints() {
    return this.points != null && this.points.length > 0;
  }

  get chosenGame() {
    return this.games.length ? this.games[0].Id : '';
  }

  get gameOptions() {
    let res = this.games.map(item => {
      return {
        label: item.Name,
        value: item.Id,
      }
    });
    return res;
  }

  handleChangeGame(e) {
    let fGame = this.games.find(item => item.Id == e.target.value);
    this.points = [];
    if (fGame) {
      this.populateLeaderboard(fGame);
    }
  }

  paddNumber(input) {
    return input < 10 ? '0' + input : `${input}`;
  }

  formatDate(dateString) {
    let tDate = new Date(dateString);
    return `${this.paddNumber(tDate.getDate())}/${this.paddNumber(tDate.getMonth() + 1)}/${tDate.getFullYear()}`;
  }

  populateLeaderboard(game) {
    this.game = game;
    this.loadingPoints = true;
    this.loadingText = 'Loading...';
    getRecords(
      {
        selectParam: "Id, Avatar__c, Points__c, Level__c, Player_Name__c, CreatedDate",
        fromParam: "Game_Point__c",
        whereParam: `Game__c = '${this.game.Id}'`,
        limitParam: this.limit,
        offsetParam: (this.page - 1) * this.limit,
        orderbyParam: 'Level__c asc, Points__c desc',
      }
    ).then(result => {
      if (result) {
        if (result.length && result.length == this.limit) {
          this.showLoadMore = true;
        } else {
          this.showLoadMore = false;
        }
        let pointsTmp = [...result].map((item, index) => {
          item.rank = index + 1;
          item.date = this.formatDate(item.CreatedDate);
          return item;
        });
        this.points = this.points.concat([...pointsTmp]);
      } else {
        if(this.points == null) {
          this.points = [];
        }
      }
    }).catch(error => {
      if(this.points == null) {
        this.points = [];
      }
      console.error('error leaderboard points', error);
    }).finally(() => {
      this.loadingPoints = false;
      this.loadingText = 'Load more';
    });
  }

  renderedCallback() {
    if (this.points == null) {
      if (!this.games || !this.games.length) {
        console.log('No games found for leaderboard...');
        this.points = [];
      } else {
        this.populateLeaderboard(this.games[0]);
      }
    }
  }
}