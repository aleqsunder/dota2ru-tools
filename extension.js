/**
 *	Загрузка разрешённых стилей и скриптов
 */

/* Скрипты */
load ('footerfunctions.js');
load ('queryfinder.js');
load ('reservecopy.js');
load ('smiles.js');
load ('categories.js');
load ('alert.js');

/* Форумные сообщения */
if (forumpostMods.indexOf(mode) > -1)
{
	load ('forumpost.css');
	load ('forumpost.js');
}

/* Хлебные крошки */
if (mode == 'threads')
{
	load ('breadcrumb.css');
	load ('breadcrumb.js');
}

/* Форумный редактор */
load ('forumredactor.css');
load ('forumredactor.js');

/* Стили пользователя */
load ('userstyles');

/* Чат на главной */
watching
({
	elem: 'head title',
	
	callback: function (el)
	{
		if (mode == 'unknown' && document.querySelector('head title').innerHTML == 'Форум Dota 2')
		{
			load ('chat.css');
			load ('chat.js');
		}
	}
});

/**
 *	Начало
 */

document.addEventListener
("DOMContentLoaded", () => {
	var index = -2, button, tabs, name_title = 'Собственные',
		reloadInterval = setInterval(reload, 3000);
		
		
	if (mode == 'conversation')
	{
		var butt = document.querySelector('blockquote.messageText.baseHtml');
		
		if (butt)
		{
			if (butt.querySelector('p').innerHTML
				.indexOf('У вас не установлено расширение для использования кастомных смайлов') > -1)
			{
				butt.querySelector('p').outerHTML = '';
				butt.appendChild
				(dom(
				`<quotebutton onclick='loadFrom(true)'>
					Активировать себе
				</quotebutton>`
				));
			}
		}
	};

	/**
	 *	Обновление элементов и сортировка по алфавиту
	 */
	function reload ()
	{
		list = [];
		Object.keys(storageCache).forEach
		( function (name) {
			var sc = JSON.parse(storageCache[name]);
			
			if (sc.name)
			{
				// Раскрыл для наглядности
				if (sc.canEdit == 'true')
				{
					list.push
					({
						'name': sc.name,
						'src': sc.src,
						'canEdit': sc.canEdit,
						'width': sc.width,
						'height': sc.height
					});
				}
				else
				{
					list.push
					({
						'name': sc.name,
						'src': sc.src,
						'canEdit': sc.canEdit
					});
				}
			}
		});
		
		list.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
	}

	reload();

	/**
	 *	Шаг нулевой - определение страницы настроек
	 */
	fetch(getURL('/assets/settings.html'))
	.then(function(response){
		return response.text();
	})
	.then(function(html){
		html = dom(html);
		
		document.body.insertBefore(html, document.body.firstChild);
		
		watching
		({
			elem: 'div.userbar',
			callback: function (el)
			{
				el.insertBefore( dom(`
					<a class='icon' onclick="adoor('smiles')">
						<i class="fa fa-wrench"></i>
					</a>
				`), el.querySelector('a[title="Сообщения"]'));
				 
				load ('integrate.js');
				load ('checkversion.js');
			}
		});
	});

	/**
	 *	Если tinyMCE есть на страницах, то продолжить
	 */
	if (tinyMods.indexOf(mode) > -1)
	{
		/**
		 *	Шаг первый - отслеживание timyMCE и присваивание кнопке второго шага
		 */
		watching
		({
			elem: 'div[aria-label="Смайлы"]',
			bool: true,
			
			callback: function (el)
			{
				el.addEventListener('click', createPanel, false);
			}
		});

		/**
		 *	Шаг второй - отслеживание появления блока смайлов
		 */
		function createPanel ()
		{
			watching
			({
				elem: 'div.smiles-panel ul.tabs',
				
				callback: function ()
				{
					el.querySelectorAll('a').forEach
					( function (a){
						var page = JSON.parse(get('page', this)),
							a = a;
							// получаемая переменная может работать только в пределах своей ф-ии
						
						// Проверяем, есть ли вообще такой объект в локалке
						if (page)
						{
							Object.keys(page).forEach
							( function (b) {
								var index = parseInt(a.dataset.cat.toString());
								
                                if (page[index] != undefined)
                                {
                                    a.textContent = page[index].name;

                                    if (page[index].is == false)
                                        a.style = 'display: none';
                                }
                                else
                                {
                                    page[index] = {name: a.textContent, is: true};
                                    set('page', JSON.stringify(page), true);
                                    log(`Обнаружена новая вкладка - ${a.textContent}`);
                                }
							});
						}
					});
					
					el.insertBefore( dom(`
						<li class='tab-title'>
							<a href="#smile-cat-${index}" data-cat="${index}">${name_title}</a>
						</li>
					`), el.firstChild);
					
					// Приступаем к созданию контента
					var content = document.querySelector('div.smiles-panel div.tabs-content'),
						div = dom(`<div id='smile-cat-${index}' class='content'></div>`);
					
					// Перебираем все смайлы
					for (var i = 0; i < list.length; i++)
					{
						/**
						 *	Чтобы не ловить фейспалмы потом от canEdit='hooe' и прочее
						 */
						var v = list[i],
							shortcut = (v.canEdit == 'true')
							? `canEdit=true&height=${v.height}&width=${v.width}`
							: `canEdit=false`;
						
						div.appendChild( dom(`
							<div class='smile-content'>
								<a href="#" data-shortcut="${shortcut}" data-mce-url="${v.src}" tabindex="${index}" title=":${v.name}:">
									<img src="${v.src}" role="presentation">
								</a>
							</div>
						`));
					}
					
					content.appendChild(div);
				}
			});
		}
	}
});