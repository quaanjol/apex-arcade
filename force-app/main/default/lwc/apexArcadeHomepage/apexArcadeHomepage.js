import { LightningElement, api } from 'lwc';
import site_logo from "@salesforce/resourceUrl/apex_arcade_logo";
import sf_brand_bg from "@salesforce/resourceUrl/sf_brand_bg";

export default class ApexArcadeHomepage extends LightningElement {
  @api showSpinner = false;
  @api appName = 'Apex Arcade';
  @api menus = [
    {
      id: 0,
      label: 'Home',
      url: '/',
      classes: '',
      active: false,
    },
    {
      id: 1,
      label: 'Games',
      url: '/?page=games',
      classes: '',
      active: false,
    },
  ];
  firstLoad = false;
  page;
  gameSlug;

  handleShowSpinner() {
    this.showSpinner = true;
  }

  handleHideSpinner() {
    this.showSpinner = false;
  }

  handleToggleSpinner(e) {
    this.showSpinner = e.detail.show;
  }

  get siteLogo() {
    return site_logo;
  }

  get isHomePage() {
    return !this.page || this.page == '/';
  }

  get isGamePage() {
    return this.page == '/?page=games' && this.gameSlug == null;
  }

  get isGamePlay() {
    return this.page == '/?page=games' && this.gameSlug != null;
  }

  setContainerBg() {
    let container = this.template.querySelector('.container');
    if (container) {
      container.style.backgroundImage = `url(${sf_brand_bg})`;
    }
  }

  renderedCallback() {
    if (!this.firstLoad) {
      this.setContainerBg();
      this.firstLoad = true;
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      this.page = params.get('page') || '/';
      if(this.page != '/') {
        this.page = '/?page=' + this.page;
      }
      this.gameSlug = params.get('game') || null;
      let menus = [...this.menus];
      menus = menus.map(item => {
        if (item.url == this.page) {
          item.classes = 'slds-context-bar__item slds-is-active';
          item.active = true;
        } else {
          item.classes = 'slds-context-bar__item';
          item.active = false;
        }
        return item;
      });
      this.menus = [...menus];
    }
  }
}