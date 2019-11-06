import device from 'current-device';
import Scrollbar from 'smooth-scrollbar';
import Hammer from 'hammerjs';
import TweenMax, { TweenLite } from "gsap/TweenMax";
import Lazy from "jquery-lazy";
import Parallax from 'parallax-js'

$(document).ready(function() {
  lazy();
  elemsAnims();
  nav();
})
$(window).resize(function () {
  $('.lazy').each(function() {
    imagesResize(this)
  })
})

const $window = {
  width: function() {
    return Math.max(window.innerWidth, document.documentElement.clientWidth);
  }
}
const $page = {
  width: function() {
    return Math.min(window.innerWidth, document.documentElement.clientWidth);
  }
}


//functions

//lazy
function lazy() {
  $(".lazy").Lazy({
    effect: 'show',
    visibleOnly: true,
    effectTime: 0,
    threshold: 500,
    imageBase: false,
    defaultImage: false,
    afterLoad: function(element) {
      imagesResize(element);
    }
  });
}
function imagesResize(element) {
  let $box = element.parent();
  if(!$box.hasClass('cover-box_size-auto')) {
    let boxH = $box.height(),
        boxW = $box.width();

    setTimeout(function() {
      let imgH = element.height(),
          imgW = element.width();

      if ((boxW/boxH)>=(imgW/imgH)) {
        element.addClass('ww').removeClass('wh');
      } else {
        element.addClass('wh').removeClass('ww');
      }
      
      setTimeout(function() {
        element.addClass('visible');
      }, 250)
      
    }, 250)

  } else {
    element.addClass('visible');
  }
}

function nav() {
  let $navbtn = {
    el: $('.nav-btn'),
    stateInterval: 1000,
    state: true
  }

  $navbtn.el.on('click', function() {
    if($navbtn.state == true) {
      $navbtn.state = false;
      setTimeout(function() {
        $navbtn.state = true;
      }, $navbtn.stateInterval)

      console.log('+')

    }
  })
}

function elemsAnims() {
  $(document).on('mouseenter mouseleave touchstart touchend', '.js-animated', function(event) {
    let $target = $(this);

    if(event.type=='mouseenter') {
      $target.addClass('hover');
    } else if(event.type=='mouseleave') {
      $target.removeClass('hover');
    }

    if(event.type=='touchstart') {
      $target.addClass('touch');
    } else if(event.type=='touchend') {
      $target.removeClass('touch');
    }

  })
}