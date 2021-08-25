import Adapt from 'core/js/adapt';
import NavigationView from './languagePickerNavigationView';

export default class LanguagePickerView extends Backbone.View {

  get template() {
    return 'languagePickerView';
  }

  events() {
    return {
      'click .js-languagepicker-btn-click': 'onLanguageClick'
    };
  }

  className() {
    return 'languagepicker';
  }

  initialize() {
    this.initializeNavigation();
    $('html').addClass('in-languagepicker');
    this.listenTo(Adapt, 'remove', this.remove);
    this.render();
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates[this.template];
    this.$el.html(template(data));
    this.$el.addClass(data._classes);

    document.title = this.model.get('title') || '';

    _.defer(this.postRender.bind(this));
  }

  postRender() {
    $('.js-loading').hide();
  }

  onLanguageClick(event) {
    let lang = '';
    this.destroyNavigation();
    // if (event.currentTarget.classList.contains('languagepicker__roles-btn'))
    // {
    //   const roleid = event.currentTarget.dataset.language;
    //   const languageid = document.getElementById('languagepicker-languages-select').value;
    //   lang = `${roleid}_${languageid}`;
    // }
    // else
    // {
      lang = event.currentTarget.dataset.language;
    // }
    this.model.setLanguage(lang);
  }

  initializeNavigation() {
    this.navigationView = new NavigationView({ model: this.model });
  }

  destroyNavigation() {
    this.navigationView.remove();
  }

  remove() {
    $('html').removeClass('in-languagepicker');

    super.remove();
  }

}
