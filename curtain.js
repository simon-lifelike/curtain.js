
/*
* Curtain.js - Create an unique page transitioning system
* ---
* Version: 2
* Copyright 2011, Victor Coulon (http://victorcoulon.fr)
* Released under the MIT Licence
*
* MODIFIED BY @jayf of JUXTAPROSE, May 2013
*
*/

(function ( $, window, document, undefined ) {

    var pluginName = 'curtain',
        defaults = {
            scrollSpeed: 400,
            bodyHeight: 0,
            linksArray: [],
            mobile: false,
            scrollButtons: {},
            controls: null,
            curtainLinks: '.curtain-links',
            loadClass: 'curtains-loaded',
            mobileClass: 'curtains-mobile',
            enableKeys: true,
            easing: 'swing',
            disabled: false,
            sectionElement: 'section',
            nextSlide: function() {},
            prevSlide: function() {},
            allLoaded: function() {}
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        // Public attributes
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;
        this._ignoreHashChange = false;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var self = this,
                ua = navigator.userAgent;

            // Cache element
            this.$element          = $(this.element);
            this.$section          = this.$element.find('>' + this.options.sectionElement);
            this.$numberOfSections = this.$section.length;
            this.$document         = $(document);
            this.$window           = $(window);
            this.$body             = $('body');
            this.$html             = $('html');
            this.$elDatas          = {};
            this.$windowHeight     = this.$window.height();


            $.Webkit  = (ua.match(/Chrome|Safari/i));
            $.Android = (ua.match(/Android/i));
            $.iPhone  = (ua.match(/iPhone|iPod/i));
            $.iPad    = ((ua.match(/iPad/i)));
            $.iOs4    = (/OS [1-4]_[0-9_]+ like Mac OS X/i.test(ua));

            if($.iPhone || $.iPad || $.Android || self.options.disabled) {
                this.options.mobile = true;

                this.$section
                    .css({position:'relative'});

                this.$element
                    .find('.fixed')
                        .css({position:'absolute'});
            }

            if($.Webkit || this.options.mobile) {
                this.scrollEl = this.$body;
            } else {
                this.scrollEl = this.$html;
            }

            if(this.options.controls) {
                this.options.scrollButtons['up'] =  $(self.options.controls).find('[href="#up"]');
                this.options.scrollButtons['down'] =  $(self.options.controls).find('[href="#down"]');

                if(!$.iOs4 && ($.iPhone || $.iPad)){
                    this.$element.css({
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        '-webkit-overflow-scrolling': 'touch',
                        overflow: 'auto'
                    });

                    $(this.options.controls).css({
                        position: 'absolute'
                    });
                }
            }

            // When all image is loaded
            var callbackImageLoaded = function() {
                self.setDimensions();
                self.$section.eq(0).addClass('current');

                self.options.allLoaded();

                self.setCache();

                if(!self.options.mobile){
                    if(self.$section.eq(1).length) {
                        self.$section
                            .eq(1)
                                .nextAll()
                                    .addClass('hidden');
                    }
                    self.$element
                        .addClass(self.options.loadClass);
                } else {
                    self.$element
                        .addClass(self.options.loadClass)
                        .addClass(self.options.mobileClass);
                }

                self.setEvents();
                self.setLinks();
                self.isHashIsOnList(location.hash.substring(1));
            };

            if(this.$element.find('img').length) {
                this.imageLoaded(callbackImageLoaded);
            } else {
                callbackImageLoaded();
            }
        },
        // Events
        scrollToPosition: function (direction){
            var position = null,
                self = this;

            if(this.scrollEl.is(':animated')) return false;

            if(direction === 'up' || direction === 'down'){
                // Keyboard event
                var $next = (direction === 'up') ? self.$current.prev() : self.$current.next();

                // Step in the current panel ?
                if(this.$step){

                    if(!this.$current.find('.current-step').length){
                        this.$step.eq(0).addClass('current-step');
                    }

                    var $nextStep = (direction === 'up') ?
                        this.$current.find('.current-step').prev('.step') :
                        this.$current.find('.current-step').next('.step');

                    if($nextStep.length) {
                        position = (this.options.mobile) ? $nextStep.position().top + this.$elDatas[this.$current.index()]['data-position'] : $nextStep.position().top + this.$elDatas[self.$current.index()]['data-position'];
                    }
                }

                position = position || ((this.$elDatas[$next.index()] === undefined) ? null : this.$elDatas[$next.index()]['data-position']);

                if(position !== null){
                    this.scrollEl.animate({
                        scrollTop: position
                    }, this.options.scrollSpeed, this.options.easing);
                }

            } else if(direction === 'top'){

                this.scrollEl.animate({
                    scrollTop: 0
                }, this.options.scrollSpeed, this.options.easing);

            } else if(direction === 'bottom'){

                this.scrollEl.animate({
                    scrollTop: this.options.bodyHeight
                }, this.options.scrollSpeed, this.options.easing);

            } else {

                var index = $("#"+direction).index(),
                    speed = Math.abs(this.currentIndex-index) * (this.options.scrollSpeed*4) / this.$numberOfSections;

                self.scrollEl.animate({
                    scrollTop:self.$elDatas[index]['data-position'] || null
                }, (speed <= this.options.scrollSpeed) ? this.options.scrollSpeed : speed, this.options.easing);
            }

        },
        scrollEvent: function() {
            var self = this,
                docTop = this.$document.scrollTop(),
                offset,
                idx;

            if(docTop < this.currentP && this.currentIndex > 0){
                // Scroll to top
                this._ignoreHashChange = true;

                var idx = self.$current.prev().attr('id')
                if(idx)
                    self.setHash(idx);

                this.$current
                    .removeClass('current')
                    .css( ($.Webkit) ? {'-webkit-transform': 'translateY(0) translateZ(0)'} : {marginTop: 0} )
                    .nextAll().addClass('hidden').end()
                    .prev().addClass('current').removeClass('hidden');

                this.setCache();
                this.options.prevSlide(idx);

            } else if(docTop < (this.currentP + this.currentHeight)){

                offset = (docTop - this.currentP);

                // Animate the current pannel during the scroll
                if($.Webkit)
                    this.$current.css({'-webkit-transform': 'translateY('+(-(offset))+'px) translateZ(0)' });
                else
                    this.$current.css({marginTop: -(offset) });

                // If there is a fixed element in the current panel
                if(this.$fixedLength){
                    var dataTop = parseInt(this.$fixed.attr('data-top'), 10);

                    if(docTop + this.$windowHeight >= this.currentP + this.currentHeight){
                        this.$fixed.css({
                            position: 'fixed'
                        });
                    } else {
                        this.$fixed.css({
                            position: 'absolute',
                            marginTop: Math.abs(offset)
                        });
                    }
                }

                // If there is a step element in the current panel
                if(this.$stepLength){
                    $.each(this.$step, function(i, el) {
                        var $el = $(el);

                        if(($el.position().top + self.currentP) <= docTop+5 &&
                           $el.position().top + self.currentP + $el.height() >= docTop+5)
                        {
                            if(!$el.is('.current-step')){
                                self.$step.removeClass('current-step');
                                $el.addClass('current-step');
                                return false;
                            }
                        }
                    });
                }


                if(self.parallaxBg){
                    this.$current.css({
                        'background-position-y': docTop * this.parallaxBg
                    });
                }

                if(this.$fade.length){
                    this.$fade.css({
                        'opacity': 1-(docTop/ this.$fade.attr('data-fade'))
                    });
                }

                if(this.$slowScroll.length){
                    this.$slowScroll.css({
                        'margin-top' : (docTop / this.$slowScroll.attr('data-slow-scroll'))
                    });
                }

            } else {
                // Scroll bottom
                this._ignoreHashChange = true;

                idx = self.$current.next().attr('id');

                if(idx) self.setHash(idx);

                this.$current
                    .removeClass('current')
                    .addClass('hidden')
                    .next(this.sectionElement)
                        .addClass('current')
                    .next(this.sectionElement)
                        .removeClass('hidden');

                this.setCache();
                this.options.nextSlide(idx);
            }

        },
        scrollMobileEvent: function() {
            var self = this,
                docTop = self.$element.scrollTop(),
                idx;

            if(docTop+10 < this.currentP && this.currentIndex > 0){

                // Scroll to top
                this._ignoreHashChange = true;

                idx = this.$current.prev().attr('id');

                if(idx) this.setHash(idx);

                this.$current
                    .removeClass('current')
                    .prev()
                        .addClass('current');

                this.setCache();
                this.options.prevSlide(idx);

            } else if(docTop+10 < (this.currentP + this.currentHeight)) {

                // If there is a step element in the current panel
                if(this.$stepLength){
                    $.each(this.$step, function(i,el){
                        var $el = $(el);

                        if($el.position().top + self.currentP <= docTop &&
                           $el.position().top + self.currentP + $el.outerHeight() >= docTop)
                        {
                            if(!$el.is('.current-step')) {
                                self.$step.removeClass('current-step');
                                $el.addClass('current-step');
                            }
                        }
                    });
                }

            } else {

                // Scroll bottom
                this._ignoreHashChange = true;

                idx = this.$current.next().attr('id')

                if(idx) this.setHash(idx);

                this.$current
                    .removeClass('current')
                    .next()
                        .addClass('current');

                this.setCache();
                this.options.nextSlide(idx);
            }


        },
        // Setters
        setDimensions: function(){
            var self = this,
                levelHeight = 0,
                cover = false,
                height = null;

            this.$windowHeight = self.$window.height();

            this.$section.each(function(index) {
                var $this = $(this);
                cover = $this.hasClass('cover');

                if(cover){
                    $this.css({height: self.$windowHeight, zIndex: 999-index})
                        .attr('data-height',self.$windowHeight)
                        .attr('data-position',levelHeight);

                    self.$elDatas[$this.index()] = {
                        'data-height': parseInt(self.$windowHeight,10),
                        'data-position': parseInt(levelHeight, 10)
                    };

                    levelHeight += self.$windowHeight;

                } else{
                    height = ($this.outerHeight() <= self.$windowHeight) ? self.$windowHeight : $this.outerHeight();
                    $this.css({minHeight: height, zIndex: 999-index})
                        .attr('data-height',height)
                        .attr('data-position',levelHeight);

                     self.$elDatas[$this.index()] = {
                        'data-height': parseInt(height, 10),
                        'data-position': parseInt(levelHeight, 10)
                    };

                    levelHeight += height;
                }

                if($this.find('.fixed').length){
                    var top = $this.find('.fixed').css('top');
                    $this.find('.fixed').attr('data-top', top);
                }
            });

            if(!this.options.mobile) this.setBodyHeight();
        },
        setEvents: function() {
            var self = this;

            this.$window.on('resize', function(){
                self.setDimensions();
            });

            if(this.options.mobile) {
                this.$element.on('scroll', function(){
                    self.scrollMobileEvent();
                });
            } else {
                this.$window.on('scroll', function(){
                    self.scrollEvent();
                });
            }

            if(this.options.enableKeys) {
                this.$document.on('keydown', function(e){
                    if(e.keyCode === 38 || e.keyCode === 37) {
                        self.scrollToPosition('up');
                        e.preventDefault();
                        return false;
                    }
                    if(e.keyCode === 40 || e.keyCode === 39){
                        self.scrollToPosition('down');
                        e.preventDefault();
                        return false;
                    }
                    // Home button
                    if(e.keyCode === 36){
                        self.scrollToPosition('top');
                        e.preventDefault();
                        return false;
                    }
                    // End button
                    if(e.keyCode === 35){
                        self.scrollToPosition('bottom');
                        e.preventDefault();
                        return false;
                    }
                });
            }

            if(this.options.scrollButtons){
                if(this.options.scrollButtons.up){
                    this.options.scrollButtons.up.on('click', function(e){
                        e.preventDefault();
                        self.scrollToPosition('up');
                    });
                }
                if(this.options.scrollButtons.down){
                    this.options.scrollButtons.down.on('click', function(e){
                        e.preventDefault();
                        self.scrollToPosition('down');
                    });
                }
            }

            if(this.options.curtainLinks){
                $(this.options.curtainLinks).on('click', function(e){
                    e.preventDefault();
                    var href = $(this).attr('href');

                    if(!self.isHashIsOnList(href.substring(1)) && position)
                        return false;
                    var position = self.$elDatas[$(href).index()]['data-position'] || null;

                    if(position){
                        self.scrollEl.animate({
                            scrollTop:position
                        }, self.options.scrollSpeed, self.options.easing);
                    }
                    return false;
                });
            }

            this.$window.on("hashchange", function(event){
                if(self._ignoreHashChange === false){
                    self.isHashIsOnList(location.hash.substring(1));
                }
                self._ignoreHashChange = false;
            });
        },
        setBodyHeight: function(){
            var h = 0;

            for (var key in this.$elDatas) {
               var obj = this.$elDatas[key];
               h += obj['data-height'];
            }

            this.options.bodyHeight = h;
            $('body').height(h);
        },
        setLinks: function(){
            var self = this;
            this.$section.each(function() {
                var id = $(this).attr('id') || 0;
                self.options.linksArray.push(id);
            });
        },
        setHash: function(hash){
            // "HARD FIX"
            $el = $('[href=#'+hash+']');

            $el.parent()
                .siblings(this.sectionElement)
                    .removeClass('active');

            $el.parent()
                .addClass('active');

            if(history.pushState) {
                history.pushState(null, null, '#'+hash);
            } else {
                location.hash = hash;
            }
        },
        setCache: function(){
            var self = this;
            this.$current      = this.$element.find('.current');
            this.$fixed        = this.$current.find('.fixed');
            this.$fixedLength  = this.$fixed.length;
            this.$step         = this.$current.find('.step');
            this.$stepLength   = this.$step.length;
            this.currentIndex  = this.$current.index();
            this.currentP      = this.$elDatas[this.currentIndex]['data-position'];
            this.currentHeight = this.$elDatas[this.currentIndex]['data-height'];

            this.parallaxBg    = this.$current.attr('data-parallax-background');
            this.$fade         = this.$current.find('[data-fade]');
            this.$slowScroll   = this.$current.find('[data-slow-scroll]');

        },
        // Utils
        isHashIsOnList: function(hash){
            var self = this;

            $.each(this.options.linksArray, function(i, val){
                if(val === hash){
                    self.scrollToPosition(hash);
                    return false;
                }
            });
        },
        readyElement: function(el, callback){
          var interval = setInterval(function(){
            if(el.length){
              callback(el.length);
              clearInterval(interval);
            }
          },60);
        },
        imageLoaded: function(callback){
            var self = this,
                elems = self.$element.find('img'),
                len   = elems.length,
                blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

            elems.bind('load.imgloaded',function(){
                if (--len <= 0 && this.src !== blank){
                    elems.unbind('load.imgloaded');
                    callback.call(elems,this);
                }
            }).each(function(){
                if (this.complete || this.complete === undefined){
                    var src = this.src;
                    this.src = blank;
                    this.src = src;
                }
            });
        }
    };



    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };


})( jQuery, window, document );
