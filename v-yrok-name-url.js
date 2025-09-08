$(document).ready(function () {
  const lessonTitle = $('.lesson-title-value').text();
  const currentUrl = window.location.href;

  // Не создавать iframe, если уже есть lessonUrl в URL
  if (currentUrl.includes('lessonUrl=')) return;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = `${window.location.origin}/last-lesson?lessonTitle=${encodeURIComponent(lessonTitle)}&lessonUrl=${encodeURIComponent(currentUrl)}`;
  document.body.appendChild(iframe);

  console.log('Скрытый iframe создан и данные отправлены.');
});
