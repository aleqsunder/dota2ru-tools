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
				log(a);
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