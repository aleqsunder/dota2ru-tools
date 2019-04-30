/**
 *	Переменные
 */
let index = -2, button, tabs, name = 'Собственные', chess = 'a-dota2smile', storageCache = _getStorage(),
	list = [], reloadInterval = setInterval(reload, 3000);

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
fetch(getURL('/assets/sett.tmp'))
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
			`), el.querySelector('a[title="Настройки"]'));
			
			/**
			 *	Да-да, только теперь можно подгружать динамический JS на страницу, и только отдельным файлом
			 *	Тегом script браузер просто проигнорирует)0
			 */
			 
			fetch(getURL('/assets/integr.js'))
			.then(function(response){
				return response.text();
			})
			.then(function(body){
				var script = document.createElement('script');
				script.innerHTML = body;
				
				document.head.appendChild(script);
			});
		}
	});
});

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
				var pages = JSON.parse(localStorage.getItem('pages')),
					a = a;
					// получаемая переменная может работать только в пределах своей ф-ии
				
				// Проверяем, есть ли вообще такой объект в локалке
				if (pages)
				{
					Object.keys(pages).forEach
					( function (b, index) {
						var index = a.dataset.cat.toString();
						
						if (pages[index] == false)
						{
							a.style = 'display: none';
						}
					});
				}
			});
			
			el.insertBefore( dom(`
				<li class='tab-title'>
					<a href="#smile-cat-`+ index +`" data-cat="`+ index +`">`+ name +`</a>
				</li>
			`), el.firstChild);
			
			// Приступаем к созданию контента
			var content = document.querySelector('div.smiles-panel div.tabs-content'),
				div = dom(`<div id='smile-cat-`+ index + `' class='content'></div>`);
			
			// Перебираем все смайлы
			for (var i = 0; i < list.length; i++)
			{
				/**
				 *	Чтобы не ловить фейспалмы потом от canEdit='hooe' и прочее
				 */
				var v = list[i],
					shortcut = (v.canEdit == 'true')
					? 'canEdit=true&height=' + v.height + '&width=' + v.width
					: 'canEdit=false';
				
				div.appendChild( dom(`
					<div class='smile-content'>
						<a href="#" data-shortcut="`+ shortcut +`" data-mce-url="`+ v.src +`" tabindex="`
							+ index +`" title=":`+ v.name +`:">
							<img src="`+ v.src +`" role="presentation">
						</a>
					</div>
				`));
			}
			
			content.appendChild(div);
		}
	});
}

/**
 *	Создаёт DOM объект из string
 *
 *	@param string html
 *
 *	@return object
 */
function dom (html)
{ return new DOMParser().parseFromString(html, 'text/html').querySelector('body').childNodes[0] }

/**
 *	Следит за появлением объекта в DOM сайта
 *	Цикл не прекращается, если указан флаг bool
 *
 *	@param string elem
 *	@param function callback
 *	@param boolean bool
 */ 
function watching ({doc, elem, callback, bool})
{
	var interval = setInterval
	( function () {
		doc = (doc)? doc : document;
		
		if (el = doc.querySelector(elem +':not(.watched)'))
		{
			callback(el);
			el.classList.add('watched');
			
			if (!bool) clearInterval(interval);
		}
	}, 100);
}

/**
 * Возвращает URL от расширения
 *
 * @param string path
 *
 * @return string
 */
function getURL (path)
{ return chrome.extension.getURL(path) }

/**
 * Возвращает значение иначе сохраняет его
 *
 * @param string key
 * @param mixed  value
 *
 * @return mixed
 */
function putStorage (key, value)
{
	var storage = getStorage(key);

	if (storage === null) 
		return setStorage(key, value);

	return storage;
}

/**
 * Проверяет наличие в локальном хранилище
 *
 * @param string key
 *
 * @return boolean
 */
function hasStorage (key)
{ return key in storageCache }

/**
 * Возвращает их хранилища
 *
 * @param string key
 * @param mixed  value
 *
 * @return mixed
 */
function getStorage (key, value)
{
	if (hasStorage(key))
		return storageCache[key];

	return value !== undefined? value : null;
}

/**
 * Устанавливает значение в хранилище
 *
 * @param string key
 * @param mixed  value
 *
 * @return mixed
 */
function setStorage (key, value)
{
	storageCache = _getStorage();
	storageCache[key] = value;

	localStorage.setItem(chess, JSON.stringify(storageCache));

	return storageCache[key];
}

/**
 * Возвращает полностью хранилище
 *
 * @private
 *
 * @return object
 */
function _getStorage ()
{
	var storage = localStorage.getItem(chess);

	if (storage === null)
		storage = {};
	
	else
		storage = JSON.parse(storage);

	return storage;
}