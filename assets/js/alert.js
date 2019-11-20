/**
 *	Смена страниц
 */
function openWindow (elem) {
	var flag = '';
	
	if (!qs('.open', fullPageMain)) {
		fullPageMain.classList.toggle('open');
		fullPageMain.classList.toggle('margin');
	}
	
	qs(`backfon.${elem}`, fullPageMain).classList.toggle('open');
	if (flag = qs(elem, fullPageMain).classList.toggle('open')) {
		qs(`backfon.${elem}`, fullPageMain).classList.toggle('margin');
		qs(elem, fullPageMain).classList.toggle('margin');
	} else {
		setTimeout(() => {
			qs(`backfon.${elem}`, fullPageMain).classList.toggle('margin');
			qs(elem, fullPageMain).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!qs('.open', fullPageMain)) {
		setTimeout(() => {
			fullPageMain.classList.toggle('open');
			fullPageMain.classList.toggle('margin');
		}, 400);
	}
}

/**
 *	Управление уведомлениями
 */
function openAlert ({text, wait, button, titleOf}) {
	if (titleOf == 'none') qs('top', alert).style.setProperty('display', 'none');
	var header = titleOf || 'Уведомление';
	
	qs('top', alert).textContent = header;
	qs('middle', alert).innerHTML = text;
	
	openWindow('alert');
	
	if (wait) {
		if (button) {
			alert.appendChild(dom(`<bottom></bottom>`));
			bottom = qs('bottom', alert);
			
			button.forEach((a) => { 
				bottom.appendChild(dom(`
					<fing onclick="${a.callback}; openWindow('alert'); this.parentElement.outerHTML = '';">
						${a.value}
					</fing>
				`));
			});
		}
		
		// На случай бесконечного уведомления возможность закрыть
		qs('fullpage backfon.alert').setAttribute('onclick',
			`openWindow('alert'); qs('alert bottom').outerHTML = ''; qs('alert top').style = ''; this.onclick = 'return false;'`
		);
	} else {
		// Временное уведомление закрывается само
		setTimeout(() => {
			openWindow('alert');
		}, 2000);
	}
}