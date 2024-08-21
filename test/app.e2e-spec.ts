import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:postgres@localhost:5433/test_db',
});

beforeAll(async () => {
  await prisma.$connect();
  const tableNames = Object.values(Prisma.ModelName);
  await Promise.all(
    tableNames.map(async (table) =>
      prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
      ),
    ),
  );
});
let app: INestApplication;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

describe('AppController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('create n users', async () => {
    const nullUser4 = await prisma.user.findFirst({ where: { name: 'user4' } });
    expect(nullUser4).toBeNull();
    const users = createNUsers(10);
    await prisma.user.createMany({ data: users });
    const user4 = await prisma.user.findFirst({ where: { name: 'user4' } });
    expect(user4.name).toEqual('user4');
  });
});

function createNUsers(n: number) {
  const users = [];
  for (let i = 0; i < n; i++) {
    users.push({
      name: `user${i}`,
      email: `user${i}@mail.com`,
      password: `password${i}`,
    });
  }
  return users;
}
