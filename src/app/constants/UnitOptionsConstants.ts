export const UNIT_OPTIONS_CONSTANTS = [
    {
      required: false,
      unitType:
        ['Автобетононасосы'],
      key: 'Высота подачи бетона',
      label: 'Высота подачи бетона',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        ['Автобетононасосы'],
      key: 'Производительность',
      label: 'Производительность',
      controlType: 'number',
      measure: 'куб.м./ч.'
    },
    {
      required: true,
      unitType:
        ['Автобетононасосы'],
      key: 'Тип бетононасоса',
      label: 'Тип бетононасоса',
      controlType: 'select',
      options: [
        {key: 'автомобильный,', value: 'автомобильный'},
        {key: 'стационарный', value: 'стационарный'},
        {key: 'мини-бетононасос', value: 'мини-бетононасос'}
      ]
    },
    {
      required: true,
      unitType:
        ['Автовышки'],
      key: 'Высота подъема',
      label: 'Высота подъема',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        ['Автовышки'],
      key: 'Грузоподъемность корзины',
      label: 'Грузоподъемность корзины',
      controlType: 'number',
      measure: 'кг'
    },
    {
      required: false,
      unitType:
        ['Автовышки'],
      key: 'Боковой вылет стрелы',
      label: 'Боковой вылет стрелы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Автовышки'],
      key: 'Тип автовышки',
      label: 'Тип автовышки',
      controlType: 'select',
      options: [
        {key: 'телескопический', value: 'телескопический'},
        {key: 'коленчатый', value: 'коленчатый'},
        {key: 'комбинированный', value: 'комбинированный'}
      ]
    },
    {
      required: true,
      unitType:
        ['Автовышки'],
      key: 'Тип корзины',
      label: 'Тип корзины',
      controlType: 'select',
      options: [
        {key: 'люлька', value: 'люлька'},
        {key: 'платформа', value: 'платформа'},
        {key: 'прицепная', value: 'прицепная'},
        {key: 'мини', value: 'мини'},
      ]
    },
    {
      required: true,
      unitType:
        ['Автокраны'],
      key: 'Грузоподъемность автокрана',
      label: 'Грузоподъемность автокрана',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: false,
      unitType:
        ['Автокраны'],
      key: 'Длина гуська',
      label: 'Длина гуська',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        ['Ассенизаторы и илососы'],
      key: 'Глубина',
      label: 'Глубина',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        ['Ассенизаторы и илососы'],
      key: 'Длина шланга',
      label: 'Длина шланга',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Ассенизаторы и илососы'],
      key: 'Тип автоцистерны',
      label: 'Тип автоцистерны',
      controlType: 'select',
      options: [
        {key: 'вакуумная', value: 'вакуумная'},
        {key: 'илососная', value: 'илососная'},
        {key: 'каналопромывочная', value: 'каналопромывочная'},
        {key: 'комбинированная', value: 'комбинированная'},
      ]
    },
    {
      required: true,
      unitType:
        ['Бензовозы и автоцистерны'],
      key: 'Емкость',
      label: 'Емкость',
      controlType: 'number',
      measure: 'л'
    },
    {
      required: true,
      unitType:
        ['Бензовозы и автоцистерны'],
      key: 'Вид перевозки ГСМ',
      label: 'Вид перевозки ГСМ',
      controlType: 'select',
      options: [
        {key: 'бензовоз', value: 'бензовоз'},
        {key: 'мазутовоз', value: 'мазутовоз'},
        {key: 'битумовоз', value: 'битумовоз'},
        {key: 'нефтевоз', value: 'нефтевоз'},
        {key: 'газовоз', value: 'газовоз'},
        {key: 'масловоз', value: 'масловоз'},
        {key: 'автогудронатор', value: 'автогудронатор'},
      ]
    },
    {
      required: true,
      unitType:
        ['Бензовозы и автоцистерны'],
      key: 'Объем барабана миксера',
      label: 'Объем барабана миксера',
      controlType: 'number',
      measure: 'куб.м.'
    },
    {
      required: true,
      unitType:
        ['Бензовозы и автоцистерны'],
      key: 'Вид цистерны',
      label: 'Вид цистерны',
      controlType: 'select',
      options: [
        {key: 'цементовоз', value: 'цементовоз'},
        {key: 'автобетоносмеситель', value: 'автобетоносмеситель'}
      ]
    },
    {
      required: true,
      unitType:
        ['Бульдозеры'],
      key: 'Ширина отвала',
      label: 'Ширина отвала',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Бульдозеры'],
      key: 'Тип бульдозера',
      label: 'Тип бульдозера',
      controlType: 'select',
      options: [
        {key: 'болотоход', value: 'болотоход'},
        {key: 'мини-бульдозер', value: 'мини-бульдозер'},
        {key: 'тяжелый', value: 'тяжелый'},
        {key: 'рыхлитель', value: 'рыхлитель'},
        {key: 'кабелеукладчик', value: 'кабелеукладчик'},
      ]
    },
    {
      required: true,
      unitType:
        ['Гидромолоты'],
      key: 'Стрела гидромолота',
      label: 'Стрела гидромолота',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        ['Гидромолоты'],
      key: 'Частота ударов',
      label: 'Частота ударов',
      controlType: 'number',
      measure: 'удар/мин.'
    },
    {
      required: false,
      unitType:
        ['Гидромолоты'],
      key: 'Энергия удара',
      label: 'Энергия удара',
      controlType: 'number',
      measure: 'Дж'
    },
    {
      required: true,
      unitType:
        ['Гидромолоты'],
      key: 'Тип гидромолота',
      label: 'Тип гидромолота',
      controlType: 'select',
      options: [
        {key: 'легкий', value: 'легкий'},
        {key: 'средний', value: 'средний'},
        {key: 'тяжелый', value: 'тяжелый'},
      ]
    },
    {
      required: true,
      unitType:
        ['Грейдеры'],
      key: 'Класс грейдера',
      label: 'Класс грейдера',
      controlType: 'select',
      options: [
        {key: '100', value: 100},
        {key: '140', value: 140},
        {key: '180', value: 180},
        {key: '250', value: 250},
        {key: '300', value: 300},
        {key: '400', value: 400},
      ]
    },
    {
      required: true,
      unitType:
        ['Грейдеры'],
      key: 'Наличие рыхлителя',
      label: 'Наличие рыхлителя',
      controlType: 'select',
      options: [
        {key: 'true', value: true},
        {key: 'false', value: false}
      ]
    },
    {
      required: true,
      unitType:
        ['Грейдеры'],
      key: 'Количество отвалов',
      label: 'Количество отвалов',
      controlType: 'select',
      options: [
        {key: '1', value: 1},
        {key: '2', value: 2},
        {key: '3', value: 3},
      ]
    },
    {
      required: false,
      unitType:
        ['Грейферы и драглайны'],
      key: 'Вид ковша',
      label: 'Вид ковша',
      controlType: 'select',
      options: [
        {key: 'сыпучие грузы', value: 'сыпучие грузы'},
        {key: 'магнит', value: 'магнит'},
        {key: 'металлоломный', value: 'металлоломный'},
      ]
    },
    {
      required: false,
      unitType:
        ['Грейферы и драглайны'],
      key: 'Вид грейфера',
      label: 'Вид грейфера',
      controlType: 'select',
      options: [
        {key: 'лесовоз', value: 'лесовоз'},
        {key: 'сортиментовоз', value: 'сортиментовоз'},
        {key: 'ломовоз', value: 'ломовоз'},
      ]
    },
    {
      required: true,
      unitType:
        ['Дорожно-строительная техника'],
      key: 'Вид техники',
      label: 'Вид техники',
      controlType: 'select',
      options: [
        {key: 'дорожная фреза', value: 'дорожная фреза'},
        {key: 'асфальтоукладчик', value: 'асфальтоукладчик'},
        {key: 'гудронатор', value: 'гудронатор'},
        {key: 'виброплита', value: 'виброплита'},
        {key: 'вибротрамбовка', value: 'вибротрамбовка'},
        {key: 'каток', value: 'каток'},
      ]
    },
    {
      required: true,
      unitType:
        ['Манипуляторы'],
      key: 'Тип манипулятора',
      label: 'Тип манипулятора',
      controlType: 'select',
      options: [
        {key: 'коленчатый', value: 'коленчатый'},
        {key: 'телескопический', value: 'телескопический'},
      ]
    },
    {
      required: false,
      unitType:
        ['Манипуляторы'],
      key: 'Низкорамный',
      label: 'Низкорамный',
      controlType: 'checkbox',
      options: [
        {key: 'true', value: true},
        {key: 'false', value: false}
      ]
    },
    {
      required: true,
      unitType:
        ['Мини-погрузчики'],
      key: 'Высота высыпания',
      label: 'Высота высыпания',
      controlType: 'number',
      measure: 'м'
    }
    ,
    {
      required: true,
      unitType: ['Мини-погрузчики'],
      key: 'Тип погрузчика',
      label: 'Тип погрузчика',
      controlType: 'select',
      options:
        [
          {key: 'ковшовый', value: 'ковшовый'},
          {key: 'вилочный', value: 'вилочный'},
          {key: 'телескопический', value: 'телескопический'},
        ]
    },
    {
      required: true,
      unitType: ['Мини-погрузчики'],
      key: 'Вид привода',
      label: 'Вид привода',
      controlType: 'select',
      options:
        [
          {key: 'бензиновый', value: 'бензиновый'},
          {key: 'дизельный', value: 'дизельный'},
          {key: 'электро', value: 'электро'},
        ]
    },
    {
      required: false,
      unitType: ['Мусоровозы и бункеровозы'],
      key: 'Грузоподъемность бункера',
      label: 'Грузоподъемность бункера',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: false,
      unitType: ['Мусоровозы и бункеровозы'],
      key: 'Объем бункера',
      label: 'Объем бункера',
      controlType: 'number',
      measure: 'куб.м.'
    },
    {
      required: true,
      unitType: ['Мусоровозы и бункеровозы'],
      key: 'Тип бункера',
      label: 'Тип бункера',
      controlType: 'select',
      options:
        [
          {key: 'бункеровоз', value: 'бункеровоз'},
          {key: 'мусоровоз', value: 'мусоровоз'},
          {key: 'контейнер', value: 'контейнер'},
        ]
    },
    {
      required: false,
      unitType: ['Мусоровозы и бункеровозы'],
      key: 'Тип загрузки бункера',
      label: 'Тип загрузки бункера',
      controlType: 'select',
      options:
        [
          {key: 'боковая', value: 'боковая'},
          {key: 'задняя', value: 'задняя'},
        ]
    },
    {
      required: false,
      unitType:
        ['Мусоровозы и бункеровозы'],
      key: 'Вид транспортируемых грузов',
      label: 'Вид транспортируемых грузов',
      controlType: 'select',
      options:
        [
          {key: 'строительный мусор', value: 'строительный мусор'},
          {key: 'крупногабаритный мусор', value: 'крупногабаритный мусор'},
          {key: 'грунт', value: 'грунт'},
          {key: 'мебель и бытовая техника', value: 'мебель и бытовая техника'},
          {key: 'мусор после пожара', value: 'мусор после пожара'},
          {key: 'производственный мусор', value: 'производственный мусор'},
          {key: 'опасные отходы', value: 'опасные отходы'},
          {key: 'крупногабаритный мусор', value: 'крупногабаритный мусор'},
        ]
    },
    {
      required: true,
      unitType:
        ['Низкорамные тралы'],
      key: 'Длина платформы',
      label: 'Длина платформы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Низкорамные тралы'],
      key: 'Тип трала',
      label: 'Тип трала',
      controlType: 'select',
      options:
        [
          {key: 'низкорамный', value: 'низкорамный'},
          {key: 'высокорамный', value: 'высокорамный'},
        ]
    },
    {
      required: true,
      unitType:
        ['Низкорамные тралы'],
      key: 'Вид площадки',
      label: 'Вид площадки',
      controlType: 'select',
      options:
        [
          {key: 'раздвижная платформа', value: 'раздвижная платформа'},
          {key: 'нераздвижная площадка', value: 'нераздвижная площадка'},
        ]
    },
    {
      required: true,
      unitType:
        ['Низкорамные тралы'],
      key: 'Наличие сходен трала',
      label: 'Наличие сходен трала',
      controlType: 'checkbox',
      options:
        [
          {key: 'true', value: true},
          {key: 'false', value: false}
        ]
    },
    {
      required: false,
      unitType:
        ['Низкорамные тралы'],
      key: 'Кол-во осей трала',
      label: 'Кол-во осей трала',
      controlType: 'number'
    },
    {
      required: true,
      unitType:
        ['Коммунально-дорожные машины'],
      key: 'Тип',
      label: 'Тип',
      controlType: 'select',
      options:
        [
          {key: 'комбинированная', value: 'комбинированная'},
          {key: 'поливомоечная', value: 'поливомоечная'},
          {key: 'снегоуборочная', value: 'снегоуборочная'},
          {key: 'подметально-уборочная', value: 'подметально-уборочная'},
          {key: 'пескоразбрасывательная', value: 'пескоразбрасывательная'},
        ]
    },
    {
      required: true,
      unitType:
        ['Коммунально-дорожные машины'],
      key: 'Навесное оборудование',
      label: 'Навесное оборудование',
      controlType: 'select',
      options:
        [
          {key: 'цилиндрическая щетка', value: 'цилиндрическая щетка'},
          {key: 'шнекороторный снегометатель', value: 'шнекороторный снегометатель'},
          {key: 'коммунальный отвал', value: 'коммунальный отвал'},
          {key: 'пескоразбрасыватель', value: 'пескоразбрасыватель'},
        ]
    },
    {
      required: true,
      unitType:
        ['Самосвалы и тонары'],
      key: 'Высота кузова',
      label: 'Высота кузова',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Самосвалы и тонары'],
      key: 'Объем кузова',
      label: 'Объем кузова',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Самосвалы и тонары'],
      key: 'Тип самосвала',
      label: 'Тип самосвала',
      controlType: 'select',
      options:
        [
          {key: 'карьерный', value: 'карьерный'},
          {key: 'вездеход', value: 'вездеход'},
          {key: 'тонар', value: 'тонар'},
          {key: 'с прицепом', value: 'с прицепом'},
        ]
    },
    {
      required: false,
      unitType:
        ['Тракторы и сельхозтехника'],
      key: 'Вес трактора',
      label: 'Вес трактора',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: true,
      unitType:
        ['Тракторы и сельхозтехника'],
      key: 'Тип трактора',
      label: 'Тип трактора',
      controlType: 'select',
      options:
        [
          {key: 'уборочный', value: 'уборочный'},
          {key: 'бара грунторез', value: 'бара грунторез'},
          {key: 'уборочный', value: 'уборочный'},
          {key: 'траншеекопатель', value: 'траншеекопатель'},
          {key: 'минитрактор', value: 'минитрактор'},
          {key: 'коммунальный', value: 'коммунальный'},
          {key: 'сельскохозяйственный', value: 'сельскохозяйственный'},
        ]
    },
    {
      required: true,
      unitType:
        ['Фронтальные погрузчики'],
      key: 'Вид погрузчика',
      label: 'Вид погрузчика',
      controlType: 'select',
      options:
        [
          {key: 'фронтальный', value: 'фронтальный'},
          {key: 'телескопический', value: 'телескопический'},
          {key: 'вилочный', value: 'вилочный'},
          {key: 'складской', value: 'складской'},
          {key: 'автопогрузчик', value: 'автопогрузчик'},
        ]
    },
    {
      required: true,
      unitType:
        ['Эвакуаторы и автовозы'],
      key: 'Тип эвакуатора',
      label: 'Тип эвакуатора',
      controlType: 'select',
      options:
        [
          {key: 'с лебедкой', value: 'с лебедкой'},
          {key: 'со сдвижной платформой', value: 'со сдвижной платформой'},
          {key: 'с ломанной платформой', value: 'с ломанной платформой'},
          {key: 'с гидроманипулятором', value: 'с гидроманипулятором'},
          {key: 'с частичной погрузкой', value: 'с частичной погрузкой'},
          {key: 'автовоз', value: 'автовоз'},
          {key: 'грузовой эвакуатор', value: 'грузовой эвакуатор'},
        ]
    },
    {
      required: true,
      unitType:
        ['Экскаваторы'],
      key: 'Длина руки экскаватора',
      label: 'Длина руки экскаватора',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Экскаваторы'],
      key: 'Ширина ковша',
      label: 'Ширина ковша',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        ['Экскаваторы'],
      key: 'Размер',
      label: 'Размер',
      controlType: 'select',
      options:
        [
          {key: 'габаритный', value: 'габаритный'},
          {key: 'негабаритный', value: 'негабаритный'},
        ]
    },
    {
      required: true,
      unitType: ['Экскаваторы-погрузчики'],
      key: 'Объем погрузочного ковша',
      label: 'Объем погрузочного ковша',
      controlType: 'number',
      measure:
        'куб.м.'
    },
    {
      required: true,
      unitType:
        ['Экскаваторы-погрузчики'],
      key: 'Объем ковша для копки',
      label: 'Объем ковша для копки',
      controlType: 'number',
      measure: 'куб.м.'
    },
    {
      required: false,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Диаметр бурения',
      label: 'Диаметр бурения',
      controlType: 'number',
      measure: 'мм'
    },
    {
      required: true,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Глубина бурения',
      label: 'Глубина бурения',
      controlType: 'number',
      measure: 'мм'
    },
    {
      required: true,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Тип бура',
      label: 'Тип бура',
      controlType: 'select',
      options:
        [
          {key: 'ямобур', value: 'ямобур'},
          {key: 'буровая установка', value: 'буровая установка'},
          {key: 'сваебой', value: 'сваебой'},
        ]
    },
    {
      required: false,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Масса молота сваебоя',
      label: 'Масса молота сваебоя',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: false,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Максимальное сечение сваи',
      label: 'Максимальное сечение сваи',
      controlType: 'number',
      measure: 'кв.м.'
    },
    {
      required: false,
      unitType:
        ['Ямобуры и сваебои'],
      key: 'Максимальная длина сваи',
      label: 'Максимальная длина сваи',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Режим работы',
      label: 'Режим работы',
      controlType: 'text'
    },
    {
      required: false,
      unitType: ['all'],
      key: 'Минимальное время заказа',
      label: 'Минимальное время заказа',
      controlType: 'number',
      measure: 'ч.'
    },
    {
      required: false,
      unitType: ['all'],
      key: 'Цена за 1 час',
      label: 'Цена за 1 час',
      controlType: 'number',
      measure: 'руб.'
    },
    {
      required: false,
      unitType: ['all'],
      key: 'Цена за смену',
      label: 'Цена за смену',
      controlType: 'number',
      measure: 'руб.'
    },
    {
      required: true,
      unitType:
        [
          'Автокраны',
          'Ассенизаторы и илососы',
          'Бензовозы и автоцистерны',
          'Бетоновозы и цементовозы',
          'Гидромолоты',
          'Грейферы и драглайны',
          'Манипуляторы',
          'Мини-погрузчики',
          'Тракторы и сельхозтехника',
          'Фронтальные погрузчики',
          'Экскаваторы',
          'Ямобуры и сваебои'
        ],
      key: 'Тип проходимости',
      label: 'Тип проходимости',
      controlType: 'select',
      options:
        [
          {key: 'колесный', value: 'колесный'},
          {key: 'вездеход', value: 'вездеход'},
          {key: 'гусенечный', value: 'гусенечный'},
        ]
    },
    {
      required: true,
      unitType:
        [
          'Ассенизаторы и илососы',
          'Бензовозы и автоцистерны',
          'Коммунально-дорожные машины'
        ],
      key:
        'Объем цистерны',
      label: 'Объем цистерны',
      controlType: 'number',
      measure: 'куб.м.'
    },
    {
      required: false,
      unitType:
        [
          'Автобетононасосы',
          'Бензовозы и автоцистерны',
          'Бетоновозы и цементовозы'
        ],
      key: 'Кол-во секций',
      label: 'Кол-во секций',
      controlType: 'number'
    },
    {
      required: true,
      unitType:
        [
          'Автобетононасосы',
          'Бетоновозы и цементовозы'
        ],
      key: 'Длина стрелы',
      label: 'Длина стрелы',
      controlType: 'number',
      measure: 'м'
    }
    ,
    {
      required: true,
      unitType:
        [
          'Грейферы и драглайны',
          'Мини-погрузчики',
          'Мини-эксковаторы',
          'Фронтальные погрузчики',
          'Экскаваторы'
        ],
      key: 'Объем ковша',
      label: 'Объем ковша',
      controlType: 'number',
      measure: 'куб.м.'
    },
    {
      required: true,
      unitType:
        [
          'Бульдозеры',
          'Дорожные катки и асфальтоукладчики'
        ],
      key: 'Мощность двигателя',
      label: 'Мощность двигателя',
      controlType: 'number',
      measure: 'л.с.'
    },
    {
      required: true,
      unitType:
        [
          'Автокраны',
          'Манипуляторы',
          'Ямобуры и сваебои'
        ],
      key: 'Вылет стрелы',
      label: 'Вылет стрелы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Грейферы и драглайны',
          'Мини-погрузчики',
          'Фронтальные погрузчики',
          'Экскаваторы-погрузчики'
        ],
      key: 'Грузоподъемность ковша',
      label: 'Грузоподъемность ковша',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: true,
      unitType:
        [
          'Бульдозеры',
          'Мини-эксковаторы',
          'Экскаваторы',
          'Экскаваторы-погрузчики'
        ],
      key: 'Эксплуатационная масса',
      label: 'Эксплуатационная масса',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: false,
      unitType:
        [
          'Мини-погрузчики',
          'Мини-эксковаторы',
          'Тракторы и сельхозтехника',
          'Фронтальные погрузчики',
          'Экскаваторы',
          'Экскаваторы-погрузчики'
        ],
      key: 'Доп. оборудование',
      label: 'Доп. оборудование',
      controlType: 'select',
      options:
        [
          {key: 'гидромолот', value: 'гидромолот'},
          {key: 'гидробур', value: 'гидробур'},
          {key: 'ковш смесительный', value: 'ковш смесительный'},
          {key: 'грейдерный отвал', value: 'грейдерный отвал'},
          {key: 'косилка', value: 'косилка'},
          {key: 'снегоочиститель', value: 'снегоочиститель'},
          {key: 'фреза дорожная', value: 'фреза дорожная'},
          {key: 'бетоносмеситель', value: 'бетоносмеситель'},
          {key: 'паллетные вилы', value: 'паллетные вилы'},
          {key: 'щетка', value: 'щетка'},
          {key: 'рыхлитель', value: 'рыхлитель'},
          {key: 'грейфер', value: 'грейфер'},
          {key: 'планировочный ковш', value: 'планировочный ковш'},
          {key: 'вибротрамбовка', value: 'вибротрамбовка'},
          {key: 'культиватор', value: 'культиватор'},
          {key: 'челюстной ковш', value: 'челюстной ковш'},
          {key: 'цепной паук', value: 'цепной паук'},
          {key: 'ямобур', value: 'ямобур'},
        ]
    },
    {
      required: true,
      unitType:
        [
          'Манипуляторы',
          'Самосвалы и тонары'
        ],
      key: 'Грузоподъемность кузова',
      label: 'Грузоподъемность кузова',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: true,
      unitType:
        [
          'Манипуляторы',
          'Самосвалы и тонары'
        ],
      key: 'Длина кузова',
      label: 'Длина кузова',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Манипуляторы',
          'Самосвалы и тонары',
          'Фронтальные погрузчики'
        ],
      key: 'Ширина кузова',
      label: 'Ширина кузова',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        [
          'Мини-погрузчики',
          'Фронтальные погрузчики'
        ],
      key: 'Высота погрузчика',
      label: 'Высота погрузчика',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        [
          'Мини-погрузчики',
          'Фронтальные погрузчики'
        ],
      key: 'Масса погрузчика',
      label: 'Масса погрузчика',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Манипуляторы',
          'Эвакуаторы и автовозы'
        ],
      key: 'Грузоподъемность стрелы',
      label: 'Грузоподъемность стрелы',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: true,
      unitType:
        [
          'Низкорамные тралы',
          'Эвакуаторы и автовозы',
          'Ямобуры и сваебои'
        ],
      key: 'Грузоподъемность',
      label: 'Грузоподъемность',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: true,
      unitType:
        [
          'Низкорамные тралы',
          'Эвакуаторы и автовозы'
        ],
      key: 'Высота платформы',
      label: 'Высота платформы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Низкорамные тралы',
          'Эвакуаторы и автовозы'
        ],
      key: 'Ширина платформы',
      label: 'Ширина платформы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        [
          'Мини-эксковаторы',
          'Экскаваторы'
        ],
      key: 'Глубина копания',
      label: 'Глубина копания',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Мини-погрузчики',
          'Экскаваторы'
        ],
      key: 'Высота погрузки',
      label: 'Высота погрузки',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: true,
      unitType:
        [
          'Мини-погрузчики',
          'Экскаваторы'
        ],
      key: 'Ширина эксковатора',
      label: 'Ширина эксковатора',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType:
        [
          'Фронтальные погрузчики',
          'Экскаваторы'
        ],
      key: 'Назначение',
      label: 'Назначение',
      controlType: 'select',
      options:
        [
          {key: 'строительный', value: 'строительный'},
          {key: 'карьерный', value: 'карьерный'},
        ]
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Высота подачи стрелой',
      label: 'Высота подачи стрелой',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Дальность подачи стрелой',
      label: 'Дальность подачи стрелой',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Глубина подачи стрелой',
      label: 'Глубина подачи стрелой',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Ширина опор спереди',
      label: 'Ширина опор спереди',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Ширина опор сзади',
      label: 'Ширина опор сзади',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Размер площадки',
      label: 'Размер площадки',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Диаметр труб',
      label: 'Диаметр труб',
      controlType: 'number',
      measure: 'мм'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Длина концевого шланга',
      label: 'Длина концевого шланга',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Рабочее давление',
      label: 'Рабочее давление',
      controlType: 'number',
      measure: 'бар'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Высота загрузки',
      label: 'Высота загрузки',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Рабочий вес',
      label: 'Рабочий вес',
      controlType: 'number',
      measure: 'т'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Ширина уплотняемой полосы',
      label: 'Ширина уплотняемой полосы',
      controlType: 'number',
      measure: 'м'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Частота вибрации',
      label: 'Частота вибрации',
      controlType: 'number',
      measure: 'Гц'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Тип катка',
      label: 'Тип катка',
      controlType: 'select',
      options:
        [
          {key: 'асфальтный', value: 'асфальтный'},
          {key: 'грунтовый', value: 'грунтовый'},
          {key: 'комбинированный', value: 'комбинированный'},
          {key: 'ручной', value: 'ручной'},
        ]
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Кол-во вальцев',
      label: 'Кол-во вальцев',
      controlType: 'number'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Цена за сутки',
      label: 'Цена за сутки',
      controlType: 'number',
      measure: 'руб.'
    },
    {
      required: false,
      unitType: ['extra'],
      key: 'Цена за месяц',
      label: 'Цена за месяц',
      controlType: 'number',
      measure: 'руб.'
    }
  ]
;
