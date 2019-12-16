const version = '1.0.0.3';

// Если новая версия
if (get('version', true) != version) {
	if (!get('first', true)) {
		openWindow('wellcome');
		
		var qn = qsa('wellcome qn', fullPageMain),
			len = qn.length,
			i = 0, timer = 0;
		
		function trytodoit () {
			if (i < 1) {
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			} else {
				qn[i-1].style = '';
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			
			i++;
			timer = qn[i-1].innerText.length * 52;
			
			if (i < len) {
				setTimeout(trytodoit, timer);
			} else {
				setTimeout(() => {
					openWindow('wellcome');
					
					set('first', 'est zhi', true);
					set('version', version, true);
				}, timer)
			}
		}
		
		trytodoit();
	} else {
		set('version', version, true);
		openAlert({
			wait: true,
			
			titleOf: `Обновление`,
			text: `Новая версия ${version}! Что внутри?<br><br>
			Фикс чата при попытке его выключить (очень важно, т.к. сейчас будет с минуты на минуту добавлен сокет чат на форум),
			теперь сообщения отправляются адекватно.<br><br>
			Пробная функция по просьбе форумчан - кастомный игнор<br>
			Теперь вы более не видите сообщения людей в темах, не видите их присутствия (их ники стираются из списка пользователей,
			что находятся сейчас в теме)<br>
			Если что-то ведёт себя некорректно - напишите в тему, я исправлю<br><br>
			Убрал в редакторе wysiwyg кастомное изменение размера текста`
		});
	}
}