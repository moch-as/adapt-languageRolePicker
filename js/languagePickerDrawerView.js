define([
    'core/js/adapt'
], function(Adapt) {
    
    var LanguagePickerDrawerView = Backbone.View.extend({
        
        events: {
            'click .js-languagepicker-item-btn': 'onButtonClick'
        },
        
        initialize: function () {
            this.listenTo(Adapt, {
                remove: this.remove,
              });
              this.render();
        },
        
        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
        },
        
        onButtonClick: function (event) {
            let newlanguageid = '';
            if (event.currentTarget.classList.contains('languagepicker-drawer__roles-btn'))
            {
                const roleid = event.currentTarget.dataset.language;
                const languageid = document.getElementById('languagepicker-drawer-languages-select').value;
                newlanguageid = roleid + '_' + languageid;
            }
            else
            {
                newlanguageid = event.currentTarget.dataset.language;
            }
            if (newlanguageid === this.model.getSelectedLanguageId())
            {
                return;
            }
            this.model.set('newLanguage', newlanguageid);
            var data = this.model.getLanguageDetails(newlanguageid);
            
            var promptObject = {
                _attributes: { lang: newlanguageid },
                _classes: `is-lang-${newlanguageid} ${data._direction === 'rtl' ? 'is-rtl' : 'is-ltr'}`,
                title: data.warningTitle,
                body: data.warningMessage,
                _prompts: [
                    {
                        promptText: data._buttons.yes,
                        _callbackEvent: 'languagepicker:changelanguage:yes'
                    },
                    {
                        promptText: data._buttons.no,
                        _callbackEvent: 'languagepicker:changelanguage:no'
                    }
                ],
                _showIcon: true
            };

            // keep active element incase the user cancels - usually navigation bar icon
            // move drawer close focus to #focuser
            this.$finishFocus = Adapt.a11y._popup._focusStack.pop();
            Adapt.a11y._popup._focusStack.push($('#a11y-focuser'));

            Adapt.once('drawer:closed', () => {
                // wait for drawer to fully close
                _.delay(() => {
                    this.listenToOnce(Adapt, {
                        'popup:opened': this.onPopupOpened,
                        'languagepicker:changelanguage:yes': this.onDoChangeLanguage,
                        'languagepicker:changelanguage:no notify:cancelled': this.onDontChangeLanguage
                    });

                    // show yes/no popup
                    Adapt.notify.prompt(promptObject);
                }, 250);
            });

            Adapt.trigger('drawer:closeDrawer');
        },
        
        onPopupOpened: function () {
            // move popup close focus to #focuser
            Adapt.a11y.setPopupCloseTo($('#a11y-focuser'));
        },

        onDoChangeLanguage: function () {
            var newLanguage = this.model.get('newLanguage');
            this.model.setTrackedData();
            this.model.setLanguage(newLanguage);
            this.remove();
        },
        
        /**
         * If the learner selects 'no' in the 'confirm language change' prompt,
         * wait for notify to close completely then send focus to the
         * navigation bar icon
         */
        onDontChangeLanguage: function () {
            this.remove();

            _.delay(() => Adapt.a11y.focusFirst(this.$finishFocus), 500);
        }
        
    }, {
        template: 'languagePickerDrawerView'
    });

    return LanguagePickerDrawerView;

});
