Refatoração do Hook useTasks

1. Problemas identificados
- createTask e updateTask repetiam validação, estado de loading/submitting e tratamento de erro.
- fetchTasks, createTask, updateTask, toggleTask e deleteTask faziam chamadas fetch com lógica muito parecida.
- As funções internas do hook eram recriadas a cada render, o que pode causar renderizações desnecessárias em componentes filhos.
- Após escrita, a lista era recarregada com fetchTasks(), o que aumenta latência e trafega mais rede do que o necessário.
- A separação entre API e estado estava pouco explícita, porque o hook fazia chamadas fetch direto.

2. O que foi feito
- Extraí a validação de título em uma função reutilizável.
- Centralizei a comunicação com a API em src/services/taskApi.ts, com uma função genérica de requisição e tratamento de erro.
- Transformei as funções do hook em useCallback, usando uma referência para o estado mais recente (tasksRef) para evitar dependências desnecessárias e recriações em cada render.
- Implementei atualização otimista: criar, editar, alternar e remover tarefas agora alteram o estado local imediatamente e só então confirmam com a API.
- Mantive a lógica de estado no hook e movi a comunicação com a API para o serviço, o que preserva a responsabilidade do hook sem misturar camadas.

3. Por que esta solução é melhor
- Menor repetição de código e manutenção mais fácil.
- Erros tratados de forma centralizada e mais consistente.
- Menor custo de renderização graças ao useCallback e ao uso de refs.
- Melhor experiência do usuário, porque a interface responde imediatamente.
- Arquitetura mais clara: o hook cuida da UI/estado, o serviço cuida da comunicação com a API.
