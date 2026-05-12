# Plano de Implantação MES CNC Control

Este documento detalha a estratégia de desenvolvimento escalável e econômica para o sistema MES CNC.

## 1. Roadmap de Desenvolvimento (MVP)

### Fase 1: Núcleo Operacional (Atual)
*   **Foco**: Cronômetro operacional, Fila de OS, Biblioteca Técnica Básica.
*   **Objetivo**: Permitir que o operador aponte o tempo de cada trabalho e consulte parâmetros de corte sem sair da máquina.
*   **Créditos**: Economia máxima ao focar em componentes reutilizáveis (`OSCard`, `TechLibraryCard`).

### Fase 2: Gestão de Materiais e Perdas
*   **Foco**: Registro real de saída de chapa, Gestão de "Sobras" (Nesting manual), Relatório simples de produtividade por operador.
*   **Objetivo**: Reduzir o desperdício de material na fábrica.

### Fase 3: Planejamento (PCP) e Cronograma
*   **Foco**: Gráfico de Gantt simplificado (Timeline), Agenda de máquinas, Alocação de recursos.
*   **Objetivo**: Prever prazos de entrega reais com base na carga atual das máquinas.

## 2. Estratégia Econômica (Economia de Créditos)

1.  **Modularidade Extrema**: Criar componentes pequenos que não mudam (`StatusBadge`, `ParamItem`). Alterar o `App.tsx` apenas para roteamento de abas.
2.  **Mock Data Inteligente**: Desenvolver toda a UI com dados falsos bem estruturados (como o `MOCK_MATERIALS` atual) antes de tentar conectar ao backend. Isso evita regeneração de código para tratar erros de API.
3.  **Evitar Design Exagerado**: Usar o sistema `Shadcn` (ou Tailwind puro como fizemos aqui) garante consistência visual sem precisar de dezenas de iterações de CSS.
4.  **Backend "Lazy"**: Não implementar auth ou Row Level Security (RLS) complexos até que a lógica de negócio esteja 100% validada visualmente.

## 3. Arquitetura de Software

*   **Frontend**: React + Tailwind + Lucide React para ícones leves.
*   **Estado**: `useState` Nativo para o MVP. Evoluir para `Zustand` se a complexidade de OS aumentar demais.
*   **Banco**: PostgreSQL (Supabase) via `supabase-js`.
*   **Integração**: Priorizar `onSnapshot` (Realtime) para o cronômetro do operador para que o gerente veja o dashboard atualizar sozinho na sala dele.

## 4. Regras de Negócio Críticas
1.  **Trava de OS**: Um operador só pode ter 1 cronômetro rodando por vez.
2.  **Validação Técnica**: Ao selecionar um material com "Veio Obrigatório", o sistema deve emitir um aviso no Modo Operador.
3.  **Registro de Parada**: Toda pausa > 5 min deve exigir um motivo (Setup, Ajuste, Manutenção, Problema).

## 5. Próximos Passos Sugeridos
1.  Conectar o `work_orders` ao Supabase.
2.  Criar o formulário de "Nova OS".
3.  Implementar o "Registro de Retalho" no estoque após finalizar uma OS.
pk_
