import Adapt from 'core/js/adapt';

export default class LanguagePickerModel extends Backbone.Model {
  preinitialize() {
    this.trackedData = {
      components: [],
      blocks: []
    }
    
    this.locationId = null;
  }

  defaults() {
    return {
      _isEnabled: false,
      displayTitle: '',
      body: '',
      _languages: []
    };
  }

  initialize() {
    this.listenTo(Adapt.config, 'change:_activeLanguage', this.onActiveLanguageChange);
    this.listenTo(Adapt, 'app:dataLoaded', this.onDataLoaded);
    this.makeLanguageIdList();
  }

  getLanguageDetails(language) {
    return this.get('_languages').find(({ _language }) => _language === language);
  }

  setLanguage(language) {
    Adapt.config.set({
      _activeLanguage: language,
      _defaultDirection: this.getLanguageDetails(language)._direction
    });
  }

  onActiveLanguageChange(model, selectedLanguage) {
    this.markLanguageAsSelected(selectedLanguage);
    this.markLanguageCodeAsSelected(selectedLanguage);
    this.markRoleAsSelected(selectedLanguage);

    if (Adapt.essensAPI?._hasEssens)
    {
      const selectedRole = this.getRolePart(selectedLanguage);
      Adapt.essensAPI.setRole(selectedRole);
    }
}

onDataLoaded() {
    if (!this.get('_restoreStateOnLanguageChange')) {
      return;
    }
    _.defer(() => {
      this.locationId = Adapt.offlineStorage.get('location') || null;
      this.restoreState();
    });
  }

  restoreLocation() {
    if (!Adapt.findById(this.locationId)) return;

    _.defer(() => Adapt.navigateToElement('.' + this.locationId));
  }

  /**
   * Restore course progress on language change.
   */
  restoreState() {
    if (this.isTrackedDataEmpty()) return;

    this.trackedData.components?.forEach(this.setTrackableState);
    this.trackedData.blocks?.forEach(this.setTrackableState);
  }

  isTrackedDataEmpty() {
    return _.isEqual(this.trackedData, {
      components: [],
      blocks: []
    });
  }

  getTrackableState() {
    return {
      components: this.getState(Adapt.components.models).filter(Boolean),
      blocks: this.getState(Adapt.blocks.models).filter(Boolean)
    };
  }

  getState(models) {
    return models.map(model => model.get('_isComplete') && model.getTrackableState());
  }

  setTrackedData() {
    if (!this.get('_restoreStateOnLanguageChange')) {
      return;
    }
    this.listenToOnce(Adapt, 'contentObjectView:ready', this.restoreLocation);
    this.trackedData = this.getTrackableState();
  }

  setTrackableState(stateObject) {
    const restoreModel = Adapt.findById(stateObject._id);
    if (!restoreModel) {
      Adapt.log.warn('LanguagePicker unable to restore state for: ' + stateObject._id);
      return;
    }

    restoreModel.setTrackableState(stateObject);
  }
      
  makeLanguageIdList() {
    const languageIdList = this.get('_languages').map((element) => {
      return {_language: this.getLanguageCodePart(element._language), displayName: element.displayName, _isSelected: false};
    }).filter((element, index, list) => {
      return (list.findIndex(e => (e._language === element._language)) === index);
    });

    this.set('_languageids', languageIdList);
  }

  markLanguageAsSelected(language) {
    this.get('_languages').forEach(item => {
      item._isSelected = (item._language === language);
    });
  }

  markLanguageCodeAsSelected(language) {
    const languageCode = this.getLanguageCodePart(language);
    this.get('_languageids').forEach(item => {
      item._isSelected = (item._language === languageCode);
    });
  }

  markRoleAsSelected(language) {
    const role = this.getRolePart(language);
    this.get('_roles')?.forEach(item => {
      item._isSelected = (item._role === role);
    });
  }

  getSelectedLanguage() {
    const languages = this.get('_languages');
    const selectedlanguage = languages.find(language => language._isSelected);
      return selectedlanguage ? selectedlanguage._language : '';
  }

  languageExists(language) {
      const languages = this.get('_languages');
      const foundlanguage = languages ? languages.some(item => item._language === language) : false;
      return foundlanguage;
  }

  languageCodeExists(languageCode) {
    const languages = this.get('_languages');
    const foundLanguageCode = languages ? languages.some(item => this.getLanguageCodePart(item._language) === languageCode) : false;
    return foundLanguageCode;
  }

  roleExists(role) {
    const languages = this.get('_languages');
    const foundrole = languages ? languages.some(item => this.getRolePart(item._language) === role) : false;
    return foundrole;
  }

  hasRoles() {
    return (this.get('_roles') !== undefined);
  }

  makeLanguage(role, languageCode) {
    return role ? `${role}_${languageCode}` : languageCode;
  }

  getLanguageCodePart(language) {
      return language.includes('_') ? language.split('_').pop() : language;
  }

  getRolePart(language) {
      return language.includes('_') ? language.split('_').shift(): '';
  }
}
