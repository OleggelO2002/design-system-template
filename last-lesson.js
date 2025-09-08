document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    const maxChecks = 30; // 3000ms / 100ms
    let checkCount = 0;

    const intervalId = setInterval(() => {
      checkCount++;

      // Проверка, например, что нужный блок уже есть на странице
      const scheduleBlock = document.querySelector('.xdget-lessonSchedule');
      if (scheduleBlock) {
        clearInterval(intervalId); // Останавливаем, если элемент найден

         const url = `${window.location.origin}/last-lesson-out`;

        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Ошибка загрузки страницы: ${response.statusText}`);
            }
            return response.text();
          })
          .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const rawBlock = tempDiv.querySelector('.last-lesson-out');
            if (!rawBlock) {
              console.log('Блок с классом .last-lesson-out не найден');
              return;
            }

            const rawText = rawBlock.textContent.trim();
            console.log('Извлечённый текст:', rawText);

            const urlMatch = rawText.match(/https:\/\/school\.astrolog-liliya\.ru\/pl\/teach\/control\/lesson\/view\?id=\d+/);
            const titleMatch = rawText.match(/^(.*?)(?=\s*https:\/\/)/);

            if (!urlMatch || !titleMatch) {
              console.log('Не удалось найти ссылку или заголовок');
              return;
            }

            const lessonUrl = urlMatch[0];
            const lessonTitle = titleMatch[0].trim();

            const lessonBlock = document.createElement('div');
            lessonBlock.className = 'lastLessonBlock';
            lessonBlock.style.marginTop = '20px';
            lessonBlock.style.padding = '20px';
            lessonBlock.style.backgroundColor = '#fdfdfd';
            lessonBlock.style.border = '1px solid #eee';
            lessonBlock.style.borderRadius = '8px';
            lessonBlock.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';

            lessonBlock.innerHTML = `
              <div class="lesson-title">Вы остановились на уроке:</div>
              <div class="lesson-name">${lessonTitle}</div>
              <a href="${lessonUrl}" class="lesson-btn">Продолжить учиться</a>
            `;

            if (scheduleBlock.parentNode) {
              scheduleBlock.parentNode.insertBefore(lessonBlock, scheduleBlock.nextSibling);
              console.log('Блок добавлен!');
            } else {
              console.log('Элемент .xdget-lessonSchedule не найден или у него нет родителя');
            }
          })
          .catch(error => console.error('Ошибка при загрузке HTML:', error));
      }

      if (checkCount >= maxChecks) {
        clearInterval(intervalId); // Прекращаем попытки после 3 секунд
        console.log('Не удалось найти .xdget-lessonSchedule в течение 3 секунд');
      }
    }, 100);
  }, 100);
});
