//
// The background process will store images tagged (through the injected script)
// and display the image in speed dial
//

// run the init script when page loads
window.onload = init; 

// global variables
var _storage; // localstorage
var _images; // array of images
var _img_separator = "#;#";
var _meta_separator = "#|#";
var _debug_mode = false;
var _cache_images = false;
var temp;

function debug(msg){
    if (_debug_mode) opera.postError(msg);
}

// this script is initialized when the page loads
function init(){
    // storage
    _storage = localStorage;
    
    // get all existing images
    _images = getImages();
    
    _cache_images = widget.preferences.getItem('cache');
    
    // display them
    display('init');
}

// storage handler for the options page
addEventListener( 'storage', _storageHandler, false );

// storage handler for the options page
function _storageHandler( e, forceUpdate )
{
    if( e===true || e.storageArea==widget.preferences)
    {
        _cache_images = widget.preferences.getItem('cache');
    }
}

// Listen for injected script messages (i.e. for image tags)
opera.extension.onmessage = function(event){
    switch(event.data.type){
        case 'save': // called from the user JS, works only for the index.html displayed in the SD
            // Post a sentence (which includes the message received) to the opera error console.
            debug("[MESSAGE FROM JS] This is what I got from the injected script: " + event.data.data);
            // add tag to library
            saveImage(event.data.data);
            // refresh gallery
            refreshTabsGalleries();
            display('save');
            break;
        case 'refresh':
            debug("{REFRESHING GALLERY TABS]");
            // SD forces to refresh all opened galleries tabs
            refreshTabsGalleries();
            init();
            break;
        case 'createTab':
            opera.extension.tabs.create({url:event.data.imgUrl, focused:true});
            break;
    }
}

function saveImage(imgTag){
    debug("[SAVE IMG] Storing this url: " + imgTag);
    
    var imgArr = imgTag.split(_meta_separator);
    
    // save it to local storage by adding to end of list
    if(!_storage.images)
        _storage.images = imgTag;
    else
        _storage.images += _img_separator + imgTag; 

    // update the live images table
    
    var image = {
        src    : imgArr[0],
        width  : parseInt(imgArr[1]),
        height : parseInt(imgArr[2]),
        base64 : null,
    }
    
    _images.push(image);
    
    debug('[CACHE ENABLED] ' + _cache_images);
    if (_cache_images) getBase64Image(image, _images.length - 1);
}

function getBase64Image(imageData, imgInd) {
    var image = document.createElement('img');
    image.src = imageData.src;
    
    image.onload = function(){
        debug("[IMAGE LOADED]");
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        
        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL();
        
        _images[imgInd].base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        
        updateStorage();
    }
}

function updateStorage(){
    var imgTag;
    var imgs = _images;
    var storage = '';
    var org_storage = _storage.images;
    
    for (var i = 0, len = imgs.length; i < len; i ++){
        imgTag = imgs[i].src + '#|#' + imgs[i].width + '#|#' + imgs[i].height + (imgs[i].base64 ? '#|#' + imgs[i].base64 : '');
        if (i > 0){
            storage += _img_separator + imgTag;
        }
        else {
            storage = imgTag;
        }
    }
    //try/catch
    try{
        _storage.images = storage;
    }
    catch(e){
        opera.postError("Couldn't save to the storage - storage is full");
        _storage.images = org_storage;
    }
}

// get all tags as an array
function getImages(){
    // get all images as an array
    if(!_storage.images)
        return new Array();
    
    var tmpArray = _storage.images.split(_img_separator);
    //debug("[GET IMGS] storage: " + _storage.images);
    //debug("[GET IMGS] Images count: " + tmpArray.length);
    
    // parse through and make multi dimensional array
    var imgArray = [];
    var meta;
    for(var i = 0, len = tmpArray.length; i < len; i++){
        meta = tmpArray[i].split(_meta_separator);
        imgArray.push({
            "src" : meta[0],
            "width" : parseInt(meta[1]),
            "height" : parseInt(meta[2]),
            "base64" : meta[3],
        });
        debug("[GET IMGS] --- " + i + " - src:" + meta[0]);
    }

    return imgArray;
}

// display images
function display(evt){
    debug('[DISPLAY IMAGES BY] ' + evt);
    var gallery = document.getElementById('gallery');
    var images_count = _images.length;
    var image;
    var imgContainer;
    var close;
    var close_img;
    
    // clear gallery
    gallery.innerHTML = '';

    debug("[DISPLAY] images array: " + JSON.stringify(_images, null, '\t'));
    
    if (images_count == 0){ 
    	document.getElementById('info').style.display = 'block';
    	document.getElementById('header').style.display = 'none';
    }
    else{
    	document.getElementById('info').style.display = 'none';
    	document.getElementById('header').style.display = 'block';
    }
        
    // _images is a global variable and is filled with all images in _storage on init
    for(i = 0; i < images_count; i++){
        // for the grid layout
        
        var a = document.createElement('a');
        a.rel = 'gallery_img';
        a.setAttribute('imgId', i);
        a.href = (_images[i].base64 ? _images[i].base64 : _images[i]["src"]);
        
        image = document.createElement('div');
        image.className = 'image';
        _images[i]["width"] >= _images[i]["height"] ? image.className += ' landscape' : image.className += ' portrait'; //"100% auto" : "auto 100%";
        image.style.backgroundImage = "url(\"" + (_images[i].base64 ? "data:;base64," + _images[i].base64 : _images[i]["src"]) + "\")";
        image.title = _images[i]["src"];
        
        a.appendChild(image);
        
        imgContainer = document.createElement('div');
        imgContainer.setAttribute('class', 'imgContainer');
        //imgContainer.setAttribute('imgId', i);
        //imgContainer.style.backgroundImage = "url(" + _images[i]["src"] + ")";
        //_images[i]["width"] >= _images[i]["height"] ? imgContainer.className += ' landscape' : imgContainer.className += ' portrait'; //"100% auto" : "auto 100%";
        //imgContainer.title = _images[i]["src"];
        //imgContainer.setAttribute('href',imgContainer.title);
        
        imgContainer.addEventListener('mouseover', function(){
            this.className += ' active';
        }, false);
        imgContainer.addEventListener('mouseout', function(){
            this.className = this.className.replace(' active', '');
        }, false);
        //imgContainer.addEventListener('click', imgOnClick, false);
        
        // button to remove image from the gallery
        close = document.createElement('div');
        close.className = 'close';
        close.title = "Remove image from the gallery";
        close_img = document.createElement('img');
        close_img.src = 'images/close.png';
        close.appendChild(close_img);
        close.addEventListener('click', removeImage, false);
        
        imgContainer.appendChild(a);
        imgContainer.appendChild(close);
        
        gallery.appendChild(imgContainer);
        
        debug("[DISPLAY] --- " + i + " - Image source: " + _images[i]["src"]);
        debug('[DISPLAY] img width vs height: ' + _images[i]["width"] + '/' + _images[i]["height"]);
    }
    
    $("a[rel='gallery_img']").colorbox({transition:"fade", current:"{current} / {total}"});
}

/*function imgOnClick(){
    var imgUrl = _images[this.getAttribute('imgId')].src;
    opera.extension.postMessage({type: 'createTab', imgUrl:imgUrl});
}*/

function removeImage(){
    var imgIndex = parseInt(this.parentNode.firstChild.getAttribute('imgId'));
    
    _images.splice(imgIndex, 1);
    var tmpArray = _storage.images.split(_img_separator);
    tmpArray.splice(imgIndex, 1);
    _storage.images = '';
    
    for (var i = 0; i < tmpArray.length; i ++){
        if (i == 0)
            _storage.images = tmpArray[i];
        else
            _storage.images += _img_separator + tmpArray[i]
    }
    
    // this will refresh only SD
    opera.extension.postMessage({type:'refresh'});
}

function refreshTabsGalleries(){
    //check if background process
    if (opera.extension.broadcastMessage)
        opera.extension.broadcastMessage({type:'refresh'});
}