# Estrutura de case para portfólio de Product Design

Case sobre o dashboard de registros de fauna (Registros, Colaboradores, Insights, Robots).

## Estrutura recomendada (ordem das seções)

1. **Capa / Hero** — título curto + subtítulo de uma linha ("Plataforma de análise de dados de biodiversidade colaborativa"), seu papel, período, ferramentas. Um print do dashboard principal.
2. **Contexto e problema (curto)** — quem produz os dados (20.993 colaboradores + 193 especialistas), o que existia antes (planilha/CSV bruto) e a dor: os dados existiam mas não geravam decisão.
3. **Objetivo e perguntas de negócio** — liste as perguntas que o produto responde: onde há mais registros? quem contribui de forma consistente? onde faltam coletas? o que é um registro fora do padrão?
4. **Processo** — como você foi do CSV às perguntas: exploração dos dados, definição de métricas, arquitetura de informação em 4 páginas, iteração com base em feedback.
5. **Arquitetura de informação** — por que 4 áreas separadas (visão operacional → pessoas → correlações → modelos preditivos), diagrama simples do menu.
6. **Decisões de design (o coração do case)** — 3 a 5 decisões com antes/depois:
   - tabela com largura fixa de colunas e filtros por valor (multi-seleção) em vez de ordenação em toda coluna;
   - troca do card "total de registros" por distribuição por estado agrupada por região;
   - tooltips de informação explicando o cálculo de cada card (transparência estatística);
   - anomalias limitadas ao limite inferior (raridade), não a picos;
   - menu responsivo em mobile.
7. **Comunicação de dados complexos** — como você tornou legíveis métodos como IQR, similaridade cosseno, regressão linear e funil DAU/MAU: linguagem simples, badges, barras comparativas, aviso de modelo simplificado.
8. **Resultados e aprendizados** — o que mudou na tomada de decisão, limitações assumidas, próximos passos (filtros temporais, exportação, modelos mais robustos).

## Onde colocar maior foco

- **Peso alto (60% do case):** decisões de design justificadas por dados e a tradução de estatística em interface compreensível. É o que diferencia um designer de produto de um "montador de telas".
- **Peso médio (25%):** arquitetura de informação e o raciocínio de dividir operação, pessoas, correlações e previsões.
- **Peso baixo (15%):** contexto e ferramentas. Evite alongar em processo genérico (personas, double diamond) sem evidência.

## Pontos a evitar

- Mostrar todos os cards; escolha 4 ou 5 mais representativos.
- Apresentar previsões e anomalias como verdade absoluta — assuma as limitações, isso conta como maturidade.
- Falar de tecnologia antes de falar do problema.

## Ativos visuais a preparar

- 1 print de cada página (Registros, Colaboradores, Insights, Robots).
- 1 close do tooltip explicativo.
- 1 close da tabela com filtro multi-seleção aberto.
- 1 diagrama simples: CSV → métricas → cards → decisão.

## Observação

Este plano é de conteúdo de portfólio, não de código. Se quiser, o próximo passo pode ser gerar uma página de case dentro do próprio app ou um texto pronto para Behance/Notion.
