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
├── documentation/
│   ├── integration.mdx
│   ├── trigger.mdx
├── Authentication.mdx
└── schemas/
    ├── authentication.json
    ├── webhook.json
    ├── base.json          
    └── resources/
        ├── customers.json
        ├── products.json
        └── orders.json
```

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

## 📖 Index
<!-- INTEGRATIONS_INDEX:START -->
- [adobe_commerce](./adobe_commerce/)
- [aircall](./aircall/)
- [anthropic](./anthropic/)
- [asana](./asana/)
- [azure_devops](./azure_devops/)
- [betterstack](./betterstack/)
- [bigquery](./bigquery/)
- [bitly](./bitly/)
- [Boltic_AI](./Boltic_AI/)
- [Boltic_Crawler](./Boltic_Crawler/)
- [Boltic_Extract](./Boltic_Extract/)
- [Boltic_IDP](./Boltic_IDP/)
- [Boltic_SMS](./Boltic_SMS/)
- [catalog_cloud](./catalog_cloud/)
- [clickhouse](./clickhouse/)
- [copilot](./copilot/)
- [copilot_tool_definition](./copilot_tool_definition/)
- [facebook](./facebook/)
- [Firecrawl](./Firecrawl/)
- [freshchat](./freshchat/)
- [freshdesk](./freshdesk/)
- [freshsales](./freshsales/)
- [fynd_engage](./fynd_engage/)
- [fynd_platform](./fynd_platform/)
- [fynd_platform_application](./fynd_platform_application/)
- [fynd_tms](./fynd_tms/)
- [geckoboard](./geckoboard/)
- [gemini](./gemini/)
- [Google_Programmable_Search](./Google_Programmable_Search/)
- [google_translate](./google_translate/)
- [hubspot](./hubspot/)
- [hugging_face](./hugging_face/)
- [interakt](./interakt/)
- [Intercom](./Intercom/)
- [jenkins](./jenkins/)
- [jira](./jira/)
- [keka](./keka/)
- [Line](./Line/)
- [linkedin](./linkedin/)
- [mailchimp](./mailchimp/)
- [mailerlite](./mailerlite/)
- [mailmodo](./mailmodo/)
- [monday](./monday/)
- [mongodb](./mongodb/)
- [mssql](./mssql/)
- [mysql](./mysql/)
- [nanonets](./nanonets/)
- [notion](./notion/)
- [OpenAI](./OpenAI/)
- [OpenRouter](./OpenRouter/)
- [oracle](./oracle/)
- [paddle](./paddle/)
- [PayPal](./PayPal/)
- [PDF.co](./PDF.co/)
- [perplexity](./perplexity/)
- [pixelbin](./pixelbin/)
- [postgresql](./postgresql/)
- [posthog](./posthog/)
- [Redis](./Redis/)
- [shopify](./shopify/)
- [stripe](./stripe/)
- [telegram](./telegram/)
- [twilio](./twilio/)
- [typeform](./typeform/)
- [webflow](./webflow/)
- [WooCommerce](./WooCommerce/)
- [xai_grok](./xai_grok/)
- [zendesk](./zendesk/)
- [Zendesk_Talk](./Zendesk_Talk/)
- [Zoho_CRM](./Zoho_CRM/)
<!-- INTEGRATIONS_INDEX:END -->

## 🔒 Licensing

This structure and its contents are proprietary to Fynd. Unauthorized access, distribution, or reproduction is prohibited.
