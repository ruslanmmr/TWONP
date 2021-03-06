window.$ = window.jQuery = require('jquery');
import device from 'current-device';
import Scrollbar from 'smooth-scrollbar';
import Hammer from 'hammerjs';
import { gsap } from "gsap";
import slick from "slick-carousel";
import autosize from "autosize";
import Parallax from 'parallax-js';
import "inputmask/lib/extensions/inputmask.numeric.extensions";
import Inputmask from "inputmask/lib/extensions/inputmask.date.extensions";

$(document).ready(function() {
  $preloader.init();
  //work
  localStorage.setItem('slide', 1);

  elemsAnims();
  siteNavEvents();
  inputs();

  $select.init();
  $nav.init();
  $subNav.update();
  $popup.init();
  $checkbox.init();
  $mask.init();

  if($slider.el.length>0) {
    $slider.init();
    optinfo.init();
  }

  if($('.custom-map').length>0) {
    map.init();
  }
  if($('html').hasClass('desktop')) {
    parallax.init();
    if($('.js-tabs-true').length>0) {
      $tabs.init();
    }
  }

  if($contactForm.$element.length>0) {
    $contactForm.init();
  }

})


$(window).resize(function () {
  resizeElems();
})


const $window = {
  width: function() {
    return Math.max(window.innerWidth, document.documentElement.clientWidth);
  }
}
const $page = document.querySelector('.page-wrapper');



let $preloader = {
  background: document.querySelectorAll('.bg'),
  preloader: document.querySelector('.preloader'),
  item: document.querySelector('.preloader__item'),
  wrap: document.querySelector('.page-wrapper'),
  pageLoaded: false,
  imagesLoaded: false,
  init: function() {
    this.count = this.background.length;
    this.loaded = 0;
    window.onload = function() {
      $preloader.pageLoaded = true;
      //если картинок вообще нет
      if($preloader.count==0) {
        $preloader.loadFinished();
      }
    };
    //
    $preloader.preloader.style.cssText = 'visibility:visible;opacity:1';
    ///
    function loading() {
      if($preloader.loaded<$preloader.count) {
        let attr = $preloader.background[$preloader.loaded].getAttribute('data-image');
        $preloader.background[$preloader.loaded].style.backgroundImage = 'url("'+attr+'")';
        let clone = new Image();
        //
        function event() {
          setTimeout(function() {
            $preloader.loaded++;
            loading();
            $preloader.load();
          }, 50)
        }
        //
        clone.onload = function() {
          event();
        };
        clone.onerror = function() {
          event();
        };
        clone.src = attr;
      }
    }
    loading();
  },
  load: function() {
    let attr = -(100 - Math.round((100/(this.count+2))*(this.loaded)));
    $preloader.item.setAttribute('x', attr+'%');
    if(this.loaded == this.count) {
      $preloader.imagesLoaded = true;
    }
    if($preloader.imagesLoaded==true) {
      if($preloader.pageLoaded==true) {
        $preloader.loadFinished();
      } else {
        //отображение через 2 секунды 
        let int = setTimeout(function() {
          $preloader.pageLoaded=true;
          $preloader.loadFinished();
        },2000)
        //или по готовности
        window.onload = function() {
          if($preloader.pageLoaded==false) {
            clearInterval(int);
            $preloader.pageLoaded=true;
            $preloader.loadFinished();
          }
        }
      }
    }
  },
  loadFinished: function() {
    //собрать страницу и выставить отступы
    resizeElems();

    $slide.getFirstSlide({onComplete:function(){
      $slide.change($slide.current, {
        onComplete: function() {
          $slide.updateAnimations();
          $slide.to($slide.current);
        }
      });
    }})

    $preloader.item.setAttribute('x', '0%');

    setTimeout(function() {
      $preloader.preloader.style.cssText = 'visibility:hidden;opacity:0';
      $preloader.wrap.style.cssText = 'visibility:visible;opacity:1';
      setTimeout(function() {
        $preloader.wrap.style.cssText = 'transition:none;';
      }, 500)
    }, 200)
  }
}
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
let $scrollArea = {
  init: function(callbacks) {
    this.elms = document.querySelectorAll('.scroll-container');

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
  area: $('.area-block__item'),
  itemsElls: $('.custom-map .item'),
  available: false,
  animation: '',
  interval: '',
  translateAnimation: '',
  innerT: '',
  innerR: '',
  innerB: '',
  innerL: '',
  controlPlus: $('.custom-map-plus'),
  controlMinus: $('.custom-map-minus'),
  zoomMax: 3,
  zoomGradations: 4,
  animated: false,
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
    this.y = this.inner.offset().top - this.container.offset().top;
    this.x = this.inner.offset().left - this.container.offset().left;
    this.zoomInterval = (map.zoomMax-1)/(map.zoomGradations-1);
    this.zoom = 1;
    this.zoomCurrent = 1;
    this.zoomGradation = 1;

    map.inner.on('wheel', function(event){
      if(map.available==true && map.inner.hasClass('js-no-scroll')) {
        if(event.originalEvent.deltaY>0) {
          map.zoomMinus();
        } else if(event.originalEvent.deltaY<0) {
          map.zoomPlus();
        }
      }
    });
    
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

    let area = new Hammer.Manager(map.inner[0]);
    let pan = new Hammer.Pan();
    let pinch = new Hammer.Pinch();
    area.add(pinch);
    pan.set({ threshold: 1 });
    area.add(pan);

    let startX = 0,
        startY = 0,
        currentX,
        currentY,
        compensateX = 0,
        compensateY = 0,
        oldX = 0,
        oldY = 0,
        pinched=false;
  
    //события свайпов
    area.on("panend panstart panup pandown panleft panright pinchstart pinchend pinchin pinchout", function(event) {
      let Event = event.type;

      if(Event == 'pinchin' && map.available==true) {
        map.zoomMinus();
      } else if(Event =='pinchout' && map.available==true) {
        map.zoomPlus();
      } else if(Event == 'pinchend') {
        compensateX = 0;
        compensateY = 0;
      } else if(Event=='panstart') {
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
        if($(event.target).closest('.map-trigger').length==0) {

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
      }
    });
    //условные обозначения
    let $legendTrigger = $('.map-section__legend-item').not($('[data-disabled]'));
    $legendTrigger.on('mouseenter mouseleave touchstart touchend', function(event) {
      if((event.type=='mouseenter' && $('html').hasClass('desktop')) || event.type=='touchstart') {
        if($(this).is('[data-base]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-base]')).addClass('disabled');
          map.area.addClass('disabled');
        } else if($(this).is('[data-station]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-station]')).addClass('disabled');
          map.area.addClass('disabled');
        } else if($(this).is('[data-factory]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.not($('[data-factory]')).addClass('disabled');
          map.area.addClass('disabled');
        } else if($(this).is('[data-area]')) {
          $legendTrigger.not($(this)).addClass('disabled');
          map.trigger.addClass('disabled');
        }
      } else if((event.type=='mouseleave' && $('html').hasClass('desktop')) || event.type=='touchend') {
        $legendTrigger.removeClass('disabled');
        map.trigger.removeClass('disabled');
        map.area.removeClass('disabled');
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

    //точки
    map.trigger.on('click', function(event) {
      event.preventDefault();
      if(map.available==true && popupAvailable==true) {
        popupAvailable = false;
        map.trigger.removeClass('active').removeClass('is');
        map.lines.removeClass('active');
        map.trigger.addClass('dark');
        map.area.addClass('dark');
        $(this).removeClass('dark').addClass('active');
        //
        if($(this).is('[data-station]')) {
          newPopup = $(`.map-popup[data-station='${$(this).data('station')}']`);
        } else if($(this).is('[data-base]')) {
          newPopup = $(`.map-popup[data-base='${$(this).data('base')}']`);
          $('.map-trigger[data-factory]').removeClass('dark').addClass('is');
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
    $('.map-popup .popup-close').on('click', function(event) {
      event.preventDefault();
      if(map.available==true && popupAvailable==true) {
        popupAvailable = false;
        map.trigger.removeClass('active').removeClass('dark').removeClass('is');
        map.lines.removeClass('active');
        map.area.removeClass('dark');
        $('.map-section__description, .map-section__legend').removeClass('active');
        newAnimation.reverse();
        newAnimation.eventCallback("onReverseComplete", function() {
          oldAnimation = undefined;
          popupAvailable = true;
        })
      }
    })

    //круги
    map.area.on('mouseenter mouseleave touchstart', function(event) {
      if((event.type=='mouseenter' && $('html').hasClass('desktop')) || event.type=='touchstart') {
        map.area.not($(this)).addClass('disabled').removeClass('active');
        $('.price-delivery-item [data-area]').removeClass('active');
        //
        $(this).addClass('active');
        $('.price-delivery-item').addClass('active');
        $(`.price-delivery-item [data-area='${$(this).data('area')}']`).addClass('active');
      } else if((event.type=='mouseleave' && $('html').hasClass('desktop'))) {
        map.area.removeClass('disabled').removeClass('active');
        $('.price-delivery-item').removeClass('active');
        $('.price-delivery-item [data-area]').removeClass('active');
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
      .to($nav.el, {duration:0.5, backgroundColor:'rgba(0, 0, 0, 0.7)', ease:'power2.inOut'}, '-=0.5')
      .set('.nav__items', {display:'block'}, '-=0.25')
      .fromTo('.nav__item', {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.5, stagger:{amount: 0.25}}, '-=0.25')
      .fromTo('.nav__item', {x:40}, {x:0, ease:'power2.out', duration:0.5, stagger:{amount:0.25}}, '-=0.75')
      .fromTo('.nav .contacts-socials li', {autoAlpha:0}, {autoAlpha:1, ease:'power2.inOut', duration:0.5, stagger:{amount: 0.25}}, '-=0.75')
      .fromTo('.nav .contacts-socials li', {y:40}, {y:0, ease:'power2.out', duration:0.5, stagger:{amount:0.25}}, '-=0.75')
      .set('.nav .scrollbar-track', {autoAlpha:1})
    $nav.hideAnim = gsap.timeline({paused:true})
      .to($nav.el, {autoAlpha:0, duration:0.5, yPercent: 100, ease:'power2.in'})
    //
    $(document).on('click', function(event){
      if($nav.flag == true) {
        $nav.flag = false;
        setTimeout(function() {
          $nav.flag = true;
        }, $nav.interval)
        //
        if($(event.target).closest($nav.trigger).length>0 && $nav.state==false) {
          $nav.open();
        } else if(($(event.target).closest($nav.trigger).length>0 && $nav.state==true) ||
          ($(event.target).closest($nav.el).length==0 && $nav.state==true)) {
          $nav.close();
        } else {
          $nav.flag = true;
        }
      }
      if($(event.target).closest($nav.trigger).length>0) {
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
  next: '',
  prev: '',
  time: 0,
  forwardAnimation: '',
  backAnimation: '',
  exitAnimation: '',
  backExitAnimation: '',
  forwardAnimation: '',
  toNext: function() {
    $slide.animationProgress=true;
    this.forwardExitAnimation.play();
    this.forwardAnimation.play();
    $slide.change($slide.next);
  },
  toPrev: function() {
    $slide.animationProgress=true;
    this.backExitAnimation.play();
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
      .to(newSlide, {duration:1, autoAlpha:1, ease:'power2.inOut'})
      .fromTo(newSlide.find('.scene'), {scale:1.3}, {immediateRender:false, duration:1, scale:1, ease:'power2.out'}, '-=1')
  },
  afterChange: function() {
    if($('html').hasClass('desktop') && $('.js-tabs-true').length>0 && !this.current.hasClass('js-tabs-true')) {
      $tabs.slideTo(0);
    }
    $slide.animationProgress=false;
  },
  getFirstSlide: function(callbacks) {
    let index = localStorage.getItem('slide');
    if(index==null) {
      index = 0;
    }
    this.current = $('.section-slide').eq(index);
    localStorage.removeItem('slide');
  
    if (typeof callbacks === 'object') {
      callbacks.onComplete();
    }
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
    
    if(this.current.hasClass('js-subnav-hidden') || ( this.current.hasClass('map-section') && $window.width()<=992 ) ) {
      $subNav.hide();
    } else {
      $subNav.fade()
    }
    
    if(this.current.hasClass('cars') && $cars.initialized==false) {
      optinfo.init();
      $cars.init();
    }
    if(this.current.hasClass('gallery') && $gallery.initialized==false) {
      $gallery.init();
    }
    if(this.current.hasClass('map-section') && map.animated==false) {
      map.animated=true;
      let anim = gsap.timeline()
        .fromTo($('.custom-map'), {scale:0.5}, {duration:1, scale:1, ease:'power2.inOut'})
    }
    
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
  updateAnimations: function() {
    //exit anim
    $slide.exitAnimation = gsap.timeline({paused:true})
      .to($slide.current, {duration:1, autoAlpha:0, ease:'power2.in'})
      .fromTo($slide.current.find('.scene'), {scale:1}, {duration:1, scale:1.1, ease:'power2.in'}, '-=1')
      .to($slide.current.find('.scene'), {duration:0, scale:1})

    if($window.width()>768) {
      if($slide.next.length>0) {
        //forward anim
        $slide.forwardAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
          .to($slide.next, {duration:0, yPercent:0})
          .to($slide.next, {duration:1, autoAlpha:1, ease:'power2.inOut'})
          .fromTo($slide.next.find('.section__display'), {yPercent:100}, {immediateRender:false, duration:1, yPercent:0, ease:'power2.inOut'}, '-=1')
        //forwardExitAnimation
        $slide.forwardExitAnimation = gsap.timeline({paused:true})
          .to($slide.current, {duration:1, autoAlpha:0, ease:'power2.inOut'})
          .to($slide.current.find('.section__display'), {duration:1, yPercent:-100, ease:'power2.inOut'}, '-=1')
          .to($slide.current.find('.section__display'), {duration:0, yPercent:0})
      }
      if($slide.prev.length>0) {
        //back anim
        $slide.backAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
          .to($slide.prev, {duration:0, yPercent:0})  
          .to($slide.prev, {duration:1, autoAlpha:1, ease:'power2.inOut'})
          .fromTo($slide.prev.find('.section__display'), {yPercent:-100}, {immediateRender:false, duration:1, yPercent:0, ease:'power2.inOut'}, '-=1')
        //backExitanim
        $slide.backExitAnimation = gsap.timeline({paused:true})
          .to($slide.current, {duration:1, autoAlpha:0, ease:'power2.inOut'})
          .to($slide.current.find('.section__display'), {duration:1, yPercent:100, ease:'power2.inOut'}, '-=1')
          .to($slide.current.find('.section__display'), {duration:0, yPercent:0})

      }
    } else {
      if($slide.next.length>0) {
        //forward anim
        $slide.forwardAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
          .to($slide.next, {duration:1, autoAlpha:1, ease:'power2.inOut'})
          .fromTo($slide.next, {yPercent:100}, {immediateRender:false, duration:1, yPercent:0, ease:'power2.inOut'}, '-=1')
        //forwardExitAnimation
        $slide.forwardExitAnimation = gsap.timeline({paused:true})
          .to($slide.current, {duration:1, autoAlpha:0, ease:'power2.inOut'})
          .to($slide.current, {duration:1, yPercent:-100, ease:'power2.inOut'}, '-=1')
          .to($slide.current, {duration:0, yPercent:0})
        
      }
      if($slide.prev.length>0) {
        //back anim
        $slide.backAnimation = gsap.timeline({paused:true,onComplete:function(){$slide.updateAnimations()}})
          .to($slide.prev, {duration:1, autoAlpha:1, ease:'power2.inOut'})
          .fromTo($slide.prev, {yPercent:-100}, {immediateRender:false, duration:1, yPercent:0, ease:'power2.inOut'}, '-=1')
        //backExitanim
        $slide.backExitAnimation = gsap.timeline({paused:true})
          .to($slide.current, {duration:1, autoAlpha:0, ease:'power2.inOut'})
          .to($slide.current, {duration:1, yPercent:100, ease:'power2.inOut'}, '-=1')
          .to($slide.current, {duration:0, yPercent:0})
      }
    }
    $slide.afterChange();
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
let optinfo = {
  $block: $('.opt__info-content'),
  $open: $('.opt__info-open'),
  $close: $('.opt__info-close, .opt__mobile-select'),
  init: function() {
    this.animation = gsap.timeline({paused:true})
    .to(optinfo.$block, {duration:0.5, autoAlpha:0, yPercent:100, ease:'power2.in'})

    if($window.width()<=576) {
      this.animation.play();
    }
    this.$open.on('click', function() {
      optinfo.animation.reverse();
    })
    this.$close.on('click', function() {
      optinfo.animation.play();
    })
    $(window).resize(function() {
      if($window.width()<=576 && optinfo.animation.progress()==1) {
        optinfo.animation.play();
      } else if($window.width()>576 && optinfo.animation.progress()==1) {
        optinfo.animation.reverse();
      }
    })
  }
}

//Слайдер топлива
let $slider = {
  el: $('.fuel-slider .slider'),
  slide: $('.fuel-slide'),
  pag: $('.fuel-slider-pagination__item'),
  info: $('.opt-info-item'),
  selects: $('select'),
  scroll: false,
  init: function() {
    this.index = 0;
    this.flas = true;
    //slick hack
    $slider.el.on('init', function(event, slick, direction){
      let count = $slider.el.find('.slick-cloned').length,
          last_slides = count - 4;

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

    //события
    this.selects.on('change', function() {
      $slider.index = $(this).find(':selected').index();
      $slider.change();
    })
    $slider.pag.on('click', function() {
      $slider.index = $(this).index();
      $slider.change();
    })
    $slider.el.on('afterChange', function(event, slick, direction){
      $slider.index = $(this).find('.slick-center').not('.slick-cloned').data('slick-index');
      $slider.change();
    });
    //события клика по неактивному слайду
    $slider.slide.find('.fuel-slide__container').on('click', function() {
      let index = $(this).parent().data('slick-index');
      $slider.el.slick('slickGoTo', index);
      $slider.index = $(this).parent().attr('data-index');
      $slider.change();
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
    this.change();
  },
  change: function() {
    this.selects.val($slider.selects.eq(0).find('option').eq($slider.index).attr('value'));
    this.selects.niceSelect('update');
    $slider.pag.removeClass('active');
    $slider.pag.eq($slider.index).addClass('active');
    $slider.info.removeClass('active').eq($slider.index).addClass('active');
    $slider.el.slick('slickGoTo', $slider.index);
  }
}

//Слайдер грузовики
let $cars = {
  el: $('.cars-slide'),
  selects: $('select'),
  info: $('.opt-info-item'),
  pag: $('.cars .fuel-slider-pagination__item'),
  nextBtn: $('.fuel-slider-pagination__btn.next'),
  prevBtn: $('.fuel-slider-pagination__btn.prev'),
  scroll: false,
  initialized: false,
  init: function() {
    this.initialized=true;
    this.index=0;
    this.sizeCar();
    this.interval = undefined;
    $(window).resize(function(){
      $cars.sizeCar();
    })
    this.show();
    this.change();

    //events
    this.pag.on('click', function() {
      $cars.index = $(this).index();
      $cars.hide();
      $cars.change();
    })
    this.nextBtn.on('click', function() {
      $cars.index++;
      if($cars.index>$cars.el.length-1) {
        $cars.index=0;
      }
      $cars.hide();
      $cars.change();
    })
    this.prevBtn.on('click', function() {
      $cars.index--;
      if($cars.index<0) {
        $cars.index=$cars.el.length-1;
      }
      $cars.hide();
      $cars.change();
    })
    this.selects.on('change', function() {
      $cars.index = $(this).find(':selected').index();
      $cars.hide();
      $cars.change();
    })

    //gradients
    $('.cars-slide__gradient').on('mouseenter mouseleave touchstart', function(event) {
      let $target = $(this),
          index = $target.data('gradient');
  
      if(event.type=='touchstart') {
        $('.cars-slide__gradient, .cars-slide__section').removeClass('active');
        $target.addClass('active');
        $target.parent().find('.cars-slide__section').eq(index).addClass('active');
      } else if(event.type=='mouseenter' && $('html').hasClass('desktop')) {
        $target.addClass('active');
        $target.parent().find('.cars-slide__section').eq(index).addClass('active');
      } else if(event.type=='mouseleave' && $('html').hasClass('desktop')) {
        $('.cars-slide__gradient, .cars-slide__section').removeClass('active');
      }
    })
    $(document).on('touchstart', function(event) {
      if(!event.target.closest('.cars-slide__gradient')) {
        $('.cars-slide__gradient, .cars-slide__section').removeClass('active');
      }
    })

  },
  change: function() {
    $cars.pag.removeClass('active');
    $slider.pag.eq($cars.index).addClass('active');
    this.selects.val($cars.selects.eq(0).find('option').eq($cars.index).attr('value'));
    this.selects.niceSelect('update');
    $cars.info.removeClass('active').eq($cars.index).addClass('active');
  },
  hide: function() {
    if($cars.hideAnimation!==undefined) {
      this.hideAnimation.kill();
      this.showAnimation.kill();
    }
    this.hideAnimation = gsap.timeline({onComplete:function(){
      $cars.show()
    }})
      .to($cars.current, {duration:1,autoAlpha:0,ease:'power1.in'})
      .to($cars.current.find('.cars-slide__image'), {duration:1, xPercent:-25, ease: "power2.in"}, '-=1')
      .to($cars.current.find('.cars-slide__wheel'), {duration:1, rotation:-190, ease: "power2.in"}, '-=1')
      .to($cars.current.find('.cars-slide__title'), {duration:1, autoAlpha:0, ease: "power2.in"}, '-=1')
  },
  show: function() {
    $cars.current = $cars.el.eq($cars.index);

    this.showAnimation = gsap.timeline()
      .to($cars.current, {duration:1.5,autoAlpha:1,ease:'power2.inOut'})
      .fromTo($cars.current.find('.cars-slide__image'), {xPercent:100}, {duration:2, xPercent:0, ease:"back.out(0.3)"}, '-=1.5')
      .fromTo($cars.current.find('.cars-slide__wheel'), {rotation:760}, {duration:2, rotation:0, ease:"back.out(0.3)"}, '-=2')
      .fromTo($cars.current.find('.cars-slide__title'), {autoAlpha:0}, {duration:1.5, autoAlpha:1, ease:'power2.inOut'}, '-=1.5')
  },
  sizeCar: function() {
    console.log('size car')

    let $img = $('.cars-slide__image'),
        $car = $('.cars-slide__car'),
        $slide = $('.cars-slide'), 
        $slider = $('.cars-slider'), 
        ww = $('.section__content').width(),
        h = $slider.height() - ($('.cars-slide__title').height()+20),
        w;

    if($window.width()>1024) {
      $img.css({'width':'auto','height':h});
      $car.css({'width':'auto','height':h});
      w = $car.width();
      $slider.width(w);
    } else {
      if($window.width()>576) {
        $img.css({'width':ww});
      } else {
        $img.css({'width':ww*1.24});
      }
      $car.css({'width':'100%','height':'auto'});
      $img.css({'height':$car.height()});
      $slider.css({'height':$slide.height(),'width':'100%'});
    }
  }
}
let $popup = {
  element: $('.popup'),
  $open: $('[data-popup]'),
  $close: $('[data-close]'),
  //current: $('#order'),
  visible: false,
  init: function() {
    $popup.$open.on('click', function() {
      $popup.current = $($(this).data('popup'));
      $popup.open($popup.current);
    })
    $popup.$close.on('click', function() {
      $popup.close();
    })
  },
  open: function(current) {
    $popup.animation = gsap.timeline({onReverseComplete: function() {
      let anim = gsap.timeline()
        .to(current.find('form'), {duration:0,autoAlpha:1})
        .to(current.find('.popup-succes'), {duration:0,autoAlpha:0}) 
    }})
      .to(current, {duration:0.5, autoAlpha:1, ease:'power2.inOut'})
      .fromTo(current.find('.popup__container'), {y:30}, {duration:0.5, y:0, ease:'power2.out'}, '-=0.5')
      .to(current.find('.scrollbar-track-y'), {autoAlpha:1, duration:0})
  },
  close: function() {
    clearTimeout($form.timer)
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
    if($window.width()<=576) {
      $contactForm.animation.play();
    }
    $(window).resize(function() {
      if($window.width()<=576 && $contactForm.animation.progress()==1) {
        $contactForm.animation.play();
      } else if($window.width()>576 && $contactForm.animation.progress()==1) {
        $contactForm.animation.reverse();
      }
    })
  }
}
let parallax = {
  scene: $('.scene'),
  init: function() {
    this.scene.each(function() {
      let parallaxInstance = new Parallax(this, {
        limitY: '0',
        limitX: '100'
      });
    })
  }
}
let $tabs = {
  btn: $('.home__nav-item'),
  nav: $('.home__nav'),
  slide: $('.home-slide'),
  old: 0,
  init: function() {
    this.btn.on('mouseenter', function() {
      if(!$slide.animationProgress) {
        let index = $(this).index() + 1;
        $tabs.slideTo(index);
      }
    })
    this.nav.on('mouseleave', function() {
      if(!$slide.animationProgress) {
        $tabs.slideTo(0);
      }
    })
  },
  slideTo: function(index) {
    let animation = gsap.timeline()
      .to($tabs.slide.eq($tabs.old), {duration:0.5, autoAlpha:0, ease:'power2.out'})
      .to($tabs.slide.eq(index), {duration:0.5, autoAlpha:1, ease:'power2.out'}, '-=0.5')
      .fromTo($tabs.slide.eq($tabs.old).find('.scene'), {scale:1}, {immediateRender:false, duration:0.5, scale:1.05, ease:'power2.in'}, '-=0.5')
      .fromTo($tabs.slide.eq(index).find('.scene'), {scale:1.05}, {immediateRender:false, duration:0.5, scale:1, ease:'power2.out'}, '-=0.5')
    $tabs.old=index;
  }
}
let $select = {
  el: $('.select select'),
  init: function() {
    this.el.niceSelect({onComplete: function() {
      $scrollArea.init();
    }});
  }
}
let $mask = {
  el: document.querySelector('[name="phone"]'),
  init: function() {
    if($mask.el!==null) {
      Inputmask({
        mask: "+7 999 999-9999",
        clearIncomplete: true
      }).mask($mask.el);
    }
  }
}

let $gallery = {
  $slider: $('.gallery-slider'),
  slide: $('.gallery-slide'),
  $pagination: $('.gallery-pagination'),
  $pagitem: $('.gallery-pagination__item'),
  $next: $('.gallery-slider__next'),
  $circle: $('.gallery .round__circle'),
  $ind: $('.gallery-pagination__ind'),
  initialized: false,
  intervalDuration: 4000,
  init: function() {
    this.index = 0;
    this.available = false;
    this.getParams();
    this.show();

    $(window).resize(function () {
      $gallery.getParams();
    })


    this.$pagitem.on('click', function(){
      if($gallery.available==true) {
        $gallery.available=false;
        $gallery.index = $(this).index();
        $gallery.show();
      }
    })
    this.$next.on('click', function(){
      if($gallery.available==true) {
        $gallery.available=false;
        $gallery.index++;
        if($gallery.index==$gallery.slide.length) {
          $gallery.index=0;
        }
        $gallery.show();
      }
    })
    //swipe
    let area = document.querySelector('.gallery-slider'),
      manager = new Hammer.Manager(area, {
      touchAction: 'auto',
      inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
      recognizers: [
        [Hammer.Swipe, {
          direction: Hammer.DIRECTION_ALL
        }]
      ]
    });
    manager.on("swipe", function(event) {
      if(event.offsetDirection=='2' && $gallery.available==true) {
        $gallery.available=false;
        $gallery.index++;
        if($gallery.index==$gallery.slide.length) {
          $gallery.index=0;
        }
        $gallery.show();
      } else if(event.offsetDirection=='4' && $gallery.available==true) {
        $gallery.available=false;
        $gallery.index--;
        if($gallery.index<0) {
          $gallery.index=$gallery.slide.length-1;
        }
        $gallery.show();
      }
    });

    //interval
    this.interval = setInterval(()=>{
      if(!$gallery.paused) {
        this.$next.trigger('click');
      }
    },this.intervalDuration)

    if(!$('html').hasClass('desktop')) {
      this.paused=true;
    } else {
      $gallery.$slider.on('mouseenter mousemove mouseleave', function(event) {
        if(event.type=='mouseenter' || event.type=='mousemove') {
          $gallery.paused=true;
        } else {
          $gallery.paused=false;
        }
      })
    }
  },
  show: function() {
    this.$newSlide = this.slide.eq($gallery.index);

    this.$pagitem.removeClass('active');
    this.$pagitem.eq($gallery.index).addClass('active');
    
    let $cover = $gallery.$newSlide.find('.gallery-slide__cover'),
        $OLDcover,
        $image = $gallery.$newSlide.find('.bg'),
        $OLDimage,
        $item = $gallery.$newSlide.find('.gallery-slide__d-item'),
        $OLDitem,
        $pagitem = $gallery.$pagination.find('.gallery-pagination__item');

    if($gallery.$oldSlide!==undefined) {
      $OLDcover = $gallery.$oldSlide.find('.gallery-slide__cover');
      $OLDimage = $gallery.$oldSlide.find('.bg');
      $OLDitem = $gallery.$oldSlide.find('.gallery-slide__d-item');
    }

    if(this.initialized==false) {
      this.initialized=true;
      //first animation
      let animation = gsap.timeline({onComplete:function(){$gallery.available=true}})
        .to([$gallery.$newSlide,$gallery.$pagination], {duration:0,autoAlpha:1},'+=0.5')
        .fromTo($cover, {xPercent:100}, {duration:1,xPercent:0,ease:'power2.out'})
        .fromTo($image, {xPercent:-50,scale:1.5}, {duration:1,xPercent:0,scale:1,ease:'power2.out'}, '-=1')
        //items fade
        .fromTo($item, {autoAlpha:0}, {duration:0.75,autoAlpha:1,ease:'power2.inOut',stagger:{amount:0.25}}, '-=1')
        .fromTo($item, {y:45,rotation:5}, {duration:0.75,y:0,rotation:0,ease:'power2.out',stagger:{amount:0.25}}, '-=1')
        //btn
        .fromTo($gallery.$circle, {css:{strokeDashoffset:$gallery.circumference}}, {duration:1, css:{strokeDashoffset:$gallery.circumference*0.25}, ease:'power2.out'}, '-=0.5')
        .fromTo($gallery.$next.find('.icon'), {autoAlpha:0}, {duration:1,autoAlpha:1,ease:'power2.inOut'}, '-=1')
        .fromTo($gallery.$next.find('.icon'), {scale:0.5}, {duration:1,scale:1,ease:'power2.out'}, '-=1')
    } 
    else {
      //else animations
      let animation = gsap.timeline({onComplete:function(){$gallery.available=true}})
        .to($gallery.$newSlide, {duration:0,autoAlpha:1})
        .to($OLDcover, {duration:0.5,xPercent:-100,ease:'power1.in'})
        .to($OLDimage, {duration:0.5,xPercent:50,scale:1.1,ease:'power1.in'}, '-=0.5')
        .to($OLDitem, {duration:0.4,y:-20,rotation:-1,autoAlpha:0,ease:'power1.in',stagger:{amount:0.1}}, '-=0.5')
        .fromTo($gallery.$circle, {css:{strokeDashoffset:$gallery.circumference*2.25}}, {duration:0.5, css:{strokeDashoffset:$gallery.circumference*1.25}, ease:'power2.in'}, '-=0.5')
        .fromTo($cover, {xPercent:100}, {duration:1,xPercent:0,ease:'power2.out'})
        .fromTo($image, {xPercent:-50,scale:1.2}, {duration:1,xPercent:0,scale:1,ease:'power2.out'}, '-=1')
        //items fade
        .fromTo($item, {autoAlpha:0}, {duration:0.75,autoAlpha:1,ease:'power2.inOut',stagger:{amount:0.25}}, '-=1')
        .fromTo($item, {y:45,rotation:5}, {duration:0.75,y:0,rotation:0,ease:'power2.out',stagger:{amount:0.25}}, '-=1')
        //
        .to($gallery.$circle, {duration:1, css:{strokeDashoffset:$gallery.circumference*0.25}, ease:'power2.out'}, '-=1')
        .to($gallery.$ind, {duration:1.5,xPercent:$gallery.index*100 ,ease:'power2.inOut'}, '-=1.5')
        .to($gallery.$oldSlide, {duration:0,autoAlpha:0})
    }

    this.$oldSlide = this.$newSlide;
  },
  getParams: function() {
    let bw = this.$next.width();
    //круг
    this.$circle.attr('cx', bw/2);
    this.$circle.attr('cy', bw/2);
    this.$circle.attr('r', bw/2-1);
    this.$ind.css('width', `${100/($gallery.slide.length)}%`)
    
    this.circumference = 2*Math.PI*this.$circle.attr('r');
    this.$circle.attr('style', `stroke-dasharray:${$gallery.circumference} ${$gallery.circumference};stroke-dashoffset:${$gallery.circumference*2.25};`)
  }
}
//форма отправлена
window.$form = {
  submited: function(obj) {
    let circle = document.querySelector('.round__circle'),
        radius = circle.r.baseVal.value,
        w = 2*Math.PI*radius;

        let animationMessage = gsap.timeline({paused: true})
          .fromTo(obj.find('.popup-succes'), {autoAlpha:0}, {duration:0, autoAlpha:1})
          .fromTo(obj.find('.popup-succes__button'), {autoAlpha:0}, {duration:0.25, autoAlpha:1, ease:'power2.inOut'})
          .fromTo(obj.find('.popup-succes .round__circle'), {css:{strokeDashoffset:w}}, {duration:0.5, css:{strokeDashoffset:0}, ease:'power2.inOut'})
          .fromTo(obj.find('.popup-succes .icon'), {autoAlpha:0, scale:0.7}, {duration:0.25, autoAlpha:1, scale:1, ease:'power2.inOut'}, '-=0.5')
          .fromTo(obj.find('.popup-succes__item'), {autoAlpha:0, y:20}, {duration:0.4, autoAlpha:1, y:0, ease:'power2.out', stagger:{amount:0.1}}, '-=0.5')

    if(obj.is('#order')) {
      animationMessage.play();
      let anim = gsap.timeline()
        .to(obj.find('form'), {duration:0.25, autoAlpha:0, ease:'power2.in'})
    } else if(obj.is('#succes')) {
      $popup.open(obj)
      animationMessage.play();
      if($window.width()<=576 && $contactForm.animation.progress()==0) {
        $contactForm.animation.play();
      }
    }
    $form.timer = setTimeout(function() {
      $popup.close();
    }, 3000)
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
  function footerSize() {
    let f = $('.nav__footer'),
        m = (bottomH-f.outerHeight())/2;

    if($window.width()>1024) {
      f.css('margin-bottom', m);
    }
  }
  contentResize();
  navResize();
  paginationResize();
  footerSize();
}
//
function siteNavEvents() {
  //scroll navigation
  $(window).on('wheel', function(event){
    if($(event.target).closest('.scroll-container').find('.scrollbar-track:visible').length==0 && $(event.target).closest('.js-no-scroll').length==0) {
      if(!$slide.animationProgress) {
        if(event.originalEvent.deltaY>0 && $slide.current.index()+1 < $slide.count) {
          $slide.toNext();
        } else if(event.originalEvent.deltaY<0 && $slide.current.index()>0) {
          $slide.toPrev();
        }
      }
    }
  });


  //swipe navigation
  let manager = new Hammer.Manager(document, {
    touchAction: 'auto',
    inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
    recognizers: [
      [Hammer.Swipe, {
        direction: Hammer.DIRECTION_ALL
      }]
    ]
  });
  manager.on("swipe", function(event) {
    //
    if($(event.target).closest('.scroll-container').find('.scrollbar-track:visible').length==0 && $(event.target).closest('.js-no-scroll').length==0 && $(event.target).closest('.js-no-swipe').length==0 && !$('html').hasClass('desktop')) {
      
      if(!$slide.animationProgress) {
        if((event.offsetDirection=='8' || (event.offsetDirection=='2' && $(event.target).closest('.gallery').length==0)) && $slide.current.index()+1 < $slide.count) {
          $slide.toNext();
        } else if((event.offsetDirection=='16' || (event.offsetDirection=='4' && $(event.target).closest('.gallery').length==0)) && $slide.current.index()>0) {
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
  $('[data-first-slide]').on('click', function() {
    let index = $(this).data('first-slide');
    localStorage.setItem('slide', index);
  })
  //планый переход
  $('[data-animate-link]').on('click', function(event) {
    if($slide.animationProgress==false) {
      $slide.animationProgress=true;
      event.preventDefault();
      $('a').removeClass('active');
      $('.page-wrapper').css('pointer-events', 'none');
      $(this).addClass('active');
      let href = $(this).attr('href');
      let animation = gsap.timeline({
            onComplete:function(){
              document.location.href = href;
            }
          })
          .to('.page-wrapper', {duration:0.5, autoAlpha:0, ease:'power2.in'})
    }
  })
}
//
function inputs() {
  autosize($('textarea'));
  $('input, textarea').each(function() {
    if($(this).val()!=='') {
      $(this).parents('.input').addClass('focus');
    } else {
      $(this).parents('.input').removeClass('focus');
    }
  })
  $(document).on('focusin focus focusout', 'input, textarea', function(event) {
    if(event.type=='focusin' || event.type=='focus') {
      $(event.target).parents('.input').addClass('focus')
    } else {
      setTimeout(function() {
        if($(event.target).val()=='') {
          $(event.target).parents('.input').removeClass('focus')
        }
      }, 100)
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
          let index = $(this).parents('.select').find(':selected').index();
          $(this).parents('.select').find('.selected').removeClass('selected');
          $(this).parents('.select').find('.option').eq(index).addClass('selected');
          let text = $(this).parents('.select').find('.option').eq(index).text();
          $(this).parents('.select').find('.current').text(text);
        });

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
        .html(`<span class="current js-animated"></span><svg class="icon"><use xlink:href="${$select.data('icon')}"></use></svg><div class="scroll-container nice-select__list"><div class="scroll-child"><ul></ul></div></div>`)
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

    //callback
    if (typeof method === 'object') {
      method.onComplete();
    }

    return this;
  };

}(jQuery));