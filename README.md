Refatoração do Hook useTasks

1. Problemas identificados
- createTask e updateTask repetiam a validação, estado de loading/submitting e tratamento de erro.
- fetchTasks, createTask, updateTask, toggleTask e deleteTask faziam chamadas fetch com logica muito parecida.
- as funções internas do hook eram recriadas a cada render, o q pode causar renderizações desnecessárias em componentes filhos.
- apos escrita, a lista era recarregada com fetchTasks(), o que aumenta latencia e trafega mais rede do que o necessario.
- a separação entre API e estado estava pouco explicita, porque o hook fazia chamadas fetch direto.

2. O que foi feito
- extraí a validação de título em uma função reutilizável.
- centralizei a comunicação com a API em src/services/taskApi.ts, com uma função genérica de requisição e tratamento de erro.
- alterei as funções do hook em useCallback, usando uma referência para o estado mais recente (tasksRef) para evitar dependencias desnecessárias e recriações em cada render.
- implementei atualização otimista: criar, editar, alternar e remover tarefas agora alteram o estado local imediatamente e so então confirmam com a API.
- mantive a logica de estado no hook e movi a comunicação com a API para o serviço, o que preserva a responsabilidade do hook sem misturar camadas.

3. Por que esta solução é melhor
- menor repetição de código e manutenção mais facil.
- erros tratados de forma centralizada e mais consistente.
- menor custo de renderização graças ao useCallback e ao uso de refs.
- melhor experiência do usuário, porque a interface responde imediatamente.
- arquitetura mais clara: o hook cuida da UI/estado, o serviço cuida da comunicação com a API.
