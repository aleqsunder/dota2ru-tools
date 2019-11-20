/**
 *	Взятие категории
 */
function takeTab (tab) { qs('input', smileSett).value = tab }

/**
 *	Удаление категории
 */
function delTab (tab, bool) {
	if (bool === true) {
		qs(`page[tab="${tab}"]`, asstabes).outerHTML = '';
		qs(`listed tab[alt="${tab}"]`, smileSett).outerHTML = '';
		qs(`tab[alt="${tab}"]`, smileList).outerHTML = '';
		
		array = [];
		
		Object.keys(cath).forEach((a) => {
			b = cath[a];
			
			if (b.name != tab)
				array.push(b);
		});
		
		cath = array;
		set('cath', JSON.stringify(cath), true);
	} else {
		openAlert ({
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
function ahide (tab) {
	var tab = qs(`tab[alt="${tab}"]`, smileList),
		close = qs('hit close', tab);
		
	tab.classList.toggle('minimized');
	
	close.classList.toggle('fa-minus');
	close.classList.toggle('fa-plus');
}

/**
 *	Сохранение списка страниц
 */
function savePages (output) {
	var mains = qsa("asett pages[name='mainsetting'] page"),
		pages = qsa("asett pages[name='pagesetting'] page"),
		tabs = qsa("asett pages[name='tabsetting'] page"),
		arrayPage = {}, arrayTab = [], j = 0;
		
	mains.forEach((a) => {
		var input = qs('input[type="checkbox"]', a);
		
		set(input.value, input.checked);
	});
		
	pages.forEach((a) => {
		var input = qs('input[type="checkbox"]', a),
			name = qs('input[type="text"]', a).value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	set('page', JSON.stringify(arrayPage), true);
	storagePage = arrayPage;
	
	tabs.forEach((a) => {
		var index = qs('input[name="index"]', a).value,
			tab = qs('input[name="tab"]', a).value,
			oldtab = a.getAttribute('tab');
			
		arrayTab[j] = {name: tab, index: index};
		j++;
		
		if (tab != oldtab) {
			Object.keys(storageCache).forEach((a) => {
				var el = JSON.parse(storageCache[a]);
				
				if (el.tab == oldtab) {
					el.tab = tab;
					setStorage(el.name, JSON.stringify(el));
				}
			});
		}
	});
	
	set('cath', JSON.stringify(arrayTab), true);
	cath = arrayTab;
	
	reload();
	
	openAlert ({
		titleOf: 'Настройки',
		text: output || 'Отображение изменено по вашему усмотрению!'
	});
}

function userStyles () {
    set('userstyles-css', JSON.stringify(qs('textarea[userstyles]').value));
    qs('style[userstyles]').innerHTML = qs('textarea[userstyles]').value;
    
	openAlert ({
		titleOf: 'Редактор стилей',
		text: 'Стили изменены!'
	});
}

const startScanning = (event) => { 
    var puth = '',
        el = event.target,
        style = getComputedStyle(el),
        
        top = (parseInt(style.marginTop) - 1) + 'px',
        right = (parseInt(style.marginRight) - 1) + 'px',
        bottom = (parseInt(style.marginBottom) - 1) + 'px',
        left = (parseInt(style.marginLeft) - 1) + 'px';

    el.style.setProperty('border', '1px solid yellow', 'important');
    el.style.setProperty('margin', `${top} ${right} ${bottom} ${left}`);

    el.addEventListener('mouseout', (event) => {
        var el = event.target;
        
        el.style.removeProperty('border');
        el.style.removeProperty('margin');
    });

    while (el.nodeName != 'BODY') {
        var classes = el.className.replace(/\s+/g, ' ').trim().split(' ').join('.');

        while (classes.indexOf('..') > -1)
            classes = classes.replace('..', '.');

        if (classes.length == 0) puth = `${el.nodeName} ${puth}`;
        else puth = `${el.nodeName}.<span style='font-size: 9px'>${classes}</span> ${puth}`;

        el = el.parentElement;
    }

    qs('bottomhelper').innerHTML = puth;
}

function animateClosing () {
    qs('bottomhelper').style.setProperty('margin-top', '50px');
    qs('bottomhelper').style.setProperty('margin-left', '50%');
    qs('bottomhelper').style.setProperty('transform', 'translateX(-50%)');
    qs('bottomhelper').style.setProperty('width', 'auto');
    qs('bottomhelper').style.setProperty('text-align', 'center');
    qs('bottomhelper').style.setProperty('font-size', '13px');
    
    setTimeout (() => {
        qs('bottomhelper').style.setProperty('opacity', '0');
        qs('bottomhelper').style.setProperty('margin-top', '0px');
        
        setTimeout (() => {
            qs('bottomhelper').outerHTML = '';
        }, 300);
    }, 500);
}

function scanDom () {
    var bottomhelper = document.createElement('bottomhelper'),
        body = document.body;

    body.appendChild(bottomhelper);
    body.addEventListener('mouseover', startScanning);
    
    body.addEventListener('click', (e) => { 
        e.preventDefault();
        e.stopPropagation();
        
        body.removeEventListener('mouseover', startScanning);
        animateClosing();
        
        this.removeEventListener('click', arguments.callee);
    });
}

watching ({
	elem: 'textarea[userstyles]',
	
	callback: (el) => {
		el.addEventListener ('keydown', (e) => {
            if(e.keyCode === 9) {
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