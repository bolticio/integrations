const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

async function main() {
  const API_BASE = process.env.BOLTIC_API_BASE;
  const INTEGRATIONS_URL = `${API_BASE}/integrations`;
  const AUTHENTICATION_URL = `${API_BASE}/integrations/{integration_id}/authentication`;
  const WEBHOOK_URL = `${API_BASE}/integrations/{integration_id}/webhook`;
  const CONFIGURATION_URL = `${API_BASE}/integrations/{integration_id}/configuration`;
  const RESOURCE_URL = `${API_BASE}/integrations/{integration_id}/resource`;
  const OPERATION_URL = `${API_BASE}/integrations/{integration_id}/resource/{resource_id}/operation`;

  const PARAMS = {
    page: 1,
    per_page: 999,
    status: "published",
  };

  const token = process.env.BOLTIC_TOKEN;
  if (!token) {
    throw new Error("BOLTIC_TOKEN is missing");
  }
  const headers = {
    "Content-Type": "application/json",
    "x-boltic-token": token,
  };

  let response;
  try {
    response = await axios.get(INTEGRATIONS_URL, { params: PARAMS, headers });
  } catch (err) {
    const status = err.response?.status;
    const body = JSON.stringify(err.response?.data || {}, null, 2);
    throw new Error(
      `Failed to fetch integrations (${status}) from ${INTEGRATIONS_URL}: ${body}`
    );
  }
  const integrations = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data)
    ? response.data
    : [];

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

    let authentication = null;
    try {
      authentication = await axios.get(
        AUTHENTICATION_URL.replace("{integration_id}", integration.id),
        { headers }
      );
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.warn(`Authentication not found for ${integration.name} (${integration.id}) - skipping`);
      } else {
        throw e;
      }
    }

    if (authentication?.data?.data) {
      await fs.writeJson(
        path.join(schemasFolder, "authentication.json"),
        authentication.data.data.content,
        { spaces: 4 }
      );
      await fs.writeFile(
        path.join(integrationFolder, "Authentication.mdx"),
        JSON.stringify(authentication.data.data.content.documentation, null, 4)
      );
    }
    // Webhooks
    let webhook = null;
    try {
      webhook = await axios.get(
        WEBHOOK_URL.replace("{integration_id}", integration.id),
        { headers }
      );
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.warn(`Webhook not found for ${integration.name} (${integration.id}) - skipping`);
      } else {
        throw e;
      }
    }

    if (webhook?.data?.data) {
      await fs.writeJson(
        path.join(schemasFolder, "webhook.json"),
        webhook.data.data.content,
        { spaces: 4 }
      );
      await fs.writeFile(
        path.join(integrationFolder, "Webhook.mdx"),
        JSON.stringify(webhook.data.data.content, null, 4)
      );
    }

    // Configurations (base.json)
    let config = null;
    try {
      config = await axios.get(
        CONFIGURATION_URL.replace("{integration_id}", integration.id),
        { headers }
      );
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.warn(`Configuration not found for ${integration.name} (${integration.id}) - skipping`);
      } else {
        throw e;
      }
    }
    if (config?.data?.data) {
      await fs.writeJson(
        path.join(schemasFolder, "base.json"),
        config.data.data.content,
        {
          spaces: 4,
        }
      );
     
    }

    // Resources + Operations merged
    let resourcesResp = null;
    try {
      resourcesResp = await axios.get(
        RESOURCE_URL.replace("{integration_id}", integration.id),
        { headers }
      );
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.warn(
          `Resources not found for ${integration.name} (${integration.id}) - skipping`
        );
      } else {
        throw e;
      }
    }

    const resourcesList = resourcesResp
      ? Array.isArray(resourcesResp.data?.data)
        ? resourcesResp.data.data
        : Array.isArray(resourcesResp.data)
        ? resourcesResp.data
        : []
      : [];

    if (resourcesList.length > 0) {
      const resourcesFolder = path.join(schemasFolder, "resources");
      await fs.ensureDir(resourcesFolder);

      for (const resource of resourcesList) {
        let merged = {};
        if (resource && typeof resource === "object") {
          merged = {
            ...merged,
            ...(resource.content && typeof resource.content === "object"
              ? resource.content
              : resource),
          };
        }

        let operationsResp = null;
        try {
          operationsResp = await axios.get(
            OPERATION_URL.replace("{integration_id}", integration.id).replace(
              "{resource_id}", resource.id
            ),
            { headers }
          );
        } catch (e) {
          if (e.response && e.response.status === 404) {
            console.warn(
              `Operations not found for ${integration.name} (${integration.id}) resource ${resource.id} - skipping`
            );
          } else {
            throw e;
          }
        }

        const opsData = operationsResp
          ? operationsResp.data?.data ?? operationsResp.data
          : null;

        if (opsData) {
          if (Array.isArray(opsData)) {
            for (const op of opsData) {
              if (op && typeof op === "object") {
                merged = { ...merged, ...op };
              }
            }
          } else if (typeof opsData === "object") {
            merged = { ...merged, ...opsData };
          }
        }

        const resourceName = resource.name || resource.id || "resource";
        const resourceFile = path.join(resourcesFolder, `${resourceName}.json`);
        await fs.writeJson(resourceFile, merged.content, { spaces: 4 });
      }
    }
  }

  console.log("✅ Integration folders generated in current directory.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
