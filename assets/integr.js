var asetting = document.querySelector('setting'),
	smileList = document.querySelector('setting smile-list'),
	chess = 'a-dota2smiles', storageCache = _getStorage();

Object.keys(storageCache).forEach
( function (name) { add(name, storageCache[name]) });

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
	
	closeASetting();
}

function openASetting ()
{ asetting.classList.add('open') }

function closeASetting ()
{ asetting.classList.remove('open') }

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