const { Client } = require("pg");
const fs = require("fs-extra");
const path = require("path");

require("dotenv").config();

// PostgreSQL connection config (use environment variables for GitHub Actions)
const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || "5432"),
};

async function main() {
  const connectionOptions = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : dbConfig;
  const client = new Client(connectionOptions);
  await client.connect();

  const integrations = await client.query(
    `SELECT * FROM "Integrations" WHERE status = 'published'`
  );

  for (const integration of integrations.rows) {
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
    await fs.writeJson(path.join(integrationFolder, "spec.json"), integration, {
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

    // Authentications
    const auth = await client.query(
      `SELECT content FROM "Authentications" WHERE integration_id = $1`,
      [integration.id]
    );

    if (auth.rows.length > 0) {
      await fs.writeFile(
        path.join(integrationFolder, "Authenitcation.mdx"),
        JSON.stringify(auth.rows[0].content, null, 4)
      );
      await fs.writeJson(
        path.join(schemasFolder, "authentication.json"),
        auth.rows[0].content,
        { spaces: 4 }
      );
    }

    // Webhooks
    const webhook = await client.query(
      `SELECT content FROM "Webhooks" WHERE integration_id = $1`,
      [integration.id]
    );

    if (webhook.rows.length > 0) {
      await fs.writeJson(
        path.join(schemasFolder, "webhook.json"),
        webhook.rows[0].content,
        { spaces: 4 }
      );
    }

    // Configurations (base.json)
    const config = await client.query(
      `SELECT content FROM "Configurations" WHERE integration_id = $1`,
      [integration.id]
    );

    if (config.rows.length > 0) {
      await fs.writeJson(
        path.join(schemasFolder, "base.json"),
        config.rows[0].content,
        { spaces: 4 }
      );
    }

    // Resources + Operations merged
    const resources = await client.query(
      `SELECT id, name, content FROM "Resources" WHERE integration_id = $1`,
      [integration.id]
    );

    if (resources.rows.length > 0) {
      const resourcesFolder = path.join(schemasFolder, "resources");
      await fs.ensureDir(resourcesFolder);

      for (const resource of resources.rows) {
        const operations = await client.query(
          `SELECT content FROM "Operations" WHERE integration_id = $1 AND resource_id = $2`,
          [integration.id, resource.id]
        );

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
