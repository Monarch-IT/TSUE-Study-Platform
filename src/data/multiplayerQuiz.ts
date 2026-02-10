export interface MultiplayerQuestion {
    id: number;
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    options: string[] | { text: string; id: number }[];
    correctAnswer: number;
    explanation: string;
    category: 'history' | 'syntax' | 'philosophy' | 'types' | 'logic' | 'basics';
}

export const multiplayerQuizData: MultiplayerQuestion[] = [
    // --- ВВЕДЕНИЕ (intro) ---
    // EASY (5)
    {
        id: 1, topicId: 'intro', difficulty: 'easy',
        question: "В честь кого Python получил своё название?",
        options: ["В честь вида змей", "В честь шоу 'Монти Пайтон'", "В честь богов", "Случайный выбор"],
        correctAnswer: 1, explanation: "Язык назван в честь британского шоу 'Летающий цирк Монти Пайтона'.",
        category: 'history'
    },
    {
        id: 2, topicId: 'intro', difficulty: 'easy',
        question: "Кто создал Python?",
        options: ["Линус Торвальдс", "Гвидо ван Россум", "Бьерн Страуструп", "Джеймс Гослинг"],
        correctAnswer: 1, explanation: "Создатель языка — Гвидо ван Россум.",
        category: 'history'
    },
    {
        id: 3, topicId: 'intro', difficulty: 'easy',
        question: "Какое расширение по умолчанию имеют файлы Python?",
        options: [".pt", ".py", ".logic", ".pyt"],
        correctAnswer: 1, explanation: "Стандартное расширение — .py.",
        category: 'syntax'
    },
    {
        id: 4, topicId: 'intro', difficulty: 'easy',
        question: "Как обозначаются комментарии в Python?",
        options: ["//", "/*", "#", "--"],
        correctAnswer: 2, explanation: "Комментарии начинаются с символа решетки (#).",
        category: 'syntax'
    },
    {
        id: 5, topicId: 'intro', difficulty: 'easy',
        question: "Какая функция используется для вывода текста на экран?",
        options: ["log()", "print()", "show()", "write()"],
        correctAnswer: 1, explanation: "Используется функция print().",
        category: 'syntax'
    },
    // MEDIUM (5)
    {
        id: 6, topicId: 'intro', difficulty: 'medium',
        question: "В каком году официально вышел Python 1.0?",
        options: ["1989", "1991", "1994", "2000"],
        correctAnswer: 2, explanation: "Версия 1.0 была выпущена в январе 1994 года.",
        category: 'history'
    },
    {
        id: 7, topicId: 'intro', difficulty: 'medium',
        question: "Что такое PEP в сообществе Python?",
        options: ["Тип данных", "Предложение по улучшению", "Менеджер пакетов", "Библиотека"],
        correctAnswer: 1, explanation: "PEP — Python Enhancement Proposal.",
        category: 'history'
    },
    {
        id: 8, topicId: 'intro', difficulty: 'medium',
        question: "Какая типизация характерна для Python?",
        options: ["Статическая", "Динамическая сильная", "Динамическая слабая", "Ручная"],
        correctAnswer: 1, explanation: "Python — динамический язык с сильной типизацией.",
        category: 'types'
    },
    {
        id: 9, topicId: 'intro', difficulty: 'medium',
        question: "Какая команда в терминале выводит версию Python?",
        options: ["python v", "python --version", "py -v", "check python"],
        correctAnswer: 1, explanation: "Команда --version или -V выводит текущую версию.",
        category: 'syntax'
    },
    {
        id: 10, topicId: 'intro', difficulty: 'medium',
        question: "Что делает команда 'import this'?",
        options: ["Импортирует текущий файл", "Выводит Дзен Python", "Импортирует все базы", "Ошибка"],
        correctAnswer: 1, explanation: "Команда выводит философию языка (Zen of Python).",
        category: 'philosophy'
    },
    // HARD (5)
    {
        id: 11, topicId: 'intro', difficulty: 'hard',
        question: "Что означает аббревиатура GIL?",
        options: ["Global Interpreter Lock", "General Import Logic", "Global Interface Library", "Grand Internal Link"],
        correctAnswer: 0, explanation: "GIL — механизм управления потоками в CPython.",
        category: 'history'
    },
    {
        id: 12, topicId: 'intro', difficulty: 'hard',
        question: "Как называется байт-код файл после компиляции в Python 3?",
        options: [".pyc", ".obj", ".class", ".exe"],
        correctAnswer: 0, explanation: "Байт-код сохраняется в файлах .pyc внутри __pycache__.",
        category: 'history'
    },
    {
        id: 13, topicId: 'intro', difficulty: 'hard',
        question: "К какому типу языков относится Python по способу исполнения?",
        options: ["Чисто компилируемый", "Интерпретируемый (байт-код)", "Машинный", "Декларативный"],
        correctAnswer: 1, explanation: "Python сначала компилируется в байт-код, который исполняется PVM.",
        category: 'history'
    },
    {
        id: 14, topicId: 'intro', difficulty: 'hard',
        question: "Какое основное преимущество дает использование виртуальных окружений (venv)?",
        options: ["Ускорение кода", "Изоляция зависимостей", "Защита от вирусов", "Сжатие файлов"],
        correctAnswer: 1, explanation: "В виртуальных окружениях можно устанавливать разные версии библиотек для разных проектов.",
        category: 'history'
    },
    {
        id: 15, topicId: 'intro', difficulty: 'hard',
        question: "В каком году Гвидо ван Россум покинул пост BDFL?",
        options: ["2010", "2015", "2018", "2020"],
        correctAnswer: 2, explanation: "Гвидо ушел с поста 'Великодушного пожизненного диктатора' в июле 2018 года.",
        category: 'history'
    },

    // --- СТРУКТУРА ЯЗЫКА (structure) ---
    // EASY (5)
    {
        id: 16, topicId: 'structure', difficulty: 'easy',
        question: "Какой оператор используется для присваивания значения переменной?",
        options: ["==", "=", "->", "set"],
        correctAnswer: 1, explanation: "Одинарный знак равенства (=) — это оператор присваивания.",
        category: 'syntax'
    },
    {
        id: 17, topicId: 'structure', difficulty: 'easy',
        question: "Как в Python обозначается целое число (integer)?",
        options: ["float", "str", "int", "bool"],
        correctAnswer: 2, explanation: "Тип int используется для целых чисел.",
        category: 'types'
    },
    {
        id: 18, topicId: 'structure', difficulty: 'easy',
        question: "Результат операции 5 + 2 * 3?",
        options: ["21", "11", "10", "13"],
        correctAnswer: 1, explanation: "Сначала умножение (2*3=6), затем сложение (5+6=11).",
        category: 'logic'
    },
    {
        id: 19, topicId: 'structure', difficulty: 'easy',
        question: "Как получить ввод от пользователя в консоли?",
        options: ["get()", "input()", "read()", "scan()"],
        correctAnswer: 1, explanation: "Функция input() считывает строку данных.",
        category: 'syntax'
    },
    {
        id: 20, topicId: 'structure', difficulty: 'easy',
        question: "Какой тип данных имеет значение True или False?",
        options: ["str", "int", "float", "bool"],
        correctAnswer: 3, explanation: "Логический тип данных называется boolean (bool).",
        category: 'types'
    },
    // MEDIUM (5)
    {
        id: 21, topicId: 'structure', difficulty: 'medium',
        question: "Каков результат выражения 10 / 2 в Python 3?",
        options: ["5", "5.0", "Ошибка", "2"],
        correctAnswer: 1, explanation: "В Python 3 деление / всегда возвращает float.",
        category: 'logic'
    },
    {
        id: 22, topicId: 'structure', difficulty: 'medium',
        question: "Какой оператор используется для деления без остатка (целочисленного)?",
        options: ["/", "%", "//", "div"],
        correctAnswer: 2, explanation: "// — оператор целочисленного деления.",
        category: 'syntax'
    },
    {
        id: 23, topicId: 'structure', difficulty: 'medium',
        question: "Как проверить тип данных переменной x?",
        options: ["check(x)", "type(x)", "typeof x", "is_type(x)"],
        correctAnswer: 1, explanation: "Функция type() возвращает класс объекта.",
        category: 'basics'
    },
    {
        id: 24, topicId: 'structure', difficulty: 'medium',
        question: "Что вернет выражение 2 ** 3 ** 2?",
        options: ["64", "512", "18", "Ошибка"],
        correctAnswer: 1, explanation: "Возведение в степень выполняется справа налево: 3**2=9, затем 2**9=512.",
        category: 'logic'
    },
    {
        id: 25, topicId: 'structure', difficulty: 'medium',
        question: "Что произойдет при попытке сложить '5' + 5?",
        options: ["'55'", "10", "TypeError", "SyntaxError"],
        correctAnswer: 2, explanation: "Python не позволяет неявное преобразование типов при сложении строки и числа.",
        category: 'types'
    },
    // HARD (5)
    {
        id: 26, topicId: 'structure', difficulty: 'hard',
        question: "Для чего используется оператор %?",
        options: ["Процент от числа", "Остаток от деления", "Целочисленное деление", "Модуль числа"],
        correctAnswer: 1, explanation: "Оператор % возвращает остаток от деления.",
        category: 'syntax'
    },
    {
        id: 27, topicId: 'structure', difficulty: 'hard',
        question: "Что вернет bool('') (пустая строка)?",
        options: ["True", "False", "None", "Ошибка"],
        correctAnswer: 1, explanation: "Любые пустые контейнеры/строки приравниваются к False.",
        category: 'logic'
    },
    {
        id: 28, topicId: 'structure', difficulty: 'hard',
        question: "Какой из перечисленных вариантов является неверным именем переменной?",
        options: ["my_var", "_var", "2var", "Var"],
        correctAnswer: 2, explanation: "Имена переменных не могут начинаться с цифры.",
        category: 'syntax'
    },
    {
        id: 29, topicId: 'structure', difficulty: 'hard',
        question: "Как называется ситуация, когда Python создает новую переменную при присваивании?",
        options: ["Динамическое связывание", "Статика", "Клонирование", "Ссылка"],
        correctAnswer: 0, explanation: "Это часть динамической природы языка.",
        category: 'basics'
    },
    {
        id: 30, topicId: 'structure', difficulty: 'hard',
        question: "Чему равен результат 0.1 + 0.2 == 0.3?",
        options: ["True", "False", "Зависит от системы", "None"],
        correctAnswer: 1, explanation: "Из-за особенностей хранения float результат чуть больше 0.3.",
        category: 'logic'
    },
    // --- УСЛОВНЫЕ ОПЕРАТОРЫ (conditions) ---
    // EASY (5)
    {
        id: 31, topicId: 'conditions', difficulty: 'easy',
        question: "Какой оператор используется для проверки равенства?",
        options: ["=", "==", "is", "equal"],
        correctAnswer: 1, explanation: "== сравнивает значения на равенство.",
        category: 'logic'
    },
    {
        id: 32, topicId: 'conditions', difficulty: 'easy',
        question: "Что делает ключевое слово 'else'?",
        options: ["Создает цикл", "Выполняется, если условие if ложно", "Прерывает программу", "Ничего"],
        correctAnswer: 1, explanation: "Блок else срабатывает при ложности условия if.",
        category: 'syntax'
    },
    {
        id: 33, topicId: 'conditions', difficulty: 'easy',
        question: "Как проверить, что x больше 10?",
        options: ["x > 10", "x => 10", "x larger 10", "x >> 10"],
        correctAnswer: 0, explanation: "Используется стандартный математический знак >.",
        category: 'logic'
    },
    {
        id: 34, topicId: 'conditions', difficulty: 'easy',
        question: "Какое ключевое слово используется для проверки нескольких условий (иначе если)?",
        options: ["elseif", "elsif", "elif", "else if"],
        correctAnswer: 2, explanation: "В Python используется сокращение elif.",
        category: 'syntax'
    },
    {
        id: 35, topicId: 'conditions', difficulty: 'easy',
        question: "Каков результат: 5 < 3?",
        options: ["True", "False", "None", "Ошибка"],
        correctAnswer: 1, explanation: "5 не меньше 3, поэтому результат False.",
        category: 'logic'
    },
    // MEDIUM (5)
    {
        id: 36, topicId: 'conditions', difficulty: 'medium',
        question: "Как проверить, что число x находится в диапазоне от 1 до 10 (включительно)?",
        options: ["1 < x < 10", "1 <= x <= 10", "x in range(1, 10)", "x > 1 and x < 10"],
        correctAnswer: 1, explanation: "Python поддерживает цепочки сравнений, <= включает границы.",
        category: 'logic'
    },
    {
        id: 37, topicId: 'conditions', difficulty: 'medium',
        question: "Какой оператор логического И (оба условия верны)?",
        options: ["&&", "and", "&", "both"],
        correctAnswer: 1, explanation: "Логическое И в Python — это слово 'and'.",
        category: 'logic'
    },
    {
        id: 38, topicId: 'conditions', difficulty: 'medium',
        question: "Какой результат: not (5 > 3)?",
        options: ["True", "False", "None", "Error"],
        correctAnswer: 1, explanation: "5 > 3 это True, а not True это False.",
        category: 'logic'
    },
    {
        id: 39, topicId: 'conditions', difficulty: 'medium',
        question: "Как проверить, что строка s не пуста?",
        options: ["if s:", "if len(s) > 0:", "if s != '':", "Все вышеперечисленное"],
        correctAnswer: 3, explanation: "Все эти способы верны, но 'if s:' считается самым 'пайтоничным'.",
        category: 'basics'
    },
    {
        id: 40, topicId: 'conditions', difficulty: 'medium',
        question: "Что вернет выражение 5 == 5.0?",
        options: ["True", "False", "Ошибка", "None"],
        correctAnswer: 0, explanation: "Python сравнивает значения, число 5 равно 5.0.",
        category: 'types'
    },
    // HARD (5)
    {
        id: 41, topicId: 'conditions', difficulty: 'hard',
        question: "В чем разница между '==' и 'is'?",
        options: ["Нет разницы", "== сравнивает значения, is — id объектов", "is быстрее", "== работает только со строками"],
        correctAnswer: 1, explanation: "== проверяет равенство значений, а is — идентичность (один и тот же ли это объект в памяти).",
        category: 'logic'
    },
    {
        id: 42, topicId: 'conditions', difficulty: 'hard',
        question: "Что такое тернарный оператор в Python?",
        options: ["if x then y else z", "x if condition else y", "condition ? x : y", "x if condition"],
        correctAnswer: 1, explanation: "Синтаксис: 'значение_если_да if условие else значение_если_нет'.",
        category: 'syntax'
    },
    {
        id: 43, topicId: 'conditions', difficulty: 'hard',
        question: "Какое логическое правило называется 'Short-circuit evaluation'?",
        options: ["Быстрый расчет", "Остановка вычисления, если результат уже ясен", "Пропуск ошибок", "Замыкание"],
        correctAnswer: 1, explanation: "Например, в (False and X) X не будет вычисляться, так как результат уже False.",
        category: 'logic'
    },
    {
        id: 44, topicId: 'conditions', difficulty: 'hard',
        question: "Что вернет: 10 > 5 or 0 / 0?",
        options: ["True", "False", "ZeroDivisionError", "None"],
        correctAnswer: 0, explanation: "Благодаря short-circuit, 10 > 5 уже True, поэтому or-часть (с ошибкой) не вычисляется.",
        category: 'logic'
    },
    {
        id: 45, topicId: 'conditions', difficulty: 'hard',
        question: "Можно ли использовать if внутри другого if?",
        options: ["Да, это вложенные условия", "Нет", "Только в последних версиях", "Только в функциях"],
        correctAnswer: 0, explanation: "Вложенность условий (Nested if) является стандартной практикой.",
        category: 'basics'
    },
    // --- ЦИКЛЫ (loops) ---
    // EASY (5)
    {
        id: 46, topicId: 'loops', difficulty: 'easy',
        question: "Какой цикл используется, когда количество итераций известно заранее?",
        options: ["while", "for", "loop", "repeat"],
        correctAnswer: 1, explanation: "Цикл for обычно используется для перебора последовательностей.",
        category: 'syntax'
    },
    {
        id: 47, topicId: 'loops', difficulty: 'easy',
        question: "Что произойдет в бесконечном цикле?",
        options: ["Компьютер выключится", "Программа будет работать вечно", "Программа удалится", "Ничего"],
        correctAnswer: 1, explanation: "Бесконечный цикл не имеет условия выхода и продолжает выполнение до прерывания.",
        category: 'logic'
    },
    {
        id: 48, topicId: 'loops', difficulty: 'easy',
        question: "Какой оператор немедленно прерывает выполнение цикла?",
        options: ["stop", "exit", "break", "end"],
        correctAnswer: 2, explanation: "Оператор break выходит из текущего цикла.",
        category: 'syntax'
    },
    {
        id: 49, topicId: 'loops', difficulty: 'easy',
        question: "Какой оператор пропускает текущую итерацию и переходит к следующей?",
        options: ["skip", "next", "continue", "pass"],
        correctAnswer: 2, explanation: "continue переводит управление к началу следующей итерации.",
        category: 'syntax'
    },
    {
        id: 50, topicId: 'loops', difficulty: 'easy',
        question: "Что вернет range(3)?",
        options: ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "Ошибка"],
        correctAnswer: 1, explanation: "range(n) генерирует числа от 0 до n-1.",
        category: 'syntax'
    },
    // MEDIUM (5)
    {
        id: 51, topicId: 'loops', difficulty: 'medium',
        question: "Сколько раз выполнится цикл: for i in range(1, 4)?",
        options: ["4", "3", "1", "0"],
        correctAnswer: 1, explanation: "Итерации для i = 1, 2, 3. Верхняя граница не включается.",
        category: 'logic'
    },
    {
        id: 52, topicId: 'loops', difficulty: 'medium',
        question: "В чем особенность блока else в циклах Python?",
        options: ["Ошибка синтаксиса", "Выполняется, если цикл завершился без break", "Выполняется всегда", "Выполняется, если цикл не начался"],
        correctAnswer: 1, explanation: "else в цикле срабатывает, если цикл завершил все итерации штатно.",
        category: 'syntax'
    },
    {
        id: 53, topicId: 'loops', difficulty: 'medium',
        question: "Что выведет: for c in 'Hi': print(c)?",
        options: ["Hi", "H и i на разных строках", "Ошибка", "nothing"],
        correctAnswer: 1, explanation: "Строка — это последовательность, цикл переберет каждый символ.",
        category: 'syntax'
    },
    {
        id: 54, topicId: 'loops', difficulty: 'medium',
        question: "Какое условие у while x < 5, если x изначально 10?",
        options: ["Выполнится 5 раз", "Выполнится 10 раз", "Ни разу не выполнится", "Бесконечный цикл"],
        correctAnswer: 2, explanation: "Условие ложно изначально (10 не меньше 5).",
        category: 'logic'
    },
    {
        id: 55, topicId: 'loops', difficulty: 'medium',
        question: "Как реализовать бесконечный цикл?",
        options: ["while True:", "loop forever:", "for i in range(infinity):", "do while:"],
        correctAnswer: 0, explanation: "while True: — классический способ создания вечного цикла.",
        category: 'syntax'
    },
    // HARD (5)
    {
        id: 56, topicId: 'loops', difficulty: 'hard',
        question: "Что делает оператор pass?",
        options: ["Пропускает ход", "Пустая заглушка (ничего не делает)", "То же самое, что continue", "Завершает функцию"],
        correctAnswer: 1, explanation: "pass используется там, где синтаксически требуется блок, но логически действие не нужно.",
        category: 'syntax'
    },
    {
        id: 57, topicId: 'loops', difficulty: 'hard',
        question: "Результат: sum(range(1, 4))?",
        options: ["10", "6", "3", "4"],
        correctAnswer: 1, explanation: "1 + 2 + 3 = 6.",
        category: 'logic'
    },
    {
        id: 58, topicId: 'loops', difficulty: 'hard',
        question: "Что будет, если изменить список во время итерации по нему?",
        options: ["Все будет ок", "Может привести к логическим ошибкам или пропуску элементов", "Python выдаст ошибку", "Компьютер зависнет"],
        correctAnswer: 1, explanation: "Изменение коллекции во время итерации — плохая практика, сбивающая индексы.",
        category: 'basics'
    },
    {
        id: 59, topicId: 'loops', difficulty: 'hard',
        question: "Что вернет list(range(10, 2, -2))?",
        options: ["[10, 8, 6, 4]", "[10, 8, 6, 4, 2]", "[2, 4, 6, 8, 10]", "[]"],
        correctAnswer: 0, explanation: "Старт 10, стоп 2 (не вкл), шаг -2. Результат: 10, 8, 6, 4.",
        category: 'logic'
    },
    {
        id: 60, topicId: 'loops', difficulty: 'hard',
        question: "Вложенный цикл: for i in range(2): for j in range(2): print(j). Сколько раз выведется '1'?",
        options: ["1", "2", "4", "0"],
        correctAnswer: 1, explanation: "Внешний цикл 2 раза, внутренний 2 раза. Во внутреннем '1' выводится один раз за проход. 1 * 2 = 2.",
        category: 'logic'
    },

    // --- ФУНКЦИИ (functions) ---
    // EASY (5)
    {
        id: 61, topicId: 'functions', difficulty: 'easy',
        question: "Какое ключевое слово используется для объявления функции?",
        options: ["function", "def", "func", "create"],
        correctAnswer: 1, explanation: "Слово def (от define) начинает объявление функции.",
        category: 'syntax'
    },
    {
        id: 62, topicId: 'functions', difficulty: 'easy',
        question: "Как вызвать функцию с именем my_func?",
        options: ["call my_func", "my_func()", "execute my_func", "my_func[]"],
        correctAnswer: 1, explanation: "Функция вызывается по имени со скобками.",
        category: 'syntax'
    },
    {
        id: 63, topicId: 'functions', difficulty: 'easy',
        question: "Какое ключевое слово возвращает результат из функции?",
        options: ["send", "back", "return", "result"],
        correctAnswer: 2, explanation: "return завершает функцию и отдает значение.",
        category: 'syntax'
    },
    {
        id: 64, topicId: 'functions', difficulty: 'easy',
        question: "Переменные, объявленные внутри функции, называются...",
        options: ["Глобальные", "Локальные", "Статические", "Внешние"],
        correctAnswer: 1, explanation: "Локальные переменные доступны только внутри тела функции.",
        category: 'basics'
    },
    {
        id: 65, topicId: 'functions', difficulty: 'easy',
        question: "Что такое аргументы функции?",
        options: ["Способы выхода", "Значения, передаваемые при вызове", "Ошибки в коде", "Комментарии"],
        correctAnswer: 1, explanation: "Аргументы позволяют передавать данные в функцию для обработки.",
        category: 'basics'
    },
    // MEDIUM (5)
    {
        id: 66, topicId: 'functions', difficulty: 'medium',
        question: "Что вернет функция, в которой нет оператора return?",
        options: ["0", "None", "False", "Ошибка"],
        correctAnswer: 1, explanation: "В Python функции без явного return всегда возвращают None.",
        category: 'logic'
    },
    {
        id: 67, topicId: 'functions', difficulty: 'medium',
        question: "Как передать произвольное количество позиционных аргументов?",
        options: ["*args", "**kwargs", "args[]", "list args"],
        correctAnswer: 0, explanation: "*args позволяет принимать любое число позиционных аргументов в виде кортежа.",
        category: 'syntax'
    },
    {
        id: 68, topicId: 'functions', difficulty: 'medium',
        question: "Что такое docstring?",
        options: ["Тип данных", "Строка документации в начале функции", "Системная ошибка", "Библиотека"],
        correctAnswer: 1, explanation: "Docstring (строка в тройных кавычках) описывает назначение функции.",
        category: 'basics'
    },
    {
        id: 69, topicId: 'functions', difficulty: 'medium',
        question: "Какое ключевое слово позволяет изменять глобальную переменную внутри функции?",
        options: ["outer", "global", "public", "static"],
        correctAnswer: 1, explanation: "Ключевое слово global сообщает Python, что нужно использовать переменную из глобальной области.",
        category: 'syntax'
    },
    {
        id: 70, topicId: 'functions', difficulty: 'medium',
        question: "Как называются аргументы, передаваемые по имени (напр. func(x=5))?",
        options: ["Позиционные", "Именованные (keyword)", "Обязательные", "Скрытые"],
        correctAnswer: 1, explanation: "Это именованные аргументы, позволяющие передавать данные в любом порядке.",
        category: 'basics'
    },
    // HARD (5)
    {
        id: 71, topicId: 'functions', difficulty: 'hard',
        question: "Что такое рекурсия?",
        options: ["Цикл while", "Функция, вызывающая саму себя", "Ошибка переполнения", "Тип данных"],
        correctAnswer: 1, explanation: "Рекурсия — это процесс, при котором функция обращается к самой себе.",
        category: 'logic'
    },
    {
        id: 72, topicId: 'functions', difficulty: 'hard',
        question: "Что такое lambda-функция?",
        options: ["Тяжелая функция", "Анонимная однострочная функция", "Функция для работы с греческим алфавитом", "Декоратор"],
        correctAnswer: 1, explanation: "Lambda-функции — это краткие анонимные функции без имени.",
        category: 'syntax'
    },
    {
        id: 73, topicId: 'functions', difficulty: 'hard',
        question: "Какая область видимости идет после локальной, но перед глобальной?",
        options: ["Built-in", "Enclosing (вложенная)", "System", "Protected"],
        correctAnswer: 1, explanation: "Согласно правилу LEGB: Local -> Enclosing -> Global -> Built-in.",
        category: 'basics'
    },
    {
        id: 74, topicId: 'functions', difficulty: 'hard',
        question: "Что произойдет при изменении изменяемого объекта (списка) переданного как аргумент по умолчанию?",
        options: ["Он сбросится", "Значение будет сохраняться между вызовами", "Ошибка", "Ничего"],
        correctAnswer: 1, explanation: "Аргументы по умолчанию вычисляются один раз при определении функции, что может привести к побочным эффектам с list/dict.",
        category: 'basics'
    },
    {
        id: 75, topicId: 'functions', difficulty: 'hard',
        question: "Каким оператором можно вернуть сразу несколько значений из функции?",
        options: ["multiple return", "Через запятую (вернет кортеж)", "return list", "Никак"],
        correctAnswer: 1, explanation: "Python позволяет возвращать несколько значений через запятую, упаковывая их в tuple.",
        category: 'syntax'
    }
];
