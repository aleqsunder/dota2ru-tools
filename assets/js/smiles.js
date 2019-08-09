/**
 *	Добавление смайла в стеш окна редактора смайлов
 */
function add ({a, bool})
{
	if (typeof a == 'object')
	{
		var	name = a.name || __('fullpage finder input[name="name"]').value,
			tab = a.tab || __('fullpage finder input[name="tab"]').value,
			value = a.src || __('fullpage finder input[name="src"]').value,
			canEdit = (a.canEdit == 'true')? 'true' : 'false',
			width = a.width || '',
			height = a.height || '';
	}
	else
	{
		var	name = a || __('fullpage finder input[name="name"]').value,
			tab = __('fullpage finder input[name="tab"]').value || 'Без категории',
			value = storageCache[a] || __('fullpage finder input[name="src"]').value,
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
	
	__('fullpage finder input[name="name"]').value = '';
	__('fullpage finder input[name="src"]').value = '';
	
	if (!__(`tab[alt="${tab}"]`, smileList))
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
			
			__('listed', smileSett).appendChild( dom(
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
	
	__(`tab[alt='${tab}']`, smileList).appendChild( dom(`
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
		__(`list[data-smile="${name}"]`, smileList).classList.add('created');
	});
}

/**
 *	Удаление смайла
 */
function del (name)
{ 
	var el = __(`list[data-smile="${name}"]`);
	
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
	var list = __(`list[data-smile="${name}"] smile-settings`),
		cha = __('fullpage chan'),
		canEdit = __('canedit', list).innerHTML,
		canEditText = (canEdit == 'true')? 'Изменение разрешено' : 'Не изменять размер смайла';
		
	__('canedit', cha).textContent = canEditText;
	__('canedit', cha).classList = canEdit;
	
	__('input[name=width]', cha).value = __('width', list).innerHTML;
	__('input[name=height]', cha).value = __('height', list).innerHTML;
	__('input[name=tab]', cha).value = __('tab', list).innerHTML;
	
	__('bottom fing', cha).setAttribute('onclick', `chan('${name}')`);
	
	adoor('chan');
}

/**
 *	Настройка смайла
 */
function chan (name)
{
	var from = __('fullpage chan'),
		to = __(`list[data-smile="${name}"] smile-settings`),
		canEdit = __('canEdit', from).classList[0];
	
	__('canEdit', to).textContent = canEdit;
	__('tab', to).textContent = __('input[name=tab]', from).value;
	
	if (canEdit == 'true')
	{
		if (Number.parseInt(__('input[name=width]', from).value) != '' ||
			Number.parseInt(__('input[name=height]', from).value) != '')
		{
			__('width', to).textContent = __('input[name=width]', from).value;
			__('height', to).textContent = __('input[name=height]', from).value;
		}
	}
	
	save();
}

/**
 *	Включение окна редактирования индивидуального смайла
 */
function CEtoggle ()
{
	var obj = __('chan canedit'),
		helper = __('chan helper');
	
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
 *	Сохранение смайлов
 */
function save ()
{
	var tabs = [], tabes = JSON.parse(localStorage.getItem('cath'));
	localStorage.setItem(chess, JSON.stringify({}));
	
	$_('list', smileList).forEach
	( function(a) {
		var value = 
		{
			name: __('input[data-name]', a).value,
			src: __('input[data-value]', a).value,
			canEdit: __('smile-settings canEdit', a).innerHTML,
			width: __('smile-settings width', a).innerHTML,
			height: __('smile-settings height', a).innerHTML,
			tab: __('smile-settings tab', a).innerHTML
		},	index = findOf(tabes, value.tab);
		
		if (index < 0)
			tabes[lastOf(tabes)] = {name: value.tab, index: '100'};
		
		setStorage(value.name, JSON.stringify(value));
	});
	
	tabes.forEach
	( function (a, b) {
		var hddn = 'false';
		
		if (__(`tab[alt="${a.name}"]`, smileList).classList.contains('minimized'))
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
	__('fullpage saveTo textarea').value = JSON.stringify( _getStorage() );
}

/**
 *	Подгрузка смайлов с пака пользователя к своим смайлам
 */
function loadFrom (bool)
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = (bool)? __('blockquote.messageText .quoteContainer p')
		: __('fullpage loadfrom textarea'),
		
		your = (typeof storageCache == 'string')? JSON.parse(storageCache) : storageCache,
		load = (bool)? ((typeof area.innerText == 'string')? JSON.parse(area.innerText) : area.innerText)
		: ((typeof area.value == 'string')? JSON.parse(area.value) : area.value),
		
		oth = Object.assign(load, your);
		
	localStorage.setItem(chess, JSON.stringify(oth));
	area.value = '';
	
	// Ну и сразу получаем готовенькое
	storageCache = _getStorage();
	reload();
	
	save();
	
	openAlert({text: 'Смайлы загружены!'});
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
	var stu = __('fullpage savetouser'),
		info = __('information', stu),
		username = __('input', stu).value;
	
	info.innerHTML = 'Загрузка..';
	
	fetch(`https://dota2.ru/forum/search?type=user&keywords=${username}&sort_by=username`)
	.then(function(response){
		return response.text();
	})
	.then(function(html){		
		var you = __('div.hello .username').innerHTML,
			userdocument = __('.member-list-item .avatar', dom(html).ownerDocument),
			href = userdocument.href.split('/'),
			id = href[href.length - 2].split('.')[1],
			avatar = __('img', userdocument).src;
	
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