

## Plano: Card de Detecção de Anomalias na página Robots

### O que será feito

Adicionar um novo card `AnomalyDetectionCard` na página `/robots` que identifica registros incomuns por estado usando o método estatístico IQR (Interquartile Range).

### Lógica

1. Para cada estado, contar registros por tipo de animal
2. Calcular Q1, Q3 e IQR da distribuição de contagens por tipo
3. Tipos com contagem abaixo de `Q1 - 1.5*IQR` ou acima de `Q3 + 1.5*IQR` são marcados como anomalias
4. Exibir uma tabela com: **Estado**, **Total de Registros**, **Anomalias encontradas** (tipo + contagem), e um indicador visual de severidade

### UI

- Ícone `AlertTriangle` no header do card
- Tabela com estados que possuem anomalias, mostrando:
  - UF e região
  - Total de registros no estado
  - Tipos incomuns detectados (badges) com suas contagens
  - Barra visual comparando registros normais vs anômalos
- Summary cards no topo: total de estados com anomalias, total de registros anômalos, % do total

### Arquivo editado

- `src/pages/Robots.tsx` — adicionar componente `AnomalyDetectionCard` e incluí-lo no layout após o card de similaridade

