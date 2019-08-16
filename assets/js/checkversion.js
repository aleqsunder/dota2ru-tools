const version = '0.1.2.2';

// Если новая версия
if (get('version', true) != version)
{
	if (!get('first', true))
	{
		adoor('wellcome');
		
		var qn = $_('wellcome qn', afp),
			len = qn.length,
			i = 0, timer = 0;
		
		function trytodoit () {
			if (i < 1)
			{
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			else
			{
				qn[i-1].style = '';
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			
			i++;
			timer = qn[i-1].innerText.length * 52;
			
			if (i < len)
			{
				setTimeout(trytodoit, timer);
			}
			else
			{
				setTimeout
				( function () {
					adoor('wellcome');
					
					set('first', 'est zhi', true);
					set('version', version, true);
				}, timer)
			}
		}
		
		trytodoit();
	}
	else
	{
		set('version', version, true);
		openAlert({
			wait: true,
			
			titleOf: `Обновление`,
			text: `Новая версия ${version}! Что внутри?<br><br>
			Подъехало 2 фикса. Первый - размер окна со смайлами выходил за пределы окна браузера, из-за чего невозможно было сохранять смайлы. Второй - пофикшена старая проблема с постоянным присвоением размера смайлу<br><br>
			Для всего остального есть ченджлог в самой теме)<br>
			Хорошего дня!`
		});
	}
}