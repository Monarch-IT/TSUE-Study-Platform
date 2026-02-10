export interface ProgrammingTask {
    id: string;
    topicId: string;
    title: string;
    description: string;
    boilerplate: string;
    testCases: {
        input: string;
        expectedOutput: string;
    }[];
    difficulty: 'easy' | 'medium' | 'hard';
}

export const programmingTasks: ProgrammingTask[] = [
    {
        id: 'task-1',
        topicId: 'intro',
        title: 'Первая программа',
        description: 'Напишите программу, которая выводит "Hello, TSP!" на экран.',
        boilerplate: 'print("")',
        testCases: [
            { input: '', expectedOutput: 'Hello, TSP!\n' }
        ],
        difficulty: 'easy'
    },
    {
        id: 'task-2',
        topicId: 'structure',
        title: 'Расчет площади',
        description: 'Создайте переменные width = 10 и height = 5. Выведите их произведение (площадь прямоугольника).',
        boilerplate: 'width = 10\nheight = 5\n# Ваш код ниже\n',
        testCases: [
            { input: '', expectedOutput: '50\n' }
        ],
        difficulty: 'easy'
    },
    {
        id: 'task-3',
        topicId: 'conditions',
        title: 'Магия чисел',
        description: 'Напишите программу, которая проверяет число x. Если x больше 10, выведите "Large", иначе "Small". Исходное x = 15.',
        boilerplate: 'x = 15\n# Ваш код здесь\n',
        testCases: [
            { input: '', expectedOutput: 'Large\n' }
        ],
        difficulty: 'medium'
    },
    {
        id: 'task-4',
        topicId: 'loops',
        title: 'Обратный отсчет',
        description: 'Используя цикл while, выведите числа от 5 до 1 в порядке убывания.',
        boilerplate: 'n = 5\nwhile n > 0:\n    # Ваш код\n',
        testCases: [
            { input: '', expectedOutput: '5\n4\n3\n2\n1\n' }
        ],
        difficulty: 'medium'
    },
    {
        id: 'task-5',
        topicId: 'functions',
        title: 'Квадрат числа',
        description: 'Напишите функцию square(n), которая возвращает квадрат числа. Вызовите её для числа 4 и выведите результат.',
        boilerplate: 'def square(n):\n    return n * n\n\n# Вызов функции и вывод результата\n',
        testCases: [
            { input: '', expectedOutput: '16\n' }
        ],
        difficulty: 'hard'
    }
];
