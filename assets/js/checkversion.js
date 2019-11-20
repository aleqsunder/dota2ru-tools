const version = '1.0.0.2';

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
			В общем немного переписал чат, теперь сообщения не бездумно обновляются и 
			перезаписываются, а просто добавляются в конец. Как-то не подумал, когда изначально писал.<br><br>
			Теперь все голосовые или музыка не останавливаются, а сообщения не пролистываются каждый раз 
			в самый низ.<br>
			Так же написал игнор для чата, все подробности в теме расширения.<br><br>
			Если вкратце - анимации появления/пропадания сообщений, тот же игнор из чата и по нику в 
			редакторе списка игнора и прочее.`
		});
	}
}