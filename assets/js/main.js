// header-menu-icon
$(document).ready(function () {
  $(".header-menu-icon").click(function () {
    $(this).toggleClass("a");
    $("header .logo").toggleClass("active");
    $(".nav-menu").toggleClass("active");
  });
});

$(window).on("load", function () {
  $(".loader-slide").addClass("open");
});

// nav-icon
$(document).on("scroll", function () {
  var scrollPos =
    $(document).scrollTop() +
    $(".header-menu-toggler").position().top +
    $(".header-menu-toggler").height() / 2;
  $(".homepage-hero, .homepage-eco").each(function () {
    var refElement = $(this);
    if (
      refElement.position().top <= scrollPos &&
      refElement.position().top + refElement.outerHeight() > scrollPos
    ) {
      $(".header-menu-toggler").addClass("light");
      // found one, so exit .each
      return false;
    } else {
      $(".header-menu-toggler").removeClass("light");
    }
  });
});

$(window).scroll(function () {
  $(".homepage-join").each(function () {
    if ($(window).scrollTop() < $(this).offset().top - $(this).height())
      $(this).removeClass("active");
    else $(this).addClass("active");
  });
});

$(window).scroll(function () {
  $(".homepage-eco").each(function () {
    if ($(window).scrollTop() < $(this).offset().top - $(this).height())
      $(this).removeClass("active");
    else $(this).addClass("active");
  });
});

$(window).scroll(function () {
  $(".homepage-map").each(function () {
    if ($(window).scrollTop() < $(this).offset().top - $(this).height())
      $(this).removeClass("active");
    else $(this).addClass("active");
  });
});

$(document).ready(function () {
  $(".page-press").addClass("active");
});

// aos
AOS.init();

// fancybox
Fancybox.bind("[data-fancybox]", {});

$(".dropdown-menu").on("click", function (event) {
  event.stopPropagation();
});

$("html,body").animate({
  scrollTop: $(window.location.hash).offset().top,
});

//tooltip
var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
