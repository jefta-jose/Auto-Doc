/**
 * @fileoverview This script automates the process of publishing Markdown documentation to Confluence.
 * It reads Markdown files from the root directory, converts them to HTML, and then either creates
 * a new Confluence page or updates an existing one based on the file name.
 *
 * It's designed to be used in a CI/CD pipeline or as a standalone script for documentation management.
 * @author [Jeff Ndegwa]
 * @version 1.0.0
 */

import fs from "fs";
import path from "path";
import { marked } from "marked";
import dotenv from "dotenv";
import core from "@actions/core";

dotenv.config();

/**
 * @description Confluence API authentication and configuration.
 * Environment variables are used for security and flexibility and are fetched from repository secrets.
 * @type {string}
 * confluence_domain_url represents the organization's Confluence base URL.
 * confluence_email is the email that was used to create the API token.
 * confluence_apiToken is the API token generated from Confluence for script authentication.
 * confluence_space_name represents the name of the Confluence space where pages will be created or updated.
 * confluence_page_id represents the ID of the parent page under which new pages will be created. useful for child pages
 * repository_name is the name of the repository, used for naming the pages appropriately and avoiding space naming conflicts.
 * file_path is the path to the Markdown file to be published, defaulting to "README.md".
 */

const confluence_domain_url = process.env.CONFLUENCE_DOMAIN_URL;
const confluence_email = process.env.CONFLUENCE_EMAIL;
const confluence_apiToken = process.env.CONFLUENCE_API_TOKEN;
const confluence_space_name = process.env.CONFLUENCE_SPACE_NAME;
const confluence_page_id = process.env.CONFLUENCE_PARENT_PAGE_ID;
const repository_name = process.env.REPOSITORY_NAME;
const file_path = core.getInput("file_path") || "README.md";

/**
 * @description Base64-encoded authentication string for Confluence API.
 * @type {string}
 */
const auth = Buffer.from(`${confluence_email}:${confluence_apiToken}`).toString("base64");

/**
 * @function getPageByTitle
 * @description Fetches a Confluence page by its title within the configured space.
 * @param {string} title The title of the page to fetch.
 * @returns {Promise<object|null>} The page object if found, otherwise null.
 * @throws {Error} If the API request fails.
 */
async function getPageByTitle(title) {
  const url = `${confluence_domain_url}/wiki/rest/api/content?title=${encodeURIComponent(
    title
  )}&spaceKey=${confluence_space_name}&expand=version`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

/**
 * @function createPage
 * @description Creates a new Confluence page with the given title and HTML content.
 * @param {string} title The title of the new page.
 * @param {string} htmlContent The HTML content for the page body.
 * @returns {Promise<void>}
 * @throws {Error} If the page creation fails.
 */
async function createPage(title, htmlContent) {
  const url = `${confluence_domain_url}/wiki/rest/api/content`;

  const payload = {
    type: "page",
    title,
    space: { key: confluence_space_name },
    ancestors: confluence_page_id ? [{ id: confluence_page_id }] : undefined,
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create page "${title}": ${response.status} ${response.statusText}\n${await response.text()}`
    );
  }

  const data = await response.json();
  console.log(`Page created: ${data._links.base}${data._links.webui}`);
}

/**
 * @function updatePage
 * @description Updates an existing Confluence page.
 * @param {string} pageId The ID of the page to update.
 * @param {number} currentVersion The current version number of the page.
 * @param {string} title The title of the page.
 * @param {string} htmlContent The new HTML content for the page body.
 * @returns {Promise<void>}
 * @throws {Error} If the page update fails.
 */
async function updatePage(pageId, currentVersion, title, htmlContent) {
  const url = `${confluence_domain_url}/wiki/rest/api/content/${pageId}`;

  const payload = {
    id: pageId,
    type: "page",
    title,
    space: { key: confluence_space_name },
    version: { number: currentVersion + 1 },
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update page "${title}": ${response.status} ${response.statusText}\n${await response.text()}`
    );
  }

  const data = await response.json();
  console.log(`Page updated: ${data._links.base}${data._links.webui}`);
}

/**
 * @function publishDocs
 * @description The main function to find, process, and publish documentation files.
 * It reads the README.md file from the root directory.
 * If a page exists, it updates it; otherwise, it creates a new one.
 * @returns {Promise<void>}
 */
async function publishDocs() {
  const readmePath = path.join(process.cwd(), file_path);
  
  if (!fs.existsSync(readmePath)) {
    console.log(`No ${file_path} found at root, skipping.`);
    return;
  }
  const markdown = fs.readFileSync(readmePath, "utf-8");

  const html = marked.parse(markdown);

  const title = `${repository_name}-MD`;

  console.log(`Processing \"${title}\"...`);

  const existingPage = await getPageByTitle(title);

  if (existingPage) {
    await updatePage(existingPage.id, existingPage.version.number, title, html);
  } else {
    await createPage(title, html);
  }
}

publishDocs().catch((err) => {
  console.error("Workflow failed:", err);
  process.exit(1);
});