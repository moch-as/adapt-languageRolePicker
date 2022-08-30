import Adapt from 'core/js/adapt';
import NavigationView from './languagePickerNavigationView';

export default class LanguagePickerView extends Backbone.View {

  get template() {
    return 'languagePickerView';
  }

  events() {
    return {
      'click .js-languagepicker-btn-click': 'onLanguageClick',
      'change select': 'onOptionSelect'
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
    (languageDropDown) && (languageDropDown.length < 2) && languageDropDown.parentElement.classList.add('no-selectable-options');
    const rolesDropDown = document.getElementById('languagepicker-roles-select');

    this.clearUnselectedItems(languageDropDown, rolesDropDown);
  }

  clearUnselectedItems(languageDropDown, rolesDropDown) {
    const languageIDs = this.model.get('_languageids');
    languageIDs.some(language => language._isSelected) || (languageDropDown.selectedIndex = -1);
    const roles = this.model.get('_roles');
    roles.some(role => role._isSelected) || (rolesDropDown.selectedIndex = -1);
    this.updateSubmitButtonState();
  }

  updateSubmitButtonState() {
    const submitButton = document.getElementById(this.model.hasRoles() ? 'roles-submit' : 'language-submit');
    submitButton.classList.toggle('is-disabled', !this.canSubmit());
  }

  canSubmit() {
    return this.isLanguageSelected() && (!this.model.hasRoles() || this.isRoleSelected());
  }

  isLanguageSelected() {
    const languageDropDown = document.getElementById('languagepicker-languages-select');
    return (languageDropDown.selectedIndex > -1);
  }

  isRoleSelected() {
    const rolesDropDown = document.getElementById('languagepicker-roles-select');
    return (rolesDropDown.selectedIndex > -1);
  }

  showLanguageSelectionState(clear = false) {
    const languageDropDown = document.getElementById('languagepicker-languages-select');
    const rolesDropDown = document.getElementById('languagepicker-roles-select');
    languageDropDown.classList.toggle('option-unselected', !clear && !this.isLanguageSelected());
    rolesDropDown.classList.toggle('option-unselected', !clear && !this.isRoleSelected());
  }

  showRoleSelectionState() {
    const rolesDropDown = document.getElementById('languagepicker-roles-select');
  }

  onOptionSelect() {
    this.showLanguageSelectionState(true);
    this.updateSubmitButtonState();
  }

  onLanguageClick(event) {
    if (this.canSubmit()) {
      this.destroyNavigation();
      const hasRoles = (event.currentTarget.id === 'roles-submit');
      const rolePart = hasRoles ? document.getElementById('languagepicker-roles-select').value : '';
      const languagePart = document.getElementById('languagepicker-languages-select').value;
      const newLanguage = (rolePart.length > 0) ? `${rolePart}_${languagePart}` : languagePart;
      if (newLanguage) this.model.setLanguage(newLanguage);
    }
    else {
      this.showLanguageSelectionState();
      this.showRoleSelectionState();
    }
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
