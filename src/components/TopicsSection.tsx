import SectionTitle from './SectionTitle';
import TopicCard from './TopicCard';
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
  Server
} from 'lucide-react';

const topics = [
  {
    id: 'introduction',
    title: 'Введение в Python',
    icon: Rocket,
    gradient: 'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
    subtopics: [
      'Понятие высокоуровневого языка',
      'Технология разработки ПО',
      'Общая информация о Python',
      'Установка Python на компьютер',
      'Режимы работы Python'
    ]
  },
  {
    id: 'structure',
    title: 'Структура языка Python',
    icon: Layers,
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    subtopics: [
      'Переменные и ключевые слова',
      'Выражения и операции',
      'Порядок операций',
      'Математические функции',
      'Ввод и вывод данных'
    ]
  },
  {
    id: 'conditions',
    title: 'Операторы условий',
    icon: GitBranch,
    gradient: 'bg-gradient-to-br from-pink-500/20 to-purple-500/20',
    subtopics: [
      'Логические выражения и операторы',
      'Операции and, or, not',
      'Условный оператор if',
      'Альтернативное выполнение',
      'Многоветвление в Python'
    ]
  },
  {
    id: 'loops',
    title: 'Операторы циклов',
    icon: RefreshCw,
    gradient: 'bg-gradient-to-br from-cyan-500/20 to-green-500/20',
    subtopics: [
      'Понятие оператора цикла',
      'Условия выполнения тела цикла',
      'Оператор цикла while',
      'Бесконечные циклы',
      'Примеры использования'
    ]
  },
  {
    id: 'functions',
    title: 'Функции в Python',
    icon: Workflow,
    gradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    subtopics: [
      'Параметры и аргументы',
      'Локальные и глобальные переменные',
      'Функции с возвратом результата',
      'Lambda-выражения',
      'Рекурсивные функции'
    ]
  },
  {
    id: 'files',
    title: 'Работа с файлами',
    icon: FileText,
    gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
    subtopics: [
      'Открытие файлов',
      'Чтение и запись',
      'Атрибуты файла',
      'Методы работы с файлами'
    ]
  },
  {
    id: 'strings',
    title: 'Строки в Python',
    icon: Type,
    gradient: 'bg-gradient-to-br from-green-500/20 to-teal-500/20',
    subtopics: [
      'Доступ по индексу',
      'Отрицательные индексы',
      'Срезы строк',
      'Операторы для строк',
      'Модули для строк'
    ]
  },
  {
    id: 'data',
    title: 'Сложные типы данных',
    icon: Database,
    gradient: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
    subtopics: [
      'Тип списка (List)',
      'Операции со списками',
      'Срезы и клонирование',
      'Функция range'
    ]
  },
  {
    id: 'tuples',
    title: 'Кортежи',
    icon: ListOrdered,
    gradient: 'bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20',
    subtopics: [
      'Присваивание кортежей',
      'Кортежи как возвращаемые значения',
      'Неизменяемость кортежей'
    ]
  },
  {
    id: 'dictionaries',
    title: 'Словари',
    icon: BookOpen,
    gradient: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20',
    subtopics: [
      'Тип словаря (dict)',
      'Операции со словарями',
      'Методы словарей'
    ]
  },
  {
    id: 'sets',
    title: 'Множества',
    icon: Box,
    gradient: 'bg-gradient-to-br from-rose-500/20 to-red-500/20',
    subtopics: [
      'Описание множеств',
      'Объединение и пересечение',
      'Разность и включение',
      'Принадлежность элемента'
    ]
  },
  {
    id: 'modules',
    title: 'Модульное программирование',
    icon: Package,
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20',
    subtopics: [
      'Импорт модуля',
      'Создание собственных модулей',
      'Добавление модулей'
    ]
  },
  {
    id: 'exceptions',
    title: 'Исключения',
    icon: AlertTriangle,
    gradient: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
    subtopics: [
      'Типы исключений',
      'Обработка try/except',
      'Работа с finally и else'
    ]
  },
  {
    id: 'gui',
    title: 'Графические интерфейсы',
    icon: Palette,
    gradient: 'bg-gradient-to-br from-sky-500/20 to-indigo-500/20',
    subtopics: [
      'Библиотека Graphics',
      'Создание GUI с Tkinter',
      'Элементы интерфейса'
    ]
  },
  {
    id: 'databases',
    title: 'Работа с базами данных',
    icon: Server,
    gradient: 'bg-gradient-to-br from-slate-500/20 to-gray-500/20',
    subtopics: [
      'Реляционные базы данных',
      'Конструкция SQLite',
      'SQL-запросы в Python'
    ]
  }
];

export default function TopicsSection() {
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="container mx-auto">
        <SectionTitle 
          title="Темы курса"
          subtitle="Полное погружение в мир Python — от основ до продвинутых концепций"
          icon={Rocket}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <div key={topic.id} id={topic.id} className="scroll-mt-24">
              <TopicCard
                title={topic.title}
                subtopics={topic.subtopics}
                icon={topic.icon}
                index={index}
                gradient={topic.gradient}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
