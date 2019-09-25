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

function userStyles ()
{
    set('userstyles-css', JSON.stringify(__('textarea[userstyles]').value));
    __('style[userstyles]').innerHTML = __('textarea[userstyles]').value;
    
	openAlert
	({
		titleOf: 'Редактор стилей',
		text: 'Стили изменены!'
	});
}

const startScanning = function (event)
{ 
    var puth = '',
        el = event.target,
        style = getComputedStyle(el),
        
        top = (parseInt(style.marginTop) - 1) + 'px',
        right = (parseInt(style.marginRight) - 1) + 'px',
        bottom = (parseInt(style.marginBottom) - 1) + 'px',
        left = (parseInt(style.marginLeft) - 1) + 'px';

    el.style.setProperty('border', '1px solid yellow', 'important');
    el.style.setProperty('margin', `${top} ${right} ${bottom} ${left}`);

    el.addEventListener
    ('mouseout', function (event) {
        var el = event.target;
        
        el.style.removeProperty('border');
        el.style.removeProperty('margin');
    });

    while (el.nodeName != 'BODY')
    {
        var classes = el.className.replace(/\s+/g, ' ').trim().split(' ').join('.');

        while (classes.indexOf('..') > -1)
            classes = classes.replace('..', '.');

        if (classes.length == 0)
            puth = `${el.nodeName} ${puth}`;
        
        else
            puth = `${el.nodeName}.<span style='font-size: 9px'>${classes}</span> ${puth}`;

        el = el.parentElement;
    }

    __('bottomhelper').innerHTML = puth;
}

function animateClosing ()
{
    __('bottomhelper').style.setProperty('margin-top', '50px');
    __('bottomhelper').style.setProperty('margin-left', '50%');
    __('bottomhelper').style.setProperty('transform', 'translateX(-50%)');
    __('bottomhelper').style.setProperty('width', 'auto');
    __('bottomhelper').style.setProperty('text-align', 'center');
    __('bottomhelper').style.setProperty('font-size', '13px');
    
    setTimeout (() => {
        __('bottomhelper').style.setProperty('opacity', '0');
        __('bottomhelper').style.setProperty('margin-top', '0px');
        
        setTimeout (() => {
            
            __('bottomhelper').outerHTML = '';
        }, 300);
    }, 500);
}

function scanDom ()
{
    var bottomhelper = document.createElement('bottomhelper'),
        body = document.body;

    body.appendChild(bottomhelper);
    body.addEventListener('mouseover', startScanning);
    
    body.addEventListener
    ('click', function (e) { 
        e.preventDefault();
        e.stopPropagation();
        
        body.removeEventListener('mouseover', startScanning);
        animateClosing();
        
        this.removeEventListener('click', arguments.callee);
    });
}

watching
({
	elem: 'textarea[userstyles]',
	
	callback: function (el)
	{
		el.addEventListener
        ('keydown', function (e) {
            if(e.keyCode === 9)
            {
                e.preventDefault();
                
                var start = this.selectionStart,
                    end = this.selectionEnd,
                    
                    value = e.target.value,
                    before = value.substring(0, start),
                    after = value.substring(end);

                e.target.value = `${before}\t${after}`;
                this.selectionStart = this.selectionEnd = start + 1;
            }
        }, false);
	}
});