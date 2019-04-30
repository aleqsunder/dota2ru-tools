/**
 *	Все основные переменные для удобства
 */
var afullpage = document.querySelector('fullpage'),
	smileList = document.querySelector('fullpage smile-list'),
	asspages = document.querySelectorAll('asett pages input'),
	chess = 'a-dota2smile', storageCache = _getStorage(), 
	storagePages = JSON.parse(localStorage.getItem('pages')), 
	alert = document.querySelector('fullpage alert'), list = [], aflag = true,
	version = '0.0.4';

/**
 *	Обновление элементов сайта под текущие значения
 */
function reload ()
{
	if (!storagePages)
	{
		// Спасибо Поняхе за найденный баг
		localStorage.setItem('pages', `{"1":true,"5":true,"6":true,"7":true,"9":true,"11":true,"14":true,"16":true,"17":true,"18":true,"-1":true}`);
		storagePages = JSON.parse(localStorage.getItem('pages'));
	}
	
	// Переприсваиваем все разрешённые вкладки смайлов
	asspages.forEach
	( function (a) {
		a.checked = storagePages[a.value.toString()];
	});
	
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	
	// Если обнаружены смайлы старого образца - конвертация в новый и обновление
	if (localStorage.getItem('a-dota2smiles'))
	{
		chess = 'a-dota2smiles';
		storageCache = _getStorage();
		
		Object.keys(storageCache).forEach
		( function (name) { add(name) });
		localStorage.removeItem('a-dota2smiles');
		
		chess = 'a-dota2smile';
		save();
		
		console.log(_getStorage);
		
		document.location.reload();
		return false;
	}
	
	// Перебираем все текущие смайлы (с поддержкой старых версий) и сортируем по алфавиту
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
	list.forEach(function (a) { add(a) });
}

reload();

// Если новая версия
if (localStorage.getItem('version') != version)
{
	localStorage.setItem('version', version);
	openAlert({
		wait: true,
		
		text: `Добро пожаловать в новую версию `+ version +`!<br>
		<br>
		<a href='https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/'>Для ознакомления нажмите здесь</a><br>
		Уведомление высвечивается лишь раз после каждого обновления, чтобы уведомить вас о том, что ваше расширение успешно обновлено<br>
		<br>
		Приятного использования!`
	});
}

// Переносить ради такого фунцкцию из extension не вижу смысла, плюс нужно её переделать
setInterval
( function () {
	// Получаем активный tinyMCE
	if (typeof tinymce !== 'undefined')
	{ var content = tinymce.activeEditor.contentDocument }
	
	if (content)
	{
		var head = content.querySelector('head style:not(.resized)');
		
		// Проверяем, существуют ли (для стабильности, проскакивает "of null")
		if (head)
		{
			// Добавляем стили и присваиваем класс, чтобы больше на глаза не попадался
			head.innerHTML += 'img[data-smile][data-shortcut="canEdit=false"] { width: auto; height: 30px; }';
			head.classList.add('resized');
		}
		
		var allCont = content.querySelectorAll('img[data-smile]:not(.resized)');
		
		// Если есть неизменённые смайлы
		if (allCont.length > 0)
		{
			allCont.forEach(function (a) {
				var getter = a.dataset.shortcut,
					getters = getter.split('&'),
					list = {};
				
				if (a.dataset.shortcut.indexOf('=') > -1)
				{
					getters.forEach
					( function (b) {
						b = b.split('=');
						
						list[b[0]] = b[1];
					});
					
					// Проверяем, разрешили ли мы вообще изменять размер, мало ли
					if (list.canEdit == 'true')
					{
						/**
						 *	Но на всякий случай проверяем, указаны ли значения, ибо всякое бывает
						 */
						a.width = (list.width)? list.width : '';
						a.height = (list.height)? list.height : '';
						
						a.classList.add('resized');
					}
					else
					{
						a.height = '30';
						a.width = a.width;
					}
				}
				else
				{
					a.height = '30';
					a.width = a.width;
				}
			})
		}
	}
}, 200);

/**
 *	Добавление смайла в стеш окна редактора смайлов
 */
function add (a)
{
	if (typeof a == 'object')
	{
		var	name = (a.name)? a.name : document.querySelector('fullpage finder input[name="name"]').value,
			value = (a.src)? a.src : document.querySelector('fullpage finder input[name="src"]').value,
			canEdit = (a.canEdit == 'true')? 'true' : 'false',
			width = (a.width)? a.width : '',
			height = (a.height)? a.height : '';
	}
	else
	{
		/**
		 *	Конвертация из старого формата
		 */
		
		var	name = (a)? a : document.querySelector('fullpage finder input[name="name"]').value,
			value = (storageCache[a])? storageCache[a] : document.querySelector('fullpage finder input[name="src"]').value,
			canEdit = 'false',
			width = '',
			height = '';
	}
	
	document.querySelector('fullpage finder input[name="name"]').value = '';
	document.querySelector('fullpage finder input[name="src"]').value = '';
	
	smileList.appendChild( dom(`
		<list data-smile='`+ name +`'>
			<input name='name' data-name='`+ name +`' value='`+ name +`'>
			<img src='`+ value +`'>
			<input name='value' data-value='`+ value +`' value='`+ value +`'>
			<del class="fa fa-text-height" onclick="ch('`+ name +`')"></del>
			<del class="fa fa-minus" onclick="del('`+ name +`')"></del>
			
			<smile-settings>
				<canedit>`+ canEdit +`</canedit>
				<width>`+ width +`</width>
				<height>`+ height +`</height>
			</smile-settings>
		</list>
	`));
	
	setTimeout
	( function () {
		smileList.querySelector(`list[data-smile="`+ name +`"]`).classList.add('created');
	});
}

/**
 *	Удаление смайла
 */
function del (name)
{ 
	var el = document.querySelector('list[data-smile="'+ name +'"]');
	
	el.classList.remove('created')
	setTimeout
	( function () {
		el.outerHTML = '';
	}, 500 );
}

/**
 *	Открытие окна редактирования уникального смайла
 */
function ch (name)
{
	var list = document.querySelector('list[data-smile="'+ name +'"] smile-settings'),
		cha = document.querySelector('fullpage chan'),
		canEdit = list.querySelector('canedit').innerHTML,
		canEditText = (canEdit == 'true')? 'Изменение разрешено' : 'Не изменять размер смайла';
		
	cha.querySelector('canedit').innerHTML = canEditText;
	cha.querySelector('canedit').classList = canEdit;
	cha.querySelector('input[name=width]').value = list.querySelector('width').innerHTML;
	cha.querySelector('input[name=height]').value = list.querySelector('height').innerHTML;
	
	cha.querySelector('bottom fing').setAttribute('onclick', "chan('"+ name +"')");
	
	adoor('chan');
}

/**
 *	Настройка смайла
 */
function chan (name)
{
	var from = document.querySelector('fullpage chan'),
		to = document.querySelector('list[data-smile="'+ name +'"] smile-settings'),
		canEdit = from.querySelector('canEdit').classList[0];
	
	to.querySelector('canEdit').innerHTML = canEdit;
	
	if (canEdit == 'true')
	{
		if (Number.parseInt(from.querySelector('input[name=width]').value) != '')
		{
			to.querySelector('width').innerHTML = from.querySelector('input[name=width]').value;
			to.querySelector('height').innerHTML = from.querySelector('input[name=height]').value;
		}
	}
	
	save();
}

/**
 *	Включение окна редактирования индивидуального смайла
 */
function CEtoggle ()
{
	var obj = document.querySelector('chan canedit'),
		helper = document.querySelector('chan helper');
	
	if (obj.classList.contains('true'))
	{
		helper.innerHTML = 'Нажмите, чтобы разрешить изменение размера или<br>оставьте пустым для фиксированных сторон';
		obj.innerHTML = 'Не изменять размер смайла';
		obj.classList.remove('true');
		obj.classList.add('false');
	}
	else
	{
		helper.innerHTML = 'Укажите размер или оставьте поля пустыми,<br>чтобы изображение имело оригинальный размер';
		obj.innerHTML = 'Изменение разрешено';
		obj.classList.remove('false');
		obj.classList.add('true');
	}
}

/**
 *	Сохранение смайлов в LS
 */
function save ()
{
	localStorage.setItem(chess, JSON.stringify({}));
	
	smileList.querySelectorAll('list').forEach
	( function(a) {
		a.style.setProperty('background', '#343434');
		
		var value = 
		{
			name: a.querySelector('input[data-name]').value,
			src: a.querySelector('input[data-value]').value,
			canEdit: a.querySelector('smile-settings canEdit').innerHTML,
			width: a.querySelector('smile-settings width').innerHTML,
			height: a.querySelector('smile-settings height').innerHTML
		};
			
		setStorage(value.name, JSON.stringify(value));
	});
	
	storageCache = _getStorage();
	reload();
	
	openAlert({text: 'Ваши смайлы сохранены!'});
}

/**
 *	Отображение списка смайлов для того, чтобы поделиться с кем-либо
 */
function saveTo ()
{
	save();
	document.querySelector('fullpage saveTo textarea').value = JSON.stringify( _getStorage() );
	
	openAlert({text: 'Скопируйте Ваши смайлы, чтобы поделиться!'});
}

/**
 *	Подгрузка смайлов с пака пользователя к своим смайлам
 */
function loadFrom ()
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = document.querySelector('fullpage loadfrom textarea'),
		your = (typeof storageCache == 'string')? JSON.parse(storageCache) : storageCache,
		load = (typeof area.value == 'string')? JSON.parse(area.value) : area.value,
		oth = Object.assign(load, your);
		
	localStorage.setItem(chess, JSON.stringify(oth));
	area.value = '';
	
	// Ну и сразу получаем готовенькое
	storageCache = _getStorage();
	reload();
	
	openAlert({text: 'Смайлы загружены!'});
}

/**
 *	Сохранение списка страниц
 */
function savePages ()
{
	var pages = document.querySelectorAll('asett pages input'),
		array = {};
		
	pages.forEach
	( function (a, i) {
		array[a.value] = a.checked;
	});
	
	localStorage.setItem('pages', JSON.stringify(array));
	reload();
	
	openAlert({text: 'Отображение изменено по вашему усмотрению!'});
}

/**
 *	Смена страниц
 */
function adoor (elem)
{
	var flag = '';
	
	if (!afullpage.querySelector('.open'))
	{
		afullpage.classList.toggle('open');
		afullpage.classList.toggle('margin');
	}
	
	afullpage.querySelector('backfon.'+ elem).classList.toggle('open');
	if (flag = afullpage.querySelector(elem).classList.toggle('open'))
	{
		afullpage.querySelector('backfon.'+ elem).classList.toggle('margin');
		afullpage.querySelector(elem).classList.toggle('margin');
	}
	else
	{
		setTimeout
		( function () {
			afullpage.querySelector('backfon.'+ elem).classList.toggle('margin');
			afullpage.querySelector(elem).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!afullpage.querySelector('.open'))
	{
		setTimeout
		( function () {
			afullpage.classList.toggle('open');
			afullpage.classList.toggle('margin');
		}, 400);
	}
}

/**
 *	Управление уведомлениями
 */
function openAlert ({text, wait})
{
	alert.querySelector('middle').innerHTML = text;
	
	adoor('alert');
	
	if (wait)
	{
		// На случай бесконечного уведомления возможность закрыть
		document.querySelector('fullpage backfon.alert').setAttribute('onclick', `adoor('alert'); this.onclick = 'return false;'`);
	}
	else
	{
		// Временное уведомление закрывается само
		setTimeout
		(function () {
			adoor('alert');
		}, 2000);
	}
}

function dom (html)
{ return new DOMParser().parseFromString(html, 'text/html').querySelector('body').childNodes[0] }

function putStorage (key, value)
{
	var storage = getStorage(key);

	if (storage === null) 
		return setStorage(key, value);

	return storage;
}

function hasStorage (key)
{ return key in storageCache }

function getStorage (key, value)
{
	if (hasStorage(key))
		return storageCache[key];

	return value !== undefined? value : null;
}

function setStorage (key, value)
{
	storageCache = _getStorage();
	storageCache[key] = value;

	localStorage.setItem(chess, JSON.stringify(storageCache));

	return storageCache[key];
}

function _getStorage ()
{
	var storage = localStorage.getItem(chess);

	if (storage === null)
		storage = {};
	
	else
		storage = JSON.parse(storage);

	return storage;
}