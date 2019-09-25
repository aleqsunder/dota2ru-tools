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
			set('cath', JSON.stringify(arraytab), true);
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
	
	openWindow('chan');
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
	var tabs = [], tabes = JSON.parse(get('cath', true));
	set(chess, JSON.stringify({}), true);
	
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
	
	set('cath', JSON.stringify(tabs), true);
	cath = JSON.parse(get('cath', true));
	
	storageCache = _getStorage();
	reload();
    
    sendCall('saveSmiles');
	
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
 *	Объединение двух массивов с объектами
 */
function collapseObjects (array)
{
    let a = array[0],
        b = array[1];
    
    for (name in a)
    {
        if (b[name] === undefined)
        {
            b[name] = a[name];
        }
    }
    
    return b;
}

function collapseMassives (array)
{
    return array[0].concat(array[1].filter((one) => {
       return !array[0].find((el) => el.name === one.name);
    }))
}

/**
 *	Проверка пользователя на существование + подгрузка смайлов
 */
function findUser ()
{
	var main = __('savetouser'),
		info = __('information', main),
		username = __('input[username]', main).value;
	
	info.innerHTML = 'Загрузка..';
	
    sendCall('findUsersmiles', {
        username: __('input', main).value
    });
}

/**
 * Подгрузка смайлов - объединение и сохранение
 */
function saveLoadedSmiles ()
{
    var main = __('savetouser'),
        obj = __('information[savetouser]', main),
        bottom = __('bottom', main),
        smiles = JSON.parse(__('input[smiles]', main).value),
        cath = JSON.parse(__('input[cath]', main).value),
        newSmiles = collapseObjects ([smiles, storageCache]),
        newCath = collapseMassives ([JSON.parse(get('cath', true)), cath]);
    
    set('cath', JSON.stringify(newCath), true);
    
    set(chess, JSON.stringify(newSmiles), true);
    storageCache = _getStorage();
    
	reload();
    
    openWindow('savetouser');
    
    bottom.innerHTML = '';
    obj.innerHTML = '';
    
    openAlert({text: 'Смайлы пользователя добавлены к вашим!'});
}

function changePassword ()
{
    let v = 'changepassword';
    
    change('init', { text: `${v} ifpasschanged`, button: `${v} bottom fing` },
       'Идёт отправка запроса на смену пароля'
    );
    
    sendCall('changePassword', {
        old: __('input[oldpass]').value,
        to: __('input[newpass]').value
    });
}

function stayPassword ()
{
    let v = 'staypassword';
    
    change('init', { text: `${v} ifpasschanged`, button: `${v} bottom fing` },
       'Проверка правильности пароля'
    );
    
    sendCall('stayPassword', {
        pass: __('input[thispass]').value
    });
}