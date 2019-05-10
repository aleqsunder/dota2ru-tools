/**
 *	Неизменяемые переменные
 */
const version = '0.0.5.1', tinyMods = [ 'threads', 'conversation', 'settings' ],
	otherMods = [ 'conversations', 'category', 'forums', 'notifications', 'unknown' ];

/**
 *	Все основные переменные для удобства
 */
var afp = _('fullpage'),
	smileSett = _('smiles category', afp),
	smileList = _('smile-list', afp),
	asspages = $_('asett pages[name="pagesetting"] page', afp),
	asstabes = _('asett pages[name="tabsetting"]', afp),
	assscroll = _('asett pages[name="scrollbar"]', afp),
	chess = 'a-dota2smile', storageCache = _getStorage(), 
	storagePage = JSON.parse(localStorage.getItem('page')), 
	cath = JSON.parse(localStorage.getItem('cath')), 
	alert = _('alert', afp), list = [], aflag = true,
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
		var input = _('input[type="checkbox"]', a),
			name = _('input[type="text"]', a);
			
		name.value = storagePage[input.value.toString()].name;
		input.checked = storagePage[input.value.toString()].is;
	});
	
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	asstabes.innerHTML = '';
	
	if (!cath)
	{
		localStorage.setItem('cath', `{"0":{"name":"Без категории","index":"100","hidden":"false"}}`);
		cath = JSON.parse(localStorage.getItem('cath'));
	}
	
	var arraytabes = [];
	
	_('listed', smileSett).innerHTML = '';
	
	Object.keys(cath).forEach
	(function (tab) {
		tab = cath[tab];
		console.log(tab, tab.name, tab.index);
		
		arraytabes.push({ name: tab.name, index: tab.index, hidden: tab.hidden });
		
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
			return parseFloat(a.index) - parseFloat(b.index);
		});
		
		arraytabes.forEach
		( function (a) {
			var isOpen = (a.hidden == 'true')? 'plus' : 'minus',
				classed = (a.hidden == 'true')? 'class="minimized"' : '';
			
			console.log(a.hidden);
			
			smileList.appendChild( dom(
			`<tab alt='${a.name}' index='${a.index}' ${classed}>
				<hit>
					${a.name}
					
					<items>
						<remove class='fa fa-eraser' onclick="delTab('${a.name}')"></remove>
						<close class='fa fa-${isOpen}' onclick="ahide('${a.name}')"></close>
					</items>
				</hit>
			</tab>`));
			
			_('listed', smileSett).appendChild
			(dom(`<tab alt='${a.name}' index='${a.index}' onclick="takeTab('${a.name}')">${a.name}</tab>`));
		});
	}
	
	// Если обнаружены смайлы старого образца - конвертация в новый и обновление
	if (localStorage.getItem('a-dota2smiles'))
	{
		chess = 'a-dota2smiles';
		storageCache = _getStorage();
		
		Object.keys(storageCache).forEach
		( function (name) { add({a: name}) });
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
	list.forEach(function (a) { add({a: a}) });
}

reload();

// Если новая версия
if (localStorage.getItem('version') != version)
{
	if (!localStorage.getItem('first'))
	{
		adoor('wellcome');
		
		var qn = $_('wellcome qn', afp),
			len = qn.length,
			i = 0, timer = 0;
		
		function trytodoit () {
			if (i < 1)
			{
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			else
			{
				qn[i-1].style = '';
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			
			i++;
			timer = qn[i-1].innerText.length * 52;
			
			if (i < len)
			{
				setTimeout(trytodoit, timer);
			}
			else
			{
				setTimeout
				( function () {
					adoor('wellcome');
					
					localStorage.setItem('first', 'est zhi');
					localStorage.setItem('version', version);
				}, timer)
			}
		}
		
		trytodoit();
	}
	else
	{
		localStorage.setItem('version', version);
		openAlert({
			wait: true,
			
			titleOf: `Обновление`,
			text: `Добро пожаловать в новую версию ${version}!<br>
			<br>
			<a href='https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/'>Для ознакомления нажмите здесь</a><br>
			Уведомление высвечивается лишь раз после каждого обновления, чтобы уведомить вас о том, что ваше расширение успешно обновлено<br>
			<br>
			Приятного использования!`
		});
	}
}

// Переносить ради такого фунцкцию из extension не вижу смысла, плюс нужно её переделать
setInterval
( function () {
	// Получаем активный tinyMCE
	if (typeof tinymce != 'undefined' && tinymce.activeEditor)
	{ var content = tinymce.activeEditor.contentDocument }
	
	if (content)
	{
		var head = _('head style:not(.resized)', content);
		
		// Проверяем, существуют ли (для стабильности, проскакивает "of null")
		if (head)
		{
			// Добавляем стили и присваиваем класс, чтобы больше на глаза не попадался
			head.innerHTML += 'img[data-smile][data-shortcut="canEdit=false"] { width: auto; height: 30px; }';
			head.classList.add('resized');
		}
		
		var allCont = $_('img[data-smile]:not(.resized)', content);
		
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
function add ({a, bool})
{
	if (typeof a == 'object')
	{
		var	name = a.name || _('fullpage finder input[name="name"]').value,
			tab = a.tab || _('fullpage finder input[name="tab"]').value,
			value = a.src || _('fullpage finder input[name="src"]').value,
			canEdit = (a.canEdit == 'true')? 'true' : 'false',
			width = a.width || '',
			height = a.height || '';
	}
	else
	{
		var	name = a || _('fullpage finder input[name="name"]').value,
			tab = _('fullpage finder input[name="tab"]').value || 'Без категории',
			value = storageCache[a] || _('fullpage finder input[name="src"]').value,
			canEdit = 'false',
			width = '',
			height = '';
	}
	
	if (!bool && tab == '')
	{
		tab = 'Без категории';
	}
	else
		if (tab == '')
			tab = 'Без категории';
	
	_('fullpage finder input[name="name"]').value = '';
	_('fullpage finder input[name="src"]').value = '';
	
	if (!_(`tab[alt="${tab}"]`, smileList))
	{
		if (bool == 'true' && tab != '')
		{
			var itis = 'minus',
				classed = '';
			
			smileList.appendChild( dom(
			`<tab alt='${tab}' ${classed}>
				<hit>
					${tab}
					
					<items>
						<remove class='fa fa-eraser' onclick="delTab('${tab}')"></remove>
						<close class='fa fa-${itis}' onclick="ahide('${tab}')"></close>
					</items>
				</hit>
			</tab>`));
			
			_('listed', smileSett).appendChild( dom(
			`<tab alt='${tab}' index="100" onclick="takeTab('${tab}')">${tab}</tab>`));
			
			asstabes.appendChild
			( dom(
				`<page class='check' tab='${tab}'>
					<input type='text' mode="withoutfone" name='index' value='100'>
					<input type='text' mode="withoutfone" name='tab' value='${tab}'>
				</page>`
			));
			
			var arraytab = [];
			
			Object.keys(cath).forEach
			( function (a) {
				var val = cath[a];
				arraytab.push(val);
			})
			
			arraytab.push({ "name": tab, "index": "100", "hidden": "false" })
			localStorage.setItem('cath', JSON.stringify(arraytab));
		}
		else
		{
			tab = 'Без категории';
		}
	}
	
	_(`tab[alt='${tab}']`, smileList).appendChild( dom(`
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
		_(`list[data-smile="${name}"]`, smileList).classList.add('created');
	});
}

/**
 *	Взятие категории
 */
function takeTab (tab)
{ _('input', smileSett).value = tab }

/**
 *	Удаление категории
 */
function delTab (tab, bool)
{
	if (bool === true)
	{
		_(`page[tab="${tab}"]`, asstabes).outerHTML = '';
		_(`listed tab[alt="${tab}"]`, smileSett).outerHTML = '';
		_(`tab[alt="${tab}"]`, smileList).outerHTML = '';
		
		array = [];
		
		Object.keys(cath).forEach
		( function (a) {
			b = cath[a];
			
			if (b.name != tab)
				array.push(b);
		});
		
		cath = array;
		localStorage.setItem('cath', JSON.stringify(cath));
	}
	else
	{
		openAlert
		({
			wait: true,
			titleOf: 'Удаление категории',
			text: `Вы уверены, что хотите удалить категорию ${tab}?<br>
				Это действие невозможно отменить!<br><br>`,
			button: [{ callback: `delTab('${tab}', true)`, value: "Удалить" }]
		});
	}
}

/**
 *	Сворачивание таба
 */
function ahide (tab)
{
	var tab = _(`tab[alt="${tab}"]`, smileList),
		close = _('hit close', tab);
		
	tab.classList.toggle('minimized');
	
	close.classList.toggle('fa-minus');
	close.classList.toggle('fa-plus');
}

/**
 *	Удаление смайла
 */
function del (name)
{ 
	var el = _(`list[data-smile="${name}"]`);
	
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
	var list = _(`list[data-smile="${name}"] smile-settings`),
		cha = _('fullpage chan'),
		canEdit = _('canedit', list).innerHTML,
		canEditText = (canEdit == 'true')? 'Изменение разрешено' : 'Не изменять размер смайла';
		
	_('canedit', cha).textContent = canEditText;
	_('canedit', cha).classList = canEdit;
	
	_('input[name=width]', cha).value = _('width', list).innerHTML;
	_('input[name=height]', cha).value = _('height', list).innerHTML;
	_('input[name=tab]', cha).value = _('tab', list).innerHTML;
	
	_('bottom fing', cha).setAttribute('onclick', `chan('${name}')`);
	
	adoor('chan');
}

/**
 *	Настройка смайла
 */
function chan (name)
{
	var from = _('fullpage chan'),
		to = _(`list[data-smile="${name}"] smile-settings`),
		canEdit = _('canEdit', from).classList[0];
	
	_('canEdit', to).textContent = canEdit;
	_('tab', to).textContent = _('input[name=tab]', from).value;
	
	if (canEdit == 'true')
	{
		if (Number.parseInt(_('input[name=width]', from).value) != '' ||
			Number.parseInt(_('input[name=height]', from).value) != '')
		{
			_('width', to).textContent = _('input[name=width]', from).value;
			_('height', to).textContent = _('input[name=height]', from).value;
		}
	}
	
	save();
}

/**
 *	Включение окна редактирования индивидуального смайла
 */
function CEtoggle ()
{
	var obj = _('chan canedit'),
		helper = _('chan helper');
	
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
	
	$_('list', smileList).forEach
	( function(a) {
		var value = 
		{
			name: _('input[data-name]', a).value,
			src: _('input[data-value]', a).value,
			canEdit: _('smile-settings canEdit', a).innerHTML,
			width: _('smile-settings width', a).innerHTML,
			height: _('smile-settings height', a).innerHTML,
			tab: _('smile-settings tab', a).innerHTML
		},	index = findOf(tabes, value.tab);
		
		if (index < 0)
			tabes[lastOf(tabes)] = {name: value.tab, index: '100'};
		
		setStorage(value.name, JSON.stringify(value));
	});
	
	tabes.forEach
	( function (a, b) {
		var hddn = 'false';
		
		if (_(`tab[alt="${a.name}"]`, smileList).classList.contains('minimized'))
			hddn = 'true';
		
		tabs[b] = {name: a.name, index: a.index, hidden: hddn}
	});
	
	localStorage.setItem('cath', JSON.stringify(tabs));
	cath = JSON.parse(localStorage.getItem('cath'));
	
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
	_('fullpage saveTo textarea').value = JSON.stringify( _getStorage() );
}

/**
 *	Подгрузка смайлов с пака пользователя к своим смайлам
 */
function loadFrom (bool)
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = (bool)? _('blockquote.messageText .quoteContainer p')
		: _('fullpage loadfrom textarea'),
		
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
	var pages = $_("asett pages[name='pagesetting'] page"),
		tabs = $_("asett pages[name='tabsetting'] page"),
		arrayPage = {}, arrayTab = {}, j = 0;
		
	pages.forEach
	( function (a) {
		var input = _('input[type="checkbox"]', a),
			name = _('input[type="text"]', a).value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	localStorage.setItem('page', JSON.stringify(arrayPage));
	storagePage = arrayPage;
	
	tabs.forEach
	( function (a) {
		var index = _('input[name="index"]', a).value,
			tab = _('input[name="tab"]', a).value,
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
	
	openAlert
	({
		titleOf: 'Настройки',
		text: 'Отображение изменено по вашему усмотрению!'
	});
}

/**
 *	Автоматически поделиться с указанным пользователем
 */
function sendSmiles ({you, to, username})
{
	var you = you, user = to, username = username,
		title = `[d2s] ${you} => ${username}`,
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
				openAlert
				({
					titleOf: 'Работа со смайлами',
					text: 'Пак смайлов отправлен!'
				});
				
				adoor('savetouser');
				adoor('saveto');
			}
			else
			{
				openAlert({text: 'Ошибка'});
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
	var stu = _('fullpage savetouser'),
		info = _('information', stu),
		username = _('input', stu).value;
	
	info.innerHTML = 'Загрузка..';
	
	fetch(`https://dota2.ru/forum/search?type=user&keywords=${username}&sort_by=username`)
	.then(function(response){
		return response.text();
	})
	.then(function(html){		
		var you = _('div.hello .username').innerHTML,
			userdocument = _('.member-list-item .avatar', dom(html).ownerDocument),
			href = userdocument.href.split('/'),
			id = href[href.length - 2].split('.')[1],
			avatar = _('img', userdocument).src;
	
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
	
	if (!_('.open', afp))
	{
		afp.classList.toggle('open');
		afp.classList.toggle('margin');
	}
	
	_(`backfon.${elem}`, afp).classList.toggle('open');
	if (flag = _(elem, afp).classList.toggle('open'))
	{
		_(`backfon.${elem}`, afp).classList.toggle('margin');
		_(elem, afp).classList.toggle('margin');
	}
	else
	{
		setTimeout
		( function () {
			_(`backfon.${elem}`, afp).classList.toggle('margin');
			_(elem, afp).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!_('.open', afp))
	{
		setTimeout
		( function () {
			afp.classList.toggle('open');
			afp.classList.toggle('margin');
		}, 400);
	}
}

/**
 *	Управление уведомлениями
 */
function openAlert ({text, wait, button, titleOf})
{
	if (titleOf == 'none') _('top', alert).style.setProperty('display', 'none');
	var header = titleOf || 'Уведомление';
	
	_('top', alert).textContent = header;
	_('middle', alert).innerHTML = text;
	
	adoor('alert');
	
	if (wait)
	{
		if (button)
		{
			alert.appendChild
			( dom (`
				<bottom></bottom>
			`));
			
			bottom = _('bottom', alert);
			
			button.forEach
			( function (a) { 
				console.log(a);
				bottom.appendChild
				( dom(`
					<fing onclick="${a.callback}; adoor('alert'); this.parentElement.outerHTML = '';">
						${a.value}
					</fing>
				`));
			});
		}
		
		// На случай бесконечного уведомления возможность закрыть
		_('fullpage backfon.alert').setAttribute
		(
			'onclick',
			`adoor('alert'); this.querySelector('bottom').outerHTML = ''; this.querySelector('top').style = ''; this.onclick = 'return false;'`
		);
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

/**
 *	С любовью к Negezor
 */

function dom (html)
{
	return _('body', new DOMParser().parseFromString(html, 'text/html')).childNodes[0];
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

/**
 * 	Сниппет для одного элемента
 *
 * 	@param string selector
 * 	@param object context
 *
 * 	@return nodeElement
 */
function _ (selector,context) {
	return $_(selector,context)[0] || null;
}

/**
 * 	Производительный QuerySelector
 *
 * 	@param string selector
 * 	@param object context
 *
 * 	@return array
 */
function $_ (selector,context) {
	context = context || document;

	if (!/^(#?[\w-]+|\.[\w-.]+)$/.test(selector)) {
		return Array.prototype.slice.call(context.querySelectorAll(selector));
	}

	switch (selector.charAt(0)) {
		case '#':
			return [context.getElementById(selector.substr(1))];
		case '.':
			return Array.prototype.slice.call(context.getElementsByClassName(
				selector.substr(1).replace(/\./g,' ')
			));
		default:
			return Array.prototype.slice.call(context.getElementsByTagName(selector));
	}
}