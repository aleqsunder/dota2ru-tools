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
		set('cath', JSON.stringify(cath), true);
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
		
		set(input.value, input.checked);
	});
		
	pages.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a),
			name = __('input[type="text"]', a).value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	set('page', JSON.stringify(arrayPage), true);
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
				
				log(el.tab, tab);
				if (el.tab == oldtab)
				{
					el.tab = tab;
					setStorage(el.name, JSON.stringify(el));
				}
			});
		}
	});
	
	set('cath', JSON.stringify(arrayTab), true);
	cath = arrayTab;
	
	reload();
	
	openAlert
	({
		titleOf: 'Настройки',
		text: output || 'Отображение изменено по вашему усмотрению!'
	});
}

function userStyles()
{
    set('userstyles-css', JSON.stringify(__('[userstyles]').value));
}