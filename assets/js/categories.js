/**
 *	Взятие категории
 */
function takeTab (tab)
{ __('input', smileSett).value = tab }

/**
 *	Удаление категории
 */
function delTab (tab, bool)
{
	if (bool === true)
	{
		__(`page[tab="${tab}"]`, asstabes).outerHTML = '';
		__(`listed tab[alt="${tab}"]`, smileSett).outerHTML = '';
		__(`tab[alt="${tab}"]`, smileList).outerHTML = '';
		
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
 *	Сворачивание категории
 */
function ahide (tab)
{
	var tab = __(`tab[alt="${tab}"]`, smileList),
		close = __('hit close', tab);
		
	tab.classList.toggle('minimized');
	
	close.classList.toggle('fa-minus');
	close.classList.toggle('fa-plus');
}

/**
 *	Сохранение списка страниц
 */
function savePages (output)
{
	var mains = $_("asett pages[name='mainsetting'] page"),
		pages = $_("asett pages[name='pagesetting'] page"),
		tabs = $_("asett pages[name='tabsetting'] page"),
		arrayPage = {}, arrayTab = [], j = 0;
		
	mains.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a);
		
		localStorage.setItem(`setting--${input.value}`, input.checked);
	});
		
	pages.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a),
			name = __('input[type="text"]', a).value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	localStorage.setItem('page', JSON.stringify(arrayPage));
	storagePage = arrayPage;
	
	tabs.forEach
	( function (a) {
		var index = __('input[name="index"]', a).value,
			tab = __('input[name="tab"]', a).value,
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
		text: output || 'Отображение изменено по вашему усмотрению!'
	});
}

/**
 *	Смена страниц
 */
function adoor (elem)
{
	var flag = '';
	
	if (!__('.open', afp))
	{
		afp.classList.toggle('open');
		afp.classList.toggle('margin');
	}
	
	__(`backfon.${elem}`, afp).classList.toggle('open');
	if (flag = __(elem, afp).classList.toggle('open'))
	{
		__(`backfon.${elem}`, afp).classList.toggle('margin');
		__(elem, afp).classList.toggle('margin');
	}
	else
	{
		setTimeout
		( function () {
			__(`backfon.${elem}`, afp).classList.toggle('margin');
			__(elem, afp).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!__('.open', afp))
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
	if (titleOf == 'none') __('top', alert).style.setProperty('display', 'none');
	var header = titleOf || 'Уведомление';
	
	__('top', alert).textContent = header;
	__('middle', alert).innerHTML = text;
	
	adoor('alert');
	
	if (wait)
	{
		if (button)
		{
			alert.appendChild
			( dom (`
				<bottom></bottom>
			`));
			
			bottom = __('bottom', alert);
			
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
		__('fullpage backfon.alert').setAttribute
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