import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных...');

  // Создаем мастера
  const master = await prisma.master.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Анна Иванова',
      phone: '+7 (999) 123-45-67',
      bio: 'Профессиональный мастер маникюра и педикюра с опытом более 5 лет',
      workHours: {
        monday: { start: '09:00', end: '19:00' },
        tuesday: { start: '09:00', end: '19:00' },
        wednesday: { start: '09:00', end: '19:00' },
        thursday: { start: '09:00', end: '19:00' },
        friday: { start: '09:00', end: '19:00' },
        saturday: { start: '10:00', end: '18:00' },
        sunday: { start: null, end: null },
      },
    },
  });
  console.log('✓ Мастер создан:', master.name);

  // Создаем категории услуг
  const categoryManicure = await prisma.serviceCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Маникюр',
      order: 1,
    },
  });

  const categoryPedicure = await prisma.serviceCategory.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Педикюр',
      order: 2,
    },
  });

  const categoryCombo = await prisma.serviceCategory.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Комбо',
      order: 3,
    },
  });
  console.log('✓ Категории услуг созданы');

  // Создаем услуги
  const services = [
    {
      name: 'Классический маникюр',
      description: 'Обработка кутикулы, придание формы ногтям, покрытие лаком',
      duration: 60,
      price: 1500,
      categoryId: categoryManicure.id,
      order: 1,
    },
    {
      name: 'Маникюр с гель-лаком',
      description: 'Классический маникюр + покрытие гель-лаком',
      duration: 90,
      price: 2000,
      categoryId: categoryManicure.id,
      order: 2,
    },
    {
      name: 'Маникюр с дизайном',
      description: 'Маникюр с гель-лаком и дизайном (1-3 ногтя)',
      duration: 120,
      price: 2500,
      categoryId: categoryManicure.id,
      order: 3,
    },
    {
      name: 'Наращивание ногтей',
      description: 'Наращивание ногтей гелем',
      duration: 180,
      price: 3500,
      categoryId: categoryManicure.id,
      order: 4,
    },
    {
      name: 'Классический педикюр',
      description: 'Обработка стоп, придание формы ногтям, покрытие лаком',
      duration: 90,
      price: 2000,
      categoryId: categoryPedicure.id,
      order: 1,
    },
    {
      name: 'Педикюр с гель-лаком',
      description: 'Классический педикюр + покрытие гель-лаком',
      duration: 120,
      price: 2500,
      categoryId: categoryPedicure.id,
      order: 2,
    },
    {
      name: 'Аппаратный педикюр',
      description: 'Педикюр с использованием аппарата',
      duration: 90,
      price: 2200,
      categoryId: categoryPedicure.id,
      order: 3,
    },
    {
      name: 'Маникюр + Педикюр',
      description: 'Классический маникюр и педикюр с покрытием',
      duration: 150,
      price: 3200,
      categoryId: categoryCombo.id,
      order: 1,
    },
    {
      name: 'Маникюр + Педикюр Premium',
      description: 'Маникюр и педикюр с гель-лаком',
      duration: 210,
      price: 4000,
      categoryId: categoryCombo.id,
      order: 2,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }
  console.log(`✓ Создано ${services.length} услуг`);

  // Создаем примеры работ
  const workExamples = [
    {
      title: 'Французский маникюр',
      description: 'Классический френч с тонкой линией улыбки',
      imageUrl: '/images/examples/french-manicure.jpg',
      category: 'Маникюр',
      order: 1,
    },
    {
      title: 'Нюдовый дизайн',
      description: 'Нежный нюдовый дизайн с золотым декором',
      imageUrl: '/images/examples/nude-design.jpg',
      category: 'Маникюр',
      order: 2,
    },
    {
      title: 'Яркий летний дизайн',
      description: 'Яркие цвета с тропическими элементами',
      imageUrl: '/images/examples/summer-design.jpg',
      category: 'Маникюр',
      order: 3,
    },
    {
      title: 'Геометрия',
      description: 'Стильный геометрический дизайн',
      imageUrl: '/images/examples/geometric.jpg',
      category: 'Маникюр',
      order: 4,
    },
    {
      title: 'Педикюр красный',
      description: 'Классический красный педикюр',
      imageUrl: '/images/examples/red-pedicure.jpg',
      category: 'Педикюр',
      order: 5,
    },
  ];

  for (const example of workExamples) {
    await prisma.workExample.create({
      data: example,
    });
  }
  console.log(`✓ Создано ${workExamples.length} примеров работ`);

  // Создаем настройки
  const settings = [
    { key: 'bonus_percentage', value: '5' },
    { key: 'review_bonus', value: '50' },
    { key: 'reminder_24h_enabled', value: 'true' },
    { key: 'reminder_2h_enabled', value: 'true' },
    { key: 'google_sheets_sync', value: 'true' },
    { key: 'google_calendar_sync', value: 'true' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✓ Настройки созданы');

  console.log('База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
