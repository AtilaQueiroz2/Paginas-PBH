<script>
    document.addEventListener("DOMContentLoaded", function () {
         if (jQuery(window).width() < 992) {
           var imagens = document.querySelectorAll('.parallax-img');
    new simpleParallax(imagens, {
        scale: 1.5,
    delay: 0.5,
    transition: 'cubic-bezier(0,0,0,1)'
           });
         }
         });

</script> 