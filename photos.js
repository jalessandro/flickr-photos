/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function getFavorites () {
        var favoriteList = localStorage.getItem('favorites');
        if (!favoriteList) {
            favoriteList = [];
        } else {
            favoriteList = JSON.parse(favoriteList);
        }

        return favoriteList;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        var iconClickHandler = function(event) {
            var element = event.currentTarget;
            var favoriteUrl = element.getAttribute('data-url');
            var favoriteList = getFavorites();

            favoriteList.push(favoriteUrl);
            localStorage.setItem('favorites', JSON.stringify(favoriteList));
            element.className = 'icon-heart icon-border';
        };

        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo';

            var icon = document.createElement('i');
            icon.setAttribute("data-url", img.src);
            icon.className = 'icon-border' + ((favorites.indexOf(img.src) >= 0) ? ' icon-heart' : ' icon-heart-empty');
            icon.addEventListener('click', iconClickHandler);

            elm.appendChild(img);
            elm.appendChild(icon);
            holder.appendChild(elm);
        };
    }

    // ----
    
    var max_per_tag = 5;
    var favorites = getFavorites();
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));
