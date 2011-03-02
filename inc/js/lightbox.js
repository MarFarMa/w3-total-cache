var W3tc_Lightbox = {
    window: jQuery(window),
    container: null,
    options: null,

    create: function() {
        var me = this;

        this.container = jQuery('<div class="lightbox lightbox-loading"><div class="lightbox-close">Close window</div><div class="lightbox-content"></div></div>').css({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            position: 'absolute',
            'z-index': 9991,
            display: 'none'
        });

        jQuery('#w3tc').append(this.container);

        this.window.resize(function() {
            me.resize();
        });

        this.window.scroll(function() {
            me.resize();
        });

        this.container.find('.lightbox-close').click(function() {
            me.close();
        });
    },

    open: function(options) {
        this.options = jQuery.extend({
            width: 400,
            height: 300,
            offsetTop: 100,
            content: null,
            url: null,
            callback: null
        }, options);

        this.create();

        this.container.css({
            width: this.options.width,
            height: this.options.height
        });

        if (this.options.content) {
            this.content(options.content);
        } else if (this.options.url) {
            this.load(this.options.url, this.options.callback);
        }

        W3tc_Overlay.show(this);

        this.resize();
        this.container.show();
    },

    close: function() {
        this.container.remove();
        W3tc_Overlay.hide();
    },

    resize: function() {
        this.container.css({
            top: this.window.scrollTop() + this.options.offsetTop,
            left: this.window.scrollLeft() + this.window.width() / 2 - this.container.width() / 2
        });

        jQuery('.lightbox-content', this.container).css({
            width: this.width(),
            height: this.height()
        });
    },

    load: function(url, callback) {
        this.content('');
        this.loading(true);
        var me = this;
        jQuery.get(url, {}, function(content) {
            me.loading(false);
            me.content(content);
            if (callback) {
                callback.call(this, me);
            }
        });
    },

    content: function(content) {
        return this.container.find('.lightbox-content').html(content);
    },

    width: function(width) {
        if (width === undefined) {
            return this.container.width();
        } else {
            this.container.css('width', width);
            return this.resize();
        }
    },

    height: function(height) {
        if (height === undefined) {
            return this.container.height();
        } else {
            this.container.css('height', height);
            return this.resize();
        }
    },

    loading: function(loading) {
        return (loading === undefined ? this.container.hasClass('lightbox-loader') : (loading ? this.container.addClass('lightbox-loader') : this.container.removeClass('lightbox-loader')));
    }
};

var W3tc_Overlay = {
    window: jQuery(window),
    container: null,

    create: function() {
        var me = this;

        this.container = jQuery('<div id="overlay" />').css({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            position: 'absolute',
            'z-index': 9990,
            display: 'none',
            opacity: 0.6
        });

        jQuery('#w3tc').append(this.container);

        this.window.resize(function() {
            me.resize();
        });

        this.window.scroll(function() {
            me.resize();
        });
    },

    show: function() {
        this.create();
        this.resize();
        this.container.show();
    },

    hide: function() {
        this.container.remove();
    },

    resize: function() {
        this.container.css({
            top: this.window.scrollTop(),
            left: this.window.scrollLeft(),
            width: this.window.width(),
            height: this.window.height()
        });
    }
};

function w3tc_lightbox_support_us() {
    W3tc_Lightbox.open({
        width: 500,
        height: 230,
        url: 'admin.php?page=w3tc_general&w3tc_action=support_us'
    });
}

var w3tc_minify_recommendations_checked = {};

function w3tc_lightbox_minify_recommendations() {
    var min_height = 200;
    var max_height = 1200;

    var height = jQuery(window).height() - 220;

    if (height < min_height) {
        height = min_height;
    } else if (height > max_height) {
        height = max_height;
    }

    W3tc_Lightbox.open({
        width: 1000,
        height: height,
        url: 'admin.php?page=w3tc_minify&w3tc_action=minify_recommendations',
        callback: function(lightbox) {
            var theme = jQuery('#recom_theme').val();

            if (jQuery.ui && jQuery.ui.sortable) {
                jQuery("#recom_js_files,#recom_css_files").sortable({
                    axis: 'y',
                    stop: function() {
                        jQuery(this).find('li').each(function(index) {
                            jQuery(this).find('td:eq(1)').html((index + 1) + '.');
                        });
                    }
                });
            }

            if (w3tc_minify_recommendations_checked[theme] !== undefined) {
                jQuery('#recom_js_files :text,#recom_css_files :text').each(function() {
                    var hash = jQuery(this).parents('li').find('[name=recom_js_template]').val() + ':' + jQuery(this).val();

                    if (w3tc_minify_recommendations_checked[theme][hash] !== undefined) {
                        var checkbox = jQuery(this).parents('li').find(':checkbox');

                        if (w3tc_minify_recommendations_checked[theme][hash]) {
                            checkbox.attr('checked', 'checked');
                        } else {
                            checkbox.removeAttr('checked');
                        }
                    }
                });
            }

            jQuery('#recom_theme').change(function() {
                jQuery('#recom_js_files :checkbox,#recom_css_files :checkbox').each(function() {
                    var li = jQuery(this).parents('li');
                    var hash = li.find('[name=recom_js_template]').val() + ':' + li.find(':text').val();

                    if (w3tc_minify_recommendations_checked[theme] === undefined) {
                        w3tc_minify_recommendations_checked[theme] = {};
                    }

                    w3tc_minify_recommendations_checked[theme][hash] = jQuery(this).is(':checked');
                });

                lightbox.load('admin.php?page=w3tc_minify&w3tc_action=minify_recommendations&theme_key=' + jQuery(this).val(), lightbox.options.callback);
            });

            jQuery('#recom_js_check').click(function() {
                if (jQuery('#recom_js_files :checkbox:checked').size()) {
                    jQuery('#recom_js_files :checkbox').removeAttr('checked');
                } else {
                    jQuery('#recom_js_files :checkbox').attr('checked', 'checked');
                }

                return false;
            });

            jQuery('#recom_css_check').click(function() {
                if (jQuery('#recom_css_files :checkbox:checked').size()) {
                    jQuery('#recom_css_files :checkbox').removeAttr('checked');
                } else {
                    jQuery('#recom_css_files :checkbox').attr('checked', 'checked');
                }

                return false;
            });

            jQuery('.recom_apply', lightbox.container).click(function() {
                var theme = jQuery('#recom_theme').val();

                jQuery('#js_files li').each(function() {
                    if (jQuery(this).find(':text').attr('name').indexOf('js_files[' + theme + ']') != -1) {
                        jQuery(this).remove();
                    }
                });

                jQuery('#css_files li').each(function() {
                    if (jQuery(this).find(':text').attr('name').indexOf('css_files[' + theme + ']') != -1) {
                        jQuery(this).remove();
                    }
                });

                jQuery('#recom_js_files li').each(function() {
                    if (jQuery(this).find(':checkbox:checked').size()) {
                        w3tc_minify_js_file_add(theme, jQuery(this).find('[name=recom_js_template]').val(), jQuery(this).find('[name=recom_js_location]').val(), jQuery(this).find('[name=recom_js_file]').val());
                    }
                });

                jQuery('#recom_css_files li').each(function() {
                    if (jQuery(this).find(':checkbox:checked').size()) {
                        w3tc_minify_css_file_add(theme, jQuery(this).find('[name=recom_css_template]').val(), jQuery(this).find('[name=recom_css_file]').val());
                    }
                });

                w3tc_minify_js_theme(theme);
                w3tc_minify_css_theme(theme);

                w3tc_input_enable('.js_enabled', jQuery('#js_enabled:checked').size());
                w3tc_input_enable('.css_enabled', jQuery('#css_enabled:checked').size());

                lightbox.close();
            });
        }
    });
}

function w3tc_lightbox_self_test() {
    var min_height = 200;
    var max_height = 800;

    var height = jQuery(window).height() - 220;

    if (height < min_height) {
        height = min_height;
    } else if (height > max_height) {
        height = max_height;
    }

    W3tc_Lightbox.open({
        width: 800,
        height: height,
        url: 'admin.php?page=w3tc_general&w3tc_action=self_test',
        callback: function(lightbox) {
            jQuery('.button-primary', lightbox.container).click(function() {
                lightbox.close();
            });
        }
    });
}

function w3tc_lightbox_cdn_s3_bucket_location(type) {
    W3tc_Lightbox.open({
        width: 500,
        height: 150,
        url: 'admin.php?page=w3tc_general&w3tc_action=cdn_s3_bucket_location&type=' + type,
        callback: function(lightbox) {
            jQuery('.button', lightbox.container).click(function() {
                lightbox.close();
            });
        }
    });
}

jQuery(function() {
    jQuery('.button-minify-recommendations').click(function() {
        w3tc_lightbox_minify_recommendations();
        return false;
    });

    jQuery('.button-self-test').click(function() {
        w3tc_lightbox_self_test();
        return false;
    });

    jQuery('.button-cdn-s3-bucket-location,.button-cdn-cf-bucket-location').click(function() {
        var type = '';

        if (jQuery(this).hasClass('cdn_s3')) {
            type = 's3';
        } else if (jQuery(this).hasClass('cdn_cf')) {
            type = 'cf';
        }

        w3tc_lightbox_cdn_s3_bucket_location(type);
        return false;
    });
});
