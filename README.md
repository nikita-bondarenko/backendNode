

## Installation

- Install dependencies
```bash
npm install
```

- Create PostgreSQL in docker by docker-compose ( port: 5433)

```bash
docker-compose up -d
```

- Initialize migrations

```bash
npx prisma migrate dev
```

- Run e2e testing

```bash
npm run test
```

- Start Application
```bash
npm run start
```

The application will be launched by [Nodemon](https://nodemon.com) so it's will restart automatically on file change
