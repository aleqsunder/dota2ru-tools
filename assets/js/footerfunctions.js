/**
 * Общие переменные
 */
var chess = 'a-dota2smile',
	mode = document.location.href.match(/forum\/(.*?)\//),
	mode = (mode != null)? mode[1] : 'unknown',
	list = [],
	storageCache = _getStorage(),
	tinyMods = [ 'threads', 'conversation', 'settings' ],
	forumpostMods = [ 'threads', 'conversation' ],
	otherMods = [ 'category', 'notifications', 'unknown' ],
	tinyButtons = 
	[
		{
			name: 'code',
			title: 'Код',
			onclick: 'dist.call(this)',
			fa: 'code'
		},
		{
			name: 'font-size',
			title: 'Размер шрифта',
			onclick: 'dist.call(this)',
			fa: 'text-height',
			content: 
				`<input onkeyup='fontChange.call(this)' onclick='openfontsizes();' class='a-input' type="number" name="font-size" min="8" max="72" placeholder="11px">
				<font-size>
					<is onclick='fontChange.call(this)'>8</is>
					<is onclick='fontChange.call(this)'>12</is>
					<is onclick='fontChange.call(this)'>14</is>
					<is onclick='fontChange.call(this)'>18</is>
					<is onclick='fontChange.call(this)'>24</is>
					<is onclick='fontChange.call(this)'>36</is>
					<is onclick='fontChange.call(this)'>64</is>
					<is onclick='fontChange.call(this)'>72</is>
				</font-size>`
		},
		{
			name: 'font-background',
			title: 'Выделенный текст',
			onclick: 'dist.call(this)',
			fa: 'adn'
		}
	];
	
/**
 * Загрузка разрешённых стилей и скриптов
 *
 * @param string capt
 */
function load (capt)
{
	var name = capt.split('.')[0],
		type = capt.split('.')[1],
		elem = type == 'css' ? 'style' : 'script';
	
	if (localStorage.getItem(`setting--${name}`) == 'false') return false;
	else localStorage.setItem(`setting--${name}`, 'true');
	
	fetch(chrome.extension.getURL(`/assets/${type}/${name}.${type}`))
	.then(function(response){
		return response.text();
	})
	.then(function(html){
		var el = document.createElement(elem);
		el.innerHTML = html;
		
		document.head.appendChild(el);
		console.log(`${name}.${type} загружен успешно`);
	});
}

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
		
		if (el = doc.querySelector(`${elem}:not(.watched)`))
		{
			callback(el);
			el.classList.add('watched');
			
			if (!bool) clearInterval(interval);
		}
	}, 100);
}

/**
 *	Создаёт DOM объект из string
 *
 *	@param string html
 *
 *	@return HTMLElement
 */
function dom (html)
{
	return new DOMParser()
				.parseFromString(html, 'text/html')
				.querySelector('body')
				.childNodes[0];
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