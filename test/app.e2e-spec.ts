import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:postgres@localhost:5433/test_db',
});
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('create n users', async () => {
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
