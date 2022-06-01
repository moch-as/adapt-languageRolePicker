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

    const languageDropDown = document.getElementById('languagepicker-languages-select');
    (languageDropDown) && (languageDropDown.length < 2) && languageDropDown.classList.add('no-selectable-options');
  }

  onLanguageClick(event) {
    this.destroyNavigation();
    const hasRoles = event.currentTarget.classList.contains('languagepicker__roles-btn');
    const rolePart = hasRoles ? event.currentTarget.dataset.language : '';
    const languagePart = hasRoles ? document.getElementById('languagepicker-languages-select').value : event.currentTarget.dataset.language;
    const newLanguage = (rolePart.length > 0) ? `${rolePart}_${languagePart}` : languagePart;
    this.model.setLanguage(newLanguage);
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
