# 🗄️ Guia: Banco de Testes - Qual Abordagem Usar?

### Desenvolver com teste
npm run dev:test

### desenvolver com produção
npm run dev

---


### 2️⃣ **Docker Manual (docker run)**

```powershell
# Subir banco
docker run -d \
  --name pg-test \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass123 \
  -e POSTGRES_DB=monitor_estudos_test \
  -p 5433:5432 \
  postgres:16-alpine

# Ver logs
docker logs pg-test

# Parar
docker stop pg-test

# Deletar
docker rm pg-test
```


### 3️⃣ **Docker + NPM Scripts** ✅ **← USE ESTA**

```powershell
# Subir banco
npm run test:db:up

# Migração
npm run test:migrate

# Abrir Prisma Studio http://localhost:51212/
npm run test:studio
# Resetar (limpa tudo)
npm run test:db:reset

# Ver logs
npm run test:db:logs

# Descer
npm run test:db:down
```

---

## 🎯 Guia Rápido: Qual Usar Quando?

### Cenário: "Quero testar novo campo no schema"
```powershell
# USE ISTO ✅
npm run test:db:up          # Inicia banco teste
npm run test:migrate        # Aplica schema
npm run test:studio         # Vê dados
npm run test:db:reset       # Limpa tudo ao final
```

### Cenário: "Quero ver SQL sendo executado"
```powershell
# USE pgAdmin para DEBUG
docker run -d \
  --name pgadmin \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4

# Browser: http://localhost:5050
```


---

## 🐳 Portas: Qual Usar?

| Banco | Porta | Ambiente | URL |
|------|-------|----------|-----|
| Produção (cloud) | 5432 | `.env` | `db.prisma.io:5432` |
| Testes (Docker) | **5433** | `.env.test` | `localhost:5433` |
| Extra (se quiser) | 5434 | `.env.dev` | `localhost:5434` |
| pgAdmin web | 5050 | Browser | `localhost:5050` |

> ℹ️ **Porta 51212** que você mencionou não é padrão Postgres. Pode usar, é só mudar `5433` para `51212` no `docker-compose.test.yml`.


---

## 📋 Checklist: Primeiros 5 Minutos

- [ ] `npm run test:db:up` — Sobe Postgres local
- [ ] Espera ~10s, verifica `docker ps`
- [ ] `npm run test:migrate` — Cria tabelas
- [ ] `npm run test:studio` — Abre Prisma Studio
- [ ] Testa inserindo/editando dados manualmente
- [ ] `npm run test:db:down` — Para container

---

