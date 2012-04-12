//
// The background process will store images tagged (through the injected script)
// and display the image in speed dial
//

(function()
{
    var db;

    function prepareDatabase(success, error) {
        var db = openDatabase('photo-tagger', '', 'Photo tagger storage', 5*1024*1024)
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS images (' + 
                       'id INTEGER PRIMARY KEY, ' +
                       'src TEXT, ' +
                       'width INTEGER, ' +
                       'height INTEGER,' +
                       'time DATETIME,' +
                       'website TEXT,' +
                       'category INTEGER,' +
                       'data BLOB)',
                [], success, error
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS categories (' +
                        'id INTEGER PRIMARY KEY, ' +
                        'name TEXT',
                [], success, error
            );

        });
        return db;
    }

    function insertImage(src, width, height, website) {
        db.transaction(function(tx){
            var currentTime = new Date();
            tx.executeSql('INSERT INTO images (src, width, height, time, website) VALUES (?,?,?,?,?)', 
                  [src, width, height, currentTime, website], function(){opera.postError("insert success")}, function() { opera.postError("insert fail")});
        });
    }

    function insertCache(data, src) {
        db.transaction(function(tx){
            tx.executeSql('UPDATE images SET data=? WHERE src=?', 
                  [data, src]
            );
        });
    }

    function removeImage(id) {
        db.transaction(function(tx) {
            tx.executeSql("DELETE FROM images WHERE id=?", [id]);
        });
    }

    function getImages(success) {
        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM images', [], function(tx, results) {
                var images = [];
                for(var i=0, row; row =  results.rows[i]; i++) {
                    images.push({
                        id: row.id,
                        width: row.width,
                        height: row.height,
                        src: row.src,
                        time: row.time,
                        website: row.website,
                        data: row.data
                    });
                }
                success(images);
            });
        });
    }
    
    db = prepareDatabase(function() {
        opera.postError("DB init success");
    }, function() {
        opera.postError("DB init fail");
    });

    window.DB = {
        insertImage: insertImage,
        insertCache: insertCache,
        getImages: getImages,
        removeImage: removeImage
    };
}
())

var _debug_mode = true;

function debug(msg){
    if (_debug_mode) opera.postError(msg);
}

// this script is initialized when the page loads
function init() {
    DB.getImages(display);
}

document.addEventListener('DOMContentLoaded', init, false);

// Listen for injected script messages (i.e. for image tags)
opera.extension.onmessage = function(event){
    if(event.data.type == 'save') {
        var data = JSON.parse(event.data.data);
        debug("[MESSAGE FROM JS] This is what I got from the injected script: " + data.src);

        saveImage(data);
        refreshTabsGalleries();
        DB.getImages(display);
    }
    else if(event.data.type == 'refresh') {
        debug("{REFRESHING GALLERY TABS]");
        refreshTabsGalleries();
        init();
    }
}

function saveImage(data){
    debug("[SAVE IMG] Storing this url: " + data.src);

    DB.insertImage(data.src, data.width, data.height, data.website);
    
    debug('[CACHE ENABLED] ' + widget.preferences.cache);
    if (widget.preferences.cache) getBase64Image(data.src);
}

function getBase64Image(src) {
    var image = document.createElement('img');
    image.src = src;
    
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
        
        DB.insertCache(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""), src);
    }
}

(function()
{
    function init() {
    }

    function paint() {
        var gallery = document.getElementById('gallery');
         
        // clear gallery
        gallery.innerHTML = '';

        if(images.length == 0) { 
            document.getElementById('info').style.display = 'block';
            document.getElementById('header').style.display = 'none';
        }
        else {
            document.getElementById('info').style.display = 'none';
            document.getElementById('header').style.display = 'block';
        }
        
}

    window.Display = {
        init: init
    };
})();

// display images
function display(images){
    var image;
    var imgContainer;
    var close;
    var close_img;
       for(var i = 0, image; image = images[i]; i++) {
        // For the grid layout
        var a = document.createElement('a');
        a.rel = 'gallery_img';
        a.setAttribute('image_id', image.id);
        a.href = (image.data ? image.data : image.src);
        
        var div = document.createElement('div');
        div.className = 'image ';
        div.className += image.width >= image.height ? 'landscape' : 'portrait';
        div.style.backgroundImage = "url(\"" + (image.data ? "data:;base64," + image.data : image.src) + "\")";
        div.title = image.src;

        var date = new Date(image.time)
        var title = "<p>Saved <time datetime=\"" + date.toISOString() + "\">" + date.toLocaleDateString() + "</time> from <a href='" + image.website + "'>" + image.website + "</a>";
 
        $(a).colorbox({
               transition:"fade", 
               current:"{current} / {total}", 
               maxWidth:"95%",
               maxHeight:"95%",
               scalePhotos:true,
               title: title 
        });
       
        a.appendChild(div);
        
        var imgContainer = document.createElement('div');
        imgContainer.setAttribute('class', 'imgContainer');
        imgContainer.addEventListener('mouseover', function(){
            this.className += ' active';
        }, false);
        imgContainer.addEventListener('mouseout', function(){
            this.className = this.className.replace(' active', '');
        }, false);
        
        // button to remove image from the gallery
        var close = document.createElement('div');
        close.className = 'close';
        close.title = "Remove image from the gallery";
        var close_img = document.createElement('img');
        close_img.src = 'images/close.png';
        close.appendChild(close_img);
        close.addEventListener('click', removeImage, false);
        
        imgContainer.appendChild(a);
        imgContainer.appendChild(close);
        
        gallery.appendChild(imgContainer);
        
        debug("[DISPLAY] --- " + i + " - Image source: " + image.src);
        debug('[DISPLAY] img width vs height: ' + image.width + '/' + image.height);
    }
}

function removeImage(){
    var id = parseInt(this.parentNode.firstChild.getAttribute('image_id'));

    DB.removeImage(id);
    
    // this will refresh only SD
    opera.extension.postMessage({type:'refresh'});
}

function refreshTabsGalleries(){
    //check if background process
    if (opera.extension.broadcastMessage)
        opera.extension.broadcastMessage({type:'refresh'});
}
