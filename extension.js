/**
 *	Переменные
 */
let index = -2, button, tabs, name = 'Собственные', chess = 'a-dota2smiles', storageCache = _getStorage()
	list = [];

Object.keys(storageCache).forEach
( function (name) { list.push( {'name': name, 'src': storageCache[name]} ) });

/**
 *	Шаг нулевой - определение страницы настроек
 */
fetch(getURL('/assets/sett.tmp'))
.then(function(response){
	return response.text();
})
.then(function(html){
	html = createDOM(html);
	
	document.body.insertBefore(html, document.body.firstChild);
	
	watching('div.userbar', function (el)
	{
		el.insertBefore( createDOM(`
			<a class='icon' onclick="openASetting()">
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
	});
});

/**
 *	Шаг первый - отслеживание timyMCE и присваивание кнопке второго шага
 */
watching('div[aria-label="Смайлы"]', function (el)
{
	el.addEventListener('click', createPanel, false);
}, true);

/**
 *	Шаг второй - отслеживание появления блока смайлов
 */
function createPanel ()
{
	watching('div.smiles-panel ul.tabs', function ()
	{
		el.insertBefore( createDOM(`
			<li class='tab-title'>
				<a href="#smile-cat-`+ index +`" data-cat="`+ index +`">`+ name +`</a>
			</li>
		`), el.firstChild);
		
		// Приступаем к созданию контента
		var content = document.querySelector('div.smiles-panel div.tabs-content'),
			div = createDOM(`<div id='smile-cat-`+ index + `' class='content'></div>`);
		
		// Перебираем все смайлы
		for (var i = 0; i < list.length; i++)
		{
			div.appendChild( createDOM(`
				<div class='smile-content'>
					<a href="#" data-shortcut=":`+ list[i].name +`:" data-mce-url="`+ list[i].src +`" tabindex="`
						+ index +`" title=":`+ list[i].name +`:">
						<img src="`+ list[i].src +`" role="presentation">
					</a>
				</div>
			`));
		}
		
		content.appendChild(div);
	});
}

/**
 *	Создаёт DOM объект из string
 *
 *	@param string html
 *
 *	@return object
 */
function createDOM (html)
{ return new DOMParser().parseFromString(html, 'text/html').querySelector('body').childNodes[0] }

/**
 *	Следит за появлением объекта в DOM сайта
 *	Цикл не прекращается, если указан флаг bool
 *
 *	@param string elem
 *	@param function callback
 *	@param boolean bool
 */ 
function watching (elem, callback, bool)
{
	var interval = setInterval
	( function () {
		if (el = document.querySelector(elem +':not(.watched)'))
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