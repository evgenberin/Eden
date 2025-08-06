// Tự động thêm class sau 3s để trượt preloader lên
window.addEventListener('load', function () {
  setTimeout(function () {
    document.body.classList.add('page-loaded');
  }, 2000);
});