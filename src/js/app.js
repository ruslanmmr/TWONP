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

  Scrollbar.initAll({
    damping: 0.1,
    alwaysShowTracks: true
  });

  $subNav.update();
  $nav.update()
  $slide.change($slide.current, {
    onComplete: function() {
      $slide.updateAnimations();
      $slide.to($slide.current);
      map.init();
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
      .fromTo(newSlide.find('.scene'), {scale:1.05}, {immediateRender:false, duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
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
    this.current.hasClass('js-subnav-true') ? $subNav.fade() : $subNav.hide();
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
      .fromTo($slide.current.find('.scene'), {scale:1}, {duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
      .to($slide.current.find('.scene'), {duration:0, scale:1})
      
    //forward anim
    if($slide.next.length>0) {
      $slide.forwardAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
        .to($slide.next, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
        .fromTo($slide.next.find('.section__display'), {yPercent:100}, {immediateRender:false, duration:0.5, yPercent:0, ease:'power2.out'}, '-=0.5')
    }

    //back anim
    if($slide.prev.length>0) {
      $slide.backAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
        .to($slide.prev, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
        .fromTo($slide.prev.find('.section__display'), {yPercent:-100}, {immediateRender:false, duration:0.5, yPercent:0, ease:'power2.out'}, '-=0.5')
    }

    $slide.animationProgress=false;
  }
}

let $pagination = {
  el: $('.pagination'),
  prev: $('.pagination-arrow_prev'),
  next: $('.pagination-arrow_next'),
  update: function() {

    $slide.current.hasClass('js-pagination-dark') ? this.el.addClass('dark') : this.el.removeClass('dark');
    
    if($slide.prev.length>0) {
      this.prev.find('span').text('0' + ($slide.prev.index()+1));
      this.prev.removeClass('hidden');
    } else {
      this.prev.addClass('hidden');
    }
    if($slide.next.length>0) {
      this.next.find('span').text('0' + ($slide.next.index()+1));
      this.next.removeClass('hidden');
    } else {
      this.next.addClass('hidden');
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
  //события скролла
  $(window).on('wheel', function(event){
    if($(event.target).parents('[data-scrollbar]').length==0 && !$(event.target).is('[data-scrollbar]')) {
      if(!$slide.animationProgress) {
        if(event.originalEvent.deltaY>0 && $slide.current.index()+1 < $slide.count) {
          $slide.toNext();
        } else if(event.originalEvent.deltaY<0 && $slide.current.index()>0) {
          $slide.toPrev();
        }
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

let map = {
  container: $('.custom-map__container'),
  inner: $('.custom-map__inner'),
  trigger: $('.map-trigger'),
  strokeElms: $('.custom-map .region, .custom-map .road'),
  lines: $('.custom-map .line'),
  itemsElls: $('.custom-map .item'),
  available: false,
  x: 0,
  y: 0,
  animation: '',
  interval: '',
  translateAnimation: '',
  innerT: '',
  innerR: '',
  innerB: '',
  innerL: '',
  controlPlus: $('.custom-map__plus'),
  controlMinus: $('.custom-map__minus'),
  zoomMax: 2,
  zoomGradations: 3,
  zoomPlus: function() {
    if(this.zoomGradation<this.zoomGradations) {
      this.zoomGradation++;
      this.zoom = 1 + ((this.zoomGradation-1)*map.zoomInterval);
      this.update('zoom+', false);
    }
  },
  zoomMinus: function() {
    if(this.zoomGradation>1) {
      this.zoomGradation--;
      this.zoom = 1 + ((this.zoomGradation-1) * map.zoomInterval);
      this.update('zoom-', false);
    }
  },
  checkBtns: function() {
    if(this.zoomGradation==this.zoomGradations) {
      this.controlPlus.addClass('disabled');
    } else {
      this.controlPlus.removeClass('disabled');
    }
    if(this.zoomGradation==1) {
      this.controlMinus.addClass('disabled');
    } else {
      this.controlMinus.removeClass('disabled');
    }
  },
  update: function(zoomDir) {
    this.available = false;
    this.checkBtns();


    if(zoomDir=='zoom-') {
      let y = Math.round(map.y + ( 
        (map.containerCenterY-map.mapCenterY) * 
        (map.zoomInterval * (1/(map.zoom+map.zoomInterval))) 
      ));
      let x = Math.round(map.x + ( 
        (map.containerCenterX-map.mapCenterX) * 
        (map.zoomInterval * (1/(map.zoom+map.zoomInterval))) 
      ));

      if(map.innerT>map.innerB) {
        let c = ((map.inner.height() * map.zoom - map.inner.height())/2);
        if(y-c>0) {
          map.y = c;
        } else {
          map.y = y;
        }
      } else {
        let c = Math.round(((map.inner.height() * (1+map.zoomInterval) - map.inner.height())/2));
        
        if(y-(c+map.innerB)>map.y) {
          map.y = y;
        } else {
          map.y = map.y + map.innerB + c;
        }

      }

      if(map.innerL>map.innerR) {
        let c = Math.round(((map.inner.height() * map.zoom - map.inner.height())/2));
        
        if(x-c>0) {
          map.x = c;
        } else {
          map.x = x;
        }
      } else {
        let c = Math.round(((map.inner.width() * (1+map.zoomInterval) - map.inner.width())/2));
        

        if(x-(c+map.innerR)>map.x) {
          map.x = x;
        } else {
          map.x = map.x + map.innerR + c;
        }
      }

    } else if(zoomDir=='zoom+') {

      map.y = Math.round(map.y - ( 
        (map.containerCenterY-map.mapCenterY) * 
        (map.zoomInterval * (1/(map.zoom-map.zoomInterval))) 
      ))

      map.x = Math.round(map.x - ( 
        (map.containerCenterX-map.mapCenterX) * 
        (map.zoomInterval * (1/(map.zoom-map.zoomInterval))) 
      ));

    }

    this.animation = gsap.timeline({
      onComplete: function() {
        map.zoomCurrent = map.zoom;
        map.checkInner({onComplete() {
          map.available = true;
        }})
        }
    }).to(map.inner,{duration:0.25, scale:map.zoom, x:map.x, y:map.y, ease:'power2.inOut'})
      .to(map.itemsElls,{duration:0.25, scale:1/map.zoom, ease:'power2.inOut'}, '-=0.25')
      
    

    map.strokeElms.css('stroke-width', `${1/map.zoom}px`)
    map.lines.css('stroke-width', `${3/map.zoom}px`)

  },
  checkInner: function(callbacks) {
    let mapTop = this.inner.offset().top,
        mapLeft = this.inner.offset().left,
        containerTop = this.container.offset().top,
        containerLeft = this.container.offset().left;

      this.mapHeight = this.inner.height() * this.zoomCurrent;
      this.mapWidth = this.inner.width() * this.zoomCurrent;
      this.containerHeight = this.container.height();
      this.containerWidth = this.container.width();

    this.containerCenterY = (containerTop + (this.containerHeight/2));
    this.mapCenterY = (mapTop + (this.mapHeight/2));
    this.containerCenterX = (containerLeft + (this.containerWidth/2));
    this.mapCenterX = (mapLeft + (this.mapWidth/2));

    this.innerT = Math.round(mapTop - containerTop);
    this.innerR = Math.round(-((mapLeft+this.mapWidth) - (containerLeft+this.containerWidth)));
    this.innerB = Math.round(-((mapTop+this.mapHeight) - (containerTop+this.containerHeight)));
    this.innerL = Math.round(mapLeft - containerLeft);

    //callback
    if (typeof callbacks === 'object') {
      callbacks.onComplete();
    }
    

  },
  init: function() {
    this.zoomInterval = (map.zoomMax-1)/(map.zoomGradations-1);
    this.zoom = 1;
    this.zoomCurrent = 1;
    this.zoomGradation = 1;
    
    this.controlPlus.on('click', function(e) {
      e.preventDefault();
      if(map.available==true) {
        map.zoomPlus();
      }
      
    })
    this.controlMinus.on('click', function(e) {
      e.preventDefault();
      if(map.available==true) { 
        map.zoomMinus();
      }
    })

    let area = new Hammer.Manager(map.container[0]);
    let swipe = new Hammer.Swipe();
    let pan = new Hammer.Pan();
    pan.set({ threshold: 1 });
    area.add(swipe);
    area.add(pan);

    let startX = 0,
        startY = 0,
        currentX,
        currentY,
        compensateX = 0,
        compensateY = 0,
        oldX = 0,
        oldY = 0;
  
    //события свайпов
    area.on("panend panstart panup pandown panleft panright", function(event) {
      let Event = event.type;

      if(map.available==true) {
        if(Event=='panstart') {
          startX = event.center.x;
          startY = event.center.y;
          oldX = map.x;
          oldY = map.y;
        } else if(Event=='panend') {
          map.x = currentX;
          map.y = currentY;
          compensateX = 0;
          compensateY = 0;
        } else if(Event=='panup' || Event=='panright' || Event=='pandown' || Event=='panleft') {

          currentX = map.x + event.center.x - startX + compensateX;
          currentY = map.y + event.center.y - startY + compensateY;

          map.checkInner({onComplete: function() {
  
            if(map.innerT>0 && currentY>oldY) {
              currentY = oldY;
              compensateY = currentY - map.y + startY - event.center.y;
            }
            if(map.innerB>0 && currentY<oldY) {
              currentY = oldY;
              compensateY = currentY - map.y + startY - event.center.y;
            }
            if(map.innerR>0 && currentX<oldX) {
              currentX = oldX;
              compensateX = currentX - map.x + startX - event.center.x;
            }
            if(map.innerL>0 && currentX>oldX) {
              currentX = oldX;
              compensateX = currentX - map.x + startX - event.center.x;
            }

            gsap.set(map.inner, {y:currentY, x:currentX})
            oldX = currentX;
            oldY = currentY;

          }})
        }
      } else {
        compensateY = startY - event.center.y;
        compensateX = startX - event.center.x;
      }
    });
    //условные обозначения
    let $legendTrigger = $('.map-section__legend-item').not($('[data-disabled]'));
    $legendTrigger.on('mouseenter mouseleave', function(event) {
      if(event.type=='mouseenter') {
        if($(this).is('[data-base]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-base],[data-base-station],[data-disabled]')).addClass('disabled');
        } else if($(this).is('[data-station]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-station], [data-base-station], [data-disabled]')).addClass('disabled');
        } else if($(this).is('[data-factory]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-factory], [data-disabled]')).addClass('disabled');
        }
      } else {
        $legendTrigger.removeClass('disabled');
        map.trigger.removeClass('disabled');
      }
    })

    this.checkBtns();
    this.popups();
    map.checkInner({onComplete() {
      map.available = true;
    }})
  },
  popups: function() {
    //всплывайки
    let newPopup,
        oldPopup,
        contentAnim,
        newAnimation,
        oldAnimation,
        data,
        popupAvailable = true;

    map.trigger.on('click', function(event) {
      event.preventDefault();
      if(map.available==true && popupAvailable==true) {
        popupAvailable = false;
        map.trigger.removeClass('active').removeClass('is');
        map.lines.removeClass('active');
        map.trigger.addClass('dark');
        $(this).removeClass('dark').addClass('active');
        //
        if($(this).is('[data-station]')) {
          newPopup = $(`.map-popup[data-station='${$(this).data('station')}']`);
        } else if($(this).is('[data-base-station]')) {
          newPopup = $(`.map-popup[data-base-station='${$(this).data('base-station')}']`);
          //lines
          $(`.custom-map .line[data-base='${$(this).data('base-station')}']`).addClass('active');
          //factory
          $('.map-trigger[data-factory]').removeClass('dark').addClass('is');;
        } else if($(this).is('[data-base]')) {
          newPopup = $(`.map-popup[data-base='${$(this).data('base')}']`);
          $('.map-trigger[data-factory]').removeClass('dark').addClass('is');
          //lines
          $(`.custom-map .line[data-base='${$(this).data('base')}']`).addClass('active');
        } else if($(this).is('[data-factory]')) {
          newPopup = $(`.map-popup[data-factory='${$(this).data('factory')}']`);
        }
        
        $('.map-popup').removeClass('active');
        newPopup.addClass('active');
        
        newAnimation = gsap.timeline({onComplete:function() {
          popupAvailable=true;
          oldPopup=newPopup;
          oldAnimation=newAnimation;
        }})
          .fromTo(newPopup, {yPercent:100, autoAlpha:0}, {duration:0.5, autoAlpha:1, yPercent:0, ease:'power2.out'})

        if(oldAnimation!==undefined) {
          oldAnimation.reverse();
        } else {
          contentAnim = gsap.timeline()
            .to('.map-section__description', {duration:0.5, autoAlpha:0, xPercent:-100, ease:'power2.in'})
        }
      }
    });
    //close
    $('.map-popup__close').on('click', function(event) {
      event.preventDefault();
      if(map.available==true && popupAvailable==true) {
        popupAvailable = false;
        map.trigger.removeClass('active').removeClass('dark').removeClass('is');
        map.lines.removeClass('active');
        newAnimation.reverse();
        contentAnim.reverse();
        newAnimation.eventCallback("onReverseComplete", function() {
          oldAnimation = undefined;
          popupAvailable = true;
        })
      }
    })
  }
}