# 📋 PropostasPro — Sistema de Propostas Comerciais

Sistema completo de gestão de propostas com login por vendedor, envio de e-mail (Gmail ou SendGrid) e relatórios mensais.

---

## 🚀 Instalação em 5 passos

### 1. Pré-requisitos
- [Node.js 18+](https://nodejs.org/) instalado
- Conta Gmail ou SendGrid para envio de e-mail

### 2. Instalar dependências
```bash
cd propostas-pro
npm install
```

### 3. Configurar variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com seus dados
nano .env   # ou use qualquer editor de texto
```

**Configurar Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie uma "Senha de App" para o sistema
3. Coloque em `GMAIL_USER` e `GMAIL_PASS` no `.env`

**Configurar SendGrid:**
1. Acesse: https://app.sendgrid.com/settings/api_keys
2. Crie uma API Key com permissão "Mail Send"
3. Coloque em `SENDGRID_API_KEY` e `SENDGRID_FROM`
4. Troque `EMAIL_PROVIDER=gmail` para `EMAIL_PROVIDER=sendgrid`

### 4. Inicializar banco de dados
```bash
npm run setup
```
Isso cria o banco SQLite e um usuário admin padrão.

### 5. Iniciar o servidor
```bash
npm start
```

Acesse: **http://localhost:3000**

---

## 🔑 Credenciais padrão

| Usuário | E-mail | Senha |
|---------|--------|-------|
| Administrador | admin@empresa.com | admin123 |
| Carlos Mendes | carlos@empresa.com | senha123 |
| Ana Beatriz | ana@empresa.com | senha123 |
| Rafael Lima | rafael@empresa.com | senha123 |
| Juliana Costa | juliana@empresa.com | senha123 |

> ⚠️ **Altere as senhas após o primeiro login!**

---

## 🎯 Funcionalidades

### Para Vendedores
- ✅ Login individual com sessão segura
- ✅ Criar propostas com itens, quantidades e preços
- ✅ Enviar proposta por e-mail ao cliente (com 1 clique)
- ✅ Baixar proposta em PDF profissional
- ✅ Ver apenas as próprias propostas
- ✅ Relatório do próprio desempenho mensal

### Para o Administrador
- ✅ Visualizar propostas de todos os vendedores
- ✅ Gerenciar cadastro de vendedores (criar, editar, desativar)
- ✅ Definir meta mensal por vendedor
- ✅ Ranking e relatórios com todos os vendedores
- ✅ Filtrar por vendedor, status ou período

### E-mail enviado ao cliente contém:
- Logo e nome da empresa
- Tabela detalhada com itens e valores
- Valor total em destaque
- Validade da proposta
- Dados do vendedor responsável
- Observações/condições comerciais

---

## 📁 Estrutura do projeto

```
propostas-pro/
├── src/
│   ├── server.js           # Servidor Express
│   ├── database.js         # SQLite (configuração e schema)
│   ├── setup.js            # Script de inicialização
│   ├── routes/
│   │   ├── auth.js         # Login / Logout / Troca de senha
│   │   ├── proposals.js    # CRUD de propostas + envio de e-mail + PDF
│   │   ├── sellers.js      # Gestão de vendedores
│   │   └── reports.js      # Relatórios mensais
│   ├── middleware/
│   │   └── auth.js         # Proteção de rotas
│   └── utils/
│       ├── mailer.js       # Envio de e-mail (Gmail/SendGrid)
│       └── pdfGenerator.js # Geração de PDF com PDFKit
├── public/
│   ├── index.html          # SPA principal (dashboard, propostas, vendedores, relatórios)
│   └── login.html          # Tela de login
├── data/                   # Banco SQLite (criado automaticamente)
├── .env.example            # Template de configuração
├── .env                    # Suas configurações (não commitar!)
└── package.json
```

---

## 🌐 API REST

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/auth/logout` | Fazer logout |
| GET | `/api/auth/me` | Usuário logado |
| GET | `/api/proposals` | Listar propostas |
| POST | `/api/proposals` | Criar proposta |
| GET | `/api/proposals/:id` | Ver proposta |
| PATCH | `/api/proposals/:id/status` | Atualizar status |
| POST | `/api/proposals/:id/send` | Enviar/reenviar e-mail |
| GET | `/api/proposals/:id/pdf` | Baixar PDF |
| GET | `/api/sellers` | Listar vendedores |
| POST | `/api/sellers` | Criar vendedor (admin) |
| PUT | `/api/sellers/:id` | Editar vendedor (admin) |
| GET | `/api/reports/monthly` | Relatório mensal |

---

## 🔧 Desenvolvimento

```bash
# Modo desenvolvimento com reload automático
npm run dev
```

---

## 🔒 Segurança
- Senhas com bcrypt (salt 10)
- Sessões com cookie HTTPOnly
- Vendedores isolados (só veem as próprias propostas)
- Rotas admin protegidas por middleware

---

Feito com ❤️ usando Node.js, Express, SQLite, Nodemailer e PDFKit.
