# Установка
1. Установить [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) для Chrome (либо Greasemonkey для Firefox)
2. На этой странице перейти в файл `vk-detoxic.user.js`, потом нажать `Raw` в правой верхней части страницы (спросит установку - ставим)
3. Заполнить переменные в начале файла:
- `dialogNames` названия чатов, в которых работает скрипт (массив)
- `banUserId` ID юзера, чьи сообщения скрываем (строка)
- `banUserName` имя юзера, чьи сообщения скрываем (строка, нужно для скрытия сообщений-ответов этому человеку)
