document.addEventListener("DOMContentLoaded", function () {
    const leftBar = document.querySelector(".gc-account-leftbar");
    const toggleBtn = document.createElement("li");

    toggleBtn.classList.add("menu-item", "collapse-toggle");
    toggleBtn.innerHTML = `
        <a href="javascript:void(0)" title="Свернуть меню">
            <img class="menu-item-icon" src="/public/img/service/collapse.png" alt="Toggle">
        </a>
    `;

    // Добавляем кнопку "Служба заботы"
    const supportBtn = document.createElement("li");
    supportBtn.classList.add("menu-item");
    supportBtn.innerHTML = `
        <a href="https://t.me/ya_zabota" title="Служба заботы">
            <img class="menu-item-icon" src="/public/img/service/support.png" alt="Служба заботы">
            <span></span>
        </a>
    `;

    const menu = document.querySelector(".gc-account-user-menu");
    if (menu) {
        menu.appendChild(supportBtn);
        menu.appendChild(toggleBtn);
    }

    toggleBtn.addEventListener("click", async function () {
        await closeAllSubmenus();
        leftBar.classList.toggle("collapsed");
    });

    const menuItems = document.querySelectorAll(".gc-account-user-menu .menu-item:not(.collapse-toggle)");
    menuItems.forEach(item => {
        item.addEventListener("click", async function (e) {
            if (leftBar.classList.contains("collapsed")) {
                leftBar.classList.remove("collapsed");

                setTimeout(() => {
                    this.querySelector("a")?.click();
                }, 100);

                return;
            }

            if (item.classList.contains("menu-item-profile") || item.classList.contains("menu-item-notifications_button_small")) {
                return;
            }

            const isAlreadySelected = item.classList.contains("select");

            await closeAllSubmenus();

            if (isAlreadySelected) return;

            item.classList.add("select");
            await waitForSubmenuLoad();
            await openSubmenu(item);
        });
    });

    async function closeAllSubmenus() {
        const promises = [];
        menuItems.forEach(el => {
            if (el.classList.contains("select")) {
                promises.push(closeSubmenu(el));
            } else {
                resetMenuItem(el);
            }
        });
        await Promise.all(promises);
    }

    async function closeSubmenu(menuItem) {
        return new Promise(resolve => {
            const submenu = menuItem.querySelector(".custom-submenu-bar");
            const link = menuItem.querySelector("a");

            if (!submenu) {
                resetMenuItem(menuItem);
                menuItem.classList.remove("select");
                return resolve();
            }

            if (link) link.style.transition = "height 0.3s ease";
            menuItem.style.transition = "height 0.3s ease";

            const submenuItems = submenu.querySelectorAll("li");
            submenuItems.forEach((submenuItem, index) => {
                setTimeout(() => {
                    submenuItem.style.transition = "opacity 0.2s, transform 0.2s";
                    submenuItem.style.opacity = 0;
                    submenuItem.style.transform = "translateY(-10px)";
                }, index * 50);
            });

            submenu.classList.remove("open");

            setTimeout(() => {
                if (link) link.style.height = '66px';
                menuItem.style.height = '66px';
            }, 10);

            setTimeout(() => {
                submenu.style.display = "none";
                resetMenuItem(menuItem);
                menuItem.classList.remove("select");
                if (link) link.style.transition = "";
                menuItem.style.transition = "";
                resolve();
            }, 300);
        });
    }

    async function openSubmenu(menuItem) {
        const submenu = document.querySelector(".gc-account-user-submenu");
        if (!submenu) return;

        let newSubmenu = menuItem.querySelector(".custom-submenu-bar");
        const link = menuItem.querySelector("a");

        if (!newSubmenu) {
            const newSubmenuHTML = `
                <div class="custom-submenu-bar" style="margin-top: 10px; display: none;">
                    <ul class="custom-submenu"></ul>
                </div>
            `;
            menuItem.insertAdjacentHTML("beforeend", newSubmenuHTML);
            newSubmenu = menuItem.querySelector(".custom-submenu-bar");
        }

        const customSubmenu = newSubmenu.querySelector(".custom-submenu");
        customSubmenu.innerHTML = "";
        submenu.querySelectorAll("li").forEach(submenuItem => {
            const clonedItem = submenuItem.cloneNode(true);
            clonedItem.style.opacity = 0;
            clonedItem.style.transform = "translateY(-10px)";
            customSubmenu.appendChild(clonedItem);
        });

        newSubmenu.style.display = "block";

        if (link) link.style.transition = "height 0.3s ease";
        menuItem.style.transition = "height 0.3s ease";

        setTimeout(() => {
            newSubmenu.classList.add("open");
        }, 10);

        const submenuItems = customSubmenu.querySelectorAll("li");
        submenuItems.forEach((submenuItem, index) => {
            setTimeout(() => {
                submenuItem.style.transition = "opacity 0.3s, transform 0.3s";
                submenuItem.style.opacity = 1;
                submenuItem.style.transform = "translateY(0)";
            }, index * 100);
        });

        setTimeout(() => {
            const submenuHeight = newSubmenu.scrollHeight;
            menuItem.style.height = `${submenuHeight + 12}px`;
            if (link) link.style.height = `${submenuHeight + 12}px`;
        }, 50);
    }

    function resetMenuItem(menuItem) {
        if (!menuItem.classList.contains("menu-item-profile") && !menuItem.classList.contains("menu-item-notifications_button_small")) {
            menuItem.style.height = '66px';
            const link = menuItem.querySelector("a");
            if (link) link.style.height = '66px';
        }
    }

    function waitForSubmenuLoad() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector(".gc-account-user-submenu")) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
  // Наблюдаем за изменениями в DOM
  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Проверяем, появились ли нужные элементы
        const profileElement = document.querySelector(".gc-account-user-submenu-bar-profile");
        const notificationsElement = document.querySelector(".gc-account-user-submenu-bar-notifications_button_small");

        if (profileElement && !profileElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу profile
          addCloseButton(profileElement);
        }

        if (notificationsElement && !notificationsElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу notifications
          addCloseButton(notificationsElement);
        }
      }
    }
  });

  // Указываем элемент, за которым следим
  const targetNode = document.querySelector("body");
  observer.observe(targetNode, { childList: true, subtree: true });

  // Функция добавления крестика
  function addCloseButton(parentElement) {
    const closeButton = document.createElement("div");
    closeButton.className = "close-button";
    closeButton.innerHTML = `
      <img 
        src="https://static.tildacdn.com/tild6566-6530-4235-a537-666432303963/close.svg" 
        alt="Закрыть" 
        style="width: 15px; height: 15px; cursor: pointer;" 
      />
    `;
    parentElement.prepend(closeButton);

    // Добавляем обработчик клика на крестик
    closeButton.addEventListener("click", function () {
      parentElement.style.display = "none";
    });
  }
});
