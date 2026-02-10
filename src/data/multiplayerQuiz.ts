export interface MultiplayerQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: 'history' | 'syntax' | 'philosophy' | 'types' | 'logic';
}

export const multiplayerQuizData: MultiplayerQuestion[] = [
    {
        id: 1,
        question: "В честь чего Python получил своё название?",
        options: ["В честь вида змей", "В честь шоу 'Монти Пайтон'", "В честь богов", "Случайный выбор"],
        correctAnswer: 1,
        explanation: "Язык назван в честь британского шоу 'Летающий цирк Монти Пайтона'.",
        category: 'history'
    },
    {
        id: 2,
        question: "В каком году началась разработка Python?",
        options: ["1989", "1991", "2000", "1985"],
        correctAnswer: 0,
        explanation: "Гвидо начла разработку в конце 1989 года.",
        category: 'history'
    },
    {
        id: 3,
        question: "Кто создал Python?",
        options: ["Линус Торвальдс", "Гвидо ван Россум", "Бьерн Страуструп", "Джеймс Гослинг"],
        correctAnswer: 1,
        explanation: "Создатель языка — Гвидо ван Россум.",
        category: 'history'
    },
    {
        id: 4,
        question: "Какой девиз лучше всего описывает 'Дзен Python'?",
        options: ["Сложное лучше, чем простое", "Явное лучше, чем неявное", "Быстрота важнее красоты", "Код должен быть кратчайшим"],
        correctAnswer: 1,
        explanation: "'Explicit is better than implicit' — один из принципов PEP 20.",
        category: 'philosophy'
    },
    {
        id: 5,
        question: "Как импортировать 'Дзен Python'?",
        options: ["import zen", "import philosophy", "import this", "import dzen"],
        correctAnswer: 2,
        explanation: "Команда 'import this' выводит философию языка.",
        category: 'philosophy'
    },
    {
        id: 6,
        question: "Python — это язык какого уровня?",
        options: ["Низкого", "Среднего", "Высокого", "Машинного"],
        correctAnswer: 2,
        explanation: "Python — высокоуровневый язык.",
        category: 'history'
    },
    {
        id: 7,
        question: "Что такое PEP?",
        options: ["Тип данных", "Предложение по улучшению", "Менеджер пакетов", "Интерфейс"],
        correctAnswer: 1,
        explanation: "PEP — Python Enhancement Proposal.",
        category: 'history'
    },
    {
        id: 8,
        question: "Какое расширение у файлов Python?",
        options: [".pt", ".py", ".ph", ".python"],
        correctAnswer: 1,
        explanation: "Стандартное расширение — .py.",
        category: 'syntax'
    },
    {
        id: 9,
        question: "Как обозначаются комментарии?",
        options: ["//", "/*", "#", "--"],
        correctAnswer: 2,
        explanation: "Комментарии начинаются с символа решетки (#).",
        category: 'syntax'
    },
    {
        id: 10,
        question: "Как в Python обозначаются блоки кода?",
        options: ["Скобками {}", "Отступами", "Ключевыми словами", "Точкой с запятой"],
        correctAnswer: 1,
        explanation: "Структура кода определяется отступами.",
        category: 'syntax'
    },
    {
        id: 11,
        question: "Какая функция выводит текст?",
        options: ["log()", "print()", "echo()", "write()"],
        correctAnswer: 1,
        explanation: "Используется функция print().",
        category: 'syntax'
    },
    {
        id: 12,
        question: "Что такое байт-код?",
        options: ["Код процессора", "Промежуточный код PVM", "Текст программы", "Микрокод"],
        correctAnswer: 1,
        explanation: "Python компилирует код в байт-код для виртуальной машины.",
        category: 'history'
    },
    {
        id: 13,
        question: "Что означает GIL?",
        options: ["Global Interpreter Lock", "General Import Link", "Grand Internal Logic", "Global Interface Library"],
        correctAnswer: 0,
        explanation: "GIL — механизм блокировки интерпретатора.",
        category: 'history'
    },
    {
        id: 14,
        question: "Какая типизация в Python?",
        options: ["Статическая", "Динамическая сильная", "Динамическая слабая", "Ручная"],
        correctAnswer: 1,
        explanation: "Python — динамический язык с сильной типизацией.",
        category: 'types'
    },
    {
        id: 15,
        question: "Как называется менеджер пакетов?",
        options: ["npm", "pip", "apt", "brew"],
        correctAnswer: 1,
        explanation: "Стандартный менеджер — pip.",
        category: 'history'
    },
    {
        id: 16,
        question: "Гвидо ван Россум до 2018 года был...",
        options: ["Королем", "BDFL", "Директором", "Президентом"],
        correctAnswer: 1,
        explanation: "Его титул — Benevolent Dictator For Life.",
        category: 'history'
    },
    {
        id: 17,
        question: "От какого языка произошел Python?",
        options: ["C++", "Java", "ABC", "Fortran"],
        correctAnswer: 2,
        explanation: "Предшественником был язык ABC.",
        category: 'history'
    },
    {
        id: 18,
        question: "Какая библиотека встроена для GUI?",
        options: ["Qt", "Tkinter", "React", "GTK"],
        correctAnswer: 1,
        explanation: "Tkinter — стандартная библиотека для графики.",
        category: 'syntax'
    },
    {
        id: 19,
        question: "NASA использует Python?",
        options: ["Нет", "Да", "Только для сайта", "Только для почты"],
        correctAnswer: 1,
        explanation: "NASA активно использует его в научных расчетах.",
        category: 'history'
    },
    {
        id: 20,
        question: "Принцип 'Красивое лучше, чем уродливое' это...",
        options: ["Закон дизайна", "Принцип Дзена Python", "Правило Google", "Случайная фраза"],
        correctAnswer: 1,
        explanation: "Это первый принцип философии Python.",
        category: 'philosophy'
    },
    {
        id: 21,
        question: "Что вернет bool(0)?",
        options: ["True", "False", "None", "Ошибка"],
        correctAnswer: 1,
        explanation: "Ноль в логическом контексте — это False.",
        category: 'logic'
    },
    {
        id: 22,
        question: "Как узнать длину строки?",
        options: ["size()", "count()", "len()", "length()"],
        correctAnswer: 2,
        explanation: "Используется встроенная функция len().",
        category: 'syntax'
    },
    {
        id: 23,
        question: "Как возвести в степень 2^3?",
        options: ["2 ^ 3", "2 ** 3", "2 * 3", "power(2, 3)"],
        correctAnswer: 1,
        explanation: "Оператор возведения в степень — **.",
        category: 'syntax'
    },
    {
        id: 24,
        question: "Тип данных для целых чисел?",
        options: ["float", "int", "str", "long"],
        correctAnswer: 1,
        explanation: "Целые числа имеют тип int.",
        category: 'types'
    },
    {
        id: 25,
        question: "Как получить данные от пользователя?",
        options: ["get()", "read()", "input()", "listen()"],
        correctAnswer: 2,
        explanation: "Функция input() считывает ввод с клавиатуры.",
        category: 'syntax'
    },
    {
        id: 26,
        question: "Что такое PyPI?",
        options: ["Браузер", "Репозиторий пакетов", "Версия Python", "Среда разработки"],
        correctAnswer: 1,
        explanation: "PyPI — Python Package Index.",
        category: 'history'
    },
    {
        id: 27,
        question: "Можно ли менять элементы в кортеже (tuple)?",
        options: ["Да", "Нет", "Иногда", "Только админу"],
        correctAnswer: 1,
        explanation: "Кортежи неизменяемы.",
        category: 'types'
    },
    {
        id: 28,
        question: "Какой оператор проверяет равенство?",
        options: ["=", "==", "is", "equal"],
        correctAnswer: 1,
        explanation: "== используется для сравнения значений.",
        category: 'logic'
    },
    {
        id: 29,
        question: "Что делает break?",
        options: ["Ломает код", "Выходит из цикла", "Пропускает шаг", "Выключает компьютер"],
        correctAnswer: 1,
        explanation: "break прерывает выполнение ближайшего цикла.",
        category: 'syntax'
    },
    {
        id: 30,
        question: "Python — это проект с открытым кодом?",
        options: ["Да", "Нет", "Раньше был", "Только для платных версий"],
        correctAnswer: 0,
        explanation: "Python является Open Source проектом.",
        category: 'history'
    }
];
