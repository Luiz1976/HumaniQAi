---
description: Configuração e Personalização do Premium Sales Agent
---

# Guia de Configuração - Premium Sales Agent

O agente foi implementado com uma arquitetura "Mock-first" para garantir performance imediata e zero custo inicial. Abaixo estão os passos para conectar uma IA real quando desejado.

## 1. Localização do Arquivo
O componente principal está em:
`src/components/ia/PremiumSalesAgent.tsx`

## 2. Conectando com OpenAI / Anthropic
Para substituir a lógica simulada por uma IA real, localize a função `generateResponse` e substitua seu conteúdo:

```typescript
// Exemplo de integração futura
const generateResponse = async (input: string): Promise<string> => {
  // 1. Chame seu backend (Edge Function / Serverless)
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: input })
  });
  
  const data = await response.json();
  return data.reply;
};
```

## 3. Personalizando o "System Prompt"
Seu agente deve agir como um especialista em NR-01. No seu backend, use um prompt como:

> "Você é a Sophia, consultora sênior da HumaniQ AI. Sua missão é proteger empresas de passivos trabalhistas usando a NR-01. Seja empática, profissional e breve. Sempre tente levar o usuário para uma demonstração do software."

## 4. Estilização
O design usa Tailwind CSS e Framer Motion.
- **Cores**: Gradientes `from-indigo-600 to-violet-600`.
- **Efeitos**: Glassmorphism via `backdrop-blur-xl bg-white/80`.
