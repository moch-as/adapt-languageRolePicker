define([
        'core/js/adapt'
], function (Adapt) {
    
    var LanguagePickerModel = Backbone.Model.extend({
        
        defaults: {
            _isEnabled: false,
            displayTitle: '',
            body: '',
            _languages: []
        },
        
        trackedData: {
            components: [],
            blocks: []
        },
      
        locationId: null,
      
        initialize: function () {
            this.listenTo(Adapt.config, 'change:_activeLanguage', this.onConfigChange);
            this.listenTo(Adapt, 'app:dataLoaded', this.onDataLoaded);
        },

        getLanguageDetails: function (language) {
            var languageid = language.split('_').pop();
            var _languages = this.get('_languages');
            return _.find(_languages, item => item._language === languageid);
        },

        setLanguage: function (language) {
            Adapt.config.set({
                _activeLanguage: language,
                _defaultDirection: this.getLanguageDetails(language)._direction
            });
        },
        
        markLanguageAsSelected: function(language) {
            const languages = this.get('_languages');
            languages.forEach(item => {
                item._isSelected = (item._language === language.split('_').pop());
            });
            this.set('_languages', languages);
        },
        
        markRoleAsSelected: function(language) {
            const roles = this.get('_roles');
            roles.forEach(item => {
                item._isSelected = (item._role === language.split('_').shift());
            });
            this.set('_roles', roles);
        },
        
        onDataLoaded: function() {
            if (!this.get('_restoreStateOnLanguageChange')) {
              return;
            }
            _.defer(() => {
              this.locationId = Adapt.offlineStorage.get('location') || null;
              this.restoreState();
            });
      
        },
    
        restoreLocation: function() {
            if (!Adapt.findById(this.locationId)) return;
        
            _.defer(() => Adapt.navigateToElement('.' + this.locationId));
        },
    
        /**
         * Restore course progress on language change.
         */
        restoreState: function() {
    
            if (this.isTrackedDataEmpty()) return;
        
            if (this.trackedData.components) {
                this.trackedData.components.forEach(this.setTrackableState);
            }
        
            if (this.trackedData.blocks) {
                this.trackedData.blocks.forEach(this.setTrackableState);
            }
        },
    
        isTrackedDataEmpty: function() {
            return _.isEqual(this.trackedData, {
                components: [],
                blocks: []
            });
        },
    
        getTrackableState: function() {
            var components = this.getState(Adapt.components.models);
            var blocks = this.getState(Adapt.blocks.models);
            return {
                components: _.compact(components),
                blocks: _.compact(blocks)
            };
        },
    
        getState: function(models) {
            return models.map(model => {
                if (model.get('_isComplete')) {
                return model.getTrackableState();
                }
            });
        },
    
        setTrackedData: function() {
            if (!this.get('_restoreStateOnLanguageChange')) {
                return;
            }
            this.listenToOnce(Adapt, 'contentObjectView:ready', this.restoreLocation);
            this.trackedData = this.getTrackableState();
        },
    
        setTrackableState: function(stateObject) {
            var restoreModel = Adapt.findById(stateObject._id);
            if (!restoreModel) {
                Adapt.log.warn('LanguagePicker unable to restore state for: ' + stateObject._id);
                return;
            }
        
            restoreModel.setTrackableState(stateObject);
        },
      
        getSelectedLanguageId: function() {
            var roles = this.get('_roles');
            var languages = this.get('_languages');
            var selectedrole = _.find(roles, function (role) {
                return role._isSelected;
            });
            var selectedlanguage = _.find(languages, function (language) {
                return language._isSelected;
            });
            return (selectedrole && selectedlanguage) ? selectedrole._role + '_' + selectedlanguage._language : '';
        },

        rolelanguageExists: function (rolelanguage) {
            var roles = this.get('_roles');
            var languages = this.get('_languages');
            var role = rolelanguage.split('_').shift();
            var language = rolelanguage.split('_').pop();
            var foundrole = _.find(roles, function (item) {
                return (item._role == role);
            });
            var foundlanguage = _.find(languages, function (item) {
                return (item._language == language);
            });
            return foundrole && foundlanguage;
        },
        onConfigChange: function (model, value, options) {
            this.markRoleAsSelected(value);
            this.markLanguageAsSelected(value);
        }
    });
    
    return LanguagePickerModel;
});
