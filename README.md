# API 

Esta API permite que os usuários recuperem suas senhas através de um código de recuperação enviado por SMS.
Esta API faz atenticação


# Endpoints

## Usuarios

### 1. `GET /api/users`
#### Descrição
Retorna um json com lista de todos os usúarios vindo do banco de dados.

#### Requisição
- **URL:** `/api/users`
- **Método:** `GET`

### 2. `GET /api/user/:id`

#### Descrição
Retorna os dados de um usuário específico ( por ID )
#### Requisição
- **URL:** `/api/user/:id`
- **Método:** `GET`
  
### 3. `POST /api/signin`

#### Descrição
Faz o cadastro de um novo usuário no banco de dados
#### Requisição
- **URL:** `/api/signin`
- **Método:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  - `nome` (string, obrigatório)
  - `email` (string, email válido, obrigatório)
  - `senha` (string, obrigatório)
  - `telefone` (string, obrigatório): Número de telefone do usuário, incluindo o código do país.
  - `nascimento` (Data, obrigatório)

#### Exemplo de Requisição

```json
{
  "nome": "Usuario",
  "email": "teste@gmail.com",
  "senha": "12345678",
  "telefone": "5511999999999",
  "nascimento": "2003-02-04"
}
```

### 4. `POST /api/login`

#### Descrição
Faz a autenticação do usuário por (telefone, senha), e retorna os dados do mesmo.
#### Requisição
- **URL:** `/api/login`
- **Método:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  - `telefone` (string, obrigatório)
  - `senha` (Data, obrigatório)

#### Exemplo de Requisição

```json
{
  "telefone": "5511999999999",
  "senha": "12345678",
}
```

## Cupom
### 1. `GET /api/getAll`
#### Descrição
Retorna em json todos os cupons usados pelos usuarios.

#### Requisição
- **URL:** `/api/getAll`
- **Método:** `GET`

### 2. `GET /api/getcupons/:id`
#### Descrição
Retorna em json todos os cupons utilizados por um usuário específico.

#### Requisição
- **URL:** `/api/getcupons/:id`
- **Método:** `GET`

## Recuperação de senha
### 1. `GET /api/verifyRecoveryCode/:Code  `
#### Descrição
Verifica se o código de redefinir senha é válido e nunca foi utilizado.

#### Requisição
- **URL:** `/api/verifyRecoveryCode/:Code`
- **Método:** `GET`

### 2. `POST /api/requestRecoverypass`

#### Descrição
Faz uma requisição para criar um novo código de recuperação de senha, o código será enviado por SMS para o telefone do usuário.

#### Requisição
- **URL:** `/api/requestRecoverypass`
- **Método:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  - `telefone` (string, obrigatório)

#### Exemplo de Requisição

```json
{
  "telefone": "5511999999999",
}
```

### 3. `POST /api/recoverypass`

#### Descrição
Efetua a recuperação de senha, passando o código de recuperaçao e a nova senha. 

#### Requisição
- **URL:** `/api/recoverypass`
- **Método:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  - `codigo` (string, obrigatório)
  - `newPassword` (string, obrigatório)

#### Exemplo de Requisição

```json
{
		"codigo":"111222",
		"newPassword":"102030"
}

