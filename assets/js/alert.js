/**
 *	Смена страниц
 */
function openWindow (elem)
{
	var flag = '';
	
	if (!__('.open', fullPageMain))
	{
		fullPageMain.classList.toggle('open');
		fullPageMain.classList.toggle('margin');
	}
	
	__(`backfon.${elem}`, fullPageMain).classList.toggle('open');
	if (flag = __(elem, fullPageMain).classList.toggle('open'))
	{
		__(`backfon.${elem}`, fullPageMain).classList.toggle('margin');
		__(elem, fullPageMain).classList.toggle('margin');
	}
	else
	{
		setTimeout
		( function () {
			__(`backfon.${elem}`, fullPageMain).classList.toggle('margin');
			__(elem, fullPageMain).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!__('.open', fullPageMain))
	{
		setTimeout
		( function () {
			fullPageMain.classList.toggle('open');
			fullPageMain.classList.toggle('margin');
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
	
	openWindow('alert');
	
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
				bottom.appendChild
				( dom(`
					<fing onclick="${a.callback}; openWindow('alert'); this.parentElement.outerHTML = '';">
						${a.value}
					</fing>
				`));
			});
		}
		
		// На случай бесконечного уведомления возможность закрыть
		__('fullpage backfon.alert').setAttribute
		(
			'onclick',
			`openWindow('alert'); __('alert bottom').outerHTML = ''; __('alert top').style = ''; this.onclick = 'return false;'`
		);
	}
	else
	{
		// Временное уведомление закрывается само
		setTimeout
		(function () {
			openWindow('alert');
		}, 2000);
	}
}