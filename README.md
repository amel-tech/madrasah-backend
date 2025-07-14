# madrasah-backend

Online Medrese Projesinin backend reposudur.

## Tech Stack

Nest.js
PostgreSQL
RabbitMQ
Drizzle? (ORM)

## Project Bootstrap Requirements

- Should be able to run in a continer & docker-compose support
- Should include working example codes for interacting other technologies listed above
- Testing setup with Jest
- Configurations and helper tooling should be complete
- Base configuration & .env
- This README should be edited properly

## Example Folder Structure

```
.
├── apps/                    # Her bağımsız proje (örneğin servis) buraya eklenir
│   └── api/                 # Başlangıç projesi (Nest.js backend)
│       ├── src/
│       └── ...
│
├── shared/                  # Tüm projeler tarafından paylaşılan ortak kodlar
│   ├── config/              # Ortak konfigürasyonlar (.env schema, Nest config modules vs.)
│   ├── dto/                 # Ortak DTO’lar
│   ├── types/               # Ortak TypeScript tipleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── rabbitmq/            # Queue konfigürasyonu ve event tanımları
│   └── ...
│
├── .env                     # Ortak .env (her proje kendi .env’ini override edebilir)
├── docker-compose.yml       # Tüm ortamı ayağa kaldırmak için
├── turbo.json               # Turborepo yapılandırması
├── package.json             # Ortak bağımlılıklar (monorepo root)
└── tsconfig.base.json       # Ortak TypeScript yapılandırması
```
