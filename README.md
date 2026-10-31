# SAAR PRF

Sistema de Análise de Acidentes Rodoviários desenvolvido para a disciplina de **Programação Avançada Orientada a Objetos**.

O projeto utiliza dados abertos da **Polícia Rodoviária Federal (PRF)** para importar, armazenar, consultar, filtrar e analisar ocorrências de acidentes em rodovias federais.

## Objetivo

O SAAR PRF foi desenvolvido para facilitar a organização e a análise dos dados de acidentes disponibilizados pela PRF.

A aplicação permite:

- listar acidentes cadastrados;
- buscar acidentes por ID;
- cadastrar registros;
- editar registros;
- excluir registros;
- filtrar por UF e rodovia;
- importar dados de arquivo CSV;
- identificar registros inválidos e duplicados;
- visualizar os registros em uma tabela;
- acompanhar o total de acidentes;
- visualizar um gráfico de acidentes por UF.

## Fonte dos dados

Os dados utilizados são provenientes do Portal de Dados Abertos da Polícia Rodoviária Federal.

**Conjunto utilizado:** Documento CSV de Acidentes 2025, agrupados por ocorrência.

**Arquivo original:** `datatran2025.csv`

**Formato:** CSV

**Separador:** ponto e vírgula (`;`)

**Codificação utilizada na leitura:** ISO-8859-1

Portal oficial:

https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf

Para os testes de importação foi utilizada uma amostra programática com 500 registros da base oficial.

## Tecnologias utilizadas

### Back-end

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Jakarta Validation
- Apache Commons CSV
- Maven

### Banco de dados

- PostgreSQL
- Neon

### Front-end

- HTML
- CSS
- JavaScript
- Fetch API
- Chart.js

### Versionamento e testes

- Git
- GitHub
- Insomnia

## Arquitetura

A aplicação foi organizada em camadas:

- **Model:** representa a entidade `Acidente` e seu mapeamento JPA.
- **Repository:** realiza persistência e consultas com Spring Data JPA.
- **Service:** concentra regras de negócio, validações, filtros e importação do CSV.
- **Controller:** disponibiliza os endpoints REST e os códigos de resposta HTTP.
- **View:** interface HTML, CSS e JavaScript localizada em `src/main/resources/static`.
- **Banco de dados:** PostgreSQL hospedado no Neon.

Fluxo principal:

```text
Interface Web
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL / Neon
```

## Entidade Acidente

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Long | Identificador interno gerado automaticamente |
| `idPrf` | Long | Identificador original da ocorrência na PRF |
| `dataOcorrencia` | LocalDate | Data da ocorrência |
| `horario` | LocalTime | Horário da ocorrência |
| `uf` | String | Unidade Federativa |
| `municipio` | String | Município da ocorrência |
| `rodovia` | String | Rodovia federal |
| `quilometro` | BigDecimal | Quilômetro da ocorrência |
| `causaAcidente` | String | Causa registrada para o acidente |
| `classificacao` | String | Classificação da ocorrência |

O campo `idPrf` é utilizado também para controle de duplicidades durante a importação.

## API REST

O prefixo da API é:

```text
/api/acidentes
```

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/acidentes` | Listar todos os acidentes |
| GET | `/api/acidentes/{id}` | Buscar acidente por ID |
| POST | `/api/acidentes` | Cadastrar acidente |
| PUT | `/api/acidentes/{id}` | Atualizar acidente |
| DELETE | `/api/acidentes/{id}` | Excluir acidente |
| GET | `/api/acidentes/filtro` | Filtrar por UF e/ou rodovia |
| POST | `/api/acidentes/importar` | Importar arquivo CSV |

### Exemplos de filtro

```text
GET /api/acidentes/filtro?uf=SP
GET /api/acidentes/filtro?rodovia=116
GET /api/acidentes/filtro?uf=SP&rodovia=116
```

## Importação CSV

A importação é realizada por:

```text
POST /api/acidentes/importar
```

A requisição deve ser enviada como `multipart/form-data`, utilizando o campo:

```text
arquivo
```

Durante o processamento, o sistema:

1. verifica se o arquivo é CSV;
2. valida as colunas obrigatórias;
3. lê os dados usando ponto e vírgula como separador;
4. converte data, horário e quilômetro;
5. padroniza campos textuais;
6. valida os registros;
7. identifica duplicidades pelo `idPrf`;
8. persiste os registros válidos.

A resposta informa:

- linhas lidas;
- registros importados;
- registros rejeitados;
- registros duplicados;
- mensagem de resultado.

## Configuração do banco de dados

A aplicação utiliza variáveis de ambiente para a conexão com o Neon.

As variáveis necessárias são:

```text
DB_URL
DB_USER
DB_PASSWORD
```

O arquivo `.env.example` contém apenas exemplos e não deve possuir credenciais reais.

Exemplo:

```text
DB_URL=jdbc:postgresql://SEU_HOST/neondb?sslmode=require
DB_USER=SEU_USUARIO
DB_PASSWORD=SUA_SENHA
```

O `application.properties` utiliza essas variáveis da seguinte forma:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

> Nunca publique credenciais reais do banco no GitHub.

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/ketlinvgp1/SAAR_PRF.git
```

### 2. Entrar na pasta

```bash
cd SAAR_PRF
```

### 3. Configurar as variáveis de ambiente

Configure:

```text
DB_URL
DB_USER
DB_PASSWORD
```

No IntelliJ IDEA, essas variáveis podem ser configuradas em:

```text
Run > Edit Configurations > Environment variables
```

### 4. Executar a aplicação

Execute a classe:

```text
SaarPrfApplication
```

Também é possível utilizar o Maven Wrapper.

**Windows**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux/macOS**

```bash
./mvnw spring-boot:run
```

### 5. Acessar a interface

```text
http://localhost:8080/
```

### 6. Acessar diretamente a API

```text
http://localhost:8080/api/acidentes
```

## Interface Web

A interface permite:

- consultar o total de acidentes;
- buscar registro por ID;
- filtrar por UF e rodovia;
- cadastrar acidentes;
- editar acidentes;
- excluir acidentes;
- importar arquivo CSV;
- visualizar o resultado da importação;
- visualizar os acidentes em tabela;
- visualizar gráfico de acidentes por UF.

Para evitar excesso de elementos renderizados no navegador, a tabela exibe no máximo 500 registros por vez.

## Testes realizados

Foram realizados testes de:

- listagem de registros;
- busca por ID existente;
- busca por ID inexistente;
- cadastro;
- atualização;
- exclusão;
- validação de campos obrigatórios;
- identificação de `idPrf` duplicado;
- filtro por UF;
- filtro por rodovia;
- importação de CSV válido;
- importação repetida;
- rejeição de registros inválidos;
- integração entre front-end, API e banco PostgreSQL.

Na amostra de testes com 500 registros válidos da PRF, os registros foram lidos e importados com sucesso.

## Estrutura principal do projeto

```text
src/
└── main/
    ├── java/
    │   └── br/com/saarprf/saarprf/
    │       ├── controller/
    │       ├── dto/
    │       ├── model/
    │       ├── repository/
    │       ├── service/
    │       └── SaarPrfApplication.java
    │
    └── resources/
        ├── static/
        │   ├── css/
        │   │   └── style.css
        │   ├── js/
        │   │   └── app.js
        │   └── index.html
        │
        └── application.properties
```

## Integrantes

- **Ketlin Vitoria Gomes Pereira**
- **Thiago Luiz Dutra de Lima**

## Disciplina

**Programação Avançada Orientada a Objetos**

Curso de Análise e Desenvolvimento de Sistemas.

## Observação

Este projeto possui finalidade acadêmica e utiliza dados públicos disponibilizados pela Polícia Rodoviária Federal.
