// ==UserScript==
// @include *
// @exclude http://acid3.acidtests.org/*
// ==/UserScript==


(function()
{
    var imgBase64 = 'data:image/png;base64,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';

    var baseCSS = '#_picTagger{border: 0px; border-radius: 0px; box-shadow: 0px 0px 0px; padding: 0; background-color: transparent; text-shadow: none; position: absolute; top: 0; left: 0; display: none; width:30px;height:30px; background-image:url(' + imgBase64 + '); background-repeat:no-repeat; background-position: center; background-size: 100%; z-index:10000; border: none; opacity: 0.8; -o-transition: opacity 0.2s;} #_picTagger:hover { cursor: pointer; opacity: 1.0; } #_picTagger:active { opacity: 0.4; }';

    var tagButton;
    var timeout;
    var imageData;
    var imagePosition;
    var min_w = widget.preferences.getItem('width');
    var min_h = widget.preferences.getItem('height');
    var showButton = false;
    var suppressButton = false;
    var _debug_mode = false;
    
    function debug(msg){
        if (_debug_mode) opera.postError(msg);
    }

    function init() {
        /* load css */
        insertStyle(baseCSS);

        /* generate tag */
        tagButton = document.createElement('button');
        tagButton.type = 'button';
        tagButton.id  = '_picTagger';
        tagButton.title = 'Click to add this picture to your gallery.';
        tagButton.addEventListener('click', buttonClick, false);
        tagButton.addEventListener('mouseover', function(){showButton = true;}, false);
        tagButton.addEventListener('mouseout', mouseOut, false);
        document.getElementsByTagName('body')[0].appendChild(tagButton);


        if (/(http|https)(:\/\/)(www\.)?(flickr\.com\/photos\/)(.)+(.)+/.
            test(window.location.href))
        {
            initFlickr();
        }
        document.addEventListener('mouseover', mouseOver, false);
        document.addEventListener('mouseout', mouseOut, false);

        if(widget.preferences.getItem('modifier')) {
            initModifierListener();
        }
    }

    function insertStyle(css) {
        var parent = document.getElementsByTagName("head")[0] ||
                     document.documentElement;
        var el = document.createElement("style");
        el.type = "text/css";
        el.textContent = css;
        parent.appendChild(el);
    }
        
    function buttonClick(){
        opera.extension.postMessage({type: 'save', data: imageData});
    }

    function mouseOver(e) {
        if(e.target.tagName == "IMG") {
            if(String(e.target.src).indexOf("spaceout.gif") !== -1) {
                return;
            }
            showImage(e.target);
        }
    }

    function mouseOut(e){
        showButton = false;
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            if (!showButton){
                tagButton.style.display = "none";
            }
        }, 50);
    }

    function showImage(image) {
        showButton = false;
        if (image.width < min_w || image.height < min_h) {
            return;
        }
        
        showButton = true;
        imagePosition = findPos(image);
        imageData = JSON.stringify({
            src: image.src, 
            width: image.width, 
            height: image.height,
            time: new Date(),
            website: window.location.href
        });

        updateButton();
    }

    function updateButton() {
        if(showButton && !suppressButton) {
            tagButton.style.left = imagePosition[0] + 'px';
            tagButton.style.top = imagePosition[1] + 'px';
            tagButton.style.display = "block";
        }
        else {
            tagButton.style.display = "none";
        }
    }
    
    // Find real position of an element
    function findPos(obj) {
        if (!obj.offsetParent){
            return [obj.offsetLeft, obj.offsetTop];
        }
        var off = findPos(obj.offsetParent);
        return [obj.offsetLeft + off[0], obj.offsetTop + off[1]]; 
    }
    
    function initFlickr() {
        var css = ".facade-of-protection {display:none !important;}";
        insertStyle(css);
        
        var proxy = document.getElementById("photo-drag-proxy");
        if(proxy) {
            proxy.addEventListener('mouseover', flickrMouseOver, false);
        }

        var spaceballs = document.getElementsByClassName('spaceball');
        for(var i=0, ball; ball = spaceballs[i]; i++) {
            ball.addEventListener('mouseover', flickrMouseOver, false);
        };
    }

    function initModifierListener() {
        suppressButton = true;
        document.addEventListener('keydown', function(e) {
            if(e.keyCode == 16) {
                suppressButton = false;
                updateButton();
            }
        }, false);
        document.addEventListener('keyup', function(e) {
            if(e.keyCode == 16) {
                suppressButton = true;
                updateButton();
            }
        }, false);
    }
    
    function flickrMouseOver(e) {
        var images = e.target.parentNode.parentNode.querySelectorAll('img');
        for(var i=0, image; image = images[i]; i++) {
            if(String(image.src).indexOf('staticflickr') != -1) {
                return showImage(image);
            }
        }
        return;
    }
    
    document.addEventListener('DOMContentLoaded', init, false);
})();
