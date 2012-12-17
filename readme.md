Curtain.js (maintained fork)
========================================

This plugin allows you to create a web page with multiple fixed panels that unroll with an amusing effect. Exactly like a curtain rises.
 
To navigate, you can use your keyboard instead the scrollbar or mousewheel to navigate into the document. 
But that's not all, there is more features! For example, you can easily add a fixed element or multiple "steps" element inside a panel.


## Documentation

### Basic Usage

Usage is very straightforward, simply include the curtain.js file in the page. jQuery is the only dependency.

```html
<script src="js/libs/jquery.js"></script>  
<script src="js/libs/curtain.js"></script>
```

And don't forget to add the base stylesheet

```html
<link rel="stylesheet" href="curtain.css">
```
Then call ``$('.curtains').curtain();`` to launch the plugin. You can add a set of optional options.

### Options

Valid options for curtain.js are:

* ``scrollSpeed`` - Adjust the scroll speed (default ``400``)
* ``menu`` - Bind event on "up" or "down" button (default ``null``)
* ``curtainLinks`` - If you want add a ``<a>`` (or multiple) link to a specific panel simply add a class name to this option. Take a look of the example bellow.(default ``'.curtain-links'``)
* ``enableKeys`` - Enable/Disable keyboard navigation (default ``true``)
* ``easing`` -  Change this option to specify the easing function used by jQuery animate calls. (defaults ``swing``) (You muse use jQuery easing plugin or similar to have more easing functions)
* ``sectionElement`` - The original branch only works with list items as "covers". You can now specify your own element if you like semantic markup. See the following example to get an idea (defaults to "section")

### Example

Setup the correct element structure:

```html
<div class="curtains">
    <section class="cover"> 
        your content
    </section>
    <section>
        <div class="fixed"> <!-- if you need a "fixed" content -->
            a fixed content
        </div>
        [...]
    </section>
    <section class="cover">
       [...]
    </section>
    <section >
        <ul>
            <li class="step"> ... </li> <!-- Add the class "step" to an element to  -->
            <li class="step"> ... </li> <!-- make a break at this point with keyboard controls  -->
        </ul>
    </section>
</div>
```

Then, you can launch the plugin:

```js
$(function () {
    $('.curtains').curtain({
        scrollSpeed: 400
    });
});

```

Again, if you prefer to use `li`s or some other element for your steps, you'd specify it using the `sectionElement` option. Don't forget to update the CSS as well.

## Features

### Add a "next" and "prev" link

Insert your menu in your html document. You must use ``href="#up"`` and ``href="#down"``.

```html
<ul class="menu">
    <li><a href="#up">↑</a></li>
    <li><a href="#down">↓</a></li>
</ul>
```

Then, you can launch the plugin and specify the class of your menu.

```js
$(function () {
    $('.curtains').curtain({
        scrollSpeed: 400,
        controls: '.menu'
    });
});
```

### Add a link to a specific panel

Simply add an id attribute to your panel:

```html
<div class="curtains">
    <section id="myfirstpanel" class="cover"> 
        your content
    </section>
    [...]
</div>
```

Then you can add a link anywhere to your first panel like:

```html
<div class="curtains">
    [...]
    <section class="cover">
       <a href="#myfirstpanel" class="curtain-links">Go to first panel</a>
    </section>
</div>
```


Then, you can launch the plugin and specify the class of your links.

```js
$(function () {
    $('.curtains').curtain({
        scrollSpeed: 400,
        curtainLinks: '.curtain-links'
    });
});
```

### Add callbacks to slide change events

You can fire a callback when the slide changes

```js
$('.curtains').curtains({
    nextSlide: function() { console.log('next slide'); },
    prevSlide: function() { console.log('previous slide')}
});
```


## Compatibility

* Safari
* Firefox
* Chrome
* IE8/IE9
* iOS (iPhone/iPad) __but the curtain effect is disabled__
* Android (Chrome/Opera) __but the curtain effect is disabled__

## See [original project README](https://github.com/Victa/curtain.js/) for original roadmap, credits, and inspirations

## License
License MIT
