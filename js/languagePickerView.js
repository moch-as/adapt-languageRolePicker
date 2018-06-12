define([
    'core/js/adapt',
    './accessibilityView'
], function(Adapt, accessibilityView) {
    
    var LanguagePickerView = Backbone.View.extend({
        
        events: {
            'click .languagepicker-languages button': 'onLanguageClick'
        },
        
        className: 'languagepicker',
        
        initialize: function () {
            this.initializeAccessibility();
            $("html").addClass("in-languagepicker");
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },
        
        render: function () {
            var data = this.model.toJSON();
            this.adjustForRoles(data);
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
            this.$el.addClass(data._classes);

            document.title = this.model.get('title') || "";
            
            _.defer(_.bind(function () {
                this.postRender();
            }, this));
        },
        
        postRender: function () {
            $('.loading').hide();
        },
        
        onLanguageClick: function (event) {
            this.destroyAccessibility();
            this.model.setLanguage($(event.target).val());
        },

        initializeAccessibility: function() {
            this.accessibilityView = new accessibilityView({
                model:this.model
            });
            
            // we need to re-render if accessibility gets switched on
            this.listenTo(this.accessibilityView, 'accessibility:toggle', this.render);
        },

        destroyAccessibility: function() {
            this.accessibilityView.remove();
        },

        remove: function() {
            $("html").removeClass("in-languagepicker");

            Backbone.View.prototype.remove.apply(this, arguments);
        },

        adjustForRoles: function(data){
            if ((data) && (data._languages))
            {
                for (var idx = 0; idx < data._languages.length; idx++)
                {
                    if ((data._languages[idx]) && (data._languages[idx]._language))
                    {
                        var languagename = data._languages[idx]._language;
                        var languagenameparts = languagename.split('_');
                        data._languages[idx]._part1 = languagenameparts[0];
                        data._languages[idx]._part2 = (languagenameparts.length === 2) ? languagenameparts[1] : '';
                    }
                }
            }
        }
    }, {
        template: 'languagePickerView'
    });

    return LanguagePickerView;

});
