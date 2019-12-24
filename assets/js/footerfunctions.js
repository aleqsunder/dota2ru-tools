
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
	tinyButtons = [{
		name: 'code',
		title: 'Код',
		onclick: 'dist.call(this)',
		fa: 'code'
	}, {
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
	}, {
		name: 'font-background',
		title: 'Выделенный текст',
		onclick: 'dist.call(this)',
		fa: 'adn'
	}
];
	
/**
 * Загрузка локальных файлов
 *
 * @param string url
 *
 * @return promise
 */
function upload (url) {
    return fetch(getURL(url))
        .then ( function (response) { return response.text() })
        .then ( function (html) { return html });
}

/**
 * Отправка запроса вызова ф-ии в background
 *
 * @param string url
 *
 * @return promise
 */
function sendCall (name, value) {
    var cV = JSON.parse(get('callerVariable', true)),
        value = JSON.stringify(value) || "{}";
    
    cV[name] = value;
    set('callerVariable', JSON.stringify(cV), true);
}

/**
 * Кастомный log
 *
 * @param string item
 */
function log (text) {
    console.log(`%cD2S - forumhelper%c ${text}`,
      `background: #333; color:#FFF; padding: 3px 8px; border-radius: 6px;`, ``
    );
}

/**
 * Установка ключа localstorage
 *
 * @param string item
 * @param string str
 * @param boolean a
 */
function set (item, str, a) {
    a = a == null ? 'setting--' : '';
    localStorage.setItem(`${a}${item}`, str);
}

/**
 * Получение ключа localstorage
 *
 * @param string item
 * @param boolean a
 *
 * @return string
 */
function get (item, a) {
    a = a == null ? 'setting--' : '';
    return localStorage.getItem(`${a}${item}`);
}

/**
 * Удаление ключа localstorage
 *
 * @param string item
 * @param boolean a
 */
function remove (item, a) {
    a = a == null ? 'setting--' : '';
    localStorage.removeItem(`${a}${item}`);
}

/**
 * Проверка наличия ключа localstorage
 *
 * @param string item
 * @param boolean a
 *
 * @return string
 */
function has (item, a) {
    a = a == null ? 'setting--' : '';
    var b = localStorage.getItem(`${a}${item}`);
    
    if (b == 'null')
        return false;
    else return b;
}

/**
 * Сокращённый sessionStorage на будущее
 */
const ss = {
	/*** Получение */
	get: (item) => {
		return JSON.parse(sessionStorage.getItem(item));
	},
	
	/*** Добавление/изменение */
	set: (item, value) => {
		sessionStorage.setItem(item, JSON.stringify(value));
	},
	
	/*** Удаление */
	remove: (item) => {
		sessionStorage.removeItem(item);
	},
	
	/*** Проверка на наличие */
	has: function (item) {
		return this.get(item) !== null ? true : false;
	}
}

/**
 * Загрузка разрешённых стилей и скриптов
 *
 * @param array capt
 */
function load (capt) {
    capt.forEach((a) => {
        var name = a.split('.')[0],
            type = a.split('.')[1],
            elem = type == 'css' ? 'style' : type == 'js' ? 'script' : 'user';

        if (get(name) == 'false') return false;
        else set(name, 'true');

        if (a.indexOf('.') > -1) {
            fetch(chrome.extension.getURL(`/assets/${type}/${name}.${type}`)).then(function(response){
                return response.text();
            }).then(function(html){
                createDom({
                    name: elem,
                    html: html,
                    bounty: {name: name, value: true}
                });
            });
        } else {
            setTimeout(() => {
                let html = JSON.parse(get(`${a}-css`));
                createDom ({
                    name: 'style',
                    html: html,
                    bounty: {name: a, value: ''}
                });
            });
        }
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
function watching ({doc, elem, callback, bool}) {
	var interval = setInterval(() => {
		doc = (doc)? doc : document;
		
		if (el = doc.querySelector(`${elem}:not(.watched)`)) {
			callback(el);
			el.classList.add('watched');
			
			if (!bool) clearInterval(interval);
		}
	}, 100);
}

/**
 *	Создаёт DOM объект из string
 *  Ограничение в одиночный тег
 *
 *	@param string html
 *
 *	@return HTMLElement
 */
function dom (html) {
	return new DOMParser().parseFromString(html, 'text/html').querySelector('body').childNodes[0];
}

/**
 *	Создаёт DOM объект из html и отправляет в head
 *
 *	@param string html
 *
 *	@return HTMLElement
 */
function createDom ({name, html, classes, bounty}) {
    var el = document.createElement(name);
        el.innerHTML = html || '';
    
    if (classes) el.classList = classes;
    if (bounty) el.setAttribute(bounty.name, bounty.value);
    
    document.head.appendChild(el);
}

/**
 * Создание DOM
 *
 * @param string tag
 * @param object data
 *
 * @return HTMLElement
 */
class createDM {
	constructor (tag, data) {
		this.dom = document.createElement(tag);
		this.data = data;
		
		this.collect();
		return this.dom;
	}
	
	conv (item) {
		return item.replace(/([A-Z])/g, "-$1").toLowerCase();
	}
	
	collect () {
		for (let i in this.data) {
			let item = this.data[i];
			
			switch (i) {
				 // Присвоение ID
				case "id":
					this.dom.id = item;
				break;
				
				 // Присвоение class[list]
				case "class":
					this.dom.classList.add(item);
				break;
				case "classList":
					for (let j of item)
						this.dom.classList.add(j);
				break;
				
				 // Присвоение attribute[list]
				case "attribute":
					for (let j in item)
						this.dom.setAttribute(this.conv(j), item[j])
				break;
				
				 // Присвоение innerText
				case "text":
					this.dom.innerText = item;
				break;
				 
				 // Присвоение innerHTML
				case "html":
					this.dom.innerHTML = item;
				break;
				
				 // Присвоение outerHTML
				case "_html":
					this.dom.outerHTML = item;
				break;
				
				 // Присвоение style[list]
				case "style":
					for (let j in item)
						this.dom.style.setProperty(this.conv(j), item[j]);
				break;
				
				default:
					console.warn(`Недопустимый параметр [${i}: ${item}]`);
				break;
			}
		}
	}
}

/**
 * Возвращает URL от расширения
 *
 * @param string path
 *
 * @return string
 */
function getURL (path) { return chrome.extension.getURL(path) }

/**
 * Возвращает значение иначе сохраняет его
 *
 * @param string key
 * @param mixed  value
 *
 * @return mixed
 */
function putStorage (key, value) {
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
function hasStorage (key) { return key in storageCache }

/**
 * Возвращает их хранилища
 *
 * @param string key
 * @param mixed  value
 *
 * @return mixed
 */
function getStorage (key, value) {
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
function setStorage (key, value) {
	storageCache = _getStorage();
	storageCache[key] = value;
	set(chess, JSON.stringify(storageCache), true);

	return storageCache[key];
}

/**
 * Возвращает полностью хранилище
 *
 * @private
 *
 * @return object
 */
function _getStorage () {
	var storage = get(chess, true);

	if (storage === null)
		storage = {};
	
	else
		storage = JSON.parse(storage);

	return storage;
}

function change (type, name, value) {
    switch (type) {
        case 'success':
            qs(name).innerText = `Успешно > ${value}`;
            qs(name).style.setProperty('background', '#00bfff', 'important');
        break;
            
        case 'failed':
            qs(name).innerText = `Ошибка > ${value}`;
            qs(name).style.setProperty('background', 'red', 'important');
        break;
            
        case 'init':
            qs(name.text).innerText = value;
            qs(name.text).style.setProperty('background', '#00bfff', 'important');
            qs(name.button).style.setProperty('height', '0px', 'important');
            qs(name.button).style.setProperty('opacity', '0', 'important');
        break;
            
        case 'finally':
            qs(name).style.setProperty('height', '27px', 'important');
            qs(name).style.setProperty('opacity', '1', 'important');
        break;
    }
}