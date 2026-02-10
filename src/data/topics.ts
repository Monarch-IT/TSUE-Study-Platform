import {
  Rocket,
  Layers,
  GitBranch,
  RefreshCw,
  Workflow,
  FileText,
  Type,
  Database,
  ListOrdered,
  BookOpen,
  Box,
  Package,
  AlertTriangle,
  Palette,
  Server,
  Code,
  LucideIcon
} from 'lucide-react';

export interface SubTopic {
  title: string;
  description: string;
  theme?: string;
}

export interface TopicData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  subtopics: SubTopic[];
  sceneType: 'orbit' | 'nebula' | 'blackhole' | 'spiral' | 'constellation' | 'wormhole';
  position: [number, number, number];
}

export const topics: TopicData[] = [
  {
    id: 'intro',
    title: 'Введение в Python',
    description: 'Вхождение в горизонт событий самого популярного языка программирования в мире.',
    icon: Rocket,
    color: '#a855f7',
    glowColor: '#c084fc',
    subtopics: [
      { title: 'Понятие высокоуровневого языка', description: 'Абстракция над машинным кодом.' },
      { title: 'Технология разработки ПО', description: 'Жизненный цикл и роль Python.' },
      { title: 'Установка и режимы работы', description: 'IDLE, REPL и IDE.' }
    ],
    sceneType: 'spiral',
    position: [0, 0, 0]
  },
  {
    id: 'structure',
    title: 'Структура языка',
    description: 'Фундаментальные атомы: переменные, выражения и операции.',
    icon: Layers,
    color: '#3b82f6',
    glowColor: '#60a5fa',
    subtopics: [
      { title: 'Переменные и ключевые слова', description: 'Правила именования и хранения данных.' },
      { title: 'Математические функции', description: 'Ввод/вывод данных и состав операций.' },
      { title: 'Ввод с клавиатуры', description: 'Интерактивность через input().' }
    ],
    sceneType: 'orbit',
    position: [10, -5, -15]
  },
  {
    id: 'conditions',
    title: 'Операторы условий',
    description: 'Ветвление реальностей и логика принятия решений.',
    icon: GitBranch,
    color: '#ec4899',
    glowColor: '#f472b6',
    subtopics: [
      { title: 'Логические выражения', description: 'and, or, not — основы выбора.' },
      { title: 'Условный оператор if', description: 'Альтернативные пути выполнения.' },
      { title: 'Многоветвление', description: 'Реализация сложных сценариев.' }
    ],
    sceneType: 'nebula',
    position: [-8, -10, -30]
  },
  {
    id: 'loops',
    title: 'Операторы циклов',
    description: 'Повторение процессов и итерация во времени.',
    icon: RefreshCw,
    color: '#14b8a6',
    glowColor: '#2dd4bf',
    subtopics: [
      { title: 'Цикл while', description: 'Условия выполнения тела цикла.' },
      { title: 'Бесконечные циклы', description: 'Опасности и альтернативы.' },
      { title: 'Обновление переменных', description: 'Краткие формы записи и аккумуляция.' }
    ],
    sceneType: 'orbit',
    position: [12, -15, -45]
  },
  {
    id: 'functions',
    title: 'Функции в Python',
    description: 'Ядро логики: создание переиспользуемых модулей.',
    icon: Workflow,
    color: '#f97316',
    glowColor: '#fb923c',
    subtopics: [
      { title: 'Создание и аргументы', description: 'Параметры и возвращаемые значения.' },
      { title: 'Локальные и глобальные', description: 'Области видимости переменных.' },
      { title: 'Lambda и Рекурсия', description: 'Анонимные функции и расчет факториала.' }
    ],
    sceneType: 'constellation',
    position: [-10, -20, -60]
  },
  {
    id: 'files',
    title: 'Работа с файлами',
    description: 'Архивация данных и чтение внешних источников.',
    icon: FileText,
    color: '#eab308',
    glowColor: '#facc15',
    subtopics: [
      { title: 'Открытие и запись', description: 'Режимы доступа и безопасность.' },
      { title: 'Атрибуты объекта файла', description: 'Управление потоками ввода-вывода.' },
      { title: 'Методы работы', description: 'Эффективное чтение и буферизация.' }
    ],
    sceneType: 'nebula',
    position: [8, -25, -75]
  },
  {
    id: 'strings',
    title: 'Строки и последовательности',
    description: 'Спектр символов и работа с текстом.',
    icon: Type,
    color: '#22c55e',
    glowColor: '#4ade80',
    subtopics: [
      { title: 'Доступ по индексу', description: 'Отрицательные индексы и длина.' },
      { title: 'Срезы и сравнение', description: 'Навигация по строковой матрице.' },
      { title: 'Модули для строк', description: 'Методы трансформации текста.' }
    ],
    sceneType: 'orbit',
    position: [-6, -30, -90]
  },
  {
    id: 'lists',
    title: 'Сложные типы: Списки',
    description: 'Динамические массивы миров.',
    icon: Database,
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    subtopics: [
      { title: 'Тип List и индексы', description: 'Проверка доступа и навигация.' },
      { title: 'Добавление и изменение', description: 'Обобщение и клонирование данных.' },
      { title: 'Срезы и метод range', description: 'Удаление и генерация последовательностей.' }
    ],
    sceneType: 'spiral',
    position: [5, -35, -105]
  },
  {
    id: 'tuples',
    title: 'Кортежи',
    description: 'Стабильность неизменяемых структур.',
    icon: ListOrdered,
    color: '#d946ef',
    glowColor: '#e879f9',
    subtopics: [
      { title: 'Присваивание кортежей', description: 'Групповое извлечение данных.' },
      { title: 'Возвращаемые значения', description: 'Кортежи в качестве результата функций.' }
    ],
    sceneType: 'orbit',
    position: [-8, -40, -120]
  },
  {
    id: 'dicts',
    title: 'Словари',
    description: 'Картография данных ключ-значение.',
    icon: BookOpen,
    color: '#6366f1',
    glowColor: '#818cf8',
    subtopics: [
      { title: 'Тип dict', description: 'Хеширование и быстрый поиск.' },
      { title: 'Методы словарей', description: 'Операции над парами данных.' }
    ],
    sceneType: 'blackhole',
    position: [10, -45, -135]
  },
  {
    id: 'sets',
    title: 'Множества',
    description: 'Сфера уникальности и пересечения.',
    icon: Box,
    color: '#f43f5e',
    glowColor: '#fb7185',
    subtopics: [
      { title: 'Описание множеств', description: 'Типы данных и принадлежность.' },
      { title: 'Операции над set', description: 'Объединение, разность, включение.' }
    ],
    sceneType: 'constellation',
    position: [-10, -50, -150]
  },
  {
    id: 'modules',
    title: 'Модули',
    description: 'Архитектура расширяемых систем.',
    icon: Package,
    color: '#10b981',
    glowColor: '#34d399',
    subtopics: [
      { title: 'Импорт модулей', description: 'Интеграция внешних ядер.' },
      { title: 'Собственные модули', description: 'Создание и добавление библиотек.' }
    ],
    sceneType: 'spiral',
    position: [8, -55, -165]
  },
  {
    id: 'exceptions',
    title: 'Исключения',
    description: 'Стабильность в поясе аномалий.',
    icon: AlertTriangle,
    color: '#f59e0b',
    glowColor: '#fbbf24',
    subtopics: [
      { title: 'Блок try/except', description: 'Перехват и обработка ошибок.' },
      { title: 'Finally и Else', description: 'Гарантированное завершение сценариев.' }
    ],
    sceneType: 'nebula',
    position: [-6, -60, -180]
  },
  {
    id: 'gui',
    title: 'Графический Интерфейс',
    description: 'Разработка на TKinter и Graphics.',
    icon: Palette,
    color: '#0ea5e9',
    glowColor: '#38bdf8',
    subtopics: [
      { title: 'Библиотека Graphics', description: 'Основы визуального вывода.' },
      { title: 'Создание на Tkinter', description: 'Кнопки, окна и события.' }
    ],
    sceneType: 'constellation',
    position: [5, -65, -195]
  },
  {
    id: 'database',
    title: 'Базы данных',
    description: 'Глубинное хранение в SQLite.',
    icon: Server,
    color: '#64748b',
    glowColor: '#94a3b8',
    subtopics: [
      { title: 'Реляционные БД', description: 'Понятия и концепции.' },
      { title: 'Навигатор SQLite', description: 'Конструкция и выполнение запросов.' }
    ],
    sceneType: 'wormhole',
    position: [0, -75, -220]
  }
];
