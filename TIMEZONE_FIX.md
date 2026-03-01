# Correção do Problema de Timezone

## Problema Identificado

O projeto tinha um problema clássico de timezone ao lidar com campos de data (`@db.Date`) do PostgreSQL:

1. **Salvamento**: O formulário salvava a data corretamente como "dia 2"
2. **Armazenamento**: O PostgreSQL armazenava corretamente como "2026-03-02"
3. **Recuperação**: PostgreSQL retornava `"2026-03-02"` como string
4. **Bug**: Ao fazer `new Date("2026-03-02")`, JavaScript interpreta como **UTC midnight** (`2026-03-02T00:00:00Z`)
5. **Exibição**: Em timezone GMT-3, isso se torna `2026-03-01T21:00:00-03:00` = **dia 1**!

## Solução Implementada

### 1. Funções Utilitárias (`lib/utils.ts`)

Criadas duas funções helper para lidar corretamente com datas:

```typescript
/**
 * Converte uma string de data (YYYY-MM-DD) ou Date do PostgreSQL 
 * para uma Date local sem problemas de timezone
 */
export function parseDateAsLocal(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate()
    );
  }
  
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma Date para string "YYYY-MM-DD"
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### 2. Arquivos Atualizados

#### `server/actions/charts.action.ts`
- Importou `formatDateKey` e `parseDateAsLocal` de `@/lib/utils`
- Removeu função `formatDateKey` local (duplicada)
- Substituiu `agg.study_date.toDateString()` por `formatDateKey(parseDateAsLocal(agg.study_date))`

#### `app/historico/components/LogsHistory.tsx`
- Importou `parseDateAsLocal` de `@/lib/utils`
- Substituiu `new Date(log.study_date)` por `parseDateAsLocal(log.study_date)`
- Substituiu `new Date(dateKey)` por `parseDateAsLocal(dateKey)`
- Substituiu `new Date(logDetails.study_date)` por `parseDateAsLocal(logDetails.study_date)`

#### `app/nova-sessao/components/SidebarLogs.tsx`
- Importou `parseDateAsLocal` de `@/lib/utils`
- Criou `const localDate = parseDateAsLocal(date)` dentro do componente
- Substituiu `new Date(date)` por `localDate`

#### `app/nova-sessao/components/StudySessionForm.tsx`
- Mudou a criação da data do input de:
  ```tsx
  const d = new Date(e.target.value + "T00:00:00");
  ```
  Para:
  ```tsx
  const [year, month, day] = e.target.value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  ```

## Como Usar

### Ao Exibir Datas do Banco

Sempre use `parseDateAsLocal()` ao trabalhar com `study_date`:

```tsx
// ❌ ERRADO
const dateLabel = format(new Date(log.study_date), "dd/MM/yyyy");

// ✅ CORRETO
const dateLabel = format(parseDateAsLocal(log.study_date), "dd/MM/yyyy");
```

### Ao Criar Datas Locais

Para criar datas sem componente de hora (apenas dia/mês/ano):

```tsx
// ❌ EVITAR (pode ter problemas dependendo do formato)
const date = new Date("2026-03-02");

// ✅ CORRETO
const [year, month, day] = "2026-03-02".split('-').map(Number);
const date = new Date(year, month - 1, day);

// OU usar a função helper
const date = parseDateAsLocal("2026-03-02");
```

### Ao Formatar Datas para String

```tsx
// ✅ CORRETO
const dateKey = formatDateKey(date); // "2026-03-02"
```

## Resultado

Agora todas as datas são tratadas consistentemente como datas locais, sem conversões incorretas de timezone. Se o usuário seleciona "dia 2", o sistema mostra "dia 2" em todos os lugares.
