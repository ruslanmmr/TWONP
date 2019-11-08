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
  main();
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

let mainColor = '#6FDE9B';
let $nav = {
  trigger: $('.nav-btn'),
  el: $('.nav'),
  state: false,
  triggerAnim: '',
  fadeAnim: '',
  open: function() {
    $nav.fadeAnim.play();
    $nav.triggerAnim.play();
    $('html').addClass('navOpened').addClass('navInAnimation');
    $nav.fadeAnim.eventCallback("onComplete", function(){
      $nav.state = true;
    })
  },
  close: function() {
    $nav.fadeAnim.reverse();
    $nav.triggerAnim.reverse();
    setTimeout(function() {
      $('html').removeClass('navInAnimation');
    }, 500)
    $nav.fadeAnim.eventCallback("onReverseComplete", function(){
      $('html').removeClass('navOpened');
      $nav.state = false;
    })
  }
}
$nav.triggerAnim = new TimelineMax({paused:true})
  .to($nav.trigger.find('span:first-child'), 0.5, {y:8, ease:Power2.easeIn})
  .to($nav.trigger.find('span:last-child'), 0.5, {y:-8, ease:Power2.easeIn}, '-=0.5')
  .set($nav.trigger.find('span:nth-child(2)'), {autoAlpha:0})
  .to($nav.trigger.find('span:first-child'), 0.5, {rotation:45, ease:Power2.easeOut})
  .to($nav.trigger.find('span:last-child'), 0.5, {rotation:135, ease:Power2.easeOut}, '-=0.5')
$nav.fadeAnim = new TimelineMax({paused:true})
  .to($nav.el, 0.5, {css:{'height': '100%'}, ease:Power2.easeInOut})
  .to($nav.el, 0.5, {css:{'background-color': 'rgba(0, 0, 0, 0.75)'}, ease:Power2.easeInOut}, '-=0.5')
  .set('.nav__items', {css:{'display': 'block'}}, '-=0.25')
  .staggerFromTo('.nav__item', 0.5, {autoAlpha: 0}, {autoAlpha: 1, ease: Power2.easeInOut, stagger: {amount: 0.25}},0 , '-=0.25')
  .staggerFromTo('.nav__item', 0.5, {x:40}, {x:0, ease: Power2.easeOut, stagger: {amount: 0.25}}, 0, '-=0.75')

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
  let stateInterval = 1000,
      state = true;

  $nav.trigger.on('click', function() {
    if(state == true) {
      state = false;
      setTimeout(function() {
        state = true;
      }, stateInterval)

      if($nav.state == false) {
        $nav.open();
      } else {
        $nav.close();
      }
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

function main() {
  //parralax
  if($('html').hasClass('desktop')) {
    let $scene = $('.scene');
    $scene.each(function() {
      let parallaxInstance = new Parallax(this, {
        limitY: '0',
        limitX: '100'
      });
    })
  }

  let $slideBtn = $('.home__nav-item'),
      $nav = $('.home__nav'),
      $slide = $('.home-slide'),
      current,
      old = 0;

  $slideBtn.on('mouseenter', function() {
    current = $(this).index() + 1;
    let animation = new TimelineMax()
      .to($slide.eq(old), 0.5, {autoAlpha:0, ease:Power2.easeOut})
      .to($slide.eq(current), 0.5, {autoAlpha:1, ease:Power2.easeOut}, '-=0.5')
      .to($slide.eq(old).find('.scene'), 0.5, {scale:1.05, ease:Power2.easeIn}, '-=0.5')
      .fromTo($slide.eq(current).find('.scene'), 0.5, {scale:1.05}, {scale:1, ease:Power2.easeOut}, '-=0.5')
    old=current;
    })
  $nav.on('mouseleave', function() {
    let animation = new TimelineMax()
    .to($slide.eq(old), 0.5, {autoAlpha:0, ease:Power2.easeOut})
    .to($slide.eq(0), 0.5, {autoAlpha:1, ease:Power2.easeOut}, '-=0.5')
    .to($slide.eq(old).find('.scene'), 0.5, {scale:1.05, ease:Power2.easeIn}, '-=0.5')
    .fromTo($slide.eq(0).find('.scene'), 0.5, {scale:1.05}, {scale:1, ease:Power2.easeOut}, '-=0.5')
    old=0;
  })
}