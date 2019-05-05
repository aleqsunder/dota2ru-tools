/**
 *	Неизменяемые переменные
 */
const version = '0.0.5', tinyMods = [ 'threads', 'conversation' ],
	otherMods = [ 'conversations', 'category', 'forums', 'notifications', 'settings', 'unknown' ];

/**
 *	Все основные переменные для удобства
 */
var afullpage = document.querySelector('fullpage'),
	smileList = document.querySelector('fullpage smile-list'),
	asspages = document.querySelectorAll('asett pages[name="pagesetting"] page'),
	asstabes = document.querySelector('asett pages[name="tabsetting"]'),
	chess = 'a-dota2smile', storageCache = _getStorage(), 
	storagePage = JSON.parse(localStorage.getItem('page')), 
	cath = JSON.parse(localStorage.getItem('cath')), 
	alert = document.querySelector('fullpage alert'), list = [], aflag = true,
	mode = document.location.href.match(/forum\/(.*?)\//), mode = (mode != null)? mode[1] : 'unknown';

/**
 *	Обновление элементов сайта под текущие значения
 */
function reload ()
{
	if (localStorage.getItem('pages'))
		localStorage.removeItem('pages');
	
	if (!localStorage.getItem('page'))
	{
		localStorage.setItem('page', `{"1":{"name":"Стандартные","is":true},"5":{"name":"Твич","is":true},"6":{"name":"Разное","is":true},"7":{"name":"Dota 2 анимированные","is":true},"9":{"name":"Dota 2 герои","is":true},"11":{"name":"Аниме","is":true},"14":{"name":"Пепа","is":true},"16":{"name":"Dota 2 предметы","is":true},"17":{"name":"LoL","is":true},"18":{"name":"Твич-герои","is":true},"-1":{"name":"Популярные","is":true}}`);
		storagePage = JSON.parse(localStorage.getItem('page'));
	}
	
	// Переприсваиваем все разрешённые вкладки смайлов
	asspages.forEach
	( function (a) {
		var input = a.querySelector('input[type="checkbox"]'),
			name = a.querySelector('input[type="text"]');
			
		name.value = storagePage[input.value.toString()].name;
		input.checked = storagePage[input.value.toString()].is;
	});
	
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	asstabes.innerHTML = '';
	
	if (!cath)
	{
		localStorage.setItem('cath', `{"0":{"name":"Без категории","index":"100","undeletable":"true"}}`);
		cath = JSON.parse(localStorage.getItem('cath'));
	}
	
	var arraytabes = [];
	
	Object.keys(cath).forEach
	(function (tab) {
		tab = cath[tab];
		console.log(tab, tab.name, tab.index);
		
		arraytabes.push
		( dom(
			`<tab alt='${tab.name}' index='${tab.index}'>
				<hit>${tab.name} <close class='fa fa-minus' onclick="ahide('${tab.name}')"></close></hit>
			</tab>`
		));
		
		asstabes.appendChild
		( dom(
			`<page class='check' tab='${tab.name}'>
				<input type='text' mode="withoutfone" name='index' value='${tab.index}'>
				<input type='text' mode="withoutfone" name='tab' value='${tab.name}'>
			</page>`
		));
	});
	
	if (arraytabes)
	{
		arraytabes.sort
		( function (a, b) {
			return parseFloat(a.getAttribute('index')) - parseFloat(b.getAttribute('index'));
		});
		
		arraytabes.forEach
		( function (a) {
			smileList.appendChild(a);
		});
	}
	
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
					'tab': (sc.tab || sc.tab == '')? sc.tab : 'Без категории',
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
					'tab': (sc.tab || sc.tab == '')? sc.tab : 'Без категории',
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
		
		text: `Добро пожаловать в новую версию ${version}!<br>
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
	if (typeof tinymce != 'undefined' && tinymce.activeEditor)
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
						
						a.width = (list.width != '')? list.width : a.width;
						a.height = (list.height != '')? list.height : a.height;
						
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
			tab = (a.tab)? a.tab : document.querySelector('fullpage finder input[name="tab"]').value,
			value = (a.src)? a.src : document.querySelector('fullpage finder input[name="src"]').value,
			canEdit = (a.canEdit == 'true')? 'true' : 'false',
			width = (a.width)? a.width : '',
			height = (a.height)? a.height : '';
	}
	else
	{
		var	name = (a)? a : document.querySelector('fullpage finder input[name="name"]').value,
			tab = document.querySelector('fullpage finder input[name="tab"]').value,
			value = (storageCache[a])? storageCache[a] : document.querySelector('fullpage finder input[name="src"]').value,
			canEdit = 'false',
			width = '',
			height = '';
	}
	
	if (tab == '') tab = 'Без категории';
	
	document.querySelector('fullpage finder input[name="name"]').value = '';
	document.querySelector('fullpage finder input[name="src"]').value = '';
	
	if (!smileList.querySelector('tab[alt="'+ tab + '"]'))
		smileList.appendChild( dom(
		`<tab alt='${tab}'>
			<hit>${tab} <close class='fa fa-minus' onclick="ahide('${tab}')"></close></hit>
		</tab>`));
	
	smileList.querySelector(`tab[alt='${tab}']`).appendChild( dom(`
			<list data-smile='${name}'>
				<input name='name' data-name='${name}' value='${name}'>
				<img src='${value}'>
				<input name='value' data-value='${value}' value='${value}'>
				<del class="fa fa-text-height" onclick="ch('${name}')"></del>
				<del class="fa fa-minus" onclick="del('${name}')"></del>
				
				<smile-settings>
					<canedit>${canEdit}</canedit>
					<width>${width}</width>
					<height>${height}</height>
					<tab>${tab}</tab>
				</smile-settings>
			</list>
		`));
	
	setTimeout
	( function () {
		smileList.querySelector(`list[data-smile="${name}"]`).classList.add('created');
	});
}

/**
 *	Сворачивание таба
 */
function ahide (tab)
{
	var tab = smileList.querySelector('tab[alt="'+ tab +'"]'),
		close = tab.querySelector('hit close');
		
	tab.classList.toggle('minimized');
	
	close.classList.toggle('fa-minus');
	close.classList.toggle('fa-plus');
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
		
	cha.querySelector('canedit').textContent = canEditText;
	cha.querySelector('canedit').classList = canEdit;
	cha.querySelector('input[name=width]').value = list.querySelector('width').innerHTML;
	cha.querySelector('input[name=height]').value = list.querySelector('height').innerHTML;
	cha.querySelector('input[name=tab]').value = list.querySelector('tab').innerHTML;
	
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
	
	to.querySelector('canEdit').textContent = canEdit;
	to.querySelector('tab').textContent = from.querySelector('input[name=tab]').value;
	
	if (canEdit == 'true')
	{
		if (Number.parseInt(from.querySelector('input[name=width]').value) != '' ||
			Number.parseInt(from.querySelector('input[name=height]').value) != '')
		{
			to.querySelector('width').textContent = from.querySelector('input[name=width]').value;
			to.querySelector('height').textContent = from.querySelector('input[name=height]').value;
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
	var tabs = [], tabes = JSON.parse(localStorage.getItem('cath'));
	localStorage.setItem(chess, JSON.stringify({}));
	
	smileList.querySelectorAll('list').forEach
	( function(a) {
		var value = 
		{
			name: a.querySelector('input[data-name]').value,
			src: a.querySelector('input[data-value]').value,
			canEdit: a.querySelector('smile-settings canEdit').innerHTML,
			width: a.querySelector('smile-settings width').innerHTML,
			height: a.querySelector('smile-settings height').innerHTML,
			tab: a.querySelector('smile-settings tab').innerHTML
		},	index = findOf(tabes, value.tab);
		
		if (index < 0)
			tabes[lastOf(tabes)] = {name: value.tab, index: '100'};
		
		setStorage(value.name, JSON.stringify(value));
	});
	
	localStorage.setItem('cath', JSON.stringify(tabes));
	storageCache = _getStorage();
	reload();
	
	openAlert({text: 'Ваши смайлы сохранены!'});
}

function findOf (obj, name)
{
	for (var a = 0; a < lastOf(obj); a++)
		if (obj[a].name == name) return a;
	
	return '-1';
}

function lastOf (obj)
{
	var length = 0;
	
	Object.keys(obj).forEach
	( function () {
		length++;
	});
	
	return length;
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
function loadFrom (bool)
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = (bool)? document.querySelector('blockquote.messageText .quoteContainer p')
		: document.querySelector('fullpage loadfrom textarea'),
		
		your = (typeof storageCache == 'string')? JSON.parse(storageCache) : storageCache,
		load = (bool)? ((typeof area.innerText == 'string')? JSON.parse(area.innerText) : area.innerText)
		: ((typeof area.value == 'string')? JSON.parse(area.value) : area.value),
		
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
	var pages = document.querySelectorAll("asett pages[name='pagesetting'] page"),
		tabs = document.querySelectorAll("asett pages[name='tabsetting'] page"),
		arrayPage = {}, arrayTab = {}, j = 0;
		
	pages.forEach
	( function (a) {
		var input = a.querySelector('input[type="checkbox"]'),
			name = a.querySelector('input[type="text"]').value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	localStorage.setItem('page', JSON.stringify(arrayPage));
	storagePage = arrayPage;
	
	tabs.forEach
	( function (a) {
		var index = a.querySelector('input[name="index"]').value,
			tab = a.querySelector('input[name="tab"]').value,
			oldtab = a.getAttribute('tab');
			
		arrayTab[j] = {name: tab, index: index};
		j++;
		
		if (tab != oldtab)
		{
			Object.keys(storageCache).forEach
			( function (a) {
				var el = JSON.parse(storageCache[a]);
				
				console.log(el.tab, tab);
				if (el.tab == oldtab)
				{
					el.tab = tab;
					setStorage(el.name, JSON.stringify(el));
				}
			});
		}
	});
	
	localStorage.setItem('cath', JSON.stringify(arrayTab));
	cath = arrayTab;
	
	reload();
	
	openAlert({text: 'Отображение изменено по вашему усмотрению!'});
}

/**
 *	Автоматически поделиться с указанным пользователем
 */
function sendSmiles ({you, to, username})
{
	var you = you, user = to, username = username,
		title = '[d2s] '+ you +' => '+ username,
		content =
		`<p><a href="https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/" data-mce-href="https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/" data-mce-selected="inline-boundary">У вас не установлено расширение для использования кастомных смайлов<br>Для продолжения проследуйте сюда.</a></p>
		<div class="bbCodeBlock bbCodeQuote">
			<blockquote class="quoteContainer">
				<p>${JSON.stringify( _getStorage() )}</p>
			</blockquote>
		</div>`;
	
	void requestHandler.ajaxRequest
	("/api/message/createConversation",
		{ title: title, content: content, recipient: user },
		
		function (response)
		{
			if (response.status == 'success')
			{
				openAlert({text: 'Пак смайлов отправлен!'});
				
				adoor('savetouser');
				adoor('saveto');
			}
			else
			{
				openAlert({text: 'Ошибка: некорректный никнейм пользователя'});
				console.log(response);
			}
		}
	)
}

/**
 *	Проверка пользователя на существование
 */
function findUser ()
{
	var stu = document.querySelector('fullpage savetouser'),
		info = stu.querySelector('information'),
		username = stu.querySelector('input').value;
	
	info.innerHTML = 'Загрузка..';
	
	fetch('https://dota2.ru/forum/search?type=user&keywords='+ username +'&sort_by=username')
	.then(function(response){
		return response.text();
	})
	.then(function(html){		
		var you = document.querySelector('div.hello .username').innerHTML,
			userdocument = dom(html).ownerDocument.querySelector('.member-list-item .avatar'),
			href = userdocument.href.split('/'),
			id = href[href.length - 2].split('.')[1],
			avatar = userdocument.querySelector('img').src;
	
		info.innerHTML =
		`<avatar><img src='${avatar}'></avatar>
		<pass>
			<name><t>Имя</t> ${username}</name>
			<id><t>ID</t> ${id}</id>
			<confirmation>При подтверждении ниже будет создана переписка с пользователем, где ему будут предоставлены смайлы и кнопка, при нажатии на которую он сможет добавить смайлы себе. Вы уверены, что это тот самый пользователь?</confirmation>
			<fing onclick="sendSmiles({you: '${you}', to: '${id}', username: '${username}'})">Да, отправить</fing>
		</pass>`;
	});
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
	alert.querySelector('middle').textContent = text;
	
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
{
	return new DOMParser()
				.parseFromString(html, 'text/html')
				.querySelector('body')
				.childNodes[0];
}

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