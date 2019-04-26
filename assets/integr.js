var asetting = document.querySelector('setting'),
	smileList = document.querySelector('setting smile-list'),
	chess = 'a-dota2smiles', storageCache = _getStorage();

// Обновление списка до текущей версии
function reload ()
{
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	
	Object.keys(storageCache).forEach
	( function (name) { add(name, storageCache[name]) });
}

reload();

function add (name, value)
{
	name = (name)? name : document.querySelector('setting finder input[name="name"]').value;
	value = (value)? value : document.querySelector('setting finder input[name="src"]').value;
	
	document.querySelector('setting finder input[name="name"]').value = '';
	document.querySelector('setting finder input[name="src"]').value = '';
	
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
}

function saveTo ()
{
	save();
	document.querySelector('setting saveTo textarea').value = JSON.stringify( _getStorage() );
}

function loadFrom ()
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = document.querySelector('setting loadfrom textarea'),
		your = (typeof storageCache == 'string')? JSON.parse(storageCache) : storageCache,
		load = (typeof area.value == 'string')? JSON.parse(area.value) : area.value,
		oth = Object.assign(load, your);
		
	localStorage.setItem(chess, JSON.stringify(oth));
	area.value = '';
	
	// Ну и сразу получаем готовенькое
	storageCache = _getStorage();
	reload();
}

function openASetting ()
{ asetting.classList.add('open') }

function closeASetting ()
{ asetting.classList.remove('open') }

function adoor(elem)
{ 
	asetting.querySelector('backfon.'+ elem).classList.toggle('open');
	var flag = asetting.querySelector(elem).classList.toggle('open');
	
	if (elem == 'saveto' && flag)
		saveTo();
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