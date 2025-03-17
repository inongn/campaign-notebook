

document.addEventListener("DOMContentLoaded", () => {
  const screenWidth = window.innerWidth;

  if (screenWidth > 705) {
    repositionMiddle();
}
});

window.addEventListener("load", function() {
  setTimeout(function() {
      const middleElement = document.getElementById("middle");
      if (middleElement) {
          middleElement.style.transition = "transform 0.3s ease-in-out, width 0.3s ease-in-out";
      }
  }, 1); // 1000 milliseconds = 1 second
});

// toggle sidebars on small screens

document.addEventListener("DOMContentLoaded", function () {
  const leftSidebar = document.getElementById("left");
  const rightSidebar = document.getElementById("right");

  function toggleSidebars() {
      if (window.innerWidth < 1000){
        if (leftSidebar.classList.contains("active") && rightSidebar.classList.contains("active")) {
          leftSidebar.classList.remove("active");
          rightSidebar.classList.remove("active");
      }
      }
      if (window.innerWidth < 705) {
          if (leftSidebar.classList.contains("active")) {
              rightSidebar.style.display = "none";
          } else {
              rightSidebar.style.display = "";
          }

          if (rightSidebar.classList.contains("active")) {
              leftSidebar.style.display = "none";
          } else {
              leftSidebar.style.display = "";
          }
      } else {
          leftSidebar.style.display = "";
          rightSidebar.style.display = "";
      }
  }

  const observer = new MutationObserver(toggleSidebars);
  observer.observe(leftSidebar, { attributes: true, attributeFilter: ["class"] });
  observer.observe(rightSidebar, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", toggleSidebars);
  toggleSidebars(); // Initial check
});

//sidebar logic
  function toggleLeft() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    const screenWidth = window.innerWidth;

    if (screenWidth <= 1000) {
        // If screen width is 992px or less, close right sidebar before toggling left
        if (right.classList.contains("active")) {
            right.classList.remove("active");
        }
    }

    left.classList.toggle("active");

    // Only call repositionMiddle if screen width is greater than 992
    if (screenWidth > 705) {
        repositionMiddle();
    }
}

function toggleRight() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    const screenWidth = window.innerWidth;

    if (screenWidth <= 1000) {
        // If screen width is 992px or less, close left sidebar before toggling right
        if (left.classList.contains("active")) {
            left.classList.remove("active");
        }
    }

    right.classList.toggle("active");

    // Only call repositionMiddle if screen width is greater than 992
    if (screenWidth > 705) {
        repositionMiddle();
    }
}

function repositionMiddle() {
  let left = document.getElementById("left");
  let middle = document.getElementById("middle");
  let right = document.getElementById("right");
  
  let leftActive = left.classList.contains("active");
  let rightActive = right.classList.contains("active");
  
  let leftWidth = left.offsetWidth;
  let rightWidth = right.offsetWidth;
  
  let translateValue = 0;
  
  if (leftActive && !rightActive) {
      translateValue = leftWidth/2 - 15;
  } else if (rightActive && !leftActive) {
      translateValue = -(rightWidth/2 - 15);
  } else if (leftActive && rightActive) {
      translateValue = leftWidth/2 - rightWidth/2;
  }
  
  middle.style.transform = `translateX(${translateValue}px)`;
}

// resize handling logic

function handleResize() {
  const screenWidth = window.innerWidth;

  if (screenWidth < 705) {
      centerMiddle();
  } else {
      repositionMiddle();
  }
}

window.addEventListener("resize", handleResize);

handleResize();

function centerMiddle(){
  middle.style.transform = `translateX(0)`;
}

document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Check if dark mode was previously enabled
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });
});
