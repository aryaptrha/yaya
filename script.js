$(document).ready(function () {
    // Floating animation for the name
    function floatAnimation() {
      $(".animate-float").animate({ marginTop: "-=20px" }, 1000, function () {
        $(this).animate({ marginTop: "+=20px" }, 1000, floatAnimation);
      });
    }
    floatAnimation();
  
    // Fade in the tagline
    $(".neon-text").delay(1000).animate({ opacity: 1 }, 2000);
  
    // Hover effect for links
    $(".neon-link").hover(
      function () {
        $(this).css("text-shadow", "0 0 5px #00ff88, 0 0 10px #00ff88");
      },
      function () {
        $(this).css("text-shadow", "none");
      }
    );
  });