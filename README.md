# 📦 Integrations

This repository contains structured folders for published integrations used within the Boltic Workflows.

Each integration encapsulates its metadata, configuration schemas, documentation, authentication mechanisms, and supported resources — organized in a predictable and introspectable format.

---

## 🧩 What are Integrations?

Integrations define how Boltic connects with external platforms such as Shopify, Salesforce, Zoho, etc. Each integration enables secure and configurable data exchange, API access, and automation workflows with third-party services.

---

## 🗂️ Folder Structure

Each integration has its own folder named after the service or platform it connects to.

### 🔍 Example Layout

```text
integration-name/
│
├── spec.json
├── Documentation.mdx
├── Authentication.mdx
└── schemas/
    ├── authentication.json
    ├── webhook.json
    ├── base.json          
    └── resources/
        ├── customers.json
        ├── products.json
        └── orders.json
````

---

## 📚 Glossary

| Term               | Description                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Integration**    | A logical unit defining how Fynd connects with a third-party service, including auth, config, APIs, and docs. |
| **Resource**       | A domain-specific object exposed by the integration (e.g., `products`, `orders`).                             |
| **Operation**      | An action (typically an API call) associated with a resource, like `GET /products` or `POST /orders`.         |
| **Schema**         | A JSON structure defining expected data shapes (inputs/outputs), used for validation and documentation.       |
| **Authentication** | The mechanism used to connect securely to a third-party platform (e.g., OAuth2, API keys).                    |
| **Webhook**        | A way for external systems to notify Fynd of events (e.g., "order created").                                  |

---

## 🏷️ Examples

* `shopify/` → Integration for Shopify's commerce platform
* `salesforce/` → Integration for Salesforce CRM
* `mailchimp/` → Integration for Mailchimp marketing automation

---

## 🔒 Licensing

This structure and its contents are proprietary to Fynd. Unauthorized access, distribution, or reproduction is prohibited.
