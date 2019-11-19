import device from 'current-device';
import Scrollbar from 'smooth-scrollbar';
import Hammer from 'hammerjs';
import { gsap } from "gsap";
import Lazy from "jquery-lazy";
import Parallax from 'parallax-js'

$(document).ready(function() {
  //lazy();
  elemsAnims();
  main();
  siteNavEvents();


  $subNav.update();
  $nav.update()
  $slide.change($slide.current, {
    onComplete: function() {
      $slide.updateAnimations();
    }
  });
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

let $nav = {
  trigger: $('.nav-btn'),
  el: $('.nav'),
  state: false,
  interval: 1000,
  flag: true,
  triggerAnim: '',
  fadeAnim: '',
  hideAnim: '',
  open: function() {
    $nav.state = true;
    $nav.fadeAnim.play();
    $nav.triggerAnim.play();
    $('html').addClass('navOpened').addClass('navInAnimation');
    if($slide.current.hasClass('js-nav-hidden')) {
      $nav.hideAnim.reverse();
    }
  },
  close: function() {
    $nav.state = false;
    $nav.fadeAnim.reverse();
    $nav.triggerAnim.reverse();
    setTimeout(function() {
      $('html').removeClass('navInAnimation');
      if($slide.current.hasClass('js-nav-hidden')) {
        $nav.hideAnim.play();
      }
    }, 500)
    $nav.fadeAnim.eventCallback("onReverseComplete", function(){
      $('html').removeClass('navOpened');
    })
  },
  update: function() {
    $nav.triggerAnim = gsap.timeline({paused:true})
      .to($nav.trigger.find('span:first-child'), {duration:0.5, y:8, ease:'power2.in'})
      .to($nav.trigger.find('span:last-child'), {duration:0.5, y:-8, ease:'power2.in'}, '-=0.5')
      .set($nav.trigger.find('span:nth-child(2)'), {autoAlpha:0})
      .to($nav.trigger.find('span:first-child'), {duration:0.5, rotation:45, ease:'power2.out'})
      .to($nav.trigger.find('span:last-child'), 0.5, {duration:0.5, rotation:135, ease:'power2.out'}, '-=0.5')
    $nav.fadeAnim = gsap.timeline({paused:true})
      .to($nav.el, {duration:0.5, height:'100%', ease:'power2.inOut'})
      .to($nav.el, {duration:0.5, backgroundColor:'rgba(0, 0, 0, 0.75)', ease:'power2.inOut'}, '-=0.5')
      .set('.nav__items', {display:'block'}, '-=0.25')
      .fromTo('.nav__item', {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.5, stagger:{amount: 0.25}}, '-=0.25')
      .fromTo('.nav__item', {x:40}, {x:0, ease:'power2.out', duration:0.5, stagger:{amount:0.25}}, '-=0.75')
    $nav.hideAnim = gsap.timeline({paused:true})
      .to($nav.el, {autoAlpha:0, duration:0.5, yPercent: 100, ease:'power2.in'})
    //
    $nav.trigger.on('click', function() {
      if($nav.flag == true) {
        $nav.flag = false;
        setTimeout(function() {
          $nav.flag = true;
        }, $nav.interval)
  
        if($nav.state == false) {
          $nav.open();
        } else {
          $nav.close();
        }
      }
    })
    //
  }
}
let $subNav = {
  items: $('.sub-nav__item'),
  state: false,
  fadeAnim: '',
  fade: function() {
    if(!$subNav.state) {
      $subNav.fadeAnim.play();
      $subNav.state = true;
    }
  },
  hide: function() {
    if($subNav.state==true) {
      $subNav.fadeAnim.reverse();
      $subNav.state = false;
    }
  },
  update: function() {
    $subNav.fadeAnim = gsap.timeline({paused:true})
      .fromTo($subNav.items, {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.4, stagger:{amount: 0.1, from:'end'}})
      .fromTo($subNav.items, {x:-100}, {x:0, ease:'power2.out', duration:0.4, stagger:{amount:0.1, from:'end'}}, '-=0.5')
      
  }
}
let $slide = {
  animationProgress: false,
  count: $('.section-slide').length,
  current: $('.section-slide.active'),
  next: '',
  prev: '',
  forwardAnimation: '',
  backAnimation: '',
  exitAnimation: '',
  toNext: function() {
    $slide.animationProgress=true;
    this.exitAnimation.play();
    this.forwardAnimation.play();
    $slide.change($slide.next);
  },
  toPrev: function() {
    $slide.animationProgress=true;
    this.exitAnimation.play();
    this.backAnimation.play();
    $slide.change($slide.prev);
  },
  to: function(newSlide) {
    $slide.animationProgress=true;
    this.exitAnimation.play();
    $nav.close();
    $slide.change(newSlide);
    //animation
    let anim = gsap.timeline({onComplete:function(){$slide.updateAnimations()}})
      .to(newSlide, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
      .fromTo(newSlide.find('.section__display'), {scale:1.05}, {immediateRender:false, duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
  },
  change: function(newSlide, callbacks) {
    this.current.removeClass('active');
    newSlide.addClass('active');
    this.current = newSlide;
    this.next = this.current.next();
    this.prev = this.current.prev();

    $pagination.update();

    $('[data-slide]').removeClass('active');
    $(`[data-slide='${newSlide.index()}']`).addClass('active');
    newSlide.hasClass('js-subnav-true') ? $subNav.fade() : $subNav.hide();
    newSlide.hasClass('js-pagination-dark') ? $pagination.el.addClass('dark') : $pagination.el.removeClass('dark');
    //
    if($nav.state == false && newSlide.hasClass('js-nav-hidden')) {
      $nav.hideAnim.play()
    } else if($nav.state == false) {
      $nav.hideAnim.reverse()
    }
    //callback
    if (typeof callbacks === 'object') {
      callbacks.onComplete();
    }
  },
  updateAnimations: function(callbacks) {
    
    //exit anim
    $slide.exitAnimation = gsap.timeline({paused:true})
      .to($slide.current, {duration:0.5, autoAlpha:0, ease:'power2.in'})
      .fromTo($slide.current.find('.section__display'), {scale:1}, {duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
    
    //forward anim
    if($slide.next.length>0) {
      $slide.forwardAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
        .to($slide.next, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
        .fromTo($slide.next.find('.section__display'), {yPercent:100, scale:1.05}, {immediateRender:false, duration:0.5, yPercent:0, scale:1, ease:'power2.out'}, '-=0.5')
    }

    //back anim
    if($slide.prev.length>0) {
      $slide.backAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
        .to($slide.prev, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
        .fromTo($slide.prev.find('.section__display'), {yPercent:-100, scale:1.05}, {immediateRender:false, duration:0.5, scale:1, yPercent:0, ease:'power2.out'}, '-=0.5')
    }

    $slide.animationProgress=false;
  }
}

let $pagination = {
  el: $('.pagination'),
  prevNum: $('.pagination__num.pagination-prev'),
  nextNum: $('.pagination__num.pagination-next'),
  prev: $('.pagination-prev'),
  next: $('.pagination-next'),
  update: function() {
    if($slide.next.length>0) {
      this.nextNum.text('0' + ($slide.next.index()+1));
      this.next.removeClass('hidden');
    } else {
      this.next.addClass('hidden');
    }
    if($slide.prev.length>0) {
      this.prevNum.text('0' + ($slide.prev.index()+1));
      this.prev.removeClass('hidden');
    } else {
      this.prev.addClass('hidden');
    }
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

function elemsAnims() {
  $(document).on('mouseenter mouseleave touchstart touchend', '.js-animated', function(event) {
    let $target = $(this);

    if(event.type=='touchstart') {
      $target.addClass('touch');
    } else if(event.type=='mouseenter') {
      $target.addClass('hover');
    }

    if(event.type=='mouseleave' || event.type=='touchend') {
      $target.removeClass('touch');
      $target.removeClass('hover');
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
    let animation = gsap.timeline()
      .to($slide.eq(old), {duration:0.5, autoAlpha:0, ease:'power2.out'})
      .to($slide.eq(current), {duration:0.5, autoAlpha:1, ease:'power2.out'}, '-=0.5')
      .fromTo($slide.eq(old).find('.scene'), {scale:1}, {immediateRender:false, duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
      .fromTo($slide.eq(current).find('.scene'), {scale:1.05}, {immediateRender:false, duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
    old=current;
    })
  $nav.on('mouseleave', function() {
    let animation = gsap.timeline()
    .to($slide.eq(old), {duration:0.5, autoAlpha:0, ease:'power2.out'})
    .to($slide.eq(0), {duration:0.5, autoAlpha:1, ease:'power2.out'}, '-=0.5')
    .to($slide.eq(old).find('.scene'), {duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
    .fromTo($slide.eq(0).find('.scene'), {scale:1.05}, {duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
    old=0;
  })
}


function siteNavEvents() {

  function ff() {
    /* let $link,
  Event,
  $touchArea = document.querySelector('.page-wrapper'),
  cursorPos = {
    current: {
      x:0,
      y:0
    },
    start: {
      x:0,
      y:0,
      update: function(callback, func) {
        this.x = cursorPos.current.x;
        this.y = cursorPos.current.y;
        if(callback=='onComplete') {
          func();
        }
      }
    }
  },
  swipeLength = 150,
  maxTime = 0.5,
  touched = false,
  direction = false,
  swipeForward = false,
  swipeBack  = false;

  let touchEvents = new Hammer.Manager($touchArea);
  let swipe = new Hammer.Swipe();
  let pan = new Hammer.Pan().set({ threshold: 1 });
  touchEvents.add(swipe);
  touchEvents.add(pan); */

  /* //события свайпов
  touchEvents.on("swipeup swipedown panend panstart panup pandown", function(event) {
    Event = event.type;
    cursorPos.current.y = event.center.y;
    
    if(!enterAnimationProgress && !exitAnimationProgress && !$barbaContainer.hasAttr('data-project')) {
      //если поставили палец
      if(Event=='panstart') {
        touched = true;
        cursorPos.start.update();
      } 
      //подняли палец с дисплея
      else if(Event=='panend') {
        touched = false;
        direction = false;
        animationTime = 0;
        animationStartLoading.reverse();
        if(swipeForward == true) {
          forwardExitAnimation.reverse();
        } else if(swipeBack == true) {
          backExitAnimation.reverse();
          if(pageId=='categories') {
            logoHideAnimation.reverse();
          }
        }
        if(pageId=='projectPreview') {
          labelHideAnimation.reverse();
        }
        swipeForward = false;
        swipeBack = false;
      }
      //если длина свайпа достаточная
      else if(animationTime>=maxTime) {
        touched = false;
        direction = false;
        if(swipeForward == true) {
          animationDirection = 'forward';
        } else if(swipeBack == true) {
          animationDirection = 'back';
        }
        if(pageId=='projectPreview') {
          labelHideAnimation.play(animationTime);
          labelHideAnimation.eventCallback("onComplete", function(){ 
            labelVisible=false;
          });
        }
        swipeForward = false;
        swipeBack = false;
      }
      //процесс ерзанья пальцами
      else if(touched==true) {
        let pos;
        if(direction==false) {
          if(Event=='panup' || Event=='pandown') {
            direction = 'vertical';
          } else if(Event=='panright' || Event=='panleft') {
            direction = 'horizontal';
          }
        }

        if(direction == 'vertical') {
          pos = event.center.y - cursorPos.start.y;
        } else if(direction == 'horizontal') {
          pos = event.center.x - cursorPos.start.x;
        }

        //управление временем анимации
        if(Event=='panup' || Event=='panleft') {
          if(swipeBack == false) {
            swipeForward = true;
            if(pageOrder == pagesCount-1) {
              animationTime = (-pos/(swipeLength-pos))*maxTime;
            } else {
              animationTime = (-pos/swipeLength)*maxTime;
            }
          } else {
            if(pageOrder == 0) {
              animationTime = (pos/(swipeLength+pos))*maxTime;
            } else {
              animationTime = (pos/swipeLength)*maxTime;
            }
            if(animationTime<=0) {
              swipeBack = false;
              animationTime = 0;
            }
          }
        } 
        else {
          if(swipeForward == false) {
            swipeBack = true;
            if(pageOrder == 0) {
              animationTime = (pos/(swipeLength+pos))*maxTime;
            } else {
              animationTime = (pos/swipeLength)*maxTime;
            }
          } else {
            if(pageOrder == pagesCount-1) {
              animationTime = (-pos/(swipeLength-pos))*maxTime;
            } else {
              animationTime = (-pos/swipeLength)*maxTime;
            }
            if(animationTime<=0) {
              swipeForward = false;
            }
          }
        }

        //последняя корректировка
        if(animationTime>maxTime) {
          animationTime = maxTime;
        } else if(animationTime==-0 || animationTime<0) {
          animationTime = 0;
        }

        if(swipeForward == true) {
          forwardExitAnimation.play(animationTime);
          forwardExitAnimation.stop();
        } else if(swipeBack == true) {
          backExitAnimation.play(animationTime);
          backExitAnimation.stop();
          if(pageId=='categories') {
            logoHideAnimation.play(animationTime);
            logoHideAnimation.stop();
          }
        }

        if(!(pageOrder==0 && swipeBack==true) && !(pageOrder == pagesCount-1 && swipeForward==true)) {
          if(pageId=='projectPreview') {
            labelHideAnimation.play(animationTime);
            labelHideAnimation.stop();
          }
          animationStartLoading.play(animationTime);
          animationStartLoading.stop();
        }
      }
    }
    eventChecking();
  }); */
  }
  //события скролла
  $(window).on('wheel', function(event){
    if(!$slide.animationProgress) {
      if(event.originalEvent.deltaY>0 && $slide.current.index()+1 < $slide.count) {
        $slide.toNext();
      } else if(event.originalEvent.deltaY<0 && $slide.current.index()>0) {
        $slide.toPrev();
      }
    }
  });

  $('[data-slide]').on('click', function(event) {
    event.preventDefault();
    if(!$slide.animationProgress) {
      if($(this).data('slide')=='next') {
        $slide.toNext();
      } else if($(this).data('slide')=='prev') {
        $slide.toPrev();
      } else {
        $slide.to($('.section-slide').eq($(this).data('slide')));
      }
    }
  })
}