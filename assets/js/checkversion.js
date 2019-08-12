const version = '0.1.2.1';

// Если новая версия
if (localStorage.getItem('version') != version)
{
	if (!localStorage.getItem('first'))
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
					
					localStorage.setItem('first', 'est zhi');
					localStorage.setItem('version', version);
				}, timer)
			}
		}
		
		trytodoit();
	}
	else
	{
		localStorage.setItem('version', version);
		openAlert({
			wait: true,
			
			titleOf: `Обновление`,
			text: `Новая версия ${version}! Что внутри?<br><br>
			Если кратко, то немного изменил редактор текста. Да, тот самый, которым ты пользуешься каждый день, оставляя комментарии в темах и в личных переписках. Появилась поддержка тега <b>CODE</b> (подробный гайд к моменту чтения должен быть в шапке темы), поддержка <b>табуляции</b> (если понятней, то отступы: tab - влево, shift + tab - вправо) и остальные правки, с которыми сможешь ознакомиться самостоятельно)<br><br>
			Реализована резервная копия ваших данных и настроек. Теперь вы не потеряете свои данные из-за ошибки расширения. Подробности в шапке темы!<br><br>
			Изменен метод иньекции расширения - теперь он происходит сразу после начала загрузки форума, чтобы расширение могло сразу провести необходимые изменения (например стили и скрипты), а всё остальное так же подгружается после полной загрузки документа<br><br>
			И пока не забыл - переписана структура самого расширения. Я разделил кучу кода на отдельные блоки, чтобы и мне было удобно редактировать, и в случае чего вы сами поняли, где и что было отредактировано<br><br>
			Для всего остального есть ченджлог в самой теме)<br>
			Хорошего дня!`
		});
	}
}