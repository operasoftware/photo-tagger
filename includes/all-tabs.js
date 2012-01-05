// ==UserScript==
// @include *
// @exclude http://acid3.acidtests.org/*
// ==/UserScript==

window.addEventListener
(
    'DOMContentLoaded',
    function()
    {
        if (!document.getElementsByTagName('body')[0]) return;
        window.addEventListener('DOMNodeInserted', DOMNodeInserted, false);
        
        var storage = widget.preferences;
        var min_w = storage.getItem('width');
        var min_h = storage.getItem('height');
        var showButton = false;
        var timeout;
        
        var _debug_mode = false;
        function debug(msg){
            if (_debug_mode) opera.postError(msg);
        }

        /* load css */
        var parent = document.getElementsByTagName("head")[0];
        if (!parent) {
            parent = document.documentElement;
        }
        var imgBase64 = 'data:image/png;base64,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';
        var css = '#_picTagger{position: absolute; top: 0; left: 0; display: none; cursor:pointer; width:30px;height:30px; background-image:url(' + imgBase64 + '); background-repeat:no-repeat; background-position: center; background-size: 100%; z-index:10000;}';
        var style = document.createElement("style");
        style.type = "text/css";
        style.textContent = css;
        parent.appendChild(style);
        
        /* generate tag */
        var tagButton = document.createElement('div');
        tagButton.id  = '_picTagger';
        tagButton.title = 'Click to add this picture to your gallery.';
        tagButton.innerHTML = '<a href="javascript:void(0);"><div style="width:100%; height:100%;"></div></a>';
        tagButton.addEventListener('click', buttonClick, false);
        tagButton.addEventListener('mouseover', function(){showButton = true;}, false);
        tagButton.addEventListener('mouseout', function(){mouseOut(tagButton);}, false);
        document.getElementsByTagName('body')[0].appendChild(tagButton);

        /* locate images */
        var image;
        for(i = 0; i < document.images.length; i = i + 1){
            image = document.images[i];
            addHoverEvents(image);
        }
        
        function addHoverEvents(img, mouseOverHandler){
            /* attach hover events */
            if (mouseOverHandler)
                img.addEventListener( 'mouseover', function(){mouseOverHandler(this, tagButton);}, false );
            else
                img.addEventListener( 'mouseover', function(){imageMouseOver(this, tagButton);}, false );
            /* detach hover event */
            img.addEventListener( 'mouseout', function(){mouseOut(tagButton);}, false );
        }
        
        function findImgs(cont){
            var children = cont.children;
            if (!children) return;
            for (var i = 0, len = children.length; i < len; i ++){
                if (children[i].nodeName == 'IMG'){
                    addHoverEvents(children[i])
                }
                else{
                    findImgs(children[i]);
                }
            }
        }
        
        function DOMNodeInserted(evt){
            var srcEl = evt.srcElement;
            if (srcEl.nodeName == 'IMG'){
                addHoverEvents(srcEl);
            }
            else{
                findImgs(srcEl)
            }
        }
        
        function buttonClick(){
            tagImage(this.getAttribute('tagData'));
            animateButton(this);
        }
        
        function mouseOut(button){
            showButton = false;
            hideButton(button);
        }
        
        function imageMouseOver(source, button){
            showButton = false;
            if (source.width < min_w || source.height < min_h) return;
            
            showButton = true;;
            /* find position of image */
            var pos = findPos(source);
            button.style.left = pos[0] + 'px';
            button.style.top = pos[1] + 'px';
            button.style.display = "block";
            button.setAttribute('tagData', source.src + '#|#' + source.width + '#|#' + source.height);
        }
        
        function hideButton(button){
            clearTimeout(timeout);
            timeout = setTimeout(function(){
                if (!showButton){
                    button.style.display = "none";
                }
            }, 50);
        }
        
        /* find real position of an element */
        function findPos(obj) {
            if (!obj.offsetParent){
                return [obj.offsetLeft, obj.offsetTop];
            }
            var off = findPos(obj.offsetParent);
            return [obj.offsetLeft + off[0], obj.offsetTop + off[1]]; 
        }
        
        /*function findPos(obj) {
            var curleft = curtop = 0;
            //if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
            //}
            return [curleft,curtop];
        }*/
        
        function animateButton(button, opacity){
            if (opacity >= 1){
                button.style.opacity = 1;
                return;
            }
            else if (!opacity) {
                opacity = 0;
            }
            button.style.opacity = opacity;
            
            setTimeout(function(){
                timeout = animateButton(button, opacity + 0.2);
            }, 50);
        }
        
        function tagImage(imgMetaData){
            // send to background script this string: 'src,width,height'
            opera.extension.postMessage({type:'save', data:imgMetaData});
        }
        
        function hackFlickrImages(){
            var href = window.location.href;
            
            //http://www.flickr.com/photos/XXX
            if (/(http|https)(:\/\/)(www\.)?(flickr\.com\/photos\/)(.)+(.)+/.test(href)){
                var parent = document.getElementsByTagName("head")[0];
                if (!parent) {
                    parent = document.documentElement;
                }
                var new_style_str = ".facade-of-protection {display:none !important;}";
                var new_style = document.createElement("style");
                new_style.type = "text/css";
                new_style.textContent = new_style_str;
                parent.appendChild(new_style);
                
                var prot = document.getElementById("photo-drag-proxy");
                if (prot) addHoverEvents(prot, FlickrImageMouseOver);
                
                var spaceballs = document.getElementsByClassName('spaceball');
                for (var i = 0, len = spaceballs.length; i < len; i ++){
                    addHoverEvents(spaceballs[i], FlickrImageMouseOver2);
                }
                
            }
            //http://www.flickr.com/photos or http://www.flickr.com/photos/
            else if (/(http|https)(:\/\/)(www\.)?(flickr\.com\/photos)(\/)?/.test(href)){
                imageMouseOver = function(source, button){
                    showButton = false;
                    if (source.width < min_w || source.height < min_h) return;
                    
                    showButton = true;;
                    /* find position of image */
                    var pos = findPos(source);
                    button.style.left = pos[0] + 'px';
                    button.style.top = pos[1] - source.offsetTop + 'px';
                    button.style.display = "block";
                    button.setAttribute('tagData', source.src + '#|#' + source.width + '#|#' + source.height);
                }
            }
        }
        
        function FlickrImageMouseOver(source, button){
            var next_sibling = source.nextSibling;
            if (!next_sibling) return;
            
            var image = next_sibling.children[0];
            if (!image || image.tagName.toUpperCase() != "IMG") return;
            
            showButton = false;
            if (image.width < min_w || image.height < min_h) return;
            
            showButton = true;;
            /* find position of image */
            var pos = findPos(image);
            button.style.left = pos[0] + 'px';
            button.style.top = pos[1] + 'px';
            button.style.display = "block";
            button.setAttribute('tagData', image.src + '#|#' + image.width + '#|#' + image.height);
        }
        
        function FlickrImageMouseOver2(source, button){
            var prev_sibling = source.previousElementSibling;
            if (!prev_sibling) return;
            
            var image = prev_sibling.children[0];
            if (!image || image.tagName.toUpperCase() != "IMG") return;
            
            showButton = false;
            if (image.width < min_w || image.height < min_h) return;
            
            showButton = true;;
            /* find position of image */
            var pos = findPos(image);
            button.style.left = pos[0] + 'px';
            button.style.top = pos[1] + 'px';
            button.style.display = "block";
            button.setAttribute('tagData', image.src + '#|#' + image.width + '#|#' + image.height);
        }
        
        hackFlickrImages();
    },
    false
);
