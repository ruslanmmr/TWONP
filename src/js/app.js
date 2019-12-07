window.$ = window.jQuery = require('jquery');

import device from 'current-device';
import Scrollbar from 'smooth-scrollbar';
import Hammer from 'hammerjs';
import { gsap } from "gsap";
import slick from "slick-carousel";
import autosize from "autosize";
import Parallax from 'parallax-js';


$(document).ready(function() {
  elemsAnims();
  main();
  siteNavEvents();
  inputs();
  select();



  scrollArea.init({onComplete:function(){$nav.init();}});

  $subNav.update();
  $popup.init();
  $checkbox.init();

  if($slider.el.length>0) {
    $slider.init();
  }
  if($contactForm.$element.length>0) {
    $contactForm.init();
  }
  
  $slide.change($slide.current, {
    onComplete: function() {
      $slide.updateAnimations();
      $slide.to($slide.current);
      if($('.custom-map').length>0) {
        map.init();
      }
    }
  });
})

window.addEventListener('load', 
    function() { 
      resizeElems();
}, false);

$(window).resize(function () {
  resizeElems();
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
//
let $checkbox = {
  element: $('.checkbox'),
  init: function() {
    $(document).on('click', '.checkbox', function() {
      $checkbox.check();
    })
  },
  check: function() {
    $checkbox.element.each(function() {
      if($(this).find('input').prop('checked') || $('#' + $(this).attr('for')).prop('checked')) {
        $(this).addClass('checked');
        if($(this).hasClass('toggle-checkbox')) {
          $(this).parents('form').find('.toggle-item').addClass('active');
        }
      } else {
        $(this).removeClass('checked');
        if($(this).hasClass('toggle-checkbox')) {
          $(this).parents('form').find('.toggle-item').removeClass('active');
        }
      }
    })
  }
}
let scrollArea = {
  elms: document.querySelectorAll('.scroll-container'),
  init: function(callbacks) {
    for (let elm of this.elms) {
      let scroll = Scrollbar.init(elm, {
        damping: 0.1,
        alwaysShowTracks: true
      });
      setInterval(function() {
        scroll.update();
      }, 500)
    }
    //callback
    if (typeof callbacks === 'object') {
      callbacks.onComplete();
    }
  }
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
  controlPlus: $('.custom-map-plus'),
  controlMinus: $('.custom-map-minus'),
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
    map.lines.css('stroke-width', `${2/map.zoom}px`)

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
    let pan = new Hammer.Pan();
    pan.set({ threshold: 1 });
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
    $legendTrigger.on('mouseenter mouseleave touchstart touchend', function(event) {
      if((event.type=='mouseenter' && $('html').hasClass('desktop')) || event.type=='touchstart') {
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
      } else if((event.type=='mouseleave' && $('html').hasClass('desktop')) || event.type=='touchend') {
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
          $('.map-section__description, .map-section__legend').addClass('active');
        }
      }
    });
    //close
    $('.map-popup .popup-close').on('click', function(event) {
      event.preventDefault();
      if(map.available==true && popupAvailable==true) {
        popupAvailable = false;
        map.trigger.removeClass('active').removeClass('dark').removeClass('is');
        map.lines.removeClass('active');
        $('.map-section__description, .map-section__legend').removeClass('active');
        newAnimation.reverse();
        newAnimation.eventCallback("onReverseComplete", function() {
          oldAnimation = undefined;
          popupAvailable = true;
        })
      }
    })
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
    if($slide.current.hasClass('js-nav-hidden') || $window.width()<=1024) {
      $nav.hideAnim.reverse(0);
    }
  },
  close: function() {
    $nav.fadeAnim.reverse();
    $nav.triggerAnim.reverse();
    setTimeout(function() {
      $('html').removeClass('navInAnimation');
      if($slide.current.hasClass('js-nav-hidden') || $window.width()<=1024) {
        $nav.hideAnim.play();
      }
    }, 500)
    $nav.fadeAnim.eventCallback("onReverseComplete", function(){
      $('html').removeClass('navOpened');
      $nav.state = false;
    })
  },
  init: function() {
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
      .fromTo('.nav .contacts-socials li', {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.5, stagger:{amount: 0.25}}, '-=0.75')
      .fromTo('.nav .contacts-socials li', {y:40}, {y:0, ease:'power2.out', duration:0.5, stagger:{amount:0.25}}, '-=0.75')
      .set('.nav .scrollbar-track', {autoAlpha:1})
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
    if($window.width()<=1024) {
      $nav.hideAnim.play(0.5);
    }
    //
    $(window).resize(function () {
      if($window.width()<=1024 && $nav.state == false && $nav.hideAnim.progress()==0) {
        $nav.hideAnim.play(0.5);
      } else if($window.width()>1024 && $nav.state == false && $nav.hideAnim.progress()==1 && !$slide.current.hasClass('js-nav-hidden')) {
        $nav.hideAnim.reverse();
      }
    })
  }
}
let $subNav = {
  elm: $('.sub-nav'),
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
      .set($subNav.elm, {autoAlpha:1})
      .fromTo($subNav.items, {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.4, stagger:{amount: 0.1, from:'end'}})
      .fromTo($subNav.items, {x:-100}, {x:0, ease:'power2.out', duration:0.4, stagger:{amount:0.1, from:'end'}}, '-=0.5')
      
  }
}
let $slide = {
  animationProgress: false,
  elm: $('.section-slide'),
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
    resizeElems();

    $('[data-slide]').removeClass('active');
    $(`[data-slide='${newSlide.index()}']`).addClass('active');
    //
    if(this.current.hasClass('js-subnav-hidden') || ( this.current.hasClass('map-section') && $window.width()<=992 ) ) {
      $subNav.hide();
    } else {
      $subNav.fade()
    }
    //
    if($window.width()>1024) {
      if($nav.state == false && newSlide.hasClass('js-nav-hidden')) {
        $nav.hideAnim.play()
      } else if($nav.state == false) {
        $nav.hideAnim.reverse()
      }
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
    if($slide.current.hasClass('js-pagination-dark') && $window.width()>768) {
      this.el.addClass('dark')
    } else {
      this.el.removeClass('dark');
    }
    
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
let $slider = {
  el: $('.fuel-slider .slider'),
  slide: $('.fuel-slide'),
  pag: $('.fuel-slider-pagination__item'),
  scroll: false,
  init: function() {
    let $select = $('.opt-main-select select'),
        flag=true;

    $slider.index = $select.val();
  
    //slick hack
    $slider.el.on('init', function(event, slick, direction){
      let count = $slider.el.find('.slick-slide').not('.slick-cloned').length,
          last_slides = count-4;
          if(last_slides==0) {
            last_slides = 2;
          } else if(last_slides<0) {
            last_slides = 1;
          }
      for(let i=0;i<last_slides;i++) {
        $slider.el.find('.slick-cloned:last-child').remove();
      }
    });
    //добавить индексы на слайды
    $slider.slide.each(function(index) {
      $(this).attr('data-index', index);
    })
    //описание
    $slideInfo.el.eq($slider.index).addClass('active');
    //пагинация
    $slider.pag.eq($slider.index).addClass('active');
    $slider.pag.on('click', function() {
      if(flag==true) {
        flag=false;
        $slider.index = $(this).index();
        $select.val($slider.index).trigger('change');
      }
    })
    //события изменения селекта
    $select.on('change', function() {
      $slider.index = $(this).val();
      $select.val($slider.index);
      $select.niceSelect('update');
      $slider.pag.removeClass('active');
      $slider.pag.eq($slider.index).addClass('active');
      $slideInfo.el.removeClass('active');
      $slideInfo.el.eq($slider.index).addClass('active');
      $slider.el.slick('slickGoTo', $slider.index);
    })
    //события когда слайдер изменился
    $slider.el.on('swipe', function(){
      $slider.scroll=true;
    })
    $slider.el.on('afterChange', function(event, slick, direction){
      if($slider.scroll==true) {
        $slider.index = $(this).find('.slick-center').not('.slick-cloned').data('slick-index');
        $select.val($slider.index).trigger('change');
      }
      $slider.scroll=false;
      flag=true;
    });
    //события клика по неактивному слайду
    $slider.slide.find('.fuel-slide__container').on('click', function() {
      if(flag==true) {
        flag=false;
        let index = $(this).parent().data('slick-index');
        $slider.el.slick('slickGoTo', index);
        $slider.index = $(this).parent().attr('data-index');
        $select.val($slider.index).trigger('change');
      }
    })
    //инициализация слайдера
    $slider.el.slick({
      rows: 0,
      slidesToShow: 1,
      centerMode: true,
      centerPadding: '0',
      arrows: false,
      touchThreshold: 10
    });
  }
}
let $slideInfo = {
  el: $('.opt-info-item')
}
let $popup = {
  element: $('.popup'),
  $open: $('[data-popup]'),
  $close: $('[data-close]'),
  visible: false,
  init: function() {
    $popup.$open.on('click', function() {
      $popup.current = $($(this).data('popup'));
      $popup.open();
    })
    $popup.$close.on('click', function() {
      $popup.close();
    })
  },
  open: function() {
    $popup.animation = gsap.timeline()
      .to($popup.current, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
      .fromTo($popup.current.find('.popup__container'), {y:30}, {duration:0.5, y:0, ease:'power2.out'}, '-=0.5')
      .to($popup.current.find('.scrollbar-track-y'), {autoAlpha:1, duration:0})
  },
  close: function() {
    $popup.animation.reverse();
  }
}
let $contactForm = {
  $open: $('.contact-open-btn'),
  $close: $('.contact-close-btn'),
  $element: $('.contacts__bottom'),
  inAnim: false,
  init: function() {
    $contactForm.animation = gsap.timeline({paused:true,
      onStart: function() {
        $contactForm.inAnim=true;
      },
      onComplete: function() {
        $contactForm.inAnim=false;
      },
      onReverseComplete: function() {
        $contactForm.inAnim=false;
      }
    })
      .to($contactForm.$element, {duration:0.5, autoAlpha:0, yPercent:100, ease:'power2.in'})

    $contactForm.$open.on('click', function() {
      if($contactForm.inAnim==false) {
        $contactForm.animation.reverse();
      }
    })
    $contactForm.$close.on('click', function() {
      if($contactForm.inAnim==false) {
        $contactForm.animation.play();
      }
    })
    if($page.width()<=576) {
      $contactForm.animation.play();
    }
    $(window).resize(function() {
      if($page.width()<=576 && $contactForm.animation.progress()==0) {
        $contactForm.animation.play();
      } else if($contactForm.animation.progress()==1) {
        $contactForm.animation.reverse();
      }
    })
  }
}

//functions
function elemsAnims() {
  $(document).on('mouseenter mouseleave touchstart touchend', '.js-animated', function(event) {
    let $target = $(this);

    if(event.type=='touchstart' && !$('html').hasClass('desktop')) {
      $target.addClass('touch');
    } else if(event.type=='mouseenter' && $('html').hasClass('desktop')) {
      $target.addClass('hover');
    } else {
      $target.removeClass('touch');
      $target.removeClass('hover');
    }
  })
}
//
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

    let $slideBtn = $('.home__nav-item'),
      $nav = $('.home__nav'),
      $slide = $('.home-slide'),
      current,
      old = 0;

  $slideBtn.on('mouseenter', function() {
    if(!$slide.animationProgress) {
      current = $(this).index() + 1;
      let animation = gsap.timeline()
        .to($slide.eq(old), {duration:0.5, autoAlpha:0, ease:'power2.out'})
        .to($slide.eq(current), {duration:0.5, autoAlpha:1, ease:'power2.out'}, '-=0.5')
        .fromTo($slide.eq(old).find('.scene'), {scale:1}, {immediateRender:false, duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
        .fromTo($slide.eq(current).find('.scene'), {scale:1.05}, {immediateRender:false, duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
      old=current;
    }
  })
  $nav.on('mouseleave', function() {
    if(!$slide.animationProgress) {
      let animation = gsap.timeline()
      .to($slide.eq(old), {duration:0.5, autoAlpha:0, ease:'power2.out'})
      .to($slide.eq(0), {duration:0.5, autoAlpha:1, ease:'power2.out'}, '-=0.5')
      .to($slide.eq(old).find('.scene'), {duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
      .fromTo($slide.eq(0).find('.scene'), {scale:1.05}, {duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
      old=0;
    }
  })

  }
}
//
function resizeElems() {
  let headerH = $('.header').outerHeight(),
      bottomH = $('.section__bottom').outerHeight(),
      pageH = $('.page-wrapper').outerHeight();
  function contentResize() {
    $slide.elm.each(function() {
      if($(this).find('.section__bottom').length>0) {
        let height = $(this).outerHeight() - $(this).find('.section__bottom').outerHeight();
        $(this).find('.section__content').css('height', height);
        if($window.width()<=768) {
          $(this).find('.js-mobile-auto-size').css('height', height);
        } else {
          $(this).find('.js-mobile-auto-size').css('height', '');
        }
      }
    })
  }
  function paginationResize() {
    if($window.width()>768) {
      $('.pagination').css({'height': pageH-bottomH-headerH, 'top':headerH})
    } else {
      $('.pagination').css({'height':'', 'top':''})
    }
  }
  function navResize() {
    if($window.width()>1024 && $nav.state==false) {
      $nav.el.css('height', bottomH)
    } else if($nav.state==false) {
      $nav.el.css('height', '100%')
    }
  }
  function textareaSize() {
    let parent = $('.input-size-parent'),
        max = parent.height() - 17;
    parent.find('.scroll-container').css('max-height', max)
  }
  contentResize();
  navResize();
  textareaSize();
  paginationResize();
}
//
function siteNavEvents() {
  //события скролла
  $(window).on('wheel', function(event){
    if($(event.target).closest('.scroll-container').find('.scrollbar-track:visible').length==0 && $(event.target).closest('.popup').length==0) {
      if(!$slide.animationProgress) {
        if(event.originalEvent.deltaY>0 && $slide.current.index()+1 < $slide.count) {
          $slide.toNext();
        } else if(event.originalEvent.deltaY<0 && $slide.current.index()>0) {
          $slide.toPrev();
        }
      }
    }
  });
  //swipe
  let touchEvents = new Hammer.Manager(document.querySelector('.page-wrapper'));
  var swipe = new Hammer.Swipe();
  touchEvents.add(swipe);

  //события свайпов
  touchEvents.on("swipeleft swiperight swipeup swipedown", function(event) {
    if($(event.target).closest('.scroll-container').find('.scrollbar-track:visible').length==0 && $(event.target).closest('.custom-map').length==0) {
      if(!$slide.animationProgress) {
        if((event.type=='swipeup' || (event.type=='swipeleft' && $(event.target).closest('.slider').length==0)) && $slide.current.index()+1 < $slide.count) {
          $slide.toNext();
        } else if((event.type=='swipedown' || (event.type=='swiperight' && $(event.target).closest('.slider').length==0)) && $slide.current.index()>0) {
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
//
function inputs() {
  autosize($('textarea'));
  $(document).on('focusin focusout', 'input, textarea', function(event) {
    if(event.type=='focusin') {
      $(event.target).parents('.input').addClass('focus')
    } else {
      if($(event.target).val()=='') {
        $(event.target).parents('.input').removeClass('focus')
      }
    }
  })
}
//select
(function($) {

  $.fn.niceSelect = function(method) {
    
    // Methods
    if (typeof method == 'string') {      
      if (method == 'update') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');
          var open = $dropdown.hasClass('open');
          
          if ($dropdown.length) {
            $dropdown.remove();
            create_nice_select($select);
            
            if (open) {
              $select.next().trigger('click');
            }
          }
        });
      } else if (method == 'destroy') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');
          
          if ($dropdown.length) {
            $dropdown.remove();
            $select.css('display', '');
          }
        });
        if ($('.nice-select').length == 0) {
          $(document).off('.nice_select');
        }
      }
      return this;
    }
      
    // Hide native select
    this.hide();
    
    // Create custom markup
    this.each(function() {
      var $select = $(this);
      
      if (!$select.next().hasClass('nice-select')) {
        create_nice_select($select);
      }
    });
    
    function create_nice_select($select) {
      $select.after($('<div></div>')
        .addClass('nice-select')
        .addClass($select.attr('class') || '')
        .addClass($select.attr('disabled') ? 'disabled' : '')
        .attr('tabindex', $select.attr('disabled') ? null : '0')
        .html(`<span class="current js-animated"></span><svg class="icon"><use xlink:href="${$select.data('icon')}"></use></svg><ul class="nice-select__list"></ul>`)
      );
        
      var $dropdown = $select.next();
      var $options = $select.find('option');
      var $selected = $select.find('option:selected');
      
      $dropdown.find('.current').html($selected.data('display') || $selected.text());
      $options.each(function(i) {
        var $option = $(this);
        var display = $option.data('display');

        $dropdown.find('ul').append($('<li></li>')
          .attr('data-value', $option.val())
          .attr('data-display', (display || null))
          .addClass('option' +
            ($option.is(':selected') ? ' selected' : '') +
            ($option.is(':disabled') ? ' disabled' : ''))
          .html($option.text())
          .addClass('js-animated')
        );
      });
    }
    
    /* Event listeners */
    
    // Unbind existing events in case that the plugin has been initialized before
    $(document).off('.nice_select');
    
    // Open/close
    $(document).on('click.nice_select', '.nice-select', function(event) {
      var $dropdown = $(this);
      
      $('.nice-select').not($dropdown).removeClass('open');
      $dropdown.toggleClass('open');
      
      if ($dropdown.hasClass('open')) {
        $dropdown.find('.option');  
        $dropdown.find('.focus').removeClass('focus');
        $dropdown.find('.selected').addClass('focus');
      } else {
        $dropdown.focus();
      }
    });
    
    // Close when clicking outside
    $(document).on('click.nice_select', function(event) {
      if ($(event.target).closest('.nice-select').length === 0) {
        $('.nice-select').removeClass('open').find('.option');  
      }
    });
    // Option click
    $(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function(event) {
      var $option = $(this);
      var $dropdown = $option.closest('.nice-select');
      
      $dropdown.find('.selected').removeClass('selected');
      $option.addClass('selected');
      
      var text = $option.data('display') || $option.text();
      $dropdown.find('.current').text(text);
      
      $dropdown.prev('select').val($option.data('value')).trigger('change');
    });
    return this;
  };

}(jQuery));
//
function select() {
  $('.select select').niceSelect();
}