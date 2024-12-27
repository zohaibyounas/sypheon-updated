document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
document.body.scrollTop = 0;

// Delay execution of the window.onload code by 5 seconds
setTimeout(() => {
  let position = "relative";
  let display = "none";

  const sectionScroll = document.querySelector(".section-scroll");
  const sectionScrollTop = sectionScroll.offsetTop;
  const sectionScrollHeight = sectionScroll.offsetHeight;
  const halfwayPoint = sectionScrollTop + sectionScrollHeight / 2;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const sectionBottom = sectionScrollTop + sectionScrollHeight;

    if (scrollY >= sectionScrollTop && scrollY <= sectionBottom) {
      display = "block";
      position = "fixed";
    } else {
      display = "none";
      position = "relative";
    }
    // Update the position of #app and #imgGroup
    gsap.set("#app, #imgGroup", {
      position: position,
      display: display,
    });

    if (scrollY >= 15000) {
      gsap.to("#app", { backgroundColor: "orange", duration: 1 }); // Replace 'newColor' with the actual color you want
    } else {
      gsap.to("#app", { backgroundColor: "white", duration: 1 }); // Replace 'originalColor' with the original color
    }
  });

  gsap.timeline({
    defaults: { duration: 1 },
    onUpdate: () => {
      if (gsap.getProperty("#cursorClose", "opacity") == 1) closeDetail();
    }, //close detail view on scroll
    scrollTrigger: {
      trigger: ".section-scroll", // Use the homepage-video section as the trigger
      start: "top top", // Start animation when top of homepage-video section hits top of viewport
      end: "bottom bottom", // End animation when bottom of homepage-video section hits bottom of viewport
      scrub: 1,
    },
  });
  gsap.set("#scrollDist", {
    width: "100%",
    height: gsap.getProperty("#app", "height"), // apply the height of the image stack
    onComplete: () => {
      gsap.set("#app, #imgGroup", {
        display: display,
        opacity: 1,
        position: position,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        perspective: 300,
      });
      gsap.set("#app img", {
        position: "absolute",
        attr: {
          id: (i, t, a) => {
            //use GSAP's built-in loop to setup each image
            initImg(i, t);
            return "img" + i;
          },
        },
      });

      gsap
        .timeline({
          defaults: { duration: 0.6 },
          onUpdate: () => {
            if (gsap.getProperty("#cursorClose", "opacity") == 1) closeDetail();
          }, //close detail view on scroll
          scrollTrigger: {
            trigger: "#scrollDist",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        })
        .fromTo(
          "#txt1",
          { scale: 0.6, transformOrigin: "50%" },
          { scale: 2, ease: "power1.in" },
          0
        )
        .to(
          "#txt1 path",
          { duration: 0.3, opacity: 0, stagger: 0.025, ease: "power1.in" }, // Animate opacity to 0
          0
        )
        .fromTo(
          ".imgBox",
          { z: -5000 },
          { z: 350, stagger: -0.3, ease: "none" },
          0.3
        )
        .fromTo(
          ".imgBox img",
          { scale: 3 },
          { scale: 1.15, stagger: -0.3, ease: "none" },
          0.3
        )
        .to(
          ".imgBox",
          { duration: 0, pointerEvents: "auto", stagger: -0.3 },
          0.5
        )
        .from(
          ".imgBox img",
          { duration: 0.3, opacity: 0, stagger: -0.3, ease: "power1.inOut" },
          0.3
        )
        .to(
          ".imgBox img",
          { duration: 0.1, opacity: 0, stagger: -0.3, ease: "expo.inOut" },
          1
        )
        .to(
          ".imgBox",
          { duration: 0, pointerEvents: "none", stagger: -0.3 },
          1.27
        )

        .add("end");

      // intro animation
      gsap.from(window, {
        duration: 1.4,
        scrollTo: gsap.getProperty("#scrollDist", "height") / 3,
        ease: "power2.in",
      });
      gsap.from(".imgBox", {
        duration: 0.2,
        opacity: 0,
        stagger: 0.06,
        ease: "power1.inOut",
      });
    },
  });

  function initImg(i, t) {
    const box = document.createElement("div"); // make a container div
    box.appendChild(t); // move the target image into the container
    document.getElementById("imgGroup").appendChild(box); // put the container into the imgGroup div
    gsap.set(box, {
      pointerEvents: "none",
      position: "absolute",
      attr: { id: "box" + i, class: "imgBox" },
      width: "600px",
      height: "800px",
      // overflow: "hidden",
      top: "50%",
      left: "50%",
      x: t.dataset.x,
      y: t.dataset.y,
      xPercent: -50,
      yPercent: -50,
      perspective: 500,
    });

    t.onmouseover = () =>
      gsap.to("#cursorCircle", {
        duration: 0.2,
        attr: { r: 30, "stroke-width": 4 },
      });

    t.onmousedown = () => {
      gsap.to(t, { z: -25, ease: "power2" });
      gsap.to("#cursorCircle", { attr: { r: 40 }, ease: "power3" });
    };

    t.onmouseup = () => gsap.to(t, { z: 0, ease: "power1.inOut" });

    t.onmouseout = () =>
      gsap.to("#cursorCircle", {
        duration: 0.2,
        attr: { r: 11, "stroke-width": 3 },
      });

    t.onclick = () => showDetail(t);
  }

  function showDetail(t) {
    // Retrieve the URL from the data-href attribute
    const url = t.getAttribute("data-href");

    // Open the URL in a new window/tab with target set to blank
    window.open(url, "_self");
  }

  function closeDetail() {
    gsap
      .timeline()
      .to("#detailTxt", { duration: 0.3, opacity: 0 }, 0)
      .to("#detailImg", { duration: 0.3, y: "-100%", ease: "power1.in" }, 0)
      .to("#detail", { duration: 0.3, top: "-100%", ease: "expo.in" }, 0.1)
      .to("#cursorClose", { duration: 0.1, opacity: 0 }, 0)
      .to("#cursorCircle", { duration: 0.2, opacity: 1 }, 0.1);
  }
  document.getElementById("detail").onclick = closeDetail;

  if (ScrollTrigger.isTouch == 1) {
    // on mobile, hide mouse follower + remove the x/y positioning from the images
    gsap.set("#cursor", { opacity: 0 });
    gsap.set(".imgBox", { x: 0, y: 0 });
  } else {
    // quickTo can be used to optimize x/y movement on the cursor...but it doesn't work on fancier props like 'xPercent'
    cursorX = gsap.quickTo("#cursor", "x", { duration: 0.3, ease: "power2" });
    cursorY = gsap.quickTo("#cursor", "y", { duration: 0.3, ease: "power2" });

    window.onmousemove = (e) => {
      gsap.to(".imgBox", {
        // move + rotate imgBoxes relative to mouse position
        xPercent: (-e.clientX / innerWidth) * 100,
        yPercent: -25 - (e.clientY / innerHeight) * 50,
        rotateX: 8 - (e.clientY / innerHeight) * 16,
        rotateY: -8 + (e.clientX / innerWidth) * 16,
      });

      gsap.to(".imgBox img", {
        // move images inside each imgBox, creates additional parallax effect
        xPercent: (-e.clientX / innerWidth) * 10,
        yPercent: -5 - (e.clientY / innerHeight) * 10,
      });

      // mouse follower
      cursorX(e.clientX);
      cursorY(e.clientY);
    };
  }
}, 2000); // 5 seconds delay
