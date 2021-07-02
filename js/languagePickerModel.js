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
            var languageid = this.getLanguagePart(language);
            var _languages = this.get('_languages');
            return _languages.find(item => item._language === languageid);
        },

        setLanguage: function (language) {
            Adapt.config.set({
                _activeLanguage: language,
                _defaultDirection: this.getLanguageDetails(language)._direction
            });
        },
        
        markLanguageAsSelected: function(language) {
            const languages = this.get('_languages');
            languages.forEach(item => {item._isSelected = (item._language === this.getLanguagePart(language))});
            this.set('_languages', languages);
        },
        
        markRoleAsSelected: function(language) {
            const roles = this.get('_roles');
            if (roles)
            {
                const selectedRole = this.getRolePart(language);
                roles.forEach(item => {item._isSelected = (item._role === selectedRole)});
                this.set('_roles', roles);
                if (Adapt.essensAPI)
                {
                    Adapt.essensAPI.setRole(selectedRole);
                }
            }
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
            const roles = this.get('_roles');
            const selectedrole = roles ? roles.find(role => role._isSelected) : undefined;
            const roleprefix = selectedrole ? selectedrole +  '_' : '';
            const languages = this.get('_languages');
            const selectedlanguage = languages.find(language => language._isSelected);

            return selectedlanguage ? roleprefix + selectedlanguage._language : '';
        },

        rolelanguageExists: function (rolelanguage) {
            const rolename = this.getRolePart(rolelanguage);
            const languagename = this.getLanguagePart(rolelanguage);
            const roles = this.get('_roles');
            const foundrole = roles ? roles.find(item => item._role == rolename) : undefined;
            const languages = this.get('_languages');
            const foundlanguage = languages ? languages.find(item => item._language == languagename) : undefined;
            return (!rolename || foundrole) && foundlanguage;
        },

        languageExists: function (language) {
            const languagename = this.getLanguagePart(language);
            const languages = this.get('_languages');
            const foundlanguage = languages ? languages.find(item => item._language == languagename) : undefined;
            return foundlanguage;
        },

        onConfigChange: function (model, value, options) {
            this.markRoleAsSelected(value);
            this.markLanguageAsSelected(value);
        },

        getLanguagePart: function(language) {
            return language.includes('_') ? language.split('_').pop() : language;
        },

        getRolePart: function(language) {
            return language.includes('_') ? language.split('_').shift(): '';
        }
    });

    return LanguagePickerModel;
});
