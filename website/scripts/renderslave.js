/*
 * Für das Rendering mit dem Launix phantom.JS-Renderer
*/
function translateTime(x) {
  return x;
}

function startRendering(){}

function stopRendering(){}

/*
 * Beginn der Bibliothek von Hilfsfunktionen zur Animationserstellung
*/

/**
 * Zeichnet die Bilderschow
 * @param imagelist Array von Strings, die die Bildquellen angeben
 * @param options Optionen der Slideshow. Erlaubte Felder: duration (in ms) gibt an, wie viele Millisekunden ein Bild jeweils zu sehen ist, default ist 1000. fadeIn (in ms) gibt an, wie lang das Bild eingeblendet werden soll (in ms). mode ist kann die Werte 'fade' (default) und 'slide' enthalten und bestimmt die Art des Übergangs. lateFadeOut ist ein Boolean, der den Zeitpunkt des Beginns des Ausblendens angibt.
 * @param onFinished Aktion nach dem Bildwechsel
*/
$.prototype.slideshow = function(imagelist, options, onFinished) {
  var self = this;
  options = options || {};
  var mode = options.mode || 'fade';
  if(mode === 'slide') {
    self.css({overflow: 'hidden'});
  }

  var idx = 0;
  function nextImage() {
    if(idx >= imagelist.length) {
      if(onFinished) {
        onFinished();
      }
    } else {
      var img = $('<img/>');
      img.css({
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%'
      });
      img.attr('src', imagelist[idx]);
      self.append(img);
      if(options.fadeIn) {
        if(mode === 'slide') {
          img.css({left: '-'+img.width()+'px'});
          img.animate({left: '0px'}, options.fadeIn);
        } else {
          img.hide();
          img.fadeIn(options.fadeIn);
        }
      }
      if(options.fadeOut) {
        setTimeout(function() {
          if(mode === 'slide') {
            img.animate({left: img.width()+'px'}, function() {
              img.remove();
            });
          } else {
            img.fadeOut(options.fadeOut, function() {
              img.remove();
            });
          }
        }, (options.duration || 1000) - (options.lateFadeOut?0:options.fadeOut));
      }
      idx++;
      setTimeout(function() {
        nextImage();
        if(!options.fadeOut) {
          img.remove();
        }
      }, options.duration || 1000);
    }
  }
  nextImage();
}

/**
 * Zeichnet ein Video in die vorgegebene Leinwand
 * Die Einzelbilder sind mit dem Kommando
 * `ffmpeg -i "videodatei.avi" -q:v 1 "ordner/img-%d.jpg"` zu exportieren
 * @param images Namensschema der Bilder. Dabei ist %d Platzhalter für die Framezahl
 * @param framerate Anzahl der Bilder pro Sekunde
 * @param numframes Anzahl der Frames (Benennung: 0 bis numframes-1)
 * @param onFinished Funktion, die aufgerufen wird, sobald das Video zu Ende ist
*/
$.prototype.video = function(images, framerate, numframes, onFinished) {
  var self = this;

  var idx = 0;
  var img = $('<img/>');
  img.css({
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%'
  });
  self.append(img);

  function nextImage() {
    if(idx >= numframes) {
      if(onFinished) {
        onFinished();
      }
    } else {
      img.attr('src', images.replace('%d', idx));
      idx++;
      setTimeout(function() {
        nextImage();
      }, translateTime(1000/framerate));
    }
  }
  nextImage();
}
