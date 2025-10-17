const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

require("dotenv").config();


async function main() {

  const VORTEX_MAIN_URL =
    "https://asia-south1.api.boltic.io/service/panel/temporal";
  const INTEGRATIONS_URL = `${VORTEX_MAIN_URL}/integrations`;
  const AUTHENTICATION_URL = `${VORTEX_MAIN_URL}/integrations/{integration_id}/authentication`;
  const WEBHOOK_URL = `${VORTEX_MAIN_URL}/integrations/{integration_id}/webhook`;
  const CONFIGURATION_URL = `${VORTEX_MAIN_URL}/integrations/{integration_id}/configuration`;
  const RESOURCE_URL = `${VORTEX_MAIN_URL}/integrations/{integration_id}/resource`;
  const OPERATION_URL = `${VORTEX_MAIN_URL}/integrations/{integration_id}/resource/{resource_id}/operation`;

  const PARAMS = {
    page: 1,
    per_page: 999,
    status: "published",
  };

  const headers = {
    "Content-Type": "application/json",
    "x-boltic-token": process.env.BOLTIC_TOKEN,
  };

  const response = await axios.get(INTEGRATIONS_URL, { params: PARAMS, headers });
  const integrations = response.data.data;

  for (const integration of integrations) {
    // Only process the integrations that have activity_type as 'customActivity', 'CloudDatabase', 'platformFdkActivity', 'applicationFdkActivity' or trigger_type as 'CloudTrigger'. Ignore the others.
    if (
      integration.activity_type !== "customActivity" &&
      integration.activity_type !== "CloudDatabase" &&
      integration.activity_type !== "platformFdkActivity" &&
      integration.activity_type !== "applicationFdkActivity" &&
      integration.trigger_type !== "CloudTrigger"
    ) {
      continue;
    }

    console.log(`Processing integration: ${integration.name}`);

    const integrationFolder = path.join(process.cwd(), integration.name);
    await fs.ensureDir(integrationFolder);

    // Write spec.json

    const spec = {
      name: integration.name,
      slug: integration.slug,
      description: integration.description,
      icon: integration.icon,
      activity_type: integration.activity_type,
      trigger_type: integration.trigger_type,
      documentation: integration.documentation,
      meta: integration.meta,
    };

    await fs.writeJson(path.join(integrationFolder, "spec.json"), spec, {
      spaces: 4,
    });

    const documentations = path.join(integrationFolder, "documentation");
    await fs.ensureDir(documentations);

    // Write Documentation.mdx
    if (integration.activity_type) {
      await fs.writeFile(
        path.join(documentations, "integration.mdx"),
        integration.documentation || ""
      );
    }

    if (integration.trigger_type === "CloudTrigger") {
      await fs.writeFile(
        path.join(documentations, "trigger.mdx"),
        integration.documentation || ""
      );
    }

    const schemasFolder = path.join(integrationFolder, "schemas");
    await fs.ensureDir(schemasFolder);


    const authentication = await axios.get(AUTHENTICATION_URL.replace("{integration_id}", integration.id), { headers });
    if (authentication.data.data) {
      await fs.writeJson(
        path.join(schemasFolder, "authentication.json"),
        authentication.data.data,
        { spaces: 4 }
      );
      await fs.writeFile(
        path.join(integrationFolder, "Authentication.mdx"),
        JSON.stringify(authentication.data.data, null, 4)
      );
    }
    // Webhooks
    const webhook = await axios.get(WEBHOOK_URL.replace("{integration_id}", integration.id), { headers });

    if (webhook.data.data) {
      await fs.writeJson(
        path.join(schemasFolder, "panel.json"),
        panel.rows[0].content,
        { spaces: 4 }
      );
    }

    // Configurations (base.json)
    const config = await axios.get(CONFIGURATION_URL.replace("{integration_id}", integration.id), { headers });

    if (config.data.data) {
      await fs.writeJson(
        path.join(schemasFolder, "base.json"),
        config.data.data,
        { spaces: 4 }
      );
    }

    // Resources + Operations merged
    const resources = await axios.get(RESOURCE_URL.replace("{integration_id}", integration.id), { headers });

    if (resources.data.data) {
      const resourcesFolder = path.join(schemasFolder, "resources");
      await fs.ensureDir(resourcesFolder);

      for (const resource of resources.rows) {
        const operations = await axios.get(OPERATION_URL.replace("{integration_id}", integration.id).replace("{resource_id}", resource.id), { headers });

        let merged = { ...resource.content };

        for (const op of operations.rows) {
          if (op.content && typeof op.content === "object") {
            merged = { ...merged, ...op.content }; // Flat merge
          }
        }

        const resourceFile = path.join(
          resourcesFolder,
          `${resource.name}.json`
        );
        await fs.writeJson(resourceFile, merged, { spaces: 4 });
      }
    }
  }

  await client.end();
  console.log("✅ Integration folders generated in current directory.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
