function initHeader() {
  // Toggle menu (mobile)
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navMenu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
  }

  let marquee = document.getElementById('marquee-text');
  // Marquee chuyển text
  const messages = [
    { icon: 'fas fa-bell', text: 'Hệ thống đặt phòng trực tuyến hoạt động 24/7 – Liên hệ nếu cần hỗ trợ !' },
    { icon: 'fas fa-gift', text: 'Ưu đãi đặc biệt tháng này – Giảm đến 20% khi đặt online !' },
    { icon: 'fas fa-star', text: 'Tận hưởng kỳ nghỉ trọn vẹn với dịch vụ 5 sao của chúng tôi !' },
    { icon: 'fas fa-users', text: 'Hơn 10.000 khách đã tin tưởng khách sạn chúng tôi mỗi năm !' }
  ];

  let index = 0;

  function updateMarquee() {
    const marqueeParent = marquee.parentNode;
    const newMarquee = document.createElement('div');
    newMarquee.className = 'marquee-content';
    newMarquee.id = 'marquee-text';
    newMarquee.innerHTML = `
    <i class="${messages[index].icon}"></i>
    <span>${messages[index].text}</span>
  `;
    marqueeParent.replaceChild(newMarquee, marquee);
    marquee = newMarquee;

    // Tính chiều dài chữ
    requestAnimationFrame(() => {
      const textWidth = marquee.offsetWidth;
      const containerWidth = marqueeParent.offsetWidth;
      const distance = textWidth + containerWidth;
      const speed = 100; // px/s – bạn có thể điều chỉnh tốc độ
      const duration = distance / speed;

      marquee.style.animationDuration = `${duration}s`;

      // Sau khi chạy xong, gọi lại
      setTimeout(() => {
        index = (index + 1) % messages.length;
        updateMarquee();
      }, duration * 1000);
    });
  }
  updateMarquee();
}
