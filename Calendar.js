document.addEventListener('DOMContentLoaded', function () {
  let attempts = 0;
  const maxAttempts = 10;

  const intervalId = setInterval(() => {
    const block = document.querySelector('.xdget-lessonSchedule');
    if (block || attempts >= maxAttempts) {
      clearInterval(intervalId);
      if (block) {
        initLessonSchedule(block);
      } else {
        console.warn('Блок .xdget-lessonSchedule не найден за 1000 мс');
      }
    }
    attempts++;
  }, 100);

  function initLessonSchedule(block) {
    const header = block.querySelector('h3');
    const scheduleBlock = block.querySelector('.schedule-block');
    const days = scheduleBlock?.querySelectorAll('.day');

    if (!header || !scheduleBlock || !days) {
      console.warn('Не найдены необходимые вложенные элементы');
      return;
    }

    scheduleBlock.style.overflow = 'hidden';
    scheduleBlock.style.transition = 'max-height 0.5s ease';
    scheduleBlock.style.display = 'block';

    let expanded = true;
    header.classList.add('open');
    header.style.cursor = 'pointer';

    scheduleBlock.style.maxHeight = '0';
    setTimeout(() => {
      scheduleBlock.style.maxHeight = scheduleBlock.scrollHeight + 'px';
    }, 100);

    header.addEventListener('click', () => {
      expanded = !expanded;
      header.classList.toggle('open', expanded);
      header.classList.toggle('closed', !expanded);
      scheduleBlock.style.maxHeight = expanded ? scheduleBlock.scrollHeight + 'px' : '0';
    });

    const months = {
      'Январь': '01', 'Февраль': '02', 'Март': '03', 'Апрель': '04',
      'Май': '05', 'Июнь': '06', 'Июль': '07', 'Август': '08',
      'Сентябрь': '09', 'Октябрь': '10', 'Ноябрь': '11', 'Декабрь': '12',
      'Янв': '01', 'Фев': '02', 'Мар': '03', 'Апр': '04',
      'Июн': '06', 'Июл': '07', 'Авг': '08', 'Сен': '09',
      'Окт': '10', 'Ноя': '11', 'Дек': '12'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    days.forEach(day => {
      const dateLabel = day.querySelector('.day-label');
      const records = day.querySelectorAll('.record');
      if (!dateLabel || !records.length) return;

      const dateText = dateLabel.textContent.trim().replace(/\s+/g, ' ');

      records.forEach(record => {
        const timeEl = record.querySelector('.time');
        const eventEl = record.querySelector('.event');
        const eventLink = eventEl?.querySelector('a');
        if (!timeEl || !eventEl || !eventLink) return;

        const timeText = timeEl.textContent.trim();
        const eventTitle = eventLink.textContent.trim();
        const eventDesc = eventEl.textContent.trim();

        let eventDate = null;
        if (dateText.toLowerCase().includes('сегодня')) {
          eventDate = new Date(today);
        } else if (dateText.toLowerCase().includes('завтра')) {
          eventDate = new Date(today);
          eventDate.setDate(today.getDate() + 1);
        } else {
          const dateMatch = dateText.match(/^(\d{1,2}) (\p{L}+),?/u);
          if (!dateMatch) return;
          const [_, dayStr, monthStr] = dateMatch;
          const month = months[monthStr];
          if (!month) return;
          const year = today.getFullYear();
          eventDate = new Date(`${year}-${month}-${dayStr.padStart(2, '0')}T${timeText}:00`);
        }

        const eventDayOnly = new Date(eventDate);
        eventDayOnly.setHours(0, 0, 0, 0);

        if (eventDayOnly >= today && !record.querySelector('.calendar-btn')) {
          const btn = document.createElement('button');
          btn.textContent = 'Добавить в календарь';
          btn.className = 'calendar-btn';
          btn.style.marginTop = '10px';
          btn.style.display = 'inline-block';
          btn.style.padding = '6px 12px';
          btn.style.background = '#3498db';
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.borderRadius = '4px';
          btn.style.cursor = 'pointer';

          btn.addEventListener('click', function () {
            const [h, m] = timeText.split(':');
            const pad = n => n.toString().padStart(2, '0');
            const y = eventDate.getFullYear();
            const mo = pad(eventDate.getMonth() + 1);
            const d = pad(eventDate.getDate());
            const start = `${y}${mo}${d}T${pad(h)}${pad(m)}00`;
            const endHourNum = Number(h) + 1;
            const endHour = pad(endHourNum);
            const end = `${y}${mo}${d}T${endHour}${pad(m)}00`;

            // 🌍 Получаем текущий часовой пояс пользователя
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
            const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

            const isChatiumApp = document.body.classList.contains('chatium_body');
            const hasGcAccountLeftbar = document.querySelector('.gc-account-leftbar');
            const isAppEnvironment = isChatiumApp || !hasGcAccountLeftbar;

            function openGoogleCalendar() {
              const calendarUrl = new URL('https://calendar.google.com/calendar/render');
              calendarUrl.searchParams.set('action', 'TEMPLATE');
              calendarUrl.searchParams.set('text', eventTitle);
              calendarUrl.searchParams.set('details', eventDesc);
              calendarUrl.searchParams.set('dates', `${start}/${end}`);
              calendarUrl.searchParams.set('ctz', userTimeZone);
              window.open(calendarUrl.toString(), '_blank');
            }

            function openAppleCalendar() {
              const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "BEGIN:VEVENT",
                `SUMMARY:${eventTitle}`,
                `DESCRIPTION:${eventDesc}`,
                `DTSTART;TZID=${userTimeZone}:${start}`,
                `DTEND;TZID=${userTimeZone}:${end}`,
                "END:VEVENT",
                "END:VCALENDAR"
              ].join("\n");

              const blob = new Blob([icsContent], { type: 'text/calendar' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${eventTitle}.ics`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }

            if (isSafari) {
              showCalendarChoicePopup({
                onGoogle: openGoogleCalendar,
                onApple: openAppleCalendar,
              });
            } else {
              openGoogleCalendar();
            }
          });

          record.appendChild(btn);
        }
      });
    });
  }

  function showCalendarChoicePopup({ onGoogle, onApple }) {
    const overlay = document.createElement('div');
    overlay.className = 'calendar-choice-overlay';

    const popup = document.createElement('div');
    popup.className = 'calendar-choice-popup';

    popup.innerHTML = `
      <div class="calendar-choice-title">Выберите календарь для добавления события</div>
      <button class="calendar-choice-btn google-btn">Google Календарь</button>
      <button class="calendar-choice-btn apple-btn">Apple Календарь</button>
      <button class="calendar-choice-close">Отмена</button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    popup.querySelector('.google-btn').addEventListener('click', () => {
      onGoogle();
      closePopup();
    });
    popup.querySelector('.apple-btn').addEventListener('click', () => {
      onApple();
      closePopup();
    });
    popup.querySelector('.calendar-choice-close').addEventListener('click', closePopup);

    function closePopup() {
      document.body.removeChild(overlay);
    }
  }
});
