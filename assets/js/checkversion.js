const version = '1.0.0.0';

// Если новая версия
if (get('version', true) != version)
{
	if (!get('first', true))
	{
		openWindow('wellcome');
		
		var qn = $_('wellcome qn', fullPageMain),
			len = qn.length,
			i = 0, timer = 0;
		
		function trytodoit ()
        {
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
					openWindow('wellcome');
					
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
			Что же, это первое столь глобальное обновление, но расскажу только об одной функции, всё 
            остальное ждёт вас в самой теме (а там правда куча всего).<br>
            Добавлена самая ожидаемая функция - доступность смайлов на ЛЮБЫХ устройствах, будь то ваш ПК, рабочий 
            ноутбук, телефон или планшет. 
            Для работы с ним необходима лишь авторизация в Google в любом месте, будь то Почта, YouTube и 
            прочее. Если вы уже были авторизованы хотя бы в одном из сервисов Google, то расширение 
            автоматически приступит к работе. Так же необходима установка расширения на них, но это ты 
            и без меня понял)<br><br>Предсказываю вопрос - А ЗАЧЕМ?<br>
            Отвечаю - Google Apps Script выступает в роли бекенда, и чтобы работать с ним Google требует 
            авторизацию пользователя. Я упростил авторизацию, сделав все махинации через себя, но Google 
            необходимо быть увереным, что пользователь есть пользователь.<br><br>Давай, беги в темку читать обо 
            всём остальном!`
		});
	}
}