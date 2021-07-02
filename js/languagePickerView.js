define([
    'core/js/adapt',
    './languagePickerNavigationView'
], function(Adapt, NavigationView) {
    
    var LanguagePickerView = Backbone.View.extend({
        
        events: {
            'click .js-languagepicker-btn-click': 'onLanguageClick'
        },
        
        className: 'languagepicker',
        
        initialize: function () {
            this.initializeNavigation();
            $('html').addClass('in-languagepicker');
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },
        
        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
            this.$el.addClass(data._classes);

            document.title = this.model.get('title') || '';
            
            _.defer(this.postRender.bind(this));
        },
        
        postRender: function () {
            $('.js-loading').hide();
        },
        
        onLanguageClick: function (event) {
            let lang = '';
            this.destroyNavigation();
            if (event.currentTarget.classList.contains('languagepicker__roles-btn'))
            {
                const roleid = event.currentTarget.dataset.language;
                const languageid = document.getElementById('languagepicker-languages-select').value;
                lang = roleid + '_' + languageid;
            }
            else
            {
                lang = event.currentTarget.dataset.language;
            }
            this.model.setLanguage(lang);
        },

        initializeNavigation: function() {
            this.navigationView = new NavigationView({ model: this.model });
        },
      
        destroyNavigation: function() {
            this.navigationView.remove();
        },
      
        remove: function() {
            $('html').removeClass('in-languagepicker');
      
            Backbone.View.prototype.remove.apply(this, arguments);
        }
      
    }, {
        template: 'languagePickerView'
    });

    return LanguagePickerView;

});
