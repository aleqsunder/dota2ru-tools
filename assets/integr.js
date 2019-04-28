var afullpage = document.querySelector('fullpage'),
	smileList = document.querySelector('fullpage smile-list'),
	asspages = document.querySelectorAll('asett pages input'),
	chess = 'a-dota2smiles', storageCache = _getStorage(), 
	storagePages = JSON.parse(localStorage.getItem('pages')), 
	alert = document.querySelector('fullpage alert'),
	version = '0.0.3';

// Обновление списка до текущей версии
function reload ()
{
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	
	Object.keys(storageCache).forEach
	( function (name) { add(name, storageCache[name]) });
	
	if (!storagePages)
	{
		// Спасибо Поняхе за найденный баг
		localStorage.setItem('pages', `{"1":true,"5":true,"6":true,"7":true,"9":true,"11":true,"14":true,"16":true,"17":true,"18":true,"-1":true}`);
	}
	
	asspages.forEach
	( function (a) {
		console.log(a.value, a.value.toString());
		a.checked = storagePages[a.value.toString()];
	});
}

reload();

if (localStorage.getItem('version') != version)
{
	localStorage.setItem('version', version);
	openAlert({
		wait: true,
		
		text: `Добро пожаловать в новую версию `+ version +`!<br>
		<br>
		Для ознакомления нажмите <a href='https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/'>здесь</a><br>
		Уведомление высвечивается лишь раз после каждого обновления, чтобы уведомить вас о том, что ваше расширение успешно обновлено<br>
		<br>
		Приятного использования!`
	});
}

// Переносить ради такого фунцкцию из extension не вижу смысла, плюс нужно её переделать
setInterval
( function () {
	var content = tinymce.get('forumPost').contentDocument;
	
	if (content)
	{
		content.querySelector('head style').innerHTML += 'img[data-smile] { width: 30px; height: 30px; }';
		
		var allCont = content.querySelectorAll('img[data-smile]:not(.resized)');
		
		if (allCont.length > 0)
		{
			allCont.forEach(function (a) {
				a.width = '30';
				a.height = '30';
				
				a.classList.add('resized');
			})
		}
	}
}, 500);

function add (name, value)
{
	name = (name)? name : document.querySelector('fullpage finder input[name="name"]').value;
	value = (value)? value : document.querySelector('fullpage finder input[name="src"]').value;
	
	document.querySelector('fullpage finder input[name="name"]').value = '';
	document.querySelector('fullpage finder input[name="src"]').value = '';
	
	smileList.appendChild( createDOM(`
		<list data-smile='`+ name +`'>
			<input name='name' data-name='`+ name +`' value='`+ name +`'>
			<img src='`+ value +`'>
			<input name='value' data-value='`+ value +`' value='`+ value +`'>
			<del class="fa fa-minus" onclick="del('`+ name +`')"></del>
		</list>
	`));
}

function del (name)
{ document.querySelector('list[data-smile="'+ name +'"]').outerHTML = '' }

function save ()
{
	localStorage.setItem('a-dota2smiles', JSON.stringify({}));
	
	smileList.querySelectorAll('list').forEach
	( function(a) {
		a.style.setProperty('background', '#343434');
		
		var name = a.querySelector('input[data-name]').value,
			src = a.querySelector('input[data-value]').value;
			
		console.log(name, src);
		setStorage(name, src);
	});
	
	storageCache = _getStorage();
	reload();
	
	openAlert({text: 'Ваши смайлы сохранены!'});
}

function saveTo ()
{
	save();
	document.querySelector('fullpage saveTo textarea').value = JSON.stringify( _getStorage() );
	
	openAlert({text: 'Скопируйте Ваши смайлы, чтобы поделиться!'});
}

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

function savePages ()
{
	var pages = document.querySelectorAll('asett pages input'),
		array = {};
		
	pages.forEach
	( function (a, i) {
		array[a.value] = a.checked;
	});
	
	console.log(array);
	
	localStorage.setItem('pages', JSON.stringify(array));
	
	openAlert({text: 'Отображение изменено по вашему усмотрению!'});
}

function adoor (elem)
{
	if (!afullpage.querySelector('.open'))
		afullpage.classList.toggle('open');
	
	afullpage.querySelector('backfon.'+ elem).classList.toggle('open');
	var flag = afullpage.querySelector(elem).classList.toggle('open');
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!afullpage.querySelector('.open'))
		afullpage.classList.toggle('open');
}

function openAlert ({text, wait})
{
	alert.querySelector('middle').innerHTML = text;
	
	adoor('alert');
	
	if (wait)
	{
		document.querySelector('fullpage backfon.alert').setAttribute('onclick', `adoor('alert'); this.onclick = 'return false;'`);
	}
	else
	{
		setTimeout
		(function () {
			adoor('alert');
		}, 2000);
	}
}

function createDOM (html)
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